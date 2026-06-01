package com.jdzu.familyfood.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/")
public class ApiDocController {

    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> result = new HashMap<>();
        result.put("status", "UP");
        result.put("message", "服务正常运行");
        return result;
    }

    @GetMapping("/docs")
    public Map<String, Object> apiDocs() {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> apis = new ArrayList<>();

        // ========== 用户管理 ==========
        apis.add(api("POST", "/user/wechat-login", "微信一键登录"));
        apis.add(api("POST", "/user/login", "手机号登录"));
        apis.add(api("POST", "/user/send-code", "发送验证码"));
        apis.add(api("POST", "/user/register", "用户注册"));
        apis.add(api("GET", "/user/current", "获取当前用户"));
        apis.add(api("PUT", "/user/profile", "更新用户信息"));
        apis.add(api("GET", "/user/health-tags", "获取健康标签"));
        apis.add(api("PUT", "/user/health-tags", "更新健康标签"));
        apis.add(api("GET", "/user/notification-settings", "获取通知设置"));
        apis.add(api("PUT", "/user/notification-settings", "更新通知设置"));
        apis.add(api("POST", "/user/avatar", "上传头像"));
        apis.add(api("POST", "/user/logout", "退出登录"));
        apis.add(api("GET", "/user/test-connection", "测试连接"));

        // ========== 家庭管理 ==========
        apis.add(api("POST", "/family/create", "创建家庭"));
        apis.add(api("POST", "/family/join", "加入家庭"));
        apis.add(api("GET", "/family/{familyId}/members", "家庭成员"));
        apis.add(api("GET", "/family/{familyId}/info", "获取家庭信息"));
        apis.add(api("POST", "/family/{familyId}/leave", "退出家庭"));
        apis.add(api("POST", "/family/switch", "切换当前家庭"));
        apis.add(api("DELETE", "/family/{familyId}/member/{memberId}", "移除成员"));

        // ========== 库存管理 ==========
        apis.add(api("GET", "/inventory/family/{familyId}", "库存列表"));
        apis.add(api("POST", "/inventory/add", "添加食材"));
        apis.add(api("POST", "/inventory/consume", "消耗食材"));
        apis.add(api("GET", "/inventory/family/{familyId}/expiring", "即将过期"));
        apis.add(api("GET", "/inventory/family/{familyId}/expired", "已过期"));
        apis.add(api("GET", "/inventory/family/{familyId}/consumed", "消耗记录"));
        apis.add(api("GET", "/inventory/family/{familyId}/summary", "库存概览"));
        apis.add(api("GET", "/inventory/family/{familyId}/low-stock", "低库存预警"));
        apis.add(api("POST", "/inventory/quick-record", "快捷记录餐食"));
        apis.add(api("DELETE", "/inventory/{id}", "删除库存项"));

        // ========== 食谱管理 ==========
        apis.add(api("GET", "/recipe/recommend", "推荐菜谱"));
        apis.add(api("GET", "/recipe/today-recommend", "今日推荐"));
        apis.add(api("GET", "/recipe/smart-recommend", "智能推荐"));
        apis.add(api("GET", "/recipe/health-tags", "按标签查菜谱"));
        apis.add(api("GET", "/recipe/{recipeId}", "菜谱详情"));
        apis.add(api("GET", "/recipe/{recipeId}/can-cook", "能否制作"));
        apis.add(api("POST", "/recipe/{recipeId}/cook", "制作菜谱"));

        // ========== 购物清单 ==========
        apis.add(api("GET", "/shopping/family/{familyId}", "采购清单"));
        apis.add(api("POST", "/shopping/add", "添加采购项"));
        apis.add(api("PUT", "/shopping/{id}/purchase", "标记已购"));
        apis.add(api("POST", "/shopping/family/{familyId}/generate-enhanced", "生成智能清单"));
        apis.add(api("DELETE", "/shopping/{id}", "删除采购项"));

        // ========== AI助手 ==========
        apis.add(api("GET", "/ai/predict-consumption", "预测消耗"));
        apis.add(api("GET", "/ai/smart-notifications/expiring", "智能预警"));
        apis.add(api("GET", "/ai/recommend-recipes", "AI推荐"));
        apis.add(api("POST", "/ai/record-meal", "记录用餐"));
        apis.add(api("GET", "/ai/shopping-list", "AI采购清单"));

        // ========== 数据报告 ==========
        apis.add(api("GET", "/report/consumption-trend", "消耗趋势"));
        apis.add(api("GET", "/report/waste-statistics", "浪费统计"));
        apis.add(api("GET", "/report/consumption-report", "消耗报告"));

        // ========== 通知管理 ==========
        apis.add(api("GET", "/notification/expiring", "过期预警"));
        apis.add(api("GET", "/notification/replenish", "补货预警"));
        apis.add(api("GET", "/notification/all", "所有通知"));

        // ========== 食材管理 ==========
        apis.add(api("GET", "/ingredient/search", "搜索食材"));
        apis.add(api("GET", "/ingredient/categories", "获取分类"));
        apis.add(api("POST", "/ingredient/create", "创建食材"));
        apis.add(api("POST", "/ingredient/scan", "扫码识别"));

        // ========== AI训练 ==========
        apis.add(api("POST", "/ai-training/train-consumption", "训练消耗预测模型"));
        apis.add(api("GET", "/ai-training/predict-consumption", "预测食材消耗"));
        apis.add(api("POST", "/ai-training/batch-train", "批量训练模型"));
        apis.add(api("GET", "/ai-training/status", "获取模型状态"));
        apis.add(api("DELETE", "/ai-training/model", "删除模型"));

        // ========== AI对话 ==========
        apis.add(api("POST", "/llm-chat/send", "发送消息（自动获取库存和用户信息）"));
        apis.add(api("POST", "/llm-chat/stream", "流式对话（自动获取库存和用户信息）"));
        apis.add(api("POST", "/llm-chat/clear-history", "清除对话历史"));
        apis.add(api("GET", "/llm-chat/suggestions", "获取对话建议"));
        apis.add(api("GET", "/llm-chat/test", "测试LLM连接"));

        result.put("code", 200);
        result.put("message", "success");
        result.put("data", apis);
        return result;
    }

    private Map<String, Object> api(String method, String path, String desc) {
        Map<String, Object> map = new HashMap<>();
        map.put("method", method);
        map.put("path", path);
        map.put("description", desc);
        return map;
    }
}