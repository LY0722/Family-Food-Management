<!-- 
 * 文件路径：/components/common/EmptyState.vue
 * 文件说明：通用空状态组件，数据为空时展示
-->
<template>
  <view class="empty-state">
    <view class="empty-content">
      <image :src="icon" class="empty-icon" v-if="icon" />
      <text class="empty-title">{{ title }}</text>
      <text class="empty-description" v-if="description">{{ description }}</text>
      <slot></slot>
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
      default: '暂无数据'
    },
    description: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 40rpx;
  opacity: 0.5;
}

.empty-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.empty-description {
  font-size: 28rpx;
  color: #999;
  line-height: 1.6;
  margin-bottom: 40rpx;
}
</style>