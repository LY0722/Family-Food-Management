"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_pageGuard = require("../../../utils/pageGuard.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  name: "FamilyPage",
  data() {
    return {
      familyInfo: {},
      members: [],
      defaultAvatar: "/static/images/default-avatar.png",
      editModalVisible: false,
      saving: false,
      editForm: {
        name: "",
        description: ""
      }
    };
  },
  computed: {
    currentUser() {
      return common_vendor.index.getStorageSync("userInfo") || {};
    },
    isAdmin() {
      return this.currentUser.role === "admin";
    },
    adminInfo() {
      return this.members.find((m) => m.role === "admin") || {};
    }
  },
  onLoad() {
    if (!utils_pageGuard.requireLogin()) {
      return;
    }
    this.loadFamilyData();
  },
  onShow() {
    if (!utils_pageGuard.requireLogin()) {
      return;
    }
    this.loadFamilyData();
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    async loadFamilyData() {
      if (!this.currentUser.familyId)
        return;
      try {
        const [familyRes, membersRes] = await Promise.all([
          this.$api.family.getInfo(this.currentUser.familyId),
          this.$api.family.getMembers(this.currentUser.familyId)
        ]);
        if (familyRes.code === 200) {
          this.familyInfo = familyRes.data || {};
        }
        if (membersRes.code === 200) {
          this.members = membersRes.data || [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/family/family.vue:223", "加载家庭数据失败:", error);
      }
    },
    getRoleText(role) {
      const roleMap = {
        admin: "家长",
        member: "成员"
      };
      return roleMap[role] || "成员";
    },
    formatDate(date) {
      if (!date)
        return "---";
      const d = new Date(date);
      return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
    },
    canManageMember(member) {
      if (!this.isAdmin)
        return false;
      if (member.id === this.currentUser.id)
        return false;
      return true;
    },
    handleAddMember() {
      common_vendor.index.navigateTo({
        url: "/pages/profile/family/add-member"
      });
    },
    handleRemoveMember(member) {
      common_vendor.index.showModal({
        title: "确认移除",
        content: `确定要移除 ${member.nickname || member.name} 吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const response = await this.$api.family.removeMember(this.currentUser.familyId, member.id);
              if (response.code === 200) {
                common_vendor.index.showToast({
                  title: "移除成功",
                  icon: "success"
                });
                this.loadFamilyData();
              } else {
                common_vendor.index.showToast({
                  title: response.message || "移除失败",
                  icon: "none"
                });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/profile/family/family.vue:275", "移除成员失败:", error);
              common_vendor.index.showToast({
                title: "移除失败",
                icon: "none"
              });
            }
          }
        }
      });
    },
    showEditModal() {
      this.editForm.name = this.familyInfo.name || "";
      this.editForm.description = this.familyInfo.description || "";
      this.editModalVisible = true;
    },
    hideEditModal() {
      this.editModalVisible = false;
    },
    async handleSave() {
      if (!this.editForm.name.trim()) {
        common_vendor.index.showToast({
          title: "请输入家庭名称",
          icon: "none"
        });
        return;
      }
      this.saving = true;
      try {
        const response = await this.$api.family.updateInfo(this.currentUser.familyId, {
          name: this.editForm.name.trim(),
          description: this.editForm.description.trim()
        });
        if (response.code === 200) {
          common_vendor.index.showToast({
            title: "保存成功",
            icon: "success"
          });
          this.loadFamilyData();
          this.hideEditModal();
        } else {
          common_vendor.index.showToast({
            title: response.message || "保存失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/family/family.vue:327", "保存失败:", error);
        common_vendor.index.showToast({
          title: "保存失败",
          icon: "none"
        });
      } finally {
        this.saving = false;
      }
    },
    handleShare() {
      const shareCode = this.familyInfo.familyCode || this.familyInfo.family_code || this.familyInfo.id;
      const shareText = `邀请你加入我的家庭「${this.familyInfo.name}」

家庭邀请码：${shareCode}`;
      common_vendor.index.showModal({
        title: "分享家庭",
        content: shareText,
        confirmText: "复制",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.setClipboardData({
              data: shareText,
              success: () => {
                common_vendor.index.showToast({
                  title: "已复制到剪贴板",
                  icon: "success"
                });
              }
            });
          }
        }
      });
    },
    copyFamilyCode() {
      const familyCode = this.familyInfo.familyCode || this.familyInfo.family_code;
      if (!familyCode) {
        common_vendor.index.showToast({
          title: "家庭码不存在",
          icon: "none"
        });
        return;
      }
      common_vendor.index.setClipboardData({
        data: familyCode,
        success: () => {
          common_vendor.index.showToast({
            title: "已复制家庭码",
            icon: "success"
          });
        }
      });
    },
    handleDeleteFamily() {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "删除家庭后，所有数据将被清空且无法恢复，确定要删除吗？",
        confirmColor: "#ff4d4f",
        success: async (res) => {
          if (res.confirm) {
            try {
              const response = await this.$api.family.delete(this.currentUser.familyId);
              if (response.code === 200) {
                common_vendor.index.showToast({
                  title: "删除成功",
                  icon: "success"
                });
                setTimeout(() => {
                  common_vendor.index.reLaunch({ url: "/pages/home/home" });
                }, 1500);
              } else {
                common_vendor.index.showToast({
                  title: response.message || "删除失败",
                  icon: "none"
                });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/profile/family/family.vue:408", "删除家庭失败:", error);
              common_vendor.index.showToast({
                title: "删除失败",
                icon: "none"
              });
            }
          }
        }
      });
    },
    async handleExitFamily() {
      common_vendor.index.showModal({
        title: "确认退出",
        content: "退出家庭后，您将没有家庭，可以创建或加入新家庭，确定要退出吗？",
        confirmText: "退出",
        confirmColor: "#ff4d4f",
        success: async (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({ title: "退出中..." });
            try {
              const oldFamilyId = this.currentUser.familyId;
              const userId = this.currentUser.id;
              const leaveRes = await this.$api.family.leave(oldFamilyId, {
                userId
              });
              if (leaveRes.code !== 200) {
                common_vendor.index.hideLoading();
                common_vendor.index.showToast({
                  title: leaveRes.message || "退出失败",
                  icon: "none"
                });
                return;
              }
              const updatedUserInfo = {
                ...this.currentUser,
                familyId: null,
                currentFamilyId: null
              };
              common_vendor.index.setStorageSync("userInfo", updatedUserInfo);
              this.$store.commit("user/SET_USER_INFO", updatedUserInfo);
              this.$store.commit("user/SET_CURRENT_FAMILY", null);
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({
                title: "已退出家庭",
                icon: "success"
              });
              setTimeout(() => {
                common_vendor.index.switchTab({
                  url: "/pages/home/home"
                });
              }, 1500);
            } catch (error) {
              common_vendor.index.hideLoading();
              common_vendor.index.__f__("error", "at pages/profile/family/family.vue:474", "退出家庭失败:", error);
              common_vendor.index.showToast({
                title: "退出失败",
                icon: "none"
              });
            }
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$1,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.t($data.familyInfo.id || "---"),
    d: $options.adminInfo.avatarUrl || $data.defaultAvatar,
    e: common_vendor.t($data.familyInfo.name || "我的家庭"),
    f: common_assets._imports_1$5,
    g: common_vendor.o((...args) => $options.showEditModal && $options.showEditModal(...args)),
    h: common_vendor.t($data.familyInfo.familyCode || $data.familyInfo.family_code || "---"),
    i: common_vendor.o((...args) => $options.copyFamilyCode && $options.copyFamilyCode(...args)),
    j: $data.members.length === 0
  }, $data.members.length === 0 ? {
    k: common_assets._imports_2$7
  } : {
    l: common_vendor.f($data.members, (member, k0, i0) => {
      return common_vendor.e({
        a: member.avatarUrl || $data.defaultAvatar,
        b: common_vendor.t(member.nickname || member.name),
        c: common_vendor.t($options.getRoleText(member.role)),
        d: common_vendor.t($options.formatDate(member.joinedAt)),
        e: $options.canManageMember(member)
      }, $options.canManageMember(member) ? {
        f: common_vendor.o(($event) => $options.handleRemoveMember(member), member.id)
      } : {}, {
        g: member.id
      });
    })
  }, {
    m: common_vendor.o((...args) => $options.handleAddMember && $options.handleAddMember(...args)),
    n: common_vendor.o((...args) => $options.handleExitFamily && $options.handleExitFamily(...args)),
    o: $data.editModalVisible
  }, $data.editModalVisible ? {
    p: common_assets._imports_1,
    q: common_vendor.o((...args) => $options.hideEditModal && $options.hideEditModal(...args)),
    r: $data.editForm.name,
    s: common_vendor.o(($event) => $data.editForm.name = $event.detail.value),
    t: $data.editForm.description,
    v: common_vendor.o(($event) => $data.editForm.description = $event.detail.value),
    w: common_vendor.o((...args) => $options.handleShare && $options.handleShare(...args)),
    x: common_vendor.o((...args) => $options.handleDeleteFamily && $options.handleDeleteFamily(...args)),
    y: common_vendor.o((...args) => $options.hideEditModal && $options.hideEditModal(...args)),
    z: $data.saving,
    A: common_vendor.o((...args) => $options.handleSave && $options.handleSave(...args)),
    B: common_vendor.o(() => {
    }),
    C: common_vendor.o((...args) => $options.hideEditModal && $options.hideEditModal(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-085da1dc"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/profile/family/family.js.map
