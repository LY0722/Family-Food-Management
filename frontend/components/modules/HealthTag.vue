<!-- 
 * 文件路径：/components/modules/HealthTag.vue
 * 文件说明：模块通用健康标签组件，展示低脂/高蛋白等标签
-->
<template>
  <view class="health-tag" :class="[sizeClass, tagClass]" @tap="$emit('tap', tag)">
    <text class="tag-text">{{ tagText }}</text>
    <image 
      src="/static/icons/close.png" 
      class="tag-close" 
      v-if="closable"
      @tap.stop="$emit('close', tag)"
    />
  </view>
</template>

<script>
export default {
  props: {
    tag: {
      type: [String, Object],
      default: ''
    },
    size: {
      type: String,
      default: 'medium' // small, medium, large
    },
    type: {
      type: String,
      default: 'default' // success, warning, danger, info
    },
    closable: {
      type: Boolean,
      default: false
    }
  },
  
  computed: {
    tagText() {
      if (typeof this.tag === 'string') return this.tag
      return this.tag.name || ''
    },
    
    sizeClass() {
      return `size-${this.size}`
    },
    
    tagClass() {
      return `type-${this.type}`
    }
  }
}
</script>

<style scoped>
.health-tag {
  display: inline-flex;
  align-items: center;
  border-radius: 20rpx;
  padding: 8rpx 16rpx;
  margin-right: 12rpx;
  margin-bottom: 12rpx;
}

/* 尺寸 */
.size-small {
  padding: 4rpx 12rpx;
}

.size-medium {
  padding: 8rpx 16rpx;
}

.size-large {
  padding: 12rpx 24rpx;
}

/* 类型 */
.type-default {
  background-color: #f8f9fa;
  color: #666;
}

.type-success {
  background-color: #e7f7ef;
  color: #07c160;
}

.type-warning {
  background-color: #fff4e5;
  color: #ff9500;
}

.type-danger {
  background-color: #ffe5e5;
  color: #ff3b30;
}

.type-info {
  background-color: #e8f4ff;
  color: #1989fa;
}

/* 文本 */
.tag-text {
  font-size: 24rpx;
  line-height: 1.2;
}

.size-small .tag-text {
  font-size: 22rpx;
}

.size-large .tag-text {
  font-size: 26rpx;
}

/* 关闭按钮 */
.tag-close {
  width: 24rpx;
  height: 24rpx;
  margin-left: 8rpx;
  opacity: 0.6;
}

.size-small .tag-close {
  width: 20rpx;
  height: 20rpx;
}
</style>