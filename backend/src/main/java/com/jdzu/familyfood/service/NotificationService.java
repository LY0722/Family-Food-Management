package com.jdzu.familyfood.service;

import com.jdzu.familyfood.entity.Inventory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final InventoryService inventoryService;

    public List<Inventory> getExpiringNotifications(Long familyId) {
        return inventoryService.getExpiringItems(familyId, 3);
    }

    public List<Map<String, Object>> getReplenishNotifications(Long familyId) {
        // 这里实现需要补货的预警逻辑
        // 简化版：返回库存低于阈值的食材
        List<Inventory> inventory = inventoryService.getFamilyInventory(familyId);

        return inventory.stream()
                .filter(inv -> inv.getQuantity().compareTo(BigDecimal.valueOf(1)) < 0)
                .map(inv -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("ingredientId", inv.getIngredientId());
                    map.put("ingredientName", "需要查询食材名称"); // 实际需要关联查询
                    map.put("currentQuantity", inv.getQuantity());
                    map.put("suggestedQuantity", BigDecimal.valueOf(2));
                    return map;
                })
                .collect(Collectors.toList());
    }
}