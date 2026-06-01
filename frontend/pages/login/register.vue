<template>
  <view class="register-page">
    <view class="register-container">
      <!-- 返回按钮 -->
      <view class="back-btn" @tap="goBack">
        <image src="/static/icons/arrow-left.png" class="back-icon" />
      </view>

      <!-- 标题 -->
      <view class="header-section">
        <text class="title">注册账号</text>
        <text class="subtitle">欢迎加入食材管家</text>
      </view>

      <!-- 注册表单 -->
      <view class="register-form">
        <view class="input-group">
          <view class="input-wrapper">
            <image src="/static/icons/phone.png" class="input-icon" />
            <input 
              type="number"
              v-model="registerForm.phone"
              placeholder="请输入手机号"
              placeholder-class="input-placeholder"
              maxlength="11"
            />
          </view>

          <view class="input-wrapper code-wrapper">
            <image src="/static/icons/code.png" class="input-icon" />
            <input 
              type="number"
              v-model="registerForm.verifyCode"
              placeholder="请输入验证码"
              placeholder-class="input-placeholder"
              maxlength="6"
            />
            <button 
              class="get-code-btn" 
              :disabled="codeCountdown > 0"
              :class="{ disabled: codeCountdown > 0 }"
              @tap="sendVerifyCode"
            >
              {{ codeCountdown > 0 ? `${codeCountdown}秒后重试` : '获取验证码' }}
            </button>
          </view>

          <view class="input-wrapper">
            <image src="/static/icons/lock.png" class="input-icon" />
            <input 
              type="password"
              v-model="registerForm.password"
              placeholder="请设置密码（6-20位）"
              placeholder-class="input-placeholder"
              :password="true"
            />
          </view>

          <view class="input-wrapper">
            <image src="/static/icons/lock.png" class="input-icon" />
            <input 
              type="password"
              v-model="registerForm.confirmPassword"
              placeholder="请确认密码"
              placeholder-class="input-placeholder"
              :password="true"
            />
          </view>
        </view>

        <!-- 协议勾选 -->
        <view class="agreement-check">
          <view class="checkbox" :class="{ checked: agreed }" @tap="toggleAgreement">
            <image v-if="agreed" src="/static/icons/check.png" class="check-icon" />
          </view>
          <text class="agreement-text">
            我已阅读并同意
            <text class="link" @tap.stop="showAgreement('user')">《用户协议》</text>
            和
            <text class="link" @tap.stop="showAgreement('privacy')">《隐私政策》</text>
          </text>
        </view>

        <button 
          class="register-btn" 
          :loading="registerLoading"
          @tap="handleRegister"
        >
          注册
        </button>

        <view class="login-link">
          已有账号？
          <text class="link" @tap="goToLogin">立即登录</text>
        </view>
      </view>
    </view>

    <!-- 协议弹窗 -->
    <view class="modal-mask" v-if="agreementModal.show" @tap="closeAgreement">
      <view class="modal-container" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">{{ agreementModal.title }}</text>
          <image src="/static/icons/close.png" class="close-icon" @tap="closeAgreement" />
        </view>
        <scroll-view class="modal-content" scroll-y>
          <text class="agreement-text">{{ agreementModal.content }}</text>
        </scroll-view>
        <button class="modal-confirm" @tap="closeAgreement">我已阅读</button>
      </view>
    </view>
  </view>
</template>

<script>
import { mapMutations } from 'vuex'
import validator, { validatePhone, validatePassword } from '@/utils/validator'

export default {
  data() {
    return {
      registerLoading: false,
      agreed: false,
      codeCountdown: 0,
      registerForm: {
        phone: '',
        verifyCode: '',
        password: '',
        confirmPassword: ''
      },
      wechatCode: null, // 微信登录code（用于绑定）
      agreementModal: {
        show: false,
        title: '',
        content: ''
      }
    }
  },

  onLoad(options) {
    if (options.wechatCode) {
      this.wechatCode = options.wechatCode
    }
  },

  methods: {
    ...mapMutations('user', ['SET_TOKEN', 'SET_USER_INFO']),

    goBack() {
      uni.navigateBack()
    },

    goToLogin() {
      uni.navigateBack()
    },

    toggleAgreement() {
      this.agreed = !this.agreed
    },

    async sendVerifyCode() {
      const { phone } = this.registerForm

      // 使用 validator 进行验证
      const validation = validator.validateSendCode({ phone })
      
      if (!validation.isValid) {
        uni.showToast({ title: validation.errors.phone, icon: 'none' })
        return
      }

      try {
        const response = await this.$api.user.sendCode({ phone })
        
        if (response.code === 200) {
          uni.showToast({ title: '验证码已发送', icon: 'success' })
          
          // 倒计时
          this.codeCountdown = 60
          const timer = setInterval(() => {
            this.codeCountdown--
            if (this.codeCountdown <= 0) {
              clearInterval(timer)
            }
          }, 1000)
        } else {
          uni.showToast({ title: response.message || '发送失败', icon: 'none' })
        }
      } catch (error) {
        console.error('发送验证码失败:', error)
        uni.showToast({ title: '发送失败，请重试', icon: 'none' })
      }
    },

    async handleRegister() {
      const { phone, verifyCode, password, confirmPassword, agreed } = this.registerForm

      // 使用 validator 进行表单验证
      const validation = validator.validateRegister({
        phone,
        verifyCode,
        password,
        confirmPassword,
        agreed:this.agreed
      })
      
      if (!validation.isValid) {
        // 获取第一个错误信息并显示
        const firstError = Object.values(validation.errors)[0]
        uni.showToast({ title: firstError, icon: 'none' })
        return
      }

      this.registerLoading = true

      try {
        // 构建注册请求
        const registerData = {
          phone,
          verifyCode,
          password
        }

        // 如果有微信code，则绑定微信
        if (this.wechatCode) {
          registerData.wechatCode = this.wechatCode
        }

        const response = await this.$api.user.register(registerData)

        if (response.code === 200) {
          const { token, userInfo, familyInfo } = response.data

          // 保存登录信息
          this.SET_TOKEN(token)
          this.SET_USER_INFO(userInfo)
          uni.setStorageSync('token', token)
          uni.setStorageSync('userInfo', userInfo)
          if (familyInfo) {
            uni.setStorageSync('currentFamily', familyInfo)
          }

          uni.showToast({
            title: '注册成功',
        icon: 'success'
      })

      // 跳转到首页
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/home/home'
        })
      }, 500)
    } else {
      uni.showToast({
        title: response.message || '注册失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('注册失败:', error)
    uni.showToast({
      title: '注册失败，请重试',
      icon: 'none'
    })
  } finally {
    this.registerLoading = false
  }
},

    showAgreement(type) {
      const agreements = {
        user: {
          title: '用户协议',
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
          title: '隐私政策',
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
      }

      const agreement = agreements[type]
      this.agreementModal = {
        show: true,
        title: agreement.title,
        content: agreement.content
      }
    },

    closeAgreement() {
      this.agreementModal.show = false
    }
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
}

.register-container {
  min-height: 100vh;
  padding: 80rpx 48rpx 60rpx;
}

/* 返回按钮 */
.back-btn {
  width: 72rpx;
  height: 72rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.back-icon {
  width: 36rpx;
  height: 36rpx;
}

/* 标题区域 */
.header-section {
  margin-bottom: 60rpx;
}

.title {
  display: block;
  font-size: 56rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #8a8a8a;
}

/* 表单样式 */
.register-form {
  background: #fff;
  border-radius: 32rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.05);
}

.input-group {
  margin-bottom: 32rpx;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 24rpx;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  background: #fff;
  box-shadow: 0 0 0 2rpx rgba(76, 175, 80, 0.2);
}

.code-wrapper {
  padding-right: 12rpx;
}

.input-icon {
  width: 36rpx;
  height: 36rpx;
  margin-right: 20rpx;
}

.input-wrapper input {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.input-placeholder {
  color: #bbb;
  font-size: 28rpx;
}

.get-code-btn {
  background: #f0f0f0;
  border-radius: 40rpx;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  color: #4caf50;
  border: none;
  min-width: 160rpx;
}

.get-code-btn.disabled {
  color: #999;
  background: #f5f5f5;
}

/* 协议勾选 */
.agreement-check {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}
.checkbox {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  margin-right: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #ddd;
  background-color: #fff;
  transition: all 0.2s ease;
}
.checkbox.checked {
  background-color: #4caf50;
  border-color: #4caf50;
}
.check-icon {
  width: 28rpx;
  height: 28rpx;
}

.agreement-text {
  font-size: 26rpx;
  color: #666;
}

.agreement-text .link,
.login-link .link {
  color: #4caf50;
}

/* 注册按钮 */
.register-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  border-radius: 48rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
  margin-bottom: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(76, 175, 80, 0.3);
}

.login-link {
  text-align: center;
  font-size: 28rpx;
  color: #666;
}

/* 弹窗样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  width: 600rpx;
  max-height: 80vh;
  background: #fff;
  border-radius: 32rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.close-icon {
  width: 40rpx;
  height: 40rpx;
}

.modal-content {
  padding: 32rpx;
  max-height: 500rpx;
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.agreement-text {
  white-space: pre-line;
}

.modal-confirm {
  margin: 24rpx 32rpx 32rpx;
  height: 80rpx;
  background: #4caf50;
  border-radius: 40rpx;
  color: #fff;
  font-size: 30rpx;
  border: none;
}
</style>