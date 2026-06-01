<template>
  <view class="history-root">
    <view class="header">
      <view class="header-left" @tap="goBack">
        <image src="/static/icons/arrow-left.png" class="back-icon"/>
      </view>
      <view class="header-center">
        <text class="header-title">历史记录</text>
      </view>
      <view class="header-right"></view>
    </view>
    
    <view class="content">
      <view class="date-selector">
        <text class="date-label">选择日期：</text>
        <picker mode="date" :value="selectedDate" @change="onDateChange">
          <view class="date-picker">
            <text class="date-text">{{ selectedDate }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>
      
      <view class="history-list" v-if="historyRecords.length > 0">
        <view 
          v-for="(record, index) in historyRecords" 
          :key="index" 
          class="history-item"
        >
          <view class="item-header">
            <view class="item-icon">{{ record.icon }}</view>
            <view class="item-info">
              <text class="item-title">{{ record.title }}</text>
              <text class="item-time">{{ record.time }}</text>
            </view>
          </view>
          <view class="item-content">
            <text class="item-desc">{{ record.description }}</text>
            <view class="item-tags" v-if="record.tags && record.tags.length > 0">
              <text 
                v-for="tag in record.tags" 
                :key="tag" 
                class="tag"
              >{{ tag }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <view v-else class="empty-state">
        <text class="empty-icon">📝</text>
        <text class="empty-text">暂无历史记录</text>
        <text class="empty-desc">选择日期查看记录</text>
      </view>
    </view>
  </view>
</template>

<script>
import { requireLogin } from '@/utils/pageGuard'

export default {
  name: 'HistoryPage',
  data() {
    return {
      selectedDate: '',
      historyRecords: []
    }
  },
  onLoad() {
    if (!requireLogin()) {
      return
    }
    
    const today = new Date()
    this.selectedDate = this.formatDate(today)
    this.loadHistoryRecords()
  },
  methods: {
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    onDateChange(e) {
      this.selectedDate = e.detail.value
      this.loadHistoryRecords()
    },
    loadHistoryRecords() {
      this.historyRecords = [
        {
          icon: '🍳',
          title: '早餐记录',
          time: '07:30',
          description: '番茄鸡蛋面 - 营养丰富的早餐选择，蛋白质含量丰富',
          tags: ['早餐', '营养']
        },
        {
          icon: '🍖',
          title: '午餐记录',
          time: '12:15',
          description: '红烧肉 - 经典家常菜，肥而不腻，口感鲜美',
          tags: ['午餐', '肉类']
        },
        {
          icon: '🐟',
          title: '晚餐记录',
          time: '18:45',
          description: '清蒸鱼 - 清淡健康，营养丰富，适合晚餐',
          tags: ['晚餐', '海鲜']
        }
      ]
    },
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.history-root {
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
  padding: 32rpx 24rpx;
}

.date-selector {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.date-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.date-picker {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 24rpx;
  background: #f8fff9;
  border-radius: 16rpx;
}

.date-text {
  font-size: 28rpx;
  color: #1ba035;
  font-weight: bold;
}

.picker-arrow {
  font-size: 20rpx;
  color: #1ba035;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.history-item {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.history-item:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.item-icon {
  font-size: 48rpx;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.item-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.item-time {
  font-size: 24rpx;
  color: #999;
}

.item-content {
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.item-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 12rpx;
}

.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag {
  padding: 6rpx 16rpx;
  background: rgba(27, 160, 53, 0.1);
  color: #1ba035;
  border-radius: 12rpx;
  font-size: 22rpx;
}

.empty-state {
  text-align: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  display: block;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #999;
  display: block;
}
</style>