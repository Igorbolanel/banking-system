package com.bank.core.service.operations;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class PercentAllocatorTest {

    @Test
    @DisplayName("Проценты категорий в сумме дают ровно 100")
    void percentsSumToHundred() {
        List<Integer> percents = PercentAllocator.allocate(List.of(
                new BigDecimal("42047"), new BigDecimal("5936"), new BigDecimal("865"),
                new BigDecimal("832"), new BigDecimal("150"), new BigDecimal("69")));

        assertThat(percents).containsExactly(84, 12, 2, 2, 0, 0);
        assertThat(percents.stream().mapToInt(Integer::intValue).sum()).isEqualTo(100);
    }

    @Test
    @DisplayName("Пустые суммы дают нулевые проценты")
    void zeroTotalGivesZeros() {
        assertThat(PercentAllocator.allocate(List.of(BigDecimal.ZERO, BigDecimal.ZERO))).containsExactly(0, 0);
    }

    @Test
    @DisplayName("Остаток достаётся категориям с наибольшей дробной частью")
    void remainderGoesToLargestFraction() {
        List<Integer> percents = PercentAllocator.allocate(List.of(BigDecimal.ONE, BigDecimal.ONE, BigDecimal.ONE));

        assertThat(percents.stream().mapToInt(Integer::intValue).sum()).isEqualTo(100);
        assertThat(percents).containsExactlyInAnyOrder(34, 33, 33);
    }
}
