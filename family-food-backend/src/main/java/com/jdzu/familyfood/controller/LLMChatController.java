package com.jdzu.familyfood.controller;

import com.jdzu.familyfood.entity.Family;
import com.jdzu.familyfood.entity.Inventory;
import com.jdzu.familyfood.entity.User;
import com.jdzu.familyfood.service.FamilyService;
import com.jdzu.familyfood.service.InventoryService;
import com.jdzu.familyfood.service.LLMChatService;
import com.jdzu.familyfood.service.UserService;
import com.jdzu.familyfood.utils.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/llm-chat")
@RequiredArgsConstructor
public class LLMChatController {

    private final LLMChatService llmChatService;
    private final UserService userService;
    private final InventoryService inventoryService;
    private final FamilyService familyService;

    /**
     * 发送消息（一次性回复）
     * POST /llm-chat/send
     * 
     * 请求体：
     * {
     *   "message": "今天吃什么好？",
     *   "conversationHistory": [...], // 可选，对话历史
     *   "context": { // 可选，上下文信息
     *     "inventory": [...],
     *     "healthTags": ["低盐", "高蛋白"],
     *     "familyMembers": 3
     *   }
     * }
     * 
     * 响应：
     * {
     *   "code": 200,
     *   "message": "success",
     *   "data": {
     *     "response": "根据您的库存，我推荐您尝试番茄炒蛋...",
     *     "timestamp": 1234567890123
     *   }
     * }
     */
    @PostMapping("/send")
    public ApiResponse sendMessage(@RequestBody Map<String, Object> request) {
        try {
            String message = (String) request.get("message");
            
            if (message == null || message.trim().isEmpty()) {
                return ApiResponse.error("消息不能为空");
            }

            Long userId = null;
            Long familyId = null;
            
            if (request.containsKey("userId")) {
                userId = Long.valueOf(request.get("userId").toString());
            }
            if (request.containsKey("familyId")) {
                familyId = Long.valueOf(request.get("familyId").toString());
            }

            @SuppressWarnings("unchecked")
            List<LLMChatService.ChatMessage> conversationHistory = 
                (List<LLMChatService.ChatMessage>) request.get("conversationHistory");

            Map<String, Object> context = buildContext(userId, familyId);

            log.info("用户消息: {}, 用户ID: {}, 家庭ID: {}", message, userId, familyId);

            String response = llmChatService.chat(message, conversationHistory, context);

            Map<String, Object> result = new HashMap<>();
            result.put("response", response);
            result.put("timestamp", System.currentTimeMillis());
            result.put("context", context);

            return ApiResponse.ok(result);

        } catch (Exception e) {
            log.error("发送消息失败", e);
            return ApiResponse.error("发送消息失败: " + e.getMessage());
        }
    }

    /**
     * 自动构建上下文信息
     */
    private Map<String, Object> buildContext(Long userId, Long familyId) {
        Map<String, Object> context = new HashMap<>();

        log.info("开始构建context，userId: {}, familyId: {}", userId, familyId);

        if (userId != null) {
            try {
                User user = userService.getUserById(userId);
                if (user != null) {
                    context.put("userId", userId);
                    
                    if (user.getHealthTags() != null && !user.getHealthTags().trim().isEmpty()) {
                        context.put("healthTags", user.getHealthTags());
                        log.info("获取到健康标签: {}", user.getHealthTags());
                    }
                    
                    if (familyId == null && user.getCurrentFamilyId() != null) {
                        familyId = user.getCurrentFamilyId();
                        log.info("从用户信息中获取到familyId: {}", familyId);
                    }
                } else {
                    log.warn("未找到用户，userId: {}", userId);
                }
            } catch (Exception e) {
                log.warn("获取用户信息失败: {}", e.getMessage());
            }
        } else {
            log.warn("userId为空");
        }

        if (familyId != null) {
            try {
                List<Inventory> inventoryList = inventoryService.getFamilyInventory(familyId);
                if (!inventoryList.isEmpty()) {
                    List<Map<String, Object>> inventory = inventoryList.stream().map(item -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("ingredientId", item.getIngredientId());
                        map.put("ingredientName", item.getIngredientName());
                        map.put("quantity", item.getQuantity());
                        map.put("unit", item.getUnit());
                        map.put("expiryDate", item.getExpiryDate());
                        return map;
                    }).toList();
                    context.put("inventory", inventory);
                    log.info("获取到库存信息，数量: {}", inventory.size());
                } else {
                    log.warn("库存为空，familyId: {}", familyId);
                }

                Family family = familyService.getFamilyById(familyId);
                if (family != null) {
                    context.put("familyId", familyId);
                    context.put("familyName", family.getName());
                    log.info("获取到家庭信息: {}", family.getName());
                }
            } catch (Exception e) {
                log.warn("获取库存信息失败: {}", e.getMessage());
            }
        } else {
            log.warn("familyId为空");
        }

        log.info("构建完成，context: {}", context);
        return context;
    }

    /**
     * 流式对话（支持打字机效果）
     * POST /llm-chat/stream
     * 
     * 响应：
     * {
     *   "code": 200,
     *   "message": "success",
     *   "data": {
     *     "chunks": ["根据", "您的", "库存", "..."],
     *     "fullResponse": "根据您的库存，我推荐您尝试番茄炒蛋...",
     *     "timestamp": 1234567890123
     *   }
     * }
     */
    @PostMapping("/stream")
    public ApiResponse streamChat(@RequestBody Map<String, Object> request) {
        try {
            String message = (String) request.get("message");
            
            if (message == null || message.trim().isEmpty()) {
                return ApiResponse.error("消息不能为空");
            }

            Long userId = null;
            Long familyId = null;
            
            if (request.containsKey("userId")) {
                userId = Long.valueOf(request.get("userId").toString());
            }
            if (request.containsKey("familyId")) {
                familyId = Long.valueOf(request.get("familyId").toString());
            }

            @SuppressWarnings("unchecked")
            List<LLMChatService.ChatMessage> conversationHistory = 
                (List<LLMChatService.ChatMessage>) request.get("conversationHistory");

            Map<String, Object> context = buildContext(userId, familyId);

            log.info("流式对话 - 用户消息: {}, 用户ID: {}, 家庭ID: {}", message, userId, familyId);

            List<String> chunks = llmChatService.chatStream(message, conversationHistory, context);
            
            String fullResponse = String.join("", chunks);

            Map<String, Object> result = new HashMap<>();
            result.put("chunks", chunks);
            result.put("fullResponse", fullResponse);
            result.put("timestamp", System.currentTimeMillis());
            result.put("context", context);

            return ApiResponse.ok(result);

        } catch (Exception e) {
            log.error("流式对话失败", e);
            return ApiResponse.error("流式对话失败: " + e.getMessage());
        }
    }

    /**
     * 清除对话历史
     * POST /llm-chat/clear-history
     * 
     * 前端调用后清除本地存储的对话历史
     */
    @PostMapping("/clear-history")
    public ApiResponse clearHistory() {
        log.info("清除对话历史");
        return ApiResponse.success("对话历史已清除");
    }

    /**
     * 获取对话建议（快捷回复）
     * GET /llm-chat/suggestions
     * 
     * 响应：
     * {
     *   "code": 200,
     *   "message": "success",
     *   "data": [
     *     "今天吃什么好？",
     *     "帮我推荐一些食谱",
     *     "检查一下即将过期的食材",
     *     "生成采购清单"
     *   ]
     * }
     */
    @GetMapping("/suggestions")
    public ApiResponse getChatSuggestions() {
        List<String> suggestions = List.of(
            "今天吃什么好？",
            "帮我推荐一些食谱",
            "检查一下即将过期的食材",
            "生成采购清单",
            "有什么健康食谱推荐？",
            "如何减少食物浪费？",
            "根据我的库存推荐菜谱",
            "分析我的消耗趋势"
        );

        return ApiResponse.ok(suggestions);
    }

    /**
     * 测试LLM连接
     * GET /llm-chat/test
     */
    @GetMapping("/test")
    public ApiResponse testConnection() {
        try {
            String testMessage = "你好，请简单介绍一下你自己。";
            String response = llmChatService.chat(testMessage, null, null);

            Map<String, Object> result = new java.util.HashMap<>();
            result.put("testMessage", testMessage);
            result.put("response", response);
            result.put("status", "connected");

            return ApiResponse.ok(result);

        } catch (Exception e) {
            log.error("LLM连接测试失败", e);
            return ApiResponse.error("LLM连接失败: " + e.getMessage());
        }
    }
}