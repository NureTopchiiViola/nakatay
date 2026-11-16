package com.nakatay.backend.services;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.nakatay.backend.dto.request.GoogleLoginRequest;
import com.nakatay.backend.dto.response.AuthResponse;
import com.nakatay.backend.dto.response.UserProfileResponse;
import com.nakatay.backend.models.Role;
import com.nakatay.backend.models.User;
import com.nakatay.backend.repositories.UserRepository;
import com.nakatay.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${google.client-id}")
    private String googleClientId;

    @Transactional
    public AuthResponse authenticateWithGoogle(GoogleLoginRequest request) {
        if (request.idToken() == null || request.idToken().isBlank()) {
            throw new IllegalArgumentException("Google ID токен не передано");
        }

        GoogleIdToken.Payload payload = verifyGoogleToken(request.idToken()); // verify
        //if verified
        String googleId = payload.getSubject();
        String email = payload.getEmail();
        String firstName = (String) payload.get("given_name");
        String lastName = (String) payload.get("family_name");

        User user = userRepository.findByGoogleId(googleId) // login
                .orElseGet(() -> userRepository.findByEmail(email) // or else change google id
                        .map(existingUser -> {
                            existingUser.setGoogleId(googleId);
                            return userRepository.save(existingUser);
                        })
                        .orElseGet(() -> userRepository.save(User.builder() // or else register
                                .googleId(googleId)
                                .email(email)
                                .firstName(firstName)
                                .lastName(lastName)
                                .role(Role.CLIENT)
                                .build()))
                );

        // generate jwt
        String jwtToken = jwtService.generateToken(user);

        UserProfileResponse profile = new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getRole()
        );

        return new AuthResponse(jwtToken, profile);
    }

    private GoogleIdToken.Payload verifyGoogleToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            )
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new IllegalArgumentException("Невалідний або прострочений Google токен");
            }
            return idToken.getPayload();
        } catch (Exception e) {
            throw new IllegalArgumentException("Помилка верифікації Google токена: " + e.getMessage(), e);
        }
    }
}