<template>
  <view class="ai-chat-page">
    <view class="chat-header">
      <view class="header-left" @tap="goBack">
        <image src="/static/icons/arrow-left.png" class="back-icon" />
      </view>
      <view class="header-center">
        <image src="/static/icons/ai.png" class="ai-avatar" />
        <view class="ai-info">
          <text class="ai-name">AI小助手</text>
          <text class="ai-status">在线</text>
        </view>
      </view>
      <view class="header-right" @tap="showMenu">
        <image src="/static/icons/more.png" class="more-icon" />
      </view>
    </view>
    
    <scroll-view 
      class="chat-content" 
      scroll-y 
      :scroll-into-view="scrollToView"
      :scroll-with-animation="true"
    >
      <view class="chat-list">
        <view 
          class="chat-item" 
          v-for="(message, index) in messages" 
          :key="index"
          :class="message.role"
          :id="'message-' + index"
        >
          <image 
            :src="message.role === 'user' ? userAvatar : aiAvatar" 
            class="message-avatar"
          />
          <view class="message-content">
            <view class="message-bubble">
              <text class="message-text">{{ message.content }}</text>
            </view>
            <text class="message-time">{{ formatTime(message.timestamp) }}</text>
          </view>
        </view>
      </view>
      
      <view class="chat-tips" v-if="messages.length === 0">
        <view class="tip-card" @tap="sendQuickMessage('今天能做什么菜？')">
          <text class="tip-icon">🍳</text>
          <text class="tip-text">今天能做什么菜？</text>
        </view>
        <view class="tip-card" @tap="sendQuickMessage('快过期的食材有哪些？')">
          <text class="tip-icon">⚠️</text>
          <text class="tip-text">快过期的食材有哪些？</text>
        </view>
        <view class="tip-card" @tap="sendQuickMessage('帮我生成采购清单')">
          <text class="tip-icon">🛒</text>
          <text class="tip-text">帮我生成采购清单</text>
        </view>
        <view class="tip-card" @tap="sendQuickMessage('记录我今天吃了番茄炒蛋')">
          <text class="tip-icon">📝</text>
          <text class="tip-text">记录我今天吃了番茄炒蛋</text>
        </view>
      </view>
    </scroll-view>
    
    <view class="chat-input-area">
      <view class="input-wrapper">
        <button class="action-btn" @tap="handleVoiceInput">
          <image src="/static/icons/microphone.png" class="btn-icon" />
        </button>
        
        <input 
          class="chat-input" 
          v-model="inputText" 
          placeholder="输入您的问题..."
          @confirm="sendMessage"
          :focus="inputFocus"
        />
        
        <button class="action-btn" @tap="handleImageInput">
          <image src="/static/icons/camera.png" class="btn-icon" />
        </button>
        
        <button 
          class="send-btn" 
          :class="{ disabled: !inputText.trim() }"
          @tap="sendMessage"
        >
          <image src="/static/icons/send.png" class="send-icon" />
        </button>
      </view>
    </view>
    
    <view class="voice-modal" v-if="showVoiceModal" @tap="closeVoiceModal">
      <view class="voice-content" @tap.stop>
        <view class="voice-animation">
          <view class="wave wave-1"></view>
          <view class="wave wave-2"></view>
          <view class="wave wave-3"></view>
        </view>
        <text class="voice-tip">正在录音...</text>
        <button class="voice-cancel-btn" @tap="cancelVoice">取消</button>
      </view>
    </view>
  </view>
</template>

<script>
import { requireLogin } from '@/utils/pageGuard'

export default {
  name: 'AIChatPage',
  
  data() {
    return {
      messages: [],
      inputText: '',
      inputFocus: false,
      scrollToView: '',
      showVoiceModal: false,
      isRecording: false,
      userAvatar: '/static/images/default-avatar.png',
      aiAvatar: '/static/icons/ai.png'
    }
  },
  
  onLoad(options) {
    if (!requireLogin()) {
      return
    }
    
    if (options.initialMessage) {
      this.inputText = decodeURIComponent(options.initialMessage)
    }
    
    this.loadChatHistory()
    this.addWelcomeMessage()
  },
  
  onShow() {
    if (!requireLogin()) {
      return
    }
    
    this.scrollToBottom()
  },
  
  methods: {
    loadChatHistory() {
      const history = uni.getStorageSync('aiChatHistory') || []
      this.messages = history
    },
    
    saveChatHistory() {
      uni.setStorageSync('aiChatHistory', this.messages)
    },
    
    addWelcomeMessage() {
      if (this.messages.length === 0) {
        this.messages.push({
          role: 'assistant',
          content: '您好！我是AI小助手，可以帮您：\n• 查询库存\n• 推荐菜谱\n• 记录用餐\n• 生成采购清单\n• 查询预警',
          timestamp: new Date().getTime()
        })
      }
    },
    
    goBack() {
      uni.navigateBack()
    },
    
    showMenu() {
      uni.showActionSheet({
        itemList: ['清空对话', '导出对话'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.clearChat()
          } else if (res.tapIndex === 1) {
            this.exportChat()
          }
        }
      })
    },
    
    clearChat() {
      uni.showModal({
        title: '确认清空',
        content: '确定要清空所有对话记录吗？',
        success: (res) => {
          if (res.confirm) {
            this.messages = []
            this.saveChatHistory()
            this.addWelcomeMessage()
            uni.showToast({
              title: '已清空',
              icon: 'success'
            })
          }
        }
      })
    },
    
    exportChat() {
      if (this.messages.length === 0) {
        uni.showToast({
          title: '暂无对话记录',
          icon: 'none'
        })
        return
      }
      
      let content = 'AI对话记录\n\n'
      this.messages.forEach(msg => {
        const role = msg.role === 'user' ? '我' : 'AI助手'
        const time = this.formatTime(msg.timestamp)
        content += `[${time}] ${role}:\n${msg.content}\n\n`
      })
      
      uni.setClipboardData({
        data: content,
        success: () => {
          uni.showToast({
            title: '已复制到剪贴板',
            icon: 'success'
          })
        }
      })
    },
    
    sendQuickMessage(text) {
      this.inputText = text
      this.sendMessage()
    },
    
    async sendMessage() {
      const text = this.inputText.trim()
      if (!text) return
      
      this.addUserMessage(text)
      this.inputText = ''
      
      try {
        const response = await this.$api.ai.llmChat.send({
          message: text,
          history: this.messages.slice(-10)
        })
        
        if (response.code === 200) {
          this.addAssistantMessage(response.data.response)
        } else {
          this.addAssistantMessage('抱歉，我暂时无法回答这个问题，请稍后再试。')
        }
      } catch (error) {
        console.error('AI对话失败:', error)
        this.addAssistantMessage('网络错误，请检查网络连接后重试。')
      }
    },
    
    addUserMessage(content) {
      this.messages.push({
        role: 'user',
        content: content,
        timestamp: new Date().getTime()
      })
      this.saveChatHistory()
      this.scrollToBottom()
    },
    
    addAssistantMessage(content) {
      this.messages.push({
        role: 'assistant',
        content: content,
        timestamp: new Date().getTime()
      })
      this.saveChatHistory()
      this.scrollToBottom()
    },
    
    handleVoiceInput() {
      this.showVoiceModal = true
      this.isRecording = true
      
      setTimeout(() => {
        this.startVoiceRecognition()
      }, 500)
    },
    
    startVoiceRecognition() {
      uni.startRecord({
        success: () => {
          console.log('开始录音')
        },
        fail: (err) => {
          console.error('录音失败:', err)
          this.closeVoiceModal()
          uni.showToast({
            title: '录音失败',
            icon: 'none'
          })
        }
      })
    },
    
    stopVoiceRecognition() {
      uni.stopRecord({
        success: (res) => {
          const tempFilePath = res.tempFilePath
          this.uploadVoiceFile(tempFilePath)
        },
        fail: (err) => {
          console.error('停止录音失败:', err)
        }
      })
    },
    
    async uploadVoiceFile(filePath) {
      uni.showLoading({ title: '识别中...' })
      
      try {
        const uploadRes = await uni.uploadFile({
          url: this.$api.baseURL + '/api/ai/voice',
          filePath: filePath,
          name: 'voice',
          header: {
            'Authorization': 'Bearer ' + uni.getStorageSync('token')
          }
        })
        
        const data = JSON.parse(uploadRes.data)
        
        if (data.code === 200) {
          this.inputText = data.data.text
          this.sendMessage()
        } else {
          uni.showToast({
            title: '识别失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('语音识别失败:', error)
        uni.showToast({
          title: '识别失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    cancelVoice() {
      if (this.isRecording) {
        uni.stopRecord()
      }
      this.closeVoiceModal()
    },
    
    closeVoiceModal() {
      this.showVoiceModal = false
      this.isRecording = false
    },
    
    handleImageInput() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          const filePath = res.tempFilePaths[0]
          this.uploadImageFile(filePath)
        }
      })
    },
    
    async uploadImageFile(filePath) {
      uni.showLoading({ title: '上传中...' })
      
      try {
        const uploadRes = await uni.uploadFile({
          url: this.$api.baseURL + '/api/ai/image',
          filePath: filePath,
          name: 'image',
          header: {
            'Authorization': 'Bearer ' + uni.getStorageSync('token')
          }
        })
        
        const data = JSON.parse(uploadRes.data)
        
        if (data.code === 200) {
          this.inputText = data.data.description
          uni.showToast({
            title: '识别成功',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: '识别失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('图片识别失败:', error)
        uni.showToast({
          title: '识别失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    formatTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) {
        return '刚刚'
      } else if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`
      } else if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`
      } else {
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
      }
    },
    
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.messages.length > 0) {
          this.scrollToView = 'message-' + (this.messages.length - 1)
        }
      })
    }
  }
}
</script>
<style scoped>
.ai-chat-page {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(180deg, #f8f9fc 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}

.chat-header {
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

.header-left {
  padding: 12rpx;
  flex-shrink: 0;
}

.back-icon {
  width: 40rpx;
  height: 40rpx;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
  justify-content: center;
}

.ai-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(7, 193, 96, 0.2);
  flex-shrink: 0;
}

.ai-info {
  display: flex;
  flex-direction: column;
}

.ai-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.ai-status {
  font-size: 22rpx;
  color: #07c160;
  margin-top: 4rpx;
}

.header-right {
  padding: 12rpx;
  flex-shrink: 0;
}

.more-icon {
  width: 40rpx;
  height: 40rpx;
}

.chat-content {
  flex: 1;
  padding: 24rpx;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  width: 100%;
}

.chat-item {
  display: flex;
  gap: 20rpx;
  align-items: flex-start;
  width: 100%;
}

.chat-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.message-content {
  max-width: 75%;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex: 1;
}

.message-bubble {
  padding: 24rpx 28rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  word-wrap: break-word;
  word-break: break-all;
}

.chat-item.assistant .message-bubble {
  background: white;
  border-radius: 20rpx 20rpx 20rpx 4rpx;
}

.chat-item.user .message-bubble {
  background: linear-gradient(135deg, #07c160 0%, #059e4a 100%);
  border-radius: 20rpx 20rpx 4rpx 20rpx;
}

.message-text {
  font-size: 30rpx;
  color: #333;
  line-height: 1.7;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
}

.chat-item.user .message-text {
  color: white;
}

.message-time {
  font-size: 22rpx;
  color: #999;
  text-align: right;
  margin-top: 4rpx;
}

.chat-item.user .message-time {
  text-align: left;
}

.chat-tips {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-top: 60rpx;
  padding: 0 20rpx;
  width: 100%;
  box-sizing: border-box;
}

.tip-card {
  background: white;
  border-radius: 20rpx;
  padding: 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.tip-card:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.tip-icon {
  font-size: 56rpx;
}

.tip-text {
  font-size: 26rpx;
  color: #333;
  text-align: center;
  font-weight: 500;
  word-wrap: break-word;
  word-break: break-all;
}

.chat-input-area {
  background: white;
  padding: 24rpx;
  padding-bottom: 40rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
  width: 100%;
  box-sizing: border-box;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 16rpx;
  width: 100%;
}

.action-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #f8f9fc;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.action-btn:active {
  transform: scale(0.95);
  background: #e8ecf0;
}

.btn-icon {
  width: 36rpx;
  height: 36rpx;
}

.chat-input {
  flex: 1;
  height: 72rpx;
  padding: 0 28rpx;
  background: #f8f9fc;
  border-radius: 36rpx;
  font-size: 30rpx;
  color: #333;
  box-sizing: border-box;
}

.send-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #07c160 0%, #059e4a 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4rpx 12rpx rgba(7, 193, 96, 0.3);
  transition: all 0.3s ease;
}

.send-btn:active {
  transform: scale(0.95);
}

.send-btn.disabled {
  background: #d9d9d9;
  box-shadow: none;
}

.send-icon {
  width: 36rpx;
  height: 36rpx;
}

.voice-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8rpx);
  width: 100vw;
  height: 100vh;
}

.voice-content {
  width: 520rpx;
  max-width: 90%;
  background: white;
  border-radius: 32rpx;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
}

.voice-animation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  height: 140rpx;
}

.wave {
  width: 20rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #07c160, #059e4a);
  border-radius: 10rpx;
  animation: wave 1s ease-in-out infinite;
}

.wave-1 {
  animation-delay: 0s;
}

.wave-2 {
  animation-delay: 0.2s;
}

.wave-3 {
  animation-delay: 0.4s;
}

@keyframes wave {
  0%, 100% {
    height: 60rpx;
  }
  50% {
    height: 140rpx;
  }
}

.voice-tip {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.voice-cancel-btn {
  width: 220rpx;
  height: 80rpx;
  background: #f8f9fc;
  color: #666;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
  font-weight: 500;
}
</style>