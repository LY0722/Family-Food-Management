// file: SmartNotificationService.java
package com.jdzu.familyfood.service;

import com.jdzu.familyfood.entity.Inventory;
import com.jdzu.familyfood.repository.IngredientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SmartNotificationService {

    private final InventoryService inventoryService;
    private final ConsumptionPredictionService predictionService;
    private final IngredientRepository ingredientRepository;

    /**
     * 智能过期预警（结合消耗预测）
     */
    public List<Map<String, Object>> getSmartExpiringNotifications(Long familyId) {
        List<Inventory> expiringItems = inventoryService.getExpiringItems(familyId, 7);
        List<Map<String, Object>> notifications = new ArrayList<>();

        for (Inventory item : expiringItems) {
            // 预测未来3天该食材的消耗量
            BigDecimal predictedConsumption = predictionService.predictConsumption(
                    familyId, item.getIngredientId(), 3);

            // 如果预测消耗量 < 当前库存，说明可能用不完，需要预警
            if (predictedConsumption.compareTo(item.getQuantity()) < 0) {
                // 获取食材名称
                String ingredientName = ingredientRepository.findById(item.getIngredientId())
                        .map(ingredient -> ingredient.getName())
                        .orElse("未知食材");

                Map<String, Object> notification = new HashMap<>();
                notification.put("inventoryId", item.getId());
                notification.put("ingredientId", item.getIngredientId());
                notification.put("ingredientName", ingredientName);
                notification.put("currentQuantity", item.getQuantity());
                notification.put("expiryDate", item.getExpiryDate());
                notification.put("predictedConsumption", predictedConsumption);
                notification.put("predictedWaste", item.getQuantity().subtract(predictedConsumption));
                notification.put("suggestion", "建议尽快使用或分享给邻居");
                notification.put("priority", "高");
                notifications.add(notification);
            }
        }

        return notifications;
    }

    /**
     * 获取智能补货建议
     */
    public List<Map<String, Object>> getSmartReplenishSuggestions(Long familyId) {
        // 这里可以添加结合消耗预测的智能补货逻辑
        // 例如：预测未来7天的消耗，建议补充到14天的库存量
        return new ArrayList<>();
    }
}