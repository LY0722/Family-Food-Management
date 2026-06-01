"use strict";
const common_vendor = require("../common/vendor.js");
const config_api = require("../config/api.js");
const utils_storage = require("./storage.js");
class ApiClient {
  constructor() {
    this.baseURL = config_api.apiConfig.baseURL;
    this.timeout = config_api.apiConfig.timeout || 15e3;
  }
  async request(method, url, data = {}, options = {}) {
    const header = {
      "Content-Type": "application/json",
      ...options.header
    };
    const token = utils_storage.storage.get("token");
    if (token) {
      header["Authorization"] = `Bearer ${token}`;
    }
    if (options.params) {
      const queryString = Object.keys(options.params).map((key) => {
        const value = options.params[key];
        if (value === null || value === void 0) {
          return "";
        }
        if (Array.isArray(value)) {
          return value.map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join("&");
        }
        if (typeof value === "object") {
          return `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`;
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      }).filter((str) => str.length > 0).join("&");
      if (queryString) {
        url += (url.includes("?") ? "&" : "?") + queryString;
      }
    }
    return new Promise((resolve, reject) => {
      common_vendor.index.request({
        url: `${this.baseURL}${url}`,
        method,
        data,
        header,
        timeout: this.timeout,
        sslVerify: false,
        success: (res) => {
          if (res.statusCode === 200) {
            const response = res.data;
            if (response && typeof response.code === "undefined") {
              resolve({
                code: 200,
                data: response,
                message: "success"
              });
            } else {
              resolve(response);
            }
          } else {
            this.handleError(res, reject);
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at utils/api.js:78", "请求失败:", err);
          reject(new Error("网络请求失败：" + (err.errMsg || "")));
        }
      });
    });
  }
  handleError(res, reject) {
    const { statusCode, data } = res;
    switch (statusCode) {
      case 401:
        utils_storage.storage.remove("token");
        common_vendor.index.reLaunch({ url: "/pages/login/login" });
        reject(new Error("登录已过期，请重新登录"));
        break;
      case 403:
        reject(new Error("权限不足"));
        break;
      case 404:
        reject(new Error("请求的资源不存在"));
        break;
      case 500:
        reject(new Error("服务器内部错误"));
        break;
      default:
        const message = (data == null ? void 0 : data.message) || `请求失败(${statusCode})`;
        reject(new Error(message));
    }
  }
  get(url, params = {}, options = {}) {
    if (Object.keys(params).length > 0) {
      const queryString = Object.keys(params).map((key) => {
        const value = params[key];
        if (value === null || value === void 0) {
          return "";
        }
        if (Array.isArray(value)) {
          return value.map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join("&");
        }
        if (typeof value === "object") {
          return `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`;
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      }).filter((str) => str.length > 0).join("&");
      if (queryString) {
        url += (url.includes("?") ? "&" : "?") + queryString;
      }
    }
    return this.request("GET", url, {}, options);
  }
  post(url, data = {}, options = {}) {
    return this.request("POST", url, data, options);
  }
  put(url, data = {}, options = {}) {
    return this.request("PUT", url, data, options);
  }
  delete(url, data = {}, options = {}) {
    return this.request("DELETE", url, data, options);
  }
  // 文件上传
  upload(url, filePath, formData = {}, options = {}) {
    return new Promise((resolve, reject) => {
      const token = utils_storage.storage.get("token");
      const header = {
        "Authorization": token ? `Bearer ${token}` : "",
        ...options.header
      };
      common_vendor.index.uploadFile({
        url: `${this.baseURL}${url}`,
        filePath,
        name: "file",
        formData,
        header,
        success: (res) => {
          if (res.statusCode === 200) {
            try {
              const data = JSON.parse(res.data);
              if (data && typeof data.code === "undefined") {
                resolve({ code: 200, data, message: "success" });
              } else {
                resolve(data);
              }
            } catch (e) {
              resolve({ code: 200, data: res.data, message: "success" });
            }
          } else {
            this.handleError(res, reject);
          }
        },
        fail: (err) => {
          reject(new Error("文件上传失败"));
        }
      });
    });
  }
}
const api = new ApiClient();
const api$1 = {
  // ==================== 用户相关 ====================
  user: {
    // ----- 登录注册 -----
    // 微信一键登录
    wechatLogin: (data) => api.post("/user/wechat-login", data),
    // 账号密码登录
    login: (data) => api.post("/user/login", data),
    // 发送验证码
    sendCode: (data) => api.post("/user/send-code", data),
    // 用户注册
    register: (data) => api.post("/user/register", data),
    // 退出登录
    logout: () => api.post("/user/logout"),
    // ----- 用户信息 -----
    // 获取当前用户信息
    getCurrentUser: () => {
      return api.get("/user/current").then((response) => {
        if (response.code === 200 && response.data) {
          let avatarUrl = response.data.avatarUrl;
          if (avatarUrl && !avatarUrl.startsWith("http")) {
            const baseURL = api.baseURL.replace("/api", "");
            avatarUrl = `${baseURL}${avatarUrl}`;
            response.data.avatarUrl = avatarUrl;
          }
        }
        return response;
      });
    },
    // 更新用户信息（昵称、头像）
    updateUser: (data) => api.put("/user/profile", data),
    // 上传头像
    uploadAvatar: (filePath) => {
      return new Promise((resolve, reject) => {
        const token = common_vendor.index.getStorageSync("token");
        common_vendor.index.uploadFile({
          url: `${api.baseURL}/user/avatar`,
          filePath,
          name: "file",
          header: {
            "Authorization": token ? `Bearer ${token}` : ""
          },
          success: (res) => {
            try {
              const response = JSON.parse(res.data);
              if (response.code === 200) {
                let avatarUrl = response.data.avatarUrl;
                if (avatarUrl && !avatarUrl.startsWith("http")) {
                  avatarUrl = `${api.baseURL}${avatarUrl}`;
                }
                resolve({
                  code: 200,
                  data: avatarUrl,
                  message: response.message || "success"
                });
              } else {
                resolve({
                  code: response.code || 500,
                  data: null,
                  message: response.message || "上传失败"
                });
              }
            } catch (e) {
              resolve({
                code: 500,
                data: null,
                message: "解析响应失败"
              });
            }
          },
          fail: (err) => {
            reject(new Error("文件上传失败"));
          }
        });
      });
    },
    // ----- 健康标签 -----
    // 获取健康标签
    getHealthTags: () => api.get("/user/health-tags"),
    // 更新健康标签
    updateHealthTags: (tags) => api.put("/user/health-tags", { tags }),
    // ----- 测试 -----
    testConnection: () => api.get("/user/test-connection")
  },
  // ==================== 其他模块保持不变 ====================
  // 家庭相关
  family: {
    switchFamily: (data) => api.post("/family/switch", data),
    create: (data) => api.post("/family/create", data),
    join: (data) => api.post("/family/join", data),
    getMembers: (familyId) => api.get(`/family/${familyId}/members`),
    getInfo: (familyId) => api.get(`/family/${familyId}/info`),
    leave: (familyId, data) => api.post(`/family/${familyId}/leave`, data),
    removeMember: (familyId, memberId) => api.delete(`/family/${familyId}/member/${memberId}`)
  },
  // 食材相关
  ingredient: {
    search: (keyword) => api.get("/ingredient/search", { keyword }),
    create: (data) => api.post("/ingredient/create", data),
    getCategories: () => api.get("/ingredient/categories"),
    scan: (barcode) => api.post("/ingredient/scan", { barcode })
  },
  // 库存相关
  inventory: {
    getFamilyInventory: (familyId) => api.get(`/inventory/family/${familyId}`),
    addIngredient: (data) => api.post("/inventory/add", data),
    consumeIngredient: (data) => api.post("/inventory/consume", data),
    getExpiringItems: (familyId, daysBefore = 3) => api.get(`/inventory/family/${familyId}/expiring`, { daysBefore }),
    getExpiredItems: (familyId) => api.get(`/inventory/family/${familyId}/expired`),
    deleteItem: (id) => api.delete(`/inventory/${id}`)
  },
  // 菜谱相关
  recipe: {
    recommend: (familyId, userId) => api.get("/recipe/recommend", { familyId, userId }),
    smartRecommend: (familyId, userId, limit = 5) => api.get("/recipe/smart-recommend", { familyId, userId, limit }),
    todayRecommend: (familyId, userId) => api.get("/recipe/today-recommend", { familyId, userId }),
    dateRecommend: (familyId, userId, date) => api.get("/recipe/date-recommend", { familyId, userId, date }),
    getByHealthTags: (tags) => api.get("/recipe/health-tags", { healthTags: tags.join(",") }),
    getDetail: (recipeId) => api.get(`/recipe/${recipeId}`),
    checkCanCook: (recipeId, familyId) => api.get(`/recipe/${recipeId}/can-cook`, { familyId }),
    cookRecipe: (recipeId, familyId, mealType) => api.post(`/recipe/${recipeId}/cook`, {}, { params: { familyId, mealType } }),
    search: (keyword) => api.get("/recipe/search", { keyword }),
    // 添加获取菜谱列表的方法
    getRecipes: (params) => api.get("/recipe", params),
    // 添加：创建菜谱
    create: (data) => api.post("/recipe/create", data),
    // 添加：获取前一天的用餐记录（用于智能推荐）
    getPreviousDayRecords: (familyId, userId, date) => api.get("/recipe/previous-day-records", { familyId, userId, date }),
    // 添加：获取指定日期的用餐记录
    getDayRecords: (familyId, date) => api.get("/recipe/day-records", { familyId, date }),
    // 添加：保存或更新用餐记录
    saveMealRecord: (familyId, userId, recipeId, mealType, date, dishName) => api.post("/recipe/save-meal-record", {}, { params: { familyId, userId, recipeId, mealType, date, dishName } }),
    // 添加：删除用餐记录
    deleteMealRecord: (familyId, mealType, date) => api.delete("/recipe/delete-meal-record", { familyId, mealType, date })
  },
  // 采购清单相关
  shopping: {
    getShoppingList: (familyId) => api.get(`/shopping/family/${familyId}`),
    addToShoppingList: (data) => api.post("/shopping/add", data),
    markAsPurchased: (id) => api.put(`/shopping/${id}/purchase`),
    generateSmartList: (familyId) => api.post(`/shopping/family/${familyId}/generate-enhanced`),
    deleteItem: (id) => api.delete(`/shopping/${id}`),
    addBatch: (data) => api.post("/shopping/add-batch", data),
    clearPurchasedItems: (data) => api.post("/shopping/clear-purchased", data),
    clearAllItems: (familyId) => api.post(`/shopping/clear-all/${familyId}`)
  },
  // 买菜记录相关
  shoppingHistory: {
    getShoppingHistory: (familyId, page = 0, pageSize = 20) => api.get(`/shopping-history/family/${familyId}`, { page, pageSize }),
    getShoppingHistoryDetail: (historyId) => api.get(`/shopping-history/detail/${historyId}`),
    completeShopping: (data) => api.post("/shopping-history/complete", data)
  },
  // 消耗报告相关
  consumption: {
    getReport: (familyId, startDate, endDate) => api.get("/consumption/report", { familyId, startDate, endDate }),
    getWasteStatistics: (familyId) => api.get("/consumption/waste-statistics", { familyId }),
    getConsumptionTrend: (familyId, days = 7) => api.get("/consumption/trend", { familyId, days })
  },
  // 数据报告相关
  report: {
    getConsumptionTrend: (familyId, period = "week") => api.get("/report/consumption-trend", { familyId, period }),
    getWasteStatistics: (familyId) => api.get("/report/waste-statistics", { familyId }),
    getConsumptionReport: (familyId, startDate, endDate) => api.get("/report/consumption-report", { familyId, startDate, endDate })
  },
  // 通知相关
  notification: {
    getExpiringNotifications: (familyId) => api.get("/notification/expiring", { familyId }),
    getReplenishNotifications: (familyId) => api.get("/notification/replenish", { familyId }),
    getAllNotifications: (familyId) => api.get("/notification/all", { familyId })
  },
  // AI相关
  ai: {
    // LLM对话相关
    llmChat: {
      // 发送消息（一次性回复）
      send: (data) => api.post("/llm-chat/send", data),
      // 流式对话（打字机效果）
      stream: (data) => api.post("/llm-chat/stream", data),
      // 清除对话历史
      clearHistory: () => api.post("/llm-chat/clear-history"),
      // 获取对话建议
      getSuggestions: () => api.get("/llm-chat/suggestions"),
      // 测试LLM连接
      test: () => api.get("/llm-chat/test")
    },
    // 旧的AI接口（保留兼容）
    chat: (data) => api.post("/llm-chat/send", data),
    predictConsumption: (familyId, ingredientId, days = 7) => api.get("/ai/predict-consumption", { familyId, ingredientId, days }),
    getSmartNotifications: (familyId) => api.get("/ai/smart-notifications/expiring", { familyId }),
    recommendRecipes: (familyId, userId, limit = 5) => api.get("/ai/recommend-recipes", { familyId, userId, limit }),
    recordMeal: (familyId, recipeId, mealType) => api.post("/ai/record-meal", {}, { params: { familyId, recipeId, mealType } }),
    generateShoppingList: (familyId) => api.get("/ai/shopping-list", { familyId })
  }
};
exports.api = api$1;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/api.js.map
