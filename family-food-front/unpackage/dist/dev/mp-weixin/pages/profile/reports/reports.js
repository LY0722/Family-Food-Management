"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_pageGuard = require("../../../utils/pageGuard.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  name: "ReportsPage",
  data() {
    return {
      timeFilter: "week",
      chartWidth: 320,
      chartHeight: 200,
      pieChartSize: 200,
      stats: {
        consumption: 12.5,
        consumptionChange: -3.2,
        wasteRate: 5.2,
        wasteChange: -1.5,
        saved: 156,
        savedChange: 8.7
      },
      categories: [
        { id: 1, name: "蔬菜", icon: "🥬", amount: 4.2, percentage: 35, color: "#52c41a" },
        { id: 2, name: "肉类", icon: "🥩", amount: 3.5, percentage: 29, color: "#ff4d4f" },
        { id: 3, name: "水果", icon: "🍎", amount: 2.1, percentage: 18, color: "#faad14" },
        { id: 4, name: "蛋奶", icon: "🥚", amount: 1.5, percentage: 12, color: "#1890ff" },
        { id: 5, name: "其他", icon: "📦", amount: 0.7, percentage: 6, color: "#8c8c8c" }
      ],
      wasteList: [
        { id: 1, name: "叶菜类", amount: 23.5, count: 5 },
        { id: 2, name: "水果", amount: 18.2, count: 3 },
        { id: 3, name: "面包", amount: 12.8, count: 4 },
        { id: 4, name: "乳制品", amount: 8.5, count: 2 }
      ]
    };
  },
  onLoad() {
    if (!utils_pageGuard.requireLogin()) {
      return;
    }
    this.loadReportData();
  },
  onReady() {
    this.drawTrendChart();
    this.drawPieChart();
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    setTimeFilter(filter) {
      this.timeFilter = filter;
      this.loadReportData();
    },
    async loadReportData() {
      var _a;
      try {
        const familyId = (_a = this.$store.state.user.currentFamily) == null ? void 0 : _a.id;
        if (!familyId) {
          common_vendor.index.__f__("warn", "at pages/profile/reports/reports.vue:201", "无法加载报告：无效的家庭ID");
          common_vendor.index.showToast({
            title: "请先创建或加入家庭",
            icon: "none"
          });
          return;
        }
        const endDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        let startDate = endDate;
        if (this.timeFilter === "week") {
          const weekStart = /* @__PURE__ */ new Date();
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          startDate = weekStart.toISOString().split("T")[0];
        } else if (this.timeFilter === "month") {
          const monthStart = /* @__PURE__ */ new Date();
          monthStart.setDate(1);
          startDate = monthStart.toISOString().split("T")[0];
        }
        const response = await this.$api.report.getConsumptionReport(
          familyId,
          startDate,
          endDate
        );
        if (response.code === 200) {
          this.stats = response.data.stats || this.stats;
          this.categories = response.data.categories || this.categories;
          this.wasteList = response.data.wasteList || this.wasteList;
          this.$nextTick(() => {
            this.drawTrendChart();
            this.drawPieChart();
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/reports/reports.vue:239", "加载报告数据失败:", error);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      }
    },
    drawTrendChart() {
      const ctx = common_vendor.index.createCanvasContext("trendChart", this);
      const padding = 40;
      const width = this.chartWidth;
      const height = this.chartHeight;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;
      ctx.clearRect(0, 0, width, height);
      let labels = [];
      let data = [];
      if (this.timeFilter === "week") {
        labels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
        data = [1.5, 2.3, 1.8, 2.1, 1.9, 2.5, 2.2];
      } else {
        labels = ["第1周", "第2周", "第3周", "第4周"];
        data = [8.5, 9.2, 7.8, 10.5];
      }
      const maxValue = Math.max(...data) * 1.2;
      ctx.setStrokeStyle("#e0e0e0");
      ctx.setLineWidth(1);
      for (let i = 0; i <= 5; i++) {
        const y = padding + chartHeight / 5 * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
        const value = maxValue - maxValue / 5 * i;
        ctx.setFontSize(10);
        ctx.setFillStyle("#999");
        ctx.fillText(value.toFixed(1), 5, y + 3);
      }
      const stepX = chartWidth / (labels.length - 1);
      labels.forEach((label, index) => {
        const x = padding + stepX * index;
        ctx.setFontSize(10);
        ctx.setFillStyle("#666");
        ctx.setTextAlign("center");
        ctx.fillText(label, x, height - padding + 15);
      });
      ctx.setStrokeStyle("#1890ff");
      ctx.setLineWidth(2);
      ctx.beginPath();
      data.forEach((value, index) => {
        const x = padding + stepX * index;
        const y = padding + chartHeight - value / maxValue * chartHeight;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      data.forEach((value, index) => {
        const x = padding + stepX * index;
        const y = padding + chartHeight - value / maxValue * chartHeight;
        ctx.setFillStyle("#1890ff");
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.setFontSize(10);
        ctx.setFillStyle("#333");
        ctx.setTextAlign("center");
        ctx.fillText(value.toFixed(1), x, y - 8);
      });
      ctx.draw();
    },
    drawPieChart() {
      const ctx = common_vendor.index.createCanvasContext("categoryChart", this);
      const centerX = this.pieChartSize / 2;
      const centerY = this.pieChartSize / 2;
      const radius = this.pieChartSize / 2 - 20;
      ctx.clearRect(0, 0, this.pieChartSize, this.pieChartSize);
      let startAngle = -Math.PI / 2;
      this.categories.forEach((category) => {
        const sliceAngle = category.percentage / 100 * Math.PI * 2;
        const endAngle = startAngle + sliceAngle;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.setFillStyle(category.color);
        ctx.fill();
        const midAngle = startAngle + sliceAngle / 2;
        const textRadius = radius * 0.7;
        const textX = centerX + Math.cos(midAngle) * textRadius;
        const textY = centerY + Math.sin(midAngle) * textRadius;
        if (category.percentage > 5) {
          ctx.setFontSize(10);
          ctx.setFillStyle("#fff");
          ctx.setTextAlign("center");
          ctx.setTextBaseline("middle");
          ctx.fillText(category.percentage + "%", textX, textY);
        }
        startAngle = endAngle;
      });
      ctx.draw();
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
    c: $data.timeFilter === "week" ? 1 : "",
    d: common_vendor.o(($event) => $options.setTimeFilter("week")),
    e: $data.timeFilter === "month" ? 1 : "",
    f: common_vendor.o(($event) => $options.setTimeFilter("month")),
    g: $data.timeFilter === "custom" ? 1 : "",
    h: common_vendor.o(($event) => $options.setTimeFilter("custom")),
    i: common_vendor.t($data.stats.consumption || 0),
    j: common_vendor.t($data.stats.consumptionChange > 0 ? "+" : ""),
    k: common_vendor.t($data.stats.consumptionChange || 0),
    l: $data.stats.consumptionChange > 0 ? 1 : "",
    m: common_vendor.t($data.stats.wasteRate || 0),
    n: common_vendor.t($data.stats.wasteChange > 0 ? "+" : ""),
    o: common_vendor.t($data.stats.wasteChange || 0),
    p: $data.stats.wasteChange < 0 ? 1 : "",
    q: common_vendor.t($data.stats.saved || 0),
    r: common_vendor.t($data.stats.savedChange || 0),
    s: common_vendor.t($data.timeFilter === "week" ? "天" : "周"),
    t: $data.chartWidth + "px",
    v: $data.chartHeight + "px",
    w: $data.pieChartSize + "px",
    x: $data.pieChartSize + "px",
    y: common_vendor.f($data.categories, (category, k0, i0) => {
      return {
        a: category.color,
        b: common_vendor.t(category.name),
        c: common_vendor.t(category.percentage),
        d: category.id
      };
    }),
    z: common_vendor.f($data.wasteList, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: common_vendor.t(item.amount),
        c: common_vendor.t(item.count),
        d: item.id
      };
    }),
    A: common_assets._imports_2$6,
    B: common_vendor.o((...args) => $options.handleExport && $options.handleExport(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a2e1e794"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/profile/reports/reports.js.map
