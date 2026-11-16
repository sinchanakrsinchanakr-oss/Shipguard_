package com.shipguard.controller;

import com.shipguard.model.Ship;
import com.shipguard.repository.ShipRepository;
import com.shipguard.service.RiskService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/ships")
@CrossOrigin(origins = "*")
public class ShipController {

    private final ShipRepository shipRepository;
    private final RiskService riskService;

    public ShipController(ShipRepository shipRepository,
                          RiskService riskService) {

        this.shipRepository = shipRepository;
        this.riskService = riskService;
    }

    // Get all ships
    @GetMapping
    public List<Ship> getAllShips() {
        return shipRepository.findAll();
    }

    // Get ship by ID
    @GetMapping("/{id}")
    public ResponseEntity<Ship> getShipById(@PathVariable Long id) {

        Optional<Ship> ship = shipRepository.findById(id);

        return ship.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Add new ship
    @PostMapping
    public Ship addShip(@RequestBody Ship ship) {

        Ship savedShip = shipRepository.save(ship);

        return riskService.analyzeRisk(savedShip);
    }

    // Update ship
    @PutMapping("/{id}")
    public ResponseEntity<Ship> updateShip(
            @PathVariable Long id,
            @RequestBody Ship shipDetails) {

        return shipRepository.findById(id)
                .map(ship -> {

                    ship.setShipName(shipDetails.getShipName());
                    ship.setImoNumber(shipDetails.getImoNumber());
                    ship.setFlagCountry(shipDetails.getFlagCountry());
                    ship.setShipType(shipDetails.getShipType());
                    ship.setLatitude(shipDetails.getLatitude());
                    ship.setLongitude(shipDetails.getLongitude());
                    ship.setSpeed(shipDetails.getSpeed());
                    ship.setStatus(shipDetails.getStatus());

                    Ship updatedShip = riskService.analyzeRisk(ship);

                    return ResponseEntity.ok(updatedShip);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete ship
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShip(@PathVariable Long id) {

        if (!shipRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        shipRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }

    // Analyze ship risk
    @PostMapping("/{id}/analyze")
    public ResponseEntity<Ship> analyzeShipRisk(@PathVariable Long id) {

        return shipRepository.findById(id)
                .map(ship -> ResponseEntity.ok(
                        riskService.analyzeRisk(ship)
                ))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
