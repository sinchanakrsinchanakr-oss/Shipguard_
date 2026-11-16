
package com.shipguard.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ships")
public class Ship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String shipName;

    @Column(unique = true)
    private String imoNumber;

    private String flagCountry;

    private String shipType;

    private double latitude;

    private double longitude;

    private double speed;

    private String status;

    private double riskScore;

    private String riskLevel;

    // Default Constructor
    public Ship() {
    }

    // Constructor
    public Ship(String shipName, String imoNumber, String flagCountry,
                String shipType, double latitude, double longitude,
                double speed, String status) {

        this.shipName = shipName;
        this.imoNumber = imoNumber;
        this.flagCountry = flagCountry;
        this.shipType = shipType;
        this.latitude = latitude;
        this.longitude = longitude;
        this.speed = speed;
        this.status = status;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getShipName() {
        return shipName;
    }

    public void setShipName(String shipName) {
        this.shipName = shipName;
    }

    public String getImoNumber() {
        return imoNumber;
    }

    public void setImoNumber(String imoNumber) {
        this.imoNumber = imoNumber;
    }

    public String getFlagCountry() {
        return flagCountry;
    }

    public void setFlagCountry(String flagCountry) {
        this.flagCountry = flagCountry;
    }

    public String getShipType() {
        return shipType;
    }

    public void setShipType(String shipType) {
        this.shipType = shipType;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public double getSpeed() {
        return speed;
    }

    public void setSpeed(double speed) {
        this.speed = speed;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(double riskScore) {
        this.riskScore = riskScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }
}