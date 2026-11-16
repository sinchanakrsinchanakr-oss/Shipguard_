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

    // Default Constructor
    public Alert() {
        this.createdAt = LocalDateTime.now();
    }

    // Constructor
    public Alert(String alertMessage, String alertType,
                 String riskLevel, Ship ship) {

        this.alertMessage = alertMessage;
        this.alertType = alertType;
        this.riskLevel = riskLevel;
        this.ship = ship;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Ship getShip() {
        return ship;
    }

    public void setShip(Ship ship) {
        this.ship = ship;
    }
}