package com.bank.core.dto.operations;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Оплата покупки со счёта. Категория необязательна — если не передать,
 * она определится по названию магазина.
 */
@Data
public class CreatePaymentRequest {

    @NotNull
    private Long accountId;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;

    @NotBlank
    @Size(max = 120)
    private String merchant;

    private String category;
}
