import store from '@/store'

/**
 * 页面守卫 - 确保未登录用户无法访问需要登录的页面
 */

const whiteList = [
  '/pages/login/login',
  '/pages/login/register'
]

export function pageGuard() {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  
  if (!currentPage) return
  
  const route = '/' + currentPage.route
  
  console.log('页面守卫检查:', route)
  
  const isLoggedIn = store.state.user.isLoggedIn
  
  if (!isLoggedIn && !whiteList.includes(route)) {
    console.log('未登录，跳转到登录页')
    
    uni.reLaunch({
      url: '/pages/login/login'
    })
    
    return false
  }
  
  return true
}

export function requireLogin() {
  const isLoggedIn = store.state.user.isLoggedIn
  
  if (!isLoggedIn) {
    console.log('需要登录，跳转到登录页')
    uni.reLaunch({
      url: '/pages/login/login'
    })
    return false
  }
  
  return true
}