package com.jdzu.familyfood.repository;

import com.jdzu.familyfood.entity.ShoppingHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShoppingHistoryRepository extends JpaRepository<ShoppingHistory, Long> {
    
    List<ShoppingHistory> findByFamilyIdOrderByShoppingDateDesc(Long familyId);
    
    @Query("SELECT sh FROM ShoppingHistory sh WHERE sh.familyId = :familyId AND sh.shoppingDate >= :startDate AND sh.shoppingDate <= :endDate ORDER BY sh.shoppingDate DESC")
    List<ShoppingHistory> findByFamilyIdAndDateRange(@Param("familyId") Long familyId, 
                                                      @Param("startDate") LocalDate startDate, 
                                                      @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(sh) FROM ShoppingHistory sh WHERE sh.familyId = :familyId")
    Long countByFamilyId(@Param("familyId") Long familyId);
    
    @Query("SELECT SUM(sh.totalItems) FROM ShoppingHistory sh WHERE sh.familyId = :familyId")
    Long sumTotalItemsByFamilyId(@Param("familyId") Long familyId);
    
    @Query("SELECT AVG(sh.completionRate) FROM ShoppingHistory sh WHERE sh.familyId = :familyId")
    BigDecimal avgCompletionRateByFamilyId(@Param("familyId") Long familyId);
    
    @Query("SELECT sh FROM ShoppingHistory sh WHERE sh.familyId = :familyId ORDER BY sh.shoppingDate DESC")
    List<ShoppingHistory> findLatestByFamilyId(@Param("familyId") Long familyId);
}