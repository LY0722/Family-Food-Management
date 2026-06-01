<template>
  <view class="shopping-page">
    <!-- 没有家庭时显示的弹窗 -->
    <view v-if="!hasFamily" class="no-family-modal">
      <view class="no-family-content">
        <image src="/static/icons/family.png" class="no-family-icon" />
        <text class="no-family-title">你还未加入家庭</text>
        <text class="no-family-desc">创建后加入家庭后才能查看采购清单</text>
      </view>
    </view>
    <!-- 有家庭时显示的正常内容 -->
    <view v-else>
      <!-- 状态栏 -->
      <view class="header">
        <view class="header-title">
          【{{ currentFamily?.name || '我的家庭' }}】的采购清单
        </view>
      </view>
      <!-- 主体内容 -->
      <view class="shopping-container">
        <!-- 左侧区域 -->
        <view class="left-section">
          <view class="left-card">
            <!-- 汇总清单按钮 -->
            <button class="summary-btn" @tap="showSummary">
              <image src="/static/icons/list.png" class="btn-icon" />
              <text class="summary-text">汇总清单</text>
            </button>
            <!-- 菜谱清单 -->
            <view class="recipe-items">
              <view v-if="recipeList.length > 0">
                <view class="recipe-item" v-for="recipe in recipeList" :key="recipe.id">
                  <text class="recipe-name">{{ recipe.name }}</text>
                </view>
              </view>
              <view class="empty-recipe" v-else>
                当前暂无菜谱
              </view>
            </view>
            <!-- 去添加按钮 -->
            <button class="go-add-btn" @tap="goToRecipe">
              去添加
            </button>
          </view>
          <!-- 买菜记录按钮 -->
          <view class="history-card" @tap="goToHistory">
            <image src="/static/icons/history.png" class="history-icon" />
            <text class="history-text">买菜记录</text>
          </view>
        </view>
        <!-- 分割线阴影 -->
        <view class="divider"></view>
        <!-- 右侧区域 -->
        <view class="right-section">
          <!-- 统计数据 -->
          <view class="stats-row">
            <view class="stat-item">
              <text class="stat-label stat-black">总计</text>
              <text class="stat-value stat-black">{{ totalItems }}</text>
            </view>
            <view class="stat-divider"></view>
            <view class="stat-item">
              <text class="stat-label stat-green">已买</text>
              <text class="stat-value stat-green">{{ purchasedCount }}</text>
            </view>
            <view class="stat-divider"></view>
            <view class="stat-item">
              <text class="stat-label stat-orange">待买</text>
              <text class="stat-value stat-orange">{{ pendingCount }}</text>
            </view>
          </view>
          <!-- 进度条 -->
          <view class="progress-section">
            <text class="progress-title">购买进度 {{ progressPercent }}%</text>
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
            </view>
          </view>
          <!-- 添加自定义食材按钮 -->
          <button class="add-custom-btn" @tap="showAddCustomModal">
            + 添加自定义食材
          </button>
          <!-- 食材清单 -->
          <view class="shopping-list-section">
            <view class="list-header">
              <text class="list-title">采购清单</text>
              <text class="list-count">（{{ purchasedCount }}/{{ totalItems }}）</text>
            </view>
            <scroll-view class="items-scroll" scroll-y>
              <view 
                class="shopping-item" 
                v-for="(item, idx) in shoppingList" 
                :key="item.id"
              >
                <view 
                  class="item-checkbox" 
                  :class="{ checked: item.purchased }" 
                  @tap="toggleItem(item)"
                >
                  <text v-if="item.purchased">✔</text>
                </view>
                <view class="item-info">
                  <text class="item-name">{{ item.name }}</text>
                  <text class="item-quantity">{{ item.quantity }}</text>
                </view>
                <view class="item-delete" @tap="deleteItem(idx, item)">
                  <image src="/static/icons/delete.png" class="delete-icon" />
                </view>
              </view>
              <view class="empty-state" v-if="shoppingList.length === 0">
                暂无采购项
              </view>
            </scroll-view>
            <view class="list-actions">
              <button class="action-btn clear-btn" @tap="clearPurchased">一键清空</button>
              <button class="action-btn buy-btn" @tap="completeShopping">完成买菜</button>
            </view>
          </view>
        </view>
      </view>
      <!-- 添加自定义食材弹窗 -->
      <view v-if="showAddModal" class="modal-overlay" @tap="hideAddModal">
        <view class="modal-content" @tap.stop>
          <view class="modal-header">
            <text class="modal-title">添加自定义食材</text>
            <view class="close-btn" @tap="hideAddModal">
              <image src="/static/icons/close.png" class="close-icon" />
            </view>
          </view>
          <view class="modal-body">
            <view class="form-item">
              <text class="form-label">名称</text>
              <input class="form-input" v-model="customItem.name" placeholder="请输入食材名称" />
            </view>
            <view class="form-item">
              <text class="form-label">数量</text>
              <input class="form-input" v-model="customItem.quantity" placeholder="请输入数量" />
            </view>
            <view class="form-item">
              <text class="form-label">分类</text>
              <view class="picker" @tap="showCategoryPicker">
                <view class="picker-value">{{ customItem.category }}</view>
              </view>
            </view>
          </view>
          <view class="modal-footer">
            <button class="modal-btn cancel" @tap="hideAddModal">取消</button>
            <button class="modal-btn confirm" @tap="addCustomItem">添加</button>
          </view>
        </view>
      </view>
      
      <!-- 分类选择器（移到弹窗外面） -->
      <picker 
        v-if="showAddModal"
        mode="selector"
        :range="categories"
        :value="categoryIndex"
        @change="onCategoryChange"
        class="hidden-picker"
      />
    </view>
  </view>
</template>

<script>
import { mapState } from 'vuex'
import { requireLogin } from '@/utils/pageGuard'

export default {
  name: 'ShoppingPage',
  data() {
    return {
      shoppingList: [],
      recipeList: [],
      showAddModal: false,
      customItem: {
        name: '',
        quantity: '',
        category: '蔬菜'
      },
      categories: ['蔬菜', '水果', '肉类', '水产', '蛋奶', '粮油', '调料', '其他'],
      categoryIndex: 0
    }
  },
  computed: {
    currentFamily() {
      const family = this.$store.state.family?.currentFamily
      return family
    },
    userInfo() {
      const user = this.$store.state.user?.userInfo
      return user
    },
    hasFamily() {
      const hasCurrentFamily = !!(this.currentFamily?.id)
      const hasUserFamilyId = !!(this.userInfo?.familyId)
      const hasCurrentFamilyId = !!(this.userInfo?.currentFamilyId)
      return hasCurrentFamily || hasUserFamilyId || hasCurrentFamilyId
    },
    totalItems() {
      return this.shoppingList.length
    },
    purchasedCount() {
      return this.shoppingList.filter(item => item.purchased).length
    },
    pendingCount() {
      return this.shoppingList.filter(item => !item.purchased).length
    },
    progressPercent() {
      if (this.totalItems === 0) return 0
      return Math.round((this.purchasedCount / this.totalItems) * 100)
    }
  },
  onLoad() {
    if (!requireLogin()) {
      return
    }
    
    this.loadShoppingList()
    this.loadRecipeList()
  },
  
  onShow() {
    if (!requireLogin()) {
      return
    }
    
    this.loadShoppingList()
    this.loadRecipeList()
  },
  methods: {
    async loadShoppingList() {
      if (!this.currentFamily?.id) return
      try {
        const res = await this.$api.shopping.getShoppingList(Number(this.currentFamily.id))
        if (res.code === 200) {
          this.shoppingList = res.data.items || []
        }
      } catch (error) {
        console.error('加载采购清单失败:', error)
      }
    },
    async loadRecipeList() {
      if (!this.currentFamily?.id) return
      try {
        const res = await this.$api.recipe.recommend(Number(this.currentFamily.id), Number(this.userInfo?.id))
        if (res.code === 200) {
          this.recipeList = res.data.list || []
        }
      } catch (error) {
        console.error('加载菜谱清单失败:', error)
      }
    },
    toggleItem(item) {
      item.purchased = !item.purchased
    },
    async saveShoppingList() {
      // 可选：同步到后端
    },
    async clearPurchased() {
      const purchasedItems = this.shoppingList.filter(item => item.purchased)
      if (purchasedItems.length === 0) {
        uni.showToast({
          title: '没有勾选的食材',
          icon: 'none'
        })
        return
      }
      uni.showModal({
        title: '清空确认',
        content: `确定要清空 ${purchasedItems.length} 个勾选的食材吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const purchasedIds = purchasedItems.map(i => i.id)
              await this.$api.shopping.clearPurchasedItems({
                familyId: Number(this.currentFamily.id),
                purchasedItemIds: purchasedIds
              })
              this.shoppingList = this.shoppingList.filter(item => !item.purchased)
              uni.showToast({ title: '清空成功', icon: 'success' })
            } catch (e) {
              console.error('清空失败:', e)
              uni.showToast({ title: '清空失败', icon: 'none' })
            }
          }
        }
      })
    },
    async completeShopping() {
      const purchasedItems = this.shoppingList.filter(item => item.purchased)
      if (purchasedItems.length === 0) {
        uni.showToast({
          title: '请先勾选要购买的食材',
          icon: 'none'
        })
        return
      }
      uni.showModal({
        title: '确认买菜',
        content: `确定要购买 ${purchasedItems.length} 个食材吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({ title: '处理中...' })
              
              const purchasedIds = purchasedItems.map(i => i.id)
              await this.$api.shoppingHistory.completeShopping({
                familyId: Number(this.currentFamily.id),
                purchasedItemIds: purchasedIds
              })
              
              const remainingItems = this.shoppingList.filter(item => !item.purchased)
              this.shoppingList = remainingItems
              
              uni.hideLoading()
              uni.showToast({ title: '买菜成功', icon: 'success' })
            } catch (e) {
              console.error('买菜失败:', e)
              uni.hideLoading()
              uni.showToast({ title: '买菜失败', icon: 'none' })
            }
          }
        }
      })
    },
    showAddCustomModal() {
      this.showAddModal = true
      this.customItem = {
        name: '',
        quantity: '',
        category: this.categories[this.categoryIndex]
      }
    },
    hideAddModal() {
      this.showAddModal = false
    },
    onCategoryChange(e) {
      this.categoryIndex = e.detail.value
      this.customItem.category = this.categories[this.categoryIndex]
    },
    showCategoryPicker() {
      uni.showActionSheet({
        itemList: this.categories,
        success: (res) => {
          this.categoryIndex = res.tapIndex
          this.customItem.category = this.categories[res.tapIndex]
        }
      })
    },
    showCategoryPicker() {
      uni.showActionSheet({
        itemList: this.categories,
        success: (res) => {
          this.categoryIndex = res.tapIndex
          this.customItem.category = this.categories[res.tapIndex]
        }
      })
    },
    async addCustomItem() {
      if (!this.customItem.name.trim()) {
        uni.showToast({
          title: '请输入食材名称',
          icon: 'none'
        })
        return
      }
      if (!this.customItem.quantity.trim()) {
        uni.showToast({
          title: '请输入数量',
          icon: 'none'
        })
        return
      }
      try {
        uni.showLoading({ title: '添加中...' })
        
        const createRes = await this.$api.ingredient.create({
          name: this.customItem.name.trim(),
          category: this.customItem.category,
          unit: '个'
        })
        
        if (createRes.code === 200 && createRes.data) {
          const addRes = await this.$api.shopping.addToShoppingList({
            familyId: Number(this.currentFamily.id),
            ingredientId: createRes.data.id,
            quantity: parseFloat(this.customItem.quantity.trim()),
            priority: 1
          })
          
          if (addRes.code === 200) {
            const newItem = {
              id: addRes.data.id,
              ingredientId: createRes.data.id,
              name: this.customItem.name.trim(),
              quantity: this.customItem.quantity.trim(),
              unit: '个',
              category: this.customItem.category,
              purchased: false
            }
            this.shoppingList.push(newItem)
            this.hideAddModal()
            uni.showToast({
              title: '添加成功',
              icon: 'success'
            })
          }
        }
      } catch (e) {
        console.error('添加失败:', e)
        uni.showToast({
          title: '添加失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    deleteItem(idx, item) {
      uni.showModal({
        title: '删除确认',
        content: `确定要删除 ${item.name} 吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              await this.$api.shopping.deleteItem(item.id)
              this.shoppingList.splice(idx, 1)
              uni.showToast({ title: '删除成功', icon: 'success' })
            } catch (e) {
              uni.showToast({ title: '删除失败', icon: 'none' })
            }
          }
        }
      })
    },
    goToRecipe() {
      uni.navigateTo({
        url: '/pages/shopping/recipe/recipe'
      })
    },
    goToHistory() {
      uni.navigateTo({
        url: '/pages/shopping/shoppingHistory'
      })
    },
    showSummary() {
      uni.showToast({
        title: '汇总清单',
        icon: 'none'
      })
    }
  }
}
</script>

<style scoped>
.shopping-page {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef2 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  width: 100%;
  background: linear-gradient(135deg, #52b788 0%, #2d865a 100%);
  box-sizing: border-box;
  padding: 120rpx 0 24rpx 0;
  height: 240rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(82, 183, 136, 0.3);
  position: relative;
  z-index: 10;
}

.header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  background: linear-gradient(90deg, #b5e48c 0%, #52b788 50%, #b5e48c 100%);
}

.header-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
  margin-left: 32rpx;
  flex: 1;
  display: flex;
  align-items: center;
  letter-spacing: 1rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

.shopping-container {
  display: flex;
  flex: 1;
  width: 100%;
  background: transparent;
  box-sizing: border-box;
  overflow: hidden;
  height: calc(100vh - 240rpx);
}

.left-section {
  flex: 0 0 260rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 24rpx 0 80rpx 24rpx;
  background: transparent;
  z-index: 2;
}

.left-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 28rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
  padding: 36rpx 0 28rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 36rpx;
  border: 1rpx solid rgba(82, 183, 136, 0.1);
  margin-bottom: 0;
}

.summary-btn {
  width: 200rpx;
  height: 96rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #52b788 0%, #2d865a 100%);
  color: #fff;
  font-size: 28rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
  font-weight: 600;
  box-shadow: 0 6rpx 20rpx rgba(82, 183, 136, 0.4);
  transition: all 0.3s ease;
  padding: 0 16rpx;
  box-sizing: border-box;
}

.summary-btn:active {
  transform: scale(0.95);
  box-shadow: 0 4rpx 12rpx rgba(82, 183, 136, 0.3);
}

.btn-icon {
  width: 40rpx;
  height: 40rpx;
  flex-shrink: 0;
}

.summary-text {
  font-size: 28rpx;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recipe-items {
  width: 100%;
  min-height: 100rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 0 16rpx;
}

.recipe-item {
  font-size: 24rpx;
  color: #333;
  padding: 12rpx 16rpx;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12rpx;
  width: 100%;
  text-align: center;
  font-weight: 500;
  border: 1rpx solid rgba(82, 183, 136, 0.15);
  transition: all 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recipe-item:active {
  transform: scale(0.98);
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f3 100%);
}

.empty-recipe {
  color: #999;
  font-size: 24rpx;
  margin: 32rpx 0;
  width: 100%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 2rpx dashed #e8e8e8;
}

.go-add-btn {
  width: 200rpx;
  height: 68rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  border: none;
  background: linear-gradient(135deg, #b5e48c 0%, #52b788 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 12rpx;
  font-weight: 600;
  box-shadow: 0 4rpx 16rpx rgba(82, 183, 136, 0.3);
  transition: all 0.3s ease;
  padding: 0 16rpx;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.go-add-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 8rpx rgba(82, 183, 136, 0.2);
}

.history-card {
  width: 200rpx;
  height: 150rpx;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 28rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
  cursor: pointer;
  border: 1rpx solid rgba(82, 183, 136, 0.1);
  transition: all 0.3s ease;
  padding: 0 16rpx;
  box-sizing: border-box;
}

.history-card:active {
  transform: scale(0.95);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.history-icon {
  width: 64rpx;
  height: 64rpx;
  margin-bottom: 12rpx;
  display: block;
  flex-shrink: 0;
}

.history-text {
  font-size: 26rpx;
  color: #333;
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.divider {
  width: 0;
  margin: 0 20rpx;
  box-shadow: 6rpx 0 20rpx 0 rgba(0, 0, 0, 0.12);
  border-radius: 3rpx;
  background: transparent;
  z-index: 1;
}

.right-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 28rpx;
  padding: 24rpx 32rpx 24rpx 20rpx;
  background: transparent;
  min-width: 0;
  min-height: 0;
}

.stats-row {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 24rpx;
  padding: 28rpx 0;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 0;
  border: 1rpx solid rgba(82, 183, 136, 0.1);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.stat-label {
  font-size: 26rpx;
  font-weight: 500;
}

.stat-black {
  color: #333;
}

.stat-green {
  color: #52b788;
}

.stat-orange {
  color: #fa8c16;
}

.stat-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.stat-divider {
  width: 2rpx;
  height: 50rpx;
  background: linear-gradient(180deg, transparent 0%, #e8e8e8 50%, transparent 100%);
  margin: 0 12rpx;
  border-radius: 1rpx;
}

.progress-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  border: 1rpx solid rgba(82, 183, 136, 0.1);
}

.progress-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
  font-weight: 600;
}

.progress-bar {
  width: 100%;
  height: 16rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  overflow: hidden;
  box-shadow: inset 0 2rpx 4rpx rgba(0, 0, 0, 0.06);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #52b788 0%, #2d865a 100%);
  border-radius: 8rpx;
  transition: width 0.4s ease;
  box-shadow: 0 2rpx 8rpx rgba(82, 183, 136, 0.4);
}

.add-custom-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 20rpx;
  font-size: 30rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffa940 0%, #fa8c16 100%);
  color: white;
  box-shadow: 0 6rpx 20rpx rgba(250, 140, 22, 0.4);
  font-weight: 600;
  transition: all 0.3s ease;
}

.add-custom-btn:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(250, 140, 22, 0.3);
}

.shopping-list-section {
  flex: 1;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  border: 1rpx solid rgba(82, 183, 136, 0.1);
  min-height: 0;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 28rpx;
  background: linear-gradient(135deg, #52b788 0%, #2d865a 100%);
  box-shadow: 0 4rpx 12rpx rgba(82, 183, 136, 0.3);
}

.list-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.list-count {
  font-size: 26rpx;
  color: #fff;
  font-weight: 500;
}

.items-scroll {
  flex: 1;
  padding: 20rpx;
  overflow-y: auto;
}

.shopping-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  border: 1rpx solid rgba(82, 183, 136, 0.1);
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.shopping-item:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.item-checkbox {
  width: 44rpx;
  height: 44rpx;
  border: 3rpx solid #ddd;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
  transition: all 0.3s ease;
  background: #fff;
}

.item-checkbox.checked {
  background: linear-gradient(135deg, #52b788 0%, #2d865a 100%);
  border-color: #52b788;
  color: white;
  font-size: 26rpx;
  box-shadow: 0 4rpx 12rpx rgba(82, 183, 136, 0.4);
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.item-name {
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
}

.item-quantity {
  font-size: 24rpx;
  color: #999;
}

.item-delete {
  padding: 12rpx;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.item-delete:active {
  background: #ffe5e5;
  transform: scale(0.9);
}

.delete-icon {
  width: 36rpx;
  height: 36rpx;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  border: 2rpx dashed #e8e8e8;
  margin: 20rpx;
}

.list-actions {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  border-top: 1rpx solid #f0f0f0;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.action-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
  padding: 0 16rpx;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-btn:active {
  transform: scale(0.98);
}

.clear-btn {
  background: linear-gradient(135deg, #f0f2f5 0%, #e8e8e8 100%);
  color: #666;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.clear-btn:active {
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.15);
}

.buy-btn {
  background: linear-gradient(135deg, #52b788 0%, #2d865a 100%);
  color: white;
  box-shadow: 0 6rpx 20rpx rgba(82, 183, 136, 0.4);
}

.buy-btn:active {
  box-shadow: 0 4rpx 12rpx rgba(82, 183, 136, 0.3);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  width: 640rpx;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  border: 1rpx solid rgba(82, 183, 136, 0.1);
}

@keyframes slideUp {
  from {
    transform: translateY(40rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 28rpx;
  border-bottom: 1rpx solid #f0f0f0;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.modal-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.close-btn {
  padding: 16rpx;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.close-btn:active {
  background: #f0f0f0;
  transform: scale(0.9);
}

.close-icon {
  width: 36rpx;
  height: 36rpx;
}

.modal-body {
  padding: 32rpx 28rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
  font-weight: 600;
}

.form-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #333;
  border: 2rpx solid #e8e8e8;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #52b788;
  background: #fff;
  box-shadow: 0 4rpx 12rpx rgba(82, 183, 136, 0.2);
}

.picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #333;
  border: 2rpx solid #e8e8e8;
  transition: all 0.3s ease;
  position: relative;
}

.picker::after {
  content: '';
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 12rpx solid transparent;
  border-right: 12rpx solid transparent;
  border-top: 12rpx solid #999;
}

.picker-value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  padding-right: 32rpx;
}

.picker:active {
  border-color: #52b788;
  background: #fff;
}

.picker-icon {
  width: 36rpx;
  height: 36rpx;
}

.modal-footer {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 28rpx;
  border-top: 1rpx solid #f0f0f0;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.modal-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
}

.modal-btn:active {
  transform: scale(0.98);
}

.modal-btn.cancel {
  background: linear-gradient(135deg, #f0f2f5 0%, #e8e8e8 100%);
  color: #666;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.modal-btn.confirm {
  background: linear-gradient(135deg, #52b788 0%, #2d865a 100%);
  color: white;
  box-shadow: 0 6rpx 20rpx rgba(82, 183, 136, 0.4);
}

.hidden-picker {
  position: fixed;
  left: -9999rpx;
  top: -9999rpx;
  width: 0;
  height: 0;
  opacity: 0;
}

.hidden-picker {
  position: fixed;
  left: -9999rpx;
  top: -9999rpx;
  width: 0;
  height: 0;
  opacity: 0;
}

.no-family-modal {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef2 100%);
}

.no-family-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 60rpx;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 32rpx;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.15);
  border: 1rpx solid rgba(82, 183, 136, 0.1);
}

.no-family-icon {
  width: 140rpx;
  height: 140rpx;
  margin-bottom: 32rpx;
}

.no-family-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16rpx;
}

.no-family-desc {
  font-size: 28rpx;
  color: #999;
  text-align: center;
  line-height: 1.6;
}
</style>