package com.bank.core.service.operations;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.IntStream;

/**
 * Перевод сумм в целые проценты так, чтобы их сумма была ровно 100
 * (метод наибольшего остатка). Без этого 82% + 12% + 2% + 2% + 1% + 1% могли бы дать 99 или 101.
 */
public final class PercentAllocator {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    private PercentAllocator() {
    }

    public static List<Integer> allocate(List<BigDecimal> values) {
        BigDecimal total = values.stream()
                .map(value -> value == null ? BigDecimal.ZERO : value.max(BigDecimal.ZERO))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Integer> result = new ArrayList<>(values.size());
        if (total.signum() <= 0) {
            values.forEach(value -> result.add(0));
            return result;
        }

        List<BigDecimal> remainders = new ArrayList<>(values.size());
        int allocated = 0;
        for (BigDecimal value : values) {
            BigDecimal safe = value == null ? BigDecimal.ZERO : value.max(BigDecimal.ZERO);
            BigDecimal exact = safe.multiply(HUNDRED).divide(total, 10, RoundingMode.HALF_UP);
            int floor = exact.setScale(0, RoundingMode.FLOOR).intValue();
            result.add(floor);
            remainders.add(exact.subtract(BigDecimal.valueOf(floor)));
            allocated += floor;
        }

        int left = 100 - allocated;
        List<Integer> order = IntStream.range(0, values.size())
                .boxed()
                .sorted(Comparator.comparing(remainders::get).reversed())
                .toList();
        for (int i = 0; i < left && i < order.size(); i++) {
            int index = order.get(i);
            result.set(index, result.get(index) + 1);
        }
        return result;
    }
}
