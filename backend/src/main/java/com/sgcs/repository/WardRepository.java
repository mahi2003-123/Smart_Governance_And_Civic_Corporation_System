package com.sgcs.repository;

import com.sgcs.entity.Ward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WardRepository extends JpaRepository<Ward, String> {
    Optional<Ward> findByNameIgnoreCase(String name);
    List<Ward> findAllByOrderByWardNumberAsc();
    boolean existsByNameIgnoreCase(String name);
}
