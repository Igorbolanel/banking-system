package com.bank.core.dto.operations;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationPageDto {

    private List<OperationDto> items;
    private int page;
    private int size;
    private long totalElements;
    private boolean hasNext;
}
