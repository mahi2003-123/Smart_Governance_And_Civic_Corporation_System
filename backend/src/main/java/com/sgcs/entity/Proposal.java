package com.sgcs.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "proposals")
public class Proposal {

    @Embeddable
    public static class ProposalComment {
        private String id;

        @Column(name = "author_name", nullable = false)
        private String authorName;

        @Column(name = "author_role")
        private String authorRole = "CITIZEN";

        @Column(columnDefinition = "TEXT", nullable = false)
        private String content;

        @Column(name = "created_at")
        private LocalDateTime createdAt;

        public ProposalComment() {
            this.id = "cmt_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);
            this.createdAt = LocalDateTime.now();
        }

        public ProposalComment(String authorName, String authorRole, String content) {
            this.id = "cmt_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);
            this.authorName = authorName;
            this.authorRole = authorRole != null ? authorRole : "CITIZEN";
            this.content = content;
            this.createdAt = LocalDateTime.now();
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getAuthorName() { return authorName; }
        public void setAuthorName(String authorName) { this.authorName = authorName; }

        public String getAuthorRole() { return authorRole; }
        public void setAuthorRole(String authorRole) { this.authorRole = authorRole; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    @Id
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String category;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private String ward;

    @Column(name = "author_name", nullable = false)
    private String authorName;

    @Column(name = "author_role")
    private String authorRole = "CITIZEN";

    private Integer upvotes = 0;

    private Integer downvotes = 0;

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, APPROVED, REJECTED, UNDER_REVIEW

    @Column(name = "councillor_notes", columnDefinition = "TEXT")
    private String councillorNotes;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "proposal_comments", joinColumns = @JoinColumn(name = "proposal_id"))
    private List<ProposalComment> comments = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "proposal_user_votes", joinColumns = @JoinColumn(name = "proposal_id"))
    @MapKeyColumn(name = "user_id")
    @Column(name = "vote_type")
    private java.util.Map<String, String> userVotes = new java.util.HashMap<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Proposal() {
        this.createdAt = LocalDateTime.now();
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

    public List<ProposalComment> getComments() { return comments; }
    public void setComments(List<ProposalComment> comments) { this.comments = comments; }

    public java.util.Map<String, String> getUserVotes() { return userVotes; }
    public void setUserVotes(java.util.Map<String, String> userVotes) { this.userVotes = userVotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
