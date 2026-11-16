package com.shipguard.controller;

import com.shipguard.model.Alert;
import com.shipguard.service.AlertService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "http://localhost:5173")
public class AlertController {

    private final AlertService alertService;

    public AlertController(
            AlertService alertService) {

        this.alertService = alertService;
    }


    @GetMapping
    public List<Alert> getAlerts() {

        return alertService.getAllAlerts();
    }
}