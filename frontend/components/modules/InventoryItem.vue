<!-- 
 * 文件路径：/components/modules/InventoryItem.vue
 * 文件说明：模块通用库存项组件，展示单个库存食材信息
-->
<template>
  <view class="inventory-item card" :class="statusClass">
    <view class="item-header">
      <checkbox-group @change="toggleSelect" v-if="selectable">
        <label class="checkbox-label">
          <checkbox 
            :value="item.id" 
            :checked="selected"
            color="#07c160"
          />
        </label>
      </checkbox-group>
      
      <view class="item-main">
        <text class="item-name">{{ item.name }}</text>
        <view class="item-meta">
          <text class="item-quantity">{{ item.quantity }}{{ item.unit }}</text>
          <text class="item-price" v-if="item.price">
            ¥{{ item.price }}
          </text>
        </view>
      </view>
      
      <view class="item-actions">
        <image 
          src="/static/icons/edit.png" 
          class="action-icon"
          @tap="$emit('edit', item)"
        />
        <image 
          src="/static/icons/delete.png" 
          class="action-icon"
          @tap="$emit('delete', item)"
        />
      </view>
    </view>
    
    <view class="item-footer">
      <view class="item-status">
        <view class="status-indicator" :class="statusClass"></view>
        <text class="status-text">{{ statusText }}</text>
        <text class="expiry-date" v-if="item.expiryDate">
          {{ formatExpiryDate(item.expiryDate) }}
        </text>
      </view>
      
      <view class="item-tags">
        <text class="tag-category">{{ item.category }}</text>
        <text class="tag-location" v-if="item.location">
          {{ item.location }}
        </text>
      </view>
    </view>
    
    <view class="item-progress" v-if="item.expiryDate">
      <view class="progress-bar">
        <view 
          class="progress-fill" 
          :style="{ width: expiryProgress + '%' }"
          :class="expiryClass"
        ></view>
      </view>
      <text class="progress-text">{{ expiryDays }}天</text>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default: () => ({
        id: '',
        name: '',
        quantity: 0,
        unit: '个',
        price: 0,
        category: '',
        status: 1, // 1:新鲜, 2:即将过期, 3:已过期
        expiryDate: '',
        location: '',
        purchasedAt: ''
      })
    },
    selectable: {
      type: Boolean,
      default: false
    },
    selected: {
      type: Boolean,
      default: false
    }
  },
  
  computed: {
    statusClass() {
      const classes = {
        1: 'status-fresh',
        2: 'status-warning',
        3: 'status-expired'
      }
      return classes[this.item.status] || 'status-fresh'
    },
    
    statusText() {
      const texts = {
        1: '新鲜',
        2: '即将过期',
        3: '已过期'
      }
      return texts[this.item.status] || '新鲜'
    },
    
    expiryProgress() {
      if (!this.item.expiryDate || this.item.status === 3) return 0
      
      const today = new Date()
      const expiry = new Date(this.item.expiryDate)
      const purchased = new Date(this.item.purchasedAt || today)
      
      const totalDays = Math.ceil((expiry - purchased) / (1000 * 60 * 60 * 24))
      const passedDays = Math.ceil((today - purchased) / (1000 * 60 * 60 * 24))
      
      if (totalDays <= 0) return 100
      return Math.min(100, Math.max(0, (passedDays / totalDays) * 100))
    },
    
    expiryClass() {
      if (this.expiryProgress < 70) return 'progress-good'
      if (this.expiryProgress < 90) return 'progress-warning'
      return 'progress-danger'
    },
    
    expiryDays() {
      if (!this.item.expiryDate) return '无'
      
      const today = new Date()
      const expiry = new Date(this.item.expiryDate)
      const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return '已过期'
      if (diffDays === 0) return '今天'
      return diffDays
    }
  },
  
  methods: {
    toggleSelect(e) {
      const checked = e.detail.value.length > 0
      this.$emit('select', { item: this.item, selected: checked })
    },
    
    formatExpiryDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }
  }
}
</script>

<style scoped>
.inventory-item {
  margin-bottom: 20rpx;
}

.item-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.checkbox-label {
  margin-right: 20rpx;
}

.item-main {
  flex: 1;
}

.item-name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.item-meta {
  display: flex;
  gap: 20rpx;
}

.item-quantity {
  font-size: 26rpx;
  color: #666;
}

.item-price {
  font-size: 26rpx;
  color: #ff9500;
  font-weight: 500;
}

.item-actions {
  display: flex;
  gap: 20rpx;
}

.action-icon {
  width: 36rpx;
  height: 36rpx;
}

.item-footer {
  margin-bottom: 16rpx;
}

.item-status {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.status-indicator {
  width: 16rpx;
  height: 16rpx;
  border-radius: 8rpx;
  margin-right: 12rpx;
}

.status-fresh .status-indicator {
  background-color: #07c160;
}

.status-warning .status-indicator {
  background-color: #ff9500;
}

.status-expired .status-indicator {
  background-color: #ff3b30;
}

.status-text {
  font-size: 26rpx;
  color: #666;
  margin-right: 20rpx;
}

.expiry-date {
  font-size: 24rpx;
  color: #999;
}

.item-tags {
  display: flex;
  gap: 12rpx;
}

.tag-category,
.tag-location {
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.tag-category {
  background-color: #e8f4ff;
  color: #1989fa;
}

.tag-location {
  background-color: #f8f9fa;
  color: #666;
}

.item-progress {
  display: flex;
  align-items: center;
}

.progress-bar {
  flex: 1;
  height: 8rpx;
  background-color: #eee;
  border-radius: 4rpx;
  margin-right: 16rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.progress-good {
  background-color: #07c160;
}

.progress-warning {
  background-color: #ff9500;
}

.progress-danger {
  background-color: #ff3b30;
}

.progress-text {
  width: 80rpx;
  font-size: 24rpx;
  color: #666;
  text-align: right;
}
</style>