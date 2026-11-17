package com.nakatay.backend.services;

import com.nakatay.backend.dto.response.FavoriteCarResponse;
import com.nakatay.backend.common.exception.ResourceNotFoundException;
import com.nakatay.backend.models.CarTrim;
import com.nakatay.backend.models.FavoriteCar;
import com.nakatay.backend.models.User;
import com.nakatay.backend.repositories.CarTrimRepository;
import com.nakatay.backend.repositories.FavoriteCarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteCarService {

    private final FavoriteCarRepository favoriteCarRepository;
    private final CarTrimRepository carTrimRepository;

    @Transactional(readOnly = true)
    public List<FavoriteCarResponse> getFavoritesByUserId(Long userId) {
        return favoriteCarRepository.findActiveFavoritesByUserId(userId).stream()
                .map(favorite -> {
                    CarTrim trim = favorite.getCarTrim();
                    return new FavoriteCarResponse(
                            trim.getId(),
                            favorite.getCarModel().getBrand() + " "
                                    + favorite.getCarModel().getModelName() + " "
                                    + trim.getTrimName(),
                            trim.getYear(),
                            trim.getEngine(),
                            trim.getTransmission(),
                            favorite.getCarModel().getBasePrice().add(trim.getPriceModifier()),
                            favorite.getCarModel().getMainImageUrl(),
                            favorite.getAddedAt()
                    );
                })
                .toList();
    }

    @Transactional
    public void addFavorite(User user, Long carTrimId) {
        CarTrim trim = carTrimRepository.findByIdWithModel(carTrimId)
                .orElseThrow(() -> new ResourceNotFoundException("Комплектацію не знайдено"));
        if (trim.getCarModel().isDeleted() || !trim.isAvailable()) {
            throw new ResourceNotFoundException("Автомобіль недоступний");
        }

        if (!favoriteCarRepository.existsByUser_IdAndCarTrim_Id(user.getId(), carTrimId)) {
            favoriteCarRepository.save(new FavoriteCar(user, trim.getCarModel(), trim));
        }
    }

    @Transactional
    public void removeFavorite(Long userId, Long carTrimId) {
        favoriteCarRepository.deleteByUser_IdAndCarTrim_Id(userId, carTrimId);
    }
}
