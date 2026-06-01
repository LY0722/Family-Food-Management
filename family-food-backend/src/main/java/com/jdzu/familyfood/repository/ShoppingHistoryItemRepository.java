package com.jdzu.familyfood.repository;

import com.jdzu.familyfood.entity.ShoppingHistoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShoppingHistoryItemRepository extends JpaRepository<ShoppingHistoryItem, Long> {
    
    List<ShoppingHistoryItem> findByShoppingHistoryId(Long shoppingHistoryId);
    
    void deleteByShoppingHistoryId(Long shoppingHistoryId);
}