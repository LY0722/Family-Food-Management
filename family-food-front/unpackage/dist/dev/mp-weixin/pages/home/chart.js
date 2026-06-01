"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_pageGuard = require("../../utils/pageGuard.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  name: "ChartPage",
  data() {
    return {};
  },
  onLoad() {
    if (!utils_pageGuard.requireLogin()) {
      return;
    }
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0$1,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ab8b093a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/chart.js.map
