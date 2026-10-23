package com.sgcs.dto;

public class WorkerSummaryDto {
    private String id;
    private String fullName;
    private String ward;
    private String specialization;

    public WorkerSummaryDto() {}

    public WorkerSummaryDto(String id, String fullName, String ward, String specialization) {
        this.id = id;
        this.fullName = fullName;
        this.ward = ward;
        this.specialization = specialization;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getWard() { return ward; }
    public void setWard(String ward) { this.ward = ward; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
}
