<template>
  <view class="recipe-inventory-card">
    <view class="card-header">
      <view class="title">智能推荐</view>
      <view class="tab-buttons">
        <view 
          class="tab-btn" 
          :class="{ active: activeTab === 'recipe' }" 
          @tap="switchTab('recipe')"
        >
          菜谱
        </view>
        <view 
          class="tab-btn" 
          :class="{ active: activeTab === 'ingredient' }" 
          @tap="switchTab('ingredient')"
        >
          食材
        </view>
      </view>
    </view>

    <view v-show="activeTab === 'recipe'" class="tab-content">
      <view class="meal-section">
        <view class="meal-row" v-for="meal in meals" :key="meal.type">
          <view class="meal-title">{{ meal.label }}</view>
          <view class="meal-recommend" @tap="openEditMeal(meal.type)">
            <text>{{ mealRecommend[meal.type]?.name || '点击编辑' }}</text>
            <view class="edit-icon">编辑</view>
          </view>
        </view>
      </view>
    </view>

    <view v-show="activeTab === 'ingredient'" class="tab-content">
      <view class="ingredient-section">
        <view class="section-title">建议补充</view>
        <view class="ingredient-list">
          <view class="ingredient-item" v-for="item in suggestList" :key="item.name">
            <text class="ingredient-name">{{ item.name }}</text>
            <text class="urgent-tag" :class="item.urgentLevel">{{ item.urgentText }}</text>
          </view>
          <view v-if="suggestList.length === 0" class="empty-text">暂无建议补充</view>
        </view>
        
        <view class="section-title">现有库存</view>
        <view class="ingredient-list">
          <view class="ingredient-item" v-for="item in inventoryList" :key="item.name">
            <text class="ingredient-name">{{ item.name }}</text>
            <text class="inventory-tag" :class="item.status">{{ item.statusText }}</text>
          </view>
          <view v-if="inventoryList.length === 0" class="empty-text">暂无库存</view>
        </view>
      </view>
    </view>

    <view v-if="showEditMeal" class="popup-overlay" @tap="closeEditMeal">
      <view class="popup-content" @tap.stop>
        <view class="popup-header">
          <view class="popup-title">选择{{ mealsMap[editMealType] }}推荐菜</view>
          <view class="popup-close" @tap="closeEditMeal">关闭</view>
        </view>
        <view class="popup-body">
          <button class="popup-btn" @tap="chooseFromRecipe">
            <text class="btn-icon">📖</text>
            <text>从菜谱选择</text>
          </button>
          <button class="popup-btn" @tap="inputCustomDish">
            <text class="btn-icon">✏️</text>
            <text>输入自定义菜品</text>
          </button>
        </view>
      </view>
    </view>

    <view v-if="showCustomDish" class="popup-overlay" @tap="closeCustomDish">
      <view class="popup-content" @tap.stop>
        <view class="popup-header">
          <view class="popup-title">输入自定义菜品</view>
          <view class="popup-close" @tap="closeCustomDish">关闭</view>
        </view>
        <view class="popup-body">
          <input class="custom-dish-input" v-model="customDishName" placeholder="请输入菜品名称" />
          <view class="popup-btns">
            <button class="popup-btn secondary" @tap="closeCustomDish">取消</button>
            <button class="popup-btn primary" @tap="confirmCustomDish">确定</button>
          </view>
        </view>
      </view>
    </view>

    <view v-if="showRecipePicker" class="popup-overlay" @tap="closeRecipePicker">
      <view class="popup-content recipe-picker" @tap.stop>
        <view class="popup-header">
          <view class="popup-title">从菜谱选择</view>
          <view class="popup-close" @tap="closeRecipePicker">关闭</view>
        </view>
        <scroll-view class="recipe-list" scroll-y>
          <view 
            class="recipe-item" 
            v-for="recipe in myRecipeList" 
            :key="recipe.id" 
            @tap="selectRecipe(recipe)"
          >
            <text class="recipe-name">{{ recipe.name }}</text>
          </view>
          <view v-if="myRecipeList.length === 0" class="empty-text">暂无菜谱</view>
        </scroll-view>
      </view>
    </view>
  <loading v-if="loading" />
  </view>
</template>

<script>
export default {
  name: 'RecipeAndInventoryCard',
  props: {
    selectedDate: {
      type: Date,
      default: () => new Date()
    }
  },
  data() {
    return {
      activeTab: 'recipe',
      loading: false,
      meals: [
        { type: 'breakfast', label: '早餐' },
        { type: 'lunch', label: '午餐' },
        { type: 'dinner', label: '晚餐' }
      ],
      mealsMap: {
        breakfast: '早餐',
        lunch: '午餐',
        dinner: '晚餐'
      },
      mealRecommend: {
        breakfast: null,
        lunch: null,
        dinner: null
      },
      showEditMeal: false,
      editMealType: '',
      showCustomDish: false,
      customDishName: '',
      showRecipePicker: false,
      myRecipeList: [],
      suggestList: [],
      inventoryList: [],
      // 本地缓存：保存每个日期的用餐记录
      mealRecordsCache: {}
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$store && this.$api) {
        this.loadDayMealRecords()
        this.loadSuggestList()
        this.loadInventoryList()
      }
    })
  },
  watch: {
    selectedDate: {
      handler(newVal) {
        if (newVal) {
          this.loadDayMealRecords()
        }
      },
      deep: true
    },
    mealRecommend: {
      handler(newVal) {
        // 当 mealRecommend 变化时，保存到缓存
        this.saveToCache(newVal)
      },
      deep: true
    }
  },
  methods: {
    // 获取当前日期的缓存key
    getDateKey() {
      return `${this.selectedDate.getFullYear()}-${String(this.selectedDate.getMonth() + 1).padStart(2, '0')}-${String(this.selectedDate.getDate()).padStart(2, '0')}`
    },
    
    // 保存到缓存
    saveToCache(mealData) {
      const dateKey = this.getDateKey()
      this.$set(this.mealRecordsCache, dateKey, {
        breakfast: mealData.breakfast,
        lunch: mealData.lunch,
        dinner: mealData.dinner
      })
    },
    
    // 从缓存加载
    loadFromCache() {
      const dateKey = this.getDateKey()
      const cached = this.mealRecordsCache[dateKey]
      if (cached) {
        this.mealRecommend = {
          breakfast: cached.breakfast,
          lunch: cached.lunch,
          dinner: cached.dinner
        }
        return true
      }
      return false
    },
    
    switchTab(tab) {
      this.activeTab = tab
      if (tab === 'ingredient') {
        this.loadSuggestList()
        this.loadInventoryList()
      }
    },
    
    async loadDayMealRecords() {
      const familyId = this.$store.state.user?.currentFamily?.id
      if (!familyId) return
      
      const dateStr = `${this.selectedDate.getFullYear()}-${String(this.selectedDate.getMonth() + 1).padStart(2, '0')}-${String(this.selectedDate.getDate()).padStart(2, '0')}`
      
      this.loading = true
      try {
        const res = await this.$api.recipe.getDayRecords(Number(familyId), dateStr)
        if (res.code === 200 && res.data) {
          const records = res.data
          // 先构建完整的新数据对象
          const newMealRecommend = {
            breakfast: null,
            lunch: null,
            dinner: null
          }
          this.meals.forEach(meal => {
            const record = records.find(r => r.mealType === meal.type)
            if (record) {
              newMealRecommend[meal.type] = {
                id: record.id,
                name: record.name,
                description: record.description,
                cover: record.cover
              }
            }
          })
          // 一次性替换整个对象，只触发一次 watch
          this.mealRecommend = newMealRecommend
        } else {
          // 如果数据库中没有记录，尝试从缓存加载
          if (!this.loadFromCache()) {
            // 如果缓存也没有，清空显示
            this.mealRecommend = {
              breakfast: null,
              lunch: null,
              dinner: null
            }
          }
        }
      } catch (e) {
        console.error('加载用餐记录失败:', e)
        // 加载失败时，尝试从缓存加载
        if (!this.loadFromCache()) {
          this.mealRecommend = {
            breakfast: null,
            lunch: null,
            dinner: null
          }
        }
      } finally {
        this.loading = false
      }
    },
    
    openEditMeal(type) {
      this.editMealType = type
      this.showEditMeal = true
    },
    
    closeEditMeal() {
      this.showEditMeal = false
    },
    
    async chooseFromRecipe() {
      this.showEditMeal = false
      this.showRecipePicker = true
      await this.loadMyRecipeList()
    },
    
    async loadMyRecipeList() {
      this.loading = true
      try {
        const res = await this.$api.recipe.getRecipes({ page: 0, pageSize: 100 })
        if (res.code === 200 && res.data.list) {
          this.myRecipeList = res.data.list.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            cover: item.imageUrl || item.cover
          }))
        } else {
          this.myRecipeList = []
        }
      } catch (e) {
        console.error('加载菜谱列表失败:', e)
        this.myRecipeList = []
      } finally {
        this.loading = false
      }
    },
    
    async selectRecipe(recipe) {
      const familyId = this.$store.state.user?.currentFamily?.id
      const userId = this.$store.state.user?.userInfo?.id
      if (!familyId || !userId) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        return
      }
      
      this.loading = true
      try {
        const dateStr = `${this.selectedDate.getFullYear()}-${String(this.selectedDate.getMonth() + 1).padStart(2, '0')}-${String(this.selectedDate.getDate()).padStart(2, '0')}`
        const res = await this.$api.recipe.saveMealRecord(Number(familyId), Number(userId), Number(recipe.id), this.editMealType, dateStr)
        if (res.code === 200) {
          this.$set(this.mealRecommend, this.editMealType, recipe)
          this.showRecipePicker = false
          uni.showToast({ title: '保存成功', icon: 'success' })
        } else {
          uni.showToast({ title: res.message || '保存失败', icon: 'none' })
        }
      } catch (e) {
        console.error('保存用餐记录失败:', e)
        uni.showToast({ title: '保存失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    
    closeRecipePicker() {
      this.showRecipePicker = false
    },
    
    inputCustomDish() {
      this.showEditMeal = false
      this.customDishName = ''
      this.showCustomDish = true
    },
    
    closeCustomDish() {
      this.showCustomDish = false
    },
    
    async confirmCustomDish() {
      if (!this.customDishName.trim()) {
        uni.showToast({ title: '请输入菜品名称', icon: 'none' })
        return
      }
      
      const familyId = this.$store.state.user?.currentFamily?.id
      const userId = this.$store.state.user?.userInfo?.id
      if (!familyId || !userId) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        return
      }
      
      this.loading = true
      try {
        const dateStr = `${this.selectedDate.getFullYear()}-${String(this.selectedDate.getMonth() + 1).padStart(2, '0')}-${String(this.selectedDate.getDate()).padStart(2, '0')}`
        const res = await this.$api.recipe.saveMealRecord(Number(familyId), Number(userId), 0, this.editMealType, dateStr, this.customDishName.trim())
        if (res.code === 200) {
          this.$set(this.mealRecommend, this.editMealType, { 
            id: 0,
            name: this.customDishName.trim(),
            description: '自定义菜品',
            cover: ''
          })
          uni.showToast({ title: '保存成功', icon: 'success' })
          this.showCustomDish = false
        } else {
          uni.showToast({ title: res.message || '保存失败', icon: 'none' })
        }
      } catch (e) {
        console.error('保存用餐记录失败:', e)
        uni.showToast({ title: '保存失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    
    async loadSuggestList() {
      const familyId = this.$store.state.user?.currentFamily?.id
      if (!familyId) return
      
      this.loading = true
      try {
        const res = await this.$api.inventory.getLowStock(Number(familyId))
        if (res.code === 200 && res.data.items) {
          this.suggestList = res.data.items.map(item => ({
            name: item.ingredientName,
            urgentText: this.getUrgentText(item.suggestedQuantity, item.quantity),
            urgentLevel: this.getUrgentLevel(item.suggestedQuantity, item.quantity)
          }))
        } else {
          this.suggestList = []
        }
      } catch (e) {
        this.suggestList = []
      } finally {
        this.loading = false
      }
    },
    
    getUrgentText(suggested, current) {
      if (current === 0) return '非常紧急'
      if (current < suggested * 0.3) return '紧急'
      if (current < suggested * 0.6) return '关注'
      return '充足'
    },
    
    getUrgentLevel(suggested, current) {
      if (current === 0) return 'urgent-high'
      if (current < suggested * 0.3) return 'urgent-mid'
      if (current < suggested * 0.6) return 'urgent-low'
      return ''
    },
    
    async loadInventoryList() {
      const familyId = this.$store.state.user?.currentFamily?.id
      if (!familyId) return
      
      this.loading = true
      try {
        const res = await this.$api.inventory.getFamilyInventory(Number(familyId))
        if (res.code === 200 && Array.isArray(res.data)) {
          this.inventoryList = res.data.map(item => ({
            name: item.ingredientName,
            status: this.getInventoryStatus(item.expiryDate),
            statusText: this.getInventoryStatusText(item.expiryDate)
          }))
        } else {
          this.inventoryList = []
        }
      } catch (e) {
        this.inventoryList = []
      } finally {
        this.loading = false
      }
    },
    
    getInventoryStatus(expiryDate) {
      if (!expiryDate) return 'normal'
      const today = new Date()
      const expiry = new Date(expiryDate)
      const diff = (expiry - today) / (1000 * 3600 * 24)
      if (diff < 0) return 'expired'
      if (diff < 3) return 'warning'
      return 'normal'
    },
    
    getInventoryStatusText(expiryDate) {
      if (!expiryDate) return '新鲜'
      const today = new Date()
      const expiry = new Date(expiryDate)
      const diff = (expiry - today) / (1000 * 3600 * 24)
      if (diff < 0) return '过期'
      if (diff < 3) return '临期'
      return '新鲜'
    }
  }
}
</script>

<style scoped>
.recipe-inventory-card {
  margin: 32rpx 24rpx;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
  padding: 32rpx;
  position: relative;
  overflow: hidden;
}

.recipe-inventory-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  background: linear-gradient(90deg, #52b788 0%, #b5e48c 50%, #52b788 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 1rpx;
}

.tab-buttons {
  display: flex;
  gap: 12rpx;
  background: #f0f2f5;
  padding: 6rpx;
  border-radius: 16rpx;
}

.tab-btn {
  padding: 16rpx 32rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #666;
  background: transparent;
  transition: all 0.3s ease;
  font-weight: 500;
}

.tab-btn.active {
  background: linear-gradient(135deg, #52b788 0%, #2d865a 100%);
  color: #fff;
  box-shadow: 0 4rpx 12rpx rgba(45, 134, 90, 0.3);
}

.tab-content {
  min-height: 300rpx;
}

.meal-section {
  padding: 16rpx 0;
}

.meal-row {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  transition: all 0.3s ease;
}

.meal-row:last-child {
  border-bottom: none;
}

.meal-row:active {
  transform: scale(0.98);
}

.meal-title {
  width: 140rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: #333;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.meal-title::before {
  content: '';
  width: 8rpx;
  height: 32rpx;
  background: linear-gradient(135deg, #52b788, #2d865a);
  border-radius: 4rpx;
}

.meal-recommend {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 28rpx;
  color: #52b788;
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f3 100%);
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  transition: all 0.3s ease;
}

.meal-recommend:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(82, 183, 136, 0.2);
}

.edit-icon {
  padding: 10rpx 20rpx;
  background: linear-gradient(135deg, #52b788, #2d865a);
  color: #fff;
  border-radius: 12rpx;
  font-size: 22rpx;
  font-weight: 500;
  box-shadow: 0 2rpx 8rpx rgba(82, 183, 136, 0.3);
}

.ingredient-section {
  padding: 16rpx 0;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin: 32rpx 0 20rpx 0;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.section-title::before {
  content: '';
  width: 8rpx;
  height: 32rpx;
  background: linear-gradient(135deg, #52b788, #2d865a);
  border-radius: 4rpx;
}

.section-title:first-child {
  margin-top: 0;
}

.ingredient-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.ingredient-item {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16rpx;
  padding: 16rpx 24rpx;
  font-size: 26rpx;
  color: #333;
  display: flex;
  align-items: center;
  gap: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid #f0f0f0;
  transition: all 0.3s ease;
}

.ingredient-item:active {
  transform: scale(0.95);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.ingredient-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.urgent-tag {
  font-size: 20rpx;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  font-weight: 600;
}

.urgent-high {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
  color: #fff;
  box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.3);
}

.urgent-mid {
  background: linear-gradient(135deg, #ffa940 0%, #fa8c16 100%);
  color: #fff;
  box-shadow: 0 2rpx 8rpx rgba(255, 169, 64, 0.3);
}

.urgent-low {
  background: linear-gradient(135deg, #ffd666 0%, #ffc53d 100%);
  color: #fff;
  box-shadow: 0 2rpx 8rpx rgba(255, 214, 102, 0.3);
}

.inventory-tag {
  font-size: 20rpx;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  font-weight: 600;
}

.normal {
  background: linear-gradient(135deg, #52b788 0%, #2d865a 100%);
  color: #fff;
  box-shadow: 0 2rpx 8rpx rgba(82, 183, 136, 0.3);
}

.warning {
  background: linear-gradient(135deg, #ffa940 0%, #fa8c16 100%);
  color: #fff;
  box-shadow: 0 2rpx 8rpx rgba(255, 169, 64, 0.3);
}

.expired {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
  color: #fff;
  box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.3);
}

.empty-text {
  color: #999;
  font-size: 26rpx;
  padding: 60rpx 0;
  width: 100%;
  text-align: center;
  background: #f8f9fa;
  border-radius: 16rpx;
  border: 2rpx dashed #e8e8e8;
}

.popup-overlay {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8rpx);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
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

.popup-content {
  width: 100%;
  max-width: 600rpx;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 32rpx;
  overflow: hidden;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
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

.popup-content.recipe-picker {
  max-height: 70vh;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 36rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.popup-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.popup-close {
  font-size: 28rpx;
  color: #999;
  padding: 12rpx 20rpx;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.popup-close:active {
  background: #f0f0f0;
  color: #666;
}

.popup-body {
  padding: 36rpx 32rpx;
}

.popup-btn {
  width: 100%;
  height: 104rpx;
  border-radius: 20rpx;
  font-size: 28rpx;
  border: none;
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f3 100%);
  color: #52b788;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 12rpx rgba(82, 183, 136, 0.2);
}

.popup-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(82, 183, 136, 0.3);
}

.popup-btn:last-child {
  margin-bottom: 0;
}

.popup-btn.primary {
  background: linear-gradient(135deg, #52b788 0%, #2d865a 100%);
  color: #fff;
  box-shadow: 0 4rpx 12rpx rgba(82, 183, 136, 0.4);
}

.popup-btn.secondary {
  background: linear-gradient(135deg, #f0f2f5 0%, #e8e8e8 100%);
  color: #666;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.btn-icon {
  font-size: 40rpx;
}

.popup-btns {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.popup-btns .popup-btn {
  flex: 1;
  margin-bottom: 0;
}

.custom-dish-input {
  width: 100%;
  height: 96rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  border: 2rpx solid #e8e8e8;
  padding: 0 28rpx;
  background: #fff;
  box-sizing: border-box;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.custom-dish-input:focus {
  border-color: #52b788;
  box-shadow: 0 4rpx 12rpx rgba(82, 183, 136, 0.2);
}

.recipe-list {
  max-height: 500rpx;
  overflow-y: auto;
}

.recipe-item {
  padding: 32rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.recipe-item:active {
  background: #f8f9fa;
  transform: scale(0.98);
}

.recipe-item:last-child {
  border-bottom: none;
}

.recipe-name {
  font-size: 30rpx;
  color: #333;
  flex: 1;
  font-weight: 500;
}

.recipe-match {
  font-size: 22rpx;
  color: #52b788;
  padding: 6rpx 16rpx;
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f3 100%);
  border-radius: 16rpx;
  font-weight: 600;
  box-shadow: 0 2rpx 8rpx rgba(82, 183, 136, 0.2);
}
</style>