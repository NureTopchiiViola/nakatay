package com.nakatay.backend.services;

import com.nakatay.backend.models.CarTrim;
import com.nakatay.backend.models.Option;
import com.nakatay.backend.repositories.OptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class ConfigurationPricing {
    private final OptionRepository options;

    public record Quote(BigDecimal basePrice, BigDecimal optionsCost, List<Option> options) {
        public BigDecimal total() {
            return basePrice.add(optionsCost);
        }
    }

    public Quote quote(CarTrim trim, List<Long> optionIds) {
        if (trim.getCarModel().isDeleted() || !trim.isAvailable()) {
            throw new IllegalArgumentException("Автомобіль недоступний");
        }

        List<Long> ids = optionIds == null ? List.of() : optionIds;
        if (ids.stream().anyMatch(Objects::isNull) || new HashSet<>(ids).size() != ids.size()) {
            throw new IllegalArgumentException("Некоректний список опцій");
        }
        List<Option> selected = ids.isEmpty() ? List.of() : options.findAllById(ids);
        if (selected.size() != ids.size() || selected.stream().anyMatch(option ->
                !option.isAvailable() || !trim.getId().equals(option.getCarTrim().getId()))) {
            throw new IllegalArgumentException("Опція недоступна для цієї комплектації");
        }

        var groups = new HashSet<String>();
        for (Option option : selected) {
            String group = option.getOptionGroup();
            if (group != null && !group.equals("extra") && !groups.add(group)) {
                throw new IllegalArgumentException("Виберіть лише одну опцію з групи");
            }
            String required = option.getRequiredVisualCode();
            if (required != null && selected.stream().noneMatch(item ->
                    "package".equals(item.getOptionGroup()) && required.equals(item.getVisualCode()))) {
                throw new IllegalArgumentException("Опція потребує сумісного пакета");
            }
        }

        BigDecimal basePrice = trim.getCarModel().getBasePrice()
                .add(Objects.requireNonNullElse(trim.getPriceModifier(), BigDecimal.ZERO));
        BigDecimal optionsCost = selected.stream().map(Option::getPriceModifier)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new Quote(basePrice, optionsCost, selected);
    }
}
