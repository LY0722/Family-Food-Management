"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  name: "NotificationsPage",
  data() {
    return {
      settings: {
        expiryReminder: true,
        expiryDays: 2,
        expiryTime: "09:00",
        dailyReport: false,
        weeklyReport: true,
        aiShopping: true,
        recipeRecommend: true,
        memberJoin: true,
        inventoryChange: false
      }
    };
  },
  onLoad() {
    this.loadSettings();
  },
  methods: {
    async loadSettings() {
      try {
        const response = await this.$api.user.getNotificationSettings();
        if (response.code === 200 && response.data) {
          this.settings = { ...this.settings, ...response.data };
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/settings/notifications.vue:205", "加载通知设置失败:", error);
      }
    },
    toggleSetting(key) {
      this.settings[key] = !this.settings[key];
    },
    setExpiryDays(days) {
      this.settings.expiryDays = days;
    },
    setExpiryTime(e) {
      this.settings.expiryTime = e.detail.value;
    },
    async handleSave() {
      common_vendor.index.showLoading({ title: "保存中..." });
      try {
        const response = await this.$api.user.updateNotificationSettings(this.settings);
        if (response.code === 200) {
          common_vendor.index.showToast({
            title: "保存成功",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: response.message || "保存失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/settings/notifications.vue:238", "保存通知设置失败:", error);
        common_vendor.index.showToast({
          title: "保存失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.settings.expiryReminder,
    b: common_vendor.o(($event) => $options.toggleSetting("expiryReminder")),
    c: $data.settings.expiryReminder
  }, $data.settings.expiryReminder ? {
    d: $data.settings.expiryDays === 1 ? 1 : "",
    e: common_vendor.o(($event) => $options.setExpiryDays(1)),
    f: $data.settings.expiryDays === 2 ? 1 : "",
    g: common_vendor.o(($event) => $options.setExpiryDays(2)),
    h: $data.settings.expiryDays === 3 ? 1 : "",
    i: common_vendor.o(($event) => $options.setExpiryDays(3))
  } : {}, {
    j: $data.settings.expiryReminder
  }, $data.settings.expiryReminder ? {
    k: common_vendor.t($data.settings.expiryTime),
    l: common_assets._imports_0$2,
    m: $data.settings.expiryTime,
    n: common_vendor.o((...args) => $options.setExpiryTime && $options.setExpiryTime(...args))
  } : {}, {
    o: $data.settings.dailyReport,
    p: common_vendor.o(($event) => $options.toggleSetting("dailyReport")),
    q: $data.settings.weeklyReport,
    r: common_vendor.o(($event) => $options.toggleSetting("weeklyReport")),
    s: $data.settings.aiShopping,
    t: common_vendor.o(($event) => $options.toggleSetting("aiShopping")),
    v: $data.settings.recipeRecommend,
    w: common_vendor.o(($event) => $options.toggleSetting("recipeRecommend")),
    x: $data.settings.memberJoin,
    y: common_vendor.o(($event) => $options.toggleSetting("memberJoin")),
    z: $data.settings.inventoryChange,
    A: common_vendor.o(($event) => $options.toggleSetting("inventoryChange")),
    B: common_vendor.o((...args) => $options.handleSave && $options.handleSave(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-98a6f22d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/profile/settings/notifications.js.map
