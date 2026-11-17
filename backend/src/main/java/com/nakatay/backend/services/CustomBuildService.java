package com.nakatay.backend.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nakatay.backend.dto.CustomBuildConfiguration;
import com.nakatay.backend.dto.request.SaveCustomBuildRequest;
import com.nakatay.backend.dto.response.SavedCustomBuildResponse;
import com.nakatay.backend.models.SavedCustomBuild;
import com.nakatay.backend.models.User;
import com.nakatay.backend.repositories.SavedCustomBuildRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class CustomBuildService {

    public static final String MODEL_NAME = "BMW E46 328i Sport · 1999";

    private static final Set<String> PAINTS = Set.of("graphite", "titanium", "sapphire", "crimson", "obsidian");
    private static final Set<String> WHEELS = Set.of("alloy", "forged", "carbon");
    private static final Set<String> INTERIORS = Set.of("black", "cognac", "ivory");
    private static final Set<String> DECORS = Set.of("carbon", "wood");
    private static final Set<String> PACKAGES = Set.of("standard", "comfort", "sport");
    private static final Set<String> EXTRAS = Set.of("spoiler", "matrix", "night", "recorder");

    private final SavedCustomBuildRepository customBuildRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public SavedCustomBuildResponse saveBuild(User user, SaveCustomBuildRequest request) {
        validateRequest(request);

        SavedCustomBuild build = new SavedCustomBuild();
        build.setUser(user);
        build.setModelName(MODEL_NAME);
        build.setConfigurationData(writeConfiguration(request.configuration()));
        return toResponse(customBuildRepository.save(build));
    }

    private void validateRequest(SaveCustomBuildRequest request) {
        if (request == null || !MODEL_NAME.equals(request.modelName())) {
            throw new IllegalArgumentException("Невідома модель автомобіля");
        }

        CustomBuildConfiguration configuration = request.configuration();
        if (configuration == null
                || !isOption(PAINTS, configuration.paint())
                || !isOption(WHEELS, configuration.wheels())
                || !isOption(INTERIORS, configuration.interior())
                || !isOption(DECORS, configuration.decor())
                || !isOption(PACKAGES, configuration.packageName())
                || configuration.extras() == null
                || configuration.extras().stream().anyMatch(extra -> !isOption(EXTRAS, extra))
                || configuration.extras().stream().distinct().count() != configuration.extras().size()
                || (configuration.extras().contains("spoiler") && !"sport".equals(configuration.packageName()))) {
            throw new IllegalArgumentException("Параметри конфігурації мають неправильний формат");
        }
    }

    private boolean isOption(Set<String> allowedOptions, String value) {
        return value != null && allowedOptions.contains(value);
    }

    private String writeConfiguration(CustomBuildConfiguration configuration) {
        try {
            return objectMapper.writeValueAsString(configuration);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Не вдалося зберегти конфігурацію", exception);
        }
    }

    private SavedCustomBuildResponse toResponse(SavedCustomBuild build) {
        return new SavedCustomBuildResponse(
                build.getId(),
                build.getModelName(),
                readConfiguration(build.getConfigurationData()),
                build.getCreatedAt()
        );
    }

    private CustomBuildConfiguration readConfiguration(String configurationData) {
        try {
            return objectMapper.readValue(configurationData, CustomBuildConfiguration.class);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Збережена конфігурація має неправильний формат", exception);
        }
    }
}
