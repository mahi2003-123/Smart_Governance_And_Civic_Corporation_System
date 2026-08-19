package com.sgcs.repository;

import com.sgcs.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmailIgnoreCase(String email);
    Boolean existsByEmailIgnoreCase(String email);
    List<User> findByRole(String role);
    List<User> findByWard(String ward);
    Optional<User> findByRoleAndWardIgnoreCase(String role, String ward);
}
