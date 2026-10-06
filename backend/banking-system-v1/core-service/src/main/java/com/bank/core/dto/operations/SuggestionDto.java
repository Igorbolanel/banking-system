package com.bank.core.dto.operations;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Подсказка в строке поиска: категория или магазин, где пользователь уже платил.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuggestionDto {

    /** CATEGORY или MERCHANT. */
    private String type;
    /** Код категории или текст для поиска. */
    private String value;
    private String label;
    private String category;
    private long count;
}
