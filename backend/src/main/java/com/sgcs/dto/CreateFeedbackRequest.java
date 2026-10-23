package com.sgcs.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class CreateFeedbackRequest {

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer rating;

    @NotNull(message = "Satisfied status is required")
    private Boolean satisfied;

    private String comment;

    public CreateFeedbackRequest() {}

    public CreateFeedbackRequest(Integer rating, Boolean satisfied, String comment) {
        this.rating = rating;
        this.satisfied = satisfied;
        this.comment = comment;
    }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public Boolean getSatisfied() { return satisfied; }
    public void setSatisfied(Boolean satisfied) { this.satisfied = satisfied; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
