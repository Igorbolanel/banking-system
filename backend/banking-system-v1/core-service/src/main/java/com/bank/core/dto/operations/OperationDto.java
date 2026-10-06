package com.bank.core.dto.operations;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Операция с точки зрения пользователя: направление, категория, понятное название.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationDto {

    private UUID id;
    /** INCOME, EXPENSE или INTERNAL. */
    private String direction;
    /** Исходный тип транзакции: DEPOSIT, WITHDRAWAL, TRANSFER и т.д. */
    private String type;
    private String status;
    private String category;
    private String categoryLabel;
    private String categoryColor;
    private String categoryIcon;
    private String title;
    private String description;
    /** Сумма всегда положительная, знак определяется по direction. */
    private BigDecimal amount;
    private String currency;
    private Long accountId;
    private String accountNumber;
    private String counterpartyAccountNumber;
    private Instant createdAt;
    private boolean categoryEditable;
}
