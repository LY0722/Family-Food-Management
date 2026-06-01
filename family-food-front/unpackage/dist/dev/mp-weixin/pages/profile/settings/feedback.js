"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  name: "FeedbackPage",
  data() {
    return {
      feedbackType: "bug",
      feedbackContent: "",
      contentLength: 0,
      uploadedImages: [],
      phoneNumber: "",
      email: "",
      faqList: [
        {
          question: "如何添加家庭成员？",
          answer: '在"我的"页面点击"家庭管理"，然后点击"邀请成员"，选择邀请方式（家庭码/二维码/链接/微信）即可邀请成员加入。',
          expanded: false
        },
        {
          question: "食材过期提醒如何设置？",
          answer: '在"我的"页面点击"系统设置"，然后点击"通知设置"，可以设置过期提醒的提前天数和提醒时间。',
          expanded: false
        },
        {
          question: "如何生成采购清单？",
          answer: '在"采购"页面点击"AI生成"按钮，系统会根据您的库存和消耗习惯智能生成采购清单。您也可以手动添加采购项。',
          expanded: false
        },
        {
          question: "数据报告如何导出？",
          answer: '在"我的"页面点击"消耗报告"，选择时间范围后，点击"导出报告"按钮，可以选择导出为图片或PDF格式。',
          expanded: false
        }
      ]
    };
  },
  computed: {
    canSubmit() {
      return this.feedbackContent.trim().length > 0 && (this.phoneNumber.trim().length === 11 || this.email.trim().length > 0);
    }
  },
  onLoad() {
    this.loadUserInfo();
  },
  methods: {
    loadUserInfo() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (userInfo) {
        this.phoneNumber = userInfo.phone || "";
        this.email = userInfo.email || "";
      }
    },
    setFeedbackType(type) {
      this.feedbackType = type;
    },
    onContentInput(e) {
      this.contentLength = e.detail.value.length;
    },
    chooseImage() {
      common_vendor.index.chooseImage({
        count: 3 - this.uploadedImages.length,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          const tempFilePaths = res.tempFilePaths;
          tempFilePaths.forEach((filePath) => {
            common_vendor.index.uploadFile({
              url: this.$api.baseURL + "/api/upload/image",
              filePath,
              name: "file",
              header: {
                "Authorization": "Bearer " + common_vendor.index.getStorageSync("token")
              },
              success: (uploadRes) => {
                const data = JSON.parse(uploadRes.data);
                if (data.code === 200) {
                  this.uploadedImages.push(data.data.url);
                } else {
                  common_vendor.index.showToast({
                    title: "上传失败",
                    icon: "none"
                  });
                }
              },
              fail: () => {
                common_vendor.index.showToast({
                  title: "上传失败",
                  icon: "none"
                });
              }
            });
          });
        }
      });
    },
    deleteImage(index) {
      this.uploadedImages.splice(index, 1);
    },
    toggleFaq(index) {
      this.faqList[index].expanded = !this.faqList[index].expanded;
    },
    contactWechat() {
      common_vendor.index.showModal({
        title: "微信客服",
        content: "微信号：family_food_support\n\n请添加客服微信，我们将尽快为您解答问题。",
        showCancel: false
      });
    },
    contactPhone() {
      common_vendor.index.makePhoneCall({
        phoneNumber: "400-xxx-xxxx"
      });
    },
    contactEmail() {
      common_vendor.index.setClipboardData({
        data: "support@example.com",
        success: () => {
          common_vendor.index.showToast({
            title: "邮箱已复制",
            icon: "success"
          });
        }
      });
    },
    async handleSubmit() {
      if (!this.canSubmit) {
        common_vendor.index.showToast({
          title: "请完善反馈信息",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({ title: "提交中..." });
      try {
        const response = await this.$api.user.submitFeedback({
          type: this.feedbackType,
          content: this.feedbackContent,
          images: this.uploadedImages,
          phone: this.phoneNumber,
          email: this.email
        });
        if (response.code === 200) {
          common_vendor.index.hideLoading();
          common_vendor.index.showModal({
            title: "提交成功",
            content: "感谢您的反馈！我们会尽快处理您的问题。",
            showCancel: false,
            success: () => {
              common_vendor.index.navigateBack();
            }
          });
        } else {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: response.message || "提交失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/profile/settings/feedback.vue:393", "提交反馈失败:", error);
        common_vendor.index.showToast({
          title: "提交失败",
          icon: "none"
        });
      }
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
    c: $data.feedbackType === "bug" ? 1 : "",
    d: common_vendor.o(($event) => $options.setFeedbackType("bug")),
    e: $data.feedbackType === "suggestion" ? 1 : "",
    f: common_vendor.o(($event) => $options.setFeedbackType("suggestion")),
    g: $data.feedbackType === "experience" ? 1 : "",
    h: common_vendor.o(($event) => $options.setFeedbackType("experience")),
    i: $data.feedbackType === "other" ? 1 : "",
    j: common_vendor.o(($event) => $options.setFeedbackType("other")),
    k: common_vendor.o([($event) => $data.feedbackContent = $event.detail.value, (...args) => $options.onContentInput && $options.onContentInput(...args)]),
    l: $data.feedbackContent,
    m: common_vendor.t($data.contentLength),
    n: common_vendor.f($data.uploadedImages, (image, index, i0) => {
      return {
        a: image,
        b: common_vendor.o(($event) => $options.deleteImage(index), index),
        c: index
      };
    }),
    o: common_assets._imports_1,
    p: $data.uploadedImages.length < 3
  }, $data.uploadedImages.length < 3 ? {
    q: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args))
  } : {}, {
    r: $data.phoneNumber,
    s: common_vendor.o(($event) => $data.phoneNumber = $event.detail.value),
    t: $data.email,
    v: common_vendor.o(($event) => $data.email = $event.detail.value),
    w: common_vendor.f($data.faqList, (faq, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(faq.question),
        b: faq.expanded ? "/static/icons/arrow-up.png" : "/static/icons/arrow-down.png",
        c: faq.expanded
      }, faq.expanded ? {
        d: common_vendor.t(faq.answer)
      } : {}, {
        e: index,
        f: common_vendor.o(($event) => $options.toggleFaq(index), index)
      });
    }),
    x: common_vendor.o((...args) => $options.contactWechat && $options.contactWechat(...args)),
    y: common_vendor.o((...args) => $options.contactPhone && $options.contactPhone(...args)),
    z: common_vendor.o((...args) => $options.contactEmail && $options.contactEmail(...args)),
    A: !$options.canSubmit ? 1 : "",
    B: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-32d43f49"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/profile/settings/feedback.js.map
