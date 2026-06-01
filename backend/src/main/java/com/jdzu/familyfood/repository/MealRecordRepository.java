// 文件路径：d:\AAAcode\Finally\family-food-backend\src\main\java\com\jdzu\familyfood\repository\MealRecordRepository.java
package com.jdzu.familyfood.repository;

import com.jdzu.familyfood.entity.MealRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MealRecordRepository extends JpaRepository<MealRecord, Long> {
    
    List<MealRecord> findByFamilyIdAndMealDate(Long familyId, LocalDate mealDate);
    
    List<MealRecord> findByFamilyIdAndMealDateBetween(Long familyId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT mr FROM MealRecord mr WHERE mr.familyId = :familyId AND mr.mealDate = :mealDate ORDER BY mr.mealType")
    List<MealRecord> findByFamilyIdAndMealDateOrderByMealType(@Param("familyId") Long familyId, @Param("mealDate") LocalDate mealDate);

    List<MealRecord> findByFamilyIdAndUserIdAndMealDate(Long familyId, Long userId, LocalDate mealDate);
}