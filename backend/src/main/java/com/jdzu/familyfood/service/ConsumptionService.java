package com.jdzu.familyfood.service;

import com.jdzu.familyfood.entity.ConsumptionRecord;
import com.jdzu.familyfood.entity.Inventory;
import com.jdzu.familyfood.repository.ConsumptionRecordRepository;
import com.jdzu.familyfood.repository.IngredientRepository;
import com.jdzu.familyfood.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConsumptionService {

    private final ConsumptionRecordRepository consumptionRecordRepository;
    private final InventoryRepository inventoryRepository;
    private final IngredientRepository ingredientRepository;

    public List<Map<String, Object>> getConsumptionReport(Long familyId, LocalDate startDate, LocalDate endDate) {
        List<Object[]> summary = consumptionRecordRepository.getConsumptionSummary(familyId, startDate, endDate);

        return summary.stream().map(item -> {
            Map<String, Object> map = new HashMap<>();
            map.put("ingredientId", item[0]);
            map.put("totalConsumption", item[1]);

            // 获取食材名称
            Long ingredientId = ((Number) item[0]).longValue();
            ingredientRepository.findById(ingredientId).ifPresent(ing -> {
                map.put("ingredientName", ing.getName());
                map.put("unit", ing.getUnit());
            });

            return map;
        }).collect(Collectors.toList());
    }

    public Map<String, Object> getWasteStatistics(Long familyId) {
        List<Inventory> expiredItems = inventoryRepository.findExpiredItems(familyId, LocalDate.now());

        // 计算总浪费数量
        BigDecimal totalWastedQuantity = expiredItems.stream()
                .map(Inventory::getQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 按食材分类统计
        Map<String, BigDecimal> wasteByCategory = expiredItems.stream()
                .collect(Collectors.groupingBy(
                    item -> {
                        com.jdzu.familyfood.entity.Ingredient ingredient = ingredientRepository.findById(item.getIngredientId()).orElse(null);
                        return ingredient != null ? ingredient.getCategory() : "其他";
                    },
                    Collectors.reducing(BigDecimal.ZERO, Inventory::getQuantity, BigDecimal::add)
                ));

        Map<String, Object> result = new HashMap<>();
        result.put("totalWastedQuantity", totalWastedQuantity);
        result.put("wasteByCategory", wasteByCategory);
        result.put("expiredItemsCount", expiredItems.size());

        return result;
    }

    /**
     * 获取消耗趋势图表数据
     */
    public Map<String, Object> getConsumptionTrend(Long familyId, String period) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate;
        
        if ("month".equalsIgnoreCase(period)) {
            startDate = endDate.minusMonths(1);
        } else {
            // 默认按周统计
            startDate = endDate.minusWeeks(1);
        }
        
        // 获取每日消耗数据
        List<Map<String, Object>> dailyData = new ArrayList<>();
        LocalDate currentDate = startDate;
        
        while (!currentDate.isAfter(endDate)) {
            BigDecimal dailyTotal = consumptionRecordRepository.getDailyConsumption(familyId, currentDate);
            
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", currentDate.toString());
            dayData.put("totalConsumption", dailyTotal);
            
            // 按餐次统计
            List<ConsumptionRecord> dayRecords = consumptionRecordRepository
                    .findByFamilyIdAndRecordDateBetween(familyId, currentDate, currentDate);
            
            Map<String, BigDecimal> mealStats = dayRecords.stream()
                    .collect(Collectors.groupingBy(
                        ConsumptionRecord::getMealType,
                        Collectors.reducing(BigDecimal.ZERO, ConsumptionRecord::getQuantity, BigDecimal::add)
                    ));
            
            dayData.put("breakfast", mealStats.getOrDefault("早餐", BigDecimal.ZERO));
            dayData.put("lunch", mealStats.getOrDefault("午餐", BigDecimal.ZERO));
            dayData.put("dinner", mealStats.getOrDefault("晚餐", BigDecimal.ZERO));
            dayData.put("snack", mealStats.getOrDefault("加餐", BigDecimal.ZERO));
            
            dailyData.add(dayData);
            currentDate = currentDate.plusDays(1);
        }
        
        // 计算趋势指标
        BigDecimal totalConsumption = dailyData.stream()
                .map(data -> (BigDecimal) data.get("totalConsumption"))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal avgDailyConsumption = totalConsumption.divide(
                BigDecimal.valueOf(dailyData.size()), 2, RoundingMode.HALF_UP);
        
        // 按食材类别统计
        List<Object[]> categorySummary = consumptionRecordRepository.getConsumptionSummary(familyId, startDate, endDate);
        List<Map<String, Object>> categoryData = categorySummary.stream()
                .map(item -> {
                    Map<String, Object> categoryMap = new HashMap<>();
                    Long ingredientId = ((Number) item[0]).longValue();
                    BigDecimal quantity = (BigDecimal) item[1];
                    
                    ingredientRepository.findById(ingredientId).ifPresent(ing -> {
                        categoryMap.put("category", ing.getCategory());
                        categoryMap.put("ingredientName", ing.getName());
                        categoryMap.put("quantity", quantity);
                    });
                    
                    return categoryMap;
                })
                .collect(Collectors.toList());
        
        Map<String, Object> trendData = new HashMap<>();
        trendData.put("familyId", familyId);
        trendData.put("period", period);
        trendData.put("startDate", startDate.toString());
        trendData.put("endDate", endDate.toString());
        trendData.put("dailyData", dailyData);
        trendData.put("totalConsumption", totalConsumption);
        trendData.put("avgDailyConsumption", avgDailyConsumption);
        trendData.put("categoryBreakdown", categoryData);
        
        return trendData;
    }
}