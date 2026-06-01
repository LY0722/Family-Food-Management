"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  name: "CreateFamilyPage",
  data() {
    return {
      loading: false,
      formData: {
        name: "",
        description: ""
      }
    };
  },
  computed: {
    ...common_vendor.mapState("user", ["userInfo"])
  },
  methods: {
    ...common_vendor.mapMutations("user", ["SET_CURRENT_FAMILY", "SET_USER_INFO"]),
    goBack() {
      common_vendor.index.navigateBack();
    },
    async handleCreate() {
      if (!this.formData.name.trim()) {
        common_vendor.index.showToast({
          title: "请输入家庭名称",
          icon: "none"
        });
        return;
      }
      this.loading = true;
      try {
        const userInfo = common_vendor.index.getStorageSync("userInfo");
        const response = await this.$api.family.create({
          userId: userInfo.id,
          name: this.formData.name.trim(),
          description: this.formData.description.trim()
        });
        if (response.code === 200) {
          const familyInfo = response.data;
          this.SET_CURRENT_FAMILY(familyInfo);
          const updatedUserInfo = {
            ...this.userInfo,
            familyId: familyInfo.id
          };
          this.SET_USER_INFO(updatedUserInfo);
          common_vendor.index.showToast({
            title: "创建成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.switchTab({
              url: "/pages/home/home"
            });
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: response.message || "创建失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/family/create.vue:140", "创建家庭失败:", error);
        common_vendor.index.showToast({
          title: "创建失败，请重试",
          icon: "none"
        });
      } finally {
        this.loading = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0$1,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: $data.formData.name,
    d: common_vendor.o(($event) => $data.formData.name = $event.detail.value),
    e: common_vendor.t($data.formData.name.length),
    f: $data.formData.description,
    g: common_vendor.o(($event) => $data.formData.description = $event.detail.value),
    h: common_vendor.t($data.formData.description.length),
    i: $data.loading,
    j: common_vendor.o((...args) => $options.handleCreate && $options.handleCreate(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1767e3f0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/profile/family/create.js.map
