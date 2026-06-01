"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_validator = require("../../utils/validator.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      registerLoading: false,
      agreed: false,
      codeCountdown: 0,
      registerForm: {
        phone: "",
        verifyCode: "",
        password: "",
        confirmPassword: ""
      },
      wechatCode: null,
      // 微信登录code（用于绑定）
      agreementModal: {
        show: false,
        title: "",
        content: ""
      }
    };
  },
  onLoad(options) {
    if (options.wechatCode) {
      this.wechatCode = options.wechatCode;
    }
  },
  methods: {
    ...common_vendor.mapMutations("user", ["SET_TOKEN", "SET_USER_INFO"]),
    goBack() {
      common_vendor.index.navigateBack();
    },
    goToLogin() {
      common_vendor.index.navigateBack();
    },
    toggleAgreement() {
      this.agreed = !this.agreed;
    },
    async sendVerifyCode() {
      const { phone } = this.registerForm;
      const validation = utils_validator.validator.validateSendCode({ phone });
      if (!validation.isValid) {
        common_vendor.index.showToast({ title: validation.errors.phone, icon: "none" });
        return;
      }
      try {
        const response = await this.$api.user.sendCode({ phone });
        if (response.code === 200) {
          common_vendor.index.showToast({ title: "验证码已发送", icon: "success" });
          this.codeCountdown = 60;
          const timer = setInterval(() => {
            this.codeCountdown--;
            if (this.codeCountdown <= 0) {
              clearInterval(timer);
            }
          }, 1e3);
        } else {
          common_vendor.index.showToast({ title: response.message || "发送失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/register.vue:190", "发送验证码失败:", error);
        common_vendor.index.showToast({ title: "发送失败，请重试", icon: "none" });
      }
    },
    async handleRegister() {
      const { phone, verifyCode, password, confirmPassword, agreed } = this.registerForm;
      const validation = utils_validator.validator.validateRegister({
        phone,
        verifyCode,
        password,
        confirmPassword,
        agreed: this.agreed
      });
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        common_vendor.index.showToast({ title: firstError, icon: "none" });
        return;
      }
      this.registerLoading = true;
      try {
        const registerData = {
          phone,
          verifyCode,
          password
        };
        if (this.wechatCode) {
          registerData.wechatCode = this.wechatCode;
        }
        const response = await this.$api.user.register(registerData);
        if (response.code === 200) {
          const { token, userInfo, familyInfo } = response.data;
          this.SET_TOKEN(token);
          this.SET_USER_INFO(userInfo);
          common_vendor.index.setStorageSync("token", token);
          common_vendor.index.setStorageSync("userInfo", userInfo);
          if (familyInfo) {
            common_vendor.index.setStorageSync("currentFamily", familyInfo);
          }
          common_vendor.index.showToast({
            title: "注册成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.switchTab({
              url: "/pages/home/home"
            });
          }, 500);
        } else {
          common_vendor.index.showToast({
            title: response.message || "注册失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/register.vue:261", "注册失败:", error);
        common_vendor.index.showToast({
          title: "注册失败，请重试",
          icon: "none"
        });
      } finally {
        this.registerLoading = false;
      }
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
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$1,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_assets._imports_1$2,
    d: $data.registerForm.phone,
    e: common_vendor.o(($event) => $data.registerForm.phone = $event.detail.value),
    f: common_assets._imports_2,
    g: $data.registerForm.verifyCode,
    h: common_vendor.o(($event) => $data.registerForm.verifyCode = $event.detail.value),
    i: common_vendor.t($data.codeCountdown > 0 ? `${$data.codeCountdown}秒后重试` : "获取验证码"),
    j: $data.codeCountdown > 0,
    k: $data.codeCountdown > 0 ? 1 : "",
    l: common_vendor.o((...args) => $options.sendVerifyCode && $options.sendVerifyCode(...args)),
    m: common_assets._imports_3,
    n: $data.registerForm.password,
    o: common_vendor.o(($event) => $data.registerForm.password = $event.detail.value),
    p: common_assets._imports_3,
    q: $data.registerForm.confirmPassword,
    r: common_vendor.o(($event) => $data.registerForm.confirmPassword = $event.detail.value),
    s: $data.agreed
  }, $data.agreed ? {
    t: common_assets._imports_4$1
  } : {}, {
    v: $data.agreed ? 1 : "",
    w: common_vendor.o((...args) => $options.toggleAgreement && $options.toggleAgreement(...args)),
    x: common_vendor.o(($event) => $options.showAgreement("user")),
    y: common_vendor.o(($event) => $options.showAgreement("privacy")),
    z: $data.registerLoading,
    A: common_vendor.o((...args) => $options.handleRegister && $options.handleRegister(...args)),
    B: common_vendor.o((...args) => $options.goToLogin && $options.goToLogin(...args)),
    C: $data.agreementModal.show
  }, $data.agreementModal.show ? {
    D: common_vendor.t($data.agreementModal.title),
    E: common_assets._imports_1,
    F: common_vendor.o((...args) => $options.closeAgreement && $options.closeAgreement(...args)),
    G: common_vendor.t($data.agreementModal.content),
    H: common_vendor.o((...args) => $options.closeAgreement && $options.closeAgreement(...args)),
    I: common_vendor.o(() => {
    }),
    J: common_vendor.o((...args) => $options.closeAgreement && $options.closeAgreement(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-838b72c9"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/register.js.map
