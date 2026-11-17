package com.nakatay.backend.repositories;

import com.nakatay.backend.models.FavoriteCar;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FavoriteCarRepository extends JpaRepository<FavoriteCar, Long> {

    @EntityGraph(attributePaths = {"carModel", "carTrim", "carTrim.carModel"})
    @Query("""
            SELECT favorite
            FROM FavoriteCar favorite
            WHERE favorite.user.id = :userId
              AND favorite.carModel.isDeleted = false
              AND favorite.carTrim IS NOT NULL
              AND favorite.carTrim.isAvailable = true
            ORDER BY favorite.addedAt DESC
            """)
    List<FavoriteCar> findActiveFavoritesByUserId(@Param("userId") Long userId);

    boolean existsByUser_IdAndCarTrim_Id(Long userId, Long carTrimId);

    long deleteByUser_IdAndCarTrim_Id(Long userId, Long carTrimId);
}
