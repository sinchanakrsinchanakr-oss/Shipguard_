package com.shipguard.service;

import com.shipguard.model.Ship;
import org.springframework.stereotype.Service;

@Service
public class RiskService {

    public Ship analyzeRisk(Ship ship) {

        double score = 0;

        /*
         * SPEED ANALYSIS
         */

        if (ship.getSpeed() > 30) {

            score += 40;

        } else if (ship.getSpeed() > 20) {

            score += 20;
        }


        /*
         * STATUS ANALYSIS
         */

        if (ship.getStatus() != null &&
                ship.getStatus()
                    .equalsIgnoreCase("Suspicious")) {

            score += 40;
        }


        /*
         * LOCATION ANALYSIS
         */

        if (ship.getLatitude() == 0 &&
                ship.getLongitude() == 0) {

            score += 20;
        }


        /*
         * LIMIT SCORE
         */

        if (score > 100) {
            score = 100;
        }


        /*
         * RISK LEVEL
         */

        String riskLevel;

        if (score >= 80) {

            riskLevel = "CRITICAL";

        } else if (score >= 60) {

            riskLevel = "HIGH";

        } else if (score >= 30) {

            riskLevel = "MEDIUM";

        } else {

            riskLevel = "LOW";
        }


        ship.setRiskScore(score);
        ship.setRiskLevel(riskLevel);

        return ship;
    }
}