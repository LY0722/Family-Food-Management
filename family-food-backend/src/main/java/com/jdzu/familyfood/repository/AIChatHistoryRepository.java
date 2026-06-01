package com.jdzu.familyfood.repository;

import com.jdzu.familyfood.entity.AIChatHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIChatHistoryRepository extends JpaRepository<AIChatHistory, Long> {

    @Query("SELECT a FROM AIChatHistory a WHERE a.userId = :userId AND a.familyId = :familyId ORDER BY a.createdAt DESC")
    List<AIChatHistory> findByUserIdAndFamilyIdOrderByCreatedAtDesc(@Param("userId") Long userId, @Param("familyId") Long familyId);

    @Query("SELECT a FROM AIChatHistory a WHERE a.userId = :userId AND a.familyId = :familyId ORDER BY a.createdAt DESC")
    List<AIChatHistory> findRecentChats(@Param("userId") Long userId, @Param("familyId") Long familyId, Pageable pageable);
}