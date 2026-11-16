
package com.shipguard.model;

import jakarta.persistence.*;

@Entity
@Table(
    name = "ships",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "imo_number")
    }
)
public class Ship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
        name = "imo_number",
        nullable = false,
        unique = true
    )
    private String imoNumber;

    @Column(
        name = "ship_name",
        nullable = false
    )
    private String shipName;

    @Column(name = "flag_country")
    private String flagCountry;

    @Column(name = "ship_type")
    private String shipType;

    private double latitude;

    private double longitude;

    private double speed;

    private String status;

    @Column(name = "risk_score")
    private double riskScore;

    @Column(name = "risk_level")
    private String riskLevel;

    public Ship() {
    }

    public Long getId() {
        return id;
    }

    public String getImoNumber() {
        return imoNumber;
    }

    public void setImoNumber(String imoNumber) {
        this.imoNumber = imoNumber;
    }

    public String getShipName() {
        return shipName;
    }

    public void setShipName(String shipName) {
        this.shipName = shipName;
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