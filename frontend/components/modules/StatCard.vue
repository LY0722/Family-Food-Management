<!-- 
 * 文件路径：/components/modules/StatCard.vue
 * 文件说明：模块通用统计卡片组件，展示各类数据统计信息
-->
<template>
  <view class="stat-card card">
    <view class="stat-header">
      <text class="stat-title">{{ title }}</text>
      <image 
        :src="icon" 
        class="stat-icon"
        v-if="icon"
      />
    </view>
    
    <view class="stat-content">
      <view class="stat-value-container">
        <text class="stat-value" :style="{ color: valueColor }">
          {{ formatValue(value) }}
        </text>
        <text class="stat-unit" v-if="unit">{{ unit }}</text>
      </view>
      
      <view class="stat-change" v-if="showChange">
        <view class="change-indicator" :class="changeClass">
          <image 
            :src="changeIcon" 
            class="change-icon"
          />
          <text class="change-text">{{ changeText }}</text>
        </view>
      </view>
    </view>
    
    <view class="stat-footer" v-if="description">
      <text class="stat-description">{{ description }}</text>
    </view>
    
    <slot></slot>
  </view>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '统计'
    },
    icon: {
      type: String,
      default: ''
    },
    value: {
      type: [Number, String],
      default: 0
    },
    unit: {
      type: String,
      default: ''
    },
    valueColor: {
      type: String,
      default: '#333'
    },
    showChange: {
      type: Boolean,
      default: false
    },
    changeValue: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      default: ''
    },
    format: {
      type: String,
      default: 'number' // number, percent, currency
    }
  },
  
  computed: {
    changeClass() {
      if (this.changeValue > 0) return 'change-up'
      if (this.changeValue < 0) return 'change-down'
      return 'change-neutral'
    },
    
    changeIcon() {
      const icons = {
        up: '/static/icons/trend-up.png',
        down: '/static/icons/trend-down.png',
        neutral: '/static/icons/trend-neutral.png'
      }
      
      if (this.changeValue > 0) return icons.up
      if (this.changeValue < 0) return icons.down
      return icons.neutral
    },
    
    changeText() {
      const prefix = this.changeValue > 0 ? '+' : ''
      return `${prefix}${Math.abs(this.changeValue)}%`
    }
  },
  
  methods: {
    formatValue(val) {
      if (this.format === 'percent') {
        return `${val}%`
      } else if (this.format === 'currency') {
        return `¥${val}`
      } else {
        return val.toString()
      }
    }
  }
}
</script>

<style scoped>
.stat-card {
  padding: 32rpx;
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.stat-title {
  font-size: 26rpx;
  color: #666;
}

.stat-icon {
  width: 40rpx;
  height: 40rpx;
}

.stat-content {
  margin-bottom: 20rpx;
}

.stat-value-container {
  display: flex;
  align-items: baseline;
  margin-bottom: 12rpx;
}

.stat-value {
  font-size: 48rpx;
  font-weight: 700;
  margin-right: 8rpx;
}

.stat-unit {
  font-size: 28rpx;
  color: #999;
}

.stat-change {
  display: flex;
  align-items: center;
}

.change-indicator {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.change-up {
  background-color: #e7f7ef;
  color: #07c160;
}

.change-down {
  background-color: #ffe5e5;
  color: #ff3b30;
}

.change-neutral {
  background-color: #f8f9fa;
  color: #666;
}

.change-icon {
  width: 20rpx;
  height: 20rpx;
  margin-right: 4rpx;
}

.change-text {
  font-weight: 500;
}

.stat-footer {
  padding-top: 20rpx;
  border-top: 1rpx solid #eee;
}

.stat-description {
  font-size: 24rpx;
  color: #999;
  line-height: 1.5;
}
</style>