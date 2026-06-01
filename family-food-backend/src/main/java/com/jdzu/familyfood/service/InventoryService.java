package com.jdzu.familyfood.service;

import com.jdzu.familyfood.entity.ConsumptionRecord;
import com.jdzu.familyfood.entity.Ingredient;
import com.jdzu.familyfood.entity.Inventory;
import com.jdzu.familyfood.repository.ConsumptionRecordRepository;
import com.jdzu.familyfood.repository.IngredientRepository;
import com.jdzu.familyfood.repository.InventoryRepository;
import com.jdzu.familyfood.repository.ShoppingListRepository;
import javax.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final InventoryRepository inventoryRepository;
    private final IngredientRepository ingredientRepository;
    private final ShoppingListRepository shoppingListRepository;
    private final ConsumptionRecordRepository consumptionRecordRepository;

    public List<Inventory> getFamilyInventory(Long familyId) {
        return inventoryRepository.findByFamilyId(familyId);
    }

    @Transactional
    public Inventory addIngredientToInventory(Long familyId, Long ingredientId,
                                              BigDecimal quantity, LocalDate purchaseDate,
                                              LocalDate expiryDate) {
        // 获取食材信息
        Ingredient ingredient = ingredientRepository.findById(ingredientId).orElse(null);
        String ingredientName = ingredient != null ? ingredient.getName() : "未知食材";
        String unit = ingredient != null ? ingredient.getUnit() : "个";

        // 检查是否已存在
        Inventory existing = inventoryRepository.findByFamilyIdAndIngredientId(familyId, ingredientId);

        if (existing != null) {
            existing.setQuantity(existing.getQuantity().add(quantity));
            existing.setPurchaseDate(purchaseDate);
            existing.setExpiryDate(expiryDate);
            existing.setIngredientName(ingredientName);
            existing.setUnit(unit);
            updateInventoryStatus(existing);
            return inventoryRepository.save(existing);
        } else {
            Inventory inventory = new Inventory();
            inventory.setFamilyId(familyId);
            inventory.setIngredientId(ingredientId);
            inventory.setIngredientName(ingredientName);
            inventory.setUnit(unit);
            inventory.setQuantity(quantity);
            inventory.setPurchaseDate(purchaseDate);
            inventory.setExpiryDate(expiryDate);
            updateInventoryStatus(inventory);
            return inventoryRepository.save(inventory);
        }
    }

    @Transactional
    public void consumeIngredient(Long familyId, Long ingredientId, BigDecimal quantity,
                                  String mealType) {
        Inventory inventory = inventoryRepository.findByFamilyIdAndIngredientId(familyId, ingredientId);
        if (inventory == null || inventory.getQuantity().compareTo(quantity) < 0) {
            throw new RuntimeException("库存不足");
        }

        // 扣减库存
        inventoryRepository.reduceQuantity(inventory.getId(), quantity);

        // 记录消耗
        ConsumptionRecord record = new ConsumptionRecord();
        record.setFamilyId(familyId);
        record.setIngredientId(ingredientId);
        record.setQuantity(quantity);
        record.setMealType(mealType);
        consumptionRecordRepository.save(record);

        // 更新库存状态
        inventory = inventoryRepository.findById(inventory.getId()).orElse(null);
        if (inventory != null) {
            updateInventoryStatus(inventory);
            inventoryRepository.save(inventory);
        }
    }
public Inventory addToInventory(Long familyId, Long ingredientId, BigDecimal quantity,
                                String unit, LocalDate purchaseDate, LocalDate expiryDate) {
    Inventory inventory = new Inventory();
    inventory.setFamilyId(familyId);
    inventory.setIngredientId(ingredientId);
    inventory.setQuantity(quantity);
    inventory.setUnit(unit);
    inventory.setPurchaseDate(purchaseDate);
    inventory.setExpiryDate(expiryDate);
    inventory.setStatus((byte) 1);
    
    // 新增：从食材表获取名称
    Ingredient ingredient = ingredientRepository.findById(ingredientId).orElse(null);
    if (ingredient != null) {
        inventory.setIngredientName(ingredient.getName());
        if (unit == null || unit.isEmpty()) {
            inventory.setUnit(ingredient.getUnit());
        }
    } else {
        inventory.setIngredientName("未知食材");
    }
    
    return inventoryRepository.save(inventory);
}

    public Inventory consumeFromInventory(Long familyId, Long ingredientId,
                                          BigDecimal quantity, String mealType) {
        List<Inventory> items = Collections.singletonList(inventoryRepository.findByFamilyIdAndIngredientId(familyId, ingredientId));

        if (items.isEmpty()) {
            throw new RuntimeException("库存中不存在该食材");
        }

        Inventory inventory = items.get(0);
        if (inventory.getQuantity().compareTo(quantity) < 0) {
            throw new RuntimeException("库存不足");
        }

        inventory.setQuantity(inventory.getQuantity().subtract(quantity));
        inventoryRepository.save(inventory);

        return inventory;
    }

    public List<Inventory> getExpiringItems(Long familyId) {
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysLater = today.plusDays(7);

        return inventoryRepository.findByFamilyIdAndExpiryDateBetween(
                familyId, today, sevenDaysLater);
    }


    public List<Inventory> getExpiringItems(Long familyId, int daysBefore) {
        LocalDate today = LocalDate.now();
        LocalDate warningDate = today.plusDays(daysBefore);
        return inventoryRepository.findExpiringItems(familyId, today, warningDate);
    }

    public List<Inventory> getExpiredItems(Long familyId) {
        return inventoryRepository.findExpiredItems(familyId, LocalDate.now());
    }

    private void updateInventoryStatus(Inventory inventory) {
        if (inventory.getExpiryDate() == null) return;

        LocalDate today = LocalDate.now();
        if (inventory.getExpiryDate().isBefore(today)) {
            inventory.setStatus((byte) 3); // 已过期
        } else if (inventory.getExpiryDate().isBefore(today.plusDays(3))) {
            inventory.setStatus((byte) 2); // 即将过期
        } else {
            inventory.setStatus((byte) 1); // 正常
        }
    }

    /**
     * 获取家庭消耗记录
     */
    public List<Map<String, Object>> getConsumptionRecords(Long familyId, int days) {
        LocalDate startDate = LocalDate.now().minusDays(days);
        List<ConsumptionRecord> records = consumptionRecordRepository
                .findByFamilyIdAndRecordDateAfterOrderByRecordDateDesc(familyId, startDate);
        
        return records.stream().map(record -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", record.getId());
            map.put("ingredientId", record.getIngredientId());
            map.put("quantity", record.getQuantity());
            map.put("recordDate", record.getRecordDate());
            map.put("mealType", record.getMealType());
            map.put("createdAt", record.getCreatedAt());
            
            // 获取食材名称
            Ingredient ingredient = ingredientRepository.findById(record.getIngredientId()).orElse(null);
            map.put("ingredientName", ingredient != null ? ingredient.getName() : "未知食材");
            
            return map;
        }).collect(Collectors.toList());
    }

    /**
     * 获取库存概览摘要
     */
    public Map<String, Object> getInventorySummary(Long familyId) {
        List<Inventory> inventoryList = inventoryRepository.findByFamilyId(familyId);
        
        long totalItems = inventoryList.size();
        long warningItems = inventoryList.stream()
                .filter(item -> item.getStatus() == 2) // 即将过期
                .count();
        long expiringItems = inventoryList.stream()
                .filter(item -> item.getStatus() == 3) // 已过期
                .count();
        
        // 按类别统计
        Map<String, Long> categoryCount = inventoryList.stream()
                .collect(Collectors.groupingBy(
                    item -> {
                        Ingredient ingredient = ingredientRepository.findById(item.getIngredientId()).orElse(null);
                        return ingredient != null ? ingredient.getCategory() : "其他";
                    },
                    Collectors.counting()
                ));
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("familyId", familyId);
        summary.put("totalItems", totalItems);
        summary.put("warningItems", warningItems);
        summary.put("expiringItems", expiringItems);
        summary.put("categoryDistribution", categoryCount);
        summary.put("lastUpdated", LocalDate.now());
        
        return summary;
    }

    /**
     * 快捷记录餐食
     */
    @Transactional
    public Map<String, Object> quickRecordMeal(Long familyId, String mealType, List<Map<String, Object>> ingredients) {
        List<Map<String, Object>> results = new ArrayList<>();
        
        for (Map<String, Object> ingredient : ingredients) {
            Long ingredientId = Long.valueOf(ingredient.get("ingredientId").toString());
            BigDecimal quantity = new BigDecimal(ingredient.get("quantity").toString());
            
            // 扣减库存
            Inventory inventory = inventoryRepository.findByFamilyIdAndIngredientId(familyId, ingredientId);
            if (inventory != null && inventory.getQuantity().compareTo(quantity) >= 0) {
                inventory.setQuantity(inventory.getQuantity().subtract(quantity));
                updateInventoryStatus(inventory);
                inventoryRepository.save(inventory);
                
                // 记录消耗
                ConsumptionRecord record = new ConsumptionRecord();
                record.setFamilyId(familyId);
                record.setIngredientId(ingredientId);
                record.setQuantity(quantity);
                record.setRecordDate(LocalDate.now());
                record.setMealType(mealType);
                consumptionRecordRepository.save(record);
                
                Map<String, Object> result = new HashMap<>();
                result.put("ingredientId", ingredientId);
                result.put("quantityUsed", quantity);
                result.put("remaining", inventory.getQuantity());
                result.put("status", "success");
                results.add(result);
            } else {
                Map<String, Object> result = new HashMap<>();
                result.put("ingredientId", ingredientId);
                result.put("status", "insufficient");
                result.put("message", "库存不足");
                results.add(result);
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("familyId", familyId);
        response.put("mealType", mealType);
        response.put("results", results);
        response.put("timestamp", System.currentTimeMillis());
        
        return response;
    }

    /**
     * 获取低库存预警列表
     */
    public List<Map<String, Object>> getLowStockItems(Long familyId) {
        List<Inventory> inventoryList = inventoryRepository.findByFamilyId(familyId);
        
        return inventoryList.stream()
                .filter(item -> item.getQuantity().compareTo(item.getWarningThreshold()) <= 0)
                .map(item -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", item.getId());
                    map.put("ingredientId", item.getIngredientId());
                    map.put("ingredientName", item.getIngredientName());
                    map.put("quantity", item.getQuantity());
                    map.put("unit", item.getUnit());
                    map.put("warningThreshold", item.getWarningThreshold());
                    map.put("status", item.getStatus());
                    
                    BigDecimal suggestedQuantity = item.getWarningThreshold().multiply(new BigDecimal("2"));
                    map.put("suggestedQuantity", suggestedQuantity);
                    
                    return map;
                })
                .collect(Collectors.toList());
    }

    /**
     * 删除库存项
     */
    @Transactional
    public void deleteInventoryItem(Long id) {
        inventoryRepository.deleteById(id);
    }
}