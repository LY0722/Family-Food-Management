package com.jdzu.familyfood.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 微信登录配置类
 */
@Data
@Component
@ConfigurationProperties(prefix = "wechat.login")
public class WeChatLoginConfig {
    private String appId;
    private String appSecret;
    private String accessTokenUrl;
    private String userInfoUrl;
    private String grantType;
}