//库存操作，包括过期预警、数量扣减等核心功能
package com.jdzu.familyfood.repository;

import com.jdzu.familyfood.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    List<Inventory> findByFamilyId(Long familyId);

    List<Inventory> findByFamilyIdAndStatus(Long familyId, Byte status);

    Inventory findByFamilyIdAndIngredientId(Long familyId, Long ingredientId);

    @Query("SELECT i FROM Inventory i WHERE i.familyId = :familyId AND i.expiryDate BETWEEN :startDate AND :endDate")
    List<Inventory> findExpiringItems(@Param("familyId") Long familyId,
                                      @Param("startDate") LocalDate startDate,
                                      @Param("endDate") LocalDate endDate);

    @Query("SELECT i FROM Inventory i WHERE i.familyId = :familyId AND i.expiryDate < :today")
    List<Inventory> findExpiredItems(@Param("familyId") Long familyId,
                                     @Param("today") LocalDate today);

    @Modifying
    @Query("UPDATE Inventory i SET i.quantity = i.quantity - :quantity WHERE i.id = :id")
    int reduceQuantity(@Param("id") Long id, @Param("quantity") BigDecimal quantity);

    List<Inventory> findByFamilyIdAndExpiryDateBetween(Long familyId, LocalDate today, LocalDate sevenDaysLater);
}