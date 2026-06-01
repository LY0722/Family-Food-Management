<!-- 
 * 文件路径：/components/common/MenuItem.vue
 * 文件说明：通用菜单项组件，用于个人中心等功能菜单
-->
<template>
  <view class="menu-item" @tap="$emit('tap')">
    <view class="menu-left">
      <image :src="icon" class="menu-icon" />
      <text class="menu-title" :style="{ color: color }">{{ title }}</text>
    </view>
    <view class="menu-right">
      <text class="menu-badge" v-if="badge">{{ badge }}</text>
      <image src="/static/icons/arrow.png" class="menu-arrow" />
    </view>
  </view>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    badge: {
      type: [String, Number],
      default: ''
    },
    color: {
      type: String,
      default: '#333'
    }
  }
}
</script>

<style scoped>
.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  background-color: white;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.menu-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.menu-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 24rpx;
}

.menu-title {
  font-size: 30rpx;
  font-weight: 500;
}

.menu-right {
  display: flex;
  align-items: center;
}

.menu-badge {
  background-color: #ff3b30;
  color: white;
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  margin-right: 16rpx;
  min-width: 40rpx;
  text-align: center;
}

.menu-arrow {
  width: 24rpx;
  height: 24rpx;
  transform: rotate(180deg);
  opacity: 0.5;
}
</style>