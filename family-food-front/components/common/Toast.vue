<!-- 
 * 文件路径：/components/common/Toast.vue
 * 文件说明：通用提示框组件，展示操作结果提示
-->
<template>
  <view v-if="visible" class="toast-wrapper">
    <view class="toast-container" :class="toastClass">
      <text class="toast-icon">{{ toastEmoji }}</text>
      <text class="toast-message">{{ message }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Toast',
  
  data() {
    return {
      message: '',
      type: 'success',
      visible: false,
      timer: null
    }
  },
  
  computed: {
    toastClass() {
      return `toast-${this.type}`
    },
    
    toastEmoji() {
      const emojis = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      }
      return emojis[this.type] || emojis.info
    }
  },
  
  methods: {
    show(message, type = 'success', duration = 2000) {
      console.log('Toast.show called:', { message, type, duration })
      
      this.message = message
      this.type = type
      this.visible = true
      
      if (this.timer) {
        clearTimeout(this.timer)
      }
      
      this.timer = setTimeout(() => {
        this.hide()
      }, duration)
    },
    
    hide() {
      this.visible = false
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    }
  }
}
</script>

<style scoped>
.toast-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  padding-top: 40rpx;
}

.toast-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 32rpx;
  border-radius: 8rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.toast-success {
  background-color: #e7f7ef;
  color: #07c160;
}

.toast-error {
  background-color: #ffe5e5;
  color: #ff3b30;
}

.toast-warning {
  background-color: #fff4e5;
  color: #ff9500;
}

.toast-info {
  background-color: #e8f4ff;
  color: #1989fa;
}

.toast-icon {
  font-size: 32rpx;
  font-weight: bold;
  margin-right: 12rpx;
  min-width: 32rpx;
  text-align: center;
}

.toast-message {
  font-size: 28rpx;
  font-weight: 500;
}
</style>