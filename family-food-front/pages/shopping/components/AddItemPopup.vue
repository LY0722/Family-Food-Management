<template>
  <view class="add-item-popup" v-if="visible" @tap="handleClose">
    <view class="popup-content" @tap.stop>
      <view class="popup-header">
        <text class="popup-title">{{ isEdit ? '编辑采购项' : '添加采购项' }}</text>
        <view class="close-btn" @tap="handleClose">
          <image src="/static/icons/close.png" class="close-icon" />
        </view>
      </view>
      
      <scroll-view class="popup-body" scroll-y>
        <view class="form-section">
          <view class="form-item">
            <text class="form-label">食材名称 <text class="required">*</text></text>
            <view class="form-value" @tap="showIngredientPicker">
              <text class="value-text" :class="{ placeholder: !formData.ingredientName }">
                {{ formData.ingredientName || '请选择食材' }}
              </text>
              <image src="/static/icons/arrow-right.png" class="arrow-icon" />
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">数量 <text class="required">*</text></text>
            <view class="quantity-control">
              <view class="control-btn" @tap="decreaseQuantity">
                <text class="control-text">-</text>
              </view>
              <input 
                class="quantity-input" 
                type="number" 
                v-model="formData.quantity" 
                @input="handleQuantityInput"
              />
              <view class="control-btn" @tap="increaseQuantity">
                <text class="control-text">+</text>
              </view>
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">单位</text>
            <view class="form-value" @tap="showUnitPicker">
              <text class="value-text" :class="{ placeholder: !formData.unit }">
                {{ formData.unit || '请选择单位' }}
              </text>
              <image src="/static/icons/arrow-right.png" class="arrow-icon" />
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">优先级</text>
            <view class="priority-options">
              <view 
                class="priority-option high" 
                :class="{ active: formData.priority === 1 }"
                @tap="setPriority(1)"
              >
                <text class="option-text">高</text>
              </view>
              <view 
                class="priority-option medium" 
                :class="{ active: formData.priority === 2 }"
                @tap="setPriority(2)"
              >
                <text class="option-text">中</text>
              </view>
              <view 
                class="priority-option low" 
                :class="{ active: formData.priority === 3 }"
                @tap="setPriority(3)"
              >
                <text class="option-text">低</text>
              </view>
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">备注</text>
            <textarea 
              class="form-textarea" 
              v-model="formData.remark" 
              placeholder="请输入备注信息（选填）"
              maxlength="100"
            />
          </view>
        </view>
      </scroll-view>
      
      <view class="popup-footer">
        <view class="footer-btn cancel" @tap="handleClose">
          <text class="btn-text">取消</text>
        </view>
        <view class="footer-btn confirm" @tap="handleConfirm">
          <text class="btn-text">确定</text>
        </view>
      </view>
    </view>
    
    <view class="ingredient-picker" v-if="showPicker" @tap="hideIngredientPicker">
      <view class="picker-content" @tap.stop>
        <view class="picker-header">
          <text class="picker-title">选择食材</text>
          <view class="close-btn" @tap="hideIngredientPicker">
            <image src="/static/icons/close.png" class="close-icon" />
          </view>
        </view>
        
        <view class="picker-search">
          <image src="/static/icons/search.png" class="search-icon" />
          <input 
            class="search-input" 
            v-model="searchKeyword" 
            placeholder="搜索食材名称"
          />
        </view>
        
        <scroll-view class="picker-list" scroll-y>
          <view 
            class="picker-item" 
            v-for="item in filteredIngredients" 
            :key="item.id"
            @tap="selectIngredient(item)"
          >
            <view class="item-left">
              <image v-if="item.image" :src="item.image" class="item-image" mode="aspectFill" />
              <view v-else class="item-image-placeholder">
                <text class="placeholder-text">{{ item.name.charAt(0) }}</text>
              </view>
              <view class="item-info">
                <text class="item-name">{{ item.name }}</text>
                <text class="item-category">{{ item.category || '未分类' }}</text>
              </view>
            </view>
            <view class="item-right">
              <text class="item-unit">{{ item.unit || '个' }}</text>
            </view>
          </view>
          
          <view class="empty-state" v-if="filteredIngredients.length === 0">
            <image src="/static/images/empty.png" class="empty-icon" />
            <text class="empty-text">未找到相关食材</text>
          </view>
        </scroll-view>
      </view>
    </view>
    
    <picker 
      v-if="showUnitPickerFlag" 
      mode="selector" 
      :range="unitList" 
      @change="onUnitChange"
      @cancel="hideUnitPicker"
    >
      <view></view>
    </picker>
  </view>
</template>

<script>
export default {
  name: 'AddItemPopup',
  
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    selectedIngredient: {
      type: Object,
      default: null
    },
    quantity: {
      type: Number,
      default: 1
    },
    priority: {
      type: Number,
      default: 2
    }
  },
  
  data() {
    return {
      isEdit: false,
      formData: {
        ingredientId: '',
        ingredientName: '',
        quantity: 1,
        unit: '',
        priority: 2,
        remark: ''
      },
      showPicker: false,
      showUnitPickerFlag: false,
      searchKeyword: '',
      ingredients: [],
      unitList: ['个', 'kg', 'g', '斤', '两', '瓶', '盒', '袋', '包', '箱', '盒', '包']
    }
  },
  
  computed: {
    filteredIngredients() {
      if (!this.searchKeyword.trim()) {
        return this.ingredients
      }
      const keyword = this.searchKeyword.toLowerCase()
      return this.ingredients.filter(item => 
        item.name.toLowerCase().includes(keyword) ||
        (item.category && item.category.toLowerCase().includes(keyword))
      )
    }
  },
  
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initFormData()
        this.loadIngredients()
      }
    },
    
    selectedIngredient: {
      handler(newVal) {
        if (newVal) {
          this.formData.ingredientId = newVal.id || ''
          this.formData.ingredientName = newVal.name || ''
          this.formData.unit = newVal.unit || '个'
        }
      },
      immediate: true
    },
    
    quantity: {
      handler(newVal) {
        if (newVal) {
          this.formData.quantity = newVal
        }
      },
      immediate: true
    },
    
    priority: {
      handler(newVal) {
        if (newVal) {
          this.formData.priority = newVal
        }
      },
      immediate: true
    }
  },
  
  methods: {
    initFormData() {
      if (!this.selectedIngredient) {
        this.formData = {
          ingredientId: '',
          ingredientName: '',
          quantity: 1,
          unit: '',
          priority: 2,
          remark: ''
        }
      }
    },
    
    async loadIngredients() {
      try {
        const response = await this.$api.ingredient.search('')
        if (response.code === 200) {
          this.ingredients = response.data || []
        }
      } catch (error) {
        console.error('加载食材列表失败:', error)
        this.ingredients = []
      }
    },
    
    showIngredientPicker() {
      this.showPicker = true
    },
    
    hideIngredientPicker() {
      this.showPicker = false
      this.searchKeyword = ''
    },
    
    selectIngredient(ingredient) {
      this.formData.ingredientId = ingredient.id
      this.formData.ingredientName = ingredient.name
      this.formData.unit = ingredient.unit || '个'
      this.hideIngredientPicker()
      
      // 通知父组件选择的食材
      this.$emit('select-ingredient', ingredient)
    },
    
    showUnitPicker() {
      this.showUnitPickerFlag = true
    },
    
    hideUnitPicker() {
      this.showUnitPickerFlag = false
    },
    
    onUnitChange(e) {
      const index = e.detail.value
      this.formData.unit = this.unitList[index]
      this.hideUnitPicker()
    },
    
    decreaseQuantity() {
      if (this.formData.quantity > 1) {
        this.formData.quantity--
      }
    },
    
    increaseQuantity() {
      this.formData.quantity++
    },
    
    handleQuantityInput(e) {
      const value = parseInt(e.detail.value)
      if (value > 0) {
        this.formData.quantity = value
      } else {
        this.formData.quantity = 1
      }
    },
    
    setPriority(priority) {
      this.formData.priority = priority
    },
    
    validateForm() {
      if (!this.formData.ingredientName.trim()) {
        uni.showToast({
          title: '请选择食材',
          icon: 'none'
        })
        return false
      }
      
      if (!this.formData.quantity || this.formData.quantity < 1) {
        uni.showToast({
          title: '请输入数量',
          icon: 'none'
        })
        return false
      }
      
      return true
    },
    
    handleConfirm() {
      if (!this.validateForm()) {
        return
      }
      
      this.$emit('confirm')
      this.handleClose()
    },
    
    handleClose() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.add-item-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.popup-content {
  width: 100%;
  max-height: 85vh;
  background: white;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.popup-title {
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

.popup-body {
  flex: 1;
  padding: 32rpx;
  overflow-y: auto;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.form-label {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.required {
  color: #ff4d4f;
  margin-left: 4rpx;
}

.form-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  min-height: 80rpx;
}

.value-text {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.value-text.placeholder {
  color: #999;
}

.arrow-icon {
  width: 24rpx;
  height: 24rpx;
  flex-shrink: 0;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  padding: 8rpx;
}

.control-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 8rpx;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.control-text {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
}

.quantity-input {
  flex: 1;
  height: 64rpx;
  text-align: center;
  font-size: 28rpx;
  color: #333;
  background: transparent;
  border: none;
}

.priority-options {
  display: flex;
  gap: 12rpx;
}

.priority-option {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  background: #f5f7fa;
  border-radius: 12rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.priority-option.high.active {
  background: #fff1f0;
  border-color: #ff4d4f;
}

.priority-option.medium.active {
  background: #fff7e6;
  border-color: #faad14;
}

.priority-option.low.active {
  background: #f6ffed;
  border-color: #52c41a;
}

.option-text {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.priority-option.high.active .option-text {
  color: #ff4d4f;
}

.priority-option.medium.active .option-text {
  color: #faad14;
}

.priority-option.low.active .option-text {
  color: #52c41a;
}

.form-textarea {
  width: 100%;
  min-height: 160rpx;
  padding: 20rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  border: none;
  resize: none;
}

.popup-footer {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #f0f0f0;
}

.footer-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-btn.cancel {
  background: #f5f7fa;
}

.footer-btn.cancel .btn-text {
  color: #666;
}

.footer-btn.confirm {
  background: linear-gradient(135deg, #07c160, #059e4a);
}

.footer-btn.confirm .btn-text {
  color: white;
  font-weight: 600;
}

.btn-text {
  font-size: 28rpx;
}

.ingredient-picker {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  display: flex;
  align-items: flex-end;
}

.picker-content {
  width: 100%;
  height: 75vh;
  background: white;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.picker-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.picker-search {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #f5f7fa;
  margin: 20rpx 32rpx;
  border-radius: 24rpx;
}

.search-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  background: transparent;
  border: none;
}

.picker-list {
  flex: 1;
  padding: 0 32rpx;
  overflow-y: auto;
}

.picker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.picker-item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.item-image {
  width: 80rpx;
  height: 80rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.item-image-placeholder {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #07c160, #059e4a);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.placeholder-text {
  font-size: 28rpx;
  color: white;
  font-weight: 600;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  overflow: hidden;
}

.item-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-category {
  font-size: 22rpx;
  color: #999;
}

.item-right {
  flex-shrink: 0;
}

.item-unit {
  font-size: 24rpx;
  color: #666;
  background: #f5f7fa;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 24rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 26rpx;
  color: #999;
}
</style>