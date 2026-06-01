<template>
  <view class="manual-input-page">
    <view class="page-header">
      <view class="header-left" @tap="goBack">
        <image src="/static/icons/arrow-left.png" class="back-icon" />
      </view>
      <text class="page-title">手动输入</text>
      <view class="header-right"></view>
    </view>
    
    <scroll-view class="page-content" scroll-y>
      <!-- 商品图片 -->
      <view class="image-section">
        <view class="image-upload" @tap="chooseImage">
          <image v-if="productInfo.image" :src="productInfo.image" class="uploaded-image" mode="aspectFill" />
          <view v-else class="upload-placeholder">
            <image src="/static/icons/camera.png" class="upload-icon" />
            <text class="upload-text">点击上传图片</text>
          </view>
        </view>
      </view>
      
      <!-- 基本信息 -->
      <view class="form-section">
        <view class="section-title">
          <text class="title-text">基本信息</text>
        </view>
        
        <view class="form-item">
          <text class="item-label">商品名称 *</text>
          <input 
            class="item-input" 
            v-model="productInfo.name" 
            placeholder="请输入商品名称"
            maxlength="50"
          />
        </view>
        
        <view class="form-item">
          <text class="item-label">商品条码</text>
          <view class="input-wrapper">
            <input 
              class="item-input" 
              v-model="productInfo.code" 
              placeholder="请输入或扫描条码"
              maxlength="50"
            />
            <view class="scan-btn" @tap="scanCode">
              <image src="/static/icons/scan.png" class="scan-icon" />
            </view>
          </view>
        </view>
        
        <view class="form-item">
          <text class="item-label">商品类别 *</text>
          <view class="picker-wrapper" @tap="showCategoryPicker">
            <text class="picker-text" :class="{ placeholder: !productInfo.category }">
              {{ productInfo.category || '请选择商品类别' }}
            </text>
            <image src="/static/icons/arrow-right.png" class="arrow-icon" />
          </view>
        </view>
        
        <view class="form-item">
          <text class="item-label">品牌</text>
          <input 
            class="item-input" 
            v-model="productInfo.brand" 
            placeholder="请输入品牌名称"
            maxlength="30"
          />
        </view>
      </view>
      
      <!-- 规格信息 -->
      <view class="form-section">
        <view class="section-title">
          <text class="title-text">规格信息</text>
        </view>
        
        <view class="form-item">
          <text class="item-label">数量 *</text>
          <view class="counter-wrapper">
            <view class="counter-btn" @tap="decreaseCount">
              <text class="counter-text">-</text>
            </view>
            <input 
              class="counter-input" 
              v-model="productInfo.count" 
              type="number"
              placeholder="1"
            />
            <view class="counter-btn" @tap="increaseCount">
              <text class="counter-text">+</text>
            </view>
          </view>
        </view>
        
        <view class="form-item">
          <text class="item-label">单位</text>
          <view class="picker-wrapper" @tap="showUnitPicker">
            <text class="picker-text" :class="{ placeholder: !productInfo.unit }">
              {{ productInfo.unit || '请选择单位' }}
            </text>
            <image src="/static/icons/arrow-right.png" class="arrow-icon" />
          </view>
        </view>
        
        <view class="form-item">
          <text class="item-label">重量/容量</text>
          <input 
            class="item-input" 
            v-model="productInfo.weight" 
            type="digit"
            placeholder="请输入重量或容量"
          />
        </view>
      </view>
      
      <!-- 价格信息 -->
      <view class="form-section">
        <view class="section-title">
          <text class="title-text">价格信息</text>
        </view>
        
        <view class="form-item">
          <text class="item-label">单价 *</text>
          <view class="input-wrapper">
            <text class="input-prefix">¥</text>
            <input 
              class="item-input" 
              v-model="productInfo.price" 
              type="digit"
              placeholder="0.00"
            />
          </view>
        </view>
        
        <view class="form-item">
          <text class="item-label">总价</text>
          <view class="total-price">
            <text class="total-label">¥</text>
            <text class="total-value">{{ totalPrice }}</text>
          </view>
        </view>
      </view>
      
      <!-- 其他信息 -->
      <view class="form-section">
        <view class="section-title">
          <text class="title-text">其他信息</text>
        </view>
        
        <view class="form-item">
          <text class="item-label">保质期</text>
          <view class="picker-wrapper" @tap="showExpiryPicker">
            <text class="picker-text" :class="{ placeholder: !productInfo.expiryDate }">
              {{ productInfo.expiryDate || '请选择保质期' }}
            </text>
            <image src="/static/icons/arrow-right.png" class="arrow-icon" />
          </view>
        </view>
        
        <view class="form-item">
          <text class="item-label">存储方式</text>
          <view class="picker-wrapper" @tap="showStoragePicker">
            <text class="picker-text" :class="{ placeholder: !productInfo.storage }">
              {{ productInfo.storage || '请选择存储方式' }}
            </text>
            <image src="/static/icons/arrow-right.png" class="arrow-icon" />
          </view>
        </view>
        
        <view class="form-item">
          <text class="item-label">备注</text>
          <textarea 
            class="item-textarea" 
            v-model="productInfo.remark" 
            placeholder="请输入备注信息"
            maxlength="200"
          />
        </view>
      </view>
      
      <!-- 常用商品 -->
      <view class="form-section" v-if="recentProducts.length > 0">
        <view class="section-title">
          <text class="title-text">最近添加</text>
        </view>
        
        <view class="recent-list">
          <view 
            class="recent-item" 
            v-for="item in recentProducts" 
            :key="item.id"
            @tap="selectRecent(item)"
          >
            <image :src="item.image" class="recent-image" mode="aspectFill" />
            <view class="recent-info">
              <text class="recent-name">{{ item.name }}</text>
              <text class="recent-price">¥{{ item.price }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部操作栏 -->
    <view class="page-footer">
      <button class="submit-btn" @tap="handleSubmit">
        <text>确认添加</text>
      </button>
    </view>
    
    <!-- 类别选择器 -->
    <picker 
      mode="selector" 
      :range="categoryList" 
      :value="categoryIndex"
      @change="onCategoryChange"
    >
      <view></view>
    </picker>
    
    <!-- 单位选择器 -->
    <picker 
      mode="selector" 
      :range="unitList" 
      :value="unitIndex"
      @change="onUnitChange"
    >
      <view></view>
    </picker>
    
    <!-- 保质期选择器 -->
    <picker 
      mode="date" 
      :value="productInfo.expiryDate"
      @change="onExpiryChange"
    >
      <view></view>
    </picker>
    
    <!-- 存储方式选择器 -->
    <picker 
      mode="selector" 
      :range="storageList" 
      :value="storageIndex"
      @change="onStorageChange"
    >
      <view></view>
    </picker>
  </view>
</template>

<script>
export default {
  name: 'ManualInputPage',
  
  data() {
    return {
      productInfo: {
        name: '',
        code: '',
        category: '',
        brand: '',
        count: 1,
        unit: '',
        weight: '',
        price: '',
        image: '',
        expiryDate: '',
        storage: '',
        remark: ''
      },
      categoryList: ['蔬菜', '水果', '肉类', '水产', '蛋奶', '粮油', '调味品', '零食', '饮料', '其他'],
      categoryIndex: 0,
      unitList: ['个', 'kg', 'g', '斤', '两', '瓶', '盒', '袋', '包', '箱'],
      unitIndex: 0,
      storageList: ['常温', '冷藏', '冷冻'],
      storageIndex: 0,
      recentProducts: []
    }
  },
  
  computed: {
    totalPrice() {
      const count = parseFloat(this.productInfo.count) || 0
      const price = parseFloat(this.productInfo.price) || 0
      return (count * price).toFixed(2)
    }
  },
  
  onLoad(options) {
    if (options.code) {
      this.productInfo.code = options.code
    }
    
    this.loadRecentProducts()
  },
  
  methods: {
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const imagePath = res.tempFilePaths[0]
          
          uni.uploadFile({
            url: this.$api.baseURL + '/api/upload/image',
            filePath: imagePath,
            name: 'file',
            header: {
              'Authorization': 'Bearer ' + uni.getStorageSync('token')
            },
            success: (uploadRes) => {
              const data = JSON.parse(uploadRes.data)
              if (data.code === 200) {
                this.productInfo.image = data.data.url
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
        }
      })
    },
    
    scanCode() {
      uni.navigateTo({
        url: '/pages/shopping/scan/scan'
      })
    },
    
    showCategoryPicker() {
      uni.showActionSheet({
        itemList: this.categoryList,
        success: (res) => {
          this.productInfo.category = this.categoryList[res.tapIndex]
        }
      })
    },
    
    showUnitPicker() {
      uni.showActionSheet({
        itemList: this.unitList,
        success: (res) => {
          this.productInfo.unit = this.unitList[res.tapIndex]
        }
      })
    },
    
    showExpiryPicker() {
      uni.showModal({
        title: '选择保质期',
        editable: true,
        placeholderText: '请输入日期（YYYY-MM-DD）',
        success: (res) => {
          if (res.confirm && res.content) {
            this.productInfo.expiryDate = res.content
          }
        }
      })
    },
    
    showStoragePicker() {
      uni.showActionSheet({
        itemList: this.storageList,
        success: (res) => {
          this.productInfo.storage = this.storageList[res.tapIndex]
        }
      })
    },
    
    onCategoryChange(e) {
      this.productInfo.category = this.categoryList[e.detail.value]
    },
    
    onUnitChange(e) {
      this.productInfo.unit = this.unitList[e.detail.value]
    },
    
    onExpiryChange(e) {
      this.productInfo.expiryDate = e.detail.value
    },
    
    onStorageChange(e) {
      this.productInfo.storage = this.storageList[e.detail.value]
    },
    
    increaseCount() {
      this.productInfo.count++
    },
    
    decreaseCount() {
      if (this.productInfo.count > 1) {
        this.productInfo.count--
      }
    },
    
    loadRecentProducts() {
      const recent = uni.getStorageSync('recentProducts') || []
      this.recentProducts = recent.slice(0, 5)
    },
    
    selectRecent(item) {
      this.productInfo = {
        ...this.productInfo,
        name: item.name,
        code: item.code,
        category: item.category,
        brand: item.brand,
        unit: item.unit,
        price: item.price,
        image: item.image,
        storage: item.storage
      }
    },
    
    validateForm() {
      if (!this.productInfo.name.trim()) {
        uni.showToast({
          title: '请输入商品名称',
          icon: 'none'
        })
        return false
      }
      
      if (!this.productInfo.category) {
        uni.showToast({
          title: '请选择商品类别',
          icon: 'none'
        })
        return false
      }
      
      if (!this.productInfo.count || this.productInfo.count < 1) {
        uni.showToast({
          title: '请输入数量',
          icon: 'none'
        })
        return false
      }
      
      if (!this.productInfo.price || this.productInfo.price <= 0) {
        uni.showToast({
          title: '请输入单价',
          icon: 'none'
        })
        return false
      }
      
      return true
    },
    
    async handleSubmit() {
      if (!this.validateForm()) {
        return
      }
      
      uni.showLoading({ title: '添加中...' })
      
      try {
        const response = await this.$api.shopping.add(this.productInfo)
        
        if (response.code === 200) {
          uni.hideLoading()
          
          this.saveToRecent(this.productInfo)
          
          uni.showToast({
            title: '添加成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.hideLoading()
          uni.showToast({
            title: response.message || '添加失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('添加失败:', error)
        uni.showToast({
          title: '添加失败',
          icon: 'none'
        })
      }
    },
    
    saveToRecent(product) {
      const recent = this.recentProducts.filter(item => item.code !== product.code)
      recent.unshift({
        id: Date.now(),
        ...product
      })
      this.recentProducts = recent.slice(0, 10)
      
      uni.setStorageSync('recentProducts', this.recentProducts)
    },
    
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.manual-input-page {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background: white;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.header-left,
.header-right {
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

.page-content {
  flex: 1;
  padding: 20rpx 24rpx;
  padding-bottom: 120rpx;
}

.image-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.image-upload {
  width: 100%;
  aspect-ratio: 1;
  background: #f8f9fa;
  border-radius: 12rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.uploaded-image {
  width: 100%;
  height: 100%;
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
}

.upload-text {
  font-size: 26rpx;
  color: #999;
}

.form-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.section-title {
  margin-bottom: 20rpx;
}

.title-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.item-label {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.item-input {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  border: none;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.input-prefix {
  padding: 0 16rpx;
  font-size: 28rpx;
  color: #999;
}

.input-wrapper .item-input {
  flex: 1;
  background: transparent;
}

.scan-btn {
  padding: 12rpx 16rpx;
}

.scan-icon {
  width: 40rpx;
  height: 40rpx;
}

.picker-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
  padding: 0 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.picker-text {
  font-size: 28rpx;
  color: #333;
}

.picker-text.placeholder {
  color: #999;
}

.arrow-icon {
  width: 24rpx;
  height: 24rpx;
}

.counter-wrapper {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 12rpx;
  overflow: hidden;
}

.counter-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1rpx solid #e8e8e8;
}

.counter-text {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
}

.counter-input {
  flex: 1;
  height: 80rpx;
  text-align: center;
  font-size: 28rpx;
  color: #333;
  background: transparent;
  border: none;
}

.total-price {
  display: flex;
  align-items: baseline;
  padding: 20rpx;
  background: #f0f9ff;
  border-radius: 12rpx;
}

.total-label {
  font-size: 24rpx;
  color: #1890ff;
  margin-right: 8rpx;
}

.total-value {
  font-size: 36rpx;
  font-weight: 600;
  color: #1890ff;
}

.item-textarea {
  width: 100%;
  min-height: 160rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  border: none;
  resize: none;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.recent-image {
  width: 80rpx;
  height: 80rpx;
  border-radius: 8rpx;
}

.recent-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.recent-name {
  font-size: 26rpx;
  color: #333;
}

.recent-price {
  font-size: 24rpx;
  color: #07c160;
  font-weight: 500;
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
</style>