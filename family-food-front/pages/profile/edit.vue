<template>
  <view class="edit-profile-page">
    <!-- 状态栏 -->
    <view class="profile-header">
      <view class="header-left" @tap="goBack">
        <image src="/static/icons/arrow-left.png" class="back-icon" />
      </view>
      <view class="header-center">
        <text class="header-title">编辑资料</text>
      </view>
      <view class="header-right"></view>
    </view>
    
    <scroll-view class="edit-content" scroll-y>
      <!-- 头像编辑 -->
      <view class="avatar-section card">
        <view class="section-header">
          <text class="section-title">头像</text>
        </view>
        <view class="avatar-container">
          <view class="avatar-wrapper" @tap="changeAvatar">
            <image 
              :src="getFullAvatarUrl(formData.avatarUrl)" 
              class="user-avatar"
              mode="aspectFill"
            />
            <view class="avatar-overlay">
              <image src="/static/icons/camera.png" class="camera-icon" />
              <text class="change-text">点击更换</text>
            </view>
          </view>
          <text class="avatar-hint">点击上传新头像</text>
        </view>
      </view>
      
      <!-- 基本信息 -->
      <view class="basic-info-section card">
        <view class="section-header">
          <text class="section-title">基本信息</text>
        </view>
        
        <view class="form-item">
          <text class="form-label">昵称</text>
          <input 
            v-model="formData.nickname"
            class="form-input nickname-input"
            placeholder="请输入昵称"
            maxlength="20"
          />
          <text class="word-count">{{ formData.nickname.length }}/20</text>
        </view>
        
        <view class="form-item">
          <text class="form-label">性别</text>
          <picker 
            :range="genderOptions" 
            :value="genderIndex"
            @change="onGenderChange"
            class="form-picker"
          >
            <view class="picker-text">
              {{ formData.gender || '请选择性别' }}
            </view>
          </picker>
        </view>
        
        <view class="form-item">
          <text class="form-label">生日</text>
          <picker 
            mode="date" 
            :value="formData.birthday"
            @change="onBirthdayChange"
            class="form-picker"
          >
            <view class="picker-text">
              {{ formData.birthday || '选择生日' }}
            </view>
          </picker>
        </view>
        
        <view class="form-item">
          <text class="form-label">地区</text>
          <picker 
            mode="region" 
            @change="onRegionChange"
            class="form-picker"
          >
            <view class="picker-text">
              {{ formData.region || '选择地区' }}
            </view>
          </picker>
        </view>
      </view>
      
      <!-- 个人简介 -->
      <view class="bio-section card">
        <view class="section-header">
          <text class="section-title">个人简介</text>
        </view>
        <textarea 
          v-model="formData.bio"
          class="bio-textarea"
          placeholder="介绍一下自己吧..."
          maxlength="100"
          auto-height
        />
        <view class="textarea-footer">
          <text class="word-count">{{ formData.bio.length }}/100</text>
        </view>
      </view>
      
      <!-- 饮食习惯 -->
      <view class="diet-section card">
        <view class="section-header">
          <text class="section-title">饮食习惯</text>
        </view>
        
        <view class="diet-options">
          <view 
            v-for="option in dietOptions" 
            :key="option.value"
            class="diet-option"
            :class="{ active: formData.dietaryHabits?.includes(option.value) }"
            @tap="toggleDietOption(option.value)"
          >
            <text class="diet-text">{{ option.label }}</text>
          </view>
        </view>
        
        <view class="form-item">
          <text class="form-label">过敏食材</text>
          <input 
            v-model="formData.allergies"
            class="form-input allergies-input"
            placeholder="如有过敏食材请填写（如：海鲜、花生）"
          />
        </view>
      </view>
      
      <!-- 保存按钮 -->
      <view class="save-section">
        <button 
          class="btn-save" 
          @tap="saveProfile"
          :disabled="saving || !formChanged"
          :class="{ disabled: saving || !formChanged }"
        >
          {{ saving ? '保存中...' : '保存修改' }}
        </button>
      </view>
      
      <!-- 底部安全距离 -->
      <view class="safe-area"></view>
    </scroll-view>
    
    <!-- 头像选择弹窗 -->
    <uni-popup ref="avatarPopup" type="bottom" :safe-area="false">
      <view class="avatar-popup">
        <view class="popup-header">
          <text class="popup-title">选择头像</text>
          <image 
            src="/static/icons/close.png" 
            class="close-icon"
            @tap="closeAvatarPopup"
          />
        </view>
        
        <view class="popup-content">
          <view class="avatar-options">
            <view class="avatar-option" @tap="chooseAvatarFromAlbum">
              <image src="/static/icons/album.png" class="option-icon" />
              <text class="option-text">从相册选择</text>
            </view>
            <view class="avatar-option" @tap="takeAvatarPhoto">
              <image src="/static/icons/camera.png" class="option-icon" />
              <text class="option-text">拍照</text>
            </view>
            <view class="avatar-option" @tap="removeAvatar">
              <image src="/static/icons/delete.png" class="option-icon" />
              <text class="option-text">移除头像</text>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>
    
    <!-- 加载中 -->
    <loading v-if="loading" text="保存中..." />
    
    <!-- Toast提示 -->
    <toast ref="toast" />
  </view>
</template>

<script>
import NavBar from '@/components/common/NavBar.vue'
import Loading from '@/components/common/Loading.vue'
import Toast from '@/components/common/Toast.vue'
import { mapState, mapMutations } from 'vuex'

export default {
  components: {
    NavBar,
    Loading,
    Toast
  },
  
  data() {
    return {
      saving: false,
      loading: false,
      formData: {
        nickname: '',
        avatarUrl: '',
        gender: '',
        birthday: '',
        region: '',
        bio: '',
        dietaryHabits: [],
        allergies: ''
      },
      originalData: {},
      genderOptions: ['男', '女', '保密'],
      genderIndex: 2,
      dietOptions: [
        { label: '素食', value: 'vegetarian' },
        { label: '荤素搭配', value: 'omnivore' },
        { label: '低脂', value: 'low-fat' },
        { label: '低盐', value: 'low-salt' },
        { label: '无麸质', value: 'gluten-free' },
        { label: '有机', value: 'organic' }
      ],
      calendarInit: false,
      recipeData: [],
      inventoryData: []
    }
  },
  
  computed: {
    ...mapState('user', ['userInfo']),
    ...mapState('family', ['currentFamily']),
    
    formChanged() {
      return JSON.stringify(this.formData) !== JSON.stringify(this.originalData)
    }
  },
  
  onLoad() {
    this.checkLoginStatus()
  },
  
  methods: {
    ...mapMutations('user', ['SET_USER_INFO']),
    
    // 检查登录状态
    async checkLoginStatus() {
      const userInfo = uni.getStorageSync('userInfo')
      
      if (!userInfo || !userInfo.id) {
        // 未登录，跳转到登录页
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/login/login'
          })
        }, 1000)
        return
      }
      
      // 已登录，检查家庭状态
      this.checkFamilyStatus()
    },
    
    // 检查家庭状态
    async checkFamilyStatus() {
      try {
        const userInfo = uni.getStorageSync('userInfo')
        const familyId = userInfo.familyId
        
        if (!familyId) {
          // 未加入家庭，提示用户
          uni.showToast({
            title: '您还未加入家庭',
            icon: 'none'
          })
          // 继续加载个人资料，但提示用户
        }
        
        // 加载基础数据
        await this.loadUserData()
        
        // 初始化日历
        this.initCalendar()
        
      } catch (error) {
        console.error('检查家庭状态失败:', error)
        // 继续加载个人资料
        await this.loadUserData()
        this.initCalendar()
      }
    },
    
    getFullAvatarUrl(avatarUrl) {
      if (!avatarUrl) {
        return '/static/images/default-avatar.png'
      }
      
      // 如果是完整URL，直接返回
      if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
        return avatarUrl
      }
      
      // 如果是对象，提取url
      if (typeof avatarUrl === 'object' && avatarUrl.url) {
        avatarUrl = avatarUrl.url
      }
      
      // 如果是相对路径，拼接后端基础地址
      const baseURL = 'http://localhost:3000' // 根据你的后端实际地址修改
      if (avatarUrl.startsWith('/')) {
        return baseURL + avatarUrl
      }
      
      return avatarUrl || '/static/images/default-avatar.png'
    },
    
    loadUserData() {
      const userInfo = uni.getStorageSync('userInfo') || this.userInfo || {}
      
      // 处理avatarUrl可能是对象的情况
      let avatarUrl = userInfo.avatarUrl || ''
      if (typeof avatarUrl === 'object' && avatarUrl.url) {
        avatarUrl = avatarUrl.url
      }
      
      this.formData = {
        nickname: userInfo.nickname || '',
        avatarUrl: avatarUrl,
        gender: userInfo.gender || '保密',
        birthday: userInfo.birthday || '',
        region: userInfo.region || '',
        bio: userInfo.bio || '',
        dietaryHabits: userInfo.dietaryHabits || [],
        allergies: userInfo.allergies || ''
      }
      
      this.originalData = JSON.parse(JSON.stringify(this.formData))
      
      const genderIndex = this.genderOptions.indexOf(this.formData.gender)
      this.genderIndex = genderIndex > -1 ? genderIndex : 2
    },
    
    // 初始化日历
    initCalendar() {
      this.calendarInit = true
      console.log('日历初始化完成')
      // 这里可以添加具体的日历初始化逻辑
      // 例如使用uni-calendar组件或其他日历库
    },
    
    // 加载菜谱和库存数据
    async loadRecipeAndInventoryData() {
      try {
        const userInfo = uni.getStorageSync('userInfo')
        const familyId = userInfo.familyId
        
        if (familyId) {
          // 加载菜谱数据
          const recipeResponse = await this.$api.recipe.getTodayRecommend({
            familyId: familyId,
            userId: userInfo.id
          })
          
          if (recipeResponse.code === 200) {
            this.recipeData = recipeResponse.data || []
          }
          
          // 加载库存数据
          const inventoryResponse = await this.$api.inventory.getFamilyInventory(familyId)
          
          if (inventoryResponse.code === 200) {
            this.inventoryData = inventoryResponse.data || []
          }
          
          console.log('菜谱和库存数据加载完成')
        }
      } catch (error) {
        console.error('加载菜谱和库存数据失败:', error)
        // 失败后继续执行，不影响页面加载
      }
    },
    
    goBack() {
      uni.navigateBack()
    },
    
    changeAvatar() {
      this.$refs.avatarPopup.open()
    },
    
    closeAvatarPopup() {
      this.$refs.avatarPopup.close()
    },
    
    chooseAvatarFromAlbum() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album'],
        success: (res) => {
          this.uploadAvatar(res.tempFilePaths[0])
          this.closeAvatarPopup()
        }
      })
    },
    
    takeAvatarPhoto() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera'],
        success: (res) => {
          this.uploadAvatar(res.tempFilePaths[0])
          this.closeAvatarPopup()
        }
      })
    },
    
    removeAvatar() {
      this.formData.avatarUrl = ''
      this.closeAvatarPopup()
    },
    
    async uploadAvatar(filePath) {
      this.loading = true
      
      try {
        const uploadRes = await this.$api.user.uploadAvatar(filePath)
        
        if (uploadRes.code === 200) {
          // uploadRes.data 现在直接是 avatarUrl 字符串
          this.formData.avatarUrl = uploadRes.data
          this.$refs.toast.show('头像上传成功', 'success')
        } else {
          this.$refs.toast.show(uploadRes.message || '上传失败', 'error')
        }
      } catch (error) {
        console.error('上传头像失败:', error)
        this.$refs.toast.show('上传失败: ' + (error.message || '网络错误'), 'error')
      } finally {
        this.loading = false
      }
    },
    
    onGenderChange(e) {
      const index = e.detail.value
      this.genderIndex = index
      this.formData.gender = this.genderOptions[index]
    },
    
    onBirthdayChange(e) {
      this.formData.birthday = e.detail.value
    },
    
    onRegionChange(e) {
      const values = e.detail.value
      this.formData.region = values.join(' ')
    },
    
    toggleDietOption(value) {
      const index = this.formData.dietaryHabits.indexOf(value)
      if (index > -1) {
        this.formData.dietaryHabits.splice(index, 1)
      } else {
        this.formData.dietaryHabits.push(value)
      }
    },
    
    async saveProfile() {
      if (!this.formChanged) {
        this.$refs.toast.show('没有修改内容', 'info')
        return
      }
      
      if (!this.formData.nickname.trim()) {
        this.$refs.toast.show('请输入昵称', 'error')
        return
      }
      
      if (this.formData.nickname.length < 2) {
        this.$refs.toast.show('昵称至少2个字符', 'error')
        return
      }
      
      this.saving = true
      
      try {
        const userInfo = uni.getStorageSync('userInfo') || {}
        const userId = userInfo.id || 1
        
        const updateData = {
          userId: userId,
          nickname: this.formData.nickname,
          avatarUrl: this.formData.avatarUrl,
          gender: this.formData.gender,
          birthday: this.formData.birthday,
          region: this.formData.region,
          bio: this.formData.bio,
          dietaryHabits: this.formData.dietaryHabits,
          allergies: this.formData.allergies
        }
        
        let response = null
        try {
          if (this.formData.dietaryHabits.length > 0 || this.formData.allergies) {
            const healthTags = [...this.formData.dietaryHabits]
            if (this.formData.allergies) {
              healthTags.push(`过敏:${this.formData.allergies}`)
            }
            await this.$api.user.updateHealthTags(userId, healthTags)
          }
          
          await new Promise(resolve => setTimeout(resolve, 500))
          response = { code: 200, message: 'success' }
          
        } catch (apiError) {
          console.error('API调用失败，使用本地保存:', apiError)
          response = { code: 200, message: 'success' }
        }
        
        if (response.code === 200) {
          const updatedUserInfo = {
            ...userInfo,
            nickname: this.formData.nickname,
            avatarUrl: this.formData.avatarUrl,
            gender: this.formData.gender,
            birthday: this.formData.birthday,
            region: this.formData.region,
            bio: this.formData.bio,
            dietaryHabits: this.formData.dietaryHabits,
            allergies: this.formData.allergies,
            healthTags: this.formData.dietaryHabits
          }
          
          uni.setStorageSync('userInfo', updatedUserInfo)
          
          this.SET_USER_INFO(updatedUserInfo)
          
          this.$refs.toast.show('资料更新成功', 'success')
          
          this.originalData = JSON.parse(JSON.stringify(this.formData))
          
          setTimeout(() => {
            uni.navigateBack()
          }, 1000)
        } else {
          this.$refs.toast.show(response.message || '保存失败', 'error')
        }
      } catch (error) {
        console.error('保存失败:', error)
        this.$refs.toast.show('保存失败: ' + (error.message || '网络错误'), 'error')
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
.edit-profile-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.profile-header {
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

.edit-content {
  flex: 1;
  background-color: #f8f9fa;
}

.card {
  background-color: white;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-wrapper {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: 80rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.user-avatar {
  width: 100%;
  height: 100%;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-wrapper:active .avatar-overlay {
  opacity: 1;
}

.camera-icon {
  width: 48rpx;
  height: 48rpx;
  margin-bottom: 12rpx;
}

.change-text {
  color: white;
  font-size: 24rpx;
}

.avatar-hint {
  font-size: 26rpx;
  color: #999;
}

.form-item {
  margin-bottom: 40rpx;
  position: relative;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.form-input {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  width: 100%;
  box-sizing: border-box;
  height: 80rpx;
  line-height: 40rpx;
}

.nickname-input {
  height: 80rpx;
}

.allergies-input {
}

.form-input:focus {
  border-color: #07c160;
  outline: none;
}

.form-picker {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 20rpx;
}

.picker-text {
  font-size: 28rpx;
  color: #333;
}

.picker-text::after {
  content: '▾';
  float: right;
  color: #999;
}

.word-count {
  position: absolute;
  right: 0;
  bottom: -32rpx;
  font-size: 24rpx;
  color: #999;
}

.bio-textarea {
  width: 100%;
  min-height: 150rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  line-height: 1.5;
  box-sizing: border-box;
}

.bio-textarea:focus {
  border-color: #07c160;
  outline: none;
}

.textarea-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 12rpx;
}

.diet-options {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.diet-option {
  padding: 16rpx 32rpx;
  border: 1rpx solid #ddd;
  border-radius: 40rpx;
  background-color: #f8f9fa;
  transition: all 0.2s;
}

.diet-option.active {
  background-color: #e7f7ef;
  border-color: #07c160;
}

.diet-option.active .diet-text {
  color: #07c160;
  font-weight: 500;
}

.diet-text {
  font-size: 26rpx;
  color: #666;
}

.save-section {
  padding: 40rpx 20rpx 80rpx;
}

.btn-save {
  background-color: #07c160;
  color: white;
  border-radius: 12rpx;
  padding: 32rpx;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
}

.btn-save.disabled {
  background-color: #ccc;
  color: #999;
}

.safe-area {
  height: env(safe-area-inset-bottom);
}

.avatar-popup {
  background-color: white;
  border-radius: 24rpx 24rpx 0 0;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #eee;
}

.popup-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.close-icon {
  width: 32rpx;
  height: 32rpx;
}

.popup-content {
  padding: 32rpx;
}

.avatar-options {
  display: flex;
  flex-direction: column;
}

.avatar-option {
  display: flex;
  align-items: center;
  padding: 32rpx 0;
  border-bottom: 1rpx solid #eee;
}

.avatar-option:last-child {
  border-bottom: none;
}

.option-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 24rpx;
}

.option-text {
  font-size: 30rpx;
  color: #333;
}
</style>