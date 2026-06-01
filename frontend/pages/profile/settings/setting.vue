<!-- 
 * 文件路径：/pages/profile/settings/index.vue
 * 文件说明：设置主页
-->
<template>
  <view class="settings-page">
    <view class="header">
      <view class="header-left" @tap="goBack">
        <image src="/static/icons/arrow-left.png" class="back-icon"/>
      </view>
      <view class="header-center">
        <text class="header-title">系统设置</text>
      </view>
      <view class="header-right"></view>
    </view>
    
    <scroll-view 
      class="page-scroll"
      scroll-y 
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 设置头部 -->
      <view class="settings-header card">
        <view class="header-content">
          <image src="/static/icons/settings.png" class="settings-icon" />
          <view class="header-info">
            <text class="header-title">系统设置</text>
            <text class="header-desc">个性化您的使用体验</text>
          </view>
        </view>
      </view>

      <!-- 通知设置 -->
      <view class="settings-section card">
        <view class="section-title">通知设置</view>
        <view class="setting-item">
          <view class="item-info">
            <text class="item-name">推送通知</text>
            <text class="item-desc">接收过期预警和补货提醒</text>
          </view>
          <switch 
            :checked="notificationEnabled" 
            @change="toggleNotification"
            color="#07c160"
          />
        </view>
        
        <view class="setting-item">
          <view class="item-info">
            <text class="item-name">声音提醒</text>
            <text class="item-desc">重要通知时播放声音</text>
          </view>
          <switch 
            :checked="soundEnabled" 
            @change="toggleSound"
            color="#07c160"
          />
        </view>
        
        <view class="setting-item">
          <view class="item-info">
            <text class="item-name">振动提醒</text>
            <text class="item-desc">重要通知时振动提醒</text>
          </view>
          <switch 
            :checked="vibrationEnabled" 
            @change="toggleVibration"
            color="#07c160"
          />
        </view>
      </view>

      <!-- 隐私与安全 -->
      <view class="settings-section card">
        <view class="section-title">隐私与安全</view>
        <view class="setting-item" @tap="goToPrivacySettings">
          <view class="item-info">
            <text class="item-name">隐私设置</text>
            <text class="item-desc">管理您的隐私权限</text>
          </view>
          <image src="/static/icons/arrow.png" class="item-arrow" />
        </view>
        
        <view class="setting-item" @tap="goToDataExport">
          <view class="item-info">
            <text class="item-name">数据导出</text>
            <text class="item-desc">导出您的消费数据</text>
          </view>
          <image src="/static/icons/arrow.png" class="item-arrow" />
        </view>
        
        <view class="setting-item" @tap="clearCache">
          <view class="item-info">
            <text class="item-name">清除缓存</text>
            <text class="item-desc">当前缓存: {{ cacheSize }}</text>
          </view>
          <text class="clear-text">清除</text>
        </view>
      </view>

      <!-- 帮助与支持 -->
      <view class="settings-section card">
        <view class="section-title">帮助与支持</view>
        <view class="setting-item" @tap="goToHelpCenter">
          <view class="item-info">
            <text class="item-name">帮助中心</text>
            <text class="item-desc">常见问题和使用指南</text>
          </view>
          <image src="/static/icons/arrow.png" class="item-arrow" />
        </view>
        
        <view class="setting-item" @tap="contactSupport">
          <view class="item-info">
            <text class="item-name">联系客服</text>
            <text class="item-desc">遇到问题？联系我们</text>
          </view>
          <image src="/static/icons/arrow.png" class="item-arrow" />
        </view>
        
        <view class="setting-item" @tap="aboutApp">
          <view class="item-info">
            <text class="item-name">关于应用</text>
            <text class="item-desc">版本信息和功能介绍</text>
          </view>
          <image src="/static/icons/arrow.png" class="item-arrow" />
        </view>
      </view>

      <!-- 反馈与建议 -->
      <view class="settings-section card">
        <view class="section-title">反馈与建议</view>
        <view class="setting-item" @tap="submitFeedback">
          <view class="item-info">
            <text class="item-name">意见反馈</text>
            <text class="item-desc">告诉我们您的想法</text>
          </view>
          <image src="/static/icons/arrow.png" class="item-arrow" />
        </view>
        
        <view class="setting-item" @tap="rateApp">
          <view class="item-info">
            <text class="item-name">评价应用</text>
            <text class="item-desc">给应用打分</text>
          </view>
          <image src="/static/icons/arrow.png" class="item-arrow" />
        </view>
      </view>

      <!-- 账户操作 -->
      <view class="account-section card">
        <view class="section-title">账户操作</view>
        <button class="btn-logout" @tap="handleLogout">
          <image src="/static/icons/logout.png" class="logout-icon" />
          <text>退出登录</text>
        </button>
        
        <button class="btn-delete" @tap="showDeleteConfirm">
          <image src="/static/icons/delete.png" class="delete-icon" />
          <text>删除账户</text>
        </button>
      </view>

      <!-- 版本信息 -->
      <view class="version-info">
        <text>家庭食材管家 v1.0.0</text>
        <text class="build-info">Build 2024.01.01</text>
      </view>

      <view class="bottom-placeholder"></view>
    </scroll-view>

    <loading v-if="loading" text="加载中..." />
    <toast ref="toast" />
  </view>
</template>

<script>
import Loading from '@/components/common/Loading.vue'
import Toast from '@/components/common/Toast.vue'
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'SettingsIndex',
  
  components: {
    Loading,
    Toast
  },
  
  data() {
    return {
      loading: false,
      refreshing: false,
      notificationEnabled: true,
      soundEnabled: true,
      vibrationEnabled: false,
      cacheSize: '12.5MB'
    }
  },
  
  computed: {
    ...mapState('user', ['userInfo'])
  },
  
  onShow() {
    this.loadSettings()
  },
  
  methods: {
    ...mapMutations('user', ['SET_USER_INFO']),
    
    async loadSettings() {
      this.loading = true
      try {
        // 从本地存储加载设置
        const settings = uni.getStorageSync('app_settings') || {}
        this.notificationEnabled = settings.notificationEnabled !== false
        this.soundEnabled = settings.soundEnabled !== false
        this.vibrationEnabled = settings.vibrationEnabled || false
        
        // 计算缓存大小
        await this.calculateCacheSize()
      } catch (error) {
        console.error('加载设置失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    async onRefresh() {
      this.refreshing = true
      await this.loadSettings()
      this.refreshing = false
    },
    
    async calculateCacheSize() {
      // 模拟计算缓存大小
      this.cacheSize = '12.5MB'
    },
    
    toggleNotification(e) {
      this.notificationEnabled = e.detail.value
      this.saveSettings()
      this.$refs.toast.show(this.notificationEnabled ? '通知已开启' : '通知已关闭')
    },
    
    toggleSound(e) {
      this.soundEnabled = e.detail.value
      this.saveSettings()
      this.$refs.toast.show(this.soundEnabled ? '声音已开启' : '声音已关闭')
    },
    
    toggleVibration(e) {
      this.vibrationEnabled = e.detail.value
      this.saveSettings()
      this.$refs.toast.show(this.vibrationEnabled ? '振动已开启' : '振动已关闭')
    },
    
    saveSettings() {
      const settings = {
        notificationEnabled: this.notificationEnabled,
        soundEnabled: this.soundEnabled,
        vibrationEnabled: this.vibrationEnabled
      }
      uni.setStorageSync('app_settings', settings)
    },
    
    goToPrivacySettings() {
      uni.navigateTo({
        url: '/pages/profile/settings/privacy'
      })
    },
    
    goToDataExport() {
      uni.navigateTo({
        url: '/pages/profile/settings/export'
      })
    },
    
    goToHelpCenter() {
      uni.navigateTo({
        url: '/pages/profile/settings/help'
      })
    },
    
    contactSupport() {
      uni.makePhoneCall({
        phoneNumber: '400-123-4567'
      })
    },
    
    aboutApp() {
      uni.navigateTo({
        url: '/pages/profile/settings/about'
      })
    },
    
    submitFeedback() {
      uni.navigateTo({
        url: '/pages/profile/settings/feedback'
      })
    },
    
    rateApp() {
      // 跳转到应用商店评分
      this.$refs.toast.show('感谢您的评价！')
    },
    
    clearCache() {
      uni.showModal({
        title: '清除缓存',
        content: '确定要清除所有缓存数据吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除缓存逻辑
            this.cacheSize = '0MB'
            this.$refs.toast.show('缓存已清除')
          }
        }
      })
    },
    
    goBack() {
      uni.navigateBack()
    },
    
    handleLogout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        success: async (res) => {
          if (res.confirm) {
            this.loading = true
            try {
              // 调用退出接口
              await this.$api.user.logout()
              
              // 清除本地存储
              uni.removeStorageSync('token')
              uni.removeStorageSync('userInfo')
              
              // 重置用户状态
              this.SET_USER_INFO(null)
              
              this.$refs.toast.show('退出成功')
              
              // 返回首页
              setTimeout(() => {
                uni.reLaunch({
                  url: '/pages/index/index'
                })
              }, 1500)
              
            } catch (error) {
              console.error('退出失败:', error)
              this.$refs.toast.show('退出失败')
            } finally {
              this.loading = false
            }
          }
        }
      })
    },
    
    showDeleteConfirm() {
      uni.showModal({
        title: '删除账户',
        content: '此操作将永久删除您的账户和所有数据，确定要继续吗？',
        confirmColor: '#ff6b6b',
        success: (res) => {
          if (res.confirm) {
            this.$refs.toast.show('账户删除功能开发中')
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.settings-page {
  width: 100vw;
  height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  padding-top: calc(var(--status-bar-height) + 50rpx);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2rpx 20rpx rgba(0, 0, 0, 0.06);
  z-index: 100;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
}

.header-left,
.header-right {
  padding: 12rpx;
  flex-shrink: 0;
  width: 80rpx;
  display: flex;
  align-items: center;
}

.back-icon {
  width: 40rpx;
  height: 40rpx;
}

.header-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.page-scroll {
  flex: 1;
  height: 0;
}

.card {
  background: white;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.08);
}

.settings-header {
  margin-top: 20rpx;
}

.header-content {
  display: flex;
  align-items: center;
}

.settings-icon {
  width: 80rpx;
  height: 80rpx;
  margin-right: 20rpx;
}

.header-info {
  flex: 1;
}

.header-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.header-desc {
  font-size: 24rpx;
  color: #666;
}

.settings-section {
  margin-top: 0;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.setting-item {
  display: flex;
  align-items: center;
  padding: 25rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 5rpx;
}

.item-desc {
  font-size: 24rpx;
  color: #666;
}

.item-arrow {
  width: 24rpx;
  height: 24rpx;
}

.clear-text {
  color: #ff6b6b;
  font-size: 28rpx;
}

.account-section {
  margin-top: 0;
}

.btn-logout, .btn-delete {
  width: 100%;
  background: #07c160;
  color: white;
  border: none;
  border-radius: 12rpx;
  padding: 25rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15rpx;
  margin-bottom: 20rpx;
}

.btn-delete {
  background: #ff6b6b;
}

.logout-icon, .delete-icon {
  width: 32rpx;
  height: 32rpx;
}

.version-info {
  text-align: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 24rpx;
}

.build-info {
  display: block;
  margin-top: 10rpx;
  font-size: 20rpx;
}

.bottom-placeholder {
  height: 100rpx;
}
</style>