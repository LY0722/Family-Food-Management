"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_pageGuard = require("../../../utils/pageGuard.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  name: "AIChatPage",
  data() {
    return {
      messages: [],
      inputText: "",
      inputFocus: false,
      scrollToView: "",
      showVoiceModal: false,
      isRecording: false,
      userAvatar: "/static/images/default-avatar.png",
      aiAvatar: "/static/icons/ai.png"
    };
  },
  onLoad(options) {
    if (!utils_pageGuard.requireLogin()) {
      return;
    }
    if (options.initialMessage) {
      this.inputText = decodeURIComponent(options.initialMessage);
    }
    this.loadChatHistory();
    this.addWelcomeMessage();
  },
  onShow() {
    if (!utils_pageGuard.requireLogin()) {
      return;
    }
    this.scrollToBottom();
  },
  methods: {
    loadChatHistory() {
      const history = common_vendor.index.getStorageSync("aiChatHistory") || [];
      this.messages = history;
    },
    saveChatHistory() {
      common_vendor.index.setStorageSync("aiChatHistory", this.messages);
    },
    addWelcomeMessage() {
      if (this.messages.length === 0) {
        this.messages.push({
          role: "assistant",
          content: "您好！我是AI小助手，可以帮您：\n• 查询库存\n• 推荐菜谱\n• 记录用餐\n• 生成采购清单\n• 查询预警",
          timestamp: (/* @__PURE__ */ new Date()).getTime()
        });
      }
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    showMenu() {
      common_vendor.index.showActionSheet({
        itemList: ["清空对话", "导出对话"],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.clearChat();
          } else if (res.tapIndex === 1) {
            this.exportChat();
          }
        }
      });
    },
    clearChat() {
      common_vendor.index.showModal({
        title: "确认清空",
        content: "确定要清空所有对话记录吗？",
        success: (res) => {
          if (res.confirm) {
            this.messages = [];
            this.saveChatHistory();
            this.addWelcomeMessage();
            common_vendor.index.showToast({
              title: "已清空",
              icon: "success"
            });
          }
        }
      });
    },
    exportChat() {
      if (this.messages.length === 0) {
        common_vendor.index.showToast({
          title: "暂无对话记录",
          icon: "none"
        });
        return;
      }
      let content = "AI对话记录\n\n";
      this.messages.forEach((msg) => {
        const role = msg.role === "user" ? "我" : "AI助手";
        const time = this.formatTime(msg.timestamp);
        content += `[${time}] ${role}:
${msg.content}

`;
      });
      common_vendor.index.setClipboardData({
        data: content,
        success: () => {
          common_vendor.index.showToast({
            title: "已复制到剪贴板",
            icon: "success"
          });
        }
      });
    },
    sendQuickMessage(text) {
      this.inputText = text;
      this.sendMessage();
    },
    async sendMessage() {
      const text = this.inputText.trim();
      if (!text)
        return;
      this.addUserMessage(text);
      this.inputText = "";
      try {
        const response = await this.$api.ai.llmChat.send({
          message: text,
          history: this.messages.slice(-10)
        });
        if (response.code === 200) {
          this.addAssistantMessage(response.data.response);
        } else {
          this.addAssistantMessage("抱歉，我暂时无法回答这个问题，请稍后再试。");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/ai/chat.vue:254", "AI对话失败:", error);
        this.addAssistantMessage("网络错误，请检查网络连接后重试。");
      }
    },
    addUserMessage(content) {
      this.messages.push({
        role: "user",
        content,
        timestamp: (/* @__PURE__ */ new Date()).getTime()
      });
      this.saveChatHistory();
      this.scrollToBottom();
    },
    addAssistantMessage(content) {
      this.messages.push({
        role: "assistant",
        content,
        timestamp: (/* @__PURE__ */ new Date()).getTime()
      });
      this.saveChatHistory();
      this.scrollToBottom();
    },
    handleVoiceInput() {
      this.showVoiceModal = true;
      this.isRecording = true;
      setTimeout(() => {
        this.startVoiceRecognition();
      }, 500);
    },
    startVoiceRecognition() {
      common_vendor.index.startRecord({
        success: () => {
          common_vendor.index.__f__("log", "at pages/home/ai/chat.vue:291", "开始录音");
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/home/ai/chat.vue:294", "录音失败:", err);
          this.closeVoiceModal();
          common_vendor.index.showToast({
            title: "录音失败",
            icon: "none"
          });
        }
      });
    },
    stopVoiceRecognition() {
      common_vendor.index.stopRecord({
        success: (res) => {
          const tempFilePath = res.tempFilePath;
          this.uploadVoiceFile(tempFilePath);
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/home/ai/chat.vue:311", "停止录音失败:", err);
        }
      });
    },
    async uploadVoiceFile(filePath) {
      common_vendor.index.showLoading({ title: "识别中..." });
      try {
        const uploadRes = await common_vendor.index.uploadFile({
          url: this.$api.baseURL + "/api/ai/voice",
          filePath,
          name: "voice",
          header: {
            "Authorization": "Bearer " + common_vendor.index.getStorageSync("token")
          }
        });
        const data = JSON.parse(uploadRes.data);
        if (data.code === 200) {
          this.inputText = data.data.text;
          this.sendMessage();
        } else {
          common_vendor.index.showToast({
            title: "识别失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/ai/chat.vue:341", "语音识别失败:", error);
        common_vendor.index.showToast({
          title: "识别失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    cancelVoice() {
      if (this.isRecording) {
        common_vendor.index.stopRecord();
      }
      this.closeVoiceModal();
    },
    closeVoiceModal() {
      this.showVoiceModal = false;
      this.isRecording = false;
    },
    handleImageInput() {
      common_vendor.index.chooseImage({
        count: 1,
        success: (res) => {
          const filePath = res.tempFilePaths[0];
          this.uploadImageFile(filePath);
        }
      });
    },
    async uploadImageFile(filePath) {
      common_vendor.index.showLoading({ title: "上传中..." });
      try {
        const uploadRes = await common_vendor.index.uploadFile({
          url: this.$api.baseURL + "/api/ai/image",
          filePath,
          name: "image",
          header: {
            "Authorization": "Bearer " + common_vendor.index.getStorageSync("token")
          }
        });
        const data = JSON.parse(uploadRes.data);
        if (data.code === 200) {
          this.inputText = data.data.description;
          common_vendor.index.showToast({
            title: "识别成功",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: "识别失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/home/ai/chat.vue:401", "图片识别失败:", error);
        common_vendor.index.showToast({
          title: "识别失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const now = /* @__PURE__ */ new Date();
      const diff = now - date;
      if (diff < 6e4) {
        return "刚刚";
      } else if (diff < 36e5) {
        return `${Math.floor(diff / 6e4)}分钟前`;
      } else if (diff < 864e5) {
        return `${Math.floor(diff / 36e5)}小时前`;
      } else {
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.messages.length > 0) {
          this.scrollToView = "message-" + (this.messages.length - 1);
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$1,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_assets._imports_1$3,
    d: common_assets._imports_2$5,
    e: common_vendor.o((...args) => $options.showMenu && $options.showMenu(...args)),
    f: common_vendor.f($data.messages, (message, index, i0) => {
      return {
        a: message.role === "user" ? $data.userAvatar : $data.aiAvatar,
        b: common_vendor.t(message.content),
        c: common_vendor.t($options.formatTime(message.timestamp)),
        d: index,
        e: common_vendor.n(message.role),
        f: "message-" + index
      };
    }),
    g: $data.messages.length === 0
  }, $data.messages.length === 0 ? {
    h: common_vendor.o(($event) => $options.sendQuickMessage("今天能做什么菜？")),
    i: common_vendor.o(($event) => $options.sendQuickMessage("快过期的食材有哪些？")),
    j: common_vendor.o(($event) => $options.sendQuickMessage("帮我生成采购清单")),
    k: common_vendor.o(($event) => $options.sendQuickMessage("记录我今天吃了番茄炒蛋"))
  } : {}, {
    l: $data.scrollToView,
    m: common_assets._imports_3$5,
    n: common_vendor.o((...args) => $options.handleVoiceInput && $options.handleVoiceInput(...args)),
    o: common_vendor.o((...args) => $options.sendMessage && $options.sendMessage(...args)),
    p: $data.inputFocus,
    q: $data.inputText,
    r: common_vendor.o(($event) => $data.inputText = $event.detail.value),
    s: common_assets._imports_4$6,
    t: common_vendor.o((...args) => $options.handleImageInput && $options.handleImageInput(...args)),
    v: common_assets._imports_5$2,
    w: !$data.inputText.trim() ? 1 : "",
    x: common_vendor.o((...args) => $options.sendMessage && $options.sendMessage(...args)),
    y: $data.showVoiceModal
  }, $data.showVoiceModal ? {
    z: common_vendor.o((...args) => $options.cancelVoice && $options.cancelVoice(...args)),
    A: common_vendor.o(() => {
    }),
    B: common_vendor.o((...args) => $options.closeVoiceModal && $options.closeVoiceModal(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1f4f957e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/home/ai/chat.js.map
