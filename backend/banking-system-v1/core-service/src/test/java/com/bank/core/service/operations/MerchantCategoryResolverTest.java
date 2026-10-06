package com.bank.core.service.operations;

import com.bank.core.enums.OperationCategory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MerchantCategoryResolverTest {

    private final MerchantCategoryResolver resolver = new MerchantCategoryResolver();

    @Test
    @DisplayName("Магазины раскладываются по категориям как в Т-Банке")
    void resolvesKnownMerchants() {
        assertThat(resolver.resolve("Пятёрочка")).contains(OperationCategory.SUPERMARKETS);
        assertThat(resolver.resolve("OZON.ru")).contains(OperationCategory.MARKETPLACES);
        assertThat(resolver.resolve("РЖД Билеты")).contains(OperationCategory.RAILWAY);
        assertThat(resolver.resolve("Метро Москва")).contains(OperationCategory.LOCAL_TRANSPORT);
        assertThat(resolver.resolve("Яндекс Go")).contains(OperationCategory.TAXI);
        assertThat(resolver.resolve("App Store")).contains(OperationCategory.DIGITAL_GOODS);
    }

    @Test
    @DisplayName("Кинопоиск — цифровой товар, а не кино")
    void ruleOrderMatters() {
        assertThat(resolver.resolve("Кинопоиск")).contains(OperationCategory.DIGITAL_GOODS);
        assertThat(resolver.resolve("Кино Октябрь")).contains(OperationCategory.ENTERTAINMENT);
    }

    @Test
    @DisplayName("Неизвестный магазин не получает категорию")
    void unknownMerchant() {
        assertThat(resolver.resolve("ИП Иванов")).isEmpty();
        assertThat(resolver.resolve("   ")).isEmpty();
    }
}
