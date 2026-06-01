<template>
  <view class="notifications-page">
    <view class="page-header">
      <text class="page-title">通知设置</text>
      <text class="page-desc">管理您的提醒和通知</text>
    </view>
    
    <scroll-view class="page-content" scroll-y>
      <view class="setting-section">
        <view class="section-title">
          <text class="title-text">过期提醒</text>
          <text class="title-desc">食材即将过期时通知您</text>
        </view>
        
        <view class="setting-item">
          <view class="item-left">
            <text class="item-name">开启过期提醒</text>
            <text class="item-desc">在食材过期前收到提醒</text>
          </view>
          <switch 
            :checked="settings.expiryReminder" 
            @change="toggleSetting('expiryReminder')"
            color="#07c160"
          />
        </view>
        
        <view class="setting-item" v-if="settings.expiryReminder">
          <view class="item-left">
            <text class="item-name">提前天数</text>
          </view>
          <view class="item-right">
            <view 
              class="day-option" 
              :class="{ active: settings.expiryDays === 1 }"
              @tap="setExpiryDays(1)"
            >
              <text class="option-text">1天</text>
            </view>
            <view 
              class="day-option" 
              :class="{ active: settings.expiryDays === 2 }"
              @tap="setExpiryDays(2)"
            >
              <text class="option-text">2天</text>
            </view>
            <view 
              class="day-option" 
              :class="{ active: settings.expiryDays === 3 }"
              @tap="setExpiryDays(3)"
            >
              <text class="option-text">3天</text>
            </view>
          </view>
        </view>
        
        <view class="setting-item" v-if="settings.expiryReminder">
          <view class="item-left">
            <text class="item-name">提醒时间</text>
          </view>
          <picker 
            mode="time" 
            :value="settings.expiryTime" 
            @change="setExpiryTime"
          >
            <view class="picker-value">
              <text class="value-text">{{ settings.expiryTime }}</text>
              <image src="/static/icons/arrow.png" class="arrow-icon" />
            </view>
          </picker>
        </view>
      </view>
      
      <view class="setting-section">
        <view class="section-title">
          <text class="title-text">消耗报告</text>
          <text class="title-desc">定期发送消耗统计</text>
        </view>
        
        <view class="setting-item">
          <view class="item-left">
            <text class="item-name">每日消耗总结</text>
            <text class="item-desc">每天发送当日消耗报告</text>
          </view>
          <switch 
            :checked="settings.dailyReport" 
            @change="toggleSetting('dailyReport')"
            color="#07c160"
          />
        </view>
        
        <view class="setting-item">
          <view class="item-left">
            <text class="item-name">每周消耗总结</text>
            <text class="item-desc">每周发送消耗报告</text>
          </view>
          <switch 
            :checked="settings.weeklyReport" 
            @change="toggleSetting('weeklyReport')"
            color="#07c160"
          />
        </view>
      </view>
      
      <view class="setting-section">
        <view class="section-title">
          <text class="title-text">智能推荐</text>
          <text class="title-desc">AI智能推荐相关通知</text>
        </view>
        
        <view class="setting-item">
          <view class="item-left">
            <text class="item-name">AI采购建议</text>
            <text class="item-desc">根据库存智能推荐采购</text>
          </view>
          <switch 
            :checked="settings.aiShopping" 
            @change="toggleSetting('aiShopping')"
            color="#07c160"
          />
        </view>
        
        <view class="setting-item">
          <view class="item-left">
            <text class="item-name">菜谱推荐</text>
            <text class="item-desc">根据库存推荐菜谱</text>
          </view>
          <switch 
            :checked="settings.recipeRecommend" 
            @change="toggleSetting('recipeRecommend')"
            color="#07c160"
          />
        </view>
      </view>
      
      <view class="setting-section">
        <view class="section-title">
          <text class="title-text">家庭动态</text>
          <text class="title-desc">家庭成员操作通知</text>
        </view>
        
        <view class="setting-item">
          <view class="item-left">
            <text class="item-name">成员加入通知</text>
            <text class="item-desc">新成员加入家庭时通知</text>
          </view>
          <switch 
            :checked="settings.memberJoin" 
            @change="toggleSetting('memberJoin')"
            color="#07c160"
          />
        </view>
        
        <view class="setting-item">
          <view class="item-left">
            <text class="item-name">库存变更通知</text>
            <text class="item-desc">成员修改库存时通知</text>
          </view>
          <switch 
            :checked="settings.inventoryChange" 
            @change="toggleSetting('inventoryChange')"
            color="#07c160"
          />
        </view>
      </view>
    </scroll-view>
    
    <view class="page-footer">
      <button class="save-btn" @tap="handleSave">保存设置</button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'NotificationsPage',
  
  data() {
    return {
      settings: {
        expiryReminder: true,
        expiryDays: 2,
        expiryTime: '09:00',
        dailyReport: false,
        weeklyReport: true,
        aiShopping: true,
        recipeRecommend: true,
        memberJoin: true,
        inventoryChange: false
      }
    }
  },
  
  onLoad() {
    this.loadSettings()
  },
  
  methods: {
    async loadSettings() {
      try {
        const response = await this.$api.user.getNotificationSettings()
        if (response.code === 200 && response.data) {
          this.settings = { ...this.settings, ...response.data }
        }
      } catch (error) {
        console.error('加载通知设置失败:', error)
      }
    },
    
    toggleSetting(key) {
      this.settings[key] = !this.settings[key]
    },
    
    setExpiryDays(days) {
      this.settings.expiryDays = days
    },
    
    setExpiryTime(e) {
      this.settings.expiryTime = e.detail.value
    },
    
    async handleSave() {
      uni.showLoading({ title: '保存中...' })
      
      try {
        const response = await this.$api.user.updateNotificationSettings(this.settings)
        if (response.code === 200) {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: response.message || '保存失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('保存通知设置失败:', error)
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
.notifications-page {
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

.setting-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}

.section-title {
  margin-bottom: 24rpx;
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

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.item-left {
  flex: 1;
}

.item-name {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.item-desc {
  font-size: 24rpx;
  color: #999;
}

.item-right {
  display: flex;
  gap: 12rpx;
}

.day-option {
  padding: 12rpx 24rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  border: 2rpx solid transparent;
}

.day-option.active {
  background: #e6f7ff;
  border-color: #1890ff;
}

.option-text {
  font-size: 24rpx;
  color: #666;
}

.day-option.active .option-text {
  color: #1890ff;
  font-weight: 600;
}

.picker-value {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
}

.value-text {
  font-size: 26rpx;
  color: #333;
}

.arrow-icon {
  width: 24rpx;
  height: 24rpx;
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