package com.nakatay.backend.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.nakatay.backend.dto.CustomBuildConfiguration;
import com.nakatay.backend.dto.request.SaveCustomBuildRequest;
import com.nakatay.backend.models.Role;
import com.nakatay.backend.models.SavedCustomBuild;
import com.nakatay.backend.models.User;
import com.nakatay.backend.repositories.SavedCustomBuildRepository;
import org.springframework.web.server.ResponseStatusException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

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

    @Test
    void getBuildsReturnsOnlyTheAuthenticatedUsersBuildsInRepositoryOrder() throws Exception {
        User user = User.builder().id(10L).role(Role.CLIENT).build();
        SavedCustomBuild build = savedBuild(user, 24L, configuration());
        when(customBuildRepository.findAllByUser_IdOrderByCreatedAtDesc(user.getId()))
                .thenReturn(List.of(build));

        var response = customBuildService.getBuilds(user);

        assertEquals(1, response.size());
        assertEquals(24L, response.get(0).id());
        assertEquals(configuration(), response.get(0).configuration());
        assertEquals(build.getCreatedAt(), response.get(0).createdAt());
        verify(customBuildRepository).findAllByUser_IdOrderByCreatedAtDesc(user.getId());
    }

    @Test
    void updateBuildChangesConfigurationOnlyWhenTheBuildBelongsToTheUser() throws Exception {
        User user = User.builder().id(10L).role(Role.CLIENT).build();
        SavedCustomBuild build = savedBuild(user, 24L, configuration());
        CustomBuildConfiguration updatedConfiguration = new CustomBuildConfiguration(
                "sapphire",
                "carbon",
                "cognac",
                "carbon",
                "comfort",
                List.of("matrix")
        );
        when(customBuildRepository.findByIdAndUser_Id(24L, user.getId()))
                .thenReturn(Optional.of(build));

        var response = customBuildService.updateBuild(
                user,
                24L,
                new SaveCustomBuildRequest(CustomBuildService.MODEL_NAME, updatedConfiguration)
        );

        assertEquals(24L, response.id());
        assertEquals(updatedConfiguration, response.configuration());
        verify(customBuildRepository).findByIdAndUser_Id(24L, user.getId());
        verify(customBuildRepository).save(build);
    }

    @Test
    void updateBuildReturnsNotFoundWhenTheBuildDoesNotBelongToTheUser() {
        User user = User.builder().id(10L).role(Role.CLIENT).build();
        when(customBuildRepository.findByIdAndUser_Id(24L, user.getId()))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                customBuildService.updateBuild(
                        user,
                        24L,
                        new SaveCustomBuildRequest(CustomBuildService.MODEL_NAME, configuration())
                )
        );

        assertEquals(404, exception.getStatusCode().value());
        verify(customBuildRepository).findByIdAndUser_Id(24L, user.getId());
        verify(customBuildRepository, org.mockito.Mockito.never()).save(any(SavedCustomBuild.class));
    }

    private SavedCustomBuild savedBuild(
            User user,
            Long id,
            CustomBuildConfiguration configuration
    ) throws Exception {
        SavedCustomBuild build = new SavedCustomBuild();
        build.setId(id);
        build.setUser(user);
        build.setModelName(CustomBuildService.MODEL_NAME);
        build.setConfigurationData(objectMapper.writeValueAsString(configuration));
        build.setCreatedAt(OffsetDateTime.parse("2026-11-17T10:00:00Z"));
        return build;
    }

    private CustomBuildConfiguration configuration() {
        return new CustomBuildConfiguration(
                "obsidian",
                "forged",
                "black",
                "wood",
                "sport",
                List.of("spoiler", "matrix")
        );
    }
}
