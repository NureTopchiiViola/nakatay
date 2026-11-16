package com.nakatay.backend.controllers;

import com.nakatay.backend.dto.request.GoogleLoginRequest;
import com.nakatay.backend.dto.response.AuthResponse;
import com.nakatay.backend.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(@RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(authService.authenticateWithGoogle(request));
    }
}