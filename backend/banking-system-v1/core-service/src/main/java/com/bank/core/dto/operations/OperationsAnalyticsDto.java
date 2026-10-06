package com.bank.core.dto.operations;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationsAnalyticsDto {

    private String period;
    private LocalDate from;
    /** Граница не включается. */
    private LocalDate to;
    private String label;
    /** Валюта, в которую пересчитаны все суммы. */
    private String currency;
    private AnalyticsSideDto expenses;
    private AnalyticsSideDto income;
    private List<TimelinePointDto> timeline;
    /** Валюты, которые не удалось пересчитать (сервис курсов недоступен). */
    private List<String> skippedCurrencies;
}
