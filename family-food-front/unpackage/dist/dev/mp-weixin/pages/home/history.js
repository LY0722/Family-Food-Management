"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_pageGuard = require("../../utils/pageGuard.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  name: "HistoryPage",
  data() {
    return {
      selectedDate: "",
      historyRecords: []
    };
  },
  onLoad() {
    if (!utils_pageGuard.requireLogin()) {
      return;
    }
    const today = /* @__PURE__ */ new Date();
    this.selectedDate = this.formatDate(today);
    this.loadHistoryRecords();
  },
  methods: {
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    onDateChange(e) {
      this.selectedDate = e.detail.value;
      this.loadHistoryRecords();
    },
    loadHistoryRecords() {
      this.historyRecords = [
        {
          icon: "🍳",
          title: "早餐记录",
          time: "07:30",
          description: "番茄鸡蛋面 - 营养丰富的早餐选择，蛋白质含量丰富",
          tags: ["早餐", "营养"]
        },
        {
          icon: "🍖",
          title: "午餐记录",
          time: "12:15",
          description: "红烧肉 - 经典家常菜，肥而不腻，口感鲜美",
          tags: ["午餐", "肉类"]
        },
        {
          icon: "🐟",
          title: "晚餐记录",
          time: "18:45",
          description: "清蒸鱼 - 清淡健康，营养丰富，适合晚餐",
          tags: ["晚餐", "海鲜"]
        }
      ];
    },
    goBack() {
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$1,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.t($data.selectedDate),
    d: $data.selectedDate,
    e: common_vendor.o((...args) => $options.onDateChange && $options.onDateChange(...args)),
    f: $data.historyRecords.length > 0
  }, $data.historyRecords.length > 0 ? {
    g: common_vendor.f($data.historyRecords, (record, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(record.icon),
        b: common_vendor.t(record.title),
        c: common_vendor.t(record.time),
        d: common_vendor.t(record.description),
        e: record.tags && record.tags.length > 0
      }, record.tags && record.tags.length > 0 ? {
        f: common_vendor.f(record.tags, (tag, k1, i1) => {
          return {
            a: common_vendor.t(tag),
            b: tag
          };
        })
      } : {}, {
        g: index
      });
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1bc30d9f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/history.js.map
