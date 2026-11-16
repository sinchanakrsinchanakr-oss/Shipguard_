package com.shipguard.repository;

import com.shipguard.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertRepository
        extends JpaRepository<Alert, Long> {

    List<Alert> findByRiskLevelOrderByCreatedAtDesc(
            String riskLevel);

    List<Alert> findAllByOrderByCreatedAtDesc();
}