package com.bank.core.dto.operations;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Параметры поиска операций. Передаются query-параметрами:
 * {@code GET /api/operations?query=пятёрочка&categories=SUPERMARKETS,TAXI&direction=EXPENSE&from=2026-10-01&to=2026-10-31}
 */
@Data
public class OperationSearchFilter {

    /** Текст: магазин, категория, номер счёта или сумма. */
    private String query;
    /** Коды категорий: SUPERMARKETS, TAXI ... */
    private List<String> categories;
    /** ALL, EXPENSE или INCOME. */
    private String direction;
    private List<Long> accountIds;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate from;

    /** Включительно. */
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate to;

    private BigDecimal minAmount;
    private BigDecimal maxAmount;
    /** Скрыть переводы — кнопка «Без переводов». */
    private Boolean excludeTransfers;
    private Integer page;
    private Integer size;
}
