"use strict";
const config = {
  development: {
    baseURL: "http://localhost:8080/api",
    timeout: 15e3
  },
  production: {
    baseURL: "https://your-domain.com",
    timeout: 15e3
  }
};
let env = "development";
try {
  env = "development";
} catch (e) {
  env = "development";
}
const apiConfig = {
  baseURL: config[env].baseURL,
  timeout: config[env].timeout,
  apis: {
    user: {
      wechatLogin: { method: "POST", path: "/user/wechat-login", desc: "微信一键登录" },
      login: { method: "POST", path: "/user/login", desc: "手机号登录" },
      sendCode: { method: "POST", path: "/user/send-code", desc: "发送验证码" },
      register: { method: "POST", path: "/user/register", desc: "用户注册" },
      getCurrent: { method: "GET", path: "/user/current", desc: "获取当前用户" },
      updateProfile: { method: "PUT", path: "/user/profile", desc: "更新用户信息" },
      getHealthTags: { method: "GET", path: "/user/health-tags", desc: "获取健康标签" },
      updateHealthTags: { method: "PUT", path: "/user/health-tags", desc: "更新健康标签" },
      getNotificationSettings: { method: "GET", path: "/user/notification-settings", desc: "获取通知设置" },
      updateNotificationSettings: { method: "PUT", path: "/user/notification-settings", desc: "更新通知设置" },
      uploadAvatar: { method: "POST", path: "/user/avatar", desc: "上传头像" },
      logout: { method: "POST", path: "/user/logout", desc: "退出登录" }
    },
    family: {
      create: { method: "POST", path: "/family/create", desc: "创建家庭" },
      join: { method: "POST", path: "/family/join", desc: "加入家庭" },
      getMembers: { method: "GET", path: "/family/{familyId}/members", desc: "家庭成员" },
      getInfo: { method: "GET", path: "/family/{familyId}/info", desc: "获取家庭信息" },
      leave: { method: "POST", path: "/family/{familyId}/leave", desc: "退出家庭" },
      switchFamily: { method: "POST", path: "/family/switch", desc: "切换当前家庭" },
      removeMember: { method: "DELETE", path: "/family/{familyId}/member/{memberId}", desc: "移除成员" }
    },
    inventory: {
      getList: { method: "GET", path: "/inventory/family/{familyId}", desc: "库存列表" },
      add: { method: "POST", path: "/inventory/add", desc: "添加食材" },
      consume: { method: "POST", path: "/inventory/consume", desc: "消耗食材" },
      getExpiring: { method: "GET", path: "/inventory/family/{familyId}/expiring", desc: "即将过期" },
      getExpired: { method: "GET", path: "/inventory/family/{familyId}/expired", desc: "已过期" },
      getConsumed: { method: "GET", path: "/inventory/family/{familyId}/consumed", desc: "消耗记录" },
      getSummary: { method: "GET", path: "/inventory/family/{familyId}/summary", desc: "库存概览" },
      getLowStock: { method: "GET", path: "/inventory/family/{familyId}/low-stock", desc: "低库存预警" },
      quickRecord: { method: "POST", path: "/inventory/quick-record", desc: "快捷记录餐食" }
    },
    recipe: {
      recommend: { method: "GET", path: "/recipe/recommend", desc: "推荐菜谱" },
      todayRecommend: { method: "GET", path: "/recipe/today-recommend", desc: "今日推荐" },
      smartRecommend: { method: "GET", path: "/recipe/smart-recommend", desc: "智能推荐" },
      getByHealthTags: { method: "GET", path: "/recipe/health-tags", desc: "按标签查菜谱" },
      getDetail: { method: "GET", path: "/recipe/{recipeId}", desc: "菜谱详情" },
      canCook: { method: "GET", path: "/recipe/{recipeId}/can-cook", desc: "能否制作" },
      cook: { method: "POST", path: "/recipe/{recipeId}/cook", desc: "制作菜谱" },
      getRecipes: { method: "GET", path: "/recipe", desc: "获取菜谱列表" }
    },
    shopping: {
      getList: { method: "GET", path: "/shopping/family/{familyId}", desc: "采购清单" },
      add: { method: "POST", path: "/shopping/add", desc: "添加采购项" },
      markPurchased: { method: "PUT", path: "/shopping/{id}/purchase", desc: "标记已购" },
      generateEnhanced: { method: "POST", path: "/shopping/family/{familyId}/generate-enhanced", desc: "生成智能清单" },
      delete: { method: "DELETE", path: "/shopping/{id}", desc: "删除采购项" }
    },
    ai: {
      predictConsumption: { method: "GET", path: "/ai/predict-consumption", desc: "预测消耗" },
      chat: { method: "POST", path: "/ai/chat", desc: "AI对话" },
      smartNotifications: { method: "GET", path: "/ai/smart-notifications/expiring", desc: "智能预警" },
      recommendRecipes: { method: "GET", path: "/ai/recommend-recipes", desc: "AI推荐" },
      recordMeal: { method: "POST", path: "/ai/record-meal", desc: "记录用餐" },
      shoppingList: { method: "GET", path: "/ai/shopping-list", desc: "AI采购清单" }
    },
    report: {
      consumptionTrend: { method: "GET", path: "/report/consumption-trend", desc: "消耗趋势" },
      wasteStatistics: { method: "GET", path: "/report/waste-statistics", desc: "浪费统计" },
      consumptionReport: { method: "GET", path: "/report/consumption-report", desc: "消耗报告" }
    },
    notification: {
      expiring: { method: "GET", path: "/notification/expiring", desc: "过期预警" },
      replenish: { method: "GET", path: "/notification/replenish", desc: "补货预警" },
      all: { method: "GET", path: "/notification/all", desc: "所有通知" }
    },
    ingredient: {
      search: { method: "GET", path: "/ingredient/search", desc: "搜索食材" },
      getCategories: { method: "GET", path: "/ingredient/categories", desc: "获取分类" },
      create: { method: "POST", path: "/ingredient/create", desc: "创建食材" },
      scan: { method: "POST", path: "/ingredient/scan", desc: "扫码识别" }
    },
    aiTraining: {
      trainConsumption: { method: "POST", path: "/ai-training/train-consumption", desc: "训练消耗预测模型" },
      predictConsumption: { method: "GET", path: "/ai-training/predict-consumption", desc: "预测食材消耗" },
      batchTrain: { method: "POST", path: "/ai-training/batch-train", desc: "批量训练模型" },
      getStatus: { method: "GET", path: "/ai-training/status", desc: "获取模型状态" },
      deleteModel: { method: "DELETE", path: "/ai-training/model", desc: "删除模型" }
    },
    llmChat: {
      send: { method: "POST", path: "/llm-chat/send", desc: "发送消息（一次性回复）" },
      stream: { method: "POST", path: "/llm-chat/stream", desc: "流式对话（打字机效果）" },
      clearHistory: { method: "POST", path: "/llm-chat/clear-history", desc: "清除对话历史" },
      getSuggestions: { method: "GET", path: "/llm-chat/suggestions", desc: "获取对话建议" },
      test: { method: "GET", path: "/llm-chat/test", desc: "测试LLM连接" }
    }
  }
};
exports.apiConfig = apiConfig;
//# sourceMappingURL=../../.sourcemap/mp-weixin/config/api.js.map
