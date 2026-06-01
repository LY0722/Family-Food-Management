"use strict";
const common_vendor = require("../common/vendor.js");
const utils_api = require("../utils/api.js");
const family = {
  state: {
    currentFamily: common_vendor.index.getStorageSync("currentFamily") || null,
    familyMembers: [],
    families: [],
    familyCode: null
  },
  mutations: {
    SET_CURRENT_FAMILY(state, family2) {
      state.currentFamily = family2;
      common_vendor.index.setStorageSync("currentFamily", family2);
    },
    SET_FAMILY_MEMBERS(state, members) {
      state.familyMembers = members;
    },
    SET_FAMILIES(state, families) {
      state.families = families;
    },
    SET_FAMILY_CODE(state, code) {
      state.familyCode = code;
    },
    CLEAR_FAMILY(state) {
      state.currentFamily = null;
      state.familyMembers = [];
      state.families = [];
      state.familyCode = null;
      common_vendor.index.removeStorageSync("currentFamily");
    },
    ADD_FAMILY_MEMBER(state, member) {
      state.familyMembers.push(member);
    },
    REMOVE_FAMILY_MEMBER(state, memberId) {
      state.familyMembers = state.familyMembers.filter((m) => m.id !== memberId);
    }
  },
  actions: {
    // 创建家庭
    async createFamily({ commit }, familyData) {
      try {
        const response = await utils_api.api.family.create(familyData);
        if (response.code === 200) {
          commit("SET_CURRENT_FAMILY", response.data);
          return response.data;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at store/family.js:61", "创建家庭失败:", error);
        throw error;
      }
    },
    // 加入家庭
    async joinFamily({ commit, dispatch }, joinData) {
      try {
        const response = await utils_api.api.family.join(joinData);
        if (response.code === 200) {
          await dispatch("fetchFamilyInfo", joinData.familyCode);
          return response.data;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at store/family.js:76", "加入家庭失败:", error);
        throw error;
      }
    },
    // 获取家庭成员
    async fetchFamilyMembers({ commit, state }) {
      var _a;
      if (!((_a = state.currentFamily) == null ? void 0 : _a.id))
        return;
      try {
        const response = await utils_api.api.family.getMembers(state.currentFamily.id);
        if (response.code === 200) {
          commit("SET_FAMILY_MEMBERS", response.data);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at store/family.js:91", "获取家庭成员失败:", error);
        throw error;
      }
    },
    // 获取家庭信息
    async fetchFamilyInfo({ commit }, familyCode) {
      try {
        const familyInfo = {
          id: 1,
          familyCode,
          name: "我的家庭"
        };
        commit("SET_CURRENT_FAMILY", familyInfo);
      } catch (error) {
        common_vendor.index.__f__("error", "at store/family.js:108", "获取家庭信息失败:", error);
        throw error;
      }
    },
    // 移除家庭成员
    async removeFamilyMember({ commit }, memberId) {
      try {
        commit("REMOVE_FAMILY_MEMBER", memberId);
      } catch (error) {
        common_vendor.index.__f__("error", "at store/family.js:120", "移除家庭成员失败:", error);
        throw error;
      }
    },
    // 退出家庭
    async leaveFamily({ commit, state }) {
      var _a;
      if (!((_a = state.currentFamily) == null ? void 0 : _a.id))
        return;
      try {
        commit("CLEAR_FAMILY");
      } catch (error) {
        common_vendor.index.__f__("error", "at store/family.js:134", "退出家庭失败:", error);
        throw error;
      }
    }
  },
  getters: {
    currentFamily: (state) => state.currentFamily,
    familyMembers: (state) => state.familyMembers,
    families: (state) => state.families,
    familyCode: (state) => state.familyCode,
    isFamilyOwner: (state, getters, rootState) => {
      var _a, _b;
      return ((_a = state.currentFamily) == null ? void 0 : _a.adminUserId) === ((_b = rootState.user.userInfo) == null ? void 0 : _b.id);
    }
  }
};
exports.family = family;
//# sourceMappingURL=../../.sourcemap/mp-weixin/store/family.js.map
