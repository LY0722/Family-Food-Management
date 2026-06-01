"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  props: {
    title: {
      type: String,
      default: ""
    },
    showBack: {
      type: Boolean,
      default: true
    },
    backgroundColor: {
      type: String,
      default: "#ffffff"
    },
    color: {
      type: String,
      default: "#000000"
    }
  },
  data() {
    return {
      statusBarHeight: 0,
      navBarHeight: 44
    };
  },
  computed: {
    statusBarStyle() {
      return {
        height: `${this.statusBarHeight}px`,
        backgroundColor: this.backgroundColor
      };
    },
    navBarStyle() {
      return {
        backgroundColor: this.backgroundColor,
        color: this.color
      };
    }
  },
  mounted() {
    this.getSystemInfo();
  },
  methods: {
    getSystemInfo() {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      this.statusBarHeight = systemInfo.statusBarHeight || 0;
      const menuButtonInfo = common_vendor.index.getMenuButtonBoundingClientRect();
      if (menuButtonInfo) {
        this.navBarHeight = menuButtonInfo.height + (menuButtonInfo.top - this.statusBarHeight) * 2;
      }
    },
    handleBack() {
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.s($options.statusBarStyle),
    b: $props.showBack
  }, $props.showBack ? {
    c: common_assets._imports_0$2,
    d: common_vendor.o((...args) => $options.handleBack && $options.handleBack(...args))
  } : {}, {
    e: common_vendor.t($props.title),
    f: common_vendor.s($options.navBarStyle)
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6014eabf"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/common/NavBar.js.map
