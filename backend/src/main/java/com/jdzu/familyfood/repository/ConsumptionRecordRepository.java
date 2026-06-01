package com.jdzu.familyfood.repository;

import com.jdzu.familyfood.entity.ConsumptionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ConsumptionRecordRepository extends JpaRepository<ConsumptionRecord, Long> {

    List<ConsumptionRecord> findByFamilyIdAndIngredientIdAndRecordDateBetween(
            Long familyId, Long ingredientId, LocalDate startDate, LocalDate endDate);

    List<ConsumptionRecord> findByFamilyIdAndRecordDateBetween(
            Long familyId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT c.ingredientId, SUM(c.quantity) FROM ConsumptionRecord c " +
            "WHERE c.familyId = :familyId AND c.recordDate BETWEEN :startDate AND :endDate " +
            "GROUP BY c.ingredientId")
    List<Object[]> getConsumptionSummary(@Param("familyId") Long familyId,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(c.quantity), 0) FROM ConsumptionRecord c " +
            "WHERE c.familyId = :familyId AND c.recordDate = :date")
    BigDecimal getDailyConsumption(@Param("familyId") Long familyId, @Param("date") LocalDate date);

    /**
     * 按日期倒序获取消耗记录
     */
    List<ConsumptionRecord> findByFamilyIdAndRecordDateAfterOrderByRecordDateDesc(
            @Param("familyId") Long familyId, @Param("recordDate") LocalDate recordDate);
}