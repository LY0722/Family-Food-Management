"use strict";
const common_vendor = require("../common/vendor.js");
const config_api = require("../config/api.js");
const user = {
  namespaced: true,
  state: {
    token: "",
    userInfo: null,
    currentFamily: null,
    isLoggedIn: false
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
      common_vendor.index.setStorageSync("token", token);
    },
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo;
      state.isLoggedIn = !!(userInfo && userInfo.id);
      common_vendor.index.setStorageSync("userInfo", userInfo);
    },
    SET_CURRENT_FAMILY(state, family) {
      if (family && family.id) {
        if (typeof family.id === "string") {
          const numId = parseInt(family.id.replace(/[^0-9-]/g, ""), 10);
          if (!isNaN(numId) && numId > 0) {
            family.id = numId;
          } else {
            common_vendor.index.__f__("error", "at store/user.js:37", "无效的家庭ID:", family.id);
            family = null;
          }
        } else if (typeof family.id !== "number" || family.id <= 0) {
          common_vendor.index.__f__("error", "at store/user.js:41", "无效的家庭ID类型或值:", family.id);
          family = null;
        }
      } else {
        common_vendor.index.__f__("error", "at store/user.js:45", "家庭数据缺少id字段:", family);
        family = null;
      }
      state.currentFamily = family;
      common_vendor.index.setStorageSync("currentFamily", family);
    },
    CLEAR_USER(state) {
      state.token = "";
      state.userInfo = null;
      state.currentFamily = null;
      state.isLoggedIn = false;
      common_vendor.index.removeStorageSync("token");
      common_vendor.index.removeStorageSync("userInfo");
      common_vendor.index.removeStorageSync("currentFamily");
    }
  },
  actions: {
    // 初始化用户
    async initUser({ commit, dispatch }) {
      var _a;
      const token = common_vendor.index.getStorageSync("token");
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      const currentFamily = common_vendor.index.getStorageSync("currentFamily");
      common_vendor.index.__f__("log", "at store/user.js:70", "初始化用户数据:", { hasToken: !!token, hasUserInfo: !!userInfo, currentFamily });
      if (token && userInfo) {
        if (userInfo.avatarUrl && !userInfo.avatarUrl.startsWith("http")) {
          userInfo.avatarUrl = `${config_api.apiConfig.baseURL}${userInfo.avatarUrl}`;
        }
        if ((_a = userInfo.avatarUrl) == null ? void 0 : _a.startsWith("http:")) {
          userInfo.avatarUrl = "/static/images/default-avatar.png";
        }
        commit("SET_TOKEN", token);
        commit("SET_USER_INFO", userInfo);
        if (currentFamily) {
          commit("SET_CURRENT_FAMILY", currentFamily);
        } else if (userInfo.familyId) {
          common_vendor.index.__f__("log", "at store/user.js:90", "用户有 familyId 但没有 currentFamily，尝试获取家庭信息:", userInfo.familyId);
          try {
            const response = await common_vendor.index.$api.family.getInfo(userInfo.familyId);
            if (response.code === 200 && response.data) {
              common_vendor.index.__f__("log", "at store/user.js:94", "成功获取家庭信息:", response.data);
              commit("SET_CURRENT_FAMILY", response.data);
            } else {
              common_vendor.index.__f__("warn", "at store/user.js:97", "获取家庭信息失败:", response);
            }
          } catch (error) {
            common_vendor.index.__f__("error", "at store/user.js:100", "获取家庭信息异常:", error);
          }
        }
        return true;
      }
      return false;
    },
    // 登录
    login({ commit }, { token, userInfo, familyInfo }) {
      commit("SET_TOKEN", token);
      commit("SET_USER_INFO", userInfo);
      if (familyInfo) {
        commit("SET_CURRENT_FAMILY", familyInfo);
      }
    },
    // 退出登录
    logout({ commit }) {
      commit("CLEAR_USER");
    },
    async fetchUserFamily({ commit, state }) {
      var _a;
      if (!((_a = state.userInfo) == null ? void 0 : _a.familyId))
        return;
      try {
        const response = await common_vendor.index.$api.family.getInfo(state.userInfo.familyId);
        if (response.code === 200) {
          commit("SET_CURRENT_FAMILY", response.data);
          return response.data;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at store/user.js:133", "获取家庭信息失败:", error);
        return null;
      }
    }
  },
  getters: {
    token: (state) => state.token,
    userInfo: (state) => state.userInfo,
    currentFamily: (state) => state.currentFamily,
    isLoggedIn: (state) => state.isLoggedIn,
    hasFamily: (state) => !!(state.currentFamily && state.currentFamily.id),
    userName: (state) => {
      var _a;
      return ((_a = state.userInfo) == null ? void 0 : _a.nickname) || "用户";
    },
    userId: (state) => {
      var _a;
      return ((_a = state.userInfo) == null ? void 0 : _a.id) || null;
    },
    familyId: (state) => {
      var _a;
      return ((_a = state.currentFamily) == null ? void 0 : _a.id) || null;
    }
  }
};
exports.user = user;
//# sourceMappingURL=../../.sourcemap/mp-weixin/store/user.js.map
