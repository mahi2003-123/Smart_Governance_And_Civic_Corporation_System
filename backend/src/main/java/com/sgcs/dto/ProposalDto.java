package com.sgcs.dto;

import com.sgcs.entity.Proposal;
import java.time.LocalDateTime;

public class ProposalDto {
    private String id;
    private String title;
    private String category;
    private String description;
    private String ward;
    private String authorName;
    private String authorRole;
    private Integer upvotes;
    private Integer downvotes;
    private String status;
    private String councillorNotes;
    private LocalDateTime createdAt;

    public ProposalDto() {}

    public ProposalDto(Proposal proposal) {
        this.id = proposal.getId();
        this.title = proposal.getTitle();
        this.category = proposal.getCategory();
        this.description = proposal.getDescription();
        this.ward = proposal.getWard();
        this.authorName = proposal.getAuthorName();
        this.authorRole = proposal.getAuthorRole();
        this.upvotes = proposal.getUpvotes();
        this.downvotes = proposal.getDownvotes();
        this.status = proposal.getStatus();
        this.councillorNotes = proposal.getCouncillorNotes();
        this.createdAt = proposal.getCreatedAt();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getWard() { return ward; }
    public void setWard(String ward) { this.ward = ward; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getAuthorRole() { return authorRole; }
    public void setAuthorRole(String authorRole) { this.authorRole = authorRole; }

    public Integer getUpvotes() { return upvotes; }
    public void setUpvotes(Integer upvotes) { this.upvotes = upvotes; }

    public Integer getDownvotes() { return downvotes; }
    public void setDownvotes(Integer downvotes) { this.downvotes = downvotes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCouncillorNotes() { return councillorNotes; }
    public void setCouncillorNotes(String councillorNotes) { this.councillorNotes = councillorNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
