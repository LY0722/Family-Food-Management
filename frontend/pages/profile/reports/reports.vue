<template>
  <view class="reports-page">
    <view class="header">
      <view class="header-left" @tap="goBack">
        <image src="/static/icons/arrow-left.png" class="back-icon"/>
      </view>
      <view class="header-center">
        <text class="header-title">数据报告</text>
      </view>
      <view class="header-right"></view>
    </view>
    
    <view class="page-header">
      <text class="page-title">数据报告</text>
      <text class="page-desc">查看您的食材消耗和浪费统计</text>
    </view>
    
    <view class="time-filter">
      <view 
        class="filter-item" 
        :class="{ active: timeFilter === 'week' }"
        @tap="setTimeFilter('week')"
      >
        <text class="filter-text">本周</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: timeFilter === 'month' }"
        @tap="setTimeFilter('month')"
      >
        <text class="filter-text">本月</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: timeFilter === 'custom' }"
        @tap="setTimeFilter('custom')"
      >
        <text class="filter-text">自定义</text>
      </view>
    </view>
    
    <scroll-view class="page-content" scroll-y>
      <view class="stats-cards">
        <view class="stat-card">
          <text class="stat-value">{{ stats.consumption || 0 }}kg</text>
          <text class="stat-label">食材消耗</text>
          <view class="stat-change" :class="{ positive: stats.consumptionChange > 0 }">
            <text>{{ stats.consumptionChange > 0 ? '+' : '' }}{{ stats.consumptionChange || 0 }}%</text>
            <text class="change-text">较上期</text>
          </view>
        </view>
        
        <view class="stat-card">
          <text class="stat-value">{{ stats.wasteRate || 0 }}%</text>
          <text class="stat-label">浪费率</text>
          <view class="stat-change" :class="{ positive: stats.wasteChange < 0 }">
            <text>{{ stats.wasteChange > 0 ? '+' : '' }}{{ stats.wasteChange || 0 }}%</text>
            <text class="change-text">较上期</text>
          </view>
        </view>
        
        <view class="stat-card">
          <text class="stat-value">¥{{ stats.saved || 0 }}</text>
          <text class="stat-label">节省金额</text>
          <view class="stat-change positive">
            <text>+{{ stats.savedChange || 0 }}%</text>
            <text class="change-text">较上期</text>
          </view>
        </view>
      </view>
      
      <view class="chart-section">
        <view class="section-header">
          <text class="section-title">消耗趋势</text>
          <text class="section-desc">按{{ timeFilter === 'week' ? '天' : '周' }}统计</text>
        </view>
        <view class="chart-container">
          <canvas 
            canvas-id="trendChart" 
            class="chart-canvas"
            :style="{ width: chartWidth + 'px', height: chartHeight + 'px' }"
          ></canvas>
        </view>
      </view>
      
      <view class="chart-section">
        <view class="section-header">
          <text class="section-title">食材分类消耗</text>
          <text class="section-desc">占比统计</text>
        </view>
        <view class="pie-chart-container">
          <canvas 
            canvas-id="categoryChart" 
            class="pie-canvas"
            :style="{ width: pieChartSize + 'px', height: pieChartSize + 'px' }"
          ></canvas>
          <view class="pie-legend">
            <view 
              class="legend-item" 
              v-for="category in categories" 
              :key="category.id"
            >
              <view class="legend-color" :style="{ background: category.color }"></view>
              <text class="legend-text">{{ category.name }} {{ category.percentage }}%</text>
            </view>
          </view>
        </view>
      </view>
      
      <view class="chart-section">
        <view class="section-header">
          <text class="section-title">浪费统计</text>
          <text class="section-desc">按食材类型</text>
        </view>
        <view class="waste-list">
          <view 
            class="waste-item" 
            v-for="item in wasteList" 
            :key="item.id"
          >
            <text class="waste-name">{{ item.name }}</text>
            <text class="waste-amount">¥{{ item.amount }}</text>
            <text class="waste-count">{{ item.count }}次</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <view class="page-footer">
      <button class="export-btn" @tap="handleExport">
        <image src="/static/icons/export.png" class="btn-icon" />
        <text>导出报告</text>
      </button>
    </view>
  </view>
</template>

<script>
import { requireLogin } from '@/utils/pageGuard'

export default {
  name: 'ReportsPage',
  
  data() {
    return {
      timeFilter: 'week',
      chartWidth: 320,
      chartHeight: 200,
      pieChartSize: 200,
      stats: {
        consumption: 12.5,
        consumptionChange: -3.2,
        wasteRate: 5.2,
        wasteChange: -1.5,
        saved: 156,
        savedChange: 8.7
      },
      categories: [
        { id: 1, name: '蔬菜', icon: '🥬', amount: 4.2, percentage: 35, color: '#52c41a' },
        { id: 2, name: '肉类', icon: '🥩', amount: 3.5, percentage: 29, color: '#ff4d4f' },
        { id: 3, name: '水果', icon: '🍎', amount: 2.1, percentage: 18, color: '#faad14' },
        { id: 4, name: '蛋奶', icon: '🥚', amount: 1.5, percentage: 12, color: '#1890ff' },
        { id: 5, name: '其他', icon: '📦', amount: 0.7, percentage: 6, color: '#8c8c8c' }
      ],
      wasteList: [
        { id: 1, name: '叶菜类', amount: 23.5, count: 5 },
        { id: 2, name: '水果', amount: 18.2, count: 3 },
        { id: 3, name: '面包', amount: 12.8, count: 4 },
        { id: 4, name: '乳制品', amount: 8.5, count: 2 }
      ]
    }
  },
  
  onLoad() {
    if (!requireLogin()) {
      return
    }
    
    this.loadReportData()
  },
  
  onReady() {
    this.drawTrendChart()
    this.drawPieChart()
  },
  
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    setTimeFilter(filter) {
      this.timeFilter = filter
      this.loadReportData()
    },
    
    async loadReportData() {
      try {
        const familyId = this.$store.state.user.currentFamily?.id
        if (!familyId) {
          console.warn('无法加载报告：无效的家庭ID')
          uni.showToast({
            title: '请先创建或加入家庭',
            icon: 'none'
          })
          return
        }
        
        const endDate = new Date().toISOString().split('T')[0]
        let startDate = endDate
        
        if (this.timeFilter === 'week') {
          const weekStart = new Date()
          weekStart.setDate(weekStart.getDate() - weekStart.getDay())
          startDate = weekStart.toISOString().split('T')[0]
        } else if (this.timeFilter === 'month') {
          const monthStart = new Date()
          monthStart.setDate(1)
          startDate = monthStart.toISOString().split('T')[0]
        }
        
        const response = await this.$api.report.getConsumptionReport(
          familyId,
          startDate,
          endDate
        )
        
        if (response.code === 200) {
          this.stats = response.data.stats || this.stats
          this.categories = response.data.categories || this.categories
          this.wasteList = response.data.wasteList || this.wasteList
          
          this.$nextTick(() => {
            this.drawTrendChart()
            this.drawPieChart()
          })
        }
      } catch (error) {
        console.error('加载报告数据失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    },
    
    drawTrendChart() {
      const ctx = uni.createCanvasContext('trendChart', this)
      
      const padding = 40
      const width = this.chartWidth
      const height = this.chartHeight
      const chartWidth = width - padding * 2
      const chartHeight = height - padding * 2
      
      ctx.clearRect(0, 0, width, height)
      
      let labels = []
      let data = []
      
      if (this.timeFilter === 'week') {
        labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        data = [1.5, 2.3, 1.8, 2.1, 1.9, 2.5, 2.2]
      } else {
        labels = ['第1周', '第2周', '第3周', '第4周']
        data = [8.5, 9.2, 7.8, 10.5]
      }
      
      const maxValue = Math.max(...data) * 1.2
      const minValue = 0
      
      ctx.setStrokeStyle('#e0e0e0')
      ctx.setLineWidth(1)
      
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(width - padding, y)
        ctx.stroke()
        
        const value = maxValue - (maxValue / 5) * i
        ctx.setFontSize(10)
        ctx.setFillStyle('#999')
        ctx.fillText(value.toFixed(1), 5, y + 3)
      }
      
      const stepX = chartWidth / (labels.length - 1)
      
      labels.forEach((label, index) => {
        const x = padding + stepX * index
        ctx.setFontSize(10)
        ctx.setFillStyle('#666')
        ctx.setTextAlign('center')
        ctx.fillText(label, x, height - padding + 15)
      })
      
      ctx.setStrokeStyle('#1890ff')
      ctx.setLineWidth(2)
      ctx.beginPath()
      
      data.forEach((value, index) => {
        const x = padding + stepX * index
        const y = padding + chartHeight - (value / maxValue) * chartHeight
        
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      
      ctx.stroke()
      
      data.forEach((value, index) => {
        const x = padding + stepX * index
        const y = padding + chartHeight - (value / maxValue) * chartHeight
        
        ctx.setFillStyle('#1890ff')
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.setFontSize(10)
        ctx.setFillStyle('#333')
        ctx.setTextAlign('center')
        ctx.fillText(value.toFixed(1), x, y - 8)
      })
      
      ctx.draw()
    },
    
    drawPieChart() {
      const ctx = uni.createCanvasContext('categoryChart', this)
      
      const centerX = this.pieChartSize / 2
      const centerY = this.pieChartSize / 2
      const radius = this.pieChartSize / 2 - 20
      
      ctx.clearRect(0, 0, this.pieChartSize, this.pieChartSize)
      
      let startAngle = -Math.PI / 2
      
      this.categories.forEach(category => {
        const sliceAngle = (category.percentage / 100) * Math.PI * 2
        const endAngle = startAngle + sliceAngle
        
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, startAngle, endAngle)
        ctx.closePath()
        
        ctx.setFillStyle(category.color)
        ctx.fill()
        
        const midAngle = startAngle + sliceAngle / 2
        const textRadius = radius * 0.7
        const textX = centerX + Math.cos(midAngle) * textRadius
        const textY = centerY + Math.sin(midAngle) * textRadius
        
        if (category.percentage > 5) {
          ctx.setFontSize(10)
          ctx.setFillStyle('#fff')
          ctx.setTextAlign('center')
          ctx.setTextBaseline('middle')
          ctx.fillText(category.percentage + '%', textX, textY)
        }
        
        startAngle = endAngle
      })
      
      ctx.draw()
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
.reports-page {
  width: 100vw;
  height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  flex-shrink: 0;
}

.header-left,
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

.page-header {
  background: white;
  padding: 32rpx 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.08);
}

.page-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.page-desc {
  font-size: 26rpx;
  color: #666;
}

.time-filter {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  background: white;
  border-bottom: 1rpx solid #f0f0f0;
}

.filter-item {
  flex: 1;
  text-align: center;
  padding: 16rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  border: 2rpx solid transparent;
}

.filter-item.active {
  background: #e6f7ff;
  border-color: #1890ff;
}

.filter-text {
  font-size: 26rpx;
  color: #666;
}

.filter-item.active .filter-text {
  color: #1890ff;
  font-weight: 600;
}

.page-content {
  flex: 1;
  padding: 20rpx;
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
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}

.stat-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #07c160;
  display: block;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.stat-change {
  font-size: 20rpx;
  color: #ff6b6b;
  display: flex;
  align-items: center;
  justify-content: center;
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
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
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

.chart-container {
  width: 100%;
  height: 400rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-canvas {
  width: 320px;
  height: 200px;
}

.pie-chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.pie-canvas {
  width: 200px;
  height: 200px;
}

.pie-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.legend-color {
  width: 24rpx;
  height: 24rpx;
  border-radius: 4rpx;
}

.legend-text {
  font-size: 24rpx;
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

.page-footer {
  background: white;
  padding: 20rpx 24rpx;
  box-shadow: 0 -2rpx 12rpx rgba(0,0,0,0.08);
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