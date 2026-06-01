<template>
  <view class="create-family-page">
    <view class="page-header">
      <view class="header-left" @tap="goBack">
        <image src="/static/icons/arrow-left.png" class="back-icon" />
      </view>
      <view class="header-center">
        <text class="page-title">创建家庭</text>
      </view>
      <view class="header-right"></view>
    </view>
    
    <scroll-view class="page-content" scroll-y>
      <view class="form-section">
        <view class="form-item">
          <text class="form-label">家庭名称</text>
          <input 
            class="form-input"
            v-model="formData.name"
            placeholder="请输入家庭名称"
            placeholder-class="input-placeholder"
            maxlength="20"
          />
          <text class="input-count">{{ formData.name.length }}/20</text>
        </view>
        
        <view class="form-item">
          <text class="form-label">家庭描述（可选）</text>
          <textarea 
            class="form-textarea"
            v-model="formData.description"
            placeholder="介绍一下你的家庭"
            placeholder-class="input-placeholder"
            maxlength="100"
          />
          <text class="input-count">{{ formData.description.length }}/100</text>
        </view>
      </view>
      
      <view class="tips-section">
        <view class="tip-item">
          <text class="tip-icon">💡</text>
          <text class="tip-text">创建家庭后，您可以邀请家人加入</text>
        </view>
        <view class="tip-item">
          <text class="tip-icon">💡</text>
          <text class="tip-text">家庭成员可以共同管理食材库存</text>
        </view>
        <view class="tip-item">
          <text class="tip-icon">💡</text>
          <text class="tip-text">家庭数据仅成员可见，请放心使用</text>
        </view>
      </view>
    </scroll-view>
    
    <view class="page-footer">
      <button class="btn-create" :loading="loading" @tap="handleCreate">
        创建家庭
      </button>
    </view>
  </view>
</template>

<script>
import { mapMutations, mapState } from 'vuex'

export default {
  name: 'CreateFamilyPage',
  
  data() {
    return {
      loading: false,
      formData: {
        name: '',
        description: ''
      }
    }
  },
  
  computed: {
    ...mapState('user', ['userInfo'])
  },
  
  methods: {
    ...mapMutations('user', ['SET_CURRENT_FAMILY', 'SET_USER_INFO']),
    
    goBack() {
      uni.navigateBack()
    },
    
    async handleCreate() {
      if (!this.formData.name.trim()) {
        uni.showToast({
          title: '请输入家庭名称',
          icon: 'none'
        })
        return
      }
      
      this.loading = true
      
      try {
        const userInfo = uni.getStorageSync('userInfo')
        const response = await this.$api.family.create({
          userId: userInfo.id,
          name: this.formData.name.trim(),
          description: this.formData.description.trim()
        })
        
        if (response.code === 200) {
          const familyInfo = response.data
          
          // 更新当前家庭
          this.SET_CURRENT_FAMILY(familyInfo)
          
          // 更新用户信息中的 familyId
          const updatedUserInfo = {
            ...this.userInfo,
            familyId: familyInfo.id
          }
          this.SET_USER_INFO(updatedUserInfo)
          
          uni.showToast({
            title: '创建成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/home/home'
            })
          }, 1500)
        } else {
          uni.showToast({
            title: response.message || '创建失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('创建家庭失败:', error)
        uni.showToast({
          title: '创建失败，请重试',
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
.create-family-page {
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.page-header {
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

.page-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.page-content {
  flex: 1;
  padding: 20rpx 24rpx;
}

.form-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.form-item {
  margin-bottom: 32rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  height: 88rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333;
}

.form-textarea {
  width: 100%;
  min-height: 160rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: #333;
}

.input-placeholder {
  color: #999;
}

.input-count {
  font-size: 24rpx;
  color: #999;
  text-align: right;
  display: block;
  margin-top: 8rpx;
}

.tips-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-icon {
  font-size: 32rpx;
}

.tip-text {
  flex: 1;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

.page-footer {
  background: white;
  padding: 20rpx 24rpx;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.btn-create {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #07c160, #059e4a);
  color: white;
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 600;
}
</style>