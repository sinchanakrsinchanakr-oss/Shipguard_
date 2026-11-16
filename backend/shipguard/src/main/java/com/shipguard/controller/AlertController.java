 
package com.shipguard.controller;

import com.shipguard.model.Alert;
import com.shipguard.repository.AlertRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*")
public class AlertController {

    private final AlertRepository alertRepository;

    public AlertController(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    // Get all alerts
    @GetMapping
    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }

    // Get alerts by risk level
    @GetMapping("/risk/{riskLevel}")
    public List<Alert> getAlertsByRiskLevel(
            @PathVariable String riskLevel) {

        return alertRepository.findByRiskLevel(riskLevel);
    }
}