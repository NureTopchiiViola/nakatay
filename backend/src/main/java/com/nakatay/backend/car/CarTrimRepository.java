package com.nakatay.backend.car;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarTrimRepository extends JpaRepository<CarTrim, Long> {
    @Query("SELECT t FROM CarTrim t JOIN FETCH t.carModel m LEFT JOIN FETCH t.galleryUrls WHERE t.id = :id")
    Optional<CarTrim> findByIdWithModel(@Param("id") Long id);

    @Query("SELECT t FROM CarTrim t JOIN FETCH t.carModel m ORDER BY m.createdAt DESC")
    List<CarTrim> findAllDefault();

    @Query("SELECT t FROM CarTrim t JOIN FETCH t.carModel m WHERE " +
            "LOWER(m.brand) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(m.modelName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(t.trimName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<CarTrim> searchByQuery(@Param("query") String query);
}