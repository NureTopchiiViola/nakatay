package com.nakatay.backend.controllers;

import com.nakatay.backend.models.User;
import com.nakatay.backend.services.FavoriteCarService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

class UserControllerTest {

    private FavoriteCarService favoriteCarService;
    private UserController userController;

    @BeforeEach
    void setUp() {
        favoriteCarService = mock(FavoriteCarService.class);
        userController = new UserController(favoriteCarService);
    }

    @Test
    void getFavoriteCarsRejectsRequestsForAnotherUser() {
        User currentUser = User.builder().id(1L).build();

        var response = userController.getFavoriteCars(2L, currentUser);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        verifyNoInteractions(favoriteCarService);
    }

    @Test
    void getFavoriteCarsLoadsFavoritesForCurrentUser() {
        User currentUser = User.builder().id(1L).build();

        var response = userController.getFavoriteCars(1L, currentUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(favoriteCarService).getFavoritesByUserId(1L);
    }

    @Test
    void addFavoriteCarRejectsRequestsForAnotherUser() {
        User currentUser = User.builder().id(1L).build();

        var response = userController.addFavoriteCar(2L, 3L, currentUser);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        verifyNoInteractions(favoriteCarService);
    }

    @Test
    void addFavoriteCarStoresTrimForCurrentUser() {
        User currentUser = User.builder().id(1L).build();

        var response = userController.addFavoriteCar(1L, 3L, currentUser);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(favoriteCarService).addFavorite(currentUser, 3L);
    }

    @Test
    void removeFavoriteCarDeletesTrimForCurrentUser() {
        User currentUser = User.builder().id(1L).build();

        var response = userController.removeFavoriteCar(1L, 3L, currentUser);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(favoriteCarService).removeFavorite(1L, 3L);
    }
}
