package com.shipguard.service;

import com.shipguard.model.Ship;
import com.shipguard.repository.ShipRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Component
public class DatasetLoader implements CommandLineRunner {

    private final ShipRepository shipRepository;
    private final ShipService shipService;

    public DatasetLoader(
            ShipRepository shipRepository,
            ShipService shipService) {

        this.shipRepository = shipRepository;
        this.shipService = shipService;
    }

    @Override
    public void run(String... args) throws Exception {

        InputStream inputStream =
                getClass()
                        .getClassLoader()
                        .getResourceAsStream("dataset/ships.csv");

        if (inputStream == null) {

            System.out.println(
                    "ShipGuard dataset not found."
            );

            return;
        }

        BufferedReader reader =
                new BufferedReader(
                        new InputStreamReader(
                                inputStream,
                                StandardCharsets.UTF_8
                        )
                );

        String line;
        boolean firstLine = true;

        int imported = 0;
        int skipped = 0;

        while ((line = reader.readLine()) != null) {

            // Skip CSV header
            if (firstLine) {
                firstLine = false;
                continue;
            }

            if (line.trim().isEmpty()) {
                continue;
            }

            String[] data = line.split(",");

            // Expected:
            // IMO, Name, Flag, Type, Lat, Lon, Speed, Status

            if (data.length != 8) {

                skipped++;
                continue;
            }

            try {

                String imoNumber =
                        data[0].trim();

                // Avoid duplicate IMO records
                if (shipRepository
                        .findByImoNumber(imoNumber)
                        .isPresent()) {

                    skipped++;
                    continue;
                }

                Ship ship = new Ship();

                ship.setImoNumber(
                        imoNumber
                );

                ship.setShipName(
                        data[1].trim()
                );

                ship.setFlagCountry(
                        data[2].trim()
                );

                ship.setShipType(
                        data[3].trim()
                );

                ship.setLatitude(
                        Double.parseDouble(
                                data[4].trim()
                        )
                );

                ship.setLongitude(
                        Double.parseDouble(
                                data[5].trim()
                        )
                );

                ship.setSpeed(
                        Double.parseDouble(
                                data[6].trim()
                        )
                );

                ship.setStatus(
                        data[7].trim()
                );

                // Risk is calculated here
                // before saving to database.
                shipService.addShip(ship);

                imported++;

            } catch (Exception e) {

                skipped++;

                System.out.println(
                        "Skipped invalid dataset row: "
                                + line
                );
            }
        }

        reader.close();

        System.out.println();
        System.out.println(
                "======================================"
        );

        System.out.println(
                "SHIPGUARD DATASET IMPORT"
        );

        System.out.println(
                "Imported: " + imported
        );

        System.out.println(
                "Skipped: " + skipped
        );

        System.out.println(
                "======================================"
        );
    }
}