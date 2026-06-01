<!-- 
 * 文件路径：/pages/shopping/recipe/recipe.vue
 * 文件说明：菜谱页面，网格布局
-->
<template>
  <view class="recipe-page">
    <!-- 状态栏 -->
    <view class="header">
      <view class="header-left" @tap="goBack">
        <image src="/static/icons/arrow-left.png" class="back-icon"/>
      </view>
      <view class="header-center">
        <text class="header-title">菜谱</text>
      </view>
      <view class="header-right" @tap="createRecipe">
        <image src="/static/icons/add.png" class="add-icon"/>
      </view>
    </view>
    
    <!-- 搜索栏 -->
    <view class="search-section">
      <view class="search-bar">
        <image src="/static/icons/search.png" class="search-icon" />
        <input 
          class="search-input" 
          v-model="searchKeyword"
          placeholder="搜索菜谱..."
          @confirm="handleSearch"
        />
      </view>
    </view>
    
    <!-- 分类标签栏 -->
    <scroll-view class="category-scroll" scroll-x>
      <view 
        v-for="category in categories" 
        :key="category.id"
        class="category-tag"
        :class="{ active: activeCategory === category.id }"
        @tap="selectCategory(category.id)"
      >
        <text class="category-text">{{ category.name }}</text>
      </view>
    </scroll-view>
    
    <!-- 菜谱网格列表 -->
    <scroll-view class="recipe-grid" scroll-y @scrolltolower="loadMore">
      <view class="grid-container">
        <view 
          v-for="recipe in recipeList" 
          :key="recipe.id"
          class="recipe-card"
          @tap="viewRecipeDetail(recipe)"
        >
          <view class="card-image-wrapper">
            <image 
              :src="recipe.imageUrl || '/static/images/recipe-default.jpg'" 
              class="recipe-image"
              mode="aspectFill"
            />
            <view class="card-overlay">
              <view class="time-badge">
                <image src="/static/icons/time.png" class="badge-icon" />
                <text class="badge-text">{{ recipe.cookingTime || 30 }}分钟</text>
              </view>
            </view>
          </view>
          
          <view class="card-content">
            <text class="recipe-name">{{ recipe.name }}</text>
            <view class="recipe-tags">
              <text class="tag" v-if="recipe.category">{{ recipe.category }}</text>
              <text class="tag" v-if="recipe.difficulty">难度{{ recipe.difficulty }}星</text>
            </view>
          </view>
          
          <view class="card-actions">
            <view class="action-btn" @tap.stop="addToShoppingList(recipe)">
              <image src="/static/icons/add.png" class="action-icon" />
              <text class="action-text">加入清单</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 加载状态 -->
      <view class="loading-more" v-if="loading">
        <text>加载中...</text>
      </view>
      
      <!-- 没有更多 -->
      <view class="no-more" v-if="noMore && recipeList.length > 0">
        <text>没有更多了</text>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-if="recipeList.length === 0 && !loading">
        <image src="/static/icons/empty.png" class="empty-icon" />
        <text class="empty-text">暂无菜谱</text>
        <text class="empty-tip">点击下方按钮创建菜谱</text>
      </view>
    </scroll-view>
    
    <!-- 悬浮创建按钮 -->
    <view class="fab-button" @tap="createRecipe">
      <view class="fab-icon">
        <text class="fab-plus">+</text>
      </view>
      <text class="fab-text">创建菜谱</text>
    </view>
  </view>
</template>

<script>
import { mapState } from 'vuex'
import { requireLogin } from '@/utils/pageGuard'

export default {
  name: 'RecipePage',
  
  data() {
    return {
      activeCategory: 'all',
      searchKeyword: '',
      recipeList: [],
      loading: false,
      noMore: false,
      page: 1,
      pageSize: 10,
      categories: [
        { id: 'all', name: '全部' },
        { id: 'meat', name: '荤菜' },
        { id: 'vegetable', name: '素菜' },
        { id: 'soup', name: '汤类' },
        { id: 'staple', name: '主食' },
        { id: 'dessert', name: '甜品' }
      ]
    }
  },
  
  computed: {
    ...mapState('user', ['userInfo'])
  },
  
  onLoad() {
    if (!requireLogin()) {
      return
    }
    
    this.loadRecipes()
  },
  onShow() {
    if (!requireLogin()) {
      return
    }
    
    this.loadRecipes()
  },
  
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    selectCategory(categoryId) {
      this.activeCategory = categoryId
      this.page = 1
      this.noMore = false
      this.recipeList = []
      this.loadRecipes()
    },
    
    async loadRecipes() {
      if (this.loading || this.noMore) return
      
      this.loading = true
      
      try {
        const params = {
          category: this.activeCategory === 'all' ? undefined : this.activeCategory,
          keyword: this.searchKeyword || undefined,
          page: this.page - 1,
          pageSize: this.pageSize
        }
        
        Object.keys(params).forEach(key => {
          if (params[key] === undefined) {
            delete params[key]
          }
        })
        
        const response = await this.$api.recipe.getRecipes(params)
        
        if (response.code === 200) {
          const list = response.data.list || []
          
          if (this.page === 1) {
            this.recipeList = list
          } else {
            this.recipeList = [...this.recipeList, ...list]
          }
          
          this.noMore = list.length < this.pageSize
        }
      } catch (error) {
        console.error('加载菜谱失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    loadMore() {
      if (!this.loading && !this.noMore) {
        this.page++
        this.loadRecipes()
      }
    },
    
    handleSearch() {
      this.page = 1
      this.noMore = false
      this.recipeList = []
      this.loadRecipes()
    },
    
    viewRecipeDetail(recipe) {
      uni.navigateTo({
        url: `/pages/recipe/detail?id=${recipe.id}`
      })
    },
    
    addToShoppingList(recipe) {
      uni.showModal({
        title: '添加到采购清单',
        content: `确定要将 ${recipe.name} 的食材添加到采购清单吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const response = await this.$api.shopping.addBatch({
                familyId: Number(this.currentFamily?.id),
                recipeId: recipe.id
              })
              
              if (response.code === 200) {
                uni.showToast({
                  title: '添加成功',
                  icon: 'success'
                })
              }
            } catch (error) {
              console.error('添加失败:', error)
            }
          }
        }
      })
    },
    
    createRecipe() {
      uni.navigateTo({
        url: '/pages/shopping/recipe/create'
      })
    }
  }
}
</script>

<style scoped>
.recipe-page {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  padding-top: calc(var(--status-bar-height) + 50rpx);
  background: rgba(255,255,255, 0.98);
  backdrop-filter: blur(10px);
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
  z-index: 100;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
  position: relative;
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

.add-icon {
  width: 44rpx;
  height: 44rpx;
}

.header-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 1rpx;
}

.search-section {
  padding: 20rpx 24rpx;
  background: white;
  flex-shrink: 0;
  position: relative;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  border: 2rpx solid #f0f0f0;
}

.search-icon {
  width: 36rpx;
  height: 36rpx;
  opacity: 0.5;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  background: transparent;
  border: none;
}

.category-scroll {
  padding: 20rpx 24rpx;
  background: white;
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  position: relative;
}

.category-tag {
  display: inline-flex;
  align-items: center;
  padding: 16rpx 32rpx;
  margin-right: 16rpx;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 32rpx;
  border: 2rpx solid #e8e8e8;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.category-tag.active {
  background: linear-gradient(135deg, #52b788 0%, #2d865a 100%);
  border-color: #52b788;
  box-shadow: 0 4rpx 12rpx rgba(82, 183, 136, 0.3);
}

.category-text {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.category-tag.active .category-text {
  color: white;
  font-weight: 600;
}

.recipe-grid {
  flex: 1;
  padding: 24rpx;
  box-sizing: border-box;
  overflow-y: auto;
  position: relative;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.recipe-card {
  background: white;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.recipe-card:active {
  transform: scale(0.96);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
}

.card-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 75%;
  background: #f8f9fa;
}

.recipe-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 16rpx;
}

.time-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  border-radius: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.badge-icon {
  width: 24rpx;
  height: 24rpx;
}

.badge-text {
  font-size: 22rpx;
  color: #666;
  font-weight: 500;
}

.card-content {
  padding: 20rpx;
}

.recipe-name {
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.4;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.tag {
  padding: 6rpx 12rpx;
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f3 100%);
  border-radius: 12rpx;
  font-size: 22rpx;
  color: #52b788;
  font-weight: 500;
}

.card-actions {
  padding: 0 20rpx 20rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx;
  background: linear-gradient(135deg, #52b788 0%, #2d865a 100%);
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(82, 183, 136, 0.3);
  transition: all 0.3s;
}

.action-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 8rpx rgba(82, 183, 136, 0.2);
}

.action-icon {
  width: 32rpx;
  height: 32rpx;
}

.action-text {
  font-size: 26rpx;
  color: white;
  font-weight: 600;
}

.loading-more,
.no-more {
  text-align: center;
  padding: 40rpx 0;
  font-size: 26rpx;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  gap: 16rpx;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  opacity: 0.3;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  font-weight: 500;
}

.empty-tip {
  font-size: 24rpx;
  color: #bbb;
}

.fab-button {
  position: fixed;
  right: 32rpx;
  bottom: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  z-index: 1000;
}

.fab-icon {
  width: 112rpx;
  height: 112rpx;
  background: linear-gradient(135deg, #52b788 0%, #2d865a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(82, 183, 136, 0.4), 0 0 0 0 rgba(82, 183, 136, 0.4);
  animation: pulse 2s infinite;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-button:active .fab-icon {
  transform: scale(0.9);
  box-shadow: 0 4rpx 12rpx rgba(82, 183, 136, 0.3), 0 0 0 0 rgba(82, 183, 136, 0);
}

@keyframes pulse {
  0% {
    box-shadow: 0 8rpx 24rpx rgba(82, 183, 136, 0.4), 0 0 0 0 rgba(82, 183, 136, 0.4);
  }
  70% {
    box-shadow: 0 8rpx 24rpx rgba(82, 183, 136, 0.4), 0 0 0 20rpx rgba(82, 183, 136, 0);
  }
  100% {
    box-shadow: 0 8rpx 24rpx rgba(82, 183, 136, 0.4), 0 0 0 0 rgba(82, 183, 136, 0);
  }
}

.fab-plus {
  font-size: 64rpx;
  color: white;
  font-weight: 300;
  line-height: 1;
}

.fab-text {
  font-size: 24rpx;
  color: #52b788;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.95);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}
</style>