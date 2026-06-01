"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_api = require("../../../utils/api.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  name: "AddFamily",
  computed: {
    ...common_vendor.mapState("user", ["userInfo"])
  },
  data() {
    return {
      familyId: "",
      loading: false
    };
  },
  methods: {
    ...common_vendor.mapMutations("user", ["SET_CURRENT_FAMILY", "SET_USER_INFO"]),
    goBack() {
      common_vendor.index.navigateBack();
    },
    async joinFamily() {
      if (!this.familyId.trim()) {
        common_vendor.index.showToast({
          title: "请输入家庭ID",
          icon: "none"
        });
        return;
      }
      this.loading = true;
      try {
        const userInfo = common_vendor.index.getStorageSync("userInfo");
        const response = await utils_api.api.family.join({
          userId: userInfo.id,
          familyCode: this.familyId.trim()
        });
        if (response.code === 200) {
          const familyInfo = {
            id: response.data.id,
            name: response.data.name,
            familyCode: response.data.inviteCode
          };
          this.SET_CURRENT_FAMILY(familyInfo);
          const updatedUserInfo = {
            ...this.userInfo,
            familyId: familyInfo.id
          };
          this.SET_USER_INFO(updatedUserInfo);
          common_vendor.index.showToast({
            title: "加入家庭成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: response.message || "加入失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/family/add-family.vue:104", "加入家庭失败:", error);
        common_vendor.index.showToast({
          title: "加入失败，请重试",
          icon: "none"
        });
      } finally {
        this.loading = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$1,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: $data.familyId,
    d: common_vendor.o(($event) => $data.familyId = $event.detail.value),
    e: !$data.loading
  }, !$data.loading ? {} : {}, {
    f: common_vendor.o((...args) => $options.joinFamily && $options.joinFamily(...args)),
    g: $data.loading
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-30ea3184"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/profile/family/add-family.js.map
