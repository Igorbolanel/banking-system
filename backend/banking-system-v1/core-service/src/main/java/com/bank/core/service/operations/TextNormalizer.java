package com.bank.core.service.operations;

import java.util.Locale;

/**
 * Приведение текста к виду для поиска: нижний регистр, «ё» → «е», одиночные пробелы.
 */
public final class TextNormalizer {

    private TextNormalizer() {
    }

    public static String normalize(String value) {
        if (value == null) {
            return "";
        }
        return value.toLowerCase(Locale.ROOT)
                .replace('ё', 'е')
                .replaceAll("\\s+", " ")
                .trim();
    }
}
