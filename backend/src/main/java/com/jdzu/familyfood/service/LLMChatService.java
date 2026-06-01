package com.jdzu.familyfood.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.jdzu.familyfood.config.LLMConfig;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class LLMChatService {

    private final LLMConfig llmConfig;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 发送消息到LLM
     */
    public String chat(String userMessage, List<ChatMessage> conversationHistory, 
                    Map<String, Object> context) {
        try {
            if (!llmConfig.isConfigured()) {
                log.warn("LLM未配置，使用备用响应");
                return getFallbackResponse(userMessage, context);
            }

            log.info("发送消息到LLM提供商: {}", llmConfig.getProvider());

            // 1. 构建消息列表
            List<ChatMessage> messages = buildMessages(userMessage, conversationHistory, context);

            // 2. 根据不同的提供商构建请求
            LLMRequest request = buildRequest(messages);

            // 3. 发送请求
            LLMResponse response = sendRequest(request);

            // 4. 解析响应
            return parseResponse(response);

        } catch (Exception e) {
            log.error("LLM调用失败", e);
            return getFallbackResponse(userMessage, context);
        }
    }

    /**
     * 构建消息列表
     */
    private List<ChatMessage> buildMessages(String userMessage, 
                                         List<ChatMessage> conversationHistory,
                                         Map<String, Object> context) {
        List<ChatMessage> messages = new ArrayList<>();

        // 1. 添加系统提示词
        messages.add(buildSystemPrompt(context));

        // 2. 添加对话历史（最近10条）
        if (conversationHistory != null && !conversationHistory.isEmpty()) {
            int start = Math.max(0, conversationHistory.size() - 10);
            messages.addAll(conversationHistory.subList(start, conversationHistory.size()));
        }

        // 3. 添加用户消息
        messages.add(new ChatMessage("user", userMessage));

        return messages;
    }

    /**
     * 构建系统提示词
     */
    private ChatMessage buildSystemPrompt(Map<String, Object> context) {
        String systemPrompt = """
            你是"家庭食品管家"AI助手，专门帮助用户管理家庭食材、推荐健康食谱、减少食物浪费。
            
            你的核心功能：
            1. 🍳 智能食谱推荐：根据用户库存、健康标签、家庭成员数量推荐合适的食谱
            2. 📊 消耗趋势分析：分析食材消耗规律，提供采购建议
            3. ⏰ 过期预警提醒：提醒用户即将过期的食材，并提供使用建议
            4. 🛒 智能采购清单：根据消耗预测生成采购清单
            5. 💡 烹饪技巧指导：提供食材搭配、烹饪方法、营养搭配建议
            6. 🥗 健康饮食建议：根据用户健康标签提供个性化营养建议
            
            回答要求：
            - 语气亲切友好，像家人一样关心
            - 回答简洁实用，重点突出
            - 基于用户实际库存和健康需求回答
            - 主动询问用户偏好和需求
            - 提供可操作的具体建议
            - 使用emoji让回答更生动
            
            特殊场景处理：
            - 用户询问"今天吃什么"时，优先推荐能消耗快过期食材的食谱
            - 用户询问"采购建议"时，结合库存和消耗趋势给出清单
            - 用户询问"健康食谱"时，严格遵循用户的健康标签（如低盐、高蛋白等）
            - 用户询问"过期食材"时，提供具体的使用建议和保存方法
            """;

        log.info("构建系统提示词，context: {}", context);

        if (context != null && !context.isEmpty()) {
            systemPrompt += "\n\n当前用户情况：\n";
            
            if (context.containsKey("inventory")) {
                String inventoryStr = formatInventory(context.get("inventory"));
                systemPrompt += "📦 库存信息：" + inventoryStr + "\n";
                log.info("添加库存信息: {}", inventoryStr);
            }
            if (context.containsKey("healthTags")) {
                systemPrompt += "🏷️ 健康标签：" + context.get("healthTags") + "\n";
                log.info("添加健康标签: {}", context.get("healthTags"));
            }
            if (context.containsKey("familyMembers")) {
                systemPrompt += "👨‍👩‍👧‍👦 家庭成员：" + context.get("familyMembers") + "人\n";
                log.info("添加家庭成员: {}", context.get("familyMembers"));
            }
            if (context.containsKey("preferences")) {
                systemPrompt += "🍽️ 饮食偏好：" + context.get("preferences") + "\n";
            }
            if (context.containsKey("allergies")) {
                systemPrompt += "⚠️ 过敏信息：" + context.get("allergies") + "\n";
            }
        } else {
            log.warn("context为空，无法添加用户信息");
        }

        return new ChatMessage("system", systemPrompt);
    }

    /**
     * 格式化库存信息
     */
    private String formatInventory(Object inventory) {
        if (inventory == null) {
            return "暂无库存信息";
        }
        
        try {
            if (inventory instanceof java.util.List) {
                java.util.List<?> items = (java.util.List<?>) inventory;
                if (items.isEmpty()) {
                    return "暂无库存";
                }
                
                StringBuilder sb = new StringBuilder();
                for (Object item : items) {
                    if (item instanceof java.util.Map) {
                        java.util.Map<?, ?> map = (java.util.Map<?, ?>) item;
                        String name = map.get("ingredientName") != null ? 
                            map.get("ingredientName").toString() : "未知食材";
                        Object quantity = map.get("quantity");
                        sb.append(name).append("(").append(quantity).append(")、");
                    }
                }
                return sb.substring(0, sb.length() - 1);
            }
        } catch (Exception e) {
            log.error("格式化库存信息失败", e);
        }
        
        return inventory.toString();
    }

    /**
     * 构建LLM请求
     */
    private LLMRequest buildRequest(List<ChatMessage> messages) {
        LLMRequest request = new LLMRequest();
        request.setModel(llmConfig.getModel());
        request.setMessages(messages);
        request.setTemperature(llmConfig.getTemperature());
        request.setMaxTokens(llmConfig.getMaxTokens());
        return request;
    }

    /**
     * 发送请求到LLM API
     */
    private LLMResponse sendRequest(LLMRequest request) {
        // 设置请求头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(llmConfig.getApiKey());

        HttpEntity<LLMRequest> entity = new HttpEntity<>(request, headers);

        log.info("发送LLM请求: {}", llmConfig.getApiUrl());
        log.debug("请求体: {}", request);

        // 发送请求
        ResponseEntity<LLMResponse> response = restTemplate.exchange(
                llmConfig.getApiUrl(),
                HttpMethod.POST,
                entity,
                LLMResponse.class
        );

        log.info("LLM响应状态: {}", response.getStatusCode());
        log.debug("响应体: {}", response.getBody());

        return response.getBody();
    }

    /**
     * 解析LLM响应
     */
    private String parseResponse(LLMResponse response) {
        if (response == null) {
            log.error("LLM响应为null");
            throw new RuntimeException("LLM响应为空");
        }
        
        if (response.getChoices() == null || response.getChoices().isEmpty()) {
            log.error("LLM响应choices为空: {}", response);
            throw new RuntimeException("LLM响应为空");
        }

        ChatMessage message = response.getChoices().get(0).getMessage();
        if (message == null || message.getContent() == null) {
            log.error("LLM响应消息为空: {}", message);
            throw new RuntimeException("LLM响应消息为空");
        }

        String content = message.getContent();
        log.info("LLM返回内容: {}", content);
        return content;
    }

    /**
     * 获取备用响应（当LLM调用失败时）
     */
    private String getFallbackResponse(String userMessage, Map<String, Object> context) {
        // 简单的关键词匹配，提供基础回复
        String lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.contains("推荐") || lowerMessage.contains("食谱")) {
            return "根据您的库存，我推荐您尝试一些简单的家常菜。您可以查看食谱推荐页面获取更多详细信息。";
        } else if (lowerMessage.contains("过期") || lowerMessage.contains("即将过期")) {
            return "请注意检查您的库存，有些食材可能即将过期。建议优先使用这些食材制作料理。";
        } else if (lowerMessage.contains("采购") || lowerMessage.contains("买")) {
            return "建议您根据库存情况和家庭需求制定采购清单。我可以帮您分析哪些食材需要补充。";
        } else if (lowerMessage.contains("健康") || lowerMessage.contains("营养")) {
            return "均衡饮食很重要！建议您多摄入蔬菜水果，适量蛋白质，控制油盐糖的摄入。";
        } else {
            return "您好！我是您的家庭食品管理助手。我可以帮您管理库存、推荐食谱、分析消耗趋势等。有什么我可以帮您的吗？";
        }
    }

    /**
     * 流式对话（支持打字机效果）
     */
    public List<String> chatStream(String userMessage, List<ChatMessage> conversationHistory,
                                  Map<String, Object> context) {
        try {
            // 1. 构建消息列表
            List<ChatMessage> messages = buildMessages(userMessage, conversationHistory, context);

            // 2. 构建请求（启用流式输出）
            LLMRequest request = buildRequest(messages);
            request.setStream(true);

            // 3. 发送请求（这里简化，实际需要处理流式响应）
            String fullResponse = chat(userMessage, conversationHistory, context);

            // 4. 模拟流式输出（实际应该从API获取流式数据）
            return simulateStreamOutput(fullResponse);

        } catch (Exception e) {
            log.error("流式对话失败", e);
            return Collections.singletonList(getFallbackResponse(userMessage, context));
        }
    }

    /**
     * 模拟流式输出
     */
    private List<String> simulateStreamOutput(String text) {
        List<String> chunks = new ArrayList<>();
        int chunkSize = 10; // 每次返回10个字符

        for (int i = 0; i < text.length(); i += chunkSize) {
            int end = Math.min(i + chunkSize, text.length());
            chunks.add(text.substring(i, end));
        }

        return chunks;
    }

    // ========== 数据类 ==========

    @Data
    public static class ChatMessage {
        private String role;
        private String content;

        public ChatMessage() {
        }

        public ChatMessage(String role, String content) {
            this.role = role;
            this.content = content;
        }
    }

    @Data
    private static class LLMRequest {
        private String model;
        private List<ChatMessage> messages;
        private double temperature;
        private int maxTokens;
        private boolean stream = false;
    }

    @Data
    private static class LLMResponse {
        private String id;
        private String object;
        private long created;
        private String model;
        @JsonProperty("choices")
        private List<Choice> choices;
        private Usage usage;

        @Data
        public static class Choice {
            private int index;
            @JsonProperty("message")
            private ChatMessage message;
            @JsonProperty("finish_reason")
            private String finishReason;
        }

        @Data
        public static class Usage {
            @JsonProperty("prompt_tokens")
            private int promptTokens;
            @JsonProperty("completion_tokens")
            private int completionTokens;
            @JsonProperty("total_tokens")
            private int totalTokens;
        }
    }
}