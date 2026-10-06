package com.bank.core.enums;

import java.util.Arrays;
import java.util.Locale;
import java.util.Optional;

/**
 * Период аналитики: переключатель «Нед / Мес / Год».
 */
public enum AnalyticsPeriod {
    WEEK,
    MONTH,
    YEAR;

    public static Optional<AnalyticsPeriod> parse(String value) {
        if (value == null || value.isBlank()) {
            return Optional.empty();
        }
        String normalized = value.trim().toUpperCase(Locale.ROOT);
        return Arrays.stream(values())
                .filter(period -> period.name().equals(normalized))
                .findFirst();
    }
}
