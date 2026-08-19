package com.sgcs.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "wards")
public class Ward {

    @Id
    private String id;

    @Column(name = "ward_number", nullable = false)
    private Integer wardNumber;

    @Column(nullable = false)
    private String name;

    @Column(name = "councillor_name")
    private String councillorName;

    @Column(name = "councillor_email")
    private String councillorEmail;

    private Integer population;

    @Column(name = "active_complaints")
    private Integer activeComplaints = 0;

    @Column(name = "resolved_complaints")
    private Integer resolvedComplaints = 0;

    public Ward() {}

    public Ward(String id, Integer wardNumber, String name, String councillorName, String councillorEmail, Integer population) {
        this.id = id;
        this.wardNumber = wardNumber;
        this.name = name;
        this.councillorName = councillorName;
        this.councillorEmail = councillorEmail;
        this.population = population;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Integer getWardNumber() { return wardNumber; }
    public void setWardNumber(Integer wardNumber) { this.wardNumber = wardNumber; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCouncillorName() { return councillorName; }
    public void setCouncillorName(String councillorName) { this.councillorName = councillorName; }

    public String getCouncillorEmail() { return councillorEmail; }
    public void setCouncillorEmail(String councillorEmail) { this.councillorEmail = councillorEmail; }

    public Integer getPopulation() { return population; }
    public void setPopulation(Integer population) { this.population = population; }

    public Integer getActiveComplaints() { return activeComplaints; }
    public void setActiveComplaints(Integer activeComplaints) { this.activeComplaints = activeComplaints; }

    public Integer getResolvedComplaints() { return resolvedComplaints; }
    public void setResolvedComplaints(Integer resolvedComplaints) { this.resolvedComplaints = resolvedComplaints; }
}
