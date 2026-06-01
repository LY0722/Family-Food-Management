<!-- 
 * 文件路径：/components/common/NavBar.vue
 * 文件说明：通用导航栏组件，页面顶部导航
-->
<template>
  <view class="nav-bar" :style="navBarStyle">
    <!-- 状态栏 -->
    <view class="status-bar" :style="statusBarStyle"></view>
    
    <!-- 导航栏内容 -->
    <view class="nav-content">
      <!-- 返回按钮 -->
      <view class="nav-left" v-if="showBack">
        <image 
          src="/static/icons/arrow.png" 
          class="back-icon"
          @tap="handleBack"
        />
      </view>
      
      <!-- 标题 -->
      <view class="nav-title">
        <text class="title-text">{{ title }}</text>
      </view>
      
      <!-- 右侧插槽 -->
      <view class="nav-right">
        <slot name="right"></slot>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    showBack: {
      type: Boolean,
      default: true
    },
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    color: {
      type: String,
      default: '#000000'
    }
  },
  
  data() {
    return {
      statusBarHeight: 0,
      navBarHeight: 44
    }
  },
  
  computed: {
    statusBarStyle() {
      return {
        height: `${this.statusBarHeight}px`,
        backgroundColor: this.backgroundColor
      }
    },
    
    navBarStyle() {
      return {
        backgroundColor: this.backgroundColor,
        color: this.color
      }
    }
  },
  
  mounted() {
    this.getSystemInfo()
  },
  
  methods: {
    getSystemInfo() {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 0
      
      // 微信小程序胶囊按钮位置
      const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
      if (menuButtonInfo) {
        this.navBarHeight = menuButtonInfo.height + (menuButtonInfo.top - this.statusBarHeight) * 2
      }
    },
    
    handleBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.status-bar {
  width: 100%;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 20rpx;
}

.nav-left {
  flex-shrink: 0;
}

.back-icon {
  width: 40rpx;
  height: 40rpx;
  transform: rotate(180deg);
}

.nav-title {
  flex: 1;
  text-align: center;
}

.title-text {
  font-size: 36rpx;
  font-weight: 600;
  color: inherit;
}

.nav-right {
  flex-shrink: 0;
}
</style>