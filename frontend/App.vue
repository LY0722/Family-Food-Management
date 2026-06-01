<script>
export default {
  name: 'App',
  
  // 小程序生命周期
  onLaunch(options) {
    console.log('小程序启动', options)
    
    // 先初始化 Vuex store 中的用户数据
    this.$store.dispatch('user/initUser').then((isLoggedIn) => {
      console.log('Vuex 用户初始化结果:', isLoggedIn)
      
      if (!isLoggedIn) {
        // 没有登录，跳转登录页
        console.log('未登录，跳转登录页')
        uni.reLaunch({
          url: '/pages/login/login'
        })
      } else {
        // 已登录，跳转到首页（使用switchTab因为home在tabBar中）
        console.log('已登录，跳转到首页')
        uni.switchTab({
          url: '/pages/home/home'
        })
      }
    })
  },
  
  onShow(options) {
    console.log('小程序显示', options)
  },
  
  onHide() {
    console.log('小程序隐藏')
  },
  
  // 小程序错误处理
  onError(error) {
    console.error('小程序发生错误:', error)
  },
  
  // 页面不存在处理
  onPageNotFound(res) {
    console.warn('页面不存在:', res)
    // 重定向到登录页
    uni.redirectTo({
      url: '/pages/login/login'
    })
  }
}
</script>

<style>
/* 全局样式 */
page {
  height: 100%;
  background-color: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100%;
}

/* 按钮样式 */
.btn-primary {
  background-color: #07c160;
  color: white;
  border-radius: 8rpx;
  padding: 20rpx 40rpx;
  font-size: 30rpx;
  text-align: center;
  border: none;
  transition: background-color 0.3s;
}

.btn-primary:active {
  background-color: #06ad56;
}

.btn-primary:disabled {
  background-color: #cccccc;
  color: #999999;
}

/* 卡片样式 */
.card {
  background-color: white;
  border-radius: 16rpx;
  padding: 32rpx;
  margin: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

/* 标签样式 */
.tag {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  margin-right: 10rpx;
  line-height: 1;
}

.tag-success {
  background-color: #e7f7ef;
  color: #07c160;
}

.tag-warning {
  background-color: #fff4e5;
  color: #ff9500;
}

.tag-danger {
  background-color: #ffe5e5;
  color: #ff3b30;
}

/* 输入框样式 */
.input {
  border: 1rpx solid #dddddd;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background-color: white;
}

.input:focus {
  border-color: #07c160;
  outline: none;
}

/* 通用布局样式 */
.flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 文字样式 */
.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 间距 */
.mt-10 { margin-top: 10rpx; }
.mt-20 { margin-top: 20rpx; }
.mt-30 { margin-top: 30rpx; }
.mb-10 { margin-bottom: 10rpx; }
.mb-20 { margin-bottom: 20rpx; }
.mb-30 { margin-bottom: 30rpx; }
.ml-10 { margin-left: 10rpx; }
.ml-20 { margin-left: 20rpx; }
.mr-10 { margin-right: 10rpx; }
.mr-20 { margin-right: 20rpx; }

.p-20 { padding: 20rpx; }
.p-30 { padding: 30rpx; }
.p-40 { padding: 40rpx; }

/* 安全区域适配 */
.safe-area {
  padding-bottom: env(safe-area-inset-bottom);
}

/* 链接样式 */
.link {
  color: #1989fa;
  text-decoration: none;
}

.link:active {
  opacity: 0.8;
}
</style>