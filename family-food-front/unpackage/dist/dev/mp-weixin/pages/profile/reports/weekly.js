"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  name: "WeeklyReportPage",
  data() {
    return {
      currentWeekStart: null,
      currentWeekEnd: null,
      isCurrentWeek: true,
      weekRange: "",
      weeklyStats: {
        totalConsumption: 0,
        consumptionChange: 0,
        wasteRate: 0,
        wasteChange: 0,
        saved: 0,
        savedChange: 0,
        wasteSaved: 0,
        purchaseSaved: 0,
        totalSaved: 0,
        categories: [],
        wasteList: []
      },
      dailyConsumption: [],
      maxDailyConsumption: 0,
      purchaseRecords: [],
      purchaseCount: 0
    };
  },
  onLoad(options) {
    if (options.startDate) {
      this.currentWeekStart = new Date(options.startDate);
      this.currentWeekEnd = new Date(options.endDate);
      this.isCurrentWeek = false;
    } else {
      this.setCurrentWeek();
    }
    this.updateWeekRange();
    this.loadWeeklyData();
  },
  methods: {
    setCurrentWeek() {
      const now = /* @__PURE__ */ new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      this.currentWeekStart = new Date(now.setDate(diff));
      this.currentWeekStart.setHours(0, 0, 0, 0);
      this.currentWeekEnd = new Date(this.currentWeekStart);
      this.currentWeekEnd.setDate(this.currentWeekEnd.getDate() + 6);
      this.currentWeekEnd.setHours(23, 59, 59, 999);
      this.isCurrentWeek = true;
    },
    updateWeekRange() {
      const start = this.formatDate(this.currentWeekStart);
      const end = this.formatDate(this.currentWeekEnd);
      this.weekRange = `${start} - ${end}`;
    },
    formatDate(date) {
      const d = new Date(date);
      const month = d.getMonth() + 1;
      const day = d.getDate();
      return `${month}/${day}`;
    },
    prevWeek() {
      this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
      this.currentWeekEnd.setDate(this.currentWeekEnd.getDate() - 7);
      this.isCurrentWeek = false;
      this.updateWeekRange();
      this.loadWeeklyData();
    },
    nextWeek() {
      if (this.isCurrentWeek)
        return;
      this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
      this.currentWeekEnd.setDate(this.currentWeekEnd.getDate() + 7);
      const now = /* @__PURE__ */ new Date();
      if (this.currentWeekEnd >= now) {
        this.setCurrentWeek();
      } else {
        this.updateWeekRange();
      }
      this.loadWeeklyData();
    },
    async loadWeeklyData() {
      try {
        const response = await this.$api.report.consumptionReport({
          timeFilter: "week",
          startDate: this.formatDateToAPI(this.currentWeekStart),
          endDate: this.formatDateToAPI(this.currentWeekEnd)
        });
        if (response.code === 200) {
          this.weeklyStats = response.data.stats || this.weeklyStats;
          this.dailyConsumption = response.data.dailyConsumption || [];
          this.purchaseRecords = response.data.purchaseRecords || [];
          this.purchaseCount = this.purchaseRecords.length;
          this.maxDailyConsumption = Math.max(...this.dailyConsumption.map((d) => d.amount), 1);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/reports/weekly.vue:299", "加载周数据失败:", error);
      }
    },
    formatDateToAPI(date) {
      const d = new Date(date);
      return d.toISOString().split("T")[0];
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    goToIndex() {
      common_vendor.index.redirectTo({
        url: "/pages/profile/reports/reports"
      });
    },
    handleExport() {
      common_vendor.index.showActionSheet({
        itemList: ["导出为图片", "导出为PDF"],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.exportAsImage();
          } else if (res.tapIndex === 1) {
            this.exportAsPDF();
          }
        }
      });
    },
    exportAsImage() {
      common_vendor.index.showToast({
        title: "正在生成图片...",
        icon: "loading"
      });
      setTimeout(() => {
        common_vendor.index.showToast({
          title: "导出成功",
          icon: "success"
        });
      }, 2e3);
    },
    exportAsPDF() {
      common_vendor.index.showToast({
        title: "正在生成PDF...",
        icon: "loading"
      });
      setTimeout(() => {
        common_vendor.index.showToast({
          title: "导出成功",
          icon: "success"
        });
      }, 2e3);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0$1,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.o((...args) => $options.goToIndex && $options.goToIndex(...args)),
    d: common_assets._imports_0$1,
    e: common_vendor.o((...args) => $options.prevWeek && $options.prevWeek(...args)),
    f: common_vendor.t($data.weekRange),
    g: common_assets._imports_1$7,
    h: common_vendor.o((...args) => $options.nextWeek && $options.nextWeek(...args)),
    i: $data.isCurrentWeek ? 1 : "",
    j: common_vendor.t($data.weeklyStats.totalConsumption || 0),
    k: common_vendor.t($data.weeklyStats.consumptionChange >= 0 ? "+" : ""),
    l: common_vendor.t($data.weeklyStats.consumptionChange || 0),
    m: $data.weeklyStats.consumptionChange >= 0 ? 1 : "",
    n: common_vendor.t($data.weeklyStats.wasteRate || 0),
    o: common_vendor.t($data.weeklyStats.wasteChange >= 0 ? "+" : ""),
    p: common_vendor.t($data.weeklyStats.wasteChange || 0),
    q: $data.weeklyStats.wasteChange <= 0 ? 1 : "",
    r: common_vendor.t($data.weeklyStats.saved || 0),
    s: common_vendor.t($data.weeklyStats.savedChange || 0),
    t: common_vendor.f($data.dailyConsumption, (day, index, i0) => {
      return {
        a: day.amount / $data.maxDailyConsumption * 100 + "%",
        b: common_vendor.t(day.label),
        c: common_vendor.t(day.amount),
        d: index
      };
    }),
    v: common_vendor.f($data.weeklyStats.categories, (category, k0, i0) => {
      return {
        a: common_vendor.t(category.icon),
        b: category.color,
        c: common_vendor.t(category.name),
        d: common_vendor.t(category.amount),
        e: category.percentage + "%",
        f: category.color,
        g: common_vendor.t(category.percentage),
        h: category.id
      };
    }),
    w: common_vendor.f($data.weeklyStats.wasteList, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: common_vendor.t(item.amount),
        c: common_vendor.t(item.count),
        d: item.id
      };
    }),
    x: common_vendor.t($data.purchaseCount),
    y: common_vendor.f($data.purchaseRecords, (item, k0, i0) => {
      return {
        a: common_vendor.t($options.formatDate(item.date)),
        b: common_vendor.t(item.items),
        c: common_vendor.t(item.amount),
        d: item.id
      };
    }),
    z: common_vendor.t($data.weeklyStats.wasteSaved || 0),
    A: common_vendor.t($data.weeklyStats.purchaseSaved || 0),
    B: common_vendor.t($data.weeklyStats.totalSaved || 0),
    C: common_assets._imports_2$6,
    D: common_vendor.o((...args) => $options.handleExport && $options.handleExport(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5c8e978c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/profile/reports/weekly.js.map
