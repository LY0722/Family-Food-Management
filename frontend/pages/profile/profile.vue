<!-- 
 * 文件路径：/pages/profile/profile.vue
 * 文件说明：个人中心主页 - 完整版
-->
<template>
  <view class="profile-page">
    <!-- 状态栏 -->
    <view class="profile-header">
      <view class="header-left" @tap="goBack">
        <image src="/static/icons/arrow-left.png" class="back-icon" />
      </view>
      <view class="header-center">
        <text class="header-title">个人中心</text>
      </view>
      <view class="header-right" @tap="showMenu">
        <image src="/static/icons/more.png" class="more-icon" />
      </view>
    </view>
    
    <scroll-view 
      class="page-scroll"
      scroll-y 
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 未登录状态 - 直接跳转到登录页 -->
      <view v-if="!isLoggedIn" class="not-logged-in">
        <view class="login-prompt">
          <image src="/static/images/default-avatar.png" class="prompt-avatar" />
          <text class="prompt-title">还未登录</text>
          <text class="prompt-desc">请先登录后使用</text>
        </view>
      </view>
      
      <!-- 已登录状态 - 没有家庭 -->
      <template v-else-if="!hasFamily">
        <view class="no-family-profile">
          <image 
            :src="displayAvatarUrl" 
            class="center-avatar"
          />
          <text class="center-nickname">{{ userInfo.nickname || '用户' }}</text>
          <button class="edit-profile-btn" @tap="showEditModal">
            编辑
          </button>
          
          <view class="family-buttons">
            <button class="family-action-btn create-family-btn" @tap="goToCreateFamily">
              创建家庭
            </button>
            <button class="family-action-btn join-family-btn" @tap="goToJoinFamily">
              加入家庭
            </button>
          </view>
        </view>
      </template>
      
      <!-- 已登录状态 - 有家庭 -->
      <template v-else>
        <!-- 用户信息头部 -->
        <view class="user-header card">
          <view class="header-content">
            <image 
              :src="displayAvatarUrl" 
              class="user-avatar"
              @tap="changeAvatar"
            />
            <view class="user-info">
              <text class="user-name">{{ userInfo.nickname || '用户' }}</text>
              <text class="user-id">ID: {{ userInfo.id }}</text>
              <text class="user-family" v-if="userInfo.familyId">
                {{ currentFamily?.name || '家庭成员' }}
              </text>
            </view>
            <view class="edit-btn" @tap="editProfile">
              <image src="/static/icons/edit.png" class="edit-icon" />
            </view>
          </view>
          
          <!-- 健康标签 -->
          <view class="health-tags">
            <view class="tags-header">
              <text class="tags-title">健康标签</text>
              <text class="edit-tags" @tap="editHealthTags">编辑</text>
            </view>
            <view class="tags-list" v-if="healthTags && healthTags.length > 0">
              <view 
                v-for="tag in healthTags.slice(0, 3)" 
                :key="tag"
                class="health-tag"
              >
                {{ tag }}
              </view>
              <text class="more-tags" v-if="healthTags.length > 3">+{{ healthTags.length - 3 }}个</text>
            </view>
            <view v-else class="no-tags" @tap="editHealthTags">
              <image src="/static/icons/add.png" class="add-icon" />
              <text>添加健康标签</text>
            </view>
          </view>
        </view>

        <!-- 快捷功能入口 -->
        <view class="quick-actions card">
          <view class="actions-grid">
            <view class="action-item" @tap="goToFamily">
              <view class="action-icon">
                <image src="/static/icons/family.png" />
              </view>
              <text class="action-name">家庭管理</text>
              <text class="action-desc">{{ familyMembers.length }}位成员</text>
            </view>
            
            <view class="action-item" @tap="goToReports">
              <view class="action-icon">
                <image src="/static/icons/chart.png" />
              </view>
              <text class="action-name">消耗报告</text>
              <text class="action-desc">{{ wasteRate || 0 }}%浪费率</text>
            </view>
            
            <view class="action-item" @tap="goToSettings">
              <view class="action-icon">
                <image src="/static/icons/settings.png" />
              </view>
              <text class="action-name">系统设置</text>
              <text class="action-desc">个性化设置</text>
            </view>
          </view>
        </view>

        <!-- 数据概览 -->
        <view class="data-overview card" v-if="currentFamily">
          <view class="overview-header">
            <text class="overview-title">本周数据概览</text>
            <text class="overview-date">{{ currentWeek }}</text>
          </view>
          
          <view class="overview-grid">
            <view class="overview-item">
              <text class="item-value">{{ overviewData.consumption || 0 }}kg</text>
              <text class="item-label">食材消耗</text>
              <text class="item-change" :class="{ positive: overviewData.consumptionChange > 0 }">
                {{ overviewData.consumptionChange > 0 ? '+' : '' }}{{ overviewData.consumptionChange || 0 }}%
              </text>
            </view>
            
            <view class="overview-item">
              <text class="item-value">{{ overviewData.wasteRate || 0 }}%</text>
              <text class="item-label">浪费率</text>
              <text class="item-change" :class="{ positive: overviewData.wasteChange < 0 }">
                {{ overviewData.wasteChange > 0 ? '+' : '' }}{{ overviewData.wasteChange || 0 }}%
              </text>
            </view>
            
            <view class="overview-item">
              <text class="item-value">¥{{ overviewData.saved || 0 }}</text>
              <text class="item-label">节省金额</text>
              <text class="item-change positive">+{{ overviewData.savedChange || 0 }}%</text>
            </view>
          </view>
        </view>

        <!-- 快速操作 -->
        <view class="quick-operations card">
          <view class="operations-list">
            <view class="operation-item" @tap="goToInventory">
              <image src="/static/icons/inventory.png" class="op-icon" />
              <text class="op-name">查看库存</text>
              <image src="/static/icons/arrow.png" class="op-arrow" />
            </view>
            
            <view class="operation-item" @tap="goToShopping">
              <image src="/static/icons/shopping.png" class="op-icon" />
              <text class="op-name">采购清单</text>
              <image src="/static/icons/arrow.png" class="op-arrow" />
            </view>
            
            <view class="operation-item" @tap="goToRecipes">
              <image src="/static/icons/recipe.png" class="op-icon" />
              <text class="op-name">菜谱推荐</text>
              <image src="/static/icons/arrow.png" class="op-arrow" />
            </view>
          </view>
        </view>

        <!-- 退出登录 -->
        <view class="logout-section">
          <button class="btn-logout" @tap="handleLogout">
            <image src="/static/icons/logout.png" class="logout-icon" />
            <text>退出登录</text>
          </button>
        </view>
      </template>
      
      <!-- 版本信息 -->
      <view class="version-info">
        <text>家庭食材管家 v1.0.0</text>
      </view>
      
      <view class="bottom-placeholder"></view>
    </scroll-view>
    
    <!-- 编辑弹窗 -->
    <view v-if="showEditModalFlag" class="edit-modal-overlay" @tap="hideEditModal">
      <view class="edit-modal-content" @tap.stop>
        <view class="edit-modal-item" @tap="changeAvatar">
          <text>修改头像</text>
        </view>
        <view class="edit-modal-item" @tap="editNickname">
          <text>修改昵称</text>
        </view>
        <view class="edit-modal-item cancel-item" @tap="hideEditModal">
          <text>取消</text>
        </view>
      </view>
    </view>
    
    <!-- 健康标签选择弹窗 -->
    <view v-if="showHealthTagsModal" class="health-tags-modal-overlay" @tap="hideHealthTagsModal">
      <view class="health-tags-modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">选择健康标签</text>
          <view class="close-btn" @tap="hideHealthTagsModal">
            <image src="/static/icons/close.png" class="close-icon" />
          </view>
        </view>
        
        <scroll-view class="tags-scroll" scroll-y>
          <view class="tags-grid">
            <view 
              v-for="tag in availableHealthTags" 
              :key="tag"
              class="tag-option"
              :class="{ active: selectedHealthTags.includes(tag) }"
              @tap="toggleTag(tag)"
            >
              <text class="tag-text">{{ tag }}</text>
            </view>
          </view>
        </scroll-view>
        
        <view class="modal-footer">
          <button class="btn-cancel" @tap="hideHealthTagsModal">取消</button>
          <button class="btn-confirm" @tap="confirmHealthTags">确定</button>
        </view>
      </view>
    </view>
    
    <loading v-if="loading" text="加载中..." />
    <toast ref="toast" />
  </view>
</template>

<script>
import Loading from '@/components/common/Loading.vue'
import Toast from '@/components/common/Toast.vue'
import { mapState, mapMutations, mapActions } from 'vuex'
import { requireLogin } from '@/utils/pageGuard'

export default {
  name: 'Profile',
  
  components: {
    Loading,
    Toast
  },
  
  data() {
    return {
      loading: false,
      refreshing: false,
      healthTags: [],
      familyMembers: [],
      currentFamily: null,
      wasteRate: 0,
      overviewData: {
        consumption: 0,
        wasteRate: 0,
        saved: 0,
        consumptionChange: 0,
        wasteChange: 0,
        savedChange: 0
      },
      currentWeek: '',
      availableHealthTags: ['素食', '荤素搭配', '低脂', '低盐', '无麸质', '有机', '无糖', '高蛋白', '低碳水', '清真', '无乳糖'],
      showEditModalFlag: false,
      showHealthTagsModal: false,
      selectedHealthTags: []
    }
  },
  
  computed: {
    ...mapState('user', ['userInfo', 'isLoggedIn']),
    
    // 使用 Vuex 中的 isLoggedIn 状态，而不是从 localStorage 读取
    userLoggedIn() {
      return this.isLoggedIn
    },
    
    displayAvatarUrl() {
      if (!this.userInfo) {
        return '/static/images/default-avatar.png'
      }
      
      const avatarUrl = this.userInfo.avatarUrl
      
      // 如果是临时文件路径（以 http://tmp 开头），直接使用
      if (avatarUrl && avatarUrl.startsWith('http://tmp')) {
        return avatarUrl
      }
      
      // 如果是 wxfile:// 开头的本地路径，直接使用
      if (avatarUrl && avatarUrl.startsWith('wxfile://')) {
        return avatarUrl
      }
      
      // 如果是完整的 HTTP/HTTPS URL，直接使用
      if (avatarUrl && (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://'))) {
        return avatarUrl
      }
      
      // 默认头像
      return '/static/images/default-avatar.png'
    },
    
    hasFamily() {
      return !!(this.currentFamily?.id || this.userInfo?.familyId || this.userInfo?.currentFamilyId)
    }
  },
  
  watch: {
    isLoggedIn: {
      handler(newVal, oldVal) {
        console.log('isLoggedIn 变化:', { oldVal, newVal })
        
        if (newVal) {
          // 登录状态：加载个人中心数据
          this.loadProfileData()
        } else if (oldVal && !newVal) {
          // 从登录变为未登录：清除本地数据
          console.log('用户已退出登录，清除页面数据')
          this.healthTags = []
          this.familyMembers = []
          this.currentFamily = null
          this.overviewData = {
            consumption: 0,
            wasteRate: 0,
            saved: 0,
            consumptionChange: 0,
            wasteChange: 0,
            savedChange: 0
          }
        }
      },
      immediate: true
    }
  },
  
  onShow() {
    if (!requireLogin()) {
      return
    }
    
    if (this.isLoggedIn) {
      this.loadProfileData()
    }
  },
  
  onLoad() {
    if (!requireLogin()) {
      return
    }
    
    this.setCurrentWeek()
  },
  
  methods: {
    ...mapMutations('user', ['SET_USER_INFO']),
    ...mapActions('user', ['logout']),
    
    async loadProfileData() {
      this.loading = true
      try {
        await Promise.all([
          this.loadUserData(),
          this.loadFamilyData(),
          this.loadOverviewData()
        ])
        this.setCurrentWeek()
      } catch (error) {
        console.error('加载个人中心数据失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    loadUserData() {
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        try {
          const tags = userInfo.healthTags
          if (typeof tags === 'string') {
            this.healthTags = tags === '[]' ? [] : JSON.parse(tags)
          } else if (Array.isArray(tags)) {
            this.healthTags = tags
          } else {
            this.healthTags = []
          }
        } catch (e) {
          this.healthTags = []
        }
      }
    },
    
    async loadFamilyData() {
      if (this.userInfo?.familyId) {
        try {
          const familyResponse = await this.$api.family.getInfo(this.userInfo.familyId)
          if (familyResponse.code === 200) {
            this.currentFamily = familyResponse.data
          }
          
          const membersResponse = await this.$api.family.getMembers(this.userInfo.familyId)
          if (membersResponse.code === 200) {
            this.familyMembers = membersResponse.data || []
          }
        } catch (error) {
          console.error('加载家庭数据失败:', error)
        }
      }
    },
    
    async loadOverviewData() {
      this.overviewData = {
        consumption: 12.5,
        wasteRate: 5.2,
        saved: 156,
        consumptionChange: -3.2,
        wasteChange: -1.5,
        savedChange: 8.7
      }
      this.wasteRate = this.overviewData.wasteRate
    },
    
    setCurrentWeek() {
      const now = new Date()
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      
      this.currentWeek = `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()} - ${endOfWeek.getMonth() + 1}/${endOfWeek.getDate()}`
    },
    
    async onRefresh() {
      this.refreshing = true
      await this.loadProfileData()
      this.refreshing = false
    },
    
    goToLogin() {
      uni.reLaunch({
        url: '/pages/login/login'
      })
    },
    
    goToRegister() {
      uni.navigateTo({
        url: '/pages/register/register'
      })
    },
    
    goBack() {
      uni.navigateBack()
    },
    
    showMenu() {
      uni.showActionSheet({
        itemList: ['设置', '帮助', '关于'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.goToSettings()
          } else if (res.tapIndex === 1) {
            uni.showToast({
              title: '帮助功能开发中',
              icon: 'none'
            })
          } else if (res.tapIndex === 2) {
            uni.showModal({
              title: '关于',
              content: '家庭食材管家 v1.0.0\n\n一款智能的家庭食材管理应用',
              showCancel: false
            })
          }
        }
      })
    },
    
changeAvatar() {
  console.log('开始选择头像图片...')
  
  uni.chooseImage({
    count: 1,
    success: async (res) => {
      try {
        console.log('选择图片成功:', res)
        const filePath = res.tempFilePaths[0]
        console.log('临时文件路径:', filePath)
        
        const response = await this.$api.user.uploadAvatar(filePath)
        console.log('上传响应:', response)
        
        if (response.code === 200) {
          console.log('头像URL:', response.data)
          
          // 开发环境使用临时路径（避免 HTTP 协议问题）
          // 生产环境使用服务器 URL（需要 HTTPS）
          const isDev = process.env.NODE_ENV === 'development'
          const avatarUrl = isDev ? filePath : response.data
          
          const updatedUserInfo = { 
            ...this.userInfo, 
            avatarUrl: avatarUrl,
            serverAvatarUrl: response.data // 保存服务器 URL，用于生产环境
          }
          
          uni.setStorageSync('userInfo', updatedUserInfo)
          this.SET_USER_INFO(updatedUserInfo)
          
          if (this.$refs.toast) {
            this.$refs.toast.show('头像更新成功')
          } else {
            uni.showToast({ title: '头像更新成功', icon: 'success' })
          }
        } else {
          console.error('上传失败:', response.message)
          if (this.$refs.toast) {
            this.$refs.toast.show(response.message || '头像上传失败')
          } else {
            uni.showToast({ title: response.message || '头像上传失败', icon: 'none' })
          }
        }
      } catch (error) {
        console.error('上传头像失败:', error)
        if (this.$refs.toast) {
          this.$refs.toast.show('头像上传失败')
        } else {
          uni.showToast({ title: '头像上传失败', icon: 'none' })
        }
      }
    },
    fail: (err) => {
      console.error('选择图片失败:', err)
      uni.showToast({ title: '选择图片失败', icon: 'none' })
    }
  })
},
    
    editProfile() {
      uni.navigateTo({
        url: '/pages/profile/edit'
      })
    },
    
    editHealthTags() {
      this.selectedHealthTags = [...this.healthTags]
      this.showHealthTagsModal = true
    },
    
    toggleHealthTag(tag) {
      const index = this.healthTags.indexOf(tag)
      if (index > -1) {
        // 如果已存在，则移除
        this.healthTags.splice(index, 1)
        this.$refs.toast.show(`已移除「${tag}」`, 'info')
      } else {
        // 如果不存在，则添加
        this.healthTags.push(tag)
        this.$refs.toast.show(`已添加「${tag}」`, 'success')
      }
      // 保存更新
      this.saveHealthTags()
    },
    
    async saveHealthTags() {
      this.loading = true
      try {
        const userInfo = uni.getStorageSync('userInfo')
        if (userInfo) {
          userInfo.healthTags = this.healthTags
          uni.setStorageSync('userInfo', userInfo)
          this.SET_USER_INFO(userInfo)
        }
        
        try {
          await this.$api.user.updateHealthTags(this.healthTags)
        } catch (apiError) {
          console.error('更新健康标签API失败:', apiError)
        }
        
        // 刷新显示
        this.loadUserData()
      } catch (error) {
        console.error('保存健康标签失败:', error)
        this.$refs.toast.show('保存失败', 'error')
      } finally {
        this.loading = false
      }
    },
    
    toggleTag(tag) {
      const index = this.selectedHealthTags.indexOf(tag)
      if (index > -1) {
        this.selectedHealthTags.splice(index, 1)
      } else {
        this.selectedHealthTags.push(tag)
      }
    },
    
    hideHealthTagsModal() {
      this.showHealthTagsModal = false
    },
    
    async confirmHealthTags() {
      this.healthTags = [...this.selectedHealthTags]
      await this.saveHealthTags()
      this.hideHealthTagsModal()
    },
    
    goToFamily() {
      uni.navigateTo({
        url: '/pages/profile/family/family'
      })
    },
    
    goToReports() {
      uni.navigateTo({
        url: '/pages/profile/reports/reports'
      })
    },
    
    goToSettings() {
      uni.navigateTo({
        url: '/pages/profile/settings/setting'
      })
    },
    
    goToInventory() {
      uni.navigateTo({
        url: '/pages/home/inventory/inventory'
      })
    },
    
    goToShopping() {
      uni.switchTab({
        url: '/pages/shopping/shopping'
      })
    },
    
    goToRecipes() {
      uni.navigateTo({
        url: '/pages/shopping/recipe/recipe'
      })
    },
    
    handleLogout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        confirmText: '退出',
        cancelText: '取消',
        success: async (res) => {
          if (res.confirm) {
            this.loading = true
            try {
              console.log('开始退出登录...')
              
              // 调用后端退出接口（可选，如果后端需要处理）
              try {
                await this.$api.user.logout()
                console.log('后端退出接口调用成功')
              } catch (apiError) {
                console.warn('后端退出接口调用失败，但继续执行本地退出:', apiError)
              }
              
              // 使用 Vuex 的 logout action 清除所有用户数据
              this.logout()
              console.log('Vuex 用户数据已清除')
              
              // 手动清除所有相关的本地存储（双重保险）
              uni.removeStorageSync('token')
              uni.removeStorageSync('userInfo')
              uni.removeStorageSync('currentFamily')
              console.log('本地存储已清除')
              
              // 清除页面数据
              this.healthTags = []
              this.familyMembers = []
              this.currentFamily = null
              this.overviewData = {
                consumption: 0,
                wasteRate: 0,
                saved: 0,
                consumptionChange: 0,
                wasteChange: 0,
                savedChange: 0
              }
              
              // 显示提示
              if (this.$refs.toast) {
                this.$refs.toast.show('退出成功')
              } else {
                uni.showToast({ title: '退出成功', icon: 'success' })
              }
              
              // 立即跳转到登录页
              console.log('跳转到登录页...')
              uni.reLaunch({
                url: '/pages/login/login'
              })
              
            } catch (error) {
              console.error('退出失败:', error)
              if (this.$refs.toast) {
                this.$refs.toast.show('退出失败')
              } else {
                uni.showToast({ title: '退出失败', icon: 'none' })
              }
            } finally {
              this.loading = false
            }
          }
        }
      })
    },
    
    showEditModal() {
      this.showEditModalFlag = true
    },
    
    hideEditModal() {
      this.showEditModalFlag = false
    },
    
    editNickname() {
      this.hideEditModal()
      uni.showModal({
        title: '修改昵称',
        editable: true,
        placeholderText: '请输入新昵称',
        success: async (res) => {
          if (res.confirm && res.content) {
            try {
              const response = await this.$api.user.updateUser({ nickname: res.content })
              if (response.code === 200) {
                const updatedUserInfo = { ...this.userInfo, nickname: res.content }
                uni.setStorageSync('userInfo', updatedUserInfo)
                this.SET_USER_INFO(updatedUserInfo)
                if (this.$refs.toast) {
                  this.$refs.toast.show('昵称修改成功')
                } else {
                  uni.showToast({ title: '昵称修改成功', icon: 'success' })
                }
              }
            } catch (error) {
              console.error('修改昵称失败:', error)
              uni.showToast({ title: '修改失败', icon: 'none' })
            }
          }
        }
      })
    },
    
    goToCreateFamily() {
      uni.navigateTo({ url: '/pages/profile/family/create' })
    },
    
    goToJoinFamily() {
      uni.navigateTo({ url: '/pages/profile/family/add-family' })
    },
    
    handleLogout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        confirmText: '退出',
        cancelText: '取消',
        success: async (res) => {
          if (res.confirm) {
            this.loading = true
            try {
              console.log('开始退出登录...')
              
              // 调用后端退出接口（可选，如果后端需要处理）
              try {
                await this.$api.user.logout()
                console.log('后端退出接口调用成功')
              } catch (apiError) {
                console.warn('后端退出接口调用失败，但继续执行本地退出:', apiError)
              }
              
              // 使用 Vuex 的 logout action 清除所有用户数据
              this.logout()
              console.log('Vuex 用户数据已清除')
              
              // 手动清除所有相关的本地存储（双重保险）
              uni.removeStorageSync('token')
              uni.removeStorageSync('userInfo')
              uni.removeStorageSync('currentFamily')
              console.log('本地存储已清除')
              
              // 显示提示
              if (this.$refs.toast) {
                this.$refs.toast.show('退出成功')
              } else {
                uni.showToast({ title: '退出成功', icon: 'success' })
              }
              
              // 延迟跳转到登录页
              setTimeout(() => {
                console.log('跳转到登录页...')
                uni.reLaunch({
                  url: '/pages/login/login'
                })
              }, 1000)
              
            } catch (error) {
              console.error('退出失败:', error)
              if (this.$refs.toast) {
                this.$refs.toast.show('退出失败')
              } else {
                uni.showToast({ title: '退出失败', icon: 'none' })
              }
            } finally {
              this.loading = false
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f5f7fa;
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

.back-icon,
.more-icon {
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

.no-family-profile {
  padding: 80rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.center-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  margin-bottom: 32rpx;
  border: 4rpx solid #fff;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.center-nickname {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 40rpx;
}

.edit-profile-btn {
  padding: 16rpx 48rpx;
  background: linear-gradient(135deg, #52b788 0%, #2d865a 100%);
  color: #fff;
  border: none;
  border-radius: 24rpx;
  font-size: 28rpx;
  margin-bottom: 80rpx;
  box-shadow: 0 4rpx 16rpx rgba(45, 134, 90, 0.3);
}

.family-buttons {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  width: 100%;
}

.family-action-btn {
  width: 100%;
  padding: 36rpx;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.create-family-btn {
  background: linear-gradient(135deg, #52b788 0%, #2d865a 100%);
  color: #fff;
}

.join-family-btn {
  background: linear-gradient(135deg, #b5e48c 0%, #52b788 100%);
  color: #fff;
}

.edit-modal-overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.edit-modal-content {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 24rpx 0;
}

.edit-modal-item {
  padding: 32rpx 40rpx;
  text-align: center;
  font-size: 32rpx;
  color: #333;
  border-bottom: 1rpx solid #f0f0f0;
}

.edit-modal-item:last-child {
  border-bottom: none;
}

.cancel-item {
  color: #999;
  font-size: 28rpx;
}

.page-scroll {
  height: 100vh;
}

.card {
  background: white;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.08);
}

.not-logged-in {
  padding: 100rpx 40rpx;
  text-align: center;
}

.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.prompt-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-bottom: 30rpx;
}

.prompt-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 15rpx;
}

.prompt-desc {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 40rpx;
}

.btn-login-now, .btn-register {
  width: 100%;
  margin-bottom: 20rpx;
  background: #07c160;
  color: white;
  border: none;
  border-radius: 12rpx;
  padding: 25rpx;
  font-size: 28rpx;
}

.btn-register {
  background: #3498db;
}

.user-header {
  margin-top: 20rpx;
}

.header-content {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.user-id, .user-family {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 5rpx;
}

.edit-btn {
  padding: 20rpx;
}

.edit-icon {
  width: 32rpx;
  height: 32rpx;
}

.health-tags {
  border-top: 1rpx solid #f0f0f0;
  padding-top: 30rpx;
}

.tags-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.tags-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.edit-tags {
  font-size: 24rpx;
  color: #07c160;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  align-items: center;
}

.health-tag {
  background: #e8f5e8;
  color: #07c160;
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.more-tags {
  font-size: 24rpx;
  color: #666;
}

.no-tags {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  color: #666;
}

.add-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 15rpx;
}

.quick-actions {
  margin-top: 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30rpx;
}

.action-item {
  text-align: center;
  padding: 20rpx;
}

.action-icon {
  width: 60rpx;
  height: 60rpx;
  margin: 0 auto 15rpx;
}

.action-icon image {
  width: 100%;
  height: 100%;
}

.action-name {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 5rpx;
}

.action-desc {
  font-size: 22rpx;
  color: #666;
}

.data-overview {
  margin-top: 0;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.overview-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.overview-date {
  font-size: 24rpx;
  color: #666;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.overview-item {
  text-align: center;
  padding: 25rpx 15rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.item-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #07c160;
  display: block;
  margin-bottom: 8rpx;
}

.item-label {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 5rpx;
}

.item-change {
  font-size: 20rpx;
  color: #ff6b6b;
}

.item-change.positive {
  color: #07c160;
}

.quick-operations {
  margin-top: 0;
}

.operations-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.operation-item {
  display: flex;
  align-items: center;
  padding: 25rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.operation-item:last-child {
  border-bottom: none;
}

.op-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
}

.op-name {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.op-arrow {
  width: 24rpx;
  height: 24rpx;
}

.logout-section {
  margin: 40rpx 20rpx;
}

.btn-logout {
  width: 100%;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 12rpx;
  padding: 25rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15rpx;
}

.logout-icon {
  width: 32rpx;
  height: 32rpx;
}

.version-info {
  text-align: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 24rpx;
}

.health-tags-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.health-tags-modal-content {
  width: 100%;
  max-height: 70vh;
  background: white;
  border-radius: 24rpx 24rpx 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  padding: 8rpx;
}

.close-icon {
  width: 32rpx;
  height: 32rpx;
}

.tags-scroll {
  flex: 1;
  padding: 24rpx;
}

.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag-option {
  padding: 16rpx 24rpx;
  border: 1rpx solid #ddd;
  border-radius: 40rpx;
  background: #f8f9fa;
  transition: all 0.2s;
}

.tag-option.active {
  background: #e6f7ff;
  border-color: #1890ff;
}

.tag-text {
  font-size: 26rpx;
  color: #666;
}

.tag-option.active .tag-text {
  color: #1890ff;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  gap: 16rpx;
  padding: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.btn-cancel {
  flex: 1;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
}

.btn-confirm {
  flex: 1;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
}

.bottom-placeholder {
  height: 100rpx;
}
</style>