<template>
  <view class="health-tags-page">
    <view class="page-header">
      <text class="page-title">健康标签</text>
      <text class="page-desc">选择您的饮食偏好和健康目标</text>
    </view>
    
    <scroll-view class="page-content" scroll-y>
      <view class="tag-section">
        <view class="section-title">
          <text class="title-text">饮食目标</text>
          <text class="title-desc">选择您的主要目标（可多选）</text>
        </view>
        <view class="tag-list">
          <view 
            class="tag-item" 
            v-for="tag in dietGoals" 
            :key="tag.id"
            :class="{ active: isTagSelected(tag.id) }"
            @tap="toggleTag(tag.id)"
          >
            <image :src="tag.icon" class="tag-icon" />
            <text class="tag-name">{{ tag.name }}</text>
            <view class="check-icon" v-if="isTagSelected(tag.id)">
              <image src="/static/icons/check.png" class="check-img" />
            </view>
          </view>
        </view>
      </view>
      
      <view class="tag-section">
        <view class="section-title">
          <text class="title-text">忌口</text>
          <text class="title-desc">选择您的过敏或忌口食物</text>
        </view>
        <view class="tag-list">
          <view 
            class="tag-item" 
            v-for="tag in allergies" 
            :key="tag.id"
            :class="{ active: isTagSelected(tag.id) }"
            @tap="toggleTag(tag.id)"
          >
            <image :src="tag.icon" class="tag-icon" />
            <text class="tag-name">{{ tag.name }}</text>
            <view class="check-icon" v-if="isTagSelected(tag.id)">
              <image src="/static/icons/check.png" class="check-img" />
            </view>
          </view>
        </view>
      </view>
      
      <view class="tag-section">
        <view class="section-title">
          <text class="title-text">饮食偏好</text>
          <text class="title-desc">选择您的饮食偏好（可多选）</text>
        </view>
        <view class="tag-list">
          <view 
            class="tag-item" 
            v-for="tag in preferences" 
            :key="tag.id"
            :class="{ active: isTagSelected(tag.id) }"
            @tap="toggleTag(tag.id)"
          >
            <image :src="tag.icon" class="tag-icon" />
            <text class="tag-name">{{ tag.name }}</text>
            <view class="check-icon" v-if="isTagSelected(tag.id)">
              <image src="/static/icons/check.png" class="check-img" />
            </view>
          </view>
        </view>
      </view>
      
      <view class="tag-section">
        <view class="section-title">
          <text class="title-text">其他</text>
          <text class="title-desc">其他饮食限制</text>
        </view>
        <view class="tag-list">
          <view 
            class="tag-item" 
            v-for="tag in others" 
            :key="tag.id"
            :class="{ active: isTagSelected(tag.id) }"
            @tap="toggleTag(tag.id)"
          >
            <image :src="tag.icon" class="tag-icon" />
            <text class="tag-name">{{ tag.name }}</text>
            <view class="check-icon" v-if="isTagSelected(tag.id)">
              <image src="/static/icons/check.png" class="check-img" />
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <view class="page-footer">
      <button class="save-btn" @tap="handleSave">保存</button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'HealthTagsPage',
  
  data() {
    return {
      selectedTags: [],
      dietGoals: [
        { id: 'weight-loss', name: '减脂', icon: '/static/icons/weight-loss.png' },
        { id: 'muscle-gain', name: '增肌', icon: '/static/icons/muscle.png' },
        { id: 'healthy', name: '保持健康', icon: '/static/icons/healthy.png' }
      ],
      allergies: [
        { id: 'seafood', name: '海鲜过敏', icon: '/static/icons/seafood.png' },
        { id: 'nuts', name: '坚果过敏', icon: '/static/icons/nuts.png' },
        { id: 'lactose', name: '乳糖不耐', icon: '/static/icons/milk.png' },
        { id: 'none', name: '无', icon: '/static/icons/none.png' }
      ],
      preferences: [
        { id: 'low-salt', name: '低盐', icon: '/static/icons/low-salt.png' },
        { id: 'low-fat', name: '低脂', icon: '/static/icons/low-fat.png' },
        { id: 'high-protein', name: '高蛋白', icon: '/static/icons/protein.png' },
        { id: 'low-carb', name: '低碳水', icon: '/static/icons/carb.png' },
        { id: 'sugar-free', name: '无糖', icon: '/static/icons/sugar.png' }
      ],
      others: [
        { id: 'vegetarian', name: '素食', icon: '/static/icons/vegetarian.png' },
        { id: 'halal', name: '清真', icon: '/static/icons/halal.png' },
        { id: 'low-oil', name: '少油', icon: '/static/icons/oil.png' }
      ]
    }
  },
  
  onLoad() {
    this.loadUserTags()
  },
  
  methods: {
    async loadUserTags() {
      try {
        const response = await this.$api.user.getHealthTags()
        if (response.code === 200 && response.data) {
          this.selectedTags = response.data
        }
      } catch (error) {
        console.error('加载健康标签失败:', error)
      }
    },
    
    isTagSelected(tagId) {
      return this.selectedTags.includes(tagId)
    },
    
    toggleTag(tagId) {
      const index = this.selectedTags.indexOf(tagId)
      if (index > -1) {
        this.selectedTags.splice(index, 1)
      } else {
        this.selectedTags.push(tagId)
      }
    },
    
    async handleSave() {
      uni.showLoading({ title: '保存中...' })
      
      try {
        const response = await this.$api.user.updateHealthTags(this.selectedTags)
        if (response.code === 200) {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: response.message || '保存失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('保存健康标签失败:', error)
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    }
  }
}
</script>

<style scoped>
.health-tags-page {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.page-header {
  background: white;
  padding: 32rpx 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.08);
}

.page-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.page-desc {
  font-size: 26rpx;
  color: #666;
}

.page-content {
  flex: 1;
  padding: 20rpx;
}

.tag-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}

.section-title {
  margin-bottom: 20rpx;
}

.title-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.title-desc {
  font-size: 24rpx;
  color: #999;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 24rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  border: 2rpx solid transparent;
  position: relative;
}

.tag-item.active {
  background: #e6f7ff;
  border-color: #1890ff;
}

.tag-icon {
  width: 40rpx;
  height: 40rpx;
}

.tag-name {
  font-size: 26rpx;
  color: #333;
}

.check-icon {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  width: 32rpx;
  height: 32rpx;
  background: #1890ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-img {
  width: 20rpx;
  height: 20rpx;
}

.page-footer {
  background: white;
  padding: 20rpx 24rpx;
  box-shadow: 0 -2rpx 12rpx rgba(0,0,0,0.08);
}

.save-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #07c160, #059e4a);
  color: white;
  border-radius: 44rpx;
  font-size: 28rpx;
  border: none;
}
</style>