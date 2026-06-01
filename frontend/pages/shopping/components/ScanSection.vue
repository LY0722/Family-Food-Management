<template>
  <view class="scan-section">
    <view class="section-header">
      <text class="section-title">快捷录入</text>
    </view>
    
    <view class="scan-options">
      <button class="scan-btn" @tap="handleScan">
        <image src="/static/icons/scan.png" class="btn-icon" />
        <text class="btn-text">扫码录入</text>
      </button>
      
      <button class="scan-btn" @tap="handleManual">
        <image src="/static/icons/edit.png" class="btn-icon" />
        <text class="btn-text">手动输入</text>
      </button>
    </view>
    
    <view class="scan-tips">
      <text class="tips-title">💡 使用提示</text>
      <text class="tips-item">• 扫描商品条形码自动识别食材</text>
      <text class="tips-item">• 手动输入可自定义食材信息</text>
      <text class="tips-item">• 支持批量导入采购清单</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ScanSection',
  
  methods: {
    handleScan() {
      this.$emit('scan')
    },
    
    handleManual() {
      this.$emit('manual')
    }
  }
}
</script>

<style scoped>
.scan-section {
  background: white;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.08);
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.scan-options {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.scan-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 32rpx 20rpx;
  background: linear-gradient(135deg, #f0f5ff, #e6f7ff);
  border-radius: 16rpx;
  border: none;
}

.btn-icon {
  width: 48rpx;
  height: 48rpx;
}

.btn-text {
  font-size: 26rpx;
  color: #1890ff;
}

.scan-tips {
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 20rpx;
}

.tips-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.tips-item {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
  line-height: 1.6;
}
</style>