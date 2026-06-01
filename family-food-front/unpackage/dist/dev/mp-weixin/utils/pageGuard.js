"use strict";
const common_vendor = require("../common/vendor.js");
const store_index = require("../store/index.js");
function requireLogin() {
  const isLoggedIn = store_index.store.state.user.isLoggedIn;
  if (!isLoggedIn) {
    common_vendor.index.__f__("log", "at utils/pageGuard.js:41", "需要登录，跳转到登录页");
    common_vendor.index.reLaunch({
      url: "/pages/login/login"
    });
    return false;
  }
  return true;
}
exports.requireLogin = requireLogin;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/pageGuard.js.map
