package com.shipguard.controller;

import com.shipguard.model.Ship;
import com.shipguard.service.ShipService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ships")
@CrossOrigin(origins = "http://localhost:5173")
public class ShipController {

    private final ShipService shipService;

    public ShipController(
            ShipService shipService) {

        this.shipService = shipService;
    }


    /*
     * GET ALL
     */

    @GetMapping
    public List<Ship> getAllShips() {

        return shipService.getAllShips();
    }


    /*
     * MAIN IMO LOOKUP
     *
     * Example:
     * /api/ships/imo/IMO7654321
     */

    @GetMapping("/imo/{imoNumber}")
    public ResponseEntity<Ship> getShipByImo(
            @PathVariable String imoNumber) {

        return shipService
                .findByImo(imoNumber)
                .map(ResponseEntity::ok)
                .orElseGet(
                    () -> ResponseEntity
                            .notFound()
                            .build()
                );
    }


    /*
     * GET BY ID
     */

    @GetMapping("/{id}")
    public ResponseEntity<Ship> getById(
            @PathVariable Long id) {

        return shipService
                .getAllShips()
                .stream()
                .filter(
                    ship ->
                        ship.getId().equals(id)
                )
                .findFirst()
                .map(ResponseEntity::ok)
                .orElseGet(
                    () -> ResponseEntity
                            .notFound()
                            .build()
                );
    }


    /*
     * ADD
     */

    @PostMapping
    public ResponseEntity<Ship> addShip(
            @RequestBody Ship ship) {

        return ResponseEntity.ok(
                shipService.addShip(ship)
        );
    }


    /*
     * UPDATE
     */

    @PutMapping("/{id}")
    public ResponseEntity<Ship> updateShip(
            @PathVariable Long id,
            @RequestBody Ship ship) {

        return shipService
                .updateShip(id, ship)
                .map(ResponseEntity::ok)
                .orElseGet(
                    () -> ResponseEntity
                            .notFound()
                            .build()
                );
    }


    /*
     * DELETE
     */

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShip(
            @PathVariable Long id) {

        boolean deleted =
                shipService.deleteShip(id);

        if (!deleted) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity
                .noContent()
                .build();
    }


    /*
     * ANALYZE
     */

    @PostMapping("/{id}/analyze")
    public ResponseEntity<Ship> analyze(
            @PathVariable Long id) {

        return shipService
                .analyzeRisk(id)
                .map(ResponseEntity::ok)
                .orElseGet(
                    () -> ResponseEntity
                            .notFound()
                            .build()
                );
    }
}

