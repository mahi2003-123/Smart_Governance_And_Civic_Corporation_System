package com.sgcs.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateComplaintRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String category;

    @NotBlank(message = "Ward is required")
    private String ward;

    private String locationAddress;

    private Object images;

    private String priority;

    public CreateComplaintRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getWard() { return ward; }
    public void setWard(String ward) { this.ward = ward; }

    public String getLocationAddress() { return locationAddress; }
    public void setLocationAddress(String locationAddress) { this.locationAddress = locationAddress; }

    public Object getImages() { return images; }
    public void setImages(Object images) { this.images = images; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}
