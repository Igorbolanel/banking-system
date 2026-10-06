package com.bank.core.controller;

import com.bank.common.dto.UniversalResponse;
import com.bank.core.dto.operations.AnalyticsFilter;
import com.bank.core.dto.operations.CategoryInfoDto;
import com.bank.core.dto.operations.CreatePaymentRequest;
import com.bank.core.dto.operations.OperationDto;
import com.bank.core.dto.operations.OperationPageDto;
import com.bank.core.dto.operations.OperationSearchFilter;
import com.bank.core.dto.operations.OperationsAnalyticsDto;
import com.bank.core.dto.operations.SuggestionDto;
import com.bank.core.dto.operations.UpdateCategoryRequest;
import com.bank.core.security.CurrentUserProvider;
import com.bank.core.service.operations.OperationsService;
import com.bank.core.service.operations.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Раздел «Операции»: поиск, аналитика по категориям, оплата покупок.
 */
@RestController
@RequestMapping("/api/operations")
@RequiredArgsConstructor
public class OperationsController {

    private final OperationsService operationsService;
    private final PaymentService paymentService;
    private final CurrentUserProvider currentUserProvider;

    /** Поиск и фильтрация операций по всем счетам пользователя. */
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public UniversalResponse<OperationPageDto> search(@ModelAttribute OperationSearchFilter filter) {
        return new UniversalResponse<>(operationsService.search(filter, currentUserId()));
    }

    /** Траты и доходы по категориям за неделю, месяц или год + данные для столбчатой диаграммы. */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/analytics")
    public UniversalResponse<OperationsAnalyticsDto> analytics(@ModelAttribute AnalyticsFilter filter) {
        return new UniversalResponse<>(operationsService.analytics(filter, currentUserId()));
    }

    /** Справочник категорий с цветами и иконками. */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/categories")
    public UniversalResponse<List<CategoryInfoDto>> categories() {
        return new UniversalResponse<>(operationsService.categories());
    }

    /** Подсказки для строки поиска: категории и магазины. */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/suggestions")
    public UniversalResponse<List<SuggestionDto>> suggestions(@RequestParam(name = "query", defaultValue = "") String query) {
        return new UniversalResponse<>(operationsService.suggestions(query, currentUserId()));
    }

    /** Смена категории операции пользователем. */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{id}/category")
    public UniversalResponse<OperationDto> updateCategory(@PathVariable("id") UUID id,
                                                          @Valid @RequestBody UpdateCategoryRequest request) {
        return new UniversalResponse<>(operationsService.updateCategory(
                id, request.getCategory(), currentUserId()));
    }

    /** Оплата покупки со счёта с категорией. */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/payments")
    public UniversalResponse<OperationDto> pay(@Valid @RequestBody CreatePaymentRequest request) {
        return new UniversalResponse<>(paymentService.pay(request, currentUserId()));
    }

    private UUID currentUserId() {
        return currentUserProvider.getCurrentUser().localUserId();
    }
}
