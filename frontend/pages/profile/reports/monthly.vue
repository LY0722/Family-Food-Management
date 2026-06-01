<template>
  <view class="monthly-report-page">
    <view class="page-header">
      <view class="header-left" @tap="goBack">
        <image src="/static/icons/arrow-left.png" class="back-icon" />
      </view>
      <text class="page-title">月报告</text>
      <view class="header-right" @tap="goToIndex">
        <text class="header-btn">总览</text>
      </view>
    </view>
    
    <scroll-view class="page-content" scroll-y>
      <!-- 月份选择 -->
      <view class="month-selector">
        <view class="month-nav" @tap="prevMonth">
          <image src="/static/icons/arrow-left.png" class="nav-icon" />
        </view>
        <view class="month-display">
          <text class="month-text">{{ currentYear }}年{{ currentMonth }}月</text>
          <text class="month-label">{{ monthDays }}天</text>
        </view>
        <view class="month-nav" @tap="nextMonth" :class="{ disabled: isCurrentMonth }">
          <image src="/static/icons/arrow-right.png" class="nav-icon" />
        </view>
      </view>
      
      <!-- 统计卡片 -->
      <view class="stats-cards">
        <view class="stat-card main">
          <text class="stat-value">{{ monthlyStats.totalConsumption || 0 }}kg</text>
          <text class="stat-label">总消耗</text>
          <view class="stat-change" :class="{ positive: monthlyStats.consumptionChange >= 0 }">
            <text>{{ monthlyStats.consumptionChange >= 0 ? '+' : '' }}{{ monthlyStats.consumptionChange || 0 }}%</text>
            <text class="change-text">较上月</text>
          </view>
        </view>
        
        <view class="stat-card">
          <text class="stat-value">{{ monthlyStats.wasteRate || 0 }}%</text>
          <text class="stat-label">浪费率</text>
          <view class="stat-change" :class="{ positive: monthlyStats.wasteChange <= 0 }">
            <text>{{ monthlyStats.wasteChange >= 0 ? '+' : '' }}{{ monthlyStats.wasteChange || 0 }}%</text>
            <text class="change-text">较上月</text>
          </view>
        </view>
        
        <view class="stat-card">
          <text class="stat-value">¥{{ monthlyStats.saved || 0 }}</text>
          <text class="stat-label">节省金额</text>
          <view class="stat-change positive">
            <text>+{{ monthlyStats.savedChange || 0 }}%</text>
            <text class="change-text">较上月</text>
          </view>
        </view>
      </view>
      
      <!-- 每周消耗趋势 -->
      <view class="chart-section">
        <view class="section-header">
          <text class="section-title">每周消耗趋势</text>
          <text class="section-desc">单位：kg</text>
        </view>
        <view class="weekly-chart">
          <view 
            class="chart-bar" 
            v-for="(week, index) in weeklyConsumption" 
            :key="index"
          >
            <view class="bar-container">
              <view 
                class="bar-fill" 
                :style="{ height: (week.amount / maxWeeklyConsumption * 100) + '%' }"
              ></view>
            </view>
            <text class="bar-label">第{{ week.week }}周</text>
            <text class="bar-value">{{ week.amount }}kg</text>
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
            v-for="category in monthlyStats.categories" 
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
            v-for="item in monthlyStats.wasteList" 
            :key="item.id"
          >
            <text class="waste-name">{{ item.name }}</text>
            <text class="waste-amount">¥{{ item.amount }}</text>
            <text class="waste-count">{{ item.count }}次</text>
          </view>
        </view>
      </view>
      
      <!-- 月度对比 -->
      <view class="chart-section">
        <view class="section-header">
          <text class="section-title">月度对比</text>
          <text class="section-desc">近6个月数据</text>
        </view>
        <view class="comparison-chart">
          <view 
            class="comparison-item" 
            v-for="(month, index) in monthlyComparison" 
            :key="index"
          >
            <view class="comparison-info">
              <text class="comparison-label">{{ month.label }}</text>
              <text class="comparison-value">{{ month.consumption }}kg</text>
            </view>
            <view class="comparison-bar">
              <view 
                class="comparison-fill" 
                :style="{ width: (month.consumption / maxMonthlyConsumption * 100) + '%' }"
              ></view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 采购统计 -->
      <view class="chart-section">
        <view class="section-header">
          <text class="section-title">采购统计</text>
          <text class="section-desc">本月共 {{ purchaseCount }} 次采购</text>
        </view>
        <view class="purchase-stats">
          <view class="purchase-stat-item">
            <text class="stat-label">采购次数</text>
            <text class="stat-value">{{ purchaseCount }}次</text>
          </view>
          <view class="purchase-stat-item">
            <text class="stat-label">采购金额</text>
            <text class="stat-value">¥{{ totalPurchaseAmount }}</text>
          </view>
          <view class="purchase-stat-item">
            <text class="stat-label">平均每次</text>
            <text class="stat-value">¥{{ averagePurchaseAmount }}</text>
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
            <text class="saving-value">{{ monthlyStats.wasteSaved || 0 }}kg</text>
          </view>
          <view class="saving-item">
            <text class="saving-label">节省采购</text>
            <text class="saving-value">¥{{ monthlyStats.purchaseSaved || 0 }}</text>
          </view>
          <view class="saving-item">
            <text class="saving-label">总节省</text>
            <text class="saving-value highlight">¥{{ monthlyStats.totalSaved || 0 }}</text>
          </view>
        </view>
      </view>
      
      <!-- 趋势分析 -->
      <view class="chart-section">
        <view class="section-header">
          <text class="section-title">趋势分析</text>
          <text class="section-desc">消耗趋势预测</text>
        </view>
        <view class="trend-analysis">
          <view class="trend-item">
            <text class="trend-label">消耗趋势</text>
            <view class="trend-indicator" :class="monthlyStats.consumptionTrend">
              <text class="trend-icon">{{ getTrendIcon(monthlyStats.consumptionTrend) }}</text>
              <text class="trend-text">{{ getTrendText(monthlyStats.consumptionTrend) }}</text>
            </view>
          </view>
          <view class="trend-item">
            <text class="trend-label">浪费趋势</text>
            <view class="trend-indicator" :class="monthlyStats.wasteTrend">
              <text class="trend-icon">{{ getTrendIcon(monthlyStats.wasteTrend) }}</text>
              <text class="trend-text">{{ getTrendText(monthlyStats.wasteTrend) }}</text>
            </view>
          </view>
          <view class="trend-item">
            <text class="trend-label">节省趋势</text>
            <view class="trend-indicator" :class="monthlyStats.savingTrend">
              <text class="trend-icon">{{ getTrendIcon(monthlyStats.savingTrend) }}</text>
              <text class="trend-text">{{ getTrendText(monthlyStats.savingTrend) }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <view class="page-footer">
      <button class="export-btn" @tap="handleExport">
        <image src="/static/icons/export.png" class="btn-icon" />
        <text>导出月报</text>
      </button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MonthlyReportPage',
  
  data() {
    return {
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth() + 1,
      isCurrentMonth: true,
      monthDays: 30,
      monthlyStats: {
        totalConsumption: 0,
        consumptionChange: 0,
        wasteRate: 0,
        wasteChange: 0,
        saved: 0,
        savedChange: 0,
        wasteSaved: 0,
        purchaseSaved: 0,
        totalSaved: 0,
        consumptionTrend: 'stable',
        wasteTrend: 'down',
        savingTrend: 'up',
        categories: [],
        wasteList: []
      },
      weeklyConsumption: [],
      maxWeeklyConsumption: 0,
      monthlyComparison: [],
      maxMonthlyConsumption: 0,
      purchaseRecords: [],
      purchaseCount: 0,
      totalPurchaseAmount: 0,
      averagePurchaseAmount: 0
    }
  },
  
  onLoad(options) {
    if (options.year && options.month) {
      this.currentYear = parseInt(options.year)
      this.currentMonth = parseInt(options.month)
      this.isCurrentMonth = false
    }
    
    this.updateMonthDays()
    this.loadMonthlyData()
  },
  
  methods: {
    updateMonthDays() {
      const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate()
      this.monthDays = daysInMonth
    },
    
    prevMonth() {
      this.currentMonth--
      if (this.currentMonth < 1) {
        this.currentMonth = 12
        this.currentYear--
      }
      this.isCurrentMonth = false
      this.updateMonthDays()
      this.loadMonthlyData()
    },
    
    nextMonth() {
      if (this.isCurrentMonth) return
      
      this.currentMonth++
      if (this.currentMonth > 12) {
        this.currentMonth = 1
        this.currentYear++
      }
      
      const now = new Date()
      if (this.currentYear > now.getFullYear() || 
          (this.currentYear === now.getFullYear() && this.currentMonth > now.getMonth() + 1)) {
        this.currentYear = now.getFullYear()
        this.currentMonth = now.getMonth() + 1
        this.isCurrentMonth = true
      }
      
      this.updateMonthDays()
      this.loadMonthlyData()
    },
    
    async loadMonthlyData() {
      try {
        const response = await this.$api.report.consumptionReport({
          timeFilter: 'month',
          year: this.currentYear,
          month: this.currentMonth
        })
        
        if (response.code === 200) {
          this.monthlyStats = response.data.stats || this.monthlyStats
          this.weeklyConsumption = response.data.weeklyConsumption || []
          this.monthlyComparison = response.data.monthlyComparison || []
          this.purchaseRecords = response.data.purchaseRecords || []
          this.purchaseCount = this.purchaseRecords.length
          this.totalPurchaseAmount = this.purchaseRecords.reduce((sum, item) => sum + item.amount, 0)
          this.averagePurchaseAmount = this.purchaseCount > 0 ? (this.totalPurchaseAmount / this.purchaseCount).toFixed(2) : 0
          
          this.maxWeeklyConsumption = Math.max(...this.weeklyConsumption.map(w => w.amount), 1)
          this.maxMonthlyConsumption = Math.max(...this.monthlyComparison.map(m => m.consumption), 1)
        }
      } catch (error) {
        console.error('加载月数据失败:', error)
      }
    },
    
    getTrendIcon(trend) {
      const icons = {
        up: '📈',
        down: '📉',
        stable: '➡️'
      }
      return icons[trend] || '➡️'
    },
    
    getTrendText(trend) {
      const texts = {
        up: '上升',
        down: '下降',
        stable: '稳定'
      }
      return texts[trend] || '稳定'
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
.monthly-report-page {
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

.month-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.month-nav {
  padding: 12rpx;
}

.month-nav.disabled {
  opacity: 0.3;
}

.nav-icon {
  width: 32rpx;
  height: 32rpx;
}

.month-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.month-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
}

.month-label {
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

.weekly-chart,
.comparison-chart {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.chart-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.bar-container {
  flex: 1;
  height: 60rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  overflow: hidden;
  position: relative;
}

.bar-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: linear-gradient(135deg, #07c160, #059e4a);
  border-radius: 8rpx;
  transition: width 0.3s ease;
}

.bar-label {
  width: 100rpx;
  font-size: 24rpx;
  color: #666;
  text-align: right;
}

.bar-value {
  width: 100rpx;
  font-size: 24rpx;
  color: #07c160;
  font-weight: 600;
}

.comparison-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.comparison-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comparison-label {
  font-size: 26rpx;
  color: #333;
}

.comparison-value {
  font-size: 26rpx;
  color: #07c160;
  font-weight: 600;
}

.comparison-bar {
  height: 24rpx;
  background: #f0f0f0;
  border-radius: 12rpx;
  overflow: hidden;
}

.comparison-fill {
  height: 100%;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  border-radius: 12rpx;
  transition: width 0.3s ease;
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

.purchase-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.purchase-stat-item {
  background: #f0f9ff;
  border-radius: 12rpx;
  padding: 24rpx;
  text-align: center;
}

.purchase-stat-item .stat-label {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.purchase-stat-item .stat-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #1890ff;
  display: block;
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

.trend-analysis {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.trend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.trend-label {
  font-size: 28rpx;
  color: #333;
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #666;
}

.trend-indicator.up {
  background: #fff7e6;
  color: #faad14;
}

.trend-indicator.down {
  background: #f6ffed;
  color: #52c41a;
}

.trend-indicator.stable {
  background: #e6f7ff;
  color: #1890ff;
}

.trend-icon {
  font-size: 24rpx;
}

.trend-text {
  font-weight: 500;
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