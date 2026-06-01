<template>
  <view class="home-root">
    <!-- 没有家庭时显示的欢迎界面 -->
    <view v-if="!hasFamily" class="welcome-container">
      <view class="welcome-box">
        <text class="welcome-title">欢迎来到食材管家</text>
        <text class="welcome-desc">创建或加入一个家庭，与家人一起分享美食、计划每周菜单，带起温馨的家庭美食生活</text>
        <view class="welcome-buttons">
          <button class="welcome-btn create-btn" @tap="goToCreateFamily">创建家庭</button>
          <button class="welcome-btn join-btn" @tap="goToJoinFamily">加入家庭</button>
        </view>
        <text class="welcome-remark">创建家庭后，邀请家人加入，共同管理家庭菜谱</text>
      </view>
    </view>
    
    <!--  有家庭时显示的正常界面 -->
    <view v-else>
      <view class="fixed-header">
        <view class="header-gradient">
          <view class="header-content">
            <image :src="userAvatar" class="avatar"/>
            <text class="username">{{ userName }}</text>
          </view>
          
          <view class="calendar-icons-row">
            <scroll-view 
              class="calendar-scroll" 
              scroll-x 
              show-scrollbar="false"
              :scroll-into-view="scrollIntoView"
              :scroll-with-animation="true"
            >
              <view class="calendar-list">
                <view 
                  v-for="(day, index) in calendarDays" 
                  :key="day.fullDate" 
                  :id="'day-' + index"
                  class="calendar-item"
                  :class="{ active: isSelectedDate(day) }"
                  @tap="selectDate(day)"
                >
                  <text class="day-num">{{ day.day }}</text>
                  <text class="day-week">{{ day.week }}</text>
                </view>
              </view>
            </scroll-view>
            
            <view class="header-icons">
              <view class="icon-wrapper" @tap="goToHistory">
                <image src="/static/icons/calendar.png" class="header-icon"/>
              </view>
              <view class="icon-wrapper" @tap="goToChart">
                <image src="/static/icons/chart.png" class="header-icon"/>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 动态高度的占位元素 -->
      <view class="header-placeholder" :style="{ height: headerHeight + 'px' }"></view>
      
      <view class="ai-section">
        <view class="ai-gradient-bg">
          <view class="ai-content" @tap="goToAiChat">
            <text class="ai-text left">点击助手</text>
            <image src="/static/icons/ai.png" class="ai-icon"/>
            <text class="ai-text right">一键查询</text>
          </view>
        </view>
      </view>

      <view class="invite-section">
        <view class="invite-bar" @tap="inviteFamily">
          <text class="invite-text">邀请家人</text>
        </view>
      </view>

      <!-- 菜谱与食材卡片组件 -->
      <RecipeAndInventoryCard :selectedDate="selectedDate" />
    </view>
  </view>
</template>

<script>
import { mapState } from 'vuex'
import RecipeAndInventoryCard from './RecipeAndInventoryCard.vue'
import api from '@/utils/api'
import { requireLogin } from '@/utils/pageGuard'

export default {
  components: { RecipeAndInventoryCard },
  data() {
    return {
      tab: 'recipe',
      selectedDate: new Date(),
      calendarDays: [],
      scrollIntoView: '',
      viewStyle: 'grid',
      headerHeight: 0,
      meals: [],
      suggestedItems: [],
      stockItems: [],
      loading: false
    }
  },
  computed: {
    ...mapState('user', ['userInfo', 'currentFamily']),
    userName() {
      return this.userInfo?.nickname || '用户'
    },
userAvatar() {
  const avatarUrl = this.userInfo?.avatarUrl
  if (!avatarUrl) return '/static/images/default-avatar.png'
  // 如果已经是完整URL，直接返回
  if (/^https?:\/\//.test(avatarUrl)) return avatarUrl
  // 拼接baseURL（去掉/api，防止重复）
  let baseURL = api.baseURL || ''
  if (baseURL.endsWith('/api')) {
    baseURL = baseURL.slice(0, -4)
  }
  return baseURL + (avatarUrl.startsWith('/') ? avatarUrl : '/' + avatarUrl)
} ,
    viewStyleText() {
      return this.viewStyle === 'grid' ? '列表' : '网格'
    },
    hasFamily() {
      const familyId = this.userInfo?.familyId
      const currentFamily = this.currentFamily
      const result = !!(familyId || currentFamily?.id)
      console.log('hasFamily计算:', { familyId, currentFamily, result, userInfo: this.userInfo })
      return result
    }
  },
  onLoad() {
    console.log('home.vue onLoad')
    
    if (!requireLogin()) {
      return
    }
    
    console.log('userInfo:', this.userInfo)
    console.log('hasFamily:', this.hasFamily)
    this.generateCalendarDays()
    this.loadData()
  },
  onShow() {
    console.log('home.vue onShow')
    
    if (!requireLogin()) {
      return
    }
    
    console.log('userInfo:', this.userInfo)
    console.log('hasFamily:', this.hasFamily)
    this.$forceUpdate()
  },
  onReady() {
    // 获取固定头部的实际高度
    this.$nextTick(() => {
      const query = uni.createSelectorQuery().in(this);
      query.select('.fixed-header').boundingClientRect(data => {
        if (data) {
          this.headerHeight = data.height;
        }
      }).exec();
      
      // 滚动到今天（索引30，因为从-30天开始）
      this.scrollIntoView = 'day-30';
    });
  },
  methods: {
    generateCalendarDays() {
      const days = []
      const today = new Date()
      const weekDays = ['日', '一', '二', '三', '四', '五', '六']
      
      for (let i = -30; i <= 365; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        days.push({
          date: date,
          day: date.getDate(),
          week: weekDays[date.getDay()],
          fullDate: `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
        })
      }
      this.calendarDays = days
    },
    isSelectedDate(day) {
      return day.date.toDateString() === this.selectedDate.toDateString()
    },
    selectDate(day) {
      this.selectedDate = day.date
      this.loadData()
    },
    switchViewStyle() {
      this.viewStyle = this.viewStyle === 'grid' ? 'list' : 'grid'
    },
    priorityText(priority) {
      const map = {
        high: '急需',
        medium: '建议',
        low: '可选'
      }
      return map[priority] || ''
    },
    statusText(status) {
      const map = {
        fresh: '新鲜',
        normal: '正常',
        warning: '临期',
        expired: '过期'
      }
      return map[status] || ''
    },
    handleRecipeClick(recipe) {
      uni.navigateTo({
        url: `/pages/home/recipe/detail?id=${recipe.id}`
      })
    },
    handleItemClick(item) {
      uni.navigateTo({
        url: `/pages/home/inventory/detail?id=${item.id}`
      })
    },
    goToHistory() {
      uni.navigateTo({ url: '/pages/home/history' })
    },
    goToChart() {
      uni.navigateTo({ url: '/pages/home/chart' })
    },
    goToAiChat() {
      uni.navigateTo({ url: '/pages/home/ai/chat' })
    },
    inviteFamily() {
      uni.navigateTo({ url: '/pages/profile/family/family' })
    },
    goToCreateFamily() {
      uni.navigateTo({ url: '/pages/profile/family/create' })
    },
    goToJoinFamily() {
      uni.navigateTo({ url: '/pages/profile/family/add-family' })
    },
    async loadData() {
      console.log('========== 开始加载数据 ==========')
      
      if (this.loading) {
        console.log('正在加载中，跳过')
        return
      }
      this.loading = true
      
      console.log('用户信息:', this.userInfo)
      console.log('用户ID:', this.userInfo?.id)
      console.log('家庭ID:', this.userInfo?.familyId)
      console.log('当前家庭ID:', this.userInfo?.currentFamilyId)
      
      try {
        const familyId = this.userInfo?.familyId || this.userInfo?.currentFamilyId
        const userId = this.userInfo?.id
        
        console.log('使用的 familyId:', familyId)
        console.log('使用的 userId:', userId)
        
        if (!familyId) {
          console.log('familyId 为空，显示欢迎界面')
          return
        }
        
        if (!userId) {
          console.error('userId 为空，无法加载数据')
          uni.showToast({
            title: '用户信息未加载',
            icon: 'none'
          })
          return
        }
        
        console.log('开始并发请求菜谱和库存数据...')
        await Promise.all([
          this.loadTodayRecipes(familyId, userId),
          this.loadInventoryData(familyId)
        ])
        
        console.log('数据加载完成')
        console.log('菜谱数量:', this.meals.length)
        console.log('库存数量:', this.stockItems.length)
        console.log('建议补充数量:', this.suggestedItems.length)
      } catch (error) {
        console.error('加载数据失败:', error)
        uni.showToast({
          title: '加载数据失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
        console.log('========== 数据加载结束 ==========')
      }
    },
    async loadTodayRecipes(familyId, userId) {
      try {
        console.log('请求菜谱推荐:', familyId, userId, '选中日期:', this.selectedDate)
        
        // 1. 优先获取前一天用餐记录
        const yesterday = new Date(this.selectedDate)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]
        
        let previousRecords = []
        try {
          const recordRes = await api.recipe.getPreviousDayRecords(
            familyId,
            userId,
            yesterdayStr
          )
          
          if (recordRes.code === 200 && Array.isArray(recordRes.data)) {
            previousRecords = recordRes.data
            console.log('获取到前一天记录:', previousRecords)
          }
        } catch (err) {
          console.error('获取历史记录失败:', err)
        }
        
        // 2. 有历史记录则直接使用
        if (previousRecords.length > 0) {
          this.setMealRecommendFromRecords(previousRecords)
          return
        }
        
        // 3. 无历史记录时使用智能推荐
        const selectedDateStr = `${this.selectedDate.getFullYear()}-${String(this.selectedDate.getMonth() + 1).padStart(2, '0')}-${String(this.selectedDate.getDate()).padStart(2, '0')}`
        
        const res = await api.recipe.dateRecommend(Number(familyId), Number(userId), selectedDateStr)
        console.log('菜谱响应:', res)
        
        if (res.code === 200 && res.data) {
          let recipes = res.data.recipes || res.data || []
          
          if (!Array.isArray(recipes)) {
            console.warn('菜谱数据格式不正确，期望数组，实际:', typeof recipes)
            recipes = []
          }
          
          console.log('菜谱数据:', recipes)
          
          const mealTypes = [
            { type: 'breakfast', title: '早餐', time: '07:00-09:00' },
            { type: 'lunch', title: '午餐', time: '11:30-13:30' },
            { type: 'dinner', title: '晚餐', time: '18:00-20:00' }
          ]
          
          this.meals = mealTypes.map(meal => ({
            ...meal,
            recipes: recipes.filter(r => r.mealType === meal.type || !r.mealType).map(recipe => ({
              id: recipe.id,
              name: recipe.name,
              desc: recipe.description || '暂无介绍',
              image: recipe.cover || recipe.imageUrl || '/static/images/recipe-default.jpg',
              ingredients: recipe.ingredients || []
            }))
          }))
          
          console.log('处理后的菜谱数据:', this.meals)
        } else {
          console.warn('菜谱响应格式不正确:', res)
        }
      } catch (error) {
        console.error('加载菜谱推荐失败:', error)
        uni.showToast({
          title: '加载菜谱失败',
          icon: 'none'
        })
      }
    },
    setMealRecommendFromRecords(records) {
      console.log('使用前一天记录生成推荐:', records)
      
      const mealTypes = [
        { type: 'breakfast', title: '早餐', time: '07:00-09:00' },
        { type: 'lunch', title: '午餐', time: '11:30-13:30' },
        { type: 'dinner', title: '晚餐', time: '18:00-20:00' }
      ]
      
      // 假设 records 中的每一项包含 recipe 信息或者本身就是 recipe 结构
      // 根据实际返回结构调整这里的映射逻辑
      this.meals = mealTypes.map(meal => ({
        ...meal,
        recipes: records
          .filter(r => r.mealType === meal.type || (meal.type === 'breakfast' && !r.mealType)) // 简单兼容没有mealType的情况
          .map(record => {
            // 如果记录中嵌套了 recipe 对象，则使用 record.recipe，否则直接使用 record
            const recipe = record.recipe || record
            return {
              id: recipe.id || record.id,
              name: recipe.name || record.name,
              desc: recipe.description || '昨日用餐',
              image: recipe.cover || recipe.imageUrl || record.cover || '/static/images/recipe-default.jpg',
              ingredients: recipe.ingredients || []
            }
          })
      }))
      
      console.log('基于历史记录处理后的菜谱数据:', this.meals)
    },
    async loadInventoryData(familyId) {
      try {
        console.log('请求库存数据:', familyId)
        const res = await api.inventory.getFamilyInventory(Number(familyId))
        console.log('库存响应:', res)
        
        if (res.code === 200 && res.data) {
          let inventory = res.data
          
          if (!Array.isArray(inventory)) {
            console.warn('库存数据格式不正确，期望数组，实际:', typeof inventory)
            inventory = []
          }
          
          console.log('库存数据:', inventory)
          
          this.stockItems = inventory.map(item => ({
            id: item.id,
            name: item.ingredientName || item.name,
            icon: this.getIngredientIcon(item.ingredientName || item.name),
            quantity: item.quantity,
            unit: item.unit || '个',
            expiryDate: item.expiryDate,
            status: this.getInventoryStatus(item.expiryDate)
          }))
          
          this.suggestedItems = this.calculateSuggestedItems(inventory)
          
          console.log('处理后的库存数据:', this.stockItems.length, '项')
          console.log('建议补充:', this.suggestedItems)
        } else {
          console.warn('库存响应格式不正确:', res)
        }
      } catch (error) {
        console.error('加载库存数据失败:', error)
        uni.showToast({
          title: '加载库存失败',
          icon: 'none'
        })
      }
    },
    getIngredientIcon(name) {
      const iconMap = {
        '鸡蛋': '🥚',
        '牛奶': '🥛',
        '面包': '🍞',
        '番茄': '🍅',
        '土豆': '🥔',
        '猪肉': '🥩',
        '鸡肉': '🍗',
        '牛肉': '🥩',
        '鱼': '🐟',
        '蔬菜': '🥬',
        '水果': '🍎',
        '米饭': '🍚',
        '面条': '🍜'
      }
      return iconMap[name] || '🥘'
    },
    getInventoryStatus(expiryDate) {
      if (!expiryDate) return 'normal'
      
      const today = new Date()
      const expiry = new Date(expiryDate)
      const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'expired'
      if (diffDays <= 3) return 'warning'
      if (diffDays <= 7) return 'normal'
      return 'fresh'
    },
    calculateSuggestedItems(inventory) {
      const priorityMap = {
        '鸡蛋': 'high',
        '牛奶': 'high',
        '面包': 'medium',
        '蔬菜': 'medium',
        '水果': 'low',
        '肉类': 'high'
      }
      
      const suggested = []
      
      inventory.forEach(item => {
        const priority = priorityMap[item.ingredientName] || 'low'
        const quantity = parseFloat(item.quantity) || 0
        
        let suggestedQuantity = 0
        let shouldSuggest = false
        
        switch (priority) {
          case 'high':
            if (quantity < 5) {
              suggestedQuantity = 10 - quantity
              shouldSuggest = true
            }
            break
          case 'medium':
            if (quantity < 3) {
              suggestedQuantity = 5 - quantity
              shouldSuggest = true
            }
            break
          case 'low':
            if (quantity < 2) {
              suggestedQuantity = 3 - quantity
              shouldSuggest = true
            }
            break
        }
        
        if (shouldSuggest) {
          suggested.push({
            id: item.id,
            name: item.ingredientName,
            icon: this.getIngredientIcon(item.ingredientName),
            suggestedQuantity: Math.max(1, Math.round(suggestedQuantity)),
            unit: item.unit || '个',
            priority: priority
          })
        }
      })
      
      return suggested.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
    }
  }
}
</script>

<style scoped>
.home-root {
  min-height: 100vh;
  background: #f5f7fa;
}

.welcome-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.welcome-box {
  width: 100%;
  max-width: 600rpx;
  background: #fff;
  border-radius: 32rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.welcome-title {
  font-size: 48rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 32rpx;
}

.welcome-desc {
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
  margin-bottom: 48rpx;
}

.welcome-buttons {
  display: flex;
  gap: 24rpx;
  width: 100%;
  margin-bottom: 32rpx;
}

.welcome-btn {
  flex: 1;
  padding: 28rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  border: none;
}

.create-btn {
  background: linear-gradient(135deg, #52b788 0%, #2d865a 100%);
  color: #fff;
}

.join-btn {
  background: linear-gradient(135deg, #b5e48c 0%, #52b788 100%);
  color: #fff;
}

.welcome-remark {
  font-size: 24rpx;
  color: #999;
  line-height: 1.6;
}

.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

/* .fixed-header[hidden],
.fixed-header[hidden] * {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
} */

.header-gradient {
  background: linear-gradient(135deg, #b5e48c 0%, #52b788 100%);
  padding-top: calc(var(--status-bar-height) + 20rpx);
  padding-left: 24rpx;
  padding-right: 24rpx;
  padding-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
}

.header-content {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.8);
}

.username {
  font-size: 36rpx;
  color: #1a1a1a;
  font-weight: bold;
  text-shadow: 0 1rpx 4rpx rgba(255, 255, 255, 0.3);
  position: relative;
  z-index: 2;
}

.calendar-icons-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.calendar-scroll {
  flex: 1;
  overflow: hidden;
}

.calendar-list {
  display: flex;
  padding: 0 8rpx;
}

.calendar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 20rpx;
  margin-right: 12rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.2);
  min-width: 80rpx;
  transition: all 0.3s;
}

.calendar-item.active {
  background: #fff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.day-num {
  font-size: 32rpx;
  color: #1a1a1a;
  font-weight: bold;
  margin-bottom: 4rpx;
  position: relative;
  z-index: 2;
}

.calendar-item.active .day-num {
  color: #2d865a;
}

.day-week {
  font-size: 24rpx;
  color: rgba(26, 26, 26, 0.7);
  position: relative;
  z-index: 2;
}

.calendar-item.active .day-week {
  color: #2d865a;
}

.header-icons {
  display: flex;
  gap: 12rpx;
  align-items: center;
  flex-shrink: 0;
}
.icon-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24rpx 20rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.2);
  min-width: 80rpx;
  min-height: 88rpx;
  transition: all 0.3s;
}
 
.icon-wrapper:active {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(0.95);
}
.header-icon {
  width: 56rpx;
  height: 56rpx;
  opacity: 0.9;
}

/* 占位元素样式 */
.header-placeholder {
  width: 100%;
}

/* AI 模块样式 */
.ai-section {
  margin-top: 0;
  padding: 0 24rpx;
  position: relative;
  z-index: 10;
  background: transparent;
}

.ai-gradient-bg {
  background: linear-gradient(135deg, #b5e48c 0%, #52b788 100%);
  border-radius: 0 0 45rpx 45rpx;
  box-shadow: 0 8rpx 32rpx rgba(45, 134, 160, 0.3);
  overflow: hidden;
  margin: 0 -24rpx;
  width: calc(100% + 48rpx);
  position: relative;
  backdrop-filter: blur(8px);
}

.ai-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 24rpx;
  cursor: pointer;
}

.ai-icon {
  width: 120rpx;
  height: 120rpx;
  margin: 0 32rpx;
}

.ai-text {
  font-size: 36rpx;
  color: #1a1a1a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  text-shadow: 0 1rpx 4rpx rgba(255, 255, 255, 0.3);
  letter-spacing: 4rpx;
  font-weight: bold;
  opacity: 0.95;
  position: relative;
  z-index: 2;
}

.ai-text.left {
  margin-right: 12rpx;
}

.ai-text.right {
  margin-left: 12rpx;
}

.invite-section {
  margin-top: 32rpx;
  padding: 0 24rpx;
}

.invite-bar {
  background: #ff6b6b;
  border-radius: 24rpx;
  padding: 32rpx 0;
  text-align: center;
  box-shadow: 0 6rpx 20rpx rgba(255, 107, 107, 0.3);
  cursor: pointer;
}

.invite-text {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
  letter-spacing: 4rpx;
}

.content-section {
  margin-top: 32rpx;
  margin-left: 24rpx;
  margin-right: 24rpx;
  background: #fff;
  border-radius: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
  padding: 32rpx 24rpx 60rpx 24rpx;
  min-height: 800rpx;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.tab-buttons {
  display: flex;
  gap: 48rpx;
}

.tab-btn {
  font-size: 32rpx;
  color: #999;
  padding-bottom: 8rpx;
  border-bottom: 4rpx solid transparent;
  transition: all 0.3s;
  font-weight: 500;
}

.tab-btn.active {
  color: #1ba035;
  border-bottom-color: #1ba035;
  font-weight: bold;
}

.view-switch {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.1);
  border: 3rpx solid #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.view-switch.list {
  background: rgba(153, 153, 153, 0.1);
  border-color: #999;
}

.view-switch:active {
  transform: scale(0.95);
}

.view-switch.grid:active {
  background: rgba(59, 130, 246, 0.2);
}

.view-switch.list:active {
  background: rgba(153, 153, 153, 0.2);
}

.switch-icon {
  font-size: 36rpx;
  color: #3b82f6;
  font-weight: bold;
  line-height: 1;
}

.view-switch.list .switch-icon {
  color: #999;
}

.tab-content {
  min-height: 600rpx;
}

.recipe-list,
.inventory-list {
  padding: 0 24rpx;
}

.meal-section {
  margin-bottom: 48rpx;
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding: 0 8rpx;
}

.meal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1ba035;
}

.meal-time {
  font-size: 24rpx;
  color: #999;
}

.recipe-items {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.recipe-items.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.recipe-item {
  background: #f8fff9;
  border-radius: 20rpx;
  padding: 20rpx;
  display: flex;
  gap: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(6, 200, 99, 0.08);
  cursor: pointer;
  transition: all 0.3s;
}

.recipe-item:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(6, 200, 99, 0.12);
}

.recipe-items.grid .recipe-item {
  flex-direction: column;
}

.recipe-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  object-fit: cover;
  flex-shrink: 0;
}

.recipe-items.grid .recipe-img {
  width: 100%;
  height: 180rpx;
}

.recipe-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.recipe-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #1ba035;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recipe-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-ingredients {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  font-size: 24rpx;
  color: #888;
  line-height: 1.5;
}

.ingredients-label {
  color: #1ba035;
  font-weight: bold;
  flex-shrink: 0;
}

.ingredients-text {
  flex: 1;
}

.recipe-action {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 24rpx;
  background: linear-gradient(135deg, #06c863 0%, #1ba035 100%);
  border-radius: 24rpx;
  margin-top: auto;
}

.recipe-items.grid .recipe-action {
  width: 100%;
  margin-top: 16rpx;
}

.action-text {
  color: #fff;
  font-size: 26rpx;
  font-weight: bold;
}

.inventory-block {
  margin-bottom: 48rpx;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding: 0 8rpx;
}

.block-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1ba035;
}

.block-count {
  font-size: 24rpx;
  color: #999;
}

.inventory-items {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.inventory-items.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.inventory-item {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s;
  border: 2rpx solid transparent;
}

.inventory-item:active {
  transform: scale(0.98);
}

.inventory-item.high {
  border-color: #ff4d4f;
  background: #fff2f0;
}

.inventory-item.warning {
  border-color: #faad14;
  background: #fffbe6;
}

.inventory-item.expired {
  border-color: #ff4d4f;
  background: #fff2f0;
}

.item-icon {
  font-size: 120rpx;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.item-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.item-quantity {
  font-size: 26rpx;
  color: #666;
}

.item-expiry {
  font-size: 24rpx;
  color: #999;
}

.item-priority,
.item-status {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
}

.empty-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
  width: 100%;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  text-align: center;
}
.item-priority.high,
.item-status.warning,
.item-status.expired {
  background: #ff4d4f;
}

.item-priority.medium {
  background: #faad14;
}

.item-priority.low {
  background: #52c41a;
}

.item-status.fresh {
  background: #52c41a;
}

.item-status.normal {
  background: #1890ff;
}

.priority-text,
.status-text {
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
}
</style>