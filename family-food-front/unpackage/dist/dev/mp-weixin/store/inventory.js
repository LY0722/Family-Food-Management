"use strict";
const common_vendor = require("../common/vendor.js");
const utils_api = require("../utils/api.js");
const config_constants = require("../config/constants.js");
const inventory = {
  state: {
    inventoryList: [],
    shoppingList: [],
    expiringItems: [],
    expiredItems: [],
    warnings: [],
    consumptionRecords: []
  },
  mutations: {
    SET_INVENTORY_LIST(state, inventory2) {
      state.inventoryList = inventory2;
    },
    SET_SHOPPING_LIST(state, shoppingList) {
      state.shoppingList = shoppingList;
    },
    SET_EXPIRING_ITEMS(state, items) {
      state.expiringItems = items;
    },
    SET_EXPIRED_ITEMS(state, items) {
      state.expiredItems = items;
    },
    SET_WARNINGS(state, warnings) {
      state.warnings = warnings;
    },
    SET_CONSUMPTION_RECORDS(state, records) {
      state.consumptionRecords = records;
    },
    ADD_INVENTORY_ITEM(state, item) {
      state.inventoryList.push(item);
    },
    UPDATE_INVENTORY_ITEM(state, updatedItem) {
      const index = state.inventoryList.findIndex((item) => item.id === updatedItem.id);
      if (index !== -1) {
        state.inventoryList.splice(index, 1, updatedItem);
      }
    },
    REMOVE_INVENTORY_ITEM(state, itemId) {
      state.inventoryList = state.inventoryList.filter((item) => item.id !== itemId);
    },
    ADD_SHOPPING_ITEM(state, item) {
      state.shoppingList.push(item);
    },
    UPDATE_SHOPPING_ITEM(state, updatedItem) {
      const index = state.shoppingList.findIndex((item) => item.id === updatedItem.id);
      if (index !== -1) {
        state.shoppingList.splice(index, 1, updatedItem);
      }
    },
    REMOVE_SHOPPING_ITEM(state, itemId) {
      state.shoppingList = state.shoppingList.filter((item) => item.id !== itemId);
    }
  },
  actions: {
    // 获取家庭库存
    async fetchFamilyInventory({ commit, state, rootState }) {
      var _a;
      const familyId = (_a = rootState.family.currentFamily) == null ? void 0 : _a.id;
      if (!familyId)
        return;
      try {
        const response = await utils_api.api.inventory.getFamilyInventory(familyId);
        if (response.code === 200) {
          const inventoryWithStatus = response.data.map((item) => ({
            ...item,
            status: calculateInventoryStatus(item.expiryDate)
          }));
          commit("SET_INVENTORY_LIST", inventoryWithStatus);
          const expiringItems = inventoryWithStatus.filter((item) => item.status === config_constants.INVENTORY_STATUS.EXPIRING);
          commit("SET_EXPIRING_ITEMS", expiringItems);
          const expiredItems = inventoryWithStatus.filter((item) => item.status === config_constants.INVENTORY_STATUS.EXPIRED);
          commit("SET_EXPIRED_ITEMS", expiredItems);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at store/inventory.js:99", "获取库存失败:", error);
        throw error;
      }
    },
    // 添加食材到库存
    async addIngredientToInventory({ commit, rootState }, ingredientData) {
      var _a;
      const familyId = (_a = rootState.family.currentFamily) == null ? void 0 : _a.id;
      if (!familyId)
        throw new Error("未选择家庭");
      try {
        const data = { ...ingredientData, familyId };
        const response = await utils_api.api.inventory.addIngredient(data);
        if (response.code === 200) {
          commit("ADD_INVENTORY_ITEM", response.data);
          return response.data;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at store/inventory.js:117", "添加食材失败:", error);
        throw error;
      }
    },
    // 消耗食材
    async consumeIngredient({ commit, rootState }, consumeData) {
      var _a;
      const familyId = (_a = rootState.family.currentFamily) == null ? void 0 : _a.id;
      if (!familyId)
        throw new Error("未选择家庭");
      try {
        const data = { ...consumeData, familyId };
        const response = await utils_api.api.inventory.consumeIngredient(data);
        if (response.code === 200) {
          await this.dispatch("fetchFamilyInventory");
          return response;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at store/inventory.js:136", "消耗食材失败:", error);
        throw error;
      }
    },
    // 获取采购清单
    async fetchShoppingList({ commit, rootState }) {
      var _a;
      const familyId = (_a = rootState.family.currentFamily) == null ? void 0 : _a.id;
      if (!familyId)
        return;
      try {
        const response = await utils_api.api.shopping.getShoppingList(familyId);
        if (response.code === 200) {
          commit("SET_SHOPPING_LIST", response.data);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at store/inventory.js:152", "获取采购清单失败:", error);
        throw error;
      }
    },
    // 添加采购项
    async addToShoppingList({ commit, rootState }, itemData) {
      var _a;
      const familyId = (_a = rootState.family.currentFamily) == null ? void 0 : _a.id;
      if (!familyId)
        throw new Error("未选择家庭");
      try {
        const data = { ...itemData, familyId };
        const response = await utils_api.api.shopping.addToShoppingList(data);
        if (response.code === 200) {
          commit("ADD_SHOPPING_ITEM", response.data);
          return response.data;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at store/inventory.js:170", "添加采购项失败:", error);
        throw error;
      }
    },
    // 标记为已购买
    async markAsPurchased({ commit, dispatch, state }, itemId) {
      try {
        const response = await utils_api.api.shopping.markAsPurchased(itemId);
        if (response.code === 200) {
          const updatedItem = {
            ...state.shoppingList.find((item) => item.id === itemId),
            purchased: true,
            purchasedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          commit("UPDATE_SHOPPING_ITEM", updatedItem);
          await dispatch("fetchFamilyInventory");
          return response;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at store/inventory.js:194", "标记购买失败:", error);
        throw error;
      }
    },
    // 删除采购项
    async deleteShoppingItem({ commit }, itemId) {
      try {
        const response = await utils_api.api.shopping.deleteItem(itemId);
        if (response.code === 200) {
          commit("REMOVE_SHOPPING_ITEM", itemId);
          return response;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at store/inventory.js:208", "删除采购项失败:", error);
        throw error;
      }
    },
    // 获取预警信息
    async fetchWarnings({ commit, rootState }) {
      var _a;
      const familyId = (_a = rootState.family.currentFamily) == null ? void 0 : _a.id;
      if (!familyId)
        return;
      try {
        const expiringResponse = await utils_api.api.notification.getExpiringNotifications(familyId);
        const replenishResponse = await utils_api.api.consumption.getReplenishNotifications(familyId);
        const warnings = [
          ...(expiringResponse.data || []).map((item) => ({
            ...item,
            type: "expiring",
            priority: "high"
          })),
          ...(replenishResponse.data || []).map((item) => ({
            ...item,
            type: "replenish",
            priority: "medium"
          }))
        ];
        commit("SET_WARNINGS", warnings);
      } catch (error) {
        common_vendor.index.__f__("error", "at store/inventory.js:240", "获取预警失败:", error);
        throw error;
      }
    },
    // 智能生成采购清单
    async generateSmartShoppingList({ commit, rootState }) {
      var _a;
      const familyId = (_a = rootState.family.currentFamily) == null ? void 0 : _a.id;
      if (!familyId)
        throw new Error("未选择家庭");
      try {
        const response = await utils_api.api.shopping.generateSmartList(familyId);
        if (response.code === 200) {
          await this.dispatch("fetchShoppingList");
          return response;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at store/inventory.js:257", "生成采购清单失败:", error);
        throw error;
      }
    },
    // 获取消耗报告
    async fetchConsumptionReport({ commit, rootState }, { startDate, endDate }) {
      var _a;
      const familyId = (_a = rootState.family.currentFamily) == null ? void 0 : _a.id;
      if (!familyId)
        return;
      try {
        const response = await utils_api.api.consumption.getReport(familyId, startDate, endDate);
        if (response.code === 200) {
          commit("SET_CONSUMPTION_RECORDS", response.data);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at store/inventory.js:273", "获取消耗报告失败:", error);
        throw error;
      }
    }
  },
  getters: {
    inventoryList: (state) => state.inventoryList,
    shoppingList: (state) => state.shoppingList,
    expiringItems: (state) => state.expiringItems,
    expiredItems: (state) => state.expiredItems,
    warnings: (state) => state.warnings,
    consumptionRecords: (state) => state.consumptionRecords,
    // 库存统计
    inventoryStats: (state) => ({
      total: state.inventoryList.length,
      fresh: state.inventoryList.filter((item) => item.status === config_constants.INVENTORY_STATUS.NORMAL).length,
      expiring: state.expiringItems.length,
      expired: state.expiredItems.length
    }),
    // 待采购清单
    pendingShoppingList: (state) => state.shoppingList.filter((item) => !item.purchased),
    // 已采购清单
    purchasedShoppingList: (state) => state.shoppingList.filter((item) => item.purchased)
  }
};
function calculateInventoryStatus(expiryDate) {
  if (!expiryDate)
    return config_constants.INVENTORY_STATUS.NORMAL;
  const today = /* @__PURE__ */ new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry - today) / (1e3 * 60 * 60 * 24));
  if (diffDays < 0) {
    return config_constants.INVENTORY_STATUS.EXPIRED;
  } else if (diffDays <= 3) {
    return config_constants.INVENTORY_STATUS.EXPIRING;
  } else {
    return config_constants.INVENTORY_STATUS.NORMAL;
  }
}
exports.inventory = inventory;
//# sourceMappingURL=../../.sourcemap/mp-weixin/store/inventory.js.map
