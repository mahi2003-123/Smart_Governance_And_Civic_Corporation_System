package com.sgcs.repository;

import com.sgcs.entity.Proposal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProposalRepository extends JpaRepository<Proposal, String> {
    List<Proposal> findByWardOrderByCreatedAtDesc(String ward);
    List<Proposal> findAllByOrderByCreatedAtDesc();
}
