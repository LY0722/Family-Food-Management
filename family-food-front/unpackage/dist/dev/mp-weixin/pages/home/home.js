"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const utils_pageGuard = require("../../utils/pageGuard.js");
const common_assets = require("../../common/assets.js");
const RecipeAndInventoryCard = () => "./RecipeAndInventoryCard.js";
const _sfc_main = {
  components: { RecipeAndInventoryCard },
  data() {
    return {
      tab: "recipe",
      selectedDate: /* @__PURE__ */ new Date(),
      calendarDays: [],
      scrollIntoView: "",
      viewStyle: "grid",
      headerHeight: 0,
      meals: [],
      suggestedItems: [],
      stockItems: [],
      loading: false
    };
  },
  computed: {
    ...common_vendor.mapState("user", ["userInfo", "currentFamily"]),
    userName() {
      var _a;
      return ((_a = this.userInfo) == null ? void 0 : _a.nickname) || "用户";
    },
    userAvatar() {
      var _a;
      const avatarUrl = (_a = this.userInfo) == null ? void 0 : _a.avatarUrl;
      if (!avatarUrl)
        return "/static/images/default-avatar.png";
      if (/^https?:\/\//.test(avatarUrl))
        return avatarUrl;
      let baseURL = utils_api.api.baseURL || "";
      if (baseURL.endsWith("/api")) {
        baseURL = baseURL.slice(0, -4);
      }
      return baseURL + (avatarUrl.startsWith("/") ? avatarUrl : "/" + avatarUrl);
    },
    viewStyleText() {
      return this.viewStyle === "grid" ? "列表" : "网格";
    },
    hasFamily() {
      var _a;
      const familyId = (_a = this.userInfo) == null ? void 0 : _a.familyId;
      const currentFamily = this.currentFamily;
      const result = !!(familyId || (currentFamily == null ? void 0 : currentFamily.id));
      common_vendor.index.__f__("log", "at pages/home/home.vue:131", "hasFamily计算:", { familyId, currentFamily, result, userInfo: this.userInfo });
      return result;
    }
  },
  onLoad() {
    common_vendor.index.__f__("log", "at pages/home/home.vue:136", "home.vue onLoad");
    if (!utils_pageGuard.requireLogin()) {
      return;
    }
    common_vendor.index.__f__("log", "at pages/home/home.vue:142", "userInfo:", this.userInfo);
    common_vendor.index.__f__("log", "at pages/home/home.vue:143", "hasFamily:", this.hasFamily);
    this.generateCalendarDays();
    this.loadData();
  },
  onShow() {
    common_vendor.index.__f__("log", "at pages/home/home.vue:148", "home.vue onShow");
    if (!utils_pageGuard.requireLogin()) {
      return;
    }
    common_vendor.index.__f__("log", "at pages/home/home.vue:154", "userInfo:", this.userInfo);
    common_vendor.index.__f__("log", "at pages/home/home.vue:155", "hasFamily:", this.hasFamily);
    this.$forceUpdate();
  },
  onReady() {
    this.$nextTick(() => {
      const query = common_vendor.index.createSelectorQuery().in(this);
      query.select(".fixed-header").boundingClientRect((data) => {
        if (data) {
          this.headerHeight = data.height;
        }
      }).exec();
      this.scrollIntoView = "day-30";
    });
  },
  methods: {
    generateCalendarDays() {
      const days = [];
      const today = /* @__PURE__ */ new Date();
      const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
      for (let i = -30; i <= 365; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        days.push({
          date,
          day: date.getDate(),
          week: weekDays[date.getDay()],
          fullDate: `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
        });
      }
      this.calendarDays = days;
    },
    isSelectedDate(day) {
      return day.date.toDateString() === this.selectedDate.toDateString();
    },
    selectDate(day) {
      this.selectedDate = day.date;
      this.loadData();
    },
    switchViewStyle() {
      this.viewStyle = this.viewStyle === "grid" ? "list" : "grid";
    },
    priorityText(priority) {
      const map = {
        high: "急需",
        medium: "建议",
        low: "可选"
      };
      return map[priority] || "";
    },
    statusText(status) {
      const map = {
        fresh: "新鲜",
        normal: "正常",
        warning: "临期",
        expired: "过期"
      };
      return map[status] || "";
    },
    handleRecipeClick(recipe) {
      common_vendor.index.navigateTo({
        url: `/pages/home/recipe/detail?id=${recipe.id}`
      });
    },
    handleItemClick(item) {
      common_vendor.index.navigateTo({
        url: `/pages/home/inventory/detail?id=${item.id}`
      });
    },
    goToHistory() {
      common_vendor.index.navigateTo({ url: "/pages/home/history" });
    },
    goToChart() {
      common_vendor.index.navigateTo({ url: "/pages/home/chart" });
    },
    goToAiChat() {
      common_vendor.index.navigateTo({ url: "/pages/home/ai/chat" });
    },
    inviteFamily() {
      common_vendor.index.navigateTo({ url: "/pages/profile/family/family" });
    },
    goToCreateFamily() {
      common_vendor.index.navigateTo({ url: "/pages/profile/family/create" });
    },
    goToJoinFamily() {
      common_vendor.index.navigateTo({ url: "/pages/profile/family/add-family" });
    },
    async loadData() {
      var _a, _b, _c, _d, _e, _f;
      common_vendor.index.__f__("log", "at pages/home/home.vue:246", "========== 开始加载数据 ==========");
      if (this.loading) {
        common_vendor.index.__f__("log", "at pages/home/home.vue:249", "正在加载中，跳过");
        return;
      }
      this.loading = true;
      common_vendor.index.__f__("log", "at pages/home/home.vue:254", "用户信息:", this.userInfo);
      common_vendor.index.__f__("log", "at pages/home/home.vue:255", "用户ID:", (_a = this.userInfo) == null ? void 0 : _a.id);
      common_vendor.index.__f__("log", "at pages/home/home.vue:256", "家庭ID:", (_b = this.userInfo) == null ? void 0 : _b.familyId);
      common_vendor.index.__f__("log", "at pages/home/home.vue:257", "当前家庭ID:", (_c = this.userInfo) == null ? void 0 : _c.currentFamilyId);
      try {
        const familyId = ((_d = this.userInfo) == null ? void 0 : _d.familyId) || ((_e = this.userInfo) == null ? void 0 : _e.currentFamilyId);
        const userId = (_f = this.userInfo) == null ? void 0 : _f.id;
        common_vendor.index.__f__("log", "at pages/home/home.vue:263", "使用的 familyId:", familyId);
        common_vendor.index.__f__("log", "at pages/home/home.vue:264", "使用的 userId:", userId);
        if (!familyId) {
          common_vendor.index.__f__("log", "at pages/home/home.vue:267", "familyId 为空，显示欢迎界面");
          return;
        }
        if (!userId) {
          common_vendor.index.__f__("error", "at pages/home/home.vue:272", "userId 为空，无法加载数据");
          common_vendor.index.showToast({
            title: "用户信息未加载",
            icon: "none"
          });
          return;
        }
        common_vendor.index.__f__("log", "at pages/home/home.vue:280", "开始并发请求菜谱和库存数据...");
        await Promise.all([
          this.loadTodayRecipes(familyId, userId),
          this.loadInventoryData(familyId)
        ]);
        common_vendor.index.__f__("log", "at pages/home/home.vue:286", "数据加载完成");
        common_vendor.index.__f__("log", "at pages/home/home.vue:287", "菜谱数量:", this.meals.length);
        common_vendor.index.__f__("log", "at pages/home/home.vue:288", "库存数量:", this.stockItems.length);
        common_vendor.index.__f__("log", "at pages/home/home.vue:289", "建议补充数量:", this.suggestedItems.length);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/home.vue:291", "加载数据失败:", error);
        common_vendor.index.showToast({
          title: "加载数据失败",
          icon: "none"
        });
      } finally {
        this.loading = false;
        common_vendor.index.__f__("log", "at pages/home/home.vue:298", "========== 数据加载结束 ==========");
      }
    },
    async loadTodayRecipes(familyId, userId) {
      try {
        common_vendor.index.__f__("log", "at pages/home/home.vue:303", "请求菜谱推荐:", familyId, userId, "选中日期:", this.selectedDate);
        const yesterday = new Date(this.selectedDate);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        let previousRecords = [];
        try {
          const recordRes = await utils_api.api.recipe.getPreviousDayRecords(
            familyId,
            userId,
            yesterdayStr
          );
          if (recordRes.code === 200 && Array.isArray(recordRes.data)) {
            previousRecords = recordRes.data;
            common_vendor.index.__f__("log", "at pages/home/home.vue:320", "获取到前一天记录:", previousRecords);
          }
        } catch (err) {
          common_vendor.index.__f__("error", "at pages/home/home.vue:323", "获取历史记录失败:", err);
        }
        if (previousRecords.length > 0) {
          this.setMealRecommendFromRecords(previousRecords);
          return;
        }
        const selectedDateStr = `${this.selectedDate.getFullYear()}-${String(this.selectedDate.getMonth() + 1).padStart(2, "0")}-${String(this.selectedDate.getDate()).padStart(2, "0")}`;
        const res = await utils_api.api.recipe.dateRecommend(Number(familyId), Number(userId), selectedDateStr);
        common_vendor.index.__f__("log", "at pages/home/home.vue:336", "菜谱响应:", res);
        if (res.code === 200 && res.data) {
          let recipes = res.data.recipes || res.data || [];
          if (!Array.isArray(recipes)) {
            common_vendor.index.__f__("warn", "at pages/home/home.vue:342", "菜谱数据格式不正确，期望数组，实际:", typeof recipes);
            recipes = [];
          }
          common_vendor.index.__f__("log", "at pages/home/home.vue:346", "菜谱数据:", recipes);
          const mealTypes = [
            { type: "breakfast", title: "早餐", time: "07:00-09:00" },
            { type: "lunch", title: "午餐", time: "11:30-13:30" },
            { type: "dinner", title: "晚餐", time: "18:00-20:00" }
          ];
          this.meals = mealTypes.map((meal) => ({
            ...meal,
            recipes: recipes.filter((r) => r.mealType === meal.type || !r.mealType).map((recipe) => ({
              id: recipe.id,
              name: recipe.name,
              desc: recipe.description || "暂无介绍",
              image: recipe.cover || recipe.imageUrl || "/static/images/recipe-default.jpg",
              ingredients: recipe.ingredients || []
            }))
          }));
          common_vendor.index.__f__("log", "at pages/home/home.vue:365", "处理后的菜谱数据:", this.meals);
        } else {
          common_vendor.index.__f__("warn", "at pages/home/home.vue:367", "菜谱响应格式不正确:", res);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/home.vue:370", "加载菜谱推荐失败:", error);
        common_vendor.index.showToast({
          title: "加载菜谱失败",
          icon: "none"
        });
      }
    },
    setMealRecommendFromRecords(records) {
      common_vendor.index.__f__("log", "at pages/home/home.vue:378", "使用前一天记录生成推荐:", records);
      const mealTypes = [
        { type: "breakfast", title: "早餐", time: "07:00-09:00" },
        { type: "lunch", title: "午餐", time: "11:30-13:30" },
        { type: "dinner", title: "晚餐", time: "18:00-20:00" }
      ];
      this.meals = mealTypes.map((meal) => ({
        ...meal,
        recipes: records.filter((r) => r.mealType === meal.type || meal.type === "breakfast" && !r.mealType).map((record) => {
          const recipe = record.recipe || record;
          return {
            id: recipe.id || record.id,
            name: recipe.name || record.name,
            desc: recipe.description || "昨日用餐",
            image: recipe.cover || recipe.imageUrl || record.cover || "/static/images/recipe-default.jpg",
            ingredients: recipe.ingredients || []
          };
        })
      }));
      common_vendor.index.__f__("log", "at pages/home/home.vue:405", "基于历史记录处理后的菜谱数据:", this.meals);
    },
    async loadInventoryData(familyId) {
      try {
        common_vendor.index.__f__("log", "at pages/home/home.vue:409", "请求库存数据:", familyId);
        const res = await utils_api.api.inventory.getFamilyInventory(Number(familyId));
        common_vendor.index.__f__("log", "at pages/home/home.vue:411", "库存响应:", res);
        if (res.code === 200 && res.data) {
          let inventory = res.data;
          if (!Array.isArray(inventory)) {
            common_vendor.index.__f__("warn", "at pages/home/home.vue:417", "库存数据格式不正确，期望数组，实际:", typeof inventory);
            inventory = [];
          }
          common_vendor.index.__f__("log", "at pages/home/home.vue:421", "库存数据:", inventory);
          this.stockItems = inventory.map((item) => ({
            id: item.id,
            name: item.ingredientName || item.name,
            icon: this.getIngredientIcon(item.ingredientName || item.name),
            quantity: item.quantity,
            unit: item.unit || "个",
            expiryDate: item.expiryDate,
            status: this.getInventoryStatus(item.expiryDate)
          }));
          this.suggestedItems = this.calculateSuggestedItems(inventory);
          common_vendor.index.__f__("log", "at pages/home/home.vue:435", "处理后的库存数据:", this.stockItems.length, "项");
          common_vendor.index.__f__("log", "at pages/home/home.vue:436", "建议补充:", this.suggestedItems);
        } else {
          common_vendor.index.__f__("warn", "at pages/home/home.vue:438", "库存响应格式不正确:", res);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/home.vue:441", "加载库存数据失败:", error);
        common_vendor.index.showToast({
          title: "加载库存失败",
          icon: "none"
        });
      }
    },
    getIngredientIcon(name) {
      const iconMap = {
        "鸡蛋": "🥚",
        "牛奶": "🥛",
        "面包": "🍞",
        "番茄": "🍅",
        "土豆": "🥔",
        "猪肉": "🥩",
        "鸡肉": "🍗",
        "牛肉": "🥩",
        "鱼": "🐟",
        "蔬菜": "🥬",
        "水果": "🍎",
        "米饭": "🍚",
        "面条": "🍜"
      };
      return iconMap[name] || "🥘";
    },
    getInventoryStatus(expiryDate) {
      if (!expiryDate)
        return "normal";
      const today = /* @__PURE__ */ new Date();
      const expiry = new Date(expiryDate);
      const diffDays = Math.ceil((expiry - today) / (1e3 * 60 * 60 * 24));
      if (diffDays < 0)
        return "expired";
      if (diffDays <= 3)
        return "warning";
      if (diffDays <= 7)
        return "normal";
      return "fresh";
    },
    calculateSuggestedItems(inventory) {
      const priorityMap = {
        "鸡蛋": "high",
        "牛奶": "high",
        "面包": "medium",
        "蔬菜": "medium",
        "水果": "low",
        "肉类": "high"
      };
      const suggested = [];
      inventory.forEach((item) => {
        const priority = priorityMap[item.ingredientName] || "low";
        const quantity = parseFloat(item.quantity) || 0;
        let suggestedQuantity = 0;
        let shouldSuggest = false;
        switch (priority) {
          case "high":
            if (quantity < 5) {
              suggestedQuantity = 10 - quantity;
              shouldSuggest = true;
            }
            break;
          case "medium":
            if (quantity < 3) {
              suggestedQuantity = 5 - quantity;
              shouldSuggest = true;
            }
            break;
          case "low":
            if (quantity < 2) {
              suggestedQuantity = 3 - quantity;
              shouldSuggest = true;
            }
            break;
        }
        if (shouldSuggest) {
          suggested.push({
            id: item.id,
            name: item.ingredientName,
            icon: this.getIngredientIcon(item.ingredientName),
            suggestedQuantity: Math.max(1, Math.round(suggestedQuantity)),
            unit: item.unit || "个",
            priority
          });
        }
      });
      return suggested.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    }
  }
};
if (!Array) {
  const _component_RecipeAndInventoryCard = common_vendor.resolveComponent("RecipeAndInventoryCard");
  _component_RecipeAndInventoryCard();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$options.hasFamily
  }, !$options.hasFamily ? {
    b: common_vendor.o((...args) => $options.goToCreateFamily && $options.goToCreateFamily(...args)),
    c: common_vendor.o((...args) => $options.goToJoinFamily && $options.goToJoinFamily(...args))
  } : {
    d: $options.userAvatar,
    e: common_vendor.t($options.userName),
    f: common_vendor.f($data.calendarDays, (day, index, i0) => {
      return {
        a: common_vendor.t(day.day),
        b: common_vendor.t(day.week),
        c: day.fullDate,
        d: "day-" + index,
        e: $options.isSelectedDate(day) ? 1 : "",
        f: common_vendor.o(($event) => $options.selectDate(day), day.fullDate)
      };
    }),
    g: $data.scrollIntoView,
    h: common_assets._imports_4$2,
    i: common_vendor.o((...args) => $options.goToHistory && $options.goToHistory(...args)),
    j: common_assets._imports_6,
    k: common_vendor.o((...args) => $options.goToChart && $options.goToChart(...args)),
    l: $data.headerHeight + "px",
    m: common_assets._imports_1$3,
    n: common_vendor.o((...args) => $options.goToAiChat && $options.goToAiChat(...args)),
    o: common_vendor.o((...args) => $options.inviteFamily && $options.inviteFamily(...args)),
    p: common_vendor.p({
      selectedDate: $data.selectedDate
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-07e72d3c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/home.js.map
