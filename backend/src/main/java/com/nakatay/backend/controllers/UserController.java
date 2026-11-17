package com.nakatay.backend.controllers;

import com.nakatay.backend.dto.response.FavoriteCarResponse;
import com.nakatay.backend.dto.response.UserProfileResponse;
import com.nakatay.backend.models.User;
import com.nakatay.backend.services.FavoriteCarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final FavoriteCarService favoriteCarService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(@AuthenticationPrincipal User currentUser) {
        UserProfileResponse response = new UserProfileResponse(
                currentUser.getId(),
                currentUser.getEmail(),
                currentUser.getFirstName(),
                currentUser.getLastName(),
                currentUser.getPhone(),
                currentUser.getRole()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{userId}/favorites")
    public ResponseEntity<List<FavoriteCarResponse>> getFavoriteCars(
            @PathVariable Long userId,
            @AuthenticationPrincipal User currentUser
    ) {
        if (!Objects.equals(userId, currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(favoriteCarService.getFavoritesByUserId(userId));
    }

    @PutMapping("/{userId}/favorites/{trimId}")
    public ResponseEntity<Void> addFavoriteCar(
            @PathVariable Long userId,
            @PathVariable Long trimId,
            @AuthenticationPrincipal User currentUser
    ) {
        if (!Objects.equals(userId, currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        favoriteCarService.addFavorite(currentUser, trimId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{userId}/favorites/{trimId}")
    public ResponseEntity<Void> removeFavoriteCar(
            @PathVariable Long userId,
            @PathVariable Long trimId,
            @AuthenticationPrincipal User currentUser
    ) {
        if (!Objects.equals(userId, currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        favoriteCarService.removeFavorite(userId, trimId);
        return ResponseEntity.noContent().build();
    }
}