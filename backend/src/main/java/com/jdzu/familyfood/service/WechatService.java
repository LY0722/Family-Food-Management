package com.jdzu.familyfood.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class WechatService {

    @Value("${wechat.appid:}")
    private String appid;

    @Value("${wechat.secret:}")
    private String secret;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 通过code获取openid
     */
    public String getOpenId(String code) {
        // 如果没有配置微信appid，返回测试openid（开发环境使用）
        if (appid == null || appid.isEmpty() || "your_wechat_appid".equals(appid)) {
            log.warn("微信配置未设置，使用测试模式");
            return "test_openid_" + code;
        }

        String url = String.format(
                "https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
                appid, secret, code
        );

        try {
            String response = restTemplate.getForObject(url, String.class);
            log.info("微信接口返回: {}", response);

            JsonNode json = objectMapper.readTree(response);
            JsonNode openidNode = json.get("openid");

            if (openidNode == null) {
                JsonNode errcodeNode = json.get("errcode");
                JsonNode errmsgNode = json.get("errmsg");
                log.error("获取openid失败: errcode={}, errmsg={}",
                        errcodeNode != null ? errcodeNode.asInt() : "unknown",
                        errmsgNode != null ? errmsgNode.asText() : "unknown");
                return null;
            }
            return openidNode.asText();
        } catch (Exception e) {
            log.error("调用微信接口失败", e);
            return null;
        }
    }

    /**
     * 通过code获取手机号（需要用户授权）
     */
    public String getPhoneNumber(String code) {
        // 如果没有配置微信appid，返回测试手机号（开发环境使用）
        if (appid == null || appid.isEmpty() || "your_wechat_appid".equals(appid)) {
            log.warn("微信配置未设置，使用测试模式，返回模拟手机号");
            return "13800138000";
        }

        String accessToken = getAccessToken();
        if (accessToken == null) {
            log.error("获取access_token失败");
            return null;
        }

        String url = String.format(
                "https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=%s",
                accessToken
        );

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("code", code);

        try {
            String response = restTemplate.postForObject(url, requestBody, String.class);
            log.info("获取手机号接口返回: {}", response);

            JsonNode json = objectMapper.readTree(response);
            int errcode = json.has("errcode") ? json.get("errcode").asInt() : -1;

            if (errcode == 0) {
                JsonNode phoneInfo = json.get("phone_info");
                if (phoneInfo != null && phoneInfo.has("purePhoneNumber")) {
                    return phoneInfo.get("purePhoneNumber").asText();
                }
            } else {
                JsonNode errmsgNode = json.get("errmsg");
                log.error("获取手机号失败: errcode={}, errmsg={}", errcode,
                        errmsgNode != null ? errmsgNode.asText() : "unknown");
            }
            return null;
        } catch (Exception e) {
            log.error("获取手机号异常", e);
            return null;
        }
    }

    /**
     * 获取access_token
     */
    private String getAccessToken() {
        String url = String.format(
                "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s",
                appid, secret
        );

        try {
            String response = restTemplate.getForObject(url, String.class);
            JsonNode json = objectMapper.readTree(response);
            JsonNode accessTokenNode = json.get("access_token");

            if (accessTokenNode == null) {
                JsonNode errmsgNode = json.get("errmsg");
                log.error("获取access_token失败: {}",
                        errmsgNode != null ? errmsgNode.asText() : "unknown");
            }
            return accessTokenNode != null ? accessTokenNode.asText() : null;
        } catch (Exception e) {
            log.error("获取access_token异常", e);
            return null;
        }
    }
}