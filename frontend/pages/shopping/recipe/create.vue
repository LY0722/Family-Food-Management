<!-- 
 * 文件路径：/pages/shopping/recipe/create.vue
 * 文件说明：创建菜谱页面
-->
<template>
  <view class="recipe-create-page">
    <!-- 状态栏 -->
    <view class="header">
      <view class="header-left" @tap="goBack">
        <image src="/static/icons/arrow-left.png" class="back-icon"/>
      </view>
      <view class="header-center">
        <text class="header-title">创建菜谱</text>
      </view>
      <view class="header-right" @tap="saveRecipe">
        <text class="save-text">保存</text>
      </view>
    </view>
    
    <scroll-view class="content-scroll" scroll-y>
      <!-- 基本信息 -->
      <view class="section">
        <view class="section-title">基本信息</view>
        
        <!-- 菜谱图片 -->
        <view class="image-upload-section">
          <view class="upload-box" @tap="chooseImage">
            <image 
              v-if="formData.imageUrl" 
              :src="formData.imageUrl" 
              class="uploaded-image"
              mode="aspectFill"
            />
            <view v-else class="upload-placeholder">
              <image src="/static/icons/camera.png" class="upload-icon" />
              <text class="upload-text">点击上传图片</text>
            </view>
          </view>
        </view>
        
        <!-- 菜谱名称 -->
        <view class="form-item">
          <text class="form-label">菜谱名称 *</text>
          <input 
            v-model="formData.name"
            class="form-input"
            placeholder="请输入菜谱名称"
            maxlength="50"
          />
        </view>
        
        <!-- 菜谱描述 -->
        <view class="form-item">
          <text class="form-label">菜谱描述</text>
          <textarea 
            v-model="formData.description"
            class="form-textarea"
            placeholder="描述这道菜的特色、口感等..."
            maxlength="200"
            auto-height
          />
        </view>
      </view>
      
      <!-- 分类信息 -->
      <view class="section">
        <view class="section-title">分类信息</view>
        
        <!-- 菜谱分类 -->
        <view class="form-item">
          <text class="form-label">菜谱分类 *</text>
          <picker 
            :range="categoryOptions" 
            range-key="name"
            :value="categoryIndex"
            @change="onCategoryChange"
            class="form-picker"
          >
            <view class="picker-text">
              {{ formData.category ? getCategoryName(formData.category) : '请选择分类' }}
            </view>
          </picker>
        </view>
      </view>
      
      <!-- 底部安全距离 -->
      <view class="safe-area"></view>
    </scroll-view>
    
    <!-- 底部确认按钮 -->
    <view class="bottom-bar">
      <button class="btn-save" @tap="saveRecipe" :disabled="loading">
        {{ loading ? '保存中...' : '确认创建' }}
      </button>
    </view>
    
    <!-- 食材选择弹窗 -->
    <view v-if="showIngredientModal" class="modal-overlay" @tap="hideIngredientModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">添加食材</text>
          <view class="close-btn" @tap="hideIngredientModal">
            <image src="/static/icons/close.png" class="close-icon" />
          </view>
        </view>
        
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">食材名称</text>
            <input 
              v-model="ingredientForm.name"
              class="form-input"
              placeholder="请输入食材名称"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">数量</text>
            <input 
              v-model="ingredientForm.quantity"
              type="number"
              class="form-input"
              placeholder="请输入数量"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">单位</text>
            <picker 
              :range="unitOptions" 
              :value="unitIndex"
              @change="onUnitChange"
              class="form-picker"
            >
              <view class="picker-text">
                {{ ingredientForm.unit || '请选择单位' }}
              </view>
            </picker>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="btn-cancel" @tap="hideIngredientModal">取消</button>
          <button class="btn-confirm" @tap="confirmIngredient">确定</button>
        </view>
      </view>
    </view>
    
    <!-- 加载中 -->
    <loading v-if="loading" text="保存中..." />
    
    <!-- Toast提示 -->
    <toast ref="toast" />
  </view>
</template>

<script>
import { mapState } from 'vuex'
import Loading from '@/components/common/Loading.vue'
import Toast from '@/components/common/Toast.vue'

export default {
  name: 'RecipeCreatePage',
  
  components: {
    Loading,
    Toast
  },
  
  data() {
    return {
      loading: false,
      formData: {
        name: '',
        description: '',
        imageUrl: '',
        category: ''
      },
      categoryOptions: [
        { id: 'meat', name: '荤菜' },
        { id: 'vegetable', name: '素菜' },
        { id: 'soup', name: '汤类' },
        { id: 'staple', name: '主食' },
        { id: 'dessert', name: '甜品' }
      ],
      categoryIndex: 0
    }
  },
  
  computed: {
    ...mapState('user', ['userInfo'])
  },
  
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.uploadImage(res.tempFilePaths[0])
        }
      })
    },
    
    async uploadImage(filePath) {
      this.loading = true
      
      try {
        const response = await this.$api.user.uploadAvatar(filePath)
        
        if (response.code === 200) {
          this.formData.imageUrl = response.data
        }
      } catch (error) {
        console.error('上传图片失败:', error)
        this.$refs.toast.show('上传图片失败', 'error')
      } finally {
        this.loading = false
      }
    },
    
    onCategoryChange(e) {
      this.categoryIndex = e.detail.value
      this.formData.category = this.categoryOptions[this.categoryIndex].id
    },
    
    async saveRecipe() {
      if (!this.validateForm()) {
        return
      }
      
      this.loading = true
      
      try {
        const response = await this.$api.recipe.create({
          ...this.formData,
          userId: this.userInfo?.id
        })
        
        if (response.code === 200) {
          this.$refs.toast.show('创建成功', 'success')
          
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          this.$refs.toast.show(response.message || '创建失败', 'error')
        }
      } catch (error) {
        console.error('创建菜谱失败:', error)
        this.$refs.toast.show('创建失败，请稍后重试', 'error')
      } finally {
        this.loading = false
      }
    },
    
    validateForm() {
      if (!this.formData.name.trim()) {
        this.$refs.toast.show('请输入菜谱名称', 'error')
        return false
      }
      
      if (!this.formData.category) {
        this.$refs.toast.show('请选择菜谱分类', 'error')
        return false
      }
      
      return true
    },
    
    getCategoryName(categoryId) {
      const category = this.categoryOptions.find(c => c.id === categoryId)
      return category ? category.name : ''
    }
  }
}
</script>

<style scoped>
.recipe-create-page {
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  padding-top: calc(var(--status-bar-height) + 50rpx);
  background: rgba(255,255,255, 0.95);
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

.save-text {
  font-size: 28rpx;
  color: #1890ff;
  font-weight: 500;
}

.content-scroll {
  flex: 1;
  padding: 20rpx;
}

.section {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
}

.image-upload-section {
  margin-bottom: 24rpx;
}

.upload-box {
  width: 100%;
  height: 400rpx;
  border: 2rpx dashed #ddd;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.upload-icon {
  width: 80rpx;
  height: 80rpx;
  opacity: 0.4;
}

.upload-text {
  font-size: 26rpx;
  color: #999;
}

.uploaded-image {
  width: 100%;
  height: 100%;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
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
}

.form-textarea {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  width: 100%;
  box-sizing: border-box;
  min-height: 120rpx;
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

.safe-area {
  height: env(safe-area-inset-bottom);
  padding-bottom: 140rpx;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20rpx 24rpx;
  padding-bottom: calc(env(safe-area-inset-bottom) + 20rpx);
  box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.btn-save {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: white;
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(24, 144, 255, 0.3);
  transition: all 0.3s;
}

.btn-save:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(24, 144, 255, 0.2);
}

.btn-save[disabled] {
  background: #ccc;
  box-shadow: none;
}
</style>