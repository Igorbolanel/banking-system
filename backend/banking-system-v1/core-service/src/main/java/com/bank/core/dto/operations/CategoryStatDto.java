package com.bank.core.dto.operations;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Сумма по одной категории за период и её доля от общей суммы.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryStatDto {

    private String category;
    private String label;
    private String color;
    private String icon;
    private BigDecimal amount;
    /** Целый процент; сумма процентов всех категорий равна 100. */
    private int percent;
    /** Точная доля от 0 до 1 — нужна, чтобы показать «меньше 1%». */
    private double share;
    private long count;
}
