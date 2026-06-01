"use strict";
const common_vendor = require("../common/vendor.js");
const store_user = require("./user.js");
const store_family = require("./family.js");
const store_inventory = require("./inventory.js");
const store = common_vendor.createStore({
  modules: {
    user: store_user.user,
    family: store_family.family,
    inventory: store_inventory.inventory
  },
  // 全局状态
  state: {
    isLoading: false,
    error: null,
    // 全局配置
    config: {
      baseURL: "http://localhost:8080/api",
      tokenKey: "family_food_token",
      userKey: "family_food_user"
    }
  },
  mutations: {
    SET_LOADING(state, isLoading) {
      state.isLoading = isLoading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_ERROR(state) {
      state.error = null;
    }
  },
  actions: {
    setLoading({ commit }, isLoading) {
      commit("SET_LOADING", isLoading);
    },
    setError({ commit }, error) {
      commit("SET_ERROR", error);
    },
    clearError({ commit }) {
      commit("CLEAR_ERROR");
    }
  },
  getters: {
    isLoading: (state) => state.isLoading,
    error: (state) => state.error,
    config: (state) => state.config
  }
});
exports.store = store;
//# sourceMappingURL=../../.sourcemap/mp-weixin/store/index.js.map
