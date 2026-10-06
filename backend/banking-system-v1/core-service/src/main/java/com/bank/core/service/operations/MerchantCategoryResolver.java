package com.bank.core.service.operations;

import com.bank.core.enums.OperationCategory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Определяет категорию покупки по названию магазина — упрощённый аналог MCC-кодов,
 * по которым банки раскладывают траты по категориям.
 * Порядок правил важен: «кинопоиск» должен попасть в цифровые товары раньше, чем «кино» в развлечения.
 */
@Component
public class MerchantCategoryResolver {

    private static final List<Map.Entry<OperationCategory, List<String>>> RULES = List.of(
            Map.entry(OperationCategory.DIGITAL_GOODS, List.of(
                    "app store", "apple.com", "itunes", "google play", "steam", "playstation", "xbox",
                    "кинопоиск", "яндекс плюс", "yandex plus", "spotify", "netflix", "okko", " иви ", " ivi ",
                    "подписк", "icloud", "telegram premium", "vk музыка")),
            Map.entry(OperationCategory.MARKETPLACES, List.of(
                    "ozon", "озон", "wildberries", "вайлдберриз", "яндекс маркет", "yandex market",
                    "aliexpress", "алиэкспресс", "мегамаркет", "маркетплейс", "avito", "авито")),
            Map.entry(OperationCategory.SUPERMARKETS, List.of(
                    "пятерочка", "перекресток", "магнит", "ашан", "auchan", "лента", "вкусвилл", "дикси",
                    "азбука вкуса", "spar", "окей", "самокат", "чижик", "светофор", "супермаркет",
                    "гипермаркет", "продукты")),
            Map.entry(OperationCategory.FAST_FOOD, List.of(
                    "kfc", "rostic", "вкусно и точка", "бургер", "burger", "макдоналдс", "mcdonald",
                    "додо", "dodo", "шаурм", "subway", "теремок")),
            Map.entry(OperationCategory.RESTAURANTS, List.of(
                    "ресторан", "кафе", "шоколадница", "кофемания", "coffee", "кофе", "суши", "пиццерия",
                    "столовая", " бар ")),
            Map.entry(OperationCategory.RAILWAY, List.of(
                    "ржд", "rzd", "туту.ру", "tutu.ru", "поезд", "ж/д", "жд билет", "ласточка", "сапсан")),
            Map.entry(OperationCategory.TAXI, List.of(
                    "такси", "taxi", "яндекс go", "yandex go", "uber", "ситимобил")),
            Map.entry(OperationCategory.LOCAL_TRANSPORT, List.of(
                    "метро", "мосгортранс", "тройка", "автобус", "трамвай", "троллейбус", "электричка",
                    "цппк", "подорожник", "whoosh", "юрент", "urent", "транспорт")),
            Map.entry(OperationCategory.PHARMACY, List.of(
                    "аптек", "apteka", "ригла", "горздрав", "здравсити", "36,6")),
            Map.entry(OperationCategory.MOBILE, List.of(
                    "мтс", " mts ", "билайн", "beeline", "мегафон", "megafon", "теле2", "tele2", "yota",
                    "ростелеком", "мобильная связь")),
            Map.entry(OperationCategory.UTILITIES, List.of(
                    "жкх", "мосэнерго", "энергосбыт", "водоканал", "квартплата", "коммунал", "мосгаз")),
            Map.entry(OperationCategory.CLOTHES, List.of(
                    "zara", "h&m", "uniqlo", "lamoda", "ламода", "спортмастер", "gloria jeans", "befree",
                    "love republic", "ostin", "остин", "одежд", "обувь")),
            Map.entry(OperationCategory.ENTERTAINMENT, List.of(
                    "кино", "синема", "cinema", "театр", "концерт", "афиша", "kassir", "боулинг", "квест",
                    "музей")),
            Map.entry(OperationCategory.CASH, List.of(
                    "банкомат", " atm ", "наличн"))
    );

    public Optional<OperationCategory> resolve(String merchant) {
        String text = " " + TextNormalizer.normalize(merchant) + " ";
        if (text.isBlank()) {
            return Optional.empty();
        }
        for (Map.Entry<OperationCategory, List<String>> rule : RULES) {
            for (String keyword : rule.getValue()) {
                if (text.contains(keyword)) {
                    return Optional.of(rule.getKey());
                }
            }
        }
        return Optional.empty();
    }
}
