"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_pageGuard = require("../../utils/pageGuard.js");
const common_assets = require("../../common/assets.js");
const Loading = () => "../../components/common/Loading.js";
const Toast = () => "../../components/common/Toast.js";
const _sfc_main = {
  name: "Profile",
  components: {
    Loading,
    Toast
  },
  data() {
    return {
      loading: false,
      refreshing: false,
      healthTags: [],
      familyMembers: [],
      currentFamily: null,
      wasteRate: 0,
      overviewData: {
        consumption: 0,
        wasteRate: 0,
        saved: 0,
        consumptionChange: 0,
        wasteChange: 0,
        savedChange: 0
      },
      currentWeek: "",
      availableHealthTags: ["素食", "荤素搭配", "低脂", "低盐", "无麸质", "有机", "无糖", "高蛋白", "低碳水", "清真", "无乳糖"],
      showEditModalFlag: false,
      showHealthTagsModal: false,
      selectedHealthTags: []
    };
  },
  computed: {
    ...common_vendor.mapState("user", ["userInfo", "isLoggedIn"]),
    // 使用 Vuex 中的 isLoggedIn 状态，而不是从 localStorage 读取
    userLoggedIn() {
      return this.isLoggedIn;
    },
    displayAvatarUrl() {
      if (!this.userInfo) {
        return "/static/images/default-avatar.png";
      }
      const avatarUrl = this.userInfo.avatarUrl;
      if (avatarUrl && avatarUrl.startsWith("http://tmp")) {
        return avatarUrl;
      }
      if (avatarUrl && avatarUrl.startsWith("wxfile://")) {
        return avatarUrl;
      }
      if (avatarUrl && (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://"))) {
        return avatarUrl;
      }
      return "/static/images/default-avatar.png";
    },
    hasFamily() {
      var _a, _b, _c;
      return !!(((_a = this.currentFamily) == null ? void 0 : _a.id) || ((_b = this.userInfo) == null ? void 0 : _b.familyId) || ((_c = this.userInfo) == null ? void 0 : _c.currentFamilyId));
    }
  },
  watch: {
    isLoggedIn: {
      handler(newVal, oldVal) {
        common_vendor.index.__f__("log", "at pages/profile/profile.vue:336", "isLoggedIn 变化:", { oldVal, newVal });
        if (newVal) {
          this.loadProfileData();
        } else if (oldVal && !newVal) {
          common_vendor.index.__f__("log", "at pages/profile/profile.vue:343", "用户已退出登录，清除页面数据");
          this.healthTags = [];
          this.familyMembers = [];
          this.currentFamily = null;
          this.overviewData = {
            consumption: 0,
            wasteRate: 0,
            saved: 0,
            consumptionChange: 0,
            wasteChange: 0,
            savedChange: 0
          };
        }
      },
      immediate: true
    }
  },
  onShow() {
    if (!utils_pageGuard.requireLogin()) {
      return;
    }
    if (this.isLoggedIn) {
      this.loadProfileData();
    }
  },
  onLoad() {
    if (!utils_pageGuard.requireLogin()) {
      return;
    }
    this.setCurrentWeek();
  },
  methods: {
    ...common_vendor.mapMutations("user", ["SET_USER_INFO"]),
    ...common_vendor.mapActions("user", ["logout"]),
    async loadProfileData() {
      this.loading = true;
      try {
        await Promise.all([
          this.loadUserData(),
          this.loadFamilyData(),
          this.loadOverviewData()
        ]);
        this.setCurrentWeek();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/profile.vue:393", "加载个人中心数据失败:", error);
      } finally {
        this.loading = false;
      }
    },
    loadUserData() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (userInfo) {
        try {
          const tags = userInfo.healthTags;
          if (typeof tags === "string") {
            this.healthTags = tags === "[]" ? [] : JSON.parse(tags);
          } else if (Array.isArray(tags)) {
            this.healthTags = tags;
          } else {
            this.healthTags = [];
          }
        } catch (e) {
          this.healthTags = [];
        }
      }
    },
    async loadFamilyData() {
      var _a;
      if ((_a = this.userInfo) == null ? void 0 : _a.familyId) {
        try {
          const familyResponse = await this.$api.family.getInfo(this.userInfo.familyId);
          if (familyResponse.code === 200) {
            this.currentFamily = familyResponse.data;
          }
          const membersResponse = await this.$api.family.getMembers(this.userInfo.familyId);
          if (membersResponse.code === 200) {
            this.familyMembers = membersResponse.data || [];
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/profile/profile.vue:430", "加载家庭数据失败:", error);
        }
      }
    },
    async loadOverviewData() {
      this.overviewData = {
        consumption: 12.5,
        wasteRate: 5.2,
        saved: 156,
        consumptionChange: -3.2,
        wasteChange: -1.5,
        savedChange: 8.7
      };
      this.wasteRate = this.overviewData.wasteRate;
    },
    setCurrentWeek() {
      const now = /* @__PURE__ */ new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      this.currentWeek = `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()} - ${endOfWeek.getMonth() + 1}/${endOfWeek.getDate()}`;
    },
    async onRefresh() {
      this.refreshing = true;
      await this.loadProfileData();
      this.refreshing = false;
    },
    goToLogin() {
      common_vendor.index.reLaunch({
        url: "/pages/login/login"
      });
    },
    goToRegister() {
      common_vendor.index.navigateTo({
        url: "/pages/register/register"
      });
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    showMenu() {
      common_vendor.index.showActionSheet({
        itemList: ["设置", "帮助", "关于"],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.goToSettings();
          } else if (res.tapIndex === 1) {
            common_vendor.index.showToast({
              title: "帮助功能开发中",
              icon: "none"
            });
          } else if (res.tapIndex === 2) {
            common_vendor.index.showModal({
              title: "关于",
              content: "家庭食材管家 v1.0.0\n\n一款智能的家庭食材管理应用",
              showCancel: false
            });
          }
        }
      });
    },
    changeAvatar() {
      common_vendor.index.__f__("log", "at pages/profile/profile.vue:501", "开始选择头像图片...");
      common_vendor.index.chooseImage({
        count: 1,
        success: async (res) => {
          try {
            common_vendor.index.__f__("log", "at pages/profile/profile.vue:507", "选择图片成功:", res);
            const filePath = res.tempFilePaths[0];
            common_vendor.index.__f__("log", "at pages/profile/profile.vue:509", "临时文件路径:", filePath);
            const response = await this.$api.user.uploadAvatar(filePath);
            common_vendor.index.__f__("log", "at pages/profile/profile.vue:512", "上传响应:", response);
            if (response.code === 200) {
              common_vendor.index.__f__("log", "at pages/profile/profile.vue:515", "头像URL:", response.data);
              const isDev = true;
              const avatarUrl = isDev ? filePath : response.data;
              const updatedUserInfo = {
                ...this.userInfo,
                avatarUrl,
                serverAvatarUrl: response.data
                // 保存服务器 URL，用于生产环境
              };
              common_vendor.index.setStorageSync("userInfo", updatedUserInfo);
              this.SET_USER_INFO(updatedUserInfo);
              if (this.$refs.toast) {
                this.$refs.toast.show("头像更新成功");
              } else {
                common_vendor.index.showToast({ title: "头像更新成功", icon: "success" });
              }
            } else {
              common_vendor.index.__f__("error", "at pages/profile/profile.vue:537", "上传失败:", response.message);
              if (this.$refs.toast) {
                this.$refs.toast.show(response.message || "头像上传失败");
              } else {
                common_vendor.index.showToast({ title: response.message || "头像上传失败", icon: "none" });
              }
            }
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/profile/profile.vue:545", "上传头像失败:", error);
            if (this.$refs.toast) {
              this.$refs.toast.show("头像上传失败");
            } else {
              common_vendor.index.showToast({ title: "头像上传失败", icon: "none" });
            }
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/profile/profile.vue:554", "选择图片失败:", err);
          common_vendor.index.showToast({ title: "选择图片失败", icon: "none" });
        }
      });
    },
    editProfile() {
      common_vendor.index.navigateTo({
        url: "/pages/profile/edit"
      });
    },
    editHealthTags() {
      this.selectedHealthTags = [...this.healthTags];
      this.showHealthTagsModal = true;
    },
    toggleHealthTag(tag) {
      const index = this.healthTags.indexOf(tag);
      if (index > -1) {
        this.healthTags.splice(index, 1);
        this.$refs.toast.show(`已移除「${tag}」`, "info");
      } else {
        this.healthTags.push(tag);
        this.$refs.toast.show(`已添加「${tag}」`, "success");
      }
      this.saveHealthTags();
    },
    async saveHealthTags() {
      this.loading = true;
      try {
        const userInfo = common_vendor.index.getStorageSync("userInfo");
        if (userInfo) {
          userInfo.healthTags = this.healthTags;
          common_vendor.index.setStorageSync("userInfo", userInfo);
          this.SET_USER_INFO(userInfo);
        }
        try {
          await this.$api.user.updateHealthTags(this.healthTags);
        } catch (apiError) {
          common_vendor.index.__f__("error", "at pages/profile/profile.vue:599", "更新健康标签API失败:", apiError);
        }
        this.loadUserData();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/profile.vue:605", "保存健康标签失败:", error);
        this.$refs.toast.show("保存失败", "error");
      } finally {
        this.loading = false;
      }
    },
    toggleTag(tag) {
      const index = this.selectedHealthTags.indexOf(tag);
      if (index > -1) {
        this.selectedHealthTags.splice(index, 1);
      } else {
        this.selectedHealthTags.push(tag);
      }
    },
    hideHealthTagsModal() {
      this.showHealthTagsModal = false;
    },
    async confirmHealthTags() {
      this.healthTags = [...this.selectedHealthTags];
      await this.saveHealthTags();
      this.hideHealthTagsModal();
    },
    goToFamily() {
      common_vendor.index.navigateTo({
        url: "/pages/profile/family/family"
      });
    },
    goToReports() {
      common_vendor.index.navigateTo({
        url: "/pages/profile/reports/reports"
      });
    },
    goToSettings() {
      common_vendor.index.navigateTo({
        url: "/pages/profile/settings/setting"
      });
    },
    goToInventory() {
      common_vendor.index.navigateTo({
        url: "/pages/home/inventory/inventory"
      });
    },
    goToShopping() {
      common_vendor.index.switchTab({
        url: "/pages/shopping/shopping"
      });
    },
    goToRecipes() {
      common_vendor.index.navigateTo({
        url: "/pages/shopping/recipe/recipe"
      });
    },
    handleLogout() {
      common_vendor.index.showModal({
        title: "确认退出",
        content: "确定要退出登录吗？",
        confirmText: "退出",
        cancelText: "取消",
        success: async (res) => {
          if (res.confirm) {
            this.loading = true;
            try {
              common_vendor.index.__f__("log", "at pages/profile/profile.vue:677", "开始退出登录...");
              try {
                await this.$api.user.logout();
                common_vendor.index.__f__("log", "at pages/profile/profile.vue:682", "后端退出接口调用成功");
              } catch (apiError) {
                common_vendor.index.__f__("warn", "at pages/profile/profile.vue:684", "后端退出接口调用失败，但继续执行本地退出:", apiError);
              }
              this.logout();
              common_vendor.index.__f__("log", "at pages/profile/profile.vue:689", "Vuex 用户数据已清除");
              common_vendor.index.removeStorageSync("token");
              common_vendor.index.removeStorageSync("userInfo");
              common_vendor.index.removeStorageSync("currentFamily");
              common_vendor.index.__f__("log", "at pages/profile/profile.vue:695", "本地存储已清除");
              this.healthTags = [];
              this.familyMembers = [];
              this.currentFamily = null;
              this.overviewData = {
                consumption: 0,
                wasteRate: 0,
                saved: 0,
                consumptionChange: 0,
                wasteChange: 0,
                savedChange: 0
              };
              if (this.$refs.toast) {
                this.$refs.toast.show("退出成功");
              } else {
                common_vendor.index.showToast({ title: "退出成功", icon: "success" });
              }
              common_vendor.index.__f__("log", "at pages/profile/profile.vue:718", "跳转到登录页...");
              common_vendor.index.reLaunch({
                url: "/pages/login/login"
              });
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/profile/profile.vue:724", "退出失败:", error);
              if (this.$refs.toast) {
                this.$refs.toast.show("退出失败");
              } else {
                common_vendor.index.showToast({ title: "退出失败", icon: "none" });
              }
            } finally {
              this.loading = false;
            }
          }
        }
      });
    },
    showEditModal() {
      this.showEditModalFlag = true;
    },
    hideEditModal() {
      this.showEditModalFlag = false;
    },
    editNickname() {
      this.hideEditModal();
      common_vendor.index.showModal({
        title: "修改昵称",
        editable: true,
        placeholderText: "请输入新昵称",
        success: async (res) => {
          if (res.confirm && res.content) {
            try {
              const response = await this.$api.user.updateUser({ nickname: res.content });
              if (response.code === 200) {
                const updatedUserInfo = { ...this.userInfo, nickname: res.content };
                common_vendor.index.setStorageSync("userInfo", updatedUserInfo);
                this.SET_USER_INFO(updatedUserInfo);
                if (this.$refs.toast) {
                  this.$refs.toast.show("昵称修改成功");
                } else {
                  common_vendor.index.showToast({ title: "昵称修改成功", icon: "success" });
                }
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/profile/profile.vue:767", "修改昵称失败:", error);
              common_vendor.index.showToast({ title: "修改失败", icon: "none" });
            }
          }
        }
      });
    },
    goToCreateFamily() {
      common_vendor.index.navigateTo({ url: "/pages/profile/family/create" });
    },
    goToJoinFamily() {
      common_vendor.index.navigateTo({ url: "/pages/profile/family/add-family" });
    },
    handleLogout() {
      common_vendor.index.showModal({
        title: "确认退出",
        content: "确定要退出登录吗？",
        confirmText: "退出",
        cancelText: "取消",
        success: async (res) => {
          if (res.confirm) {
            this.loading = true;
            try {
              common_vendor.index.__f__("log", "at pages/profile/profile.vue:793", "开始退出登录...");
              try {
                await this.$api.user.logout();
                common_vendor.index.__f__("log", "at pages/profile/profile.vue:798", "后端退出接口调用成功");
              } catch (apiError) {
                common_vendor.index.__f__("warn", "at pages/profile/profile.vue:800", "后端退出接口调用失败，但继续执行本地退出:", apiError);
              }
              this.logout();
              common_vendor.index.__f__("log", "at pages/profile/profile.vue:805", "Vuex 用户数据已清除");
              common_vendor.index.removeStorageSync("token");
              common_vendor.index.removeStorageSync("userInfo");
              common_vendor.index.removeStorageSync("currentFamily");
              common_vendor.index.__f__("log", "at pages/profile/profile.vue:811", "本地存储已清除");
              if (this.$refs.toast) {
                this.$refs.toast.show("退出成功");
              } else {
                common_vendor.index.showToast({ title: "退出成功", icon: "success" });
              }
              setTimeout(() => {
                common_vendor.index.__f__("log", "at pages/profile/profile.vue:822", "跳转到登录页...");
                common_vendor.index.reLaunch({
                  url: "/pages/login/login"
                });
              }, 1e3);
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/profile/profile.vue:829", "退出失败:", error);
              if (this.$refs.toast) {
                this.$refs.toast.show("退出失败");
              } else {
                common_vendor.index.showToast({ title: "退出失败", icon: "none" });
              }
            } finally {
              this.loading = false;
            }
          }
        }
      });
    }
  }
};
if (!Array) {
  const _component_loading = common_vendor.resolveComponent("loading");
  const _component_toast = common_vendor.resolveComponent("toast");
  (_component_loading + _component_toast)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a;
  return common_vendor.e({
    a: common_assets._imports_0$1,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_assets._imports_2$5,
    d: common_vendor.o((...args) => $options.showMenu && $options.showMenu(...args)),
    e: !_ctx.isLoggedIn
  }, !_ctx.isLoggedIn ? {
    f: common_assets._imports_2$4
  } : !$options.hasFamily ? {
    h: $options.displayAvatarUrl,
    i: common_vendor.t(_ctx.userInfo.nickname || "用户"),
    j: common_vendor.o((...args) => $options.showEditModal && $options.showEditModal(...args)),
    k: common_vendor.o((...args) => $options.goToCreateFamily && $options.goToCreateFamily(...args)),
    l: common_vendor.o((...args) => $options.goToJoinFamily && $options.goToJoinFamily(...args))
  } : common_vendor.e({
    m: $options.displayAvatarUrl,
    n: common_vendor.o((...args) => $options.changeAvatar && $options.changeAvatar(...args)),
    o: common_vendor.t(_ctx.userInfo.nickname || "用户"),
    p: common_vendor.t(_ctx.userInfo.id),
    q: _ctx.userInfo.familyId
  }, _ctx.userInfo.familyId ? {
    r: common_vendor.t(((_a = $data.currentFamily) == null ? void 0 : _a.name) || "家庭成员")
  } : {}, {
    s: common_assets._imports_1$5,
    t: common_vendor.o((...args) => $options.editProfile && $options.editProfile(...args)),
    v: common_vendor.o((...args) => $options.editHealthTags && $options.editHealthTags(...args)),
    w: $data.healthTags && $data.healthTags.length > 0
  }, $data.healthTags && $data.healthTags.length > 0 ? common_vendor.e({
    x: common_vendor.f($data.healthTags.slice(0, 3), (tag, k0, i0) => {
      return {
        a: common_vendor.t(tag),
        b: tag
      };
    }),
    y: $data.healthTags.length > 3
  }, $data.healthTags.length > 3 ? {
    z: common_vendor.t($data.healthTags.length - 3)
  } : {}) : {
    A: common_assets._imports_4$5,
    B: common_vendor.o((...args) => $options.editHealthTags && $options.editHealthTags(...args))
  }, {
    C: common_assets._imports_5,
    D: common_vendor.t($data.familyMembers.length),
    E: common_vendor.o((...args) => $options.goToFamily && $options.goToFamily(...args)),
    F: common_assets._imports_6,
    G: common_vendor.t($data.wasteRate || 0),
    H: common_vendor.o((...args) => $options.goToReports && $options.goToReports(...args)),
    I: common_assets._imports_1$6,
    J: common_vendor.o((...args) => $options.goToSettings && $options.goToSettings(...args)),
    K: $data.currentFamily
  }, $data.currentFamily ? {
    L: common_vendor.t($data.currentWeek),
    M: common_vendor.t($data.overviewData.consumption || 0),
    N: common_vendor.t($data.overviewData.consumptionChange > 0 ? "+" : ""),
    O: common_vendor.t($data.overviewData.consumptionChange || 0),
    P: $data.overviewData.consumptionChange > 0 ? 1 : "",
    Q: common_vendor.t($data.overviewData.wasteRate || 0),
    R: common_vendor.t($data.overviewData.wasteChange > 0 ? "+" : ""),
    S: common_vendor.t($data.overviewData.wasteChange || 0),
    T: $data.overviewData.wasteChange < 0 ? 1 : "",
    U: common_vendor.t($data.overviewData.saved || 0),
    V: common_vendor.t($data.overviewData.savedChange || 0)
  } : {}, {
    W: common_assets._imports_8,
    X: common_assets._imports_0$2,
    Y: common_vendor.o((...args) => $options.goToInventory && $options.goToInventory(...args)),
    Z: common_assets._imports_10,
    aa: common_assets._imports_0$2,
    ab: common_vendor.o((...args) => $options.goToShopping && $options.goToShopping(...args)),
    ac: common_assets._imports_11,
    ad: common_assets._imports_0$2,
    ae: common_vendor.o((...args) => $options.goToRecipes && $options.goToRecipes(...args)),
    af: common_assets._imports_3$2,
    ag: common_vendor.o((...args) => $options.handleLogout && $options.handleLogout(...args))
  }), {
    g: !$options.hasFamily,
    ah: $data.refreshing,
    ai: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args)),
    aj: $data.showEditModalFlag
  }, $data.showEditModalFlag ? {
    ak: common_vendor.o((...args) => $options.changeAvatar && $options.changeAvatar(...args)),
    al: common_vendor.o((...args) => $options.editNickname && $options.editNickname(...args)),
    am: common_vendor.o((...args) => $options.hideEditModal && $options.hideEditModal(...args)),
    an: common_vendor.o(() => {
    }),
    ao: common_vendor.o((...args) => $options.hideEditModal && $options.hideEditModal(...args))
  } : {}, {
    ap: $data.showHealthTagsModal
  }, $data.showHealthTagsModal ? {
    aq: common_assets._imports_1,
    ar: common_vendor.o((...args) => $options.hideHealthTagsModal && $options.hideHealthTagsModal(...args)),
    as: common_vendor.f($data.availableHealthTags, (tag, k0, i0) => {
      return {
        a: common_vendor.t(tag),
        b: tag,
        c: $data.selectedHealthTags.includes(tag) ? 1 : "",
        d: common_vendor.o(($event) => $options.toggleTag(tag), tag)
      };
    }),
    at: common_vendor.o((...args) => $options.hideHealthTagsModal && $options.hideHealthTagsModal(...args)),
    av: common_vendor.o((...args) => $options.confirmHealthTags && $options.confirmHealthTags(...args)),
    aw: common_vendor.o(() => {
    }),
    ax: common_vendor.o((...args) => $options.hideHealthTagsModal && $options.hideHealthTagsModal(...args))
  } : {}, {
    ay: $data.loading
  }, $data.loading ? {
    az: common_vendor.p({
      text: "加载中..."
    })
  } : {}, {
    aA: common_vendor.sr("toast", "dd383ca2-1")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-dd383ca2"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/profile.js.map
