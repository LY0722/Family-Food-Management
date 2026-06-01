// AIController.java
package com.jdzu.familyfood.controller;

import com.jdzu.familyfood.service.AIPredictService;
import com.jdzu.familyfood.service.AIRecommendService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIPredictService aiPredictService;
    private final AIRecommendService aiRecommendService;

    @GetMapping("/predict-consumption")
    public Map<String, Object> predictConsumption(
            @RequestParam Long familyId,
            @RequestParam Long ingredientId,
            @RequestParam(defaultValue = "7") int days) {
        Map<String, Object> result = new HashMap<>();
        try {
            double prediction = aiPredictService.predictConsumption(familyId, ingredientId, days);
            result.put("code", 200);
            result.put("message", "success");
            result.put("data", Map.of(
                "familyId", familyId,
                "ingredientId", ingredientId,
                "predictionDays", days,
                "predictedConsumption", prediction
            ));
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", e.getMessage());
        }
        return result;
    }

    @GetMapping("/smart-notifications/expiring")
    public Map<String, Object> getSmartExpiringNotifications(@RequestParam Long familyId) {
        Map<String, Object> result = new HashMap<>();
        try {
            var notifications = aiPredictService.getExpiringNotifications(familyId);
            result.put("code", 200);
            result.put("message", "success");
            result.put("data", Map.of(
                "familyId", familyId,
                "notifications", notifications,
                "count", notifications.size()
            ));
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", e.getMessage());
        }
        return result;
    }

    @GetMapping("/recommend-recipes")
    public Map<String, Object> recommendRecipes(
            @RequestParam Long familyId,
            @RequestParam Long userId,
            @RequestParam(defaultValue = "5") int limit) {
        Map<String, Object> result = new HashMap<>();
        try {
            var recommendations = aiRecommendService.recommendRecipes(familyId, userId, limit);
            result.put("code", 200);
            result.put("message", "success");
            result.put("data", recommendations);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", e.getMessage());
        }
        return result;
    }

    @PostMapping("/record-meal")
    public Map<String, Object> recordMeal(
            @RequestParam Long familyId,
            @RequestParam Long recipeId,
            @RequestParam String mealType) {
        Map<String, Object> result = new HashMap<>();
        try {
            var recordResult = aiRecommendService.recordMealAndDeduct(familyId, recipeId, mealType);
            result.put("code", 200);
            result.put("message", "success");
            result.put("data", recordResult);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", e.getMessage());
        }
        return result;
    }

    @GetMapping("/shopping-list")
    public Map<String, Object> generateShoppingList(@RequestParam Long familyId) {
        Map<String, Object> result = new HashMap<>();
        try {
            var shoppingList = aiPredictService.generateShoppingList(familyId);
            result.put("code", 200);
            result.put("message", "success");
            result.put("data", shoppingList);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", e.getMessage());
        }
        return result;
    }
}