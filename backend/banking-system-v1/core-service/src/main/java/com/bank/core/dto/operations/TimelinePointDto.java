package com.bank.core.dto.operations;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

/**
 * Столбик диаграммы: день (для недели и месяца) или месяц (для года).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimelinePointDto {

    private LocalDate from;
    /** Граница не включается. */
    private LocalDate to;
    private String label;
    private BigDecimal expense;
    private BigDecimal income;
    private Map<String, BigDecimal> expenseByCategory;
    private Map<String, BigDecimal> incomeByCategory;
}
