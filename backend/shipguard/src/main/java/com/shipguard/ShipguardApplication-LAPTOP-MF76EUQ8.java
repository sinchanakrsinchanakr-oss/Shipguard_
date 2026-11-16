package com.shipguard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ShipguardApplication {

    public static void main(String[] args) {

        SpringApplication.run(
                ShipguardApplication.class,
                args
        );

        System.out.println();
        System.out.println(
                "======================================"
        );

        System.out.println(
                "SHIPGUARD IS RUNNING"
        );

        System.out.println(
                "Open: http://localhost:8081/"
        );

        System.out.println(
                "======================================"
        );
    }
}