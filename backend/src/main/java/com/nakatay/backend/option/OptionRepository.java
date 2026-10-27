package com.nakatay.backend.option;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OptionRepository extends JpaRepository<Option, Long> {
    List<Option> findByCarTrimIdAndIsAvailableTrue(Long carTrimId);
}
