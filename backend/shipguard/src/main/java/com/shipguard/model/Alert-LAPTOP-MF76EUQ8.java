package com.shipguard.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String alertMessage;

    private String alertType;

    private String riskLevel;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "ship_id")
    private Ship ship;

    public Alert() {
    }

    public Alert(
            String alertMessage,
            String alertType,
            String riskLevel,
            Ship ship) {

        this.alertMessage = alertMessage;
        this.alertType = alertType;
        this.riskLevel = riskLevel;
        this.ship = ship;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getAlertMessage() {
        return alertMessage;
    }

    public void setAlertMessage(String alertMessage) {
        this.alertMessage = alertMessage;
    }

    public String getAlertType() {
        return alertType;
    }

    public void setAlertType(String alertType) {
        this.alertType = alertType;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Ship getShip() {
        return ship;
    }

    public void setShip(Ship ship) {
        this.ship = ship;
    }
}