"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const NavBar = () => "../../components/common/NavBar.js";
const Loading = () => "../../components/common/Loading.js";
const Toast = () => "../../components/common/Toast.js";
const _sfc_main = {
  components: {
    NavBar,
    Loading,
    Toast
  },
  data() {
    return {
      saving: false,
      loading: false,
      formData: {
        nickname: "",
        avatarUrl: "",
        gender: "",
        birthday: "",
        region: "",
        bio: "",
        dietaryHabits: [],
        allergies: ""
      },
      originalData: {},
      genderOptions: ["男", "女", "保密"],
      genderIndex: 2,
      dietOptions: [
        { label: "素食", value: "vegetarian" },
        { label: "荤素搭配", value: "omnivore" },
        { label: "低脂", value: "low-fat" },
        { label: "低盐", value: "low-salt" },
        { label: "无麸质", value: "gluten-free" },
        { label: "有机", value: "organic" }
      ],
      calendarInit: false,
      recipeData: [],
      inventoryData: []
    };
  },
  computed: {
    ...common_vendor.mapState("user", ["userInfo"]),
    ...common_vendor.mapState("family", ["currentFamily"]),
    formChanged() {
      return JSON.stringify(this.formData) !== JSON.stringify(this.originalData);
    }
  },
  onLoad() {
    this.checkLoginStatus();
  },
  methods: {
    ...common_vendor.mapMutations("user", ["SET_USER_INFO"]),
    // 检查登录状态
    async checkLoginStatus() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (!userInfo || !userInfo.id) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.redirectTo({
            url: "/pages/login/login"
          });
        }, 1e3);
        return;
      }
      this.checkFamilyStatus();
    },
    // 检查家庭状态
    async checkFamilyStatus() {
      try {
        const userInfo = common_vendor.index.getStorageSync("userInfo");
        const familyId = userInfo.familyId;
        if (!familyId) {
          common_vendor.index.showToast({
            title: "您还未加入家庭",
            icon: "none"
          });
        }
        await this.loadUserData();
        this.initCalendar();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/edit.vue:299", "检查家庭状态失败:", error);
        await this.loadUserData();
        this.initCalendar();
      }
    },
    getFullAvatarUrl(avatarUrl) {
      if (!avatarUrl) {
        return "/static/images/default-avatar.png";
      }
      if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
        return avatarUrl;
      }
      if (typeof avatarUrl === "object" && avatarUrl.url) {
        avatarUrl = avatarUrl.url;
      }
      const baseURL = "http://localhost:3000";
      if (avatarUrl.startsWith("/")) {
        return baseURL + avatarUrl;
      }
      return avatarUrl || "/static/images/default-avatar.png";
    },
    loadUserData() {
      const userInfo = common_vendor.index.getStorageSync("userInfo") || this.userInfo || {};
      let avatarUrl = userInfo.avatarUrl || "";
      if (typeof avatarUrl === "object" && avatarUrl.url) {
        avatarUrl = avatarUrl.url;
      }
      this.formData = {
        nickname: userInfo.nickname || "",
        avatarUrl,
        gender: userInfo.gender || "保密",
        birthday: userInfo.birthday || "",
        region: userInfo.region || "",
        bio: userInfo.bio || "",
        dietaryHabits: userInfo.dietaryHabits || [],
        allergies: userInfo.allergies || ""
      };
      this.originalData = JSON.parse(JSON.stringify(this.formData));
      const genderIndex = this.genderOptions.indexOf(this.formData.gender);
      this.genderIndex = genderIndex > -1 ? genderIndex : 2;
    },
    // 初始化日历
    initCalendar() {
      this.calendarInit = true;
      common_vendor.index.__f__("log", "at pages/profile/edit.vue:359", "日历初始化完成");
    },
    // 加载菜谱和库存数据
    async loadRecipeAndInventoryData() {
      try {
        const userInfo = common_vendor.index.getStorageSync("userInfo");
        const familyId = userInfo.familyId;
        if (familyId) {
          const recipeResponse = await this.$api.recipe.getTodayRecommend({
            familyId,
            userId: userInfo.id
          });
          if (recipeResponse.code === 200) {
            this.recipeData = recipeResponse.data || [];
          }
          const inventoryResponse = await this.$api.inventory.getFamilyInventory(familyId);
          if (inventoryResponse.code === 200) {
            this.inventoryData = inventoryResponse.data || [];
          }
          common_vendor.index.__f__("log", "at pages/profile/edit.vue:388", "菜谱和库存数据加载完成");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/edit.vue:391", "加载菜谱和库存数据失败:", error);
      }
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    changeAvatar() {
      this.$refs.avatarPopup.open();
    },
    closeAvatarPopup() {
      this.$refs.avatarPopup.close();
    },
    chooseAvatarFromAlbum() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album"],
        success: (res) => {
          this.uploadAvatar(res.tempFilePaths[0]);
          this.closeAvatarPopup();
        }
      });
    },
    takeAvatarPhoto() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["camera"],
        success: (res) => {
          this.uploadAvatar(res.tempFilePaths[0]);
          this.closeAvatarPopup();
        }
      });
    },
    removeAvatar() {
      this.formData.avatarUrl = "";
      this.closeAvatarPopup();
    },
    async uploadAvatar(filePath) {
      this.loading = true;
      try {
        const uploadRes = await this.$api.user.uploadAvatar(filePath);
        if (uploadRes.code === 200) {
          this.formData.avatarUrl = uploadRes.data;
          this.$refs.toast.show("头像上传成功", "success");
        } else {
          this.$refs.toast.show(uploadRes.message || "上传失败", "error");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/edit.vue:451", "上传头像失败:", error);
        this.$refs.toast.show("上传失败: " + (error.message || "网络错误"), "error");
      } finally {
        this.loading = false;
      }
    },
    onGenderChange(e) {
      const index = e.detail.value;
      this.genderIndex = index;
      this.formData.gender = this.genderOptions[index];
    },
    onBirthdayChange(e) {
      this.formData.birthday = e.detail.value;
    },
    onRegionChange(e) {
      const values = e.detail.value;
      this.formData.region = values.join(" ");
    },
    toggleDietOption(value) {
      const index = this.formData.dietaryHabits.indexOf(value);
      if (index > -1) {
        this.formData.dietaryHabits.splice(index, 1);
      } else {
        this.formData.dietaryHabits.push(value);
      }
    },
    async saveProfile() {
      if (!this.formChanged) {
        this.$refs.toast.show("没有修改内容", "info");
        return;
      }
      if (!this.formData.nickname.trim()) {
        this.$refs.toast.show("请输入昵称", "error");
        return;
      }
      if (this.formData.nickname.length < 2) {
        this.$refs.toast.show("昵称至少2个字符", "error");
        return;
      }
      this.saving = true;
      try {
        const userInfo = common_vendor.index.getStorageSync("userInfo") || {};
        const userId = userInfo.id || 1;
        const updateData = {
          userId,
          nickname: this.formData.nickname,
          avatarUrl: this.formData.avatarUrl,
          gender: this.formData.gender,
          birthday: this.formData.birthday,
          region: this.formData.region,
          bio: this.formData.bio,
          dietaryHabits: this.formData.dietaryHabits,
          allergies: this.formData.allergies
        };
        let response = null;
        try {
          if (this.formData.dietaryHabits.length > 0 || this.formData.allergies) {
            const healthTags = [...this.formData.dietaryHabits];
            if (this.formData.allergies) {
              healthTags.push(`过敏:${this.formData.allergies}`);
            }
            await this.$api.user.updateHealthTags(userId, healthTags);
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
          response = { code: 200, message: "success" };
        } catch (apiError) {
          common_vendor.index.__f__("error", "at pages/profile/edit.vue:530", "API调用失败，使用本地保存:", apiError);
          response = { code: 200, message: "success" };
        }
        if (response.code === 200) {
          const updatedUserInfo = {
            ...userInfo,
            nickname: this.formData.nickname,
            avatarUrl: this.formData.avatarUrl,
            gender: this.formData.gender,
            birthday: this.formData.birthday,
            region: this.formData.region,
            bio: this.formData.bio,
            dietaryHabits: this.formData.dietaryHabits,
            allergies: this.formData.allergies,
            healthTags: this.formData.dietaryHabits
          };
          common_vendor.index.setStorageSync("userInfo", updatedUserInfo);
          this.SET_USER_INFO(updatedUserInfo);
          this.$refs.toast.show("资料更新成功", "success");
          this.originalData = JSON.parse(JSON.stringify(this.formData));
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1e3);
        } else {
          this.$refs.toast.show(response.message || "保存失败", "error");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/edit.vue:563", "保存失败:", error);
        this.$refs.toast.show("保存失败: " + (error.message || "网络错误"), "error");
      } finally {
        this.saving = false;
      }
    }
  }
};
if (!Array) {
  const _component_uni_popup = common_vendor.resolveComponent("uni-popup");
  const _component_loading = common_vendor.resolveComponent("loading");
  const _component_toast = common_vendor.resolveComponent("toast");
  (_component_uni_popup + _component_loading + _component_toast)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$1,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: $options.getFullAvatarUrl($data.formData.avatarUrl),
    d: common_assets._imports_4$6,
    e: common_vendor.o((...args) => $options.changeAvatar && $options.changeAvatar(...args)),
    f: $data.formData.nickname,
    g: common_vendor.o(($event) => $data.formData.nickname = $event.detail.value),
    h: common_vendor.t($data.formData.nickname.length),
    i: common_vendor.t($data.formData.gender || "请选择性别"),
    j: $data.genderOptions,
    k: $data.genderIndex,
    l: common_vendor.o((...args) => $options.onGenderChange && $options.onGenderChange(...args)),
    m: common_vendor.t($data.formData.birthday || "选择生日"),
    n: $data.formData.birthday,
    o: common_vendor.o((...args) => $options.onBirthdayChange && $options.onBirthdayChange(...args)),
    p: common_vendor.t($data.formData.region || "选择地区"),
    q: common_vendor.o((...args) => $options.onRegionChange && $options.onRegionChange(...args)),
    r: $data.formData.bio,
    s: common_vendor.o(($event) => $data.formData.bio = $event.detail.value),
    t: common_vendor.t($data.formData.bio.length),
    v: common_vendor.f($data.dietOptions, (option, k0, i0) => {
      var _a;
      return {
        a: common_vendor.t(option.label),
        b: option.value,
        c: ((_a = $data.formData.dietaryHabits) == null ? void 0 : _a.includes(option.value)) ? 1 : "",
        d: common_vendor.o(($event) => $options.toggleDietOption(option.value), option.value)
      };
    }),
    w: $data.formData.allergies,
    x: common_vendor.o(($event) => $data.formData.allergies = $event.detail.value),
    y: common_vendor.t($data.saving ? "保存中..." : "保存修改"),
    z: common_vendor.o((...args) => $options.saveProfile && $options.saveProfile(...args)),
    A: $data.saving || !$options.formChanged,
    B: $data.saving || !$options.formChanged ? 1 : "",
    C: common_assets._imports_1,
    D: common_vendor.o((...args) => $options.closeAvatarPopup && $options.closeAvatarPopup(...args)),
    E: common_assets._imports_3$3,
    F: common_vendor.o((...args) => $options.chooseAvatarFromAlbum && $options.chooseAvatarFromAlbum(...args)),
    G: common_assets._imports_4$6,
    H: common_vendor.o((...args) => $options.takeAvatarPhoto && $options.takeAvatarPhoto(...args)),
    I: common_assets._imports_4$3,
    J: common_vendor.o((...args) => $options.removeAvatar && $options.removeAvatar(...args)),
    K: common_vendor.sr("avatarPopup", "ead3e541-0"),
    L: common_vendor.p({
      type: "bottom",
      ["safe-area"]: false
    }),
    M: $data.loading
  }, $data.loading ? {
    N: common_vendor.p({
      text: "保存中..."
    })
  } : {}, {
    O: common_vendor.sr("toast", "ead3e541-2")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ead3e541"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/edit.js.map
