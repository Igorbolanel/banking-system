package com.bank.core.enums;

import java.util.Arrays;
import java.util.Locale;
import java.util.Optional;

/**
 * Категории операций. Набор и цвета повторяют категории из приложения Т-Банка,
 * чтобы диаграммы и поиск выглядели привычно.
 */
public enum OperationCategory {

    SUPERMARKETS("Супермаркеты", "#F09A7E", "cart", Kind.EXPENSE),
    MARKETPLACES("Маркетплейсы", "#B04BEA", "basket", Kind.EXPENSE),
    RESTAURANTS("Рестораны", "#F26B5B", "restaurant", Kind.EXPENSE),
    FAST_FOOD("Фастфуд", "#FF9F43", "fastfood", Kind.EXPENSE),
    LOCAL_TRANSPORT("Местный транспорт", "#F5B53F", "bus", Kind.EXPENSE),
    RAILWAY("Ж/д билеты", "#4FB0C6", "train", Kind.EXPENSE),
    TAXI("Такси", "#E8C547", "taxi", Kind.EXPENSE),
    DIGITAL_GOODS("Цифровые товары", "#E7A0E4", "digital", Kind.EXPENSE),
    PHARMACY("Аптеки", "#5ED39A", "pharmacy", Kind.EXPENSE),
    MOBILE("Мобильная связь", "#6B8CFF", "phone", Kind.EXPENSE),
    UTILITIES("ЖКХ", "#8D99AE", "home", Kind.EXPENSE),
    CLOTHES("Одежда и обувь", "#FF6FA3", "clothes", Kind.EXPENSE),
    ENTERTAINMENT("Развлечения", "#9B7BFF", "ticket", Kind.EXPENSE),
    CASH("Наличные", "#57C785", "cash", Kind.EXPENSE),
    TRANSFERS("Переводы", "#6CC3DA", "transfer", Kind.BOTH),
    TOP_UP("Пополнения", "#7ECFC6", "topup", Kind.INCOME),
    INTEREST("Проценты", "#3ECF8E", "percent", Kind.INCOME),
    CASHBACK("Кэшбэк", "#FFC94D", "cashback", Kind.INCOME),
    CURRENCY_EXCHANGE("Обмен валюты", "#4DA3FF", "exchange", Kind.BOTH),
    OTHER("Остальное", "#A0A7B4", "other", Kind.BOTH);

    /**
     * Для каких операций подходит категория: только траты, только доходы или и то и другое.
     */
    public enum Kind { EXPENSE, INCOME, BOTH }

    private final String label;
    private final String color;
    private final String icon;
    private final Kind kind;

    OperationCategory(String label, String color, String icon, Kind kind) {
        this.label = label;
        this.color = color;
        this.icon = icon;
        this.kind = kind;
    }

    public String getLabel() {
        return label;
    }

    public String getColor() {
        return color;
    }

    public String getIcon() {
        return icon;
    }

    public Kind getKind() {
        return kind;
    }

    public boolean allowsExpense() {
        return kind != Kind.INCOME;
    }

    public boolean allowsIncome() {
        return kind != Kind.EXPENSE;
    }

    public static Optional<OperationCategory> parse(String value) {
        if (value == null || value.isBlank()) {
            return Optional.empty();
        }
        String normalized = value.trim().toUpperCase(Locale.ROOT);
        return Arrays.stream(values())
                .filter(category -> category.name().equals(normalized))
                .findFirst();
    }
}
