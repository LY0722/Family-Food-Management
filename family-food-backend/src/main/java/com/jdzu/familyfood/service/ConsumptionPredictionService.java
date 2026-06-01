// file: ConsumptionPredictionService.java
package com.jdzu.familyfood.service;

import com.jdzu.familyfood.entity.ConsumptionRecord;
import com.jdzu.familyfood.repository.ConsumptionRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class ConsumptionPredictionService {
    private final ConsumptionRecordRepository consumptionRecordRepository;

    /**
     * 预测未来几天的食材消耗量（基于历史数据的智能算法）
     */
    public BigDecimal predictConsumption(Long familyId, Long ingredientId, int days) {
        // 获取最近30天的消耗记录
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(30);

        List<ConsumptionRecord> records = consumptionRecordRepository
                .findByFamilyIdAndIngredientIdAndRecordDateBetween(
                        familyId, ingredientId, startDate, endDate);

        if (records.isEmpty()) {
            // 如果没有历史数据，返回默认值（根据家庭规模估算）
            return BigDecimal.valueOf(days * 0.2); // 默认每天消耗0.2单位
        }

        // 计算加权日均消耗量（最近的数据权重更高）
        BigDecimal weightedTotal = BigDecimal.ZERO;
        BigDecimal totalWeight = BigDecimal.ZERO;

        for (int i = 0; i < records.size(); i++) {
            ConsumptionRecord record = records.get(i);
            // 权重：越近的数据权重越高（线性递减）
            BigDecimal weight = BigDecimal.valueOf(records.size() - i);
            weightedTotal = weightedTotal.add(record.getQuantity().multiply(weight));
            totalWeight = totalWeight.add(weight);
        }

        BigDecimal weightedAvgDaily = weightedTotal.divide(totalWeight, 2, BigDecimal.ROUND_HALF_UP);

        // 考虑星期几的影响
        BigDecimal dayOfWeekFactor = getDayOfWeekFactor(LocalDate.now());

        // 考虑季节性影响
        BigDecimal seasonalFactor = getSeasonalFactor(LocalDate.now());

        // 预测未来消耗量 = 加权日均消耗量 × 预测天数 × 星期因子 × 季节因子
        return weightedAvgDaily
                .multiply(BigDecimal.valueOf(days))
                .multiply(dayOfWeekFactor)
                .multiply(seasonalFactor);
    }

    /**
     * 获取星期几因子（周末消耗可能更多）
     */
    private BigDecimal getDayOfWeekFactor(LocalDate date) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        switch (dayOfWeek) {
            case SATURDAY:
            case SUNDAY:
                return BigDecimal.valueOf(1.3); // 周末增加30%
            case FRIDAY:
                return BigDecimal.valueOf(1.1); // 周五增加10%
            default:
                return BigDecimal.ONE;
        }
    }

    /**
     * 获取季节性因子（优化版）
     */
    private BigDecimal getSeasonalFactor(LocalDate date) {
        int month = date.getMonthValue();
        // 春季(3-5月)：正常
        // 夏季(6-8月)：消耗减少（天气热，食欲下降）
        // 秋季(9-11月)：正常
        // 冬季(12-2月)：消耗增加（天气冷，食欲增加，节日多）
        if (month >= 12 || month <= 2) {
            return BigDecimal.valueOf(1.25);  // 冬季增加25%
        } else if (month >= 6 && month <= 8) {
            return BigDecimal.valueOf(0.85);  // 夏季减少15%
        }
        return BigDecimal.ONE;
    }

    /**
     * 批量预测多个食材的消耗
     */
    public Map<Long, BigDecimal> batchPredictConsumption(Long familyId, List<Long> ingredientIds, int days) {
        Map<Long, BigDecimal> predictions = new HashMap<>();
        for (Long ingredientId : ingredientIds) {
            predictions.put(ingredientId, predictConsumption(familyId, ingredientId, days));
        }
        return predictions;
    }
}