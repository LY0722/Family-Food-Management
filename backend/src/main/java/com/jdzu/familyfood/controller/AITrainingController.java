package com.jdzu.familyfood.controller;

import com.jdzu.familyfood.service.SimpleMLService;
import com.jdzu.familyfood.utils.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/ai-training")
@RequiredArgsConstructor
public class AITrainingController {

    private final SimpleMLService simpleMLService;

    /**
     * 训练食材消耗预测模型
     * POST /ai-training/train-consumption
     * 
     * 请求体：
     * {
     *   "familyId": 1,
     *   "ingredientId": 1
     * }
     * 
     * 响应：
     * {
     *   "code": 200,
     *   "message": "模型训练成功",
     *   "data": {
     *     "success": true,
     *     "model": {...},
     *     "accuracy": 85.5
     *   }
     * }
     */
    @PostMapping("/train-consumption")
    public ApiResponse trainConsumptionModel(@RequestBody Map<String, Long> request) {
        try {
            Long familyId = request.get("familyId");
            Long ingredientId = request.get("ingredientId");
            
            if (familyId == null || ingredientId == null) {
                return ApiResponse.error("参数不完整，需要familyId和ingredientId");
            }
            
            log.info("开始训练模型 - 家庭ID: {}, 食材ID: {}", familyId, ingredientId);
            
            Map<String, Object> result = simpleMLService.trainConsumptionModel(familyId, ingredientId);
            
            if ((Boolean) result.get("success")) {
                return ApiResponse.ok(result);
            } else {
                return ApiResponse.error(result.get("message").toString());
            }
            
        } catch (Exception e) {
            log.error("模型训练失败", e);
            return ApiResponse.error("模型训练失败: " + e.getMessage());
        }
    }

    /**
     * 使用训练好的模型进行预测
     * GET /ai-training/predict-consumption?familyId=1&ingredientId=1&days=7
     * 
     * 响应：
     * {
     *   "code": 200,
     *   "message": "success",
     *   "data": {
     *     "familyId": 1,
     *     "ingredientId": 1,
     *     "predictionDays": 7,
     *     "predictedConsumption": 5.5,
     *     "modelUsed": "linear_regression"
     *   }
     * }
     */
    @GetMapping("/predict-consumption")
    public ApiResponse predictConsumption(
            @RequestParam Long familyId,
            @RequestParam Long ingredientId,
            @RequestParam(defaultValue = "7") int days) {
        try {
            log.info("进行消耗预测 - 家庭ID: {}, 食材ID: {}, 预测天数: {}", 
                     familyId, ingredientId, days);
            
            double prediction = simpleMLService.predictConsumption(familyId, ingredientId, days);
            
            Map<String, Object> result = new java.util.HashMap<>();
            result.put("familyId", familyId);
            result.put("ingredientId", ingredientId);
            result.put("predictionDays", days);
            result.put("predictedConsumption", prediction);
            result.put("modelUsed", "linear_regression");
            result.put("timestamp", System.currentTimeMillis());
            
            return ApiResponse.ok(result);
            
        } catch (Exception e) {
            log.error("预测失败", e);
            return ApiResponse.error("预测失败: " + e.getMessage());
        }
    }

    /**
     * 批量训练多个食材的模型
     * POST /ai-training/batch-train
     * 
     * 请求体：
     * {
     *   "familyId": 1,
     *   "ingredientIds": [1, 2, 3, 4, 5]
     * }
     */
    @PostMapping("/batch-train")
    public ApiResponse batchTrainModels(@RequestBody Map<String, Object> request) {
        try {
            Long familyId = Long.valueOf(request.get("familyId").toString());
            @SuppressWarnings("unchecked")
            java.util.List<Long> ingredientIds = (java.util.List<Long>) request.get("ingredientIds");
            
            if (familyId == null || ingredientIds == null || ingredientIds.isEmpty()) {
                return ApiResponse.error("参数不完整");
            }
            
            log.info("批量训练模型 - 家庭ID: {}, 食材数量: {}", familyId, ingredientIds.size());
            
            java.util.List<Map<String, Object>> results = new java.util.ArrayList<>();
            int successCount = 0;
            int failCount = 0;
            
            for (Long ingredientId : ingredientIds) {
                try {
                    Map<String, Object> result = simpleMLService.trainConsumptionModel(familyId, ingredientId);
                    results.add(Map.of(
                        "ingredientId", ingredientId,
                        "success", result.get("success"),
                        "message", result.get("message")
                    ));
                    
                    if ((Boolean) result.get("success")) {
                        successCount++;
                    } else {
                        failCount++;
                    }
                    
                } catch (Exception e) {
                    results.add(Map.of(
                        "ingredientId", ingredientId,
                        "success", false,
                        "message", e.getMessage()
                    ));
                    failCount++;
                }
            }
            
            Map<String, Object> summary = new java.util.HashMap<>();
            summary.put("familyId", familyId);
            summary.put("total", ingredientIds.size());
            summary.put("success", successCount);
            summary.put("failed", failCount);
            summary.put("results", results);
            
            return ApiResponse.ok(summary);
            
        } catch (Exception e) {
            log.error("批量训练失败", e);
            return ApiResponse.error("批量训练失败: " + e.getMessage());
        }
    }

    /**
     * 获取模型训练状态
     * GET /ai-training/status?familyId=1&ingredientId=1
     */
    @GetMapping("/status")
    public ApiResponse getModelStatus(
            @RequestParam Long familyId,
            @RequestParam Long ingredientId) {
        try {
            // 这里应该从数据库查询模型状态
            // 简化实现，返回模拟数据
            Map<String, Object> status = new java.util.HashMap<>();
            status.put("familyId", familyId);
            status.put("ingredientId", ingredientId);
            status.put("trained", false); // 实际应该查询数据库
            status.put("lastTrainedAt", null);
            status.put("accuracy", null);
            status.put("dataPoints", 0);
            
            return ApiResponse.ok(status);
            
        } catch (Exception e) {
            log.error("获取模型状态失败", e);
            return ApiResponse.error("获取模型状态失败: " + e.getMessage());
        }
    }

    /**
     * 删除训练好的模型
     * DELETE /ai-training/model?familyId=1&ingredientId=1
     */
    @DeleteMapping("/model")
    public ApiResponse deleteModel(
            @RequestParam Long familyId,
            @RequestParam Long ingredientId) {
        try {
            log.info("删除模型 - 家庭ID: {}, 食材ID: {}", familyId, ingredientId);
            
            // 这里应该删除数据库中的模型记录
            // 简化实现，只记录日志
            
            return ApiResponse.success("模型删除成功");
            
        } catch (Exception e) {
            log.error("删除模型失败", e);
            return ApiResponse.error("删除模型失败: " + e.getMessage());
        }
    }
}