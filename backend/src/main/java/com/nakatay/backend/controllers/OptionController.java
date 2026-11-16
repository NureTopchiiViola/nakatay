package com.nakatay.backend.controllers;

import com.nakatay.backend.dto.request.ConfigRequest;
import com.nakatay.backend.dto.request.PriceRequest;
import com.nakatay.backend.dto.response.ConfigResponse;
import com.nakatay.backend.dto.response.OptionDto;
import com.nakatay.backend.dto.response.PriceResponse;
import com.nakatay.backend.models.User;
import com.nakatay.backend.services.OptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Конфігуратор авто", description = "API для підбору опцій, розрахунку ціни та поширення конфігурацій")
@RestController
@RequestMapping("/api/configurator")
@RequiredArgsConstructor
public class OptionController {

    private final OptionService configuratorService;

    @Operation(summary = "Отримати доступні опції для комплектації авто")
    @GetMapping("/trims/{trimId}/options")
    public List<OptionDto> getOptionsForTrim(
            @Parameter(description = "ID комплектації", example = "1") @PathVariable Long trimId) {
        return configuratorService.getOptionsForTrim(trimId);
    }

    @Operation(summary = "Розрахувати вартість обраних опцій (Live калькулятор)")
    @PostMapping("/calculate")
    public PriceResponse calculatePrice(@RequestBody PriceRequest request) {
        return configuratorService.calculatePrice(request);
    }

    @Operation(summary = "Зберегти збірку автомобіля")
    @PostMapping("/save")
    public ConfigResponse saveConfiguration(
            @RequestBody ConfigRequest request,
            @AuthenticationPrincipal User currentUser) {
        return configuratorService.saveConfiguration(request, currentUser);
    }

    @Operation(summary = "Завантажити збережену конфігурацію за shareCode")
    @GetMapping("/share/{shareCode}")
    public ConfigResponse getByShareCode(
            @Parameter(description = "Унікальний код посилання", example = "NK-74892") @PathVariable String shareCode,
            @AuthenticationPrincipal User currentUser) {
        return configuratorService.getByShareCode(shareCode, currentUser);
    }

    @Operation(summary = "Отримати всі збережені збірки поточного користувача")
    @GetMapping("/my")
    public List<ConfigResponse> getMyConfigurations(@AuthenticationPrincipal User currentUser) {
        return configuratorService.getMyConfigurations(currentUser);
    }

    @Operation(summary = "Змінити видимість збірки (публічна / приватна)")
    @PatchMapping("/{id}/visibility")
    public ConfigResponse updateVisibility(
            @PathVariable Long id,
            @RequestParam boolean isPublic,
            @AuthenticationPrincipal User currentUser) {
        return configuratorService.updateVisibility(id, isPublic, currentUser);
    }

    @Operation(summary = "Скопіювати чужу публічну збірку за shareCode у свій кабінет")
    @PostMapping("/share/{shareCode}/clone")
    public ConfigResponse cloneByShareCode(
            @PathVariable String shareCode,
            @AuthenticationPrincipal User currentUser) {
        return configuratorService.cloneByShareCode(shareCode, currentUser);
    }

    @Operation(summary = "Видалити власну збережену збірку")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConfiguration(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        configuratorService.deleteConfiguration(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}