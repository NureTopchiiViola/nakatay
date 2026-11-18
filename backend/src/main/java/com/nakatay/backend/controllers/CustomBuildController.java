package com.nakatay.backend.controllers;

import com.nakatay.backend.dto.request.SaveCustomBuildRequest;
import com.nakatay.backend.dto.response.SavedCustomBuildResponse;
import com.nakatay.backend.dto.response.SharedCustomBuildResponse;
import com.nakatay.backend.models.User;
import com.nakatay.backend.services.CustomBuildService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/configurator/custom-builds")
@RequiredArgsConstructor
public class CustomBuildController {

    private final CustomBuildService customBuildService;

    @PostMapping
    public ResponseEntity<SavedCustomBuildResponse> saveBuild(
            @RequestBody SaveCustomBuildRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(customBuildService.saveBuild(currentUser, request));
    }

    @PostMapping("/share")
    public ResponseEntity<SharedCustomBuildResponse> createPublicShare(
            @RequestBody SaveCustomBuildRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(customBuildService.createPublicShare(request));
    }

    @GetMapping("/share/{shareCode}")
    public SharedCustomBuildResponse getPublicShare(@PathVariable String shareCode) {
        return customBuildService.getPublicShare(shareCode);
    }

    @GetMapping
    public List<SavedCustomBuildResponse> getBuilds(
            @AuthenticationPrincipal User currentUser
    ) {
        return customBuildService.getBuilds(currentUser);
    }

    @PutMapping("/{buildId}")
    public SavedCustomBuildResponse updateBuild(
            @PathVariable Long buildId,
            @RequestBody SaveCustomBuildRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return customBuildService.updateBuild(currentUser, buildId, request);
    }

    @DeleteMapping("/{buildId}")
    public ResponseEntity<Void> deleteBuild(
            @PathVariable Long buildId,
            @AuthenticationPrincipal User currentUser
    ) {
        customBuildService.deleteBuild(currentUser, buildId);
        return ResponseEntity.noContent().build();
    }
}
