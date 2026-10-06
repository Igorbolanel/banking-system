package com.bank.core.dto.operations;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Одна сторона аналитики: траты или доходы.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSideDto {

    private BigDecimal total;
    /** Сумма за предыдущий такой же период (прошлый месяц, неделю, год). */
    private BigDecimal previousTotal;
    /** total - previousTotal: отрицательное значение — потратили меньше, чем в прошлом периоде. */
    private BigDecimal difference;
    private List<CategoryStatDto> categories;
}
