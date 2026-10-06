package com.bank.core.service.operations;

import com.bank.core.enums.AnalyticsPeriod;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

/**
 * Окно аналитики: календарная неделя, месяц или год, в который попадает дата.
 * Граница {@code to} не включается.
 */
public record PeriodWindow(AnalyticsPeriod period, LocalDate from, LocalDate to) {

    private static final String[] MONTHS = {
            "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
            "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    };
    private static final String[] MONTHS_SHORT = {
            "янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"
    };
    private static final String[] WEEK_DAYS = {"пн", "вт", "ср", "чт", "пт", "сб", "вс"};

    public static PeriodWindow of(AnalyticsPeriod period, LocalDate anchor) {
        return switch (period) {
            case WEEK -> {
                LocalDate start = anchor.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                yield new PeriodWindow(period, start, start.plusWeeks(1));
            }
            case MONTH -> {
                LocalDate start = anchor.withDayOfMonth(1);
                yield new PeriodWindow(period, start, start.plusMonths(1));
            }
            case YEAR -> {
                LocalDate start = anchor.withDayOfYear(1);
                yield new PeriodWindow(period, start, start.plusYears(1));
            }
        };
    }

    public PeriodWindow previous() {
        return switch (period) {
            case WEEK -> of(period, from.minusWeeks(1));
            case MONTH -> of(period, from.minusMonths(1));
            case YEAR -> of(period, from.minusYears(1));
        };
    }

    public Instant start(ZoneId zone) {
        return from.atStartOfDay(zone).toInstant();
    }

    public Instant end(ZoneId zone) {
        return to.atStartOfDay(zone).toInstant();
    }

    /**
     * Подпись периода: «Октябрь», «Октябрь 2025», «29 сен – 5 окт», «2026».
     */
    public String label(LocalDate today) {
        return switch (period) {
            case WEEK -> {
                LocalDate last = to.minusDays(1);
                yield from.getDayOfMonth() + " " + MONTHS_SHORT[from.getMonthValue() - 1]
                        + " – " + last.getDayOfMonth() + " " + MONTHS_SHORT[last.getMonthValue() - 1];
            }
            case MONTH -> {
                String month = MONTHS[from.getMonthValue() - 1];
                yield from.getYear() == today.getYear() ? month : month + " " + from.getYear();
            }
            case YEAR -> String.valueOf(from.getYear());
        };
    }

    /**
     * Столбики диаграммы: дни для недели и месяца, месяцы для года.
     */
    public List<Bucket> buckets() {
        List<Bucket> buckets = new ArrayList<>();
        if (period == AnalyticsPeriod.YEAR) {
            for (int month = 0; month < 12; month++) {
                LocalDate start = from.plusMonths(month);
                buckets.add(new Bucket(start, start.plusMonths(1), MONTHS_SHORT[month]));
            }
            return buckets;
        }
        for (LocalDate day = from; day.isBefore(to); day = day.plusDays(1)) {
            String label = period == AnalyticsPeriod.WEEK
                    ? WEEK_DAYS[day.getDayOfWeek().getValue() - 1]
                    : String.valueOf(day.getDayOfMonth());
            buckets.add(new Bucket(day, day.plusDays(1), label));
        }
        return buckets;
    }

    /**
     * Номер столбика для даты или -1, если дата вне окна.
     */
    public int bucketIndex(LocalDate day) {
        if (day.isBefore(from) || !day.isBefore(to)) {
            return -1;
        }
        if (period == AnalyticsPeriod.YEAR) {
            return day.getMonthValue() - 1;
        }
        return (int) ChronoUnit.DAYS.between(from, day);
    }

    public record Bucket(LocalDate from, LocalDate to, String label) {
    }
}
