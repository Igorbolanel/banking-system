package com.bank.core.service.operations;

import com.bank.common.dto.UniversalResponse;
import com.bank.common.exception.ConflictException;
import com.bank.common.exception.NotFoundException;
import com.bank.core.client.CurrenciesClient;
import com.bank.core.dto.ConversionResult;
import com.bank.core.dto.operations.AnalyticsFilter;
import com.bank.core.dto.operations.AnalyticsSideDto;
import com.bank.core.dto.operations.CategoryInfoDto;
import com.bank.core.dto.operations.CategoryStatDto;
import com.bank.core.dto.operations.OperationDto;
import com.bank.core.dto.operations.OperationPageDto;
import com.bank.core.dto.operations.OperationSearchFilter;
import com.bank.core.dto.operations.OperationsAnalyticsDto;
import com.bank.core.dto.operations.SuggestionDto;
import com.bank.core.dto.operations.TimelinePointDto;
import com.bank.core.entity.BankAccountEntity;
import com.bank.core.entity.TransactionDetailsEntity;
import com.bank.core.entity.TransactionEntity;
import com.bank.core.enums.AnalyticsPeriod;
import com.bank.core.enums.OperationCategory;
import com.bank.core.enums.OperationDirection;
import com.bank.core.repository.BankAccountRepository;
import com.bank.core.repository.OperationTransactionRepository;
import com.bank.core.repository.TransactionDetailsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Поиск операций и аналитика трат/доходов по категориям (аналог раздела «Операции» в Т-Банке).
 *
 * <p>Все транзакции пользователя загружаются одним запросом по его счетам и фильтруются в памяти.
 * Для учебного проекта этого достаточно; при большом объёме данных фильтры по дате
 * стоит перенести в SQL-запрос.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OperationsService {

    private static final int DEFAULT_PAGE_SIZE = 30;
    private static final int MAX_PAGE_SIZE = 200;
    private static final String DEFAULT_CURRENCY = "RUB";
    private static final String STATUS_COMPLETED = "COMPLETED";
    /** Курс берём по большой сумме, чтобы не терять точность на округлении до копеек. */
    private static final BigDecimal RATE_PROBE = new BigDecimal("1000000");
    private static final Pattern NUMBER = Pattern.compile("\\d+(\\.\\d{1,2})?");
    private static final Pattern CURRENCY_CODE = Pattern.compile("[A-Z]{3}");
    private static final Pattern SPACES_BETWEEN_DIGITS = Pattern.compile("(?<=\\d)\\s+(?=\\d)");

    private final BankAccountRepository bankAccountRepository;
    private final OperationTransactionRepository operationTransactionRepository;
    private final TransactionDetailsRepository transactionDetailsRepository;
    private final CurrenciesClient currenciesClient;

    /** Часовой пояс, в котором считаются дни и месяцы. */
    @Value("${app.operations.zone:Europe/Moscow}")
    private String zoneId;

    public List<CategoryInfoDto> categories() {
        return Arrays.stream(OperationCategory.values())
                .map(category -> CategoryInfoDto.builder()
                        .code(category.name())
                        .label(category.getLabel())
                        .color(category.getColor())
                        .icon(category.getIcon())
                        .kind(category.getKind().name())
                        .build())
                .toList();
    }

    public OperationPageDto search(OperationSearchFilter filter, UUID userId) {
        log.info("Request to search operations for userId: {}, filter: {}", userId, filter);
        ZoneId zone = zone();
        UserOperations data = load(userId);

        Set<Long> accounts = selectedAccounts(filter.getAccountIds(), data);
        Set<OperationCategory> categories = parseCategories(filter.getCategories());
        String direction = filter.getDirection() == null ? "ALL" : filter.getDirection().trim().toUpperCase(Locale.ROOT);
        boolean excludeTransfers = Boolean.TRUE.equals(filter.getExcludeTransfers());
        Instant from = filter.getFrom() == null ? null : filter.getFrom().atStartOfDay(zone).toInstant();
        Instant to = filter.getTo() == null ? null : filter.getTo().plusDays(1).atStartOfDay(zone).toInstant();
        BigDecimal minAmount = filter.getMinAmount();
        BigDecimal maxAmount = filter.getMaxAmount();
        SearchQuery query = SearchQuery.parse(filter.getQuery());

        List<OperationView> matched = data.operations().stream()
                .filter(operation -> matchesAccounts(operation, accounts))
                .filter(operation -> categories.isEmpty() || categories.contains(operation.category()))
                .filter(operation -> matchesDirection(operation, direction))
                .filter(operation -> !excludeTransfers || !isTransfer(operation))
                .filter(operation -> from == null || !operation.createdAt().isBefore(from))
                .filter(operation -> to == null || operation.createdAt().isBefore(to))
                .filter(operation -> minAmount == null || operation.amount().compareTo(minAmount) >= 0)
                .filter(operation -> maxAmount == null || operation.amount().compareTo(maxAmount) <= 0)
                .filter(query::matches)
                .toList();

        int size = filter.getSize() == null ? DEFAULT_PAGE_SIZE : Math.max(1, Math.min(MAX_PAGE_SIZE, filter.getSize()));
        int page = filter.getPage() == null ? 0 : Math.max(0, filter.getPage());
        int fromIndex = (int) Math.min((long) page * size, matched.size());
        int toIndex = Math.min(fromIndex + size, matched.size());

        return OperationPageDto.builder()
                .items(matched.subList(fromIndex, toIndex).stream().map(this::toDto).toList())
                .page(page)
                .size(size)
                .totalElements(matched.size())
                .hasNext(toIndex < matched.size())
                .build();
    }

    public OperationsAnalyticsDto analytics(AnalyticsFilter filter, UUID userId) {
        log.info("Request to get operations analytics for userId: {}, filter: {}", userId, filter);
        ZoneId zone = zone();
        LocalDate today = LocalDate.now(zone);
        AnalyticsPeriod period = AnalyticsPeriod.parse(filter.getPeriod()).orElse(AnalyticsPeriod.MONTH);
        PeriodWindow window = PeriodWindow.of(period, filter.getDate() == null ? today : filter.getDate());
        PeriodWindow previous = window.previous();
        String currency = normalizeCurrency(filter.getCurrency());
        boolean excludeTransfers = Boolean.TRUE.equals(filter.getExcludeTransfers());

        UserOperations data = load(userId);
        Set<Long> accounts = selectedAccounts(filter.getAccountIds(), data);
        RateCache rates = new RateCache(currency);

        Instant previousStart = previous.start(zone);
        Instant start = window.start(zone);
        Instant end = window.end(zone);

        SideAccumulator expenses = new SideAccumulator();
        SideAccumulator income = new SideAccumulator();
        List<BucketAccumulator> timeline = window.buckets().stream().map(BucketAccumulator::new).toList();

        for (OperationView operation : data.operations()) {
            if (operation.direction() == OperationDirection.INTERNAL
                    || !isCompleted(operation)
                    || !matchesAccounts(operation, accounts)
                    || (excludeTransfers && isTransfer(operation))) {
                continue;
            }
            Instant at = operation.createdAt();
            if (at.isBefore(previousStart) || !at.isBefore(end)) {
                continue;
            }
            Optional<BigDecimal> converted = rates.convert(operation.amount(), operation.currency());
            if (converted.isEmpty()) {
                continue;
            }
            BigDecimal amount = converted.get();
            boolean expense = operation.direction() == OperationDirection.EXPENSE;
            SideAccumulator side = expense ? expenses : income;
            if (at.isBefore(start)) {
                side.addPrevious(amount);
                continue;
            }
            side.add(operation.category(), amount);
            int index = window.bucketIndex(LocalDate.ofInstant(at, zone));
            if (index >= 0 && index < timeline.size()) {
                timeline.get(index).add(expense, operation.category(), amount);
            }
        }

        return OperationsAnalyticsDto.builder()
                .period(period.name())
                .from(window.from())
                .to(window.to())
                .label(window.label(today))
                .currency(currency)
                .expenses(expenses.toDto())
                .income(income.toDto())
                .timeline(timeline.stream().map(BucketAccumulator::toDto).toList())
                .skippedCurrencies(List.copyOf(rates.skipped()))
                .build();
    }

    public List<SuggestionDto> suggestions(String rawQuery, UUID userId) {
        String query = TextNormalizer.normalize(rawQuery);
        if (query.length() < 2) {
            return List.of();
        }

        List<SuggestionDto> result = new ArrayList<>();
        Arrays.stream(OperationCategory.values())
                .filter(category -> TextNormalizer.normalize(category.getLabel()).contains(query))
                .limit(4)
                .forEach(category -> result.add(SuggestionDto.builder()
                        .type("CATEGORY")
                        .value(category.name())
                        .label(category.getLabel())
                        .category(category.name())
                        .build()));

        Map<String, MerchantStat> merchants = new LinkedHashMap<>();
        for (OperationView operation : load(userId).operations()) {
            if (operation.description() == null) {
                continue;
            }
            String key = TextNormalizer.normalize(operation.description());
            if (key.contains(query)) {
                merchants.computeIfAbsent(key, ignored -> new MerchantStat(operation.description(), operation.category()))
                        .increment();
            }
        }
        merchants.values().stream()
                .sorted(Comparator.comparingLong(MerchantStat::getCount).reversed())
                .limit(5)
                .forEach(merchant -> result.add(SuggestionDto.builder()
                        .type("MERCHANT")
                        .value(merchant.getLabel())
                        .label(merchant.getLabel())
                        .category(merchant.getCategory().name())
                        .count(merchant.getCount())
                        .build()));
        return result;
    }

    @Transactional
    public OperationDto updateCategory(UUID transactionId, String categoryCode, UUID userId) {
        log.info("Request to change category of transaction {} to {} for userId: {}", transactionId, categoryCode, userId);
        OperationCategory category = OperationCategory.parse(categoryCode)
                .orElseThrow(() -> new ConflictException("Неизвестная категория: " + categoryCode));

        OperationView operation = load(userId).operations().stream()
                .filter(item -> item.id().equals(transactionId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Операция не найдена: " + transactionId));

        if (operation.direction() == OperationDirection.INTERNAL) {
            throw new ConflictException("Категорию перевода между своими счетами изменить нельзя");
        }
        if (operation.direction() == OperationDirection.EXPENSE && !category.allowsExpense()) {
            throw new ConflictException("Категория «" + category.getLabel() + "» подходит только для поступлений");
        }
        if (operation.direction() == OperationDirection.INCOME && !category.allowsIncome()) {
            throw new ConflictException("Категория «" + category.getLabel() + "» подходит только для трат");
        }

        TransactionDetailsEntity details = transactionDetailsRepository.findById(transactionId)
                .orElseGet(() -> TransactionDetailsEntity.builder().transactionId(transactionId).build());
        details.setCategory(category);
        transactionDetailsRepository.save(details);

        return toDto(operation.withCategory(category));
    }

    /**
     * Описание только что проведённой покупки — без повторной загрузки всех операций.
     */
    OperationDto describePayment(TransactionEntity transaction,
                                 BankAccountEntity account,
                                 OperationCategory category,
                                 String merchant) {
        Instant createdAt = Optional.ofNullable(toInstant(transaction.getCreatedAt())).orElseGet(Instant::now);
        return OperationDto.builder()
                .id(transaction.getId())
                .direction(OperationDirection.EXPENSE.name())
                .type(transaction.getType() == null ? null : transaction.getType().name())
                .status(transaction.getStatus() == null ? null : transaction.getStatus().name())
                .category(category.name())
                .categoryLabel(category.getLabel())
                .categoryColor(category.getColor())
                .categoryIcon(category.getIcon())
                .title(merchant)
                .description(merchant)
                .amount(money(transaction.getAmount()))
                .currency(account.getCurrency() == null ? DEFAULT_CURRENCY : account.getCurrency().name())
                .accountId(account.getId())
                .accountNumber(account.getAccountNumber())
                .createdAt(createdAt)
                .categoryEditable(true)
                .build();
    }

    // ---------------------------------------------------------------------------------------------
    // Загрузка и подготовка операций
    // ---------------------------------------------------------------------------------------------

    private UserOperations load(UUID userId) {
        Map<Long, BankAccountEntity> mine = new LinkedHashMap<>();
        bankAccountRepository.findAllByUserId(userId).forEach(account -> mine.put(account.getId(), account));
        if (mine.isEmpty()) {
            return new UserOperations(mine, List.of());
        }

        List<TransactionEntity> transactions = operationTransactionRepository
                .findAllByFromAccountIdInOrToAccountIdInOrderByCreatedAtDesc(mine.keySet(), mine.keySet());
        if (transactions.isEmpty()) {
            return new UserOperations(mine, List.of());
        }

        Map<UUID, TransactionDetailsEntity> details = new HashMap<>();
        transactionDetailsRepository.findAllById(transactions.stream().map(TransactionEntity::getId).toList())
                .forEach(item -> details.put(item.getTransactionId(), item));

        Set<Long> foreignIds = new HashSet<>();
        for (TransactionEntity transaction : transactions) {
            addForeign(foreignIds, transaction.getFromAccountId(), mine);
            addForeign(foreignIds, transaction.getToAccountId(), mine);
        }
        Map<Long, BankAccountEntity> foreign = new HashMap<>();
        if (!foreignIds.isEmpty()) {
            bankAccountRepository.findAllById(foreignIds).forEach(account -> foreign.put(account.getId(), account));
        }

        List<OperationView> operations = transactions.stream()
                .map(transaction -> toView(transaction, mine, foreign, details.get(transaction.getId())))
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(OperationView::createdAt).reversed()
                        .thenComparing(OperationView::id, Comparator.<UUID>naturalOrder()))
                .toList();
        return new UserOperations(mine, operations);
    }

    private static void addForeign(Set<Long> target, Long accountId, Map<Long, BankAccountEntity> mine) {
        if (accountId != null && !mine.containsKey(accountId)) {
            target.add(accountId);
        }
    }

    private OperationView toView(TransactionEntity transaction,
                                 Map<Long, BankAccountEntity> mine,
                                 Map<Long, BankAccountEntity> foreign,
                                 TransactionDetailsEntity details) {
        Long fromId = transaction.getFromAccountId();
        Long toId = transaction.getToAccountId();
        boolean fromMine = fromId != null && mine.containsKey(fromId);
        boolean toMine = toId != null && mine.containsKey(toId);
        if (!fromMine && !toMine) {
            return null;
        }

        OperationDirection direction;
        Long accountId;
        Long counterpartyId;
        BigDecimal amount;
        String currency;
        if (fromMine) {
            direction = toMine ? OperationDirection.INTERNAL : OperationDirection.EXPENSE;
            accountId = fromId;
            counterpartyId = toId;
            amount = transaction.getAmount();
            currency = currencyOf(transaction, mine.get(fromId));
        } else {
            direction = OperationDirection.INCOME;
            accountId = toId;
            counterpartyId = fromId;
            amount = transaction.getConvertedAmount() != null ? transaction.getConvertedAmount() : transaction.getAmount();
            BankAccountEntity target = mine.get(toId);
            currency = target.getCurrency() != null ? target.getCurrency().name() : currencyOf(transaction, target);
        }

        BankAccountEntity account = mine.get(accountId);
        BankAccountEntity counterparty = counterpartyId == null
                ? null
                : mine.getOrDefault(counterpartyId, foreign.get(counterpartyId));
        boolean counterpartyIsMine = counterpartyId != null && mine.containsKey(counterpartyId);
        String counterpartyNumber = counterparty == null
                ? null
                : counterpartyIsMine ? counterparty.getAccountNumber() : mask(counterparty.getAccountNumber());

        String type = transaction.getType() == null ? "" : transaction.getType().name();
        String status = transaction.getStatus() == null ? null : transaction.getStatus().name();
        OperationCategory category = details != null && details.getCategory() != null
                ? details.getCategory()
                : defaultCategory(type, direction, account, counterparty);
        String description = details == null || details.getDescription() == null || details.getDescription().isBlank()
                ? null
                : details.getDescription().trim();
        String title = description != null ? description : defaultTitle(type, direction, category, counterpartyNumber);
        Instant createdAt = Optional.ofNullable(toInstant(transaction.getCreatedAt())).orElseGet(Instant::now);
        BigDecimal safeAmount = amount == null ? BigDecimal.ZERO : amount;
        String accountNumber = account == null ? null : account.getAccountNumber();

        String searchText = TextNormalizer.normalize(String.join(" ",
                Objects.toString(title, ""),
                Objects.toString(description, ""),
                category.getLabel(),
                directionWords(direction, type),
                Objects.toString(accountNumber, ""),
                Objects.toString(counterpartyNumber, ""),
                currency));
        String digits = (Objects.toString(accountNumber, "") + " " + Objects.toString(counterpartyNumber, ""))
                .replaceAll("[^0-9 ]", "");

        return new OperationView(transaction.getId(), direction, type, status, category, title, description,
                safeAmount, currency, accountId, accountNumber, counterpartyId, counterpartyNumber, createdAt,
                searchText, digits);
    }

    static OperationCategory defaultCategory(String type,
                                             OperationDirection direction,
                                             BankAccountEntity account,
                                             BankAccountEntity counterparty) {
        if (direction == OperationDirection.INTERNAL) {
            boolean differentCurrencies = account != null && counterparty != null
                    && account.getCurrency() != counterparty.getCurrency();
            return differentCurrencies ? OperationCategory.CURRENCY_EXCHANGE : OperationCategory.TRANSFERS;
        }
        String normalized = type == null ? "" : type.toUpperCase(Locale.ROOT);
        if (normalized.contains("DEPOSIT") || normalized.contains("TOP_UP")) {
            return OperationCategory.TOP_UP;
        }
        if (normalized.contains("WITHDRAW")) {
            return OperationCategory.CASH;
        }
        if (normalized.contains("TRANSFER")) {
            return OperationCategory.TRANSFERS;
        }
        if (normalized.contains("INTEREST")) {
            return OperationCategory.INTEREST;
        }
        if (normalized.contains("EXCHANGE") || normalized.contains("CONVERS")) {
            return OperationCategory.CURRENCY_EXCHANGE;
        }
        if (normalized.contains("CASHBACK")) {
            return OperationCategory.CASHBACK;
        }
        return OperationCategory.OTHER;
    }

    private static String defaultTitle(String type,
                                       OperationDirection direction,
                                       OperationCategory category,
                                       String counterpartyNumber) {
        if (direction == OperationDirection.INTERNAL) {
            return category == OperationCategory.CURRENCY_EXCHANGE ? "Обмен валюты" : "Между своими счетами";
        }
        String normalized = type.toUpperCase(Locale.ROOT);
        String tail = counterpartyNumber == null ? "" : " " + mask(counterpartyNumber);
        if (normalized.contains("TRANSFER")) {
            return direction == OperationDirection.EXPENSE ? "Перевод на счёт" + tail : "Перевод со счёта" + tail;
        }
        if (normalized.contains("DEPOSIT")) {
            return "Пополнение счёта";
        }
        if (normalized.contains("WITHDRAW")) {
            return "Снятие наличных";
        }
        if (normalized.contains("INTEREST")) {
            return "Проценты на остаток";
        }
        return category.getLabel();
    }

    private static String directionWords(OperationDirection direction, String type) {
        String words = switch (direction) {
            case EXPENSE -> "трата списание расход";
            case INCOME -> "доход поступление зачисление";
            case INTERNAL -> "перевод между своими";
        };
        String normalized = type.toUpperCase(Locale.ROOT);
        if (normalized.contains("TRANSFER")) {
            words += " перевод";
        } else if (normalized.contains("DEPOSIT")) {
            words += " пополнение";
        } else if (normalized.contains("WITHDRAW")) {
            words += " снятие оплата покупка";
        }
        return words;
    }

    private OperationDto toDto(OperationView operation) {
        return OperationDto.builder()
                .id(operation.id())
                .direction(operation.direction().name())
                .type(operation.type())
                .status(operation.status())
                .category(operation.category().name())
                .categoryLabel(operation.category().getLabel())
                .categoryColor(operation.category().getColor())
                .categoryIcon(operation.category().getIcon())
                .title(operation.title())
                .description(operation.description())
                .amount(money(operation.amount()))
                .currency(operation.currency())
                .accountId(operation.accountId())
                .accountNumber(operation.accountNumber())
                .counterpartyAccountNumber(operation.counterpartyAccountNumber())
                .createdAt(operation.createdAt())
                .categoryEditable(operation.direction() != OperationDirection.INTERNAL)
                .build();
    }

    // ---------------------------------------------------------------------------------------------
    // Фильтры
    // ---------------------------------------------------------------------------------------------

    /**
     * Выбранные счета пользователя. {@code null} — фильтра нет, учитываются все счета.
     */
    private static Set<Long> selectedAccounts(List<Long> requested, UserOperations data) {
        if (requested == null || requested.isEmpty()) {
            return null;
        }
        Set<Long> result = new LinkedHashSet<>();
        for (Long id : requested) {
            if (id != null && data.accounts().containsKey(id)) {
                result.add(id);
            }
        }
        return result;
    }

    private static boolean matchesAccounts(OperationView operation, Set<Long> accounts) {
        if (accounts == null) {
            return true;
        }
        if (accounts.contains(operation.accountId())) {
            return true;
        }
        return operation.direction() == OperationDirection.INTERNAL
                && operation.counterpartyAccountId() != null
                && accounts.contains(operation.counterpartyAccountId());
    }

    private static boolean matchesDirection(OperationView operation, String direction) {
        return switch (direction) {
            case "EXPENSE" -> operation.direction() == OperationDirection.EXPENSE;
            case "INCOME" -> operation.direction() == OperationDirection.INCOME;
            default -> true;
        };
    }

    private static boolean isTransfer(OperationView operation) {
        return operation.direction() == OperationDirection.INTERNAL
                || operation.category() == OperationCategory.TRANSFERS;
    }

    private static boolean isCompleted(OperationView operation) {
        return operation.status() == null || operation.status().isBlank() || STATUS_COMPLETED.equals(operation.status());
    }

    private static Set<OperationCategory> parseCategories(List<String> codes) {
        Set<OperationCategory> result = new LinkedHashSet<>();
        if (codes == null) {
            return result;
        }
        for (String code : codes) {
            OperationCategory.parse(code).ifPresent(result::add);
        }
        return result;
    }

    // ---------------------------------------------------------------------------------------------
    // Вспомогательные методы
    // ---------------------------------------------------------------------------------------------

    private ZoneId zone() {
        try {
            return ZoneId.of(zoneId == null || zoneId.isBlank() ? "Europe/Moscow" : zoneId);
        } catch (RuntimeException ex) {
            log.warn("Unknown zone {}, fallback to system default", zoneId);
            return ZoneId.systemDefault();
        }
    }

    private static String normalizeCurrency(String currency) {
        if (currency == null || currency.isBlank()) {
            return DEFAULT_CURRENCY;
        }
        String normalized = currency.trim().toUpperCase(Locale.ROOT);
        return CURRENCY_CODE.matcher(normalized).matches() ? normalized : DEFAULT_CURRENCY;
    }

    private static String currencyOf(TransactionEntity transaction, BankAccountEntity account) {
        if (transaction.getCurrency() != null) {
            return transaction.getCurrency().name();
        }
        if (account != null && account.getCurrency() != null) {
            return account.getCurrency().name();
        }
        return DEFAULT_CURRENCY;
    }

    static String mask(String accountNumber) {
        if (accountNumber == null || accountNumber.isBlank()) {
            return null;
        }
        String digits = accountNumber.replaceAll("\\D", "");
        return "•" + (digits.length() <= 4 ? digits : digits.substring(digits.length() - 4));
    }

    private static BigDecimal money(BigDecimal value) {
        return (value == null ? BigDecimal.ZERO : value).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * В TransactionEntity поле createdAt может быть Instant, LocalDateTime или OffsetDateTime —
     * метод приводит любой из вариантов к Instant, чтобы сервис не зависел от типа поля.
     */
    static Instant toInstant(Object value) {
        if (value instanceof Instant instant) {
            return instant;
        }
        if (value instanceof OffsetDateTime dateTime) {
            return dateTime.toInstant();
        }
        if (value instanceof ZonedDateTime dateTime) {
            return dateTime.toInstant();
        }
        if (value instanceof LocalDateTime dateTime) {
            return dateTime.atZone(ZoneId.systemDefault()).toInstant();
        }
        if (value instanceof java.util.Date date) {
            return date.toInstant();
        }
        return null;
    }

    // ---------------------------------------------------------------------------------------------
    // Внутренние модели
    // ---------------------------------------------------------------------------------------------

    private record UserOperations(Map<Long, BankAccountEntity> accounts, List<OperationView> operations) {
    }

    private record OperationView(UUID id,
                                 OperationDirection direction,
                                 String type,
                                 String status,
                                 OperationCategory category,
                                 String title,
                                 String description,
                                 BigDecimal amount,
                                 String currency,
                                 Long accountId,
                                 String accountNumber,
                                 Long counterpartyAccountId,
                                 String counterpartyAccountNumber,
                                 Instant createdAt,
                                 String searchText,
                                 String digits) {

        OperationView withCategory(OperationCategory newCategory) {
            return new OperationView(id, direction, type, status, newCategory, title, description, amount, currency,
                    accountId, accountNumber, counterpartyAccountId, counterpartyAccountNumber, createdAt,
                    searchText, digits);
        }

        boolean matchesToken(String token) {
            String numeric = token.replace(',', '.');
            if (NUMBER.matcher(numeric).matches()) {
                String plain = amount.stripTrailingZeros().toPlainString();
                String scaled = amount.setScale(2, RoundingMode.HALF_UP).toPlainString();
                if (plain.startsWith(numeric) || scaled.startsWith(numeric)) {
                    return true;
                }
                return numeric.length() >= 4 && digits.contains(numeric);
            }
            return searchText.contains(token);
        }
    }

    private record SearchQuery(List<String> tokens) {

        static SearchQuery parse(String raw) {
            String normalized = TextNormalizer.normalize(raw);
            if (normalized.isEmpty()) {
                return new SearchQuery(List.of());
            }
            // «1 250» → «1250», чтобы сумму можно было искать с пробелами
            normalized = SPACES_BETWEEN_DIGITS.matcher(normalized).replaceAll("");
            return new SearchQuery(Arrays.stream(normalized.split(" "))
                    .filter(token -> !token.isBlank())
                    .toList());
        }

        boolean matches(OperationView operation) {
            for (String token : tokens) {
                if (!operation.matchesToken(token)) {
                    return false;
                }
            }
            return true;
        }
    }

    private static final class MerchantStat {
        private final String label;
        private final OperationCategory category;
        private long count;

        MerchantStat(String label, OperationCategory category) {
            this.label = label;
            this.category = category;
        }

        void increment() {
            count++;
        }

        String getLabel() {
            return label;
        }

        OperationCategory getCategory() {
            return category;
        }

        long getCount() {
            return count;
        }
    }

    private static final class SideAccumulator {
        private final Map<OperationCategory, BigDecimal> amounts = new EnumMap<>(OperationCategory.class);
        private final Map<OperationCategory, Long> counts = new EnumMap<>(OperationCategory.class);
        private BigDecimal total = BigDecimal.ZERO;
        private BigDecimal previousTotal = BigDecimal.ZERO;

        void add(OperationCategory category, BigDecimal amount) {
            amounts.merge(category, amount, BigDecimal::add);
            counts.merge(category, 1L, Long::sum);
            total = total.add(amount);
        }

        void addPrevious(BigDecimal amount) {
            previousTotal = previousTotal.add(amount);
        }

        AnalyticsSideDto toDto() {
            List<Map.Entry<OperationCategory, BigDecimal>> sorted = amounts.entrySet().stream()
                    .sorted(Map.Entry.<OperationCategory, BigDecimal>comparingByValue().reversed())
                    .toList();
            List<Integer> percents = PercentAllocator.allocate(sorted.stream().map(Map.Entry::getValue).toList());

            List<CategoryStatDto> categories = new ArrayList<>();
            for (int i = 0; i < sorted.size(); i++) {
                OperationCategory category = sorted.get(i).getKey();
                BigDecimal amount = sorted.get(i).getValue();
                double share = total.signum() == 0
                        ? 0
                        : amount.divide(total, 6, RoundingMode.HALF_UP).doubleValue();
                categories.add(CategoryStatDto.builder()
                        .category(category.name())
                        .label(category.getLabel())
                        .color(category.getColor())
                        .icon(category.getIcon())
                        .amount(money(amount))
                        .percent(percents.get(i))
                        .share(share)
                        .count(counts.getOrDefault(category, 0L))
                        .build());
            }
            return AnalyticsSideDto.builder()
                    .total(money(total))
                    .previousTotal(money(previousTotal))
                    .difference(money(total.subtract(previousTotal)))
                    .categories(categories)
                    .build();
        }
    }

    private static final class BucketAccumulator {
        private final PeriodWindow.Bucket bucket;
        private final Map<String, BigDecimal> expenseByCategory = new LinkedHashMap<>();
        private final Map<String, BigDecimal> incomeByCategory = new LinkedHashMap<>();
        private BigDecimal expense = BigDecimal.ZERO;
        private BigDecimal income = BigDecimal.ZERO;

        BucketAccumulator(PeriodWindow.Bucket bucket) {
            this.bucket = bucket;
        }

        void add(boolean isExpense, OperationCategory category, BigDecimal amount) {
            if (isExpense) {
                expense = expense.add(amount);
                expenseByCategory.merge(category.name(), amount, BigDecimal::add);
            } else {
                income = income.add(amount);
                incomeByCategory.merge(category.name(), amount, BigDecimal::add);
            }
        }

        TimelinePointDto toDto() {
            Map<String, BigDecimal> expenses = new LinkedHashMap<>();
            expenseByCategory.forEach((key, value) -> expenses.put(key, money(value)));
            Map<String, BigDecimal> incomes = new LinkedHashMap<>();
            incomeByCategory.forEach((key, value) -> incomes.put(key, money(value)));
            return TimelinePointDto.builder()
                    .from(bucket.from())
                    .to(bucket.to())
                    .label(bucket.label())
                    .expense(money(expense))
                    .income(money(income))
                    .expenseByCategory(expenses)
                    .incomeByCategory(incomes)
                    .build();
        }
    }

    /**
     * Курсы валют на время одного запроса: каждый курс запрашивается у currencies-service один раз.
     */
    private final class RateCache {
        private final String target;
        private final Map<String, Optional<BigDecimal>> rates = new HashMap<>();
        private final Set<String> skipped = new LinkedHashSet<>();

        RateCache(String target) {
            this.target = target;
        }

        Optional<BigDecimal> convert(BigDecimal amount, String currency) {
            if (amount == null) {
                return Optional.empty();
            }
            if (currency == null || currency.equalsIgnoreCase(target)) {
                return Optional.of(amount);
            }
            return rates.computeIfAbsent(currency, this::loadRate)
                    .map(rate -> amount.multiply(rate).setScale(2, RoundingMode.HALF_UP));
        }

        Set<String> skipped() {
            return skipped;
        }

        private Optional<BigDecimal> loadRate(String currency) {
            try {
                UniversalResponse<ConversionResult> response = currenciesClient.convert(currency, target, RATE_PROBE);
                if (response == null || response.getData() == null || response.getData().getConvertedAmount() == null) {
                    skipped.add(currency);
                    return Optional.empty();
                }
                return Optional.of(response.getData().getConvertedAmount().divide(RATE_PROBE, 10, RoundingMode.HALF_UP));
            } catch (RuntimeException ex) {
                log.warn("Не удалось получить курс {} -> {}: {}", currency, target, ex.getMessage());
                skipped.add(currency);
                return Optional.empty();
            }
        }
    }
}
