<template>
  <view class="scan-page">
    <view class="page-header">
      <view class="header-left" @tap="goBack">
        <image src="/static/icons/arrow-left.png" class="back-icon" />
      </view>
      <text class="page-title">扫码添加</text>
      <view class="header-right" @tap="toggleFlash">
        <image :src="flashOn ? '/static/icons/bell.png' : '/static/icons/bell.png'" class="flash-icon" />
      </view>
    </view>
    
    <view class="page-content">
      <!-- 扫码区域 -->
      <view class="scan-area">
        <camera 
          class="camera" 
          :flash="flashOn ? 'on' : 'off'"
          @scancode="onScanCode"
          mode="scanCode"
        >
          <cover-view class="scan-frame">
            <cover-view class="scan-line"></cover-view>
            <cover-view class="scan-corner top-left"></cover-view>
            <cover-view class="scan-corner top-right"></cover-view>
            <cover-view class="scan-corner bottom-left"></cover-view>
            <cover-view class="scan-corner bottom-right"></cover-view>
          </cover-view>
        </camera>
        
        <view class="scan-tips">
          <text class="tips-text">将条形码/二维码放入框内</text>
          <text class="tips-subtext">自动识别商品信息</text>
        </view>
      </view>
      
      <!-- 快捷操作 -->
      <view class="quick-actions">
        <view class="action-item" @tap="goToManualInput">
          <image src="/static/icons/edit.png" class="action-icon" />
          <text class="action-text">手动输入</text>
        </view>
        
        <view class="action-item" @tap="chooseFromAlbum">
          <image src="/static/icons/camera.png" class="action-icon" />
          <text class="action-text">相册识别</text>
        </view>
        
        <view class="action-item" @tap="showHistory">
          <image src="/static/icons/search.png" class="action-icon" />
          <text class="action-text">扫码历史</text>
        </view>
      </view>
      
      <!-- 扫码记录 -->
      <view class="scan-history" v-if="scanHistory.length > 0">
        <view class="history-header">
          <text class="history-title">最近扫码</text>
          <text class="clear-btn" @tap="clearHistory">清除</text>
        </view>
        
        <scroll-view class="history-list" scroll-x>
          <view 
            class="history-item" 
            v-for="(item, index) in scanHistory" 
            :key="index"
            @tap="selectHistory(item)"
          >
            <image :src="item.image" class="item-image" mode="aspectFill" />
            <text class="item-name">{{ item.name }}</text>
            <text class="item-code">{{ item.code }}</text>
          </view>
        </scroll-view>
      </view>
    </view>
    
    <!-- 扫码结果弹窗 -->
    <view class="result-modal" v-if="showResultModal" @tap="closeResultModal">
      <view class="result-content" @tap.stop>
        <view class="result-header">
          <text class="result-title">识别成功</text>
          <view class="close-btn" @tap="closeResultModal">
            <image src="/static/icons/close.png" class="close-icon" />
          </view>
        </view>
        
        <view class="result-body">
          <image :src="scanResult.image" class="result-image" mode="aspectFill" />
          
          <view class="result-info">
            <text class="info-label">商品名称</text>
            <text class="info-value">{{ scanResult.name }}</text>
          </view>
          
          <view class="result-info">
            <text class="info-label">商品条码</text>
            <text class="info-value">{{ scanResult.code }}</text>
          </view>
          
          <view class="result-info">
            <text class="info-label">商品类别</text>
            <text class="info-value">{{ scanResult.category }}</text>
          </view>
          
          <view class="result-info">
            <text class="info-label">参考价格</text>
            <text class="info-value">¥{{ scanResult.price }}</text>
          </view>
        </view>
        
        <view class="result-footer">
          <button class="result-btn secondary" @tap="editResult">
            <text>编辑信息</text>
          </button>
          <button class="result-btn primary" @tap="confirmAdd">
            <text>确认添加</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ScanPage',
  
  data() {
    return {
      flashOn: false,
      showResultModal: false,
      scanResult: {
        code: '',
        name: '',
        category: '',
        price: '',
        image: ''
      },
      scanHistory: []
    }
  },
  
  onLoad() {
    this.loadScanHistory()
  },
  
  methods: {
    onScanCode(e) {
      const code = e.detail.result
      
      uni.showLoading({ title: '识别中...' })
      
      this.identifyProduct(code)
        .then(result => {
          uni.hideLoading()
          
          this.scanResult = result
          this.showResultModal = true
          
          this.saveToHistory(result)
        })
        .catch(error => {
          uni.hideLoading()
          console.error('识别失败:', error)
          
          uni.showModal({
            title: '识别失败',
            content: '未能识别该商品，是否手动输入？',
            success: (res) => {
              if (res.confirm) {
                this.goToManualInput(code)
              }
            }
          })
        })
    },
    
    async identifyProduct(code) {
      try {
        const response = await this.$api.ingredient.scan({ code })
        
        if (response.code === 200) {
          return response.data
        } else {
          throw new Error(response.message || '识别失败')
        }
      } catch (error) {
        throw error
      }
    },
    
    toggleFlash() {
      this.flashOn = !this.flashOn
    },
    
    goToManualInput(code = '') {
      uni.navigateTo({
        url: `/pages/shopping/scan/manual-input?code=${code}`
      })
    },
    
    chooseFromAlbum() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album'],
        success: (res) => {
          const imagePath = res.tempFilePaths[0]
          
          uni.showLoading({ title: '识别中...' })
          
          this.identifyImage(imagePath)
            .then(result => {
              uni.hideLoading()
              
              this.scanResult = result
              this.showResultModal = true
              
              this.saveToHistory(result)
            })
            .catch(error => {
              uni.hideLoading()
              console.error('识别失败:', error)
              
              uni.showToast({
                title: '识别失败，请重试',
                icon: 'none'
              })
            })
        }
      })
    },
    
    async identifyImage(imagePath) {
      try {
        const response = await this.$api.ingredient.identifyImage({ image: imagePath })
        
        if (response.code === 200) {
          return response.data
        } else {
          throw new Error(response.message || '识别失败')
        }
      } catch (error) {
        throw error
      }
    },
    
    showHistory() {
      uni.showToast({
        title: '扫码历史',
        icon: 'none'
      })
    },
    
    selectHistory(item) {
      this.scanResult = item
      this.showResultModal = true
    },
    
    saveToHistory(item) {
      const history = this.scanHistory.filter(h => h.code !== item.code)
      history.unshift(item)
      this.scanHistory = history.slice(0, 10)
      
      uni.setStorageSync('scanHistory', this.scanHistory)
    },
    
    loadScanHistory() {
      const history = uni.getStorageSync('scanHistory') || []
      this.scanHistory = history
    },
    
    clearHistory() {
      uni.showModal({
        title: '确认清除',
        content: '确定要清除所有扫码历史吗？',
        success: (res) => {
          if (res.confirm) {
            this.scanHistory = []
            uni.removeStorageSync('scanHistory')
          }
        }
      })
    },
    
    editResult() {
      this.closeResultModal()
      this.goToManualInput(this.scanResult.code)
    },
    
    confirmAdd() {
      uni.showLoading({ title: '添加中...' })
      
      this.$api.shopping.add({
        name: this.scanResult.name,
        code: this.scanResult.code,
        category: this.scanResult.category,
        price: this.scanResult.price,
        image: this.scanResult.image
      })
        .then(response => {
          uni.hideLoading()
          
          if (response.code === 200) {
            uni.showToast({
              title: '添加成功',
              icon: 'success'
            })
            
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          }
        })
        .catch(error => {
          uni.hideLoading()
          console.error('添加失败:', error)
          
          uni.showToast({
            title: '添加失败',
            icon: 'none'
          })
        })
    },
    
    closeResultModal() {
      this.showResultModal = false
    },
    
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.scan-page {
  min-height: 100vh;
  background: #000;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background: rgba(0, 0, 0, 0.5);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.header-left,
.header-right {
  padding: 12rpx;
}

.back-icon,
.flash-icon {
  width: 40rpx;
  height: 40rpx;
}

.page-title {
  font-size: 32rpx;
  font-weight: 600;
  color: white;
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 100rpx;
}

.scan-area {
  flex: 1;
  position: relative;
}

.camera {
  width: 100%;
  height: 100%;
}

.scan-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500rpx;
  height: 500rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 24rpx;
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, transparent, #07c160, transparent);
  animation: scan 2s infinite;
}

@keyframes scan {
  0% {
    top: 0;
  }
  50% {
    top: calc(100% - 4rpx);
  }
  100% {
    top: 0;
  }
}

.scan-corner {
  position: absolute;
  width: 60rpx;
  height: 60rpx;
  border: 6rpx solid #07c160;
}

.scan-corner.top-left {
  top: -6rpx;
  left: -6rpx;
  border-right: none;
  border-bottom: none;
  border-radius: 12rpx 0 0 0;
}

.scan-corner.top-right {
  top: -6rpx;
  right: -6rpx;
  border-left: none;
  border-bottom: none;
  border-radius: 0 12rpx 0 0;
}

.scan-corner.bottom-left {
  bottom: -6rpx;
  left: -6rpx;
  border-right: none;
  border-top: none;
  border-radius: 0 0 0 12rpx;
}

.scan-corner.bottom-right {
  bottom: -6rpx;
  right: -6rpx;
  border-left: none;
  border-top: none;
  border-radius: 0 0 12rpx 0;
}

.scan-tips {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, calc(-50% + 300rpx));
  text-align: center;
  color: white;
}

.tips-text {
  font-size: 28rpx;
  font-weight: 500;
  display: block;
  margin-bottom: 8rpx;
}

.tips-subtext {
  font-size: 22rpx;
  opacity: 0.8;
  display: block;
}

.quick-actions {
  display: flex;
  gap: 20rpx;
  padding: 24rpx;
  background: white;
}

.action-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx;
  background: #f5f7fa;
  border-radius: 16rpx;
}

.action-icon {
  width: 64rpx;
  height: 64rpx;
}

.action-text {
  font-size: 24rpx;
  color: #666;
}

.scan-history {
  background: white;
  padding: 24rpx;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.history-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.clear-btn {
  font-size: 24rpx;
  color: #1890ff;
}

.history-list {
  white-space: nowrap;
}

.history-item {
  display: inline-block;
  width: 160rpx;
  margin-right: 16rpx;
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  vertical-align: top;
}

.item-image {
  width: 100%;
  height: 120rpx;
  border-radius: 8rpx;
  margin-bottom: 8rpx;
}

.item-name {
  font-size: 22rpx;
  color: #333;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4rpx;
}

.item-code {
  font-size: 20rpx;
  color: #999;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.result-content {
  width: 600rpx;
  background: white;
  border-radius: 24rpx;
  overflow: hidden;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.result-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  padding: 12rpx;
}

.close-icon {
  width: 32rpx;
  height: 32rpx;
}

.result-body {
  padding: 32rpx;
}

.result-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  margin: 0 auto 24rpx;
  display: block;
}

.result-info {
  margin-bottom: 20rpx;
}

.info-label {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 8rpx;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  display: block;
}

.result-footer {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #f0f0f0;
}

.result-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
}

.result-btn.secondary {
  background: #f5f7fa;
  color: #666;
}

.result-btn.primary {
  background: #07c160;
  color: white;
}
</style>