package com.nakatay.backend.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nakatay.backend.dto.CustomBuildConfiguration;
import com.nakatay.backend.dto.request.SaveCustomBuildRequest;
import com.nakatay.backend.dto.response.SavedCustomBuildResponse;
import com.nakatay.backend.dto.response.SharedCustomBuildResponse;
import com.nakatay.backend.models.SavedCustomBuild;
import com.nakatay.backend.models.SharedCustomBuild;
import com.nakatay.backend.models.User;
import com.nakatay.backend.repositories.SavedCustomBuildRepository;
import com.nakatay.backend.repositories.SharedCustomBuildRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.util.List;
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
    private static final String SHARE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom SHARE_CODE_RANDOM = new SecureRandom();

    private final SavedCustomBuildRepository customBuildRepository;
    private final SharedCustomBuildRepository sharedCustomBuildRepository;
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

    @Transactional(readOnly = true)
    public List<SavedCustomBuildResponse> getBuilds(User user) {
        return customBuildRepository.findAllByUser_IdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public SavedCustomBuildResponse updateBuild(
            User user,
            Long buildId,
            SaveCustomBuildRequest request
    ) {
        validateRequest(request);

        SavedCustomBuild build = customBuildRepository.findByIdAndUser_Id(buildId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Збірку не знайдено"));
        build.setConfigurationData(writeConfiguration(request.configuration()));
        return toResponse(customBuildRepository.save(build));
    }

    @Transactional
    public SharedCustomBuildResponse createPublicShare(SaveCustomBuildRequest request) {
        validateRequest(request);

        SharedCustomBuild sharedBuild = new SharedCustomBuild();
        sharedBuild.setShareCode(generateUniqueShareCode());
        sharedBuild.setModelName(MODEL_NAME);
        sharedBuild.setConfigurationData(writeConfiguration(request.configuration()));
        return toShareResponse(sharedCustomBuildRepository.save(sharedBuild));
    }

    @Transactional(readOnly = true)
    public SharedCustomBuildResponse getPublicShare(String shareCode) {
        SharedCustomBuild sharedBuild = sharedCustomBuildRepository.findByShareCode(shareCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Публічну збірку не знайдено"));
        return toShareResponse(sharedBuild);
    }

    @Transactional
    public void deleteBuild(User currentUser, Long buildId) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Необхідна авторизація");
        }

        SavedCustomBuild build = customBuildRepository.findByIdAndUser_Id(buildId, currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Збірку не знайдено"));

        customBuildRepository.delete(build);
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

    private SharedCustomBuildResponse toShareResponse(SharedCustomBuild build) {
        return new SharedCustomBuildResponse(
                build.getShareCode(),
                "/create?shareCode=" + build.getShareCode(),
                build.getModelName(),
                readConfiguration(build.getConfigurationData()),
                build.getCreatedAt()
        );
    }

    private String generateUniqueShareCode() {
        for (int attempt = 0; attempt < 5; attempt++) {
            StringBuilder code = new StringBuilder(13);
            for (int index = 0; index < 13; index++) {
                code.append(SHARE_CODE_ALPHABET.charAt(SHARE_CODE_RANDOM.nextInt(SHARE_CODE_ALPHABET.length())));
            }
            String candidate = code.toString();
            if (!sharedCustomBuildRepository.existsByShareCode(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Не вдалося згенерувати унікальний код публічної збірки");
    }

    private CustomBuildConfiguration readConfiguration(String configurationData) {
        try {
            return objectMapper.readValue(configurationData, CustomBuildConfiguration.class);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Збережена конфігурація має неправильний формат", exception);
        }
    }
}
