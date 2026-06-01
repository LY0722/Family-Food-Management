package com.jdzu.familyfood.service;

import com.jdzu.familyfood.entity.ConsumptionRecord;
import com.jdzu.familyfood.repository.ConsumptionRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SimpleMLService {

    private final ConsumptionRecordRepository consumptionRecordRepository;

    /**
     * 训练简单的线性回归模型
     * 基于历史数据预测食材消耗
     */
    public Map<String, Object> trainConsumptionModel(Long familyId, Long ingredientId) {
        log.info("开始训练家庭 {} 食材 {} 的消耗模型", familyId, ingredientId);
        
        // 1. 获取历史消耗数据
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(30); // 使用最近30天数据
        
        List<ConsumptionRecord> records = consumptionRecordRepository
                .findByFamilyIdAndIngredientIdAndRecordDateBetween(
                        familyId, ingredientId, startDate, endDate);
        
        if (records.size() < 5) {
            log.warn("数据不足，无法训练模型");
            return Map.of(
                "success", false,
                "message", "数据不足，需要至少5条记录",
                "dataPoints", records.size()
            );
        }
        
        // 2. 特征工程
        List<FeatureVector> features = extractFeatures(records);
        
        // 3. 训练模型（简单线性回归）
        LinearRegressionModel model = trainLinearRegression(features);
        
        // 4. 评估模型
        double accuracy = evaluateModel(model, features);
        
        // 5. 保存模型参数
        Map<String, Object> modelParams = new HashMap<>();
        modelParams.put("familyId", familyId);
        modelParams.put("ingredientId", ingredientId);
        modelParams.put("coefficients", model.getCoefficients());
        modelParams.put("intercept", model.getIntercept());
        modelParams.put("accuracy", accuracy);
        modelParams.put("trainedAt", System.currentTimeMillis());
        
        log.info("模型训练完成，准确率: {}", accuracy);
        
        return Map.of(
            "success", true,
            "message", "模型训练成功",
            "model", modelParams,
            "dataPoints", records.size(),
            "accuracy", accuracy
        );
    }

    /**
     * 使用训练好的模型进行预测
     */
    public double predictConsumption(Long familyId, Long ingredientId, int days) {
        try {
            // 1. 获取训练的模型参数（这里简化，实际应该从数据库或文件中读取）
            LinearRegressionModel model = getTrainedModel(familyId, ingredientId);
            
            if (model == null) {
                log.info("未找到训练模型，使用默认预测");
                return getDefaultPrediction(familyId, ingredientId, days);
            }
            
            // 2. 准备预测特征
            FeatureVector feature = createPredictionFeature(days);
            
            // 3. 进行预测
            double prediction = model.predict(feature);
            
            log.info("预测结果: {}", prediction);
            return Math.max(0, prediction); // 确保预测值非负
            
        } catch (Exception e) {
            log.error("预测失败，使用默认算法", e);
            return getDefaultPrediction(familyId, ingredientId, days);
        }
    }

    /**
     * 特征提取
     */
    private List<FeatureVector> extractFeatures(List<ConsumptionRecord> records) {
        return records.stream().map(record -> {
            FeatureVector feature = new FeatureVector();
            
            LocalDate date = record.getRecordDate();
            
            // 特征1: 星期几 (0-6)
            feature.dayOfWeek = date.getDayOfWeek().getValue() % 7;
            
            // 特征2: 是否周末 (0-1)
            feature.isWeekend = (date.getDayOfWeek() == DayOfWeek.SATURDAY || 
                               date.getDayOfWeek() == DayOfWeek.SUNDAY) ? 1 : 0;
            
            // 特征3: 月份 (1-12)
            feature.month = date.getMonthValue();
            
            // 特征4: 是否月初 (0-1)
            feature.isMonthStart = date.getDayOfMonth() <= 10 ? 1 : 0;
            
            // 特征5: 是否月末 (0-1)
            feature.isMonthEnd = date.getDayOfMonth() >= 25 ? 1 : 0;
            
            // 标签: 实际消耗量
            feature.label = record.getQuantity().doubleValue();
            
            return feature;
        }).collect(Collectors.toList());
    }

    /**
     * 训练线性回归模型
     */
    private LinearRegressionModel trainLinearRegression(List<FeatureVector> features) {
        // 使用最小二乘法训练简单线性回归
        int n = features.size();
        int m = 5; // 特征数量
        
        // 构建设计矩阵X和标签向量y
        double[][] X = new double[n][m];
        double[] y = new double[n];
        
        for (int i = 0; i < n; i++) {
            FeatureVector f = features.get(i);
            X[i][0] = f.dayOfWeek;
            X[i][1] = f.isWeekend;
            X[i][2] = f.month;
            X[i][3] = f.isMonthStart;
            X[i][4] = f.isMonthEnd;
            y[i] = f.label;
        }
        
        // 计算回归系数 (简化版，实际应该使用矩阵运算)
        double[] coefficients = new double[m];
        double intercept = 0.0;
        
        // 简单的特征重要性分析
        coefficients[0] = calculateFeatureImportance(features, f -> (double) f.dayOfWeek, y);
        coefficients[1] = calculateFeatureImportance(features, f -> (double) f.isWeekend, y);
        coefficients[2] = calculateFeatureImportance(features, f -> (double) f.month, y);
        coefficients[3] = calculateFeatureImportance(features, f -> (double) f.isMonthStart, y);
        coefficients[4] = calculateFeatureImportance(features, f -> (double) f.isMonthEnd, y);
        
        // 计算截距（使用平均值的偏差）
        double avgPrediction = calculateAveragePrediction(features, coefficients);
        double avgLabel = Arrays.stream(y).average().orElse(0.0);
        intercept = avgLabel - avgPrediction;
        
        return new LinearRegressionModel(coefficients, intercept);
    }

    /**
     * 计算特征重要性
     */
    private double calculateFeatureImportance(List<FeatureVector> features, 
                                          java.util.function.Function<FeatureVector, Double> featureExtractor,
                                          double[] labels) {
        // 计算特征与标签的相关性
        double[] featureValues = features.stream()
                .mapToDouble(featureExtractor::apply)
                .toArray();
        
        double[] labelsArray = labels;
        
        // 计算皮尔逊相关系数
        return calculateCorrelation(featureValues, labelsArray);
    }

    /**
     * 计算相关系数
     */
    private double calculateCorrelation(double[] x, double[] y) {
        int n = x.length;
        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
        
        for (int i = 0; i < n; i++) {
            sumX += x[i];
            sumY += y[i];
            sumXY += x[i] * y[i];
            sumX2 += x[i] * x[i];
            sumY2 += y[i] * y[i];
        }
        
        double numerator = n * sumXY - sumX * sumY;
        double denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        
        return denominator == 0 ? 0 : numerator / denominator;
    }

    /**
     * 计算平均预测值
     */
    private double calculateAveragePrediction(List<FeatureVector> features, double[] coefficients) {
        return features.stream()
                .mapToDouble(f -> {
                    double prediction = coefficients[0] * f.dayOfWeek +
                                     coefficients[1] * f.isWeekend +
                                     coefficients[2] * f.month +
                                     coefficients[3] * f.isMonthStart +
                                     coefficients[4] * f.isMonthEnd;
                    return prediction;
                })
                .average()
                .orElse(0.0);
    }

    /**
     * 评估模型
     */
    private double evaluateModel(LinearRegressionModel model, List<FeatureVector> features) {
        double totalError = 0;
        double totalValue = 0;
        
        for (FeatureVector feature : features) {
            double predicted = model.predict(feature);
            double actual = feature.label;
            
            totalError += Math.abs(predicted - actual);
            totalValue += actual;
        }
        
        // 计算平均绝对百分比误差 (MAPE)
        double mape = totalValue == 0 ? 0 : (totalError / totalValue) * 100;
        return Math.max(0, 100 - mape); // 转换为准确率
    }

    /**
     * 创建预测特征
     */
    private FeatureVector createPredictionFeature(int days) {
        FeatureVector feature = new FeatureVector();
        LocalDate today = LocalDate.now();
        
        feature.dayOfWeek = today.getDayOfWeek().getValue() % 7;
        feature.isWeekend = (today.getDayOfWeek() == DayOfWeek.SATURDAY || 
                           today.getDayOfWeek() == DayOfWeek.SUNDAY) ? 1 : 0;
        feature.month = today.getMonthValue();
        feature.isMonthStart = today.getDayOfMonth() <= 10 ? 1 : 0;
        feature.isMonthEnd = today.getDayOfMonth() >= 25 ? 1 : 0;
        
        return feature;
    }

    /**
     * 获取训练好的模型（简化版，实际应该从数据库读取）
     */
    private LinearRegressionModel getTrainedModel(Long familyId, Long ingredientId) {
        // 这里简化处理，实际应该从数据库或文件中读取保存的模型
        // 返回null表示没有训练好的模型
        return null;
    }

    /**
     * 默认预测算法
     */
    private double getDefaultPrediction(Long familyId, Long ingredientId, int days) {
        // 使用简单的移动平均
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(14); // 使用最近14天
        
        List<ConsumptionRecord> records = consumptionRecordRepository
                .findByFamilyIdAndIngredientIdAndRecordDateBetween(
                        familyId, ingredientId, startDate, endDate);
        
        if (records.isEmpty()) {
            return 1.0 * days; // 没有数据时返回默认值
        }
        
        double avgDailyConsumption = records.stream()
                .mapToDouble(r -> r.getQuantity().doubleValue())
                .average()
                .orElse(1.0);
        
        return avgDailyConsumption * days;
    }

    /**
     * 特征向量类
     */
    private static class FeatureVector {
        int dayOfWeek;      // 星期几
        int isWeekend;      // 是否周末
        int month;          // 月份
        int isMonthStart;   // 是否月初
        int isMonthEnd;     // 是否月末
        double label;       // 标签（实际消耗量）
    }

    /**
     * 线性回归模型类
     */
    private static class LinearRegressionModel {
        private final double[] coefficients;
        private final double intercept;
        
        public LinearRegressionModel(double[] coefficients, double intercept) {
            this.coefficients = coefficients;
            this.intercept = intercept;
        }
        
        public double predict(FeatureVector feature) {
            return coefficients[0] * feature.dayOfWeek +
                   coefficients[1] * feature.isWeekend +
                   coefficients[2] * feature.month +
                   coefficients[3] * feature.isMonthStart +
                   coefficients[4] * feature.isMonthEnd +
                   intercept;
        }
        
        public double[] getCoefficients() {
            return coefficients;
        }
        
        public double getIntercept() {
            return intercept;
        }
    }
}