"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "Toast",
  data() {
    return {
      message: "",
      type: "success",
      visible: false,
      timer: null
    };
  },
  computed: {
    toastClass() {
      return `toast-${this.type}`;
    },
    toastEmoji() {
      const emojis = {
        success: "✓",
        error: "✕",
        warning: "⚠",
        info: "ℹ"
      };
      return emojis[this.type] || emojis.info;
    }
  },
  methods: {
    show(message, type = "success", duration = 2e3) {
      common_vendor.index.__f__("log", "at components/common/Toast.vue:45", "Toast.show called:", { message, type, duration });
      this.message = message;
      this.type = type;
      this.visible = true;
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => {
        this.hide();
      }, duration);
    },
    hide() {
      this.visible = false;
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.visible
  }, $data.visible ? {
    b: common_vendor.t($options.toastEmoji),
    c: common_vendor.t($data.message),
    d: common_vendor.n($options.toastClass)
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b7aa574d"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/common/Toast.js.map
