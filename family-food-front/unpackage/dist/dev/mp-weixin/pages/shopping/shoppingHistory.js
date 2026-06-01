"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_pageGuard = require("../../utils/pageGuard.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  name: "HistoryPage",
  data() {
    return {
      historyList: [],
      loading: false,
      noMore: false,
      page: 1,
      pageSize: 10,
      totalShoppingCount: 0,
      totalIngredientCount: 0,
      averageCompletionRate: 0,
      lastShoppingDate: "--"
    };
  },
  computed: {
    currentFamily() {
      var _a;
      return (_a = this.$store.state.family) == null ? void 0 : _a.currentFamily;
    },
    userInfo() {
      var _a;
      return (_a = this.$store.state.user) == null ? void 0 : _a.userInfo;
    }
  },
  onLoad() {
    if (!utils_pageGuard.requireLogin()) {
      return;
    }
    this.loadHistoryData();
  },
  methods: {
    async loadHistoryData() {
      var _a;
      if (this.loading || this.noMore)
        return;
      this.loading = true;
      try {
        const response = await this.$api.shoppingHistory.getShoppingHistory(
          (_a = this.currentFamily) == null ? void 0 : _a.id,
          this.page - 1,
          this.pageSize
        );
        if (response.code === 200) {
          const list = response.data.list || [];
          if (this.page === 1) {
            this.historyList = list;
          } else {
            this.historyList = [...this.historyList, ...list];
          }
          if (this.page === 1) {
            this.totalShoppingCount = response.data.totalShoppingCount || 0;
            this.totalIngredientCount = response.data.totalIngredientCount || 0;
            this.averageCompletionRate = response.data.averageCompletionRate || 0;
            this.lastShoppingDate = response.data.lastShoppingDate || "--";
          }
          this.noMore = list.length < this.pageSize;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/shopping/shoppingHistory.vue:169", "加载历史记录失败:", error);
      } finally {
        this.loading = false;
      }
    },
    loadMore() {
      if (!this.loading && !this.noMore) {
        this.page++;
        this.loadHistoryData();
      }
    },
    formatDate(dateStr) {
      if (!dateStr)
        return "--";
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    formatCompletionRate(rate) {
      if (!rate)
        return 0;
      return Math.round(rate);
    },
    viewDetail(record) {
      common_vendor.index.navigateTo({
        url: `/pages/shopping/shoppingHistory/detail?id=${record.id}`
      });
    },
    showFilter() {
      common_vendor.index.showActionSheet({
        itemList: ["最近一周", "最近一月", "最近三月", "全部"],
        success: (res) => {
          const filters = ["week", "month", "quarter", "all"];
          this.applyFilter(filters[res.tapIndex]);
        }
      });
    },
    applyFilter(filter) {
      this.page = 1;
      this.noMore = false;
      this.historyList = [];
      this.loadHistoryData();
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
    c: common_assets._imports_10,
    d: common_vendor.t($data.totalShoppingCount),
    e: common_assets._imports_2$2,
    f: common_vendor.t($data.totalIngredientCount),
    g: common_assets._imports_6,
    h: common_vendor.t($data.averageCompletionRate),
    i: common_assets._imports_4$2,
    j: common_vendor.t($data.lastShoppingDate),
    k: common_vendor.f($data.historyList, (record, k0, i0) => {
      return {
        a: common_vendor.t($options.formatDate(record.shoppingDate)),
        b: common_vendor.t($options.formatCompletionRate(record.completionRate)),
        c: common_vendor.t(record.totalItems),
        d: common_vendor.t(record.purchasedItems),
        e: common_vendor.t(record.totalItems - record.purchasedItems),
        f: record.id,
        g: common_vendor.o(($event) => $options.viewDetail(record), record.id)
      };
    }),
    l: $data.loading
  }, $data.loading ? {} : {}, {
    m: $data.noMore && $data.historyList.length > 0
  }, $data.noMore && $data.historyList.length > 0 ? {} : {}, {
    n: $data.historyList.length === 0 && !$data.loading
  }, $data.historyList.length === 0 && !$data.loading ? {
    o: common_assets._imports_5$1
  } : {}, {
    p: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-969f401e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/shopping/shoppingHistory.js.map
