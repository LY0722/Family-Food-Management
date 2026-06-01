"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const Loading = () => "../../../components/common/Loading.js";
const Toast = () => "../../../components/common/Toast.js";
const _sfc_main = {
  name: "RecipeCreatePage",
  components: {
    Loading,
    Toast
  },
  data() {
    return {
      loading: false,
      formData: {
        name: "",
        description: "",
        imageUrl: "",
        category: ""
      },
      categoryOptions: [
        { id: "meat", name: "荤菜" },
        { id: "vegetable", name: "素菜" },
        { id: "soup", name: "汤类" },
        { id: "staple", name: "主食" },
        { id: "dessert", name: "甜品" }
      ],
      categoryIndex: 0
    };
  },
  computed: {
    ...common_vendor.mapState("user", ["userInfo"])
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    chooseImage() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.uploadImage(res.tempFilePaths[0]);
        }
      });
    },
    async uploadImage(filePath) {
      this.loading = true;
      try {
        const response = await this.$api.user.uploadAvatar(filePath);
        if (response.code === 200) {
          this.formData.imageUrl = response.data;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/shopping/recipe/create.vue:220", "上传图片失败:", error);
        this.$refs.toast.show("上传图片失败", "error");
      } finally {
        this.loading = false;
      }
    },
    onCategoryChange(e) {
      this.categoryIndex = e.detail.value;
      this.formData.category = this.categoryOptions[this.categoryIndex].id;
    },
    async saveRecipe() {
      var _a;
      if (!this.validateForm()) {
        return;
      }
      this.loading = true;
      try {
        const response = await this.$api.recipe.create({
          ...this.formData,
          userId: (_a = this.userInfo) == null ? void 0 : _a.id
        });
        if (response.code === 200) {
          this.$refs.toast.show("创建成功", "success");
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          this.$refs.toast.show(response.message || "创建失败", "error");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/shopping/recipe/create.vue:255", "创建菜谱失败:", error);
        this.$refs.toast.show("创建失败，请稍后重试", "error");
      } finally {
        this.loading = false;
      }
    },
    validateForm() {
      if (!this.formData.name.trim()) {
        this.$refs.toast.show("请输入菜谱名称", "error");
        return false;
      }
      if (!this.formData.category) {
        this.$refs.toast.show("请选择菜谱分类", "error");
        return false;
      }
      return true;
    },
    getCategoryName(categoryId) {
      const category = this.categoryOptions.find((c) => c.id === categoryId);
      return category ? category.name : "";
    }
  }
};
if (!Array) {
  const _component_loading = common_vendor.resolveComponent("loading");
  const _component_toast = common_vendor.resolveComponent("toast");
  (_component_loading + _component_toast)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$1,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.o((...args) => $options.saveRecipe && $options.saveRecipe(...args)),
    d: $data.formData.imageUrl
  }, $data.formData.imageUrl ? {
    e: $data.formData.imageUrl
  } : {
    f: common_assets._imports_4$6
  }, {
    g: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args)),
    h: $data.formData.name,
    i: common_vendor.o(($event) => $data.formData.name = $event.detail.value),
    j: $data.formData.description,
    k: common_vendor.o(($event) => $data.formData.description = $event.detail.value),
    l: common_vendor.t($data.formData.category ? $options.getCategoryName($data.formData.category) : "请选择分类"),
    m: $data.categoryOptions,
    n: $data.categoryIndex,
    o: common_vendor.o((...args) => $options.onCategoryChange && $options.onCategoryChange(...args)),
    p: common_vendor.t($data.loading ? "保存中..." : "确认创建"),
    q: common_vendor.o((...args) => $options.saveRecipe && $options.saveRecipe(...args)),
    r: $data.loading,
    s: _ctx.showIngredientModal
  }, _ctx.showIngredientModal ? {
    t: common_assets._imports_1,
    v: common_vendor.o((...args) => _ctx.hideIngredientModal && _ctx.hideIngredientModal(...args)),
    w: _ctx.ingredientForm.name,
    x: common_vendor.o(($event) => _ctx.ingredientForm.name = $event.detail.value),
    y: _ctx.ingredientForm.quantity,
    z: common_vendor.o(($event) => _ctx.ingredientForm.quantity = $event.detail.value),
    A: common_vendor.t(_ctx.ingredientForm.unit || "请选择单位"),
    B: _ctx.unitOptions,
    C: _ctx.unitIndex,
    D: common_vendor.o((...args) => _ctx.onUnitChange && _ctx.onUnitChange(...args)),
    E: common_vendor.o((...args) => _ctx.hideIngredientModal && _ctx.hideIngredientModal(...args)),
    F: common_vendor.o((...args) => _ctx.confirmIngredient && _ctx.confirmIngredient(...args)),
    G: common_vendor.o(() => {
    }),
    H: common_vendor.o((...args) => _ctx.hideIngredientModal && _ctx.hideIngredientModal(...args))
  } : {}, {
    I: $data.loading
  }, $data.loading ? {
    J: common_vendor.p({
      text: "保存中..."
    })
  } : {}, {
    K: common_vendor.sr("toast", "b0c5ec10-1")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b0c5ec10"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/shopping/recipe/create.js.map
