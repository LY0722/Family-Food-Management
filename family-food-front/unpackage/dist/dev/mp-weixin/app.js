"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const store_index = require("./store/index.js");
const utils_api = require("./utils/api.js");
const utils_storage = require("./utils/storage.js");
const utils_dateUtils = require("./utils/dateUtils.js");
if (!Math) {
  "./pages/login/login.js";
  "./pages/login/register.js";
  "./pages/home/home.js";
  "./pages/shopping/shopping.js";
  "./pages/shopping/shoppingHistory.js";
  "./pages/shopping/recipe/recipe.js";
  "./pages/shopping/recipe/create.js";
  "./pages/profile/profile.js";
  "./pages/profile/edit.js";
  "./pages/profile/settings/setting.js";
  "./pages/profile/settings/notifications.js";
  "./pages/profile/settings/feedback.js";
  "./pages/profile/reports/reports.js";
  "./pages/profile/reports/weekly.js";
  "./pages/profile/reports/monthly.js";
  "./pages/profile/family/family.js";
  "./pages/profile/family/add-member.js";
  "./pages/profile/family/create.js";
  "./pages/profile/family/add-family.js";
  "./pages/home/ai/chat.js";
  "./pages/home/history.js";
  "./pages/home/chart.js";
}
const _sfc_main = {
  name: "App",
  // 小程序生命周期
  onLaunch(options) {
    common_vendor.index.__f__("log", "at App.vue:7", "小程序启动", options);
    this.$store.dispatch("user/initUser").then((isLoggedIn) => {
      common_vendor.index.__f__("log", "at App.vue:11", "Vuex 用户初始化结果:", isLoggedIn);
      if (!isLoggedIn) {
        common_vendor.index.__f__("log", "at App.vue:15", "未登录，跳转登录页");
        common_vendor.index.reLaunch({
          url: "/pages/login/login"
        });
      } else {
        common_vendor.index.__f__("log", "at App.vue:21", "已登录，跳转到首页");
        common_vendor.index.switchTab({
          url: "/pages/home/home"
        });
      }
    });
  },
  onShow(options) {
    common_vendor.index.__f__("log", "at App.vue:30", "小程序显示", options);
  },
  onHide() {
    common_vendor.index.__f__("log", "at App.vue:34", "小程序隐藏");
  },
  // 小程序错误处理
  onError(error) {
    common_vendor.index.__f__("error", "at App.vue:39", "小程序发生错误:", error);
  },
  // 页面不存在处理
  onPageNotFound(res) {
    common_vendor.index.__f__("warn", "at App.vue:44", "页面不存在:", res);
    common_vendor.index.redirectTo({
      url: "/pages/login/login"
    });
  }
};
const UniPopup = () => "./node-modules/@dcloudio/uni-ui/lib/uni-popup/uni-popup.js";
const UniPopupMessage = () => "./node-modules/@dcloudio/uni-ui/lib/uni-popup-message/uni-popup-message.js";
const UniPopupDialog = () => "./node-modules/@dcloudio/uni-ui/lib/uni-popup-dialog/uni-popup-dialog.js";
const appMethods = {
  showToast(message, type = "success") {
    const iconMap = {
      success: "success",
      error: "error",
      warning: "none",
      info: "none"
    };
    common_vendor.index.showToast({
      title: message,
      icon: iconMap[type] || "none",
      duration: 2e3,
      mask: true
    });
  },
  showLoading(text = "加载中...") {
    common_vendor.index.showLoading({
      title: text,
      mask: true
    });
  },
  hideLoading() {
    common_vendor.index.hideLoading();
  },
  showConfirm(options) {
    return new Promise((resolve, reject) => {
      common_vendor.index.showModal({
        title: options.title || "提示",
        content: options.content || "",
        showCancel: !options.hideCancel,
        cancelText: options.cancelText || "取消",
        confirmText: options.confirmText || "确定",
        confirmColor: options.confirmColor || "#07c160",
        success: (res) => {
          if (res.confirm) {
            resolve();
          } else if (res.cancel) {
            reject(new Error("用户取消"));
          }
        },
        fail: (err) => {
          reject(new Error("弹窗失败: " + err.errMsg));
        }
      });
    });
  }
};
function createApp() {
  const app2 = common_vendor.createApp(_sfc_main);
  app2.config.globalProperties.$api = utils_api.api;
  app2.config.globalProperties.$storage = utils_storage.storage;
  app2.config.globalProperties.$date = utils_dateUtils.dateUtils;
  app2.config.globalProperties.$app = appMethods;
  app2.component("uni-popup", UniPopup);
  app2.component("uni-popup-message", UniPopupMessage);
  app2.component("uni-popup-dialog", UniPopupDialog);
  app2.use(store_index.store);
  return app2;
}
const app = createApp();
app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
