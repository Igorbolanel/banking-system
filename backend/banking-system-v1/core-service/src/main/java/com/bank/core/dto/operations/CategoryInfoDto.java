package com.bank.core.dto.operations;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryInfoDto {

    private String code;
    private String label;
    private String color;
    private String icon;
    /** EXPENSE, INCOME или BOTH. */
    private String kind;
}
