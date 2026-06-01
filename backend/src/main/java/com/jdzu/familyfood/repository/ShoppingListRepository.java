//采购清单操作，支持按优先级排序和状态更新
package com.jdzu.familyfood.repository;

import com.jdzu.familyfood.entity.ShoppingList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShoppingListRepository extends JpaRepository<ShoppingList, Long> {
    List<ShoppingList> findByFamilyId(Long familyId);

    List<ShoppingList> findByFamilyIdAndStatus(Long familyId, Byte status);

    @Query("SELECT s FROM ShoppingList s WHERE s.familyId = :familyId AND s.status = 0 ORDER BY s.priority DESC, s.createdAt DESC")
    List<ShoppingList> findPendingItemsByPriority(@Param("familyId") Long familyId);

    @Modifying
    @Query("UPDATE ShoppingList s SET s.status = :status WHERE s.id = :id")
    int updateStatus(@Param("id") Long id, @Param("status") Byte status);

    @Query("SELECT s FROM ShoppingList s WHERE s.familyId = :familyId AND s.id = :id")
    Optional<ShoppingList> findByIdAndFamilyId(@Param("id") Long id, @Param("familyId") Long familyId);

    void deleteByFamilyIdAndStatus(Long familyId, Byte status);
}