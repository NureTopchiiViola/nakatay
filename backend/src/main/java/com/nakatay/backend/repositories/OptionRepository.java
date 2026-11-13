package com.nakatay.backend.repositories;

import com.nakatay.backend.models.Option;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OptionRepository extends JpaRepository<Option, Long> {
    List<Option> findByCarTrimIdAndIsAvailableTrue(Long carTrimId);
}
