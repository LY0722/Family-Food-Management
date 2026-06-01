"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_pageGuard = require("../../../utils/pageGuard.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  name: "RecipePage",
  data() {
    return {
      activeCategory: "all",
      searchKeyword: "",
      recipeList: [],
      loading: false,
      noMore: false,
      page: 1,
      pageSize: 10,
      categories: [
        { id: "all", name: "全部" },
        { id: "meat", name: "荤菜" },
        { id: "vegetable", name: "素菜" },
        { id: "soup", name: "汤类" },
        { id: "staple", name: "主食" },
        { id: "dessert", name: "甜品" }
      ]
    };
  },
  computed: {
    ...common_vendor.mapState("user", ["userInfo"])
  },
  onLoad() {
    if (!utils_pageGuard.requireLogin()) {
      return;
    }
    this.loadRecipes();
  },
  onShow() {
    if (!utils_pageGuard.requireLogin()) {
      return;
    }
    this.loadRecipes();
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    selectCategory(categoryId) {
      this.activeCategory = categoryId;
      this.page = 1;
      this.noMore = false;
      this.recipeList = [];
      this.loadRecipes();
    },
    async loadRecipes() {
      if (this.loading || this.noMore)
        return;
      this.loading = true;
      try {
        const params = {
          category: this.activeCategory === "all" ? void 0 : this.activeCategory,
          keyword: this.searchKeyword || void 0,
          page: this.page - 1,
          pageSize: this.pageSize
        };
        Object.keys(params).forEach((key) => {
          if (params[key] === void 0) {
            delete params[key];
          }
        });
        const response = await this.$api.recipe.getRecipes(params);
        if (response.code === 200) {
          const list = response.data.list || [];
          if (this.page === 1) {
            this.recipeList = list;
          } else {
            this.recipeList = [...this.recipeList, ...list];
          }
          this.noMore = list.length < this.pageSize;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/shopping/recipe/recipe.vue:206", "加载菜谱失败:", error);
      } finally {
        this.loading = false;
      }
    },
    loadMore() {
      if (!this.loading && !this.noMore) {
        this.page++;
        this.loadRecipes();
      }
    },
    handleSearch() {
      this.page = 1;
      this.noMore = false;
      this.recipeList = [];
      this.loadRecipes();
    },
    viewRecipeDetail(recipe) {
      common_vendor.index.navigateTo({
        url: `/pages/recipe/detail?id=${recipe.id}`
      });
    },
    addToShoppingList(recipe) {
      common_vendor.index.showModal({
        title: "添加到采购清单",
        content: `确定要将 ${recipe.name} 的食材添加到采购清单吗？`,
        success: async (res) => {
          var _a;
          if (res.confirm) {
            try {
              const response = await this.$api.shopping.addBatch({
                familyId: Number((_a = this.currentFamily) == null ? void 0 : _a.id),
                recipeId: recipe.id
              });
              if (response.code === 200) {
                common_vendor.index.showToast({
                  title: "添加成功",
                  icon: "success"
                });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/shopping/recipe/recipe.vue:251", "添加失败:", error);
            }
          }
        }
      });
    },
    createRecipe() {
      common_vendor.index.navigateTo({
        url: "/pages/shopping/recipe/create"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$1,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_assets._imports_4$5,
    d: common_vendor.o((...args) => $options.createRecipe && $options.createRecipe(...args)),
    e: common_assets._imports_2$3,
    f: common_vendor.o((...args) => $options.handleSearch && $options.handleSearch(...args)),
    g: $data.searchKeyword,
    h: common_vendor.o(($event) => $data.searchKeyword = $event.detail.value),
    i: common_vendor.f($data.categories, (category, k0, i0) => {
      return {
        a: common_vendor.t(category.name),
        b: category.id,
        c: $data.activeCategory === category.id ? 1 : "",
        d: common_vendor.o(($event) => $options.selectCategory(category.id), category.id)
      };
    }),
    j: common_vendor.f($data.recipeList, (recipe, k0, i0) => {
      return common_vendor.e({
        a: recipe.imageUrl || "/static/images/recipe-default.jpg",
        b: common_vendor.t(recipe.cookingTime || 30),
        c: common_vendor.t(recipe.name),
        d: recipe.category
      }, recipe.category ? {
        e: common_vendor.t(recipe.category)
      } : {}, {
        f: recipe.difficulty
      }, recipe.difficulty ? {
        g: common_vendor.t(recipe.difficulty)
      } : {}, {
        h: common_vendor.o(($event) => $options.addToShoppingList(recipe), recipe.id),
        i: recipe.id,
        j: common_vendor.o(($event) => $options.viewRecipeDetail(recipe), recipe.id)
      });
    }),
    k: common_assets._imports_3$1,
    l: common_assets._imports_4$5,
    m: $data.loading
  }, $data.loading ? {} : {}, {
    n: $data.noMore && $data.recipeList.length > 0
  }, $data.noMore && $data.recipeList.length > 0 ? {} : {}, {
    o: $data.recipeList.length === 0 && !$data.loading
  }, $data.recipeList.length === 0 && !$data.loading ? {
    p: common_assets._imports_4$4
  } : {}, {
    q: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args)),
    r: common_vendor.o((...args) => $options.createRecipe && $options.createRecipe(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-32608ed2"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/shopping/recipe/recipe.js.map
