<template>
  <view class="shopping-list">
    <view class="list-section" v-if="activeTab === 'pending' && filteredPendingList.length > 0">
      <view 
        class="shopping-item" 
        v-for="item in filteredPendingList" 
        :key="item.id"
      >
        <view class="item-main" @tap="viewItemDetail(item)">
          <view class="item-header">
            <text class="item-name">{{ item.ingredientName || item.name }}</text>
            <view class="item-badges">
              <view class="badge" :class="getSourceClass(item.source)">
                {{ getSourceText(item.source) }}
              </view>
              <view class="badge priority" :class="getPriorityClass(item.priority)">
                {{ getPriorityText(item.priority) }}
              </view>
            </view>
          </view>
          
          <view class="item-info">
            <text class="info-item">数量：{{ item.quantity }}{{ item.unit }}</text>
            <text class="info-item" v-if="item.reason">{{ item.reason }}</text>
          </view>
        </view>
        
        <view class="item-actions">
          <button class="action-btn purchase" @tap.stop="handlePurchase(item)">
            <image src="/static/icons/check.png" class="btn-icon" />
            <text>已购</text>
          </button>
          <button class="action-btn edit" @tap.stop="handleEdit(item)">
            <image src="/static/icons/edit.png" class="btn-icon" />
          </button>
          <button class="action-btn delete" @tap.stop="handleDelete(item)">
            <image src="/static/icons/delete.png" class="btn-icon" />
          </button>
        </view>
      </view>
    </view>
    
    <view class="list-section" v-if="activeTab === 'purchased' && filteredPurchasedList.length > 0">
      <view 
        class="shopping-item purchased" 
        v-for="item in filteredPurchasedList" 
        :key="item.id"
      >
        <view class="item-main">
          <view class="item-header">
            <text class="item-name">{{ item.ingredientName || item.name }}</text>
            <view class="item-badges">
              <view class="badge purchased-badge">已购</view>
            </view>
          </view>
          
          <view class="item-info">
            <text class="info-item">数量：{{ item.quantity }}{{ item.unit }}</text>
            <text class="info-item" v-if="item.purchaseTime">
              购买时间：{{ formatTime(item.purchaseTime) }}
            </text>
          </view>
        </view>
        
        <view class="item-actions">
          <button class="action-btn re-add" @tap="handleReAdd(item)">
            <image src="/static/icons/refresh.png" class="btn-icon" />
            <text>重新添加</text>
          </button>
          <button class="action-btn delete" @tap.stop="handleDelete(item)">
            <image src="/static/icons/delete.png" class="btn-icon" />
          </button>
        </view>
      </view>
    </view>
    
    <EmptyState 
      v-if="filteredPendingList.length === 0 && filteredPurchasedList.length === 0"
      icon="/static/icons/shopping.png"
      text="暂无采购清单"
    />
  </view>
</template>

<script>
import EmptyState from '@/components/common/EmptyState.vue'

export default {
  name: 'ShoppingList',
  
  components: {
    EmptyState
  },
  
  props: {
    pendingList: {
      type: Array,
      default: () => []
    },
    purchasedList: {
      type: Array,
      default: () => []
    },
    activeTab: {
      type: String,
      default: 'pending'
    },
    searchKeyword: {
      type: String,
      default: ''
    }
  },
  
  computed: {
    filteredPendingList() {
      if (!this.searchKeyword) {
        return this.sortPendingList(this.pendingList)
      }
      return this.sortPendingList(this.pendingList).filter(item => 
        (item.ingredientName || item.name).includes(this.searchKeyword)
      )
    },
    
    filteredPurchasedList() {
      if (!this.searchKeyword) {
        return this.purchasedList
      }
      return this.purchasedList.filter(item => 
        (item.ingredientName || item.name).includes(this.searchKeyword)
      )
    }
  },
  
  methods: {
    sortPendingList(list) {
      return [...list].sort((a, b) => {
        if (a.source === 'ai' && b.source !== 'ai') return -1
        if (a.source !== 'ai' && b.source === 'ai') return 1
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
    },
    
    getSourceClass(source) {
      return source === 'ai' ? 'ai-source' : 'manual-source'
    },
    
    getSourceText(source) {
      return source === 'ai' ? '🤖 AI生成' : '📝 手动添加'
    },
    
    getPriorityClass(priority) {
      const priorityMap = {
        1: 'high',
        2: 'medium',
        3: 'low'
      }
      return priorityMap[priority] || 'medium'
    },
    
    getPriorityText(priority) {
      const priorityMap = {
        1: '高优先',
        2: '中优先',
        3: '低优先'
      }
      return priorityMap[priority] || '中优先'
    },
    
    formatTime(time) {
      if (!time) return ''
      const date = new Date(time)
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
    },
    
    handlePurchase(item) {
      this.$emit('purchase', item)
    },
    
    handleEdit(item) {
      this.$emit('edit', item)
    },
    
    handleDelete(item) {
      this.$emit('delete', item)
    },
    
    handleReAdd(item) {
      this.$emit('re-add', item)
    },
    
    viewItemDetail(item) {
      uni.navigateTo({
        url: `/pages/shopping/detail?id=${item.id}`
      })
    }
  }
}
</script>

<style scoped>
.shopping-list {
  padding: 20rpx;
}

.list-section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.shopping-item {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.08);
}

.shopping-item.purchased {
  opacity: 0.7;
}

.item-main {
  margin-bottom: 16rpx;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12rpx;
}

.item-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.item-badges {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
}

.badge.ai-source {
  background: #e6f7ff;
  color: #1890ff;
}

.badge.manual-source {
  background: #f6ffed;
  color: #52c41a;
}

.badge.priority {
  color: white;
}

.badge.priority.high {
  background: #ff4d4f;
}

.badge.priority.medium {
  background: #faad14;
}

.badge.priority.low {
  background: #52c41a;
}

.badge.purchased-badge {
  background: #f5f5f5;
  color: #999;
}

.item-info {
  display: flex;
  gap: 24rpx;
  flex-wrap: wrap;
}

.info-item {
  font-size: 24rpx;
  color: #666;
}

.item-actions {
  display: flex;
  gap: 12rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  border: none;
}

.action-btn.purchase {
  background: linear-gradient(135deg, #07c160, #059e4a);
  color: white;
}

.action-btn.edit {
  background: #f0f5ff;
  color: #1890ff;
}

.action-btn.delete {
  background: #fff1f0;
  color: #ff4d4f;
}

.action-btn.re-add {
  background: #f6ffed;
  color: #52c41a;
}

.btn-icon {
  width: 28rpx;
  height: 28rpx;
}
</style>