<template>
  <view class="chart-root">
    <view class="header">
      <view class="header-left" @tap="goBack">
        <image src="/static/icons/arrow-left.png" class="back-icon"/>
      </view>
      <view class="header-center">
        <text class="header-title">统计分析</text>
      </view>
      <view class="header-right"></view>
    </view>
    
    <view class="content">
      <view class="chart-card">
        <view class="card-header">
          <text class="card-title">本周营养摄入</text>
          <text class="card-subtitle">2026.04.12 - 2026.04.18</text>
        </view>
        <view class="chart-placeholder">
          <text class="placeholder-text">📊 营养摄入图表</text>
          <text class="placeholder-desc">蛋白质、碳水化合物、脂肪比例</text>
        </view>
        <view class="chart-legend">
          <view class="legend-item">
            <view class="legend-dot protein"></view>
            <text class="legend-text">蛋白质</text>
          </view>
          <view class="legend-item">
            <view class="legend-dot carbs"></view>
            <text class="legend-text">碳水</text>
          </view>
          <view class="legend-item">
            <view class="legend-dot fat"></view>
            <text class="legend-text">脂肪</text>
          </view>
        </view>
      </view>
      
      <view class="chart-card">
        <view class="card-header">
          <text class="card-title">食材消耗统计</text>
          <text class="card-subtitle">近7天</text>
        </view>
        <view class="chart-placeholder">
          <text class="placeholder-text">📈 消耗趋势图</text>
          <text class="placeholder-desc">近7天食材消耗情况</text>
        </view>
      </view>
      
      <view class="chart-card">
        <view class="card-header">
          <text class="card-title">用餐频率分析</text>
          <text class="card-subtitle">本周</text>
        </view>
        <view class="chart-placeholder">
          <text class="placeholder-text">📉 用餐频率图</text>
          <text class="placeholder-desc">早、中、晚餐用餐次数</text>
        </view>
      </view>
      
      <view class="stats-summary">
        <view class="stat-item">
          <text class="stat-value">21</text>
          <text class="stat-label">本周用餐次数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">15</text>
          <text class="stat-label">制作菜谱数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">8</text>
          <text class="stat-label">食材种类</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { requireLogin } from '@/utils/pageGuard'

export default {
  name: 'ChartPage',
  data() {
    return {
      
    }
  },
  onLoad() {
    if (!requireLogin()) {
      return
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.chart-root {
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

.chart-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.card-subtitle {
  font-size: 24rpx;
  color: #999;
}

.chart-placeholder {
  background: #f8fff9;
  border-radius: 16rpx;
  padding: 60rpx 24rpx;
  text-align: center;
  border: 2rpx dashed #1ba035;
}

.placeholder-text {
  font-size: 48rpx;
  display: block;
  margin-bottom: 12rpx;
}

.placeholder-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 32rpx;
  margin-top: 20rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.legend-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
}

.legend-dot.protein {
  background: #1ba035;
}

.legend-dot.carbs {
  background: #faad14;
}

.legend-dot.fat {
  background: #ff4d4f;
}

.legend-text {
  font-size: 24rpx;
  color: #666;
}

.stats-summary {
  display: flex;
  justify-content: space-around;
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.stat-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #1ba035;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}
</style>