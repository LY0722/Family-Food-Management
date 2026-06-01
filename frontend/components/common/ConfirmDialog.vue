<!-- 
 * 文件路径：/components/common/ConfirmDialog.vue
 * 文件说明：通用确认弹窗组件，用于删除/提交等确认操作
-->
<template>
  <uni-popup ref="popup" type="center" :mask-click="false">
    <view class="confirm-dialog">
      <view class="dialog-header" v-if="options.title">
        <text class="dialog-title">{{ options.title }}</text>
      </view>
      
      <view class="dialog-content">
        <text class="dialog-message">{{ options.content }}</text>
      </view>
      
      <view class="dialog-actions">
        <button 
          class="btn-cancel"
          @tap="handleCancel"
          v-if="!options.hideCancel"
        >
          {{ options.cancelText || '取消' }}
        </button>
        <button 
          class="btn-confirm"
          @tap="handleConfirm"
          :style="{ color: options.confirmColor || '#07c160' }"
        >
          {{ options.confirmText || '确定' }}
        </button>
      </view>
    </view>
  </uni-popup>
</template>

<script>
export default {
  data() {
    return {
      options: {},
      resolve: null,
      reject: null
    }
  },
  
  methods: {
    show(options = {}) {
      this.options = options
      this.$refs.popup.open()
      
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    
    hide() {
      this.$refs.popup.close()
    },
    
    handleConfirm() {
      this.hide()
      if (this.resolve) {
        this.resolve()
      }
      this.cleanup()
    },
    
    handleCancel() {
      this.hide()
      if (this.reject) {
        this.reject(new Error('用户取消'))
      }
      this.cleanup()
    },
    
    cleanup() {
      this.resolve = null
      this.reject = null
      this.options = {}
    }
  }
}
</script>

<style scoped>
.confirm-dialog {
  width: 600rpx;
  background-color: white;
  border-radius: 24rpx;
  overflow: hidden;
}

.dialog-header {
  padding: 40rpx 40rpx 20rpx;
  text-align: center;
}

.dialog-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.dialog-content {
  padding: 20rpx 40rpx 40rpx;
}

.dialog-message {
  font-size: 30rpx;
  color: #666;
  line-height: 1.6;
  text-align: center;
}

.dialog-actions {
  display: flex;
  border-top: 1rpx solid #eee;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 30rpx;
  background: none;
  border: none;
  font-size: 30rpx;
}

.btn-cancel {
  color: #666;
  border-right: 1rpx solid #eee;
}

.btn-confirm {
  font-weight: 500;
}
</style>