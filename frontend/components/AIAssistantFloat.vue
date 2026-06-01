<template>
  <view class="ai-assistant-float" @tap="openChat">
    <view class="assistant-icon">
      <image src="/static/icons/ai.png" class="ai-img" />
      <view class="pulse-ring"></view>
    </view>
    <view class="badge" v-if="unreadCount > 0">
      <text class="badge-text">{{ unreadCount }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'AIAssistantFloat',
  
  props: {
    unreadCount: {
      type: Number,
      default: 0
    }
  },
  
  methods: {
    openChat() {
      uni.navigateTo({
        url: '/pages/home/ai/chat'
      })
    }
  }
}
</script>

<style scoped>
.ai-assistant-float {
  position: fixed;
  bottom: 200rpx;
  right: 32rpx;
  z-index: 999;
}

.assistant-icon {
  position: relative;
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
}

.ai-img {
  width: 64rpx;
  height: 64rpx;
  z-index: 2;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4rpx solid rgba(102, 126, 234, 0.3);
  animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

.badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 40rpx;
  height: 40rpx;
  padding: 0 8rpx;
  background: #ff4d4f;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(255, 77, 79, 0.3);
}

.badge-text {
  font-size: 20rpx;
  color: white;
  font-weight: 600;
}
</style>