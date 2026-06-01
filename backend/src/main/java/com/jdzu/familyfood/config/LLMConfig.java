package com.jdzu.familyfood.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

/**
 * LLM配置类
 * 用于加载和管理LLM相关配置
 */
@Data
@Configuration
@PropertySource("classpath:llm-config.properties")
public class LLMConfig {

    @Value("${llm.provider:deepseek}")
    private String provider;

    @Value("${llm.api.key:}")
    private String apiKey;

    @Value("${llm.api.url:}")
    private String apiUrl;

    @Value("${llm.model:deepseek-chat}")
    private String model;

    @Value("${llm.temperature:0.7}")
    private double temperature;

    @Value("${llm.maxTokens:1000}")
    private int maxTokens;

    @Value("${llm.timeout:30000}")
    private int timeout;

    /**
     * 检查配置是否完整
     */
    public boolean isConfigured() {
        return apiKey != null && !apiKey.isEmpty() && 
               apiUrl != null && !apiUrl.isEmpty();
    }

    /**
     * 获取API URL（根据提供商自动选择）
     */
    public String getApiUrl() {
        if (apiUrl != null && !apiUrl.isEmpty()) {
            return apiUrl;
        }

        // 根据提供商返回默认URL
        switch (provider.toLowerCase()) {
            case "deepseek":
                return "https://api.deepseek.com/v1/chat/completions";
            case "doubao":
                return "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
            case "openai":
                return "https://api.openai.com/v1/chat/completions";
            case "qwen":
                return "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";
            case "wenxin":
                return "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions";
            default:
                return "https://api.deepseek.com/v1/chat/completions";
        }
    }

    /**
     * 获取模型名称（根据提供商自动选择）
     */
    public String getModel() {
        if (model != null && !model.isEmpty()) {
            return model;
        }

        // 根据提供商返回默认模型
        switch (provider.toLowerCase()) {
            case "deepseek":
                return "deepseek-chat";
            case "doubao":
                return "ep-20241201163754-h7v9m";
            case "openai":
                return "gpt-3.5-turbo";
            case "qwen":
                return "qwen-turbo";
            case "wenxin":
                return "ernie-bot-turbo";
            default:
                return "deepseek-chat";
        }
    }
}