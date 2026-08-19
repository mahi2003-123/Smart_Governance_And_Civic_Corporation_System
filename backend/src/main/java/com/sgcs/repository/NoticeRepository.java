package com.sgcs.repository;

import com.sgcs.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, String> {
    List<Notice> findByWardOrderByPublishDateDesc(String ward);
    List<Notice> findAllByOrderByPublishDateDesc();
}
