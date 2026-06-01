<template>
  <view class="feedback-page">
    <view class="page-header">
      <view class="header-left" @tap="goBack">
        <image src="/static/icons/arrow-left.png" class="back-icon" />
      </view>
      <text class="page-title">意见反馈</text>
      <view class="header-right"></view>
    </view>
    
    <scroll-view class="page-content" scroll-y>
      <!-- 反馈类型 -->
      <view class="feedback-section">
        <view class="section-title">
          <text class="title-text">反馈类型</text>
        </view>
        
        <view class="type-grid">
          <view 
            class="type-item" 
            :class="{ active: feedbackType === 'bug' }"
            @tap="setFeedbackType('bug')"
          >
            <text class="type-icon">🐛</text>
            <text class="type-name">功能异常</text>
          </view>
          
          <view 
            class="type-item" 
            :class="{ active: feedbackType === 'suggestion' }"
            @tap="setFeedbackType('suggestion')"
          >
            <text class="type-icon">💡</text>
            <text class="type-name">功能建议</text>
          </view>
          
          <view 
            class="type-item" 
            :class="{ active: feedbackType === 'experience' }"
            @tap="setFeedbackType('experience')"
          >
            <text class="type-icon">😊</text>
            <text class="type-name">使用体验</text>
          </view>
          
          <view 
            class="type-item" 
            :class="{ active: feedbackType === 'other' }"
            @tap="setFeedbackType('other')"
          >
            <text class="type-icon">📝</text>
            <text class="type-name">其他问题</text>
          </view>
        </view>
      </view>
      
      <!-- 反馈内容 -->
      <view class="feedback-section">
        <view class="section-title">
          <text class="title-text">反馈内容</text>
          <text class="title-desc">请详细描述您的问题或建议</text>
        </view>
        
        <view class="content-input">
          <textarea 
            class="textarea"
            v-model="feedbackContent"
            placeholder="请输入您的反馈内容..."
            :maxlength="500"
            @input="onContentInput"
          />
          <view class="input-footer">
            <text class="char-count">{{ contentLength }}/500</text>
          </view>
        </view>
      </view>
      
      <!-- 图片上传 -->
      <view class="feedback-section">
        <view class="section-title">
          <text class="title-text">上传图片</text>
          <text class="title-desc">可选，最多上传3张图片</text>
        </view>
        
        <view class="image-upload">
          <view 
            class="upload-item" 
            v-for="(image, index) in uploadedImages" 
            :key="index"
          >
            <image :src="image" class="uploaded-img" mode="aspectFill" />
            <view class="delete-btn" @tap="deleteImage(index)">
              <image src="/static/icons/close.png" class="delete-icon" />
            </view>
          </view>
          
          <view 
            class="upload-item add" 
            v-if="uploadedImages.length < 3"
            @tap="chooseImage"
          >
            <text class="add-icon">+</text>
            <text class="add-text">添加图片</text>
          </view>
        </view>
      </view>
      
      <!-- 联系方式 -->
      <view class="feedback-section">
        <view class="section-title">
          <text class="title-text">联系方式</text>
          <text class="title-desc">方便我们及时回复您</text>
        </view>
        
        <view class="contact-input">
          <view class="input-group">
            <text class="input-label">手机号</text>
            <input 
              class="input-field"
              v-model="phoneNumber"
              type="number"
              placeholder="请输入手机号"
              maxlength="11"
            />
          </view>
          
          <view class="input-group">
            <text class="input-label">邮箱（选填）</text>
            <input 
              class="input-field"
              v-model="email"
              type="text"
              placeholder="请输入邮箱地址"
            />
          </view>
        </view>
      </view>
      
      <!-- 常见问题 -->
      <view class="feedback-section">
        <view class="section-title">
          <text class="title-text">常见问题</text>
          <text class="title-desc">查看是否有您关心的问题</text>
        </view>
        
        <view class="faq-list">
          <view 
            class="faq-item" 
            v-for="(faq, index) in faqList" 
            :key="index"
            @tap="toggleFaq(index)"
          >
            <view class="faq-question">
              <text class="question-text">{{ faq.question }}</text>
              <image 
                :src="faq.expanded ? '/static/icons/arrow-up.png' : '/static/icons/arrow-down.png'" 
                class="arrow-icon" 
              />
            </view>
            
            <view class="faq-answer" v-if="faq.expanded">
              <text class="answer-text">{{ faq.answer }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 联系客服 -->
      <view class="feedback-section">
        <view class="section-title">
          <text class="title-text">联系客服</text>
          <text class="title-desc">需要帮助？直接联系我们</text>
        </view>
        
        <view class="contact-ways">
          <view class="contact-way" @tap="contactWechat">
            <view class="way-icon">
              <text class="icon-text">💬</text>
            </view>
            <text class="way-name">微信客服</text>
            <text class="way-desc">在线客服</text>
          </view>
          
          <view class="contact-way" @tap="contactPhone">
            <view class="way-icon">
              <text class="icon-text">📞</text>
            </view>
            <text class="way-name">电话客服</text>
            <text class="way-desc">400-xxx-xxxx</text>
          </view>
          
          <view class="contact-way" @tap="contactEmail">
            <view class="way-icon">
              <text class="icon-text">📧</text>
            </view>
            <text class="way-name">邮箱客服</text>
            <text class="way-desc">support@example.com</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <view class="page-footer">
      <button 
        class="submit-btn" 
        :class="{ disabled: !canSubmit }"
        @tap="handleSubmit"
      >
        <text>提交反馈</text>
      </button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'FeedbackPage',
  
  data() {
    return {
      feedbackType: 'bug',
      feedbackContent: '',
      contentLength: 0,
      uploadedImages: [],
      phoneNumber: '',
      email: '',
      faqList: [
        {
          question: '如何添加家庭成员？',
          answer: '在"我的"页面点击"家庭管理"，然后点击"邀请成员"，选择邀请方式（家庭码/二维码/链接/微信）即可邀请成员加入。',
          expanded: false
        },
        {
          question: '食材过期提醒如何设置？',
          answer: '在"我的"页面点击"系统设置"，然后点击"通知设置"，可以设置过期提醒的提前天数和提醒时间。',
          expanded: false
        },
        {
          question: '如何生成采购清单？',
          answer: '在"采购"页面点击"AI生成"按钮，系统会根据您的库存和消耗习惯智能生成采购清单。您也可以手动添加采购项。',
          expanded: false
        },
        {
          question: '数据报告如何导出？',
          answer: '在"我的"页面点击"消耗报告"，选择时间范围后，点击"导出报告"按钮，可以选择导出为图片或PDF格式。',
          expanded: false
        }
      ]
    }
  },
  
  computed: {
    canSubmit() {
      return this.feedbackContent.trim().length > 0 && 
             (this.phoneNumber.trim().length === 11 || this.email.trim().length > 0)
    }
  },
  
  onLoad() {
    this.loadUserInfo()
  },
  
  methods: {
    loadUserInfo() {
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.phoneNumber = userInfo.phone || ''
        this.email = userInfo.email || ''
      }
    },
    
    setFeedbackType(type) {
      this.feedbackType = type
    },
    
    onContentInput(e) {
      this.contentLength = e.detail.value.length
    },
    
    chooseImage() {
      uni.chooseImage({
        count: 3 - this.uploadedImages.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePaths = res.tempFilePaths
          
          tempFilePaths.forEach(filePath => {
            uni.uploadFile({
              url: this.$api.baseURL + '/api/upload/image',
              filePath: filePath,
              name: 'file',
              header: {
                'Authorization': 'Bearer ' + uni.getStorageSync('token')
              },
              success: (uploadRes) => {
                const data = JSON.parse(uploadRes.data)
                if (data.code === 200) {
                  this.uploadedImages.push(data.data.url)
                } else {
                  uni.showToast({
                    title: '上传失败',
                    icon: 'none'
                  })
                }
              },
              fail: () => {
                uni.showToast({
                  title: '上传失败',
                  icon: 'none'
                })
              }
            })
          })
        }
      })
    },
    
    deleteImage(index) {
      this.uploadedImages.splice(index, 1)
    },
    
    toggleFaq(index) {
      this.faqList[index].expanded = !this.faqList[index].expanded
    },
    
    contactWechat() {
      uni.showModal({
        title: '微信客服',
        content: '微信号：family_food_support\n\n请添加客服微信，我们将尽快为您解答问题。',
        showCancel: false
      })
    },
    
    contactPhone() {
      uni.makePhoneCall({
        phoneNumber: '400-xxx-xxxx'
      })
    },
    
    contactEmail() {
      uni.setClipboardData({
        data: 'support@example.com',
        success: () => {
          uni.showToast({
            title: '邮箱已复制',
            icon: 'success'
          })
        }
      })
    },
    
    async handleSubmit() {
      if (!this.canSubmit) {
        uni.showToast({
          title: '请完善反馈信息',
          icon: 'none'
        })
        return
      }
      
      uni.showLoading({ title: '提交中...' })
      
      try {
        const response = await this.$api.user.submitFeedback({
          type: this.feedbackType,
          content: this.feedbackContent,
          images: this.uploadedImages,
          phone: this.phoneNumber,
          email: this.email
        })
        
        if (response.code === 200) {
          uni.hideLoading()
          
          uni.showModal({
            title: '提交成功',
            content: '感谢您的反馈！我们会尽快处理您的问题。',
            showCancel: false,
            success: () => {
              uni.navigateBack()
            }
          })
        } else {
          uni.hideLoading()
          uni.showToast({
            title: response.message || '提交失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('提交反馈失败:', error)
        uni.showToast({
          title: '提交失败',
          icon: 'none'
        })
      }
    },
    
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.feedback-page {
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background: white;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.header-left {
  padding: 12rpx;
}

.back-icon {
  width: 40rpx;
  height: 40rpx;
}

.page-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.header-right {
  width: 64rpx;
}

.page-content {
  padding: 20rpx 24rpx;
  padding-bottom: 120rpx;
}

.feedback-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.section-title {
  margin-bottom: 20rpx;
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
  display: block;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.type-item {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.type-item.active {
  background: rgba(7, 193, 96, 0.1);
  border-color: #07c160;
}

.type-icon {
  font-size: 48rpx;
}

.type-name {
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}

.type-item.active .type-name {
  color: #07c160;
}

.content-input {
  background: #f8f9fa;
  border-radius: 12rpx;
  overflow: hidden;
}

.textarea {
  width: 100%;
  height: 300rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #333;
  background: transparent;
  border: none;
  resize: none;
}

.input-footer {
  display: flex;
  justify-content: flex-end;
  padding: 12rpx 20rpx;
}

.char-count {
  font-size: 24rpx;
  color: #999;
}

.image-upload {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.upload-item {
  position: relative;
  aspect-ratio: 1;
  background: #f8f9fa;
  border-radius: 12rpx;
  overflow: hidden;
}

.upload-item.add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  border: 2rpx dashed #d9d9d9;
}

.uploaded-img {
  width: 100%;
  height: 100%;
}

.delete-btn {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 48rpx;
  height: 48rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-icon {
  width: 24rpx;
  height: 24rpx;
}

.add-icon {
  font-size: 48rpx;
  color: #999;
}

.add-text {
  font-size: 24rpx;
  color: #999;
}

.contact-input {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.input-label {
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}

.input-field {
  height: 80rpx;
  padding: 0 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  border: none;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.faq-item {
  background: #f8f9fa;
  border-radius: 12rpx;
  overflow: hidden;
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
}

.question-text {
  flex: 1;
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  margin-right: 16rpx;
}

.arrow-icon {
  width: 24rpx;
  height: 24rpx;
  transition: transform 0.3s ease;
}

.faq-answer {
  padding: 0 20rpx 20rpx;
  background: white;
  border-top: 1rpx solid #f0f0f0;
}

.answer-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  display: block;
}

.contact-ways {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.contact-way {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.contact-way:active {
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
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.way-desc {
  font-size: 22rpx;
  color: #999;
  text-align: center;
}

.page-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 24rpx;
  background: white;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #07c160, #059e4a);
  color: white;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
}

.submit-btn.disabled {
  background: #d9d9d9;
  color: #999;
}
</style>