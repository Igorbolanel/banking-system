package com.bank.core.service.operations;

import com.bank.core.enums.AnalyticsPeriod;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class PeriodWindowTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 10, 6);

    @Test
    @DisplayName("Месяц: с первого числа до первого числа следующего месяца")
    void monthWindow() {
        PeriodWindow window = PeriodWindow.of(AnalyticsPeriod.MONTH, TODAY);

        assertThat(window.from()).isEqualTo(LocalDate.of(2026, 10, 1));
        assertThat(window.to()).isEqualTo(LocalDate.of(2026, 11, 1));
        assertThat(window.label(TODAY)).isEqualTo("Октябрь");
        assertThat(window.buckets()).hasSize(31);
        assertThat(window.previous().from()).isEqualTo(LocalDate.of(2026, 9, 1));
    }

    @Test
    @DisplayName("Неделя начинается с понедельника")
    void weekWindow() {
        PeriodWindow window = PeriodWindow.of(AnalyticsPeriod.WEEK, TODAY);

        assertThat(window.from()).isEqualTo(LocalDate.of(2026, 10, 5));
        assertThat(window.to()).isEqualTo(LocalDate.of(2026, 10, 12));
        assertThat(window.buckets()).extracting(PeriodWindow.Bucket::label)
                .containsExactly("пн", "вт", "ср", "чт", "пт", "сб", "вс");
        assertThat(window.label(TODAY)).isEqualTo("5 окт – 11 окт");
    }

    @Test
    @DisplayName("Год делится на 12 месяцев, а прошлый год подписывается номером")
    void yearWindow() {
        PeriodWindow window = PeriodWindow.of(AnalyticsPeriod.YEAR, LocalDate.of(2025, 3, 15));

        assertThat(window.buckets()).hasSize(12);
        assertThat(window.bucketIndex(LocalDate.of(2025, 12, 31))).isEqualTo(11);
        assertThat(window.bucketIndex(LocalDate.of(2026, 1, 1))).isEqualTo(-1);
        assertThat(window.label(TODAY)).isEqualTo("2025");
        assertThat(PeriodWindow.of(AnalyticsPeriod.MONTH, LocalDate.of(2025, 3, 15)).label(TODAY))
                .isEqualTo("Март 2025");
    }
}
