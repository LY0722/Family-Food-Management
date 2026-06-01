"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_validator = require("../../utils/validator.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      loginType: "wechat",
      agreed: false,
      wechatLoading: false,
      accountLoading: false,
      loginForm: {
        phone: "",
        password: ""
      },
      agreementModal: {
        show: false,
        title: "",
        content: ""
      }
    };
  },
  onLoad() {
  },
  methods: {
    toggleAgreement() {
      this.agreed = !this.agreed;
    },
    ...common_vendor.mapMutations("user", ["SET_TOKEN", "SET_USER_INFO", "SET_CURRENT_FAMILY"]),
    switchLoginType(type) {
      this.loginType = type;
      if (type === "wechat") {
        this.agreed = false;
      }
    },
    async handleWechatLogin() {
      var _a;
      if (!this.agreed) {
        common_vendor.index.showToast({
          title: "请先同意用户协议",
          icon: "none"
        });
        return;
      }
      this.wechatLoading = true;
      try {
        const loginRes = await common_vendor.index.login();
        const code = loginRes.code;
        if (!code) {
          throw new Error("获取授权失败");
        }
        const response = await this.$api.user.wechatLogin({ code });
        if (response.code === 200) {
          const { token, userInfo, familyInfo } = response.data;
          common_vendor.index.__f__("log", "at pages/login/login.vue:205", "登录响应数据:", response.data);
          common_vendor.index.__f__("log", "at pages/login/login.vue:206", "家庭信息:", familyInfo);
          if (userInfo.avatarUrl && !userInfo.avatarUrl.startsWith("http")) {
            userInfo.avatarUrl = `${this.$api.baseURL}${userInfo.avatarUrl}`;
          }
          if ((_a = userInfo.avatarUrl) == null ? void 0 : _a.startsWith("http:")) {
            userInfo.avatarUrl = "/static/images/default-avatar.png";
          }
          this.SET_TOKEN(token);
          this.SET_USER_INFO(userInfo);
          common_vendor.index.setStorageSync("token", token);
          common_vendor.index.setStorageSync("userInfo", userInfo);
          if (familyInfo) {
            if (familyInfo.id && typeof familyInfo.id === "number" && familyInfo.id > 0) {
              this.SET_CURRENT_FAMILY(familyInfo);
              common_vendor.index.__f__("log", "at pages/login/login.vue:229", "家庭信息已保存:", familyInfo);
            } else {
              common_vendor.index.__f__("warn", "at pages/login/login.vue:231", "家庭信息无效:", familyInfo);
            }
          } else {
            common_vendor.index.__f__("log", "at pages/login/login.vue:234", "未返回家庭信息，用户可能未加入家庭");
          }
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.switchTab({
              url: "/pages/home/home"
            });
          }, 500);
        } else if (response.code === 401) {
          common_vendor.index.showModal({
            title: "提示",
            content: response.message || "请先注册账号",
            confirmText: "去注册",
            success: (res) => {
              if (res.confirm) {
                common_vendor.index.navigateTo({
                  url: "/pages/login/register?wechatCode=" + code
                });
              }
            }
          });
        } else {
          common_vendor.index.showToast({
            title: response.message || "登录失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:269", "微信登录失败:", error);
        common_vendor.index.showToast({
          title: "登录失败，请重试",
          icon: "none"
        });
      } finally {
        this.wechatLoading = false;
      }
    },
    async handleAccountLogin() {
      var _a;
      const { phone, password } = this.loginForm;
      const validation = utils_validator.validator.validateLogin({ phone, password });
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        common_vendor.index.showToast({ title: firstError, icon: "none" });
        return;
      }
      this.accountLoading = true;
      try {
        const response = await this.$api.user.login({
          phone,
          password
        });
        if (response.code === 200) {
          const { token, userInfo, familyInfo } = response.data;
          common_vendor.index.__f__("log", "at pages/login/login.vue:303", "登录响应数据:", response.data);
          common_vendor.index.__f__("log", "at pages/login/login.vue:304", "家庭信息:", familyInfo);
          if (userInfo.avatarUrl && !userInfo.avatarUrl.startsWith("http")) {
            userInfo.avatarUrl = `${this.$api.baseURL}${userInfo.avatarUrl}`;
          }
          if ((_a = userInfo.avatarUrl) == null ? void 0 : _a.startsWith("http:")) {
            userInfo.avatarUrl = "/static/images/default-avatar.png";
          }
          this.SET_TOKEN(token);
          this.SET_USER_INFO(userInfo);
          common_vendor.index.setStorageSync("token", token);
          common_vendor.index.setStorageSync("userInfo", userInfo);
          if (familyInfo) {
            if (familyInfo.id && typeof familyInfo.id === "number" && familyInfo.id > 0) {
              this.SET_CURRENT_FAMILY(familyInfo);
              common_vendor.index.__f__("log", "at pages/login/login.vue:326", "家庭信息已保存:", familyInfo);
            } else {
              common_vendor.index.__f__("warn", "at pages/login/login.vue:328", "家庭信息无效:", familyInfo);
            }
          } else {
            common_vendor.index.__f__("log", "at pages/login/login.vue:331", "未返回家庭信息，用户可能未加入家庭");
          }
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.switchTab({
              url: "/pages/home/home"
            });
          }, 500);
        } else {
          if (response.code === 404) {
            common_vendor.index.showToast({
              title: "该用户未注册",
              icon: "none"
            });
          } else if (response.code === 401) {
            common_vendor.index.showToast({
              title: "密码错误",
              icon: "none"
            });
          } else {
            common_vendor.index.showToast({
              title: response.message || "登录失败",
              icon: "none"
            });
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:364", "账号登录失败:", error);
        common_vendor.index.showToast({
          title: "登录失败，请重试",
          icon: "none"
        });
      } finally {
        this.accountLoading = false;
      }
    },
    goToRegister() {
      common_vendor.index.navigateTo({
        url: "/pages/login/register"
      });
    },
    showAgreement(type) {
      const agreements = {
        user: {
          title: "用户协议",
          content: `感谢您使用食材管家！

一、服务条款的确认和接纳
本应用的各项电子服务的所有权和运作权归食材管家所有。用户同意所有注册协议条款并完成注册程序，才能成为本应用的正式用户。

二、用户信息
用户应提供真实、准确、完整的个人资料，并及时更新。本应用对用户信息采取严格的保密措施。

三、用户义务
用户在使用本应用服务时，必须遵守中华人民共和国相关法律法规，不得利用本应用进行任何违法或不正当的活动。

四、账号安全
用户应对自己的账号和密码安全负责，不得将账号转让或出借给他人使用。

五、服务变更
本应用保留随时修改或中断服务而不需通知用户的权利。

六、隐私保护
尊重用户个人隐私是本应用的一项基本政策，本应用将采取技术措施保护用户信息。

七、免责声明
因不可抗力、系统维护等原因导致的服务中断，本应用不承担责任。

八、法律适用
本协议的订立、执行和解释及争议的解决均应适用中华人民共和国法律。`
        },
        privacy: {
          title: "隐私政策",
          content: `食材管家非常重视您的隐私保护！

一、信息收集范围
1. 基本信息：手机号码、微信OpenID
2. 使用信息：食材库存、消耗记录、膳食偏好
3. 设备信息：设备型号、操作系统版本

二、信息使用方式
1. 提供核心服务：库存管理、AI推荐、预警通知
2. 优化用户体验：分析使用习惯改进功能
3. 安全保障：身份验证、防止恶意攻击

三、信息共享
我们不会与第三方共享您的个人信息，以下情况除外：
1. 获得您的明确同意
2. 法律法规要求披露
3. 保护我们的合法权益

四、数据安全
我们采用行业标准的安全措施保护您的数据，包括数据加密、访问控制等。

五、用户权利
您有权访问、更正、删除您的个人信息，也可以通过设置关闭相关权限。

六、Cookie使用
我们使用Cookie来提供更好的用户体验。

七、未成年人保护
未满18周岁的用户应在监护人指导下使用本服务。

八、政策更新
本隐私政策可能会适时更新，我们会通过公告等方式通知您。

如有疑问，请联系：support@food-manager.com`
        }
      };
      const agreement = agreements[type];
      this.agreementModal = {
        show: true,
        title: agreement.title,
        content: agreement.content
      };
    },
    closeAgreement() {
      this.agreementModal.show = false;
    },
    async checkAndRedirect() {
      try {
        const response = await this.$api.user.getCurrentUser();
        if (response.code === 200) {
          common_vendor.index.switchTab({ url: "/pages/home/home" });
        } else {
          common_vendor.index.removeStorageSync("token");
          common_vendor.index.removeStorageSync("userInfo");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:471", "验证登录失败:", error);
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0,
    b: $data.loginType === "wechat" ? 1 : "",
    c: common_vendor.o(($event) => $options.switchLoginType("wechat")),
    d: $data.loginType === "account" ? 1 : "",
    e: common_vendor.o(($event) => $options.switchLoginType("account")),
    f: $data.loginType === "wechat"
  }, $data.loginType === "wechat" ? common_vendor.e({
    g: common_assets._imports_1$1,
    h: $data.wechatLoading,
    i: common_vendor.o((...args) => $options.handleWechatLogin && $options.handleWechatLogin(...args)),
    j: $data.agreed
  }, $data.agreed ? {} : {}, {
    k: $data.agreed ? 1 : "",
    l: common_vendor.o((...args) => $options.toggleAgreement && $options.toggleAgreement(...args)),
    m: common_vendor.o(($event) => $options.showAgreement("user")),
    n: common_vendor.o(($event) => $options.showAgreement("privacy"))
  }) : {
    o: common_assets._imports_1$2,
    p: $data.loginForm.phone,
    q: common_vendor.o(($event) => $data.loginForm.phone = $event.detail.value),
    r: common_assets._imports_3,
    s: $data.loginForm.password,
    t: common_vendor.o(($event) => $data.loginForm.password = $event.detail.value),
    v: $data.accountLoading,
    w: common_vendor.o((...args) => $options.handleAccountLogin && $options.handleAccountLogin(...args)),
    x: common_vendor.o((...args) => $options.goToRegister && $options.goToRegister(...args))
  }, {
    y: $data.loginType === "account"
  }, $data.loginType === "account" ? {
    z: common_assets._imports_4,
    A: common_vendor.o(($event) => $options.switchLoginType("wechat"))
  } : {}, {
    B: $data.agreementModal.show
  }, $data.agreementModal.show ? {
    C: common_vendor.t($data.agreementModal.title),
    D: common_assets._imports_1,
    E: common_vendor.o((...args) => $options.closeAgreement && $options.closeAgreement(...args)),
    F: common_vendor.t($data.agreementModal.content),
    G: common_vendor.o((...args) => $options.closeAgreement && $options.closeAgreement(...args)),
    H: common_vendor.o(() => {
    }),
    I: common_vendor.o((...args) => $options.closeAgreement && $options.closeAgreement(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
