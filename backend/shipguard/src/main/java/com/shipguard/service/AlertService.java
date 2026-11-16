package com.shipguard.service;

import com.shipguard.model.Alert;
import com.shipguard.model.Ship;
import com.shipguard.repository.AlertRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlertService {

    private final AlertRepository alertRepository;

    public AlertService(
            AlertRepository alertRepository) {

        this.alertRepository = alertRepository;
    }

    public void createAlertIfRequired(Ship ship) {

        String riskLevel =
                ship.getRiskLevel();

        if (!"HIGH".equals(riskLevel) &&
            !"CRITICAL".equals(riskLevel)) {

            return;
        }

        StringBuilder message =
                new StringBuilder();

        message.append(
                "Risk detected for ship: "
        );

        message.append(
                ship.getShipName()
        );

        message.append(". ");


        if (ship.getSpeed() > 30) {

            message.append(
                "High vessel speed detected. "
            );
        }

        if (ship.getStatus() != null &&
            ship.getStatus()
               .equalsIgnoreCase("Suspicious")) {

            message.append(
                "Suspicious operating status detected. "
            );
        }

        if (ship.getLatitude() == 0 &&
            ship.getLongitude() == 0) {

            message.append(
                "Vessel location is unavailable. "
            );
        }


        Alert alert = new Alert(
                message.toString(),
                "RISK ALERT",
                riskLevel,
                ship
        );

        alertRepository.save(alert);
    }

    public List<Alert> getAllAlerts() {

        return alertRepository
                .findAllByOrderByCreatedAtDesc();
    }
}
