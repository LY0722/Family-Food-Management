import { createApp as createVueApp } from 'vue'
import App from './App.vue'
import store from './store'
import api from './utils/api'
import storage from './utils/storage'
import dateUtils from './utils/dateUtils'

// uni-ui 组件导入
import UniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue'
import UniPopupMessage from '@dcloudio/uni-ui/lib/uni-popup-message/uni-popup-message.vue'
import UniPopupDialog from '@dcloudio/uni-ui/lib/uni-popup-dialog/uni-popup-dialog.vue'

// 全局方法配置
const appMethods = {
  showToast(message, type = 'success') {
    const iconMap = {
      success: 'success',
      error: 'error',
      warning: 'none',
      info: 'none'
    }
    
    uni.showToast({
      title: message,
      icon: iconMap[type] || 'none',
      duration: 2000,
      mask: true
    })
  },
  
  showLoading(text = '加载中...') {
    uni.showLoading({
      title: text,
      mask: true
    })
  },
  
  hideLoading() {
    uni.hideLoading()
  },
  
  showConfirm(options) {
    return new Promise((resolve, reject) => {
      uni.showModal({
        title: options.title || '提示',
        content: options.content || '',
        showCancel: !options.hideCancel,
        cancelText: options.cancelText || '取消',
        confirmText: options.confirmText || '确定',
        confirmColor: options.confirmColor || '#07c160',
        success: (res) => {
          if (res.confirm) {
            resolve()
          } else if (res.cancel) {
            reject(new Error('用户取消'))
          }
        },
        fail: (err) => {
          reject(new Error('弹窗失败: ' + err.errMsg))
        }
      })
    })
  }
}

// 创建并挂载应用
export function createApp() {
  const app = createVueApp(App)
  
  // 配置全局属性
  app.config.globalProperties.$api = api
  app.config.globalProperties.$storage = storage
  app.config.globalProperties.$date = dateUtils
  app.config.globalProperties.$app = appMethods
  
  // 注册全局组件
  app.component('uni-popup', UniPopup)
  app.component('uni-popup-message', UniPopupMessage)
  app.component('uni-popup-dialog', UniPopupDialog)
  
  // 使用 store
  app.use(store)
  
  return app
}

// 实际创建应用（用于启动）
const app = createApp()
app.mount('#app')