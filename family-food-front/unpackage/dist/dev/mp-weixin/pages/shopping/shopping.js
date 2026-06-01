"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_pageGuard = require("../../utils/pageGuard.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  name: "ShoppingPage",
  data() {
    return {
      shoppingList: [],
      recipeList: [],
      showAddModal: false,
      customItem: {
        name: "",
        quantity: "",
        category: "蔬菜"
      },
      categories: ["蔬菜", "水果", "肉类", "水产", "蛋奶", "粮油", "调料", "其他"],
      categoryIndex: 0
    };
  },
  computed: {
    currentFamily() {
      var _a;
      const family = (_a = this.$store.state.family) == null ? void 0 : _a.currentFamily;
      return family;
    },
    userInfo() {
      var _a;
      const user = (_a = this.$store.state.user) == null ? void 0 : _a.userInfo;
      return user;
    },
    hasFamily() {
      var _a, _b, _c;
      const hasCurrentFamily = !!((_a = this.currentFamily) == null ? void 0 : _a.id);
      const hasUserFamilyId = !!((_b = this.userInfo) == null ? void 0 : _b.familyId);
      const hasCurrentFamilyId = !!((_c = this.userInfo) == null ? void 0 : _c.currentFamilyId);
      return hasCurrentFamily || hasUserFamilyId || hasCurrentFamilyId;
    },
    totalItems() {
      return this.shoppingList.length;
    },
    purchasedCount() {
      return this.shoppingList.filter((item) => item.purchased).length;
    },
    pendingCount() {
      return this.shoppingList.filter((item) => !item.purchased).length;
    },
    progressPercent() {
      if (this.totalItems === 0)
        return 0;
      return Math.round(this.purchasedCount / this.totalItems * 100);
    }
  },
  onLoad() {
    if (!utils_pageGuard.requireLogin()) {
      return;
    }
    this.loadShoppingList();
    this.loadRecipeList();
  },
  onShow() {
    if (!utils_pageGuard.requireLogin()) {
      return;
    }
    this.loadShoppingList();
    this.loadRecipeList();
  },
  methods: {
    async loadShoppingList() {
      var _a;
      if (!((_a = this.currentFamily) == null ? void 0 : _a.id))
        return;
      try {
        const res = await this.$api.shopping.getShoppingList(Number(this.currentFamily.id));
        if (res.code === 200) {
          this.shoppingList = res.data.items || [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/shopping/shopping.vue:241", "加载采购清单失败:", error);
      }
    },
    async loadRecipeList() {
      var _a, _b;
      if (!((_a = this.currentFamily) == null ? void 0 : _a.id))
        return;
      try {
        const res = await this.$api.recipe.recommend(Number(this.currentFamily.id), Number((_b = this.userInfo) == null ? void 0 : _b.id));
        if (res.code === 200) {
          this.recipeList = res.data.list || [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/shopping/shopping.vue:252", "加载菜谱清单失败:", error);
      }
    },
    toggleItem(item) {
      item.purchased = !item.purchased;
    },
    async saveShoppingList() {
    },
    async clearPurchased() {
      const purchasedItems = this.shoppingList.filter((item) => item.purchased);
      if (purchasedItems.length === 0) {
        common_vendor.index.showToast({
          title: "没有勾选的食材",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showModal({
        title: "清空确认",
        content: `确定要清空 ${purchasedItems.length} 个勾选的食材吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const purchasedIds = purchasedItems.map((i) => i.id);
              await this.$api.shopping.clearPurchasedItems({
                familyId: Number(this.currentFamily.id),
                purchasedItemIds: purchasedIds
              });
              this.shoppingList = this.shoppingList.filter((item) => !item.purchased);
              common_vendor.index.showToast({ title: "清空成功", icon: "success" });
            } catch (e) {
              common_vendor.index.__f__("error", "at pages/shopping/shopping.vue:284", "清空失败:", e);
              common_vendor.index.showToast({ title: "清空失败", icon: "none" });
            }
          }
        }
      });
    },
    async completeShopping() {
      const purchasedItems = this.shoppingList.filter((item) => item.purchased);
      if (purchasedItems.length === 0) {
        common_vendor.index.showToast({
          title: "请先勾选要购买的食材",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showModal({
        title: "确认买菜",
        content: `确定要购买 ${purchasedItems.length} 个食材吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "处理中..." });
              const purchasedIds = purchasedItems.map((i) => i.id);
              await this.$api.shoppingHistory.completeShopping({
                familyId: Number(this.currentFamily.id),
                purchasedItemIds: purchasedIds
              });
              const remainingItems = this.shoppingList.filter((item) => !item.purchased);
              this.shoppingList = remainingItems;
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({ title: "买菜成功", icon: "success" });
            } catch (e) {
              common_vendor.index.__f__("error", "at pages/shopping/shopping.vue:320", "买菜失败:", e);
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({ title: "买菜失败", icon: "none" });
            }
          }
        }
      });
    },
    showAddCustomModal() {
      this.showAddModal = true;
      this.customItem = {
        name: "",
        quantity: "",
        category: this.categories[this.categoryIndex]
      };
    },
    hideAddModal() {
      this.showAddModal = false;
    },
    onCategoryChange(e) {
      this.categoryIndex = e.detail.value;
      this.customItem.category = this.categories[this.categoryIndex];
    },
    showCategoryPicker() {
      common_vendor.index.showActionSheet({
        itemList: this.categories,
        success: (res) => {
          this.categoryIndex = res.tapIndex;
          this.customItem.category = this.categories[res.tapIndex];
        }
      });
    },
    showCategoryPicker() {
      common_vendor.index.showActionSheet({
        itemList: this.categories,
        success: (res) => {
          this.categoryIndex = res.tapIndex;
          this.customItem.category = this.categories[res.tapIndex];
        }
      });
    },
    async addCustomItem() {
      if (!this.customItem.name.trim()) {
        common_vendor.index.showToast({
          title: "请输入食材名称",
          icon: "none"
        });
        return;
      }
      if (!this.customItem.quantity.trim()) {
        common_vendor.index.showToast({
          title: "请输入数量",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "添加中..." });
        const createRes = await this.$api.ingredient.create({
          name: this.customItem.name.trim(),
          category: this.customItem.category,
          unit: "个"
        });
        if (createRes.code === 200 && createRes.data) {
          const addRes = await this.$api.shopping.addToShoppingList({
            familyId: Number(this.currentFamily.id),
            ingredientId: createRes.data.id,
            quantity: parseFloat(this.customItem.quantity.trim()),
            priority: 1
          });
          if (addRes.code === 200) {
            const newItem = {
              id: addRes.data.id,
              ingredientId: createRes.data.id,
              name: this.customItem.name.trim(),
              quantity: this.customItem.quantity.trim(),
              unit: "个",
              category: this.customItem.category,
              purchased: false
            };
            this.shoppingList.push(newItem);
            this.hideAddModal();
            common_vendor.index.showToast({
              title: "添加成功",
              icon: "success"
            });
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/shopping/shopping.vue:412", "添加失败:", e);
        common_vendor.index.showToast({
          title: "添加失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    deleteItem(idx, item) {
      common_vendor.index.showModal({
        title: "删除确认",
        content: `确定要删除 ${item.name} 吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              await this.$api.shopping.deleteItem(item.id);
              this.shoppingList.splice(idx, 1);
              common_vendor.index.showToast({ title: "删除成功", icon: "success" });
            } catch (e) {
              common_vendor.index.showToast({ title: "删除失败", icon: "none" });
            }
          }
        }
      });
    },
    goToRecipe() {
      common_vendor.index.navigateTo({
        url: "/pages/shopping/recipe/recipe"
      });
    },
    goToHistory() {
      common_vendor.index.navigateTo({
        url: "/pages/shopping/shoppingHistory"
      });
    },
    showSummary() {
      common_vendor.index.showToast({
        title: "汇总清单",
        icon: "none"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a;
  return common_vendor.e({
    a: !$options.hasFamily
  }, !$options.hasFamily ? {
    b: common_assets._imports_5
  } : common_vendor.e({
    c: common_vendor.t(((_a = $options.currentFamily) == null ? void 0 : _a.name) || "我的家庭"),
    d: common_assets._imports_1$4,
    e: common_vendor.o((...args) => $options.showSummary && $options.showSummary(...args)),
    f: $data.recipeList.length > 0
  }, $data.recipeList.length > 0 ? {
    g: common_vendor.f($data.recipeList, (recipe, k0, i0) => {
      return {
        a: common_vendor.t(recipe.name),
        b: recipe.id
      };
    })
  } : {}, {
    h: common_vendor.o((...args) => $options.goToRecipe && $options.goToRecipe(...args)),
    i: common_assets._imports_2$1,
    j: common_vendor.o((...args) => $options.goToHistory && $options.goToHistory(...args)),
    k: common_vendor.t($options.totalItems),
    l: common_vendor.t($options.purchasedCount),
    m: common_vendor.t($options.pendingCount),
    n: common_vendor.t($options.progressPercent),
    o: $options.progressPercent + "%",
    p: common_vendor.o((...args) => $options.showAddCustomModal && $options.showAddCustomModal(...args)),
    q: common_vendor.t($options.purchasedCount),
    r: common_vendor.t($options.totalItems),
    s: common_vendor.f($data.shoppingList, (item, idx, i0) => {
      return common_vendor.e({
        a: item.purchased
      }, item.purchased ? {} : {}, {
        b: item.purchased ? 1 : "",
        c: common_vendor.o(($event) => $options.toggleItem(item), item.id),
        d: common_vendor.t(item.name),
        e: common_vendor.t(item.quantity),
        f: common_vendor.o(($event) => $options.deleteItem(idx, item), item.id),
        g: item.id
      });
    }),
    t: common_assets._imports_4$3,
    v: $data.shoppingList.length === 0
  }, $data.shoppingList.length === 0 ? {} : {}, {
    w: common_vendor.o((...args) => $options.clearPurchased && $options.clearPurchased(...args)),
    x: common_vendor.o((...args) => $options.completeShopping && $options.completeShopping(...args)),
    y: $data.showAddModal
  }, $data.showAddModal ? {
    z: common_assets._imports_1,
    A: common_vendor.o((...args) => $options.hideAddModal && $options.hideAddModal(...args)),
    B: $data.customItem.name,
    C: common_vendor.o(($event) => $data.customItem.name = $event.detail.value),
    D: $data.customItem.quantity,
    E: common_vendor.o(($event) => $data.customItem.quantity = $event.detail.value),
    F: common_vendor.t($data.customItem.category),
    G: common_vendor.o((...args) => $options.showCategoryPicker && $options.showCategoryPicker(...args)),
    H: common_vendor.o((...args) => $options.hideAddModal && $options.hideAddModal(...args)),
    I: common_vendor.o((...args) => $options.addCustomItem && $options.addCustomItem(...args)),
    J: common_vendor.o(() => {
    }),
    K: common_vendor.o((...args) => $options.hideAddModal && $options.hideAddModal(...args))
  } : {}, {
    L: $data.showAddModal
  }, $data.showAddModal ? {
    M: $data.categories,
    N: $data.categoryIndex,
    O: common_vendor.o((...args) => $options.onCategoryChange && $options.onCategoryChange(...args))
  } : {}));
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9ca6e162"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/shopping/shopping.js.map
