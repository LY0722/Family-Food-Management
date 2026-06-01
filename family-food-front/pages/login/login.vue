<template>
  <view class="login-page">
    <view class="login-container">
      <!-- 顶部装饰 -->
      <view class="top-decoration">
        <view class="circle circle-1"></view>
        <view class="circle circle-2"></view>
      </view>

      <!-- Logo和标题 -->
      <view class="logo-section">
        <view class="logo-wrapper">
          <image src="/static/images/logo.png" class="logo" mode="aspectFit" />
        </view>
        <text class="app-name">食材管家</text>
        <text class="app-slogan">智能管理 · 健康生活</text>
      </view>

      <!-- 登录方式切换 -->
      <view class="tab-bar">
        <view 
          class="tab-item" 
          :class="{ active: loginType === 'wechat' }"
          @tap="switchLoginType('wechat')"
        >
          微信登录
        </view>
        <view 
          class="tab-item" 
          :class="{ active: loginType === 'account' }"
          @tap="switchLoginType('account')"
        >
          账号登录
        </view>
      </view>

      <!-- 微信登录 -->
      <view class="login-form" v-if="loginType === 'wechat'">
        <!-- 微信登录按钮（直接显示） -->
        <view class="wechat-login-area">
          <button 
            class="wechat-login-btn" 
            :loading="wechatLoading"
            @tap="handleWechatLogin"
          >
            <image src="/static/icons/wechat_white.png" class="btn-icon" />
            微信一键登录
          </button>
          
         <!-- 协议勾选 -->
          <view class="agreement-check">
            <view class="checkbox" :class="{ checked: agreed }" @tap="toggleAgreement">
              <text class="check-mark" v-if="agreed">✓</text>
            </view>
            <text class="agreement-text">
              我已阅读并同意
              <text class="link" @tap.stop="showAgreement('user')">《用户协议》</text>
              和
              <text class="link" @tap.stop="showAgreement('privacy')">《隐私政策》</text>
            </text>
          </view>
          
          <view class="login-tips">
            首次登录将自动注册账号
          </view>
        </view>
      </view>

      <!-- 账号密码登录 -->
      <view class="login-form" v-else>
        <view class="input-group">
          <view class="input-wrapper">
            <image src="/static/icons/phone.png" class="input-icon" />
            <input 
              type="number"
              v-model="loginForm.phone"
              placeholder="请输入手机号"
              placeholder-class="input-placeholder"
              maxlength="11"
            />
          </view>
          <view class="input-wrapper">
            <image src="/static/icons/lock.png" class="input-icon" />
            <input 
              type="password"
              v-model="loginForm.password"
              placeholder="请输入密码"
              placeholder-class="input-placeholder"
              :password="true"
            />
          </view>
        </view>

        <button 
          class="login-btn" 
          :loading="accountLoading"
          @tap="handleAccountLogin"
        >
          登录
        </button>

        <view class="form-footer">
          <text class="register-link" @tap="goToRegister">还没有账号？立即注册</text>
        </view>
      </view>

      <!-- 其他登录方式 -->
      <view class="other-login" v-if="loginType === 'account'">
        <view class="divider">
          <view class="line"></view>
          <text class="divider-text">其他登录方式</text>
          <view class="line"></view>
        </view>
        <view class="other-icons">
          <view class="other-icon" @tap="switchLoginType('wechat')">
            <image src="/static/icons/wechat.png" />
            <text>微信</text>
          </view>
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
import validator from '@/utils/validator'

export default {
  data() {
    return {
      loginType: 'wechat',
      agreed: false,
      wechatLoading: false,
      accountLoading: false,
      loginForm: {
        phone: '',
        password: ''
      },
      agreementModal: {
        show: false,
        title: '',
        content: ''
      }
    }
  },

  onLoad() {
    // 页面加载，不需要检查登录状态，由 App.vue 处理
  },

  methods: {
    toggleAgreement() {
      this.agreed = !this.agreed
    },
    ...mapMutations('user', ['SET_TOKEN', 'SET_USER_INFO', 'SET_CURRENT_FAMILY']),

    switchLoginType(type) {
      this.loginType = type
      if (type === 'wechat') {
        this.agreed = false
      }
    },

    async handleWechatLogin() {
      if (!this.agreed) {
        uni.showToast({
          title: '请先同意用户协议',
          icon: 'none'
        })
        return
      }

      this.wechatLoading = true

      try {
        // 1. 获取微信code
        const loginRes = await uni.login()
        const code = loginRes.code

        if (!code) {
          throw new Error('获取授权失败')
        }

        // 2. 调用后端登录接口
        const response = await this.$api.user.wechatLogin({ code: code })

        if (response.code === 200) {
          const { token, userInfo, familyInfo } = response.data

          console.log('登录响应数据:', response.data)
          console.log('家庭信息:', familyInfo)

          // 处理头像 URL
          if (userInfo.avatarUrl && !userInfo.avatarUrl.startsWith('http')) {
            userInfo.avatarUrl = `${this.$api.baseURL}${userInfo.avatarUrl}`
          }
          
          // 开发环境：如果头像 URL 是 HTTP 协议，使用默认头像（微信小程序不支持 HTTP）
          if (process.env.NODE_ENV === 'development' && userInfo.avatarUrl?.startsWith('http:')) {
            userInfo.avatarUrl = '/static/images/default-avatar.png'
          }

          // 3. 保存登录信息
          this.SET_TOKEN(token)
          this.SET_USER_INFO(userInfo)
          uni.setStorageSync('token', token)
          uni.setStorageSync('userInfo', userInfo)
          
          // 处理家庭信息
          if (familyInfo) {
            // 确保 familyInfo 有有效的 id
            if (familyInfo.id && typeof familyInfo.id === 'number' && familyInfo.id > 0) {
              this.SET_CURRENT_FAMILY(familyInfo)
              console.log('家庭信息已保存:', familyInfo)
            } else {
              console.warn('家庭信息无效:', familyInfo)
            }
          } else {
            console.log('未返回家庭信息，用户可能未加入家庭')
          }

          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })

          // 4. 跳转到首页
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/home/home'
            })
          }, 500)
        } else if (response.code === 401) {
          // 用户不存在，提示绑定/注册
          uni.showModal({
            title: '提示',
            content: response.message || '请先注册账号',
            confirmText: '去注册',
            success: (res) => {
              if (res.confirm) {
                uni.navigateTo({
                  url: '/pages/login/register?wechatCode=' + code
                })
              }
            }
          })
        } else {
          uni.showToast({
            title: response.message || '登录失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('微信登录失败:', error)
        uni.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        })
      } finally {
        this.wechatLoading = false
      }
    },

    async handleAccountLogin() {
      const { phone, password } = this.loginForm

      // 使用 validator 进行表单验证
      const validation = validator.validateLogin({ phone, password })
      
      if (!validation.isValid) {
        // 获取第一个错误信息并显示
        const firstError = Object.values(validation.errors)[0]
        uni.showToast({ title: firstError, icon: 'none' })
        return
      }

      this.accountLoading = true

  try {
    const response = await this.$api.user.login({
      phone,
      password
    })

    if (response.code === 200) {
        const { token, userInfo, familyInfo } = response.data

        console.log('登录响应数据:', response.data)
        console.log('家庭信息:', familyInfo)

        // 处理头像 URL
        if (userInfo.avatarUrl && !userInfo.avatarUrl.startsWith('http')) {
          userInfo.avatarUrl = `${this.$api.baseURL}${userInfo.avatarUrl}`
        }
        
        // 开发环境：如果头像 URL 是 HTTP 协议，使用默认头像（微信小程序不支持 HTTP）
        if (process.env.NODE_ENV === 'development' && userInfo.avatarUrl?.startsWith('http:')) {
          userInfo.avatarUrl = '/static/images/default-avatar.png'
        }

        this.SET_TOKEN(token)
        this.SET_USER_INFO(userInfo)
        uni.setStorageSync('token', token)
        uni.setStorageSync('userInfo', userInfo)
      
      // 处理家庭信息
      if (familyInfo) {
        // 确保 familyInfo 有有效的 id
        if (familyInfo.id && typeof familyInfo.id === 'number' && familyInfo.id > 0) {
          this.SET_CURRENT_FAMILY(familyInfo)
          console.log('家庭信息已保存:', familyInfo)
        } else {
          console.warn('家庭信息无效:', familyInfo)
        }
      } else {
        console.log('未返回家庭信息，用户可能未加入家庭')
      }

      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })

      setTimeout(() => {
        uni.switchTab({
          url: '/pages/home/home'
        })
      }, 500)
    } else {
      // 根据错误码显示不同的错误信息
      if (response.code === 404) {
        uni.showToast({
          title: '该用户未注册',
          icon: 'none'
        })
      } else if (response.code === 401) {
        uni.showToast({
          title: '密码错误',
          icon: 'none'
        })
      } else {
        uni.showToast({
          title: response.message || '登录失败',
          icon: 'none'
        })
      }
    }
  } catch (error) {
    console.error('账号登录失败:', error)
    uni.showToast({
      title: '登录失败，请重试',
      icon: 'none'
    })
  } finally {
    this.accountLoading = false
  }
},

    goToRegister() {
      uni.navigateTo({
        url: '/pages/login/register'
      })
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
    },

    async checkAndRedirect() {
      try {
        const response = await this.$api.user.getCurrentUser()
        if (response.code === 200) {
          uni.switchTab({ url: '/pages/home/home' })
        } else {
          uni.removeStorageSync('token')
          uni.removeStorageSync('userInfo')
        }
      } catch (error) {
        console.error('验证登录失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
  position: relative;
}

.login-container {
  min-height: 100vh;
  padding: 60rpx 48rpx 80rpx;
  position: relative;
  z-index: 2;
}

/* 顶部装饰 */
.top-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 400rpx;
  overflow: hidden;
  z-index: 0;
}
.agreement-check {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24rpx;
  margin-bottom: 16rpx;
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


.check-mark {
  font-size: 30rpx;
  font-weight: bold;
  color: #9e9b9b;
}

.agreement-text {
  font-size: 24rpx;
  color: #666;
}

.agreement-text .link {
  color: #07c160;
}
.agreement-text {
  font-size: 24rpx;
  color: #666;
}

.agreement-text .link {
  color: #07c160;
}
.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(76, 175, 80, 0.08);
}

.circle-1 {
  width: 300rpx;
  height: 300rpx;
  top: -100rpx;
  right: -80rpx;
}

.circle-2 {
  width: 500rpx;
  height: 500rpx;
  bottom: -200rpx;
  left: -150rpx;
}

/* Logo区域 */
.logo-section {
  text-align: center;
  margin-top: 80rpx;
  margin-bottom: 80rpx;
  position: relative;
  z-index: 1;
}

.logo-wrapper {
  width: 120rpx;
  height: 120rpx;
  margin: 0 auto 24rpx;
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16rpx 32rpx rgba(76, 175, 80, 0.2);
}

.logo {
  width: 72rpx;
  height: 72rpx;
}

.app-name {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12rpx;
}

.app-slogan {
  font-size: 26rpx;
  color: #8a8a8a;
}

/* 标签切换 */
.tab-bar {
  display: flex;
  background: #fff;
  border-radius: 60rpx;
  padding: 8rpx;
  margin-bottom: 48rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 30rpx;
  color: #666;
  border-radius: 52rpx;
  transition: all 0.3s ease;
}

.tab-item.active {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: #fff;
  font-weight: 500;
  box-shadow: 0 8rpx 16rpx rgba(76, 175, 80, 0.2);
}

/* 表单样式 */
.login-form {
  background: #fff;
  border-radius: 32rpx;
  padding: 40rpx 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.05);
}

.input-group {
  margin-bottom: 40rpx;
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

/* 登录按钮 */
.login-btn,
.wechat-login-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  border-radius: 48rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(76, 175, 80, 0.3);
}

.wechat-login-btn {
  background: #07c160;
  box-shadow: 0 8rpx 24rpx rgba(7, 193, 96, 0.3);
}

.btn-icon {
  width: 44rpx;
  height: 44rpx;
  margin-right: 16rpx;
}

.login-tips {
  text-align: center;
  font-size: 24rpx;
  color: #999;
  margin-top: 24rpx;
}

.form-footer {
  text-align: center;
  margin-top: 32rpx;
}

.register-link {
  font-size: 28rpx;
  color: #4caf50;
}

/* 协议区域 */
.agreement-section {
  min-height: 400rpx;
}

.agreement-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  text-align: center;
}

.agreement-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
}

.agreement-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 40rpx;
}

.agreement-content .link {
  color: #4caf50;
  text-decoration: underline;
}

.agree-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  border-radius: 44rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
}

/* 其他登录方式 */
.other-login {
  margin-top: 32rpx;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
}

.line {
  flex: 1;
  height: 1rpx;
  background: #e0e0e0;
}

.divider-text {
  padding: 0 24rpx;
  font-size: 24rpx;
  color: #999;
}

.other-icons {
  display: flex;
  justify-content: center;
}

.other-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 32rpx;
}

.other-icon image {
  width: 56rpx;
  height: 56rpx;
  margin-bottom: 8rpx;
}

.other-icon text {
  font-size: 24rpx;
  color: #999;
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