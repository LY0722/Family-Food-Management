<template>
  <view class="add-member-page">
    <view class="page-header">
      <view class="header-left" @tap="goBack">
        <image src="/static/icons/arrow-left.png" class="back-icon" />
      </view>
      <view class="header-center">
        <text class="page-title">添加家庭成员</text>
      </view>
      <view class="header-right"></view>
    </view>
    
    <scroll-view class="page-content" scroll-y>
      <view class="invite-ways-section">
        <view class="section-title">
          <text class="title-text">邀请方式</text>
          <text class="title-desc">选择邀请成员的方式</text>
        </view>
        
        <view class="invite-ways">
          <view class="invite-way" @tap="showCodeInvite">
            <view class="way-icon">
              <text class="icon-text">📱</text>
            </view>
            <text class="way-name">家庭码邀请</text>
            <text class="way-desc">分享家庭码给成员</text>
          </view>
          
          <view class="invite-way" @tap="showQRCode">
            <view class="way-icon">
              <text class="icon-text">📷</text>
            </view>
            <text class="way-name">二维码邀请</text>
            <text class="way-desc">生成二维码扫码加入</text>
          </view>
          
          <view class="invite-way" @tap="showLinkInvite">
            <view class="way-icon">
              <text class="icon-text">🔗</text>
            </view>
            <text class="way-name">链接邀请</text>
            <text class="way-desc">分享邀请链接</text>
          </view>
          
          <view class="invite-way" @tap="showWechatInvite">
            <view class="way-icon">
              <text class="icon-text">💬</text>
            </view>
            <text class="way-name">微信邀请</text>
            <text class="way-desc">通过微信分享</text>
          </view>
        </view>
      </view>
      
      <view class="family-info-section">
        <view class="section-title">
          <text class="title-text">家庭信息</text>
        </view>
        
        <view class="info-card">
          <view class="info-row">
            <text class="info-label">家庭名称</text>
            <text class="info-value">{{ familyInfo.name || '我的家庭' }}</text>
          </view>
          
          <view class="info-row">
            <text class="info-label">家庭码</text>
            <view class="code-display">
              <text class="code-text">{{ familyInfo.familyCode || familyInfo.family_code || '---' }}</text>
              <button class="copy-btn" @tap="copyCode">复制</button>
            </view>
          </view>
          
          <view class="info-row">
            <text class="info-label">当前成员</text>
            <text class="info-value">{{ memberCount }}人</text>
          </view>
        </view>
      </view>
      
      <view class="tips-section">
        <view class="section-title">
          <text class="title-text">温馨提示</text>
        </view>
        
        <view class="tips-list">
          <view class="tip-item">
            <text class="tip-icon">💡</text>
            <text class="tip-text">成员加入后可以查看和管理家庭食材</text>
          </view>
          <view class="tip-item">
            <text class="tip-icon">💡</text>
            <text class="tip-text">管理员可以管理成员权限和设置</text>
          </view>
          <view class="tip-item">
            <text class="tip-icon">💡</text>
            <text class="tip-text">家庭码请勿泄露给陌生人</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <view class="code-modal" v-if="showCodeModal" @tap="closeCodeModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">家庭码邀请</text>
          <image src="/static/icons/close.png" class="close-icon" @tap="closeCodeModal" />
        </view>
        
        <view class="modal-body">
          <view class="code-display-large">
            <text class="code-large">{{ familyInfo.familyCode || familyInfo.family_code }}</text>
          </view>
          
          <view class="code-actions">
            <button class="action-btn primary" @tap="copyCode">
              <image src="/static/icons/copy.png" class="btn-icon" />
              <text>复制家庭码</text>
            </button>
            <button class="action-btn secondary" @tap="shareCode">
              <image src="/static/icons/share.png" class="btn-icon" />
              <text>分享</text>
            </button>
          </view>
          
          <view class="step-list">
            <view class="step-item">
              <text class="step-number">1</text>
              <text class="step-text">复制家庭码</text>
            </view>
            <view class="step-item">
              <text class="step-number">2</text>
              <text class="step-text">发送给家庭成员</text>
            </view>
            <view class="step-item">
              <text class="step-number">3</text>
              <text class="step-text">成员输入家庭码加入</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <view class="qrcode-modal" v-if="showQRCodeModal" @tap="closeQRCodeModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">二维码邀请</text>
          <image src="/static/icons/close.png" class="close-icon" @tap="closeQRCodeModal" />
        </view>
        
        <view class="modal-body">
          <view class="qrcode-container">
            <image :src="qrCodeUrl" class="qrcode-img" mode="aspectFit" />
            <text class="qrcode-tip">扫描二维码加入家庭</text>
          </view>
          
          <view class="qrcode-actions">
            <button class="action-btn primary" @tap="saveQRCode">
              <image src="/static/icons/save.png" class="btn-icon" />
              <text>保存图片</text>
            </button>
            <button class="action-btn secondary" @tap="shareQRCode">
              <image src="/static/icons/share.png" class="btn-icon" />
              <text>分享</text>
            </button>
          </view>
        </view>
      </view>
    </view>
    
    <view class="link-modal" v-if="showLinkModal" @tap="closeLinkModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">链接邀请</text>
          <image src="/static/icons/close.png" class="close-icon" @tap="closeLinkModal" />
        </view>
        
        <view class="modal-body">
          <view class="link-display">
            <text class="link-text">{{ inviteLink }}</text>
          </view>
          
          <view class="link-actions">
            <button class="action-btn primary" @tap="copyLink">
              <image src="/static/icons/copy.png" class="btn-icon" />
              <text>复制链接</text>
            </button>
            <button class="action-btn secondary" @tap="shareLink">
              <image src="/static/icons/share.png" class="btn-icon" />
              <text>分享</text>
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'AddMemberPage',
  
  data() {
    return {
      familyInfo: {
        name: '',
        familyCode: '',
        id: ''
      },
      memberCount: 0,
      showCodeModal: false,
      showQRCodeModal: false,
      showLinkModal: false,
      qrCodeUrl: '',
      inviteLink: ''
    }
  },
  
  onLoad(options) {
    this.loadFamilyInfo()
  },
  
  methods: {
    async loadFamilyInfo() {
      try {
        const userInfo = uni.getStorageSync('userInfo')
        const familyId = userInfo?.familyId
        
        if (!familyId) {
          uni.showToast({
            title: '请先加入家庭',
            icon: 'none'
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
          return
        }
        
        const response = await this.$api.family.getInfo(familyId)
        
        if (response.code === 200) {
          this.familyInfo = response.data
          this.loadMemberCount()
          this.generateInviteLink()
        } else {
          uni.showToast({
            title: response.message || '加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('加载家庭信息失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    },
    
    async loadMemberCount() {
      try {
        const response = await this.$api.family.getMembers(this.familyInfo.id)
        
        if (response.code === 200) {
          this.memberCount = response.data?.length || 0
        }
      } catch (error) {
        console.error('加载成员数量失败:', error)
      }
    },
    
    generateInviteLink() {
      const baseUrl = 'https://your-domain.com'
      this.inviteLink = `${baseUrl}/invite?code=${this.familyInfo.familyCode || this.familyInfo.family_code}`
    },
    
    goBack() {
      uni.navigateBack()
    },
    
    showCodeInvite() {
      this.showCodeModal = true
    },
    
    closeCodeModal() {
      this.showCodeModal = false
    },
    
    showQRCode() {
      this.generateQRCode()
      this.showQRCodeModal = true
    },
    
    closeQRCodeModal() {
      this.showQRCodeModal = false
    },
    
    showLinkInvite() {
      this.showLinkModal = true
    },
    
    closeLinkModal() {
      this.showLinkModal = false
    },
    
    showWechatInvite() {
      uni.showShareMenu({
        withShareTicket: true,
        success: () => {
          console.log('分享成功')
        },
        fail: (err) => {
          console.error('分享失败:', err)
          uni.showToast({
            title: '分享失败',
            icon: 'none'
          })
        }
      })
    },
    
    copyCode() {
      const code = this.familyInfo.familyCode || this.familyInfo.family_code
      uni.setClipboardData({
        data: code,
        success: () => {
          uni.showToast({
            title: '复制成功',
            icon: 'success'
          })
        }
      })
    },
    
    shareCode() {
      const code = this.familyInfo.familyCode || this.familyInfo.family_code
      uni.share({
        provider: 'weixin',
        scene: 'WXSceneSession',
        type: 0,
        summary: `邀请你加入【${this.familyInfo.name}】，家庭码：${code}`,
        success: () => {
          uni.showToast({
            title: '分享成功',
            icon: 'success'
          })
        },
        fail: (err) => {
          console.error('分享失败:', err)
          uni.showToast({
            title: '分享失败',
            icon: 'none'
          })
        }
      })
    },
    
    generateQRCode() {
      this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(this.inviteLink)}`
    },
    
    saveQRCode() {
      uni.showLoading({ title: '保存中...' })
      
      uni.downloadFile({
        url: this.qrCodeUrl,
        success: (res) => {
          if (res.statusCode === 200) {
            uni.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                uni.hideLoading()
                uni.showToast({
                  title: '保存成功',
                  icon: 'success'
                })
              },
              fail: () => {
                uni.hideLoading()
                uni.showToast({
                  title: '保存失败',
                  icon: 'none'
                })
              }
            })
          }
        },
        fail: () => {
          uni.hideLoading()
          uni.showToast({
            title: '下载失败',
            icon: 'none'
          })
        }
      })
    },
    
    shareQRCode() {
      uni.showShareMenu({
        withShareTicket: true,
        success: () => {
          console.log('分享成功')
        },
        fail: (err) => {
          console.error('分享失败:', err)
          uni.showToast({
            title: '分享失败',
            icon: 'none'
          })
        }
      })
    },
    
    copyLink() {
      uni.setClipboardData({
        data: this.inviteLink,
        success: () => {
          uni.showToast({
            title: '复制成功',
            icon: 'success'
          })
        }
      })
    },
    
    shareLink() {
      uni.share({
        provider: 'weixin',
        scene: 'WXSceneSession',
        type: 0,
        href: this.inviteLink,
        title: `邀请你加入【${this.familyInfo.name}】`,
        summary: '点击链接加入家庭',
        success: () => {
          uni.showToast({
            title: '分享成功',
            icon: 'success'
          })
        },
        fail: (err) => {
          console.error('分享失败:', err)
          uni.showToast({
            title: '分享失败',
            icon: 'none'
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.add-member-page {
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
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
  padding: 20rpx 24rpx;
}

.invite-ways-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.section-title {
  margin-bottom: 24rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.title-desc {
  font-size: 26rpx;
  color: #999;
  display: block;
}

.invite-ways {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.invite-way {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.invite-way:active {
  border-color: #07c160;
  background: rgba(7, 193, 96, 0.05);
}

.way-icon {
  width: 80rpx;
  height: 80rpx;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.icon-text {
  font-size: 40rpx;
}

.way-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.way-desc {
  font-size: 22rpx;
  color: #999;
  text-align: center;
}

.family-info-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.info-card {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 24rpx;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #e8e8e8;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #666;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.code-display {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.code-text {
  font-size: 32rpx;
  color: #07c160;
  font-weight: 600;
  letter-spacing: 4rpx;
}

.copy-btn {
  padding: 8rpx 20rpx;
  background: #07c160;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.tips-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
}

.tip-icon {
  font-size: 32rpx;
}

.tip-text {
  flex: 1;
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

.code-modal,
.qrcode-modal,
.link-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  width: 600rpx;
  background: white;
  border-radius: 24rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.close-icon {
  width: 40rpx;
  height: 40rpx;
}

.modal-body {
  padding: 32rpx;
}

.code-display-large {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 48rpx 32rpx;
  text-align: center;
  margin-bottom: 32rpx;
}

.code-large {
  font-size: 56rpx;
  color: #07c160;
  font-weight: 600;
  letter-spacing: 8rpx;
  display: block;
}

.code-actions {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  border: none;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  font-size: 28rpx;
}

.action-btn.primary {
  background: linear-gradient(135deg, #07c160, #059e4a);
  color: white;
}

.action-btn.secondary {
  background: #f5f7fa;
  color: #666;
}

.btn-icon {
  width: 32rpx;
  height: 32rpx;
}

.step-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.step-number {
  width: 48rpx;
  height: 48rpx;
  background: #07c160;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 600;
}

.step-text {
  flex: 1;
  font-size: 26rpx;
  color: #666;
}

.qrcode-container {
  text-align: center;
  margin-bottom: 32rpx;
}

.qrcode-img {
  width: 400rpx;
  height: 400rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.qrcode-tip {
  font-size: 26rpx;
  color: #999;
  margin-top: 16rpx;
  display: block;
}

.qrcode-actions {
  display: flex;
  gap: 16rpx;
}

.link-display {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
}

.link-text {
  font-size: 24rpx;
  color: #666;
  word-break: break-all;
  display: block;
}

.link-actions {
  display: flex;
  gap: 16rpx;
}
</style>