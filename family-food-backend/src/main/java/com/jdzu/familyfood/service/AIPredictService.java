// AIPredictService.java
package com.jdzu.familyfood.service;

import com.jdzu.familyfood.entity.*;
import com.jdzu.familyfood.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AIPredictService {

    private final ConsumptionRecordRepository consumptionRecordRepository;
    private final InventoryRepository inventoryRepository;
    private final IngredientRepository ingredientRepository;

    public double predictConsumption(Long familyId, Long ingredientId, int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(90);

        List<ConsumptionRecord> records = consumptionRecordRepository
                .findByFamilyIdAndIngredientIdAndRecordDateBetween(familyId, ingredientId, startDate, endDate);

        if (records.isEmpty()) {
            Optional<Inventory> invOpt = Optional.ofNullable(inventoryRepository.findByFamilyIdAndIngredientId(familyId, ingredientId));
            if (invOpt.isPresent()) {
                BigDecimal qty = invOpt.get().getQuantity();
                if (qty.compareTo(BigDecimal.ZERO) > 0) {
                    double qtyDouble = qty.doubleValue();
                    return Math.min(qtyDouble * days / 7.0, qtyDouble);
                }
            }
            return days * 0.1;
        }

        double weightedSum = 0.0;
        double totalWeight = 0.0;

        for (ConsumptionRecord record : records) {
            long daysAgo = ChronoUnit.DAYS.between(record.getRecordDate(), endDate);
            double weight = Math.exp(-daysAgo / 30.0);
            weightedSum = weightedSum + record.getQuantity().doubleValue() * weight;
            totalWeight = totalWeight + weight;
        }

        double baseAvg = weightedSum / totalWeight;
        int month = endDate.getMonthValue();
        double seasonFactor = 1.0;
        if (month >= 6 && month <= 8) {
            seasonFactor = 1.1;
        } else if (month >= 11 || month <= 2) {
            seasonFactor = 1.05;
        }
        int dayOfWeek = endDate.getDayOfWeek().getValue();
        double weekendFactor = 1.0;
        if (dayOfWeek >= 6) {
            weekendFactor = 1.2;
        }

        return baseAvg * seasonFactor * weekendFactor * days;
    }

    public List<Map<String, Object>> getExpiringNotifications(Long familyId) {
        List<Map<String, Object>> notifications = new ArrayList<>();
        LocalDate now = LocalDate.now();

        List<Inventory> inventoryList = inventoryRepository.findByFamilyId(familyId);

        for (Inventory inv : inventoryList) {
            if (inv.getExpiryDate() == null) {
                continue;
            }
            if (inv.getStatus() == 3) {
                continue;
            }

            long daysUntilExpiry = ChronoUnit.DAYS.between(now, inv.getExpiryDate());
            Optional<Ingredient> ingredientOpt = ingredientRepository.findById(inv.getIngredientId());
            if (!ingredientOpt.isPresent()) {
                continue;
            }

            Ingredient ingredient = ingredientOpt.get();
            double dailyConsumption = predictConsumption(familyId, inv.getIngredientId(), 1);
            double daysUntilEmpty = 999.0;
            if (dailyConsumption > 0) {
                daysUntilEmpty = inv.getQuantity().doubleValue() / dailyConsumption;
            }

            String level = null;
            String reason = null;

            if (daysUntilExpiry <= 1 && daysUntilExpiry >= 0) {
                level = "critical";
                reason = ingredient.getName() + "明天就要过期了";
            } else if (daysUntilExpiry <= 3 && daysUntilExpiry > 0) {
                if (daysUntilEmpty > daysUntilExpiry) {
                    level = "warning";
                    reason = ingredient.getName() + daysUntilExpiry + "天后过期，可能吃不完";
                } else {
                    level = "info";
                    reason = ingredient.getName() + daysUntilExpiry + "天后过期，可以吃完";
                }
            } else if (daysUntilExpiry < 0) {
                level = "expired";
                reason = ingredient.getName() + "已过期" + Math.abs(daysUntilExpiry) + "天";
            } else if (daysUntilEmpty <= 2 && daysUntilExpiry > 7) {
                level = "restock";
                reason = ingredient.getName() + (int)daysUntilEmpty + "天后用完，建议补货";
            }

            if (level != null) {
                Map<String, Object> notif = new HashMap<>();
                notif.put("id", inv.getId());
                notif.put("ingredientId", inv.getIngredientId());
                notif.put("name", ingredient.getName());
                notif.put("quantity", inv.getQuantity());
                notif.put("unit", ingredient.getUnit());
                notif.put("expiryDate", inv.getExpiryDate());
                notif.put("daysUntilExpiry", daysUntilExpiry);
                notif.put("level", level);
                notif.put("reason", reason);
                notifications.add(notif);
            }
        }

        notifications.sort((a, b) -> {
            String la = (String)a.get("level");
            String lb = (String)b.get("level");
            int pa = 1;
            int pb = 1;
            if ("critical".equals(la)) {
                pa = 4;
            } else if ("expired".equals(la)) {
                pa = 3;
            } else if ("warning".equals(la)) {
                pa = 2;
            }
            if ("critical".equals(lb)) {
                pb = 4;
            } else if ("expired".equals(lb)) {
                pb = 3;
            } else if ("warning".equals(lb)) {
                pb = 2;
            }
            return pb - pa;
        });

        return notifications;
    }

    public List<Map<String, Object>> generateShoppingList(Long familyId) {
        List<Map<String, Object>> shoppingList = new ArrayList<>();
        List<Inventory> inventoryList = inventoryRepository.findByFamilyId(familyId);

        for (Inventory inv : inventoryList) {
            if (inv.getStatus() == 3) {
                continue;
            }

            double dailyConsumption = predictConsumption(familyId, inv.getIngredientId(), 1);
            if (dailyConsumption <= 0) {
                continue;
            }

            double daysUntilEmpty = inv.getQuantity().doubleValue() / dailyConsumption;

            if (daysUntilEmpty <= 3) {
                Optional<Ingredient> ingredientOpt = ingredientRepository.findById(inv.getIngredientId());
                if (ingredientOpt.isPresent()) {
                    Ingredient ingredient = ingredientOpt.get();
                    Map<String, Object> item = new HashMap<>();
                    item.put("ingredientId", inv.getIngredientId());
                    item.put("name", ingredient.getName());
                    item.put("category", ingredient.getCategory());
                    item.put("currentQuantity", inv.getQuantity());
                    item.put("unit", ingredient.getUnit());
                    item.put("suggestedQuantity", Math.ceil(dailyConsumption * 5));
                    item.put("daysUntilEmpty", (int)Math.floor(daysUntilEmpty));
                    int priority = 1;
                    if (daysUntilEmpty <= 1) {
                        priority = 3;
                    } else if (daysUntilEmpty <= 2) {
                        priority = 2;
                    }
                    item.put("priority", priority);
                    shoppingList.add(item);
                }
            }
        }

        shoppingList.sort((a, b) -> {
            int pa = (int)a.get("priority");
            int pb = (int)b.get("priority");
            return pb - pa;
        });

        return shoppingList;
    }
}