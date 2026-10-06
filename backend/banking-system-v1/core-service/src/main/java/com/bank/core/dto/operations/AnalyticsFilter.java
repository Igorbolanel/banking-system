package com.bank.core.dto.operations;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;

/**
 * Параметры аналитики:
 * {@code GET /api/operations/analytics?period=MONTH&date=2026-10-06&currency=RUB&excludeTransfers=false}
 */
@Data
public class AnalyticsFilter {

    /** WEEK, MONTH или YEAR. По умолчанию MONTH. */
    private String period;

    /** Любая дата внутри нужного периода. По умолчанию сегодня. */
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate date;

    private List<Long> accountIds;
    private Boolean excludeTransfers;
    /** Валюта итоговых сумм. По умолчанию RUB. */
    private String currency;
}
