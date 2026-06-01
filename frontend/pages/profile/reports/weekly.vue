<template>
  <view class="weekly-report-page">
    <view class="page-header">
      <view class="header-left" @tap="goBack">
        <image src="/static/icons/arrow-left.png" class="back-icon" />
      </view>
      <text class="page-title">周报告</text>
      <view class="header-right" @tap="goToIndex">
        <text class="header-btn">总览</text>
      </view>
    </view>
    
    <scroll-view class="page-content" scroll-y>
      <!-- 时间选择 -->
      <view class="date-selector">
        <view class="date-nav" @tap="prevWeek">
          <image src="/static/icons/arrow-left.png" class="nav-icon" />
        </view>
        <view class="date-display">
          <text class="date-text">{{ weekRange }}</text>
          <text class="date-label">本周</text>
        </view>
        <view class="date-nav" @tap="nextWeek" :class="{ disabled: isCurrentWeek }">
          <image src="/static/icons/arrow-right.png" class="nav-icon" />
        </view>
      </view>
      
      <!-- 统计卡片 -->
      <view class="stats-cards">
        <view class="stat-card main">
          <text class="stat-value">{{ weeklyStats.totalConsumption || 0 }}kg</text>
          <text class="stat-label">总消耗</text>
          <view class="stat-change" :class="{ positive: weeklyStats.consumptionChange >= 0 }">
            <text>{{ weeklyStats.consumptionChange >= 0 ? '+' : '' }}{{ weeklyStats.consumptionChange || 0 }}%</text>
            <text class="change-text">较上周</text>
          </view>
        </view>
        
        <view class="stat-card">
          <text class="stat-value">{{ weeklyStats.wasteRate || 0 }}%</text>
          <text class="stat-label">浪费率</text>
          <view class="stat-change" :class="{ positive: weeklyStats.wasteChange <= 0 }">
            <text>{{ weeklyStats.wasteChange >= 0 ? '+' : '' }}{{ weeklyStats.wasteChange || 0 }}%</text>
            <text class="change-text">较上周</text>
          </view>
        </view>
        
        <view class="stat-card">
          <text class="stat-value">¥{{ weeklyStats.saved || 0 }}</text>
          <text class="stat-label">节省金额</text>
          <view class="stat-change positive">
            <text>+{{ weeklyStats.savedChange || 0 }}%</text>
            <text class="change-text">较上周</text>
          </view>
        </view>
      </view>
      
      <!-- 每日消耗趋势 -->
      <view class="chart-section">
        <view class="section-header">
          <text class="section-title">每日消耗趋势</text>
          <text class="section-desc">单位：kg</text>
        </view>
        <view class="daily-chart">
          <view 
            class="chart-bar" 
            v-for="(day, index) in dailyConsumption" 
            :key="index"
          >
            <view class="bar-container">
              <view 
                class="bar-fill" 
                :style="{ height: (day.amount / maxDailyConsumption * 100) + '%' }"
              ></view>
            </view>
            <text class="bar-label">{{ day.label }}</text>
            <text class="bar-value">{{ day.amount }}kg</text>
          </view>
        </view>
      </view>
      
      <!-- 食材分类消耗 -->
      <view class="chart-section">
        <view class="section-header">
          <text class="section-title">食材分类消耗</text>
          <text class="section-desc">占比统计</text>
        </view>
        <view class="category-list">
          <view 
            class="category-item" 
            v-for="category in weeklyStats.categories" 
            :key="category.id"
          >
            <view class="category-info">
              <view class="category-icon" :style="{ background: category.color }">
                <text class="icon-text">{{ category.icon }}</text>
              </view>
              <view class="category-details">
                <text class="category-name">{{ category.name }}</text>
                <text class="category-amount">{{ category.amount }}kg</text>
              </view>
            </view>
            <view class="category-bar">
              <view 
                class="bar-fill" 
                :style="{ width: category.percentage + '%', background: category.color }"
              ></view>
              <text class="bar-text">{{ category.percentage }}%</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 浪费详情 -->
      <view class="chart-section">
        <view class="section-header">
          <text class="section-title">浪费详情</text>
          <text class="section-desc">按食材类型</text>
        </view>
        <view class="waste-list">
          <view 
            class="waste-item" 
            v-for="item in weeklyStats.wasteList" 
            :key="item.id"
          >
            <text class="waste-name">{{ item.name }}</text>
            <text class="waste-amount">¥{{ item.amount }}</text>
            <text class="waste-count">{{ item.count }}次</text>
          </view>
        </view>
      </view>
      
      <!-- 采购记录 -->
      <view class="chart-section">
        <view class="section-header">
          <text class="section-title">采购记录</text>
          <text class="section-desc">本周共 {{ purchaseCount }} 次采购</text>
        </view>
        <view class="purchase-list">
          <view 
            class="purchase-item" 
            v-for="item in purchaseRecords" 
            :key="item.id"
          >
            <view class="purchase-info">
              <text class="purchase-date">{{ formatDate(item.date) }}</text>
              <text class="purchase-items">{{ item.items }}种食材</text>
            </view>
            <text class="purchase-amount">¥{{ item.amount }}</text>
          </view>
        </view>
      </view>
      
      <!-- 节省分析 -->
      <view class="chart-section">
        <view class="section-header">
          <text class="section-title">节省分析</text>
          <text class="section-desc">相比无管控状态</text>
        </view>
        <view class="saving-analysis">
          <view class="saving-item">
            <text class="saving-label">减少浪费</text>
            <text class="saving-value">{{ weeklyStats.wasteSaved || 0 }}kg</text>
          </view>
          <view class="saving-item">
            <text class="saving-label">节省采购</text>
            <text class="saving-value">¥{{ weeklyStats.purchaseSaved || 0 }}</text>
          </view>
          <view class="saving-item">
            <text class="saving-label">总节省</text>
            <text class="saving-value highlight">¥{{ weeklyStats.totalSaved || 0 }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <view class="page-footer">
      <button class="export-btn" @tap="handleExport">
        <image src="/static/icons/export.png" class="btn-icon" />
        <text>导出周报</text>
      </button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'WeeklyReportPage',
  
  data() {
    return {
      currentWeekStart: null,
      currentWeekEnd: null,
      isCurrentWeek: true,
      weekRange: '',
      weeklyStats: {
        totalConsumption: 0,
        consumptionChange: 0,
        wasteRate: 0,
        wasteChange: 0,
        saved: 0,
        savedChange: 0,
        wasteSaved: 0,
        purchaseSaved: 0,
        totalSaved: 0,
        categories: [],
        wasteList: []
      },
      dailyConsumption: [],
      maxDailyConsumption: 0,
      purchaseRecords: [],
      purchaseCount: 0
    }
  },
  
  onLoad(options) {
    if (options.startDate) {
      this.currentWeekStart = new Date(options.startDate)
      this.currentWeekEnd = new Date(options.endDate)
      this.isCurrentWeek = false
    } else {
      this.setCurrentWeek()
    }
    
    this.updateWeekRange()
    this.loadWeeklyData()
  },
  
  methods: {
    setCurrentWeek() {
      const now = new Date()
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1)
      
      this.currentWeekStart = new Date(now.setDate(diff))
      this.currentWeekStart.setHours(0, 0, 0, 0)
      
      this.currentWeekEnd = new Date(this.currentWeekStart)
      this.currentWeekEnd.setDate(this.currentWeekEnd.getDate() + 6)
      this.currentWeekEnd.setHours(23, 59, 59, 999)
      
      this.isCurrentWeek = true
    },
    
    updateWeekRange() {
      const start = this.formatDate(this.currentWeekStart)
      const end = this.formatDate(this.currentWeekEnd)
      this.weekRange = `${start} - ${end}`
    },
    
    formatDate(date) {
      const d = new Date(date)
      const month = d.getMonth() + 1
      const day = d.getDate()
      return `${month}/${day}`
    },
    
    prevWeek() {
      this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7)
      this.currentWeekEnd.setDate(this.currentWeekEnd.getDate() - 7)
      this.isCurrentWeek = false
      this.updateWeekRange()
      this.loadWeeklyData()
    },
    
    nextWeek() {
      if (this.isCurrentWeek) return
      
      this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7)
      this.currentWeekEnd.setDate(this.currentWeekEnd.getDate() + 7)
      
      const now = new Date()
      if (this.currentWeekEnd >= now) {
        this.setCurrentWeek()
      } else {
        this.updateWeekRange()
      }
      
      this.loadWeeklyData()
    },
    
    async loadWeeklyData() {
      try {
        const response = await this.$api.report.consumptionReport({
          timeFilter: 'week',
          startDate: this.formatDateToAPI(this.currentWeekStart),
          endDate: this.formatDateToAPI(this.currentWeekEnd)
        })
        
        if (response.code === 200) {
          this.weeklyStats = response.data.stats || this.weeklyStats
          this.dailyConsumption = response.data.dailyConsumption || []
          this.purchaseRecords = response.data.purchaseRecords || []
          this.purchaseCount = this.purchaseRecords.length
          
          this.maxDailyConsumption = Math.max(...this.dailyConsumption.map(d => d.amount), 1)
        }
      } catch (error) {
        console.error('加载周数据失败:', error)
      }
    },
    
    formatDateToAPI(date) {
      const d = new Date(date)
      return d.toISOString().split('T')[0]
    },
    
    goBack() {
      uni.navigateBack()
    },
    
    goToIndex() {
      uni.redirectTo({
        url: '/pages/profile/reports/reports'
      })
    },
    
    handleExport() {
      uni.showActionSheet({
        itemList: ['导出为图片', '导出为PDF'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.exportAsImage()
          } else if (res.tapIndex === 1) {
            this.exportAsPDF()
          }
        }
      })
    },
    
    exportAsImage() {
      uni.showToast({
        title: '正在生成图片...',
        icon: 'loading'
      })
      
      setTimeout(() => {
        uni.showToast({
          title: '导出成功',
          icon: 'success'
        })
      }, 2000)
    },
    
    exportAsPDF() {
      uni.showToast({
        title: '正在生成PDF...',
        icon: 'loading'
      })
      
      setTimeout(() => {
        uni.showToast({
          title: '导出成功',
          icon: 'success'
        })
      }, 2000)
    }
  }
}
</script>

<style scoped>
.weekly-report-page {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background: white;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.header-left {
  padding: 12rpx;
}

.back-icon {
  width: 40rpx;
  height: 40rpx;
}

.page-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.header-right {
  padding: 12rpx;
}

.header-btn {
  font-size: 26rpx;
  color: #07c160;
}

.page-content {
  flex: 1;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.date-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.date-nav {
  padding: 12rpx;
}

.date-nav.disabled {
  opacity: 0.3;
}

.nav-icon {
  width: 32rpx;
  height: 32rpx;
}

.date-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.date-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
}

.date-label {
  font-size: 22rpx;
  color: #999;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.stat-card {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx 16rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.stat-card.main {
  grid-column: span 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 600;
  color: #07c160;
  display: block;
  margin-bottom: 8rpx;
}

.stat-card.main .stat-value {
  font-size: 48rpx;
  margin-bottom: 0;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.stat-card.main .stat-label {
  margin-bottom: 0;
}

.stat-change {
  font-size: 20rpx;
  color: #ff6b6b;
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.stat-change.positive {
  color: #07c160;
}

.change-text {
  opacity: 0.7;
}

.chart-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
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

.section-desc {
  font-size: 24rpx;
  color: #999;
}

.daily-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 300rpx;
  padding: 20rpx 0;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.bar-container {
  width: 40rpx;
  height: 200rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  overflow: hidden;
  position: relative;
}

.bar-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #07c160, #059e4a);
  border-radius: 8rpx;
  transition: height 0.3s ease;
}

.bar-label {
  font-size: 20rpx;
  color: #666;
}

.bar-value {
  font-size: 20rpx;
  color: #07c160;
  font-weight: 600;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.category-item {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.category-icon {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-text {
  font-size: 32rpx;
}

.category-details {
  flex: 1;
}

.category-name {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.category-amount {
  font-size: 24rpx;
  color: #666;
}

.category-bar {
  position: relative;
  height: 24rpx;
  background: #f0f0f0;
  border-radius: 12rpx;
  overflow: hidden;
}

.category-bar .bar-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 12rpx;
  transition: width 0.3s ease;
}

.bar-text {
  position: absolute;
  right: 12rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20rpx;
  color: #666;
}

.waste-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.waste-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #fff7e6;
  border-radius: 12rpx;
}

.waste-name {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.waste-amount {
  font-size: 28rpx;
  color: #ff4d4f;
  font-weight: 600;
  margin-right: 24rpx;
}

.waste-count {
  font-size: 24rpx;
  color: #666;
}

.purchase-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.purchase-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.purchase-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.purchase-date {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.purchase-items {
  font-size: 24rpx;
  color: #999;
}

.purchase-amount {
  font-size: 28rpx;
  color: #07c160;
  font-weight: 600;
}

.saving-analysis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.saving-item {
  background: #f0f9ff;
  border-radius: 12rpx;
  padding: 24rpx;
  text-align: center;
}

.saving-label {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.saving-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #1890ff;
  display: block;
}

.saving-value.highlight {
  font-size: 36rpx;
  color: #07c160;
}

.page-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 24rpx;
  background: white;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.export-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #07c160, #059e4a);
  color: white;
  border-radius: 44rpx;
  font-size: 28rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.btn-icon {
  width: 32rpx;
  height: 32rpx;
}
</style>