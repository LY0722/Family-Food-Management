// /utils/auth.js
import storage from './storage'

// 需要登录才能访问的页面
const authPages = [
  'pages/home/home',
  'pages/inventory/inventory',
  'pages/shopping/shopping',
  'pages/recipe/list',
  'pages/profile/profile',
  'pages/family/members'
]

// 检查登录状态
export function isLoggedIn() {
  const token = storage.get('token')
  const userInfo = storage.get('userInfo')
  return !!(token && userInfo)
}

// 获取当前用户
export function getCurrentUser() {
  return storage.get('userInfo') || null
}

// 获取当前家庭
export function getCurrentFamily() {
  return storage.get('currentFamily') || null
}

// 保存登录信息
export function saveLoginInfo(token, userInfo, family) {
  storage.set('token', token)
  storage.set('userInfo', userInfo)
  if (family) {
    storage.set('currentFamily', family)
  }
}

// 退出登录
export function logout() {
  storage.remove('token')
  storage.remove('userInfo')
  storage.remove('currentFamily')
}

// 路由拦截（在App.vue中调用）
export function checkAuth(toPage) {
  const needAuth = authPages.some(page => toPage.includes(page))
  
  if (needAuth && !isLoggedIn()) {
    uni.navigateTo({
      url: '/pages/login/login'
    })
    return false
  }
  return true
}