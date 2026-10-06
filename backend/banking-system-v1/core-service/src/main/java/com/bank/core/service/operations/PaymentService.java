package com.bank.core.service.operations;

import com.bank.common.enums.AccountStatus;
import com.bank.common.enums.TransactionStatus;
import com.bank.common.enums.TransactionType;
import com.bank.common.event.TransactionEvent;
import com.bank.common.exception.ConflictException;
import com.bank.common.exception.InsufficientFundsException;
import com.bank.common.exception.NotFoundException;
import com.bank.core.dto.operations.CreatePaymentRequest;
import com.bank.core.dto.operations.OperationDto;
import com.bank.core.entity.BankAccountEntity;
import com.bank.core.entity.TransactionDetailsEntity;
import com.bank.core.entity.TransactionEntity;
import com.bank.core.enums.OperationCategory;
import com.bank.core.kafka.producer.TransactionEventProducer;
import com.bank.core.repository.BankAccountRepository;
import com.bank.core.repository.TransactionDetailsRepository;
import com.bank.core.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

/**
 * Оплата покупки со счёта. Создаёт обычную транзакцию WITHDRAWAL и запись с категорией
 * и названием магазина — по ним строятся диаграммы трат и работает поиск.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final BankAccountRepository bankAccountRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionDetailsRepository transactionDetailsRepository;
    private final TransactionEventProducer transactionEventProducer;
    private final MerchantCategoryResolver merchantCategoryResolver;
    private final OperationsService operationsService;

    @Transactional
    public OperationDto pay(CreatePaymentRequest request, UUID currentUserId) {
        log.info("Request to pay for userId: {}, request: {}", currentUserId, request);

        BigDecimal amount = request.getAmount() == null
                ? BigDecimal.ZERO
                : request.getAmount().setScale(2, RoundingMode.HALF_UP);
        if (amount.signum() <= 0) {
            throw new ConflictException("Сумма должна быть больше нуля");
        }
        String merchant = request.getMerchant() == null ? "" : request.getMerchant().trim();
        if (merchant.isEmpty()) {
            throw new ConflictException("Укажите, где совершена покупка");
        }

        OperationCategory category = resolveCategory(request.getCategory(), merchant);
        if (!category.allowsExpense()) {
            throw new ConflictException("Категория «" + category.getLabel() + "» не подходит для покупки");
        }

        BankAccountEntity account = bankAccountRepository.findByIdForUpdate(request.getAccountId())
                .orElseThrow(() -> new NotFoundException("Счёт не найден: " + request.getAccountId()));
        if (!account.getUserId().equals(currentUserId)) {
            throw new ConflictException("Счёт не принадлежит текущему пользователю");
        }
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new ConflictException("Счёт закрыт");
        }
        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException("Недостаточно средств");
        }

        account.setBalance(account.getBalance().subtract(amount));
        bankAccountRepository.save(account);

        TransactionEntity transaction = transactionRepository.save(TransactionEntity.builder()
                .fromAccountId(account.getId())
                .toAccountId(null)
                .amount(amount)
                .convertedAmount(amount)
                .currency(account.getCurrency())
                .type(TransactionType.WITHDRAWAL)
                .status(TransactionStatus.COMPLETED)
                .build());

        transactionDetailsRepository.save(TransactionDetailsEntity.builder()
                .transactionId(transaction.getId())
                .category(category)
                .description(merchant)
                .build());

        transactionEventProducer.send(TransactionEvent.builder()
                .transactionId(transaction.getId())
                .userId(currentUserId)
                .amount(amount)
                .currency(account.getCurrency().name())
                .type(TransactionType.WITHDRAWAL.name())
                .timestamp(Instant.now())
                .build());

        return operationsService.describePayment(transaction, account, category, merchant);
    }

    private OperationCategory resolveCategory(String requested, String merchant) {
        if (requested != null && !requested.isBlank()) {
            return OperationCategory.parse(requested)
                    .orElseThrow(() -> new ConflictException("Неизвестная категория: " + requested));
        }
        return merchantCategoryResolver.resolve(merchant).orElse(OperationCategory.OTHER);
    }
}
