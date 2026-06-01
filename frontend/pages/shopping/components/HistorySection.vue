<template>
  <view class="history-section">
    <view class="section-header">
      <text class="section-title">最近操作</text>
      <text class="see-more" @tap="handleViewAll">查看全部</text>
    </view>
    
    <view class="history-list" v-if="historyRecords.length > 0">
      <view 
        class="history-item" 
        v-for="record in historyRecords" 
        :key="record.id"
      >
        <view class="item-icon" :class="record.type">
          <image 
            :src="getIconByType(record.type)" 
            class="icon-img" 
          />
        </view>
        
        <view class="item-content">
          <text class="item-title">{{ record.title || record.ingredientName }}</text>
          <text class="item-desc">{{ record.description || getDescByType(record.type) }}</text>
          <text class="item-time">{{ formatTime(record.createdAt) }}</text>
        </view>
        
        <view class="item-quantity" :class="record.type">
          <text>{{ record.type === 'add' ? '+' : '-' }}</text>
          <text>{{ record.quantity || 1 }}</text>
          <text>{{ record.unit || '个' }}</text>
        </view>
      </view>
    </view>
    
    <EmptyState 
      v-else
      icon="/static/icons/search.png"
      text="暂无操作记录"
    />
  </view>
</template>

<script>
import EmptyState from '@/components/common/EmptyState.vue'

export default {
  name: 'HistorySection',
  
  components: {
    EmptyState
  },
  
  props: {
    historyRecords: {
      type: Array,
      default: () => []
    }
  },
  
  methods: {
    getIconByType(type) {
      const iconMap = {
        add: '/static/icons/add.png',
        consume: '/static/icons/waste.png',
        purchase: '/static/icons/shopping.png'
      }
      return iconMap[type] || '/static/icons/info.png'
    },
    
    getDescByType(type) {
      const descMap = {
        add: '添加到库存',
        consume: '消耗食材',
        purchase: '采购记录'
      }
      return descMap[type] || '操作记录'
    },
    
    formatTime(time) {
      if (!time) return ''
      const date = new Date(time)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) {
        return '刚刚'
      } else if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`
      } else if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`
      } else if (diff < 604800000) {
        return `${Math.floor(diff / 86400000)}天前`
      } else {
        return `${date.getMonth() + 1}/${date.getDate()}`
      }
    },
    
    handleViewAll() {
      this.$emit('view-all')
    }
  }
}
</script>

<style scoped>
.history-section {
  background: white;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.see-more {
  font-size: 24rpx;
  color: #07c160;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
}

.item-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
}

.item-icon.add {
  background: #e6f7ff;
}

.item-icon.consume {
  background: #fff7e6;
}

.item-icon.purchase {
  background: #f6ffed;
}

.icon-img {
  width: 32rpx;
  height: 32rpx;
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.item-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.item-desc {
  font-size: 24rpx;
  color: #666;
}

.item-time {
  font-size: 22rpx;
  color: #999;
}

.item-quantity {
  font-size: 28rpx;
  font-weight: 600;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
}

.item-quantity.add {
  color: #1890ff;
  background: #e6f7ff;
}

.item-quantity.consume {
  color: #faad14;
  background: #fff7e6;
}

.item-quantity.purchase {
  color: #52c41a;
  background: #f6ffed;
}
</style>