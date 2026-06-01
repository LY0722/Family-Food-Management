"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "RecipeAndInventoryCard",
  props: {
    selectedDate: {
      type: Date,
      default: () => /* @__PURE__ */ new Date()
    }
  },
  data() {
    return {
      activeTab: "recipe",
      loading: false,
      meals: [
        { type: "breakfast", label: "早餐" },
        { type: "lunch", label: "午餐" },
        { type: "dinner", label: "晚餐" }
      ],
      mealsMap: {
        breakfast: "早餐",
        lunch: "午餐",
        dinner: "晚餐"
      },
      mealRecommend: {
        breakfast: null,
        lunch: null,
        dinner: null
      },
      showEditMeal: false,
      editMealType: "",
      showCustomDish: false,
      customDishName: "",
      showRecipePicker: false,
      myRecipeList: [],
      suggestList: [],
      inventoryList: [],
      // 本地缓存：保存每个日期的用餐记录
      mealRecordsCache: {}
    };
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$store && this.$api) {
        this.loadDayMealRecords();
        this.loadSuggestList();
        this.loadInventoryList();
      }
    });
  },
  watch: {
    selectedDate: {
      handler(newVal) {
        if (newVal) {
          this.loadDayMealRecords();
        }
      },
      deep: true
    },
    mealRecommend: {
      handler(newVal) {
        this.saveToCache(newVal);
      },
      deep: true
    }
  },
  methods: {
    // 获取当前日期的缓存key
    getDateKey() {
      return `${this.selectedDate.getFullYear()}-${String(this.selectedDate.getMonth() + 1).padStart(2, "0")}-${String(this.selectedDate.getDate()).padStart(2, "0")}`;
    },
    // 保存到缓存
    saveToCache(mealData) {
      const dateKey = this.getDateKey();
      this.$set(this.mealRecordsCache, dateKey, {
        breakfast: mealData.breakfast,
        lunch: mealData.lunch,
        dinner: mealData.dinner
      });
    },
    // 从缓存加载
    loadFromCache() {
      const dateKey = this.getDateKey();
      const cached = this.mealRecordsCache[dateKey];
      if (cached) {
        this.mealRecommend = {
          breakfast: cached.breakfast,
          lunch: cached.lunch,
          dinner: cached.dinner
        };
        return true;
      }
      return false;
    },
    switchTab(tab) {
      this.activeTab = tab;
      if (tab === "ingredient") {
        this.loadSuggestList();
        this.loadInventoryList();
      }
    },
    async loadDayMealRecords() {
      var _a, _b;
      const familyId = (_b = (_a = this.$store.state.user) == null ? void 0 : _a.currentFamily) == null ? void 0 : _b.id;
      if (!familyId)
        return;
      const dateStr = `${this.selectedDate.getFullYear()}-${String(this.selectedDate.getMonth() + 1).padStart(2, "0")}-${String(this.selectedDate.getDate()).padStart(2, "0")}`;
      this.loading = true;
      try {
        const res = await this.$api.recipe.getDayRecords(Number(familyId), dateStr);
        if (res.code === 200 && res.data) {
          const records = res.data;
          const newMealRecommend = {
            breakfast: null,
            lunch: null,
            dinner: null
          };
          this.meals.forEach((meal) => {
            const record = records.find((r) => r.mealType === meal.type);
            if (record) {
              newMealRecommend[meal.type] = {
                id: record.id,
                name: record.name,
                description: record.description,
                cover: record.cover
              };
            }
          });
          this.mealRecommend = newMealRecommend;
        } else {
          if (!this.loadFromCache()) {
            this.mealRecommend = {
              breakfast: null,
              lunch: null,
              dinner: null
            };
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/home/RecipeAndInventoryCard.vue:262", "加载用餐记录失败:", e);
        if (!this.loadFromCache()) {
          this.mealRecommend = {
            breakfast: null,
            lunch: null,
            dinner: null
          };
        }
      } finally {
        this.loading = false;
      }
    },
    openEditMeal(type) {
      this.editMealType = type;
      this.showEditMeal = true;
    },
    closeEditMeal() {
      this.showEditMeal = false;
    },
    async chooseFromRecipe() {
      this.showEditMeal = false;
      this.showRecipePicker = true;
      await this.loadMyRecipeList();
    },
    async loadMyRecipeList() {
      this.loading = true;
      try {
        const res = await this.$api.recipe.getRecipes({ page: 0, pageSize: 100 });
        if (res.code === 200 && res.data.list) {
          this.myRecipeList = res.data.list.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            cover: item.imageUrl || item.cover
          }));
        } else {
          this.myRecipeList = [];
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/home/RecipeAndInventoryCard.vue:306", "加载菜谱列表失败:", e);
        this.myRecipeList = [];
      } finally {
        this.loading = false;
      }
    },
    async selectRecipe(recipe) {
      var _a, _b, _c, _d;
      const familyId = (_b = (_a = this.$store.state.user) == null ? void 0 : _a.currentFamily) == null ? void 0 : _b.id;
      const userId = (_d = (_c = this.$store.state.user) == null ? void 0 : _c.userInfo) == null ? void 0 : _d.id;
      if (!familyId || !userId) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        return;
      }
      this.loading = true;
      try {
        const dateStr = `${this.selectedDate.getFullYear()}-${String(this.selectedDate.getMonth() + 1).padStart(2, "0")}-${String(this.selectedDate.getDate()).padStart(2, "0")}`;
        const res = await this.$api.recipe.saveMealRecord(Number(familyId), Number(userId), Number(recipe.id), this.editMealType, dateStr);
        if (res.code === 200) {
          this.$set(this.mealRecommend, this.editMealType, recipe);
          this.showRecipePicker = false;
          common_vendor.index.showToast({ title: "保存成功", icon: "success" });
        } else {
          common_vendor.index.showToast({ title: res.message || "保存失败", icon: "none" });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/home/RecipeAndInventoryCard.vue:333", "保存用餐记录失败:", e);
        common_vendor.index.showToast({ title: "保存失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    closeRecipePicker() {
      this.showRecipePicker = false;
    },
    inputCustomDish() {
      this.showEditMeal = false;
      this.customDishName = "";
      this.showCustomDish = true;
    },
    closeCustomDish() {
      this.showCustomDish = false;
    },
    async confirmCustomDish() {
      var _a, _b, _c, _d;
      if (!this.customDishName.trim()) {
        common_vendor.index.showToast({ title: "请输入菜品名称", icon: "none" });
        return;
      }
      const familyId = (_b = (_a = this.$store.state.user) == null ? void 0 : _a.currentFamily) == null ? void 0 : _b.id;
      const userId = (_d = (_c = this.$store.state.user) == null ? void 0 : _c.userInfo) == null ? void 0 : _d.id;
      if (!familyId || !userId) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        return;
      }
      this.loading = true;
      try {
        const dateStr = `${this.selectedDate.getFullYear()}-${String(this.selectedDate.getMonth() + 1).padStart(2, "0")}-${String(this.selectedDate.getDate()).padStart(2, "0")}`;
        const res = await this.$api.recipe.saveMealRecord(Number(familyId), Number(userId), 0, this.editMealType, dateStr, this.customDishName.trim());
        if (res.code === 200) {
          this.$set(this.mealRecommend, this.editMealType, {
            id: 0,
            name: this.customDishName.trim(),
            description: "自定义菜品",
            cover: ""
          });
          common_vendor.index.showToast({ title: "保存成功", icon: "success" });
          this.showCustomDish = false;
        } else {
          common_vendor.index.showToast({ title: res.message || "保存失败", icon: "none" });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/home/RecipeAndInventoryCard.vue:384", "保存用餐记录失败:", e);
        common_vendor.index.showToast({ title: "保存失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    async loadSuggestList() {
      var _a, _b;
      const familyId = (_b = (_a = this.$store.state.user) == null ? void 0 : _a.currentFamily) == null ? void 0 : _b.id;
      if (!familyId)
        return;
      this.loading = true;
      try {
        const res = await this.$api.inventory.getLowStock(Number(familyId));
        if (res.code === 200 && res.data.items) {
          this.suggestList = res.data.items.map((item) => ({
            name: item.ingredientName,
            urgentText: this.getUrgentText(item.suggestedQuantity, item.quantity),
            urgentLevel: this.getUrgentLevel(item.suggestedQuantity, item.quantity)
          }));
        } else {
          this.suggestList = [];
        }
      } catch (e) {
        this.suggestList = [];
      } finally {
        this.loading = false;
      }
    },
    getUrgentText(suggested, current) {
      if (current === 0)
        return "非常紧急";
      if (current < suggested * 0.3)
        return "紧急";
      if (current < suggested * 0.6)
        return "关注";
      return "充足";
    },
    getUrgentLevel(suggested, current) {
      if (current === 0)
        return "urgent-high";
      if (current < suggested * 0.3)
        return "urgent-mid";
      if (current < suggested * 0.6)
        return "urgent-low";
      return "";
    },
    async loadInventoryList() {
      var _a, _b;
      const familyId = (_b = (_a = this.$store.state.user) == null ? void 0 : _a.currentFamily) == null ? void 0 : _b.id;
      if (!familyId)
        return;
      this.loading = true;
      try {
        const res = await this.$api.inventory.getFamilyInventory(Number(familyId));
        if (res.code === 200 && Array.isArray(res.data)) {
          this.inventoryList = res.data.map((item) => ({
            name: item.ingredientName,
            status: this.getInventoryStatus(item.expiryDate),
            statusText: this.getInventoryStatusText(item.expiryDate)
          }));
        } else {
          this.inventoryList = [];
        }
      } catch (e) {
        this.inventoryList = [];
      } finally {
        this.loading = false;
      }
    },
    getInventoryStatus(expiryDate) {
      if (!expiryDate)
        return "normal";
      const today = /* @__PURE__ */ new Date();
      const expiry = new Date(expiryDate);
      const diff = (expiry - today) / (1e3 * 3600 * 24);
      if (diff < 0)
        return "expired";
      if (diff < 3)
        return "warning";
      return "normal";
    },
    getInventoryStatusText(expiryDate) {
      if (!expiryDate)
        return "新鲜";
      const today = /* @__PURE__ */ new Date();
      const expiry = new Date(expiryDate);
      const diff = (expiry - today) / (1e3 * 3600 * 24);
      if (diff < 0)
        return "过期";
      if (diff < 3)
        return "临期";
      return "新鲜";
    }
  }
};
if (!Array) {
  const _component_loading = common_vendor.resolveComponent("loading");
  _component_loading();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.activeTab === "recipe" ? 1 : "",
    b: common_vendor.o(($event) => $options.switchTab("recipe")),
    c: $data.activeTab === "ingredient" ? 1 : "",
    d: common_vendor.o(($event) => $options.switchTab("ingredient")),
    e: common_vendor.f($data.meals, (meal, k0, i0) => {
      var _a;
      return {
        a: common_vendor.t(meal.label),
        b: common_vendor.t(((_a = $data.mealRecommend[meal.type]) == null ? void 0 : _a.name) || "点击编辑"),
        c: common_vendor.o(($event) => $options.openEditMeal(meal.type), meal.type),
        d: meal.type
      };
    }),
    f: $data.activeTab === "recipe",
    g: common_vendor.f($data.suggestList, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: common_vendor.t(item.urgentText),
        c: common_vendor.n(item.urgentLevel),
        d: item.name
      };
    }),
    h: $data.suggestList.length === 0
  }, $data.suggestList.length === 0 ? {} : {}, {
    i: common_vendor.f($data.inventoryList, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: common_vendor.t(item.statusText),
        c: common_vendor.n(item.status),
        d: item.name
      };
    }),
    j: $data.inventoryList.length === 0
  }, $data.inventoryList.length === 0 ? {} : {}, {
    k: $data.activeTab === "ingredient",
    l: $data.showEditMeal
  }, $data.showEditMeal ? {
    m: common_vendor.t($data.mealsMap[$data.editMealType]),
    n: common_vendor.o((...args) => $options.closeEditMeal && $options.closeEditMeal(...args)),
    o: common_vendor.o((...args) => $options.chooseFromRecipe && $options.chooseFromRecipe(...args)),
    p: common_vendor.o((...args) => $options.inputCustomDish && $options.inputCustomDish(...args)),
    q: common_vendor.o(() => {
    }),
    r: common_vendor.o((...args) => $options.closeEditMeal && $options.closeEditMeal(...args))
  } : {}, {
    s: $data.showCustomDish
  }, $data.showCustomDish ? {
    t: common_vendor.o((...args) => $options.closeCustomDish && $options.closeCustomDish(...args)),
    v: $data.customDishName,
    w: common_vendor.o(($event) => $data.customDishName = $event.detail.value),
    x: common_vendor.o((...args) => $options.closeCustomDish && $options.closeCustomDish(...args)),
    y: common_vendor.o((...args) => $options.confirmCustomDish && $options.confirmCustomDish(...args)),
    z: common_vendor.o(() => {
    }),
    A: common_vendor.o((...args) => $options.closeCustomDish && $options.closeCustomDish(...args))
  } : {}, {
    B: $data.showRecipePicker
  }, $data.showRecipePicker ? common_vendor.e({
    C: common_vendor.o((...args) => $options.closeRecipePicker && $options.closeRecipePicker(...args)),
    D: common_vendor.f($data.myRecipeList, (recipe, k0, i0) => {
      return {
        a: common_vendor.t(recipe.name),
        b: recipe.id,
        c: common_vendor.o(($event) => $options.selectRecipe(recipe), recipe.id)
      };
    }),
    E: $data.myRecipeList.length === 0
  }, $data.myRecipeList.length === 0 ? {} : {}, {
    F: common_vendor.o(() => {
    }),
    G: common_vendor.o((...args) => $options.closeRecipePicker && $options.closeRecipePicker(...args))
  }) : {}, {
    H: $data.loading
  }, $data.loading ? {} : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d5135d23"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/RecipeAndInventoryCard.js.map
