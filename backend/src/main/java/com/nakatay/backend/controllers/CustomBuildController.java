package com.nakatay.backend.controllers;

import com.nakatay.backend.dto.request.SaveCustomBuildRequest;
import com.nakatay.backend.dto.response.SavedCustomBuildResponse;
import com.nakatay.backend.models.User;
import com.nakatay.backend.services.CustomBuildService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
