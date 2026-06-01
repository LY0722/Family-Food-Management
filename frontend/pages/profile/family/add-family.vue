<template>
  <view class="add-family-root">
    <view class="header">
      <view class="header-left" @tap="goBack">
        <image src="/static/icons/arrow-left.png" class="back-icon"/>
      </view>
      <view class="header-center">
        <text class="header-title">加入家庭</text>
      </view>
      <view class="header-right"></view>
    </view>
    
    <view class="content">
      <view class="input-section">
        <text class="input-label">输入码</text>
        <input 
          class="family-input" 
          v-model="familyId" 
          placeholder="请输入家庭ID"
          placeholder-class="input-placeholder"
        />
      </view>
      
      <button class="join-btn" @tap="joinFamily" :disabled="loading">
        <text v-if="!loading">加入家庭</text>
        <text v-else>加入中...</text>
      </button>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api'
import { mapMutations, mapState } from 'vuex'

export default {
  name: 'AddFamily',
  
  computed: {
    ...mapState('user', ['userInfo'])
  },
  
  data() {
    return {
      familyId: '',
      loading: false
    }
  },
  methods: {
    ...mapMutations('user', ['SET_CURRENT_FAMILY', 'SET_USER_INFO']),
    goBack() {
      uni.navigateBack()
    },
    
    async joinFamily() {
      if (!this.familyId.trim()) {
        uni.showToast({
          title: '请输入家庭ID',
          icon: 'none'
        })
        return
      }
      
      this.loading = true
      try {
        const userInfo = uni.getStorageSync('userInfo')
        const response = await api.family.join({ 
          userId: userInfo.id,
          familyCode: this.familyId.trim() 
        })
        
        if (response.code === 200) {
          const familyInfo = {
            id: response.data.id,
            name: response.data.name,
            familyCode: response.data.inviteCode
          }
          
          // 更新当前家庭
          this.SET_CURRENT_FAMILY(familyInfo)
          
          // 更新用户信息中的 familyId
          const updatedUserInfo = {
            ...this.userInfo,
            familyId: familyInfo.id
          }
          this.SET_USER_INFO(updatedUserInfo)
          
          uni.showToast({
            title: '加入家庭成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: response.message || '加入失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('加入家庭失败:', error)
        uni.showToast({
          title: '加入失败，请重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.add-family-root {
  min-height: 100vh;
  background: #f5f7fa;
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

.content {
  padding: 60rpx 40rpx;
}

.input-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.input-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 24rpx;
}

.family-input {
  width: 100%;
  font-size: 32rpx;
  color: #333;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #f0f0f0;
}

.input-placeholder {
  color: #999;
}

.join-btn {
  width: 100%;
  padding: 32rpx;
  background: linear-gradient(135deg, #52b788 0%, #2d865a 100%);
  color: #fff;
  border: none;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 4rpx 16rpx rgba(45, 134, 90, 0.3);
}

.join-btn:active {
  opacity: 0.8;
}

.join-btn[disabled] {
  opacity: 0.6;
}
</style>