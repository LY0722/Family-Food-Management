<!-- 
 * 文件路径：/components/modules/RecipeCard.vue
 * 文件说明：模块通用菜谱卡片组件，展示菜谱基础信息
-->
<template>
  <view class="recipe-card card" @tap="$emit('tap', recipe)">
    <view class="recipe-image">
      <image 
        :src="recipe.image || '/static/images/recipe-default.jpg'" 
        class="recipe-img"
        mode="aspectFill"
      />
      <view class="recipe-overlay">
        <text class="recipe-name">{{ recipe.name }}</text>
        <view class="recipe-info">
          <view class="info-item">
            <image src="/static/icons/time.png" class="info-icon" />
            <text>{{ recipe.cookTime }}分钟</text>
          </view>
          <view class="info-item">
            <image src="/static/icons/calories.png" class="info-icon" />
            <text>{{ recipe.calories }}千卡</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="recipe-content">
      <view class="recipe-tags">
        <text class="tag-category">{{ recipe.category }}</text>
        <text class="tag-difficulty" :class="difficultyClass">
          {{ recipe.difficulty }}
        </text>
      </view>
      
      <text class="recipe-description" v-if="recipe.description">
        {{ recipe.description }}
      </text>
      
      <view class="recipe-ingredients">
        <text class="ingredients-title">主要食材:</text>
        <text class="ingredients-list">
          {{ formatIngredients(recipe.ingredients) }}
        </text>
      </view>
    </view>
    
    <view class="recipe-footer" v-if="showActions">
      <button class="btn-cook" @tap.stop="$emit('cook', recipe)">
        开始制作
      </button>
      <button class="btn-favorite" @tap.stop="toggleFavorite">
        <image 
          :src="recipe.favorite ? '/static/icons/heart-filled.png' : '/static/icons/heart.png'" 
          class="favorite-icon"
        />
      </button>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    recipe: {
      type: Object,
      default: () => ({
        id: '',
        name: '',
        image: '',
        category: '',
        difficulty: '简单',
        cookTime: 0,
        calories: 0,
        description: '',
        ingredients: [],
        favorite: false
      })
    },
    showActions: {
      type: Boolean,
      default: true
    }
  },
  
  computed: {
    difficultyClass() {
      const classes = {
        '简单': 'difficulty-easy',
        '中等': 'difficulty-medium',
        '困难': 'difficulty-hard'
      }
      return classes[this.recipe.difficulty] || 'difficulty-easy'
    }
  },
  
  methods: {
    formatIngredients(ingredients) {
      if (!ingredients || !Array.isArray(ingredients)) return ''
      
      return ingredients
        .slice(0, 3)
        .map(ing => ing.name)
        .join('、') + (ingredients.length > 3 ? '等' : '')
    },
    
    toggleFavorite() {
      this.$emit('favorite', { ...this.recipe, favorite: !this.recipe.favorite })
    }
  }
}
</script>

<style scoped>
.recipe-card {
  margin-bottom: 20rpx;
}

.recipe-image {
  position: relative;
  height: 200rpx;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.recipe-img {
  width: 100%;
  height: 100%;
}

.recipe-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
}

.recipe-name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recipe-info {
  display: flex;
  gap: 20rpx;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 22rpx;
  opacity: 0.9;
}

.info-icon {
  width: 24rpx;
  height: 24rpx;
  margin-right: 6rpx;
}

.recipe-content {
  padding: 0 8rpx;
}

.recipe-tags {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.tag-category,
.tag-difficulty {
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.tag-category {
  background-color: #e8f4ff;
  color: #1989fa;
}

.tag-difficulty {
  background-color: #f8f9fa;
  color: #666;
}

.difficulty-easy {
  background-color: #e7f7ef;
  color: #07c160;
}

.difficulty-medium {
  background-color: #fff4e5;
  color: #ff9500;
}

.difficulty-hard {
  background-color: #ffe5e5;
  color: #ff3b30;
}

.recipe-description {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 20rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.recipe-ingredients {
  padding: 16rpx;
  background-color: #f8f9fa;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
}

.ingredients-title {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.ingredients-list {
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
}

.recipe-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20rpx;
  border-top: 1rpx solid #eee;
}

.btn-cook {
  flex: 1;
  margin-right: 20rpx;
  background-color: #07c160;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 26rpx;
}

.btn-favorite {
  width: 80rpx;
  height: 80rpx;
  background-color: #f8f9fa;
  border: none;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorite-icon {
  width: 32rpx;
  height: 32rpx;
}
</style>