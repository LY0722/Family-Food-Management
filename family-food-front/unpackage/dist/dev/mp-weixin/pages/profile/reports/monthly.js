"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  name: "MonthlyReportPage",
  data() {
    return {
      currentYear: (/* @__PURE__ */ new Date()).getFullYear(),
      currentMonth: (/* @__PURE__ */ new Date()).getMonth() + 1,
      isCurrentMonth: true,
      monthDays: 30,
      monthlyStats: {
        totalConsumption: 0,
        consumptionChange: 0,
        wasteRate: 0,
        wasteChange: 0,
        saved: 0,
        savedChange: 0,
        wasteSaved: 0,
        purchaseSaved: 0,
        totalSaved: 0,
        consumptionTrend: "stable",
        wasteTrend: "down",
        savingTrend: "up",
        categories: [],
        wasteList: []
      },
      weeklyConsumption: [],
      maxWeeklyConsumption: 0,
      monthlyComparison: [],
      maxMonthlyConsumption: 0,
      purchaseRecords: [],
      purchaseCount: 0,
      totalPurchaseAmount: 0,
      averagePurchaseAmount: 0
    };
  },
  onLoad(options) {
    if (options.year && options.month) {
      this.currentYear = parseInt(options.year);
      this.currentMonth = parseInt(options.month);
      this.isCurrentMonth = false;
    }
    this.updateMonthDays();
    this.loadMonthlyData();
  },
  methods: {
    updateMonthDays() {
      const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
      this.monthDays = daysInMonth;
    },
    prevMonth() {
      this.currentMonth--;
      if (this.currentMonth < 1) {
        this.currentMonth = 12;
        this.currentYear--;
      }
      this.isCurrentMonth = false;
      this.updateMonthDays();
      this.loadMonthlyData();
    },
    nextMonth() {
      if (this.isCurrentMonth)
        return;
      this.currentMonth++;
      if (this.currentMonth > 12) {
        this.currentMonth = 1;
        this.currentYear++;
      }
      const now = /* @__PURE__ */ new Date();
      if (this.currentYear > now.getFullYear() || this.currentYear === now.getFullYear() && this.currentMonth > now.getMonth() + 1) {
        this.currentYear = now.getFullYear();
        this.currentMonth = now.getMonth() + 1;
        this.isCurrentMonth = true;
      }
      this.updateMonthDays();
      this.loadMonthlyData();
    },
    async loadMonthlyData() {
      try {
        const response = await this.$api.report.consumptionReport({
          timeFilter: "month",
          year: this.currentYear,
          month: this.currentMonth
        });
        if (response.code === 200) {
          this.monthlyStats = response.data.stats || this.monthlyStats;
          this.weeklyConsumption = response.data.weeklyConsumption || [];
          this.monthlyComparison = response.data.monthlyComparison || [];
          this.purchaseRecords = response.data.purchaseRecords || [];
          this.purchaseCount = this.purchaseRecords.length;
          this.totalPurchaseAmount = this.purchaseRecords.reduce((sum, item) => sum + item.amount, 0);
          this.averagePurchaseAmount = this.purchaseCount > 0 ? (this.totalPurchaseAmount / this.purchaseCount).toFixed(2) : 0;
          this.maxWeeklyConsumption = Math.max(...this.weeklyConsumption.map((w) => w.amount), 1);
          this.maxMonthlyConsumption = Math.max(...this.monthlyComparison.map((m) => m.consumption), 1);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/reports/monthly.vue:351", "加载月数据失败:", error);
      }
    },
    getTrendIcon(trend) {
      const icons = {
        up: "📈",
        down: "📉",
        stable: "➡️"
      };
      return icons[trend] || "➡️";
    },
    getTrendText(trend) {
      const texts = {
        up: "上升",
        down: "下降",
        stable: "稳定"
      };
      return texts[trend] || "稳定";
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
    e: common_vendor.o((...args) => $options.prevMonth && $options.prevMonth(...args)),
    f: common_vendor.t($data.currentYear),
    g: common_vendor.t($data.currentMonth),
    h: common_vendor.t($data.monthDays),
    i: common_assets._imports_1$7,
    j: common_vendor.o((...args) => $options.nextMonth && $options.nextMonth(...args)),
    k: $data.isCurrentMonth ? 1 : "",
    l: common_vendor.t($data.monthlyStats.totalConsumption || 0),
    m: common_vendor.t($data.monthlyStats.consumptionChange >= 0 ? "+" : ""),
    n: common_vendor.t($data.monthlyStats.consumptionChange || 0),
    o: $data.monthlyStats.consumptionChange >= 0 ? 1 : "",
    p: common_vendor.t($data.monthlyStats.wasteRate || 0),
    q: common_vendor.t($data.monthlyStats.wasteChange >= 0 ? "+" : ""),
    r: common_vendor.t($data.monthlyStats.wasteChange || 0),
    s: $data.monthlyStats.wasteChange <= 0 ? 1 : "",
    t: common_vendor.t($data.monthlyStats.saved || 0),
    v: common_vendor.t($data.monthlyStats.savedChange || 0),
    w: common_vendor.f($data.weeklyConsumption, (week, index, i0) => {
      return {
        a: week.amount / $data.maxWeeklyConsumption * 100 + "%",
        b: common_vendor.t(week.week),
        c: common_vendor.t(week.amount),
        d: index
      };
    }),
    x: common_vendor.f($data.monthlyStats.categories, (category, k0, i0) => {
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
    y: common_vendor.f($data.monthlyStats.wasteList, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: common_vendor.t(item.amount),
        c: common_vendor.t(item.count),
        d: item.id
      };
    }),
    z: common_vendor.f($data.monthlyComparison, (month, index, i0) => {
      return {
        a: common_vendor.t(month.label),
        b: common_vendor.t(month.consumption),
        c: month.consumption / $data.maxMonthlyConsumption * 100 + "%",
        d: index
      };
    }),
    A: common_vendor.t($data.purchaseCount),
    B: common_vendor.t($data.purchaseCount),
    C: common_vendor.t($data.totalPurchaseAmount),
    D: common_vendor.t($data.averagePurchaseAmount),
    E: common_vendor.t($data.monthlyStats.wasteSaved || 0),
    F: common_vendor.t($data.monthlyStats.purchaseSaved || 0),
    G: common_vendor.t($data.monthlyStats.totalSaved || 0),
    H: common_vendor.t($options.getTrendIcon($data.monthlyStats.consumptionTrend)),
    I: common_vendor.t($options.getTrendText($data.monthlyStats.consumptionTrend)),
    J: common_vendor.n($data.monthlyStats.consumptionTrend),
    K: common_vendor.t($options.getTrendIcon($data.monthlyStats.wasteTrend)),
    L: common_vendor.t($options.getTrendText($data.monthlyStats.wasteTrend)),
    M: common_vendor.n($data.monthlyStats.wasteTrend),
    N: common_vendor.t($options.getTrendIcon($data.monthlyStats.savingTrend)),
    O: common_vendor.t($options.getTrendText($data.monthlyStats.savingTrend)),
    P: common_vendor.n($data.monthlyStats.savingTrend),
    Q: common_assets._imports_2$6,
    R: common_vendor.o((...args) => $options.handleExport && $options.handleExport(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f2452bdb"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/profile/reports/monthly.js.map
