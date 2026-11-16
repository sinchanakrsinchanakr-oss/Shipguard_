package com.shipguard.service;

import com.shipguard.model.Ship;
import com.shipguard.repository.ShipRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ShipService {

    private final ShipRepository shipRepository;
    private final RiskService riskService;
    private final AlertService alertService;

    public ShipService(
            ShipRepository shipRepository,
            RiskService riskService,
            AlertService alertService) {

        this.shipRepository = shipRepository;
        this.riskService = riskService;
        this.alertService = alertService;
    }


    public List<Ship> getAllShips() {

        return shipRepository.findAll();
    }


    /*
     * MAIN IMO SEARCH
     */

    public Optional<Ship> findByImo(
            String imoNumber) {

        return shipRepository
                .findByImoNumber(imoNumber);
    }


    /*
     * ADD SHIP
     */

    public Ship addShip(Ship ship) {

        Ship analyzed =
                riskService.analyzeRisk(ship);

        Ship saved =
                shipRepository.save(analyzed);

        alertService.createAlertIfRequired(
                saved
        );

        return saved;
    }


    /*
     * UPDATE
     */

    public Optional<Ship> updateShip(
            Long id,
            Ship details) {

        return shipRepository
                .findById(id)
                .map(ship -> {

                    ship.setShipName(
                            details.getShipName()
                    );

                    ship.setImoNumber(
                            details.getImoNumber()
                    );

                    ship.setFlagCountry(
                            details.getFlagCountry()
                    );

                    ship.setShipType(
                            details.getShipType()
                    );

                    ship.setLatitude(
                            details.getLatitude()
                    );

                    ship.setLongitude(
                            details.getLongitude()
                    );

                    ship.setSpeed(
                            details.getSpeed()
                    );

                    ship.setStatus(
                            details.getStatus()
                    );

                    Ship analyzed =
                            riskService.analyzeRisk(ship);

                    Ship saved =
                            shipRepository.save(analyzed);

                    alertService
                            .createAlertIfRequired(saved);

                    return saved;
                });
    }


    /*
     * DELETE
     */

    public boolean deleteShip(Long id) {

        if (!shipRepository.existsById(id)) {
            return false;
        }

        shipRepository.deleteById(id);

        return true;
    }


    /*
     * RISK ANALYSIS
     */

    public Optional<Ship> analyzeRisk(
            Long id) {

        return shipRepository
                .findById(id)
                .map(ship -> {

                    Ship analyzed =
                            riskService.analyzeRisk(ship);

                    Ship saved =
                            shipRepository.save(analyzed);

                    alertService
                            .createAlertIfRequired(saved);

                    return saved;
                });
    }
}
