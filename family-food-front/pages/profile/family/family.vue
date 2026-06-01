<template>
  <view class="family-page">
    <view class="header">
      <view class="header-left" @tap="goBack">
        <image src="/static/icons/arrow-left.png" class="back-icon"/>
      </view>
      <view class="header-center">
        <text class="header-title">家庭成员</text>
      </view>
      <view class="header-right"></view>
    </view>
    

    
    <scroll-view class="page-content" scroll-y>

          <view class="theme-section">
      <view class="theme-title-row">
        <text class="theme-title">家庭成员</text>
      </view>
      <view class="theme-id-row">
        <text class="theme-id">ID：{{ familyInfo.id || '---' }}</text>
      </view>
      
      <view class="green-border">
        <view class="admin-info-row">
          <image :src="adminInfo.avatarUrl || defaultAvatar" class="admin-avatar" />
          <text class="family-name">{{ familyInfo.name || '我的家庭' }}</text>
          <view class="edit-icon-wrapper" @tap="showEditModal">
            <image src="/static/icons/edit.png" class="edit-icon"/>
          </view>
        </view>
        <view class="family-code-row">
          <text class="family-code-label">家庭码：</text>
          <text class="family-code-value">{{ familyInfo.familyCode || familyInfo.family_code || '---' }}</text>
          <view class="copy-code-btn" @tap="copyFamilyCode">
            <text class="copy-text">复制</text>
          </view>
        </view>
        <view class="admin-tag">
          <text class="tag-text">超级管理员</text>
        </view>
      </view>
    </view>
      <view class="members-section">
        <view v-if="members.length === 0" class="empty-state">
          <image src="/static/icons/members.png" class="empty-icon" />
          <text class="empty-text">当前家庭没有其他成员</text>
          <text class="empty-desc">邀请家人一起管理家庭食材</text>
        </view>
        
        <view v-else class="members-list">
          <view 
            class="member-item" 
            v-for="member in members" 
            :key="member.id"
          >
            <image :src="member.avatarUrl || defaultAvatar" class="member-avatar" />
            <view class="member-info">
              <text class="member-name">{{ member.nickname || member.name }}</text>
              <text class="member-role">{{ getRoleText(member.role) }}</text>
              <text class="member-time">{{ formatDate(member.joinedAt) }}加入</text>
            </view>
            
            <view class="member-actions" v-if="canManageMember(member)">
              <button class="action-btn" @tap="handleRemoveMember(member)">移除</button>
            </view>
          </view>
        </view>
      </view>
      
      <view class="invite-section">
        <view class="invite-bar" @tap="handleAddMember">
          <text class="invite-text">+ 邀请家庭成员</text>
        </view>
      </view>
      
      <view class="exit-section">
        <view class="exit-bar" @tap="handleExitFamily">
          <text class="exit-text">退出家庭</text>
        </view>
      </view>
      
      <view class="permission-section">
        <view class="permission-card">
          <text class="permission-title">权限说明</text>
          <view class="permission-list">
            <view class="permission-item">
              <text class="permission-role">超级管理员（家长）</text>
              <text class="permission-desc">可管理所有成员、编辑家庭信息、移除成员、邀请新成员</text>
            </view>
            <view class="permission-item">
              <text class="permission-role">普通成员</text>
              <text class="permission-desc">可查看家庭信息、管理食材和菜谱，无法管理其他成员</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 编辑家庭弹窗 -->
    <view v-if="editModalVisible" class="modal-mask" @tap="hideEditModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">编辑家庭</text>
          <image src="/static/icons/close.png" class="close-icon" @tap="hideEditModal"/>
        </view>
        
        <view class="modal-body">
          <view class="edit-item">
            <text class="edit-label">家庭名称</text>
            <input 
              class="edit-input" 
              v-model="editForm.name" 
              placeholder="请输入家庭名称"
              maxlength="20"
            />
          </view>
          
          <view class="edit-item">
            <text class="edit-label">家庭描述</text>
            <textarea 
              class="edit-textarea" 
              v-model="editForm.description" 
              placeholder="请输入家庭描述"
              maxlength="100"
            />
          </view>
          
          <view class="action-buttons">
            <button class="action-btn share-btn" @tap="handleShare">
              <text class="btn-icon">📤</text>
              <text class="btn-text">分享家庭</text>
            </button>
            <button class="action-btn delete-btn" @tap="handleDeleteFamily">
              <text class="btn-icon">🗑️</text>
              <text class="btn-text">删除家庭</text>
            </button>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="btn-cancel" @tap="hideEditModal">取消</button>
          <button class="btn-confirm" :loading="saving" @tap="handleSave">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { requireLogin } from '@/utils/pageGuard'

export default {
  name: 'FamilyPage',
  
  data() {
    return {
      familyInfo: {},
      members: [],
      defaultAvatar: '/static/images/default-avatar.png',
      editModalVisible: false,
      saving: false,
      editForm: {
        name: '',
        description: ''
      }
    }
  },
  
  computed: {
    currentUser() {
      return uni.getStorageSync('userInfo') || {}
    },
    
    isAdmin() {
      return this.currentUser.role === 'admin'
    },
    
    adminInfo() {
      return this.members.find(m => m.role === 'admin') || {}
    }
  },
  
  onLoad() {
    if (!requireLogin()) {
      return
    }
    
    this.loadFamilyData()
  },
  
  onShow() {
    if (!requireLogin()) {
      return
    }
    
    this.loadFamilyData()
  },
  
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    async loadFamilyData() {
      if (!this.currentUser.familyId) return
      
      try {
        const [familyRes, membersRes] = await Promise.all([
          this.$api.family.getInfo(this.currentUser.familyId),
          this.$api.family.getMembers(this.currentUser.familyId)
        ])
        
        if (familyRes.code === 200) {
          this.familyInfo = familyRes.data || {}
        }
        
        if (membersRes.code === 200) {
          this.members = membersRes.data || []
        }
      } catch (error) {
        console.error('加载家庭数据失败:', error)
      }
    },
    
    getRoleText(role) {
      const roleMap = {
        admin: '家长',
        member: '成员'
      }
      return roleMap[role] || '成员'
    },
    
    formatDate(date) {
      if (!date) return '---'
      const d = new Date(date)
      return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
    },
    
    canManageMember(member) {
      if (!this.isAdmin) return false
      if (member.id === this.currentUser.id) return false
      return true
    },
    
    handleAddMember() {
      uni.navigateTo({
        url: '/pages/profile/family/add-member'
      })
    },
    
    handleRemoveMember(member) {
      uni.showModal({
        title: '确认移除',
        content: `确定要移除 ${member.nickname || member.name} 吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const response = await this.$api.family.removeMember(this.currentUser.familyId, member.id)
              
              if (response.code === 200) {
                uni.showToast({
                  title: '移除成功',
                  icon: 'success'
                })
                this.loadFamilyData()
              } else {
                uni.showToast({
                  title: response.message || '移除失败',
                  icon: 'none'
                })
              }
            } catch (error) {
              console.error('移除成员失败:', error)
              uni.showToast({
                title: '移除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    
    showEditModal() {
      this.editForm.name = this.familyInfo.name || ''
      this.editForm.description = this.familyInfo.description || ''
      this.editModalVisible = true
    },
    
    hideEditModal() {
      this.editModalVisible = false
    },
    
    async handleSave() {
      if (!this.editForm.name.trim()) {
        uni.showToast({
          title: '请输入家庭名称',
          icon: 'none'
        })
        return
      }
      
      this.saving = true
      
      try {
        const response = await this.$api.family.updateInfo(this.currentUser.familyId, {
        name: this.editForm.name.trim(),
        description: this.editForm.description.trim()
      })
        
        if (response.code === 200) {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
          this.loadFamilyData()
          this.hideEditModal()
        } else {
          uni.showToast({
            title: response.message || '保存失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('保存失败:', error)
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      } finally {
        this.saving = false
      }
    },
    
    handleShare() {
      const shareCode = this.familyInfo.familyCode || this.familyInfo.family_code || this.familyInfo.id
      const shareText = `邀请你加入我的家庭「${this.familyInfo.name}」\n\n家庭邀请码：${shareCode}`
      
      uni.showModal({
        title: '分享家庭',
        content: shareText,
        confirmText: '复制',
        success: (res) => {
          if (res.confirm) {
            uni.setClipboardData({
              data: shareText,
              success: () => {
                uni.showToast({
                  title: '已复制到剪贴板',
                  icon: 'success'
                })
              }
            })
          }
        }
      })
    },
    
    copyFamilyCode() {
      const familyCode = this.familyInfo.familyCode || this.familyInfo.family_code
      if (!familyCode) {
        uni.showToast({
          title: '家庭码不存在',
          icon: 'none'
        })
        return
      }
      
      uni.setClipboardData({
        data: familyCode,
        success: () => {
          uni.showToast({
            title: '已复制家庭码',
            icon: 'success'
          })
        }
      })
    },
    
    handleDeleteFamily() {
      uni.showModal({
        title: '确认删除',
        content: '删除家庭后，所有数据将被清空且无法恢复，确定要删除吗？',
        confirmColor: '#ff4d4f',
        success: async (res) => {
          if (res.confirm) {
            try {
              const response = await this.$api.family.delete(this.currentUser.familyId)
              
              if (response.code === 200) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                
                setTimeout(() => {
                  uni.reLaunch({ url: '/pages/home/home' })
                }, 1500)
              } else {
                uni.showToast({
                  title: response.message || '删除失败',
                  icon: 'none'
                })
              }
            } catch (error) {
              console.error('删除家庭失败:', error)
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    
    async handleExitFamily() {
      uni.showModal({
        title: '确认退出',
        content: '退出家庭后，您将没有家庭，可以创建或加入新家庭，确定要退出吗？',
        confirmText: '退出',
        confirmColor: '#ff4d4f',
        success: async (res) => {
          if (res.confirm) {
            uni.showLoading({ title: '退出中...' })
            
            try {
              const oldFamilyId = this.currentUser.familyId
              const userId = this.currentUser.id
              
              // 退出旧家庭
              const leaveRes = await this.$api.family.leave(oldFamilyId, {
                userId: userId
              })
              
              if (leaveRes.code !== 200) {
                uni.hideLoading()
                uni.showToast({
                  title: leaveRes.message || '退出失败',
                  icon: 'none'
                })
                return
              }
              
              // 更新用户信息，清空家庭ID
              const updatedUserInfo = {
                ...this.currentUser,
                familyId: null,
                currentFamilyId: null
              }
              
              // 同时更新Vuex store和本地存储
              uni.setStorageSync('userInfo', updatedUserInfo)
              this.$store.commit('user/SET_USER_INFO', updatedUserInfo)
              this.$store.commit('user/SET_CURRENT_FAMILY', null)
              
              uni.hideLoading()
              uni.showToast({
                title: '已退出家庭',
                icon: 'success'
              })
              
              // 强制跳转到首页的欢迎页面
              setTimeout(() => {
                uni.switchTab({
                  url: '/pages/home/home'
                })
              }, 1500)
              
            } catch (error) {
              uni.hideLoading()
              console.error('退出家庭失败:', error)
              uni.showToast({
                title: '退出失败',
                icon: 'none'
              })
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.family-page {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.header {
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

.header-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.theme-section {
  padding: 20rpx 24rpx;
}

.theme-title-row {
  margin-bottom: 12rpx;
}

.theme-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #1a1a1a;
}

.theme-id-row {
  margin-bottom: 24rpx;
}

.theme-id {
  font-size: 28rpx;
  color: #666;
}

.green-border {
  border: 3rpx solid #07c160;
  border-radius: 20rpx;
  padding: 24rpx;
  background: #fff;
}

.admin-info-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.admin-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
}

.family-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.edit-icon-wrapper {
  padding: 8rpx;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-icon-wrapper:active {
  transform: scale(0.9);
  opacity: 0.7;
}

.edit-icon {
  width: 48rpx;
  height: 48rpx;
  opacity: 0.6;
}

.admin-tag {
  background: #07c160;
  border-radius: 12rpx;
  padding: 12rpx 24rpx;
  display: inline-block;
}

.tag-text {
  color: #fff;
  font-size: 26rpx;
  font-weight: bold;
}


.family-code-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 0;
  margin-bottom: 16rpx;
}

.family-code-label {
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}

.family-code-value {
  flex: 1;
  font-size: 28rpx;
  color: #07c160;
  font-weight: bold;
  letter-spacing: 2rpx;
}

.copy-code-btn {
  padding: 8rpx 20rpx;
  background: linear-gradient(135deg, #07c160, #059e4a);
  border-radius: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(7, 193, 96, 0.3);
}

.copy-text {
  color: #fff;
  font-size: 24rpx;
  font-weight: 500;
}

.page-content {
  flex: 1;
  padding: 20rpx;
}

.admin-card {
  background: #fff;
  border: 3rpx solid #07c160;
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 20rpx 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.admin-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
}

.admin-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.admin-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.admin-role {
  font-size: 26rpx;
  color: #07c160;
  font-weight: 500;
}

.members-section {
  margin: 0 24rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 24rpx;
  color: #999;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
}

.member-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.member-role {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 4rpx;
}

.member-time {
  font-size: 22rpx;
  color: #999;
}

.member-actions {
  display: flex;
  gap: 12rpx;
}

.action-btn {
  padding: 12rpx 20rpx;
  background: #fff1f0;
  color: #ff4d4f;
  border-radius: 12rpx;
  font-size: 24rpx;
  border: none;
}

.invite-section {
  padding: 20rpx 24rpx 20rpx 24rpx;
}

.invite-bar {
  background: linear-gradient(135deg, #07c160, #059e4a);
  border-radius: 24rpx;
  padding: 32rpx 0;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(7, 193, 96, 0.3);
}

.invite-text {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  letter-spacing: 2rpx;
}

.exit-section {
  padding: 0 24rpx 40rpx 24rpx;
}

.exit-bar {
  background: #fff1f0;
  border: 2rpx solid #ff4d4f;
  border-radius: 24rpx;
  padding: 32rpx 0;
  text-align: center;
}

.exit-text {
  color: #ff4d4f;
  font-size: 32rpx;
  font-weight: bold;
  letter-spacing: 2rpx;
}

.permission-section {
  padding: 0 24rpx 40rpx 24rpx;
}

.permission-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.permission-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
  display: block;
}

.permission-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.permission-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.permission-role {
  font-size: 28rpx;
  font-weight: bold;
  color: #07c160;
  margin-bottom: 4rpx;
}

.permission-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

.edit-icon {
  width: 40rpx;
  height: 40rpx;
  padding: 8rpx;
}

.modal-mask {
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

.modal-content {
  width: 640rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx 24rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.close-icon {
  width: 40rpx;
  height: 40rpx;
  padding: 8rpx;
}

.modal-body {
  padding: 32rpx;
}

.edit-item {
  margin-bottom: 32rpx;
}

.edit-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 16rpx;
}

.edit-input {
  width: 100%;
  height: 88rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.edit-textarea {
  width: 100%;
  min-height: 160rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.action-buttons {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 16rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  font-size: 28rpx;
}

.share-btn {
  background: #07c160;
  color: #fff;
}

.delete-btn {
  background: #fff1f0;
  color: #ff4d4f;
}

.btn-icon {
  font-size: 32rpx;
}

.btn-text {
  font-size: 28rpx;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 32rpx 32rpx 32rpx;
  border-top: 1rpx solid #f0f0f0;
}

.btn-cancel {
  flex: 1;
  height: 88rpx;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
}

.btn-confirm {
  flex: 1;
  height: 88rpx;
  background: #07c160;
  color: #fff;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
}
</style>