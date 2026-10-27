package com.nakatay.backend.option;

import com.nakatay.backend.option.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Конфігуратор авто", description = "API для підбору опцій, розрахунку ціни та поширення конфігурацій")
@RestController
@RequestMapping("/api/configurator")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor

public class OptionController {

    private final OptionService configuratorService;

    @Operation(summary = "Отримати доступні опції для комплектації авто",
            description = "Повертає список опцій (кольори, диски, салон, пакети), згрупованих за категоріями для макету")
    @GetMapping("/trims/{trimId}/options")
    public List<OptionDto> getOptionsForTrim(
            @Parameter(description = "ID комплектації", example = "1") @PathVariable Long trimId) {
        return configuratorService.getOptionsForTrim(trimId);
    }

    @Operation(summary = "Розрахувати вартість обраних опцій (Live калькулятор)",
            description = "Викликається фронтендом при зміні чекбоксів/опцій для миттєвого оновлення підсумкової суми")
    @PostMapping("/calculate")
    public PriceResponse calculatePrice(@RequestBody PriceRequest request) {
        return configuratorService.calculatePrice(request);
    }

    @Operation(summary = "Зберегти збірку автомобіля",
            description = "Генерує унікальний shareCode (наприклад, NK-74892) для посилання іншим користувачам")
    @PostMapping("/save")
    public ConfigResponse saveConfiguration(@RequestBody ConfigRequest request) {
        return configuratorService.saveConfiguration(request);
    }

    @Operation(summary = "Завантажити збережену конфігурацію за shareCode",
            description = "Використовується при переході за публічним посиланням для відновлення обраних опцій")
    @GetMapping("/share/{shareCode}")
    public ConfigResponse getByShareCode(
            @Parameter(description = "Унікальний код посилання", example = "NK-74892") @PathVariable String shareCode) {
        return configuratorService.getByShareCode(shareCode);
    }
}