package com.shipguard.service;

import com.shipguard.model.Alert;
import com.shipguard.model.Ship;
import com.shipguard.repository.AlertRepository;
import com.shipguard.repository.ShipRepository;
import org.springframework.stereotype.Service;

@Service
public class RiskService {

    private final ShipRepository shipRepository;
    private final AlertRepository alertRepository;

    public RiskService(ShipRepository shipRepository,
                       AlertRepository alertRepository) {

        this.shipRepository = shipRepository;
        this.alertRepository = alertRepository;
    }

    public Ship analyzeRisk(Ship ship) {

        double riskScore = 0;

        // Speed Risk
        if (ship.getSpeed() > 30) {
            riskScore += 40;
        } else if (ship.getSpeed() > 20) {
            riskScore += 20;
        }

        // Status Risk
        if (ship.getStatus() != null &&
                ship.getStatus().equalsIgnoreCase("Suspicious")) {

            riskScore += 40;
        }

        // Location Risk
        if (ship.getLatitude() == 0 &&
                ship.getLongitude() == 0) {

            riskScore += 20;
        }

        String riskLevel;

        if (riskScore >= 70) {
            riskLevel = "CRITICAL";
        } else if (riskScore >= 50) {
            riskLevel = "HIGH";
        } else if (riskScore >= 25) {
            riskLevel = "MEDIUM";
        } else {
            riskLevel = "LOW";
        }

        ship.setRiskScore(riskScore);
        ship.setRiskLevel(riskLevel);

        Ship updatedShip = shipRepository.save(ship);

        // Create alert for high-risk ships
        if (riskScore >= 50) {

            Alert alert = new Alert(
                    "High risk detected for ship: "
                            + ship.getShipName(),
                    "RISK ALERT",
                    riskLevel,
                    updatedShip
            );

            alertRepository.save(alert);
        }

        return updatedShip;
    }
}