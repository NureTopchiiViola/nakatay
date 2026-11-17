package com.nakatay.backend.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.nakatay.backend.dto.CustomBuildConfiguration;
import com.nakatay.backend.dto.request.SaveCustomBuildRequest;
import com.nakatay.backend.models.Role;
import com.nakatay.backend.models.SavedCustomBuild;
import com.nakatay.backend.models.User;
import com.nakatay.backend.repositories.SavedCustomBuildRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class CustomBuildServiceTest {

    private SavedCustomBuildRepository customBuildRepository;
    private CustomBuildService customBuildService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        customBuildRepository = mock(SavedCustomBuildRepository.class);
        objectMapper = new ObjectMapper();
        customBuildService = new CustomBuildService(customBuildRepository, objectMapper);
        when(customBuildRepository.save(any(SavedCustomBuild.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void saveBuildStoresTheAuthenticatedUsersExactConfiguration() {
        User user = User.builder().id(10L).role(Role.CLIENT).build();
        CustomBuildConfiguration configuration = new CustomBuildConfiguration(
                "obsidian",
                "forged",
                "black",
                "wood",
                "sport",
                List.of("spoiler", "matrix")
        );

        var response = customBuildService.saveBuild(user, new SaveCustomBuildRequest(
                CustomBuildService.MODEL_NAME,
                configuration
        ));

        assertEquals(CustomBuildService.MODEL_NAME, response.modelName());
        assertEquals(configuration, response.configuration());
        verify(customBuildRepository).save(any(SavedCustomBuild.class));
    }

    @Test
    void configurationUsesTheExpectedPackageJsonProperty() throws Exception {
        CustomBuildConfiguration configuration = new CustomBuildConfiguration(
                "obsidian",
                "forged",
                "black",
                "wood",
                "sport",
                List.of("matrix")
        );

        JsonNode json = objectMapper.readTree(objectMapper.writeValueAsString(configuration));

        assertEquals("sport", json.get("package").asText());
        assertFalse(json.has("packageName"));
    }

    @Test
    void saveBuildRejectsUnsupportedOptionsWithoutWritingToTheRepository() {
        User user = User.builder().id(10L).role(Role.CLIENT).build();
        CustomBuildConfiguration configuration = new CustomBuildConfiguration(
                "obsidian",
                "forged",
                "black",
                "wood",
                "comfort",
                List.of("roof")
        );

        assertThrows(IllegalArgumentException.class, () -> customBuildService.saveBuild(
                user,
                new SaveCustomBuildRequest(CustomBuildService.MODEL_NAME, configuration)
        ));
        verifyNoInteractions(customBuildRepository);
    }
}
