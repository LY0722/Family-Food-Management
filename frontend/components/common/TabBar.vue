<!-- 
 * 文件路径：/components/common/TabBar.vue
 * 文件说明：通用底部标签栏组件，切换首页/采购/个人中心
-->
<template>
  <view class="tab-bar" :style="tabBarStyle">
    <view 
      v-for="(item, index) in list" 
      :key="index"
      class="tab-item"
      :class="{ active: current === index }"
      @tap="switchTab(index)"
    >
      <view class="tab-icon">
        <image 
          :src="current === index ? item.selectedIconPath : item.iconPath" 
          class="icon"
        />
        <view class="tab-badge" v-if="item.badge">
          <text class="badge-text">{{ item.badge }}</text>
        </view>
      </view>
      <text class="tab-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
      default: () => []
    },
    current: {
      type: Number,
      default: 0
    },
    color: {
      type: String,
      default: '#7a7e83'
    },
    selectedColor: {
      type: String,
      default: '#07c160'
    },
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    borderStyle: {
      type: String,
      default: 'black'
    }
  },
  
  computed: {
    tabBarStyle() {
      return {
        color: this.color,
        selectedColor: this.selectedColor,
        backgroundColor: this.backgroundColor,
        borderStyle: this.borderStyle
      }
    }
  },
  
  methods: {
    switchTab(index) {
      if (index === this.current) return
      
      const item = this.list[index]
      if (item.pagePath) {
        uni.switchTab({
          url: item.pagePath
        })
      }
      
      this.$emit('change', index)
    }
  }
}
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background-color: inherit;
  border-top: 1rpx solid #eee;
  display: flex;
  align-items: center;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.tab-icon {
  position: relative;
  margin-bottom: 8rpx;
}

.icon {
  width: 48rpx;
  height: 48rpx;
}

.tab-badge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  min-width: 36rpx;
  height: 36rpx;
  background-color: #ff3b30;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
}

.badge-text {
  color: white;
  font-size: 20rpx;
  font-weight: 600;
}

.tab-text {
  font-size: 24rpx;
}

.tab-item.active .tab-text {
  color: #07c160;
  font-weight: 500;
}
</style>