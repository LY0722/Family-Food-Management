<!-- 
 * 文件路径：/pages/shopping/shoppingHistory.vue
 * 文件说明：买菜记录页面
-->
<template>
  <view class="history-page">
    <!-- 状态栏 -->
    <view class="header">
      <view class="header-left" @tap="goBack">
        <image src="/static/icons/arrow-left.png" class="back-icon"/>
      </view>
      <view class="header-center">
        <text class="header-title">买菜记录</text>
      </view>
      <view class="header-right"></view>
    </view>
    
    <!-- 统计模块 -->
    <view class="stats-section">
      <view class="stat-card">
        <image src="/static/icons/shopping.png" class="stat-icon" />
        <text class="stat-value">{{ totalShoppingCount }}</text>
        <text class="stat-label">购物次数</text>
      </view>
      
      <view class="stat-card">
        <image src="/static/icons/ingredients.png" class="stat-icon" />
        <text class="stat-value">{{ totalIngredientCount }}</text>
        <text class="stat-label">总食材数</text>
      </view>
      
      <view class="stat-card">
        <image src="/static/icons/chart.png" class="stat-icon" />
        <text class="stat-value">{{ averageCompletionRate }}%</text>
        <text class="stat-label">平均完成率</text>
      </view>
      
      <view class="stat-card">
        <image src="/static/icons/calendar.png" class="stat-icon" />
        <text class="stat-value">{{ lastShoppingDate }}</text>
        <text class="stat-label">最近购物</text>
      </view>
    </view>
    
    <!-- 记录列表 -->
    <scroll-view class="history-list" scroll-y @scrolltolower="loadMore">
      <view 
        v-for="record in historyList" 
        :key="record.id"
        class="history-card"
        @tap="viewDetail(record)"
      >
        <view class="card-header">
          <view class="header-left">
            <text class="shopping-date">{{ formatDate(record.shoppingDate) }}</text>
          </view>
          <view class="header-right">
            <text class="completion-rate">完成率 {{ formatCompletionRate(record.completionRate) }}%</text>
          </view>
        </view>
        
        <view class="card-body">
          <view class="info-row">
            <text class="info-label">食材数量</text>
            <text class="info-value">{{ record.totalItems }}种</text>
          </view>
          <view class="info-row">
            <text class="info-label">已购买</text>
            <text class="info-value">{{ record.purchasedItems }}种</text>
          </view>
          <view class="info-row">
            <text class="info-label">未购买</text>
            <text class="info-value">{{ record.totalItems - record.purchasedItems }}种</text>
          </view>
        </view>
      </view>
      
      <!-- 加载状态 -->
      <view class="loading-more" v-if="loading">
        <text>加载中...</text>
      </view>
      
      <!-- 没有更多 -->
      <view class="no-more" v-if="noMore && historyList.length > 0">
        <text>没有更多记录了</text>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-if="historyList.length === 0 && !loading">
        <image src="/static/icons/empty-shopping.png" class="empty-icon" />
        <text class="empty-text">暂无买菜记录</text>
        <text class="empty-desc">开始第一次买菜吧</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { mapState } from 'vuex'
import { requireLogin } from '@/utils/pageGuard'

export default {
  name: 'HistoryPage',
  
  data() {
    return {
      historyList: [],
      loading: false,
      noMore: false,
      page: 1,
      pageSize: 10,
      totalShoppingCount: 0,
      totalIngredientCount: 0,
      averageCompletionRate: 0,
      lastShoppingDate: '--'
    }
  },
  
  computed: {
    currentFamily() {
      return this.$store.state.family?.currentFamily
    },
    userInfo() {
      return this.$store.state.user?.userInfo
    }
  },
  
  onLoad() {
    if (!requireLogin()) {
      return
    }
    
    this.loadHistoryData()
  },
  
  methods: {
    async loadHistoryData() {
      if (this.loading || this.noMore) return
      
      this.loading = true
      
      try {
        const response = await this.$api.shoppingHistory.getShoppingHistory(
          this.currentFamily?.id,
          this.page - 1,
          this.pageSize
        )
        
        if (response.code === 200) {
          const list = response.data.list || []
          
          if (this.page === 1) {
            this.historyList = list
          } else {
            this.historyList = [...this.historyList, ...list]
          }
          
          // 更新统计数据
          if (this.page === 1) {
            this.totalShoppingCount = response.data.totalShoppingCount || 0
            this.totalIngredientCount = response.data.totalIngredientCount || 0
            this.averageCompletionRate = response.data.averageCompletionRate || 0
            this.lastShoppingDate = response.data.lastShoppingDate || '--'
          }
          
          this.noMore = list.length < this.pageSize
        }
      } catch (error) {
        console.error('加载历史记录失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    loadMore() {
      if (!this.loading && !this.noMore) {
        this.page++
        this.loadHistoryData()
      }
    },
    
    formatDate(dateStr) {
      if (!dateStr) return '--'
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    formatCompletionRate(rate) {
      if (!rate) return 0
      return Math.round(rate)
    },
    
    viewDetail(record) {
      uni.navigateTo({
        url: `/pages/shopping/shoppingHistory/detail?id=${record.id}`
      })
    },
    
    showFilter() {
      uni.showActionSheet({
        itemList: ['最近一周', '最近一月', '最近三月', '全部'],
        success: (res) => {
          const filters = ['week', 'month', 'quarter', 'all']
          this.applyFilter(filters[res.tapIndex])
        }
      })
    },
    
    applyFilter(filter) {
      this.page = 1
      this.noMore = false
      this.historyList = []
      this.loadHistoryData()
    },
    
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.history-page {
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  padding-top: calc(var(--status-bar-height) + 50rpx);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2rpx 20rpx rgba(0, 0, 0, 0.06);
  z-index: 100;
  width: 100%;
  box-sizing: border-box;
}

.header-left,
.header-right {
  padding: 12rpx;
  flex-shrink: 0;
  width: 80rpx;
  display: flex;
  align-items: center;
}

.header-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.header-right {
  padding: 12rpx;
  flex-shrink: 0;
  width: 80rpx;
  display: flex;
  align-items: center;
}

.back-icon {
  width: 40rpx;
  height: 40rpx;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  padding: 20rpx 24rpx;
}

.stat-card {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 64rpx;
  height: 64rpx;
}

.stat-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #07c160;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
}

.history-list {
  flex: 1;
  padding: 0 24rpx 24rpx;
}

.history-card {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.shopping-time {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.shopping-date {
  font-size: 22rpx;
  color: #999;
}

.header-right {
  text-align: right;
}

.completion-rate {
  font-size: 26rpx;
  color: #07c160;
  font-weight: 600;
}

.card-body {
  display: flex;
  gap: 32rpx;
  margin-bottom: 16rpx;
}

.info-row {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.info-label {
  font-size: 22rpx;
  color: #999;
}

.info-value {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.card-footer {
  display: flex;
  align-items: center;
}

.tags {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
}

.tag-item {
  padding: 4rpx 12rpx;
  background: #f0f9ff;
  border-radius: 12rpx;
  font-size: 22rpx;
  color: #1890ff;
}

.loading-more,
.no-more {
  text-align: center;
  padding: 40rpx 0;
  font-size: 26rpx;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  gap: 16rpx;
}

.empty-icon {
  width: 160rpx;
  height: 160rpx;
  opacity: 0.4;
}

.empty-text {
  font-size: 28rpx;
  color: #333;
}

.empty-desc {
  font-size: 24rpx;
  color: #999;
}
</style>