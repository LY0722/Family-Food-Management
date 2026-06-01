// AIRecommendService.java
package com.jdzu.familyfood.service;

import com.jdzu.familyfood.entity.*;
import com.jdzu.familyfood.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIRecommendService {

    private final RecipeRepository recipeRepository;
    private final InventoryRepository inventoryRepository;
    private final IngredientRepository ingredientRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;
    private final ConsumptionRecordRepository consumptionRecordRepository;
    private final UserRepository userRepository;
    private final AIPredictService predictService;
    private final AIChatHistoryRepository aiChatHistoryRepository;

    public List<Map<String, Object>> recommendRecipes(Long familyId, Long userId, int limit) {
        List<Inventory> inventoryList = inventoryRepository.findByFamilyId(familyId);
        Set<Long> availableIds = new HashSet<>();
        for (Inventory inv : inventoryList) {
            if (inv.getStatus() != 3 && inv.getQuantity().compareTo(BigDecimal.ZERO) > 0) {
                availableIds.add(inv.getIngredientId());
            }
        }

        List<Inventory> expiringItems = inventoryRepository.findExpiringItems(
                familyId, LocalDate.now(), LocalDate.now().plusDays(3));
        Set<Long> expiringIds = expiringItems.stream()
                .map(Inventory::getIngredientId)
                .collect(Collectors.toSet());

        Set<String> userTags = getUserHealthTags(userId);

        List<Recipe> allRecipes = recipeRepository.findAll();
        List<Map<String, Object>> results = new ArrayList<>();

        for (Recipe recipe : allRecipes) {
            List<RecipeIngredient> required = recipeIngredientRepository.findByRecipeId(recipe.getId());
            if (required.isEmpty()) continue;

            int total = required.size();
            int matched = 0;
            int expiringMatched = 0;

            for (RecipeIngredient ri : required) {
                if (availableIds.contains(ri.getIngredientId())) {
                    matched++;
                    if (expiringIds.contains(ri.getIngredientId())) {
                        expiringMatched++;
                    }
                }
            }

            if (matched == 0) continue;

            double matchScore = (double) matched / total;
            double expiringBonus = expiringMatched * 0.15;
            double healthScore = calculateHealthScore(recipe, userTags);
            double totalScore = matchScore * 0.5 + healthScore * 0.3 + expiringBonus;

            Map<String, Object> rec = new HashMap<>();
            rec.put("recipeId", recipe.getId());
            rec.put("name", recipe.getName());
            rec.put("description", recipe.getDescription());
            rec.put("imageUrl", recipe.getImageUrl());
            rec.put("cookingTime", recipe.getCookingTime());
            rec.put("difficulty", recipe.getDifficulty());
            rec.put("matchScore", (int) (matchScore * 100));
            rec.put("matchedCount", matched);
            rec.put("totalRequired", total);
            rec.put("expiringUsed", expiringMatched);
            rec.put("score", totalScore);
            rec.put("canCook", matchScore >= 0.7);

            results.add(rec);
        }

        results.sort((a, b) -> Double.compare((double) b.get("score"), (double) a.get("score")));
        return results.stream().limit(limit).collect(Collectors.toList());
    }

    /**
     * AI对话功能
     */
    @Transactional
    public String chatWithAI(Long userId, Long familyId, String message) {
        try {
            AIChatHistory userMessage = new AIChatHistory();
            userMessage.setUserId(userId);
            userMessage.setFamilyId(familyId);
            userMessage.setMessageType(AIChatHistory.MessageType.USER);
            userMessage.setContent(message);
            aiChatHistoryRepository.save(userMessage);

            Pageable pageable = PageRequest.of(0, 5);
            List<AIChatHistory> recentChats = aiChatHistoryRepository.findRecentChats(userId, familyId, pageable);
            
            String response = generateAIResponse(userId, familyId, message, recentChats);
            
            AIChatHistory aiResponse = new AIChatHistory();
            aiResponse.setUserId(userId);
            aiResponse.setFamilyId(familyId);
            aiResponse.setMessageType(AIChatHistory.MessageType.ASSISTANT);
            aiResponse.setContent(response);
            aiChatHistoryRepository.save(aiResponse);
            
            return response;
        } catch (Exception e) {
            log.error("AI对话失败，用户ID: {}, 家庭ID: {}, 消息: {}", userId, familyId, message, e);
            throw new RuntimeException("AI对话失败: " + e.getMessage(), e);
        }
    }

    /**
     * 生成AI响应（简化版，实际项目中可以集成真正的AI服务）
     */
    private String generateAIResponse(Long userId, Long familyId, String message, List<AIChatHistory> recentChats) {
        try {
            String lowerMessage = message.toLowerCase();
            
            List<Inventory> inventoryList = inventoryRepository.findByFamilyId(familyId);
            
            List<Inventory> expiringItems = inventoryRepository.findExpiringItems(
                    familyId, LocalDate.now(), LocalDate.now().plusDays(3));
            
            if (lowerMessage.contains("推荐") || lowerMessage.contains("菜") || lowerMessage.contains("食谱")) {
                List<Map<String, Object>> recommendations = recommendRecipes(familyId, userId, 3);
                if (!recommendations.isEmpty()) {
                    StringBuilder response = new StringBuilder("根据您的库存，我推荐这些食谱：\n");
                    for (Map<String, Object> recipe : recommendations) {
                        response.append("• ").append(recipe.get("name")).append("\n");
                    }
                    return response.toString();
                } else {
                    return "抱歉，根据您当前的库存，暂时没有合适的食谱推荐。建议您先补充一些常用食材。";
                }
            } else if (lowerMessage.contains("库存") || lowerMessage.contains("食材")) {
                if (inventoryList.isEmpty()) {
                    return "您的家庭库存目前为空，建议添加一些常用食材。";
                } else {
                    StringBuilder response = new StringBuilder("当前库存概览：\n");
                    inventoryList.stream().limit(5).forEach(item -> {
                        response.append("• ").append(item.getIngredientName())
                               .append("：").append(item.getQuantity()).append(item.getUnit()).append("\n");
                    });
                    if (inventoryList.size() > 5) {
                        response.append("... 还有").append(inventoryList.size() - 5).append("种食材");
                    }
                    return response.toString();
                }
            } else if (lowerMessage.contains("过期") || lowerMessage.contains("快过期")) {
                if (!expiringItems.isEmpty()) {
                    StringBuilder response = new StringBuilder("以下食材即将过期，建议优先使用：\n");
                    expiringItems.forEach(item -> {
                        response.append("• ").append(item.getIngredientName())
                               .append("（过期：").append(item.getExpiryDate()).append("）\n");
                    });
                    return response.toString();
                } else {
                    return "太好了！目前没有即将过期的食材。";
                }
            } else if (lowerMessage.contains("帮助") || lowerMessage.contains("功能")) {
                return "我可以帮您：\n• 推荐食谱\n• 查看库存\n• 提醒过期食材\n• 分析消耗趋势\n• 提供饮食建议\n请告诉我您需要什么帮助？";
            } else {
                return "我是您的家庭食材管理助手！我可以帮您管理库存、推荐食谱、提醒过期食材等。请告诉我您需要什么帮助？";
            }
        } catch (Exception e) {
            log.error("生成AI响应失败", e);
            return "抱歉，我暂时无法理解您的问题。您可以尝试询问关于食谱推荐、库存管理或过期食材的问题。";
        }
    }

    @Transactional
    public Map<String, Object> recordMealAndDeduct(Long familyId, Long recipeId, String mealType) {
        Map<String, Object> result = new HashMap<>();
        List<RecipeIngredient> required = recipeIngredientRepository.findByRecipeId(recipeId);

        List<Inventory> inventoryList = inventoryRepository.findByFamilyId(familyId);
        Map<Long, Inventory> inventoryMap = new HashMap<>();
        for (Inventory inv : inventoryList) {
            inventoryMap.put(inv.getIngredientId(), inv);
        }

        List<Map<String, Object>> deducted = new ArrayList<>();
        List<Map<String, Object>> insufficient = new ArrayList<>();

        for (RecipeIngredient ri : required) {
            Long ingId = ri.getIngredientId();
            BigDecimal needQty = ri.getQuantity() != null ? ri.getQuantity() : BigDecimal.ONE;
            Inventory inv = inventoryMap.get(ingId);

            if (inv != null && inv.getQuantity().compareTo(needQty) >= 0) {
                inv.setQuantity(inv.getQuantity().subtract(needQty));

                LocalDate now = LocalDate.now();
                if (inv.getExpiryDate() != null) {
                    if (inv.getExpiryDate().isBefore(now)) {
                        inv.setStatus((byte) 3);
                    } else if (inv.getExpiryDate().isBefore(now.plusDays(3))) {
                        inv.setStatus((byte) 2);
                    } else {
                        inv.setStatus((byte) 1);
                    }
                }
                inventoryRepository.save(inv);

                ConsumptionRecord record = new ConsumptionRecord();
                record.setFamilyId(familyId);
                record.setIngredientId(ingId);
                record.setQuantity(needQty);
                record.setRecordDate(now);
                record.setMealType(mealType);
                consumptionRecordRepository.save(record);

                Map<String, Object> d = new HashMap<>();
                d.put("ingredientId", ingId);
                d.put("quantity", needQty.doubleValue());
                d.put("remaining", inv.getQuantity().doubleValue());
                deducted.add(d);
            } else {
                Map<String, Object> ins = new HashMap<>();
                ins.put("ingredientId", ingId);
                ins.put("required", needQty.doubleValue());
                ins.put("available", inv != null ? inv.getQuantity().doubleValue() : 0);
                insufficient.add(ins);
            }
        }

        result.put("success", insufficient.isEmpty());
        result.put("deducted", deducted);
        result.put("insufficient", insufficient);
        result.put("mealType", mealType);
        result.put("date", LocalDate.now());
        result.put("message", insufficient.isEmpty() ? "记录成功" : "部分食材不足");

        return result;
    }

    private Set<String> getUserHealthTags(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty() || userOpt.get().getHealthTags() == null) {
            return new HashSet<>();
        }
        String tagsJson = userOpt.get().getHealthTags();
        Set<String> tags = new HashSet<>();
        try {
            String cleaned = tagsJson.trim();
            if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
                String content = cleaned.substring(1, cleaned.length() - 1);
                for (String tag : content.split(",")) {
                    String t = tag.trim().replace("\"", "");
                    if (!t.isEmpty()) tags.add(t);
                }
            }
        } catch (Exception e) {
        }
        return tags;
    }

    private double calculateHealthScore(Recipe recipe, Set<String> userTags) {
        if (userTags.isEmpty()) return 0.3;
        if (recipe.getHealthTags() == null) return 0.3;
        String tagsJson = recipe.getHealthTags();
        Set<String> recipeTags = new HashSet<>();
        try {
            String cleaned = tagsJson.trim();
            if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
                String content = cleaned.substring(1, cleaned.length() - 1);
                for (String tag : content.split(",")) {
                    String t = tag.trim().replace("\"", "");
                    if (!t.isEmpty()) recipeTags.add(t);
                }
            }
        } catch (Exception e) {
        }
        if (recipeTags.isEmpty()) return 0.3;
        long match = recipeTags.stream().filter(userTags::contains).count();
        return (double) match / Math.max(userTags.size(), 1);
    }
}