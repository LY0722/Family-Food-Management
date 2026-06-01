"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  name: "AddMemberPage",
  data() {
    return {
      familyInfo: {
        name: "",
        familyCode: "",
        id: ""
      },
      memberCount: 0,
      showCodeModal: false,
      showQRCodeModal: false,
      showLinkModal: false,
      qrCodeUrl: "",
      inviteLink: ""
    };
  },
  onLoad(options) {
    this.loadFamilyInfo();
  },
  methods: {
    async loadFamilyInfo() {
      try {
        const userInfo = common_vendor.index.getStorageSync("userInfo");
        const familyId = userInfo == null ? void 0 : userInfo.familyId;
        if (!familyId) {
          common_vendor.index.showToast({
            title: "请先加入家庭",
            icon: "none"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
          return;
        }
        const response = await this.$api.family.getInfo(familyId);
        if (response.code === 200) {
          this.familyInfo = response.data;
          this.loadMemberCount();
          this.generateInviteLink();
        } else {
          common_vendor.index.showToast({
            title: response.message || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/family/add-member.vue:253", "加载家庭信息失败:", error);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      }
    },
    async loadMemberCount() {
      var _a;
      try {
        const response = await this.$api.family.getMembers(this.familyInfo.id);
        if (response.code === 200) {
          this.memberCount = ((_a = response.data) == null ? void 0 : _a.length) || 0;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/family/add-member.vue:269", "加载成员数量失败:", error);
      }
    },
    generateInviteLink() {
      const baseUrl = "https://your-domain.com";
      this.inviteLink = `${baseUrl}/invite?code=${this.familyInfo.familyCode || this.familyInfo.family_code}`;
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    showCodeInvite() {
      this.showCodeModal = true;
    },
    closeCodeModal() {
      this.showCodeModal = false;
    },
    showQRCode() {
      this.generateQRCode();
      this.showQRCodeModal = true;
    },
    closeQRCodeModal() {
      this.showQRCodeModal = false;
    },
    showLinkInvite() {
      this.showLinkModal = true;
    },
    closeLinkModal() {
      this.showLinkModal = false;
    },
    showWechatInvite() {
      common_vendor.index.showShareMenu({
        withShareTicket: true,
        success: () => {
          common_vendor.index.__f__("log", "at pages/profile/family/add-member.vue:311", "分享成功");
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/profile/family/add-member.vue:314", "分享失败:", err);
          common_vendor.index.showToast({
            title: "分享失败",
            icon: "none"
          });
        }
      });
    },
    copyCode() {
      const code = this.familyInfo.familyCode || this.familyInfo.family_code;
      common_vendor.index.setClipboardData({
        data: code,
        success: () => {
          common_vendor.index.showToast({
            title: "复制成功",
            icon: "success"
          });
        }
      });
    },
    shareCode() {
      const code = this.familyInfo.familyCode || this.familyInfo.family_code;
      common_vendor.index.share({
        provider: "weixin",
        scene: "WXSceneSession",
        type: 0,
        summary: `邀请你加入【${this.familyInfo.name}】，家庭码：${code}`,
        success: () => {
          common_vendor.index.showToast({
            title: "分享成功",
            icon: "success"
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/profile/family/add-member.vue:350", "分享失败:", err);
          common_vendor.index.showToast({
            title: "分享失败",
            icon: "none"
          });
        }
      });
    },
    generateQRCode() {
      this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(this.inviteLink)}`;
    },
    saveQRCode() {
      common_vendor.index.showLoading({ title: "保存中..." });
      common_vendor.index.downloadFile({
        url: this.qrCodeUrl,
        success: (res) => {
          if (res.statusCode === 200) {
            common_vendor.index.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                common_vendor.index.hideLoading();
                common_vendor.index.showToast({
                  title: "保存成功",
                  icon: "success"
                });
              },
              fail: () => {
                common_vendor.index.hideLoading();
                common_vendor.index.showToast({
                  title: "保存失败",
                  icon: "none"
                });
              }
            });
          }
        },
        fail: () => {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "下载失败",
            icon: "none"
          });
        }
      });
    },
    shareQRCode() {
      common_vendor.index.showShareMenu({
        withShareTicket: true,
        success: () => {
          common_vendor.index.__f__("log", "at pages/profile/family/add-member.vue:403", "分享成功");
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/profile/family/add-member.vue:406", "分享失败:", err);
          common_vendor.index.showToast({
            title: "分享失败",
            icon: "none"
          });
        }
      });
    },
    copyLink() {
      common_vendor.index.setClipboardData({
        data: this.inviteLink,
        success: () => {
          common_vendor.index.showToast({
            title: "复制成功",
            icon: "success"
          });
        }
      });
    },
    shareLink() {
      common_vendor.index.share({
        provider: "weixin",
        scene: "WXSceneSession",
        type: 0,
        href: this.inviteLink,
        title: `邀请你加入【${this.familyInfo.name}】`,
        summary: "点击链接加入家庭",
        success: () => {
          common_vendor.index.showToast({
            title: "分享成功",
            icon: "success"
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/profile/family/add-member.vue:442", "分享失败:", err);
          common_vendor.index.showToast({
            title: "分享失败",
            icon: "none"
          });
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$1,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.o((...args) => $options.showCodeInvite && $options.showCodeInvite(...args)),
    d: common_vendor.o((...args) => $options.showQRCode && $options.showQRCode(...args)),
    e: common_vendor.o((...args) => $options.showLinkInvite && $options.showLinkInvite(...args)),
    f: common_vendor.o((...args) => $options.showWechatInvite && $options.showWechatInvite(...args)),
    g: common_vendor.t($data.familyInfo.name || "我的家庭"),
    h: common_vendor.t($data.familyInfo.familyCode || $data.familyInfo.family_code || "---"),
    i: common_vendor.o((...args) => $options.copyCode && $options.copyCode(...args)),
    j: common_vendor.t($data.memberCount),
    k: $data.showCodeModal
  }, $data.showCodeModal ? {
    l: common_assets._imports_1,
    m: common_vendor.o((...args) => $options.closeCodeModal && $options.closeCodeModal(...args)),
    n: common_vendor.t($data.familyInfo.familyCode || $data.familyInfo.family_code),
    o: common_assets._imports_2$8,
    p: common_vendor.o((...args) => $options.copyCode && $options.copyCode(...args)),
    q: common_assets._imports_3$4,
    r: common_vendor.o((...args) => $options.shareCode && $options.shareCode(...args)),
    s: common_vendor.o(() => {
    }),
    t: common_vendor.o((...args) => $options.closeCodeModal && $options.closeCodeModal(...args))
  } : {}, {
    v: $data.showQRCodeModal
  }, $data.showQRCodeModal ? {
    w: common_assets._imports_1,
    x: common_vendor.o((...args) => $options.closeQRCodeModal && $options.closeQRCodeModal(...args)),
    y: $data.qrCodeUrl,
    z: common_assets._imports_4$7,
    A: common_vendor.o((...args) => $options.saveQRCode && $options.saveQRCode(...args)),
    B: common_assets._imports_3$4,
    C: common_vendor.o((...args) => $options.shareQRCode && $options.shareQRCode(...args)),
    D: common_vendor.o(() => {
    }),
    E: common_vendor.o((...args) => $options.closeQRCodeModal && $options.closeQRCodeModal(...args))
  } : {}, {
    F: $data.showLinkModal
  }, $data.showLinkModal ? {
    G: common_assets._imports_1,
    H: common_vendor.o((...args) => $options.closeLinkModal && $options.closeLinkModal(...args)),
    I: common_vendor.t($data.inviteLink),
    J: common_assets._imports_2$8,
    K: common_vendor.o((...args) => $options.copyLink && $options.copyLink(...args)),
    L: common_assets._imports_3$4,
    M: common_vendor.o((...args) => $options.shareLink && $options.shareLink(...args)),
    N: common_vendor.o(() => {
    }),
    O: common_vendor.o((...args) => $options.closeLinkModal && $options.closeLinkModal(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-67d56d49"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/profile/family/add-member.js.map
