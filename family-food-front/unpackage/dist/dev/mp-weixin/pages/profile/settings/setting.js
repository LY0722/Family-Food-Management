"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const Loading = () => "../../../components/common/Loading.js";
const Toast = () => "../../../components/common/Toast.js";
const _sfc_main = {
  name: "SettingsIndex",
  components: {
    Loading,
    Toast
  },
  data() {
    return {
      loading: false,
      refreshing: false,
      notificationEnabled: true,
      soundEnabled: true,
      vibrationEnabled: false,
      cacheSize: "12.5MB"
    };
  },
  computed: {
    ...common_vendor.mapState("user", ["userInfo"])
  },
  onShow() {
    this.loadSettings();
  },
  methods: {
    ...common_vendor.mapMutations("user", ["SET_USER_INFO"]),
    async loadSettings() {
      this.loading = true;
      try {
        const settings = common_vendor.index.getStorageSync("app_settings") || {};
        this.notificationEnabled = settings.notificationEnabled !== false;
        this.soundEnabled = settings.soundEnabled !== false;
        this.vibrationEnabled = settings.vibrationEnabled || false;
        await this.calculateCacheSize();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/settings/setting.vue:226", "加载设置失败:", error);
      } finally {
        this.loading = false;
      }
    },
    async onRefresh() {
      this.refreshing = true;
      await this.loadSettings();
      this.refreshing = false;
    },
    async calculateCacheSize() {
      this.cacheSize = "12.5MB";
    },
    toggleNotification(e) {
      this.notificationEnabled = e.detail.value;
      this.saveSettings();
      this.$refs.toast.show(this.notificationEnabled ? "通知已开启" : "通知已关闭");
    },
    toggleSound(e) {
      this.soundEnabled = e.detail.value;
      this.saveSettings();
      this.$refs.toast.show(this.soundEnabled ? "声音已开启" : "声音已关闭");
    },
    toggleVibration(e) {
      this.vibrationEnabled = e.detail.value;
      this.saveSettings();
      this.$refs.toast.show(this.vibrationEnabled ? "振动已开启" : "振动已关闭");
    },
    saveSettings() {
      const settings = {
        notificationEnabled: this.notificationEnabled,
        soundEnabled: this.soundEnabled,
        vibrationEnabled: this.vibrationEnabled
      };
      common_vendor.index.setStorageSync("app_settings", settings);
    },
    goToPrivacySettings() {
      common_vendor.index.navigateTo({
        url: "/pages/profile/settings/privacy"
      });
    },
    goToDataExport() {
      common_vendor.index.navigateTo({
        url: "/pages/profile/settings/export"
      });
    },
    goToHelpCenter() {
      common_vendor.index.navigateTo({
        url: "/pages/profile/settings/help"
      });
    },
    contactSupport() {
      common_vendor.index.makePhoneCall({
        phoneNumber: "400-123-4567"
      });
    },
    aboutApp() {
      common_vendor.index.navigateTo({
        url: "/pages/profile/settings/about"
      });
    },
    submitFeedback() {
      common_vendor.index.navigateTo({
        url: "/pages/profile/settings/feedback"
      });
    },
    rateApp() {
      this.$refs.toast.show("感谢您的评价！");
    },
    clearCache() {
      common_vendor.index.showModal({
        title: "清除缓存",
        content: "确定要清除所有缓存数据吗？",
        success: (res) => {
          if (res.confirm) {
            this.cacheSize = "0MB";
            this.$refs.toast.show("缓存已清除");
          }
        }
      });
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    handleLogout() {
      common_vendor.index.showModal({
        title: "确认退出",
        content: "确定要退出登录吗？",
        success: async (res) => {
          if (res.confirm) {
            this.loading = true;
            try {
              await this.$api.user.logout();
              common_vendor.index.removeStorageSync("token");
              common_vendor.index.removeStorageSync("userInfo");
              this.SET_USER_INFO(null);
              this.$refs.toast.show("退出成功");
              setTimeout(() => {
                common_vendor.index.reLaunch({
                  url: "/pages/index/index"
                });
              }, 1500);
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/profile/settings/setting.vue:357", "退出失败:", error);
              this.$refs.toast.show("退出失败");
            } finally {
              this.loading = false;
            }
          }
        }
      });
    },
    showDeleteConfirm() {
      common_vendor.index.showModal({
        title: "删除账户",
        content: "此操作将永久删除您的账户和所有数据，确定要继续吗？",
        confirmColor: "#ff6b6b",
        success: (res) => {
          if (res.confirm) {
            this.$refs.toast.show("账户删除功能开发中");
          }
        }
      });
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
    c: common_assets._imports_1$6,
    d: $data.notificationEnabled,
    e: common_vendor.o((...args) => $options.toggleNotification && $options.toggleNotification(...args)),
    f: $data.soundEnabled,
    g: common_vendor.o((...args) => $options.toggleSound && $options.toggleSound(...args)),
    h: $data.vibrationEnabled,
    i: common_vendor.o((...args) => $options.toggleVibration && $options.toggleVibration(...args)),
    j: common_assets._imports_0$2,
    k: common_vendor.o((...args) => $options.goToPrivacySettings && $options.goToPrivacySettings(...args)),
    l: common_assets._imports_0$2,
    m: common_vendor.o((...args) => $options.goToDataExport && $options.goToDataExport(...args)),
    n: common_vendor.t($data.cacheSize),
    o: common_vendor.o((...args) => $options.clearCache && $options.clearCache(...args)),
    p: common_assets._imports_0$2,
    q: common_vendor.o((...args) => $options.goToHelpCenter && $options.goToHelpCenter(...args)),
    r: common_assets._imports_0$2,
    s: common_vendor.o((...args) => $options.contactSupport && $options.contactSupport(...args)),
    t: common_assets._imports_0$2,
    v: common_vendor.o((...args) => $options.aboutApp && $options.aboutApp(...args)),
    w: common_assets._imports_0$2,
    x: common_vendor.o((...args) => $options.submitFeedback && $options.submitFeedback(...args)),
    y: common_assets._imports_0$2,
    z: common_vendor.o((...args) => $options.rateApp && $options.rateApp(...args)),
    A: common_assets._imports_3$2,
    B: common_vendor.o((...args) => $options.handleLogout && $options.handleLogout(...args)),
    C: common_assets._imports_4$3,
    D: common_vendor.o((...args) => $options.showDeleteConfirm && $options.showDeleteConfirm(...args)),
    E: $data.refreshing,
    F: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args)),
    G: $data.loading
  }, $data.loading ? {
    H: common_vendor.p({
      text: "加载中..."
    })
  } : {}, {
    I: common_vendor.sr("toast", "9e09b7fc-1")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9e09b7fc"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/profile/settings/setting.js.map
