"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: "加载中..."
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.show
  }, $props.show ? {
    b: common_vendor.t($props.text)
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-35442499"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/common/Loading.js.map
