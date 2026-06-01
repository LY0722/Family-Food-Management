/**
 * 文件路径：/utils/wxApi.js
 * 文件说明：微信API封装工具，封装小程序API为Promise格式
 */

/**
 * 将微信API转为Promise
 * @param {Function} fn 微信API函数
 * @returns {Function} 返回Promise的函数
 */
function promisify(fn) {
  return function (options = {}) {
    return new Promise((resolve, reject) => {
      fn({
        ...options,
        success: (res) => resolve(res),
        fail: (err) => reject(err)
      })
    })
  }
}

// 常用API的Promise版本
const wxApi = {
  // 登录相关
  login: promisify(uni.login),
  getUserProfile: promisify(uni.getUserProfile),
  checkSession: promisify(uni.checkSession),
  
  // 用户信息
  getUserInfo: promisify(uni.getUserInfo),
  
  // 扫码
  scanCode: promisify(uni.scanCode),
  
  // 文件操作
  chooseImage: promisify(uni.chooseImage),
  chooseVideo: promisify(uni.chooseVideo),
  chooseFile: promisify(uni.chooseFile),
  uploadFile: promisify(uni.uploadFile),
  downloadFile: promisify(uni.downloadFile),
  
  // 数据缓存
  setStorage: promisify(uni.setStorage),
  getStorage: promisify(uni.getStorage),
  removeStorage: promisify(uni.removeStorage),
  clearStorage: promisify(uni.clearStorage),
  getStorageInfo: promisify(uni.getStorageInfo),
  
  // 系统信息
  getSystemInfo: promisify(uni.getSystemInfo),
  getNetworkType: promisify(uni.getNetworkType),
  onNetworkStatusChange: (callback) => {
    uni.onNetworkStatusChange(callback)
  },
  
  // 位置信息
  getLocation: promisify(uni.getLocation),
  chooseLocation: promisify(uni.chooseLocation),
  
  // 设备信息
  vibrateShort: promisify(uni.vibrateShort),
  vibrateLong: promisify(uni.vibrateLong),
  
  // 分享
  shareWithSystem: promisify(uni.shareWithSystem),
  
  // 跳转
  navigateTo: (url) => {
    return new Promise((resolve, reject) => {
      uni.navigateTo({
        url,
        success: resolve,
        fail: reject
      })
    })
  },
  
  redirectTo: (url) => {
    return new Promise((resolve, reject) => {
      uni.redirectTo({
        url,
        success: resolve,
        fail: reject
      })
    })
  },
  
  switchTab: (url) => {
    return new Promise((resolve, reject) => {
      uni.switchTab({
        url,
        success: resolve,
        fail: reject
      })
    })
  },
  
  navigateBack: (delta = 1) => {
    return new Promise((resolve, reject) => {
      uni.navigateBack({
        delta,
        success: resolve,
        fail: (err) => {
          // 如果已经是首页，navigateBack会失败，这种情况不算错误
          if (err.errMsg?.includes('already at the first page')) {
            resolve()
          } else {
            reject(err)
          }
        }
      })
    })
  },
  
  reLaunch: (url) => {
    return new Promise((resolve, reject) => {
      uni.reLaunch({
        url,
        success: resolve,
        fail: reject
      })
    })
  },
  
  // 导航
  setNavigationBarTitle: (title) => {
    return new Promise((resolve, reject) => {
      uni.setNavigationBarTitle({
        title,
        success: resolve,
        fail: reject
      })
    })
  },
  
  setNavigationBarColor: (options) => {
    return new Promise((resolve, reject) => {
      uni.setNavigationBarColor({
        ...options,
        success: resolve,
        fail: reject
      })
    })
  },
  
  // 下拉刷新
  startPullDownRefresh: promisify(uni.startPullDownRefresh),
  stopPullDownRefresh: promisify(uni.stopPullDownRefresh),
  
  // 页面滚动
  pageScrollTo: promisify(uni.pageScrollTo),
  
  // 模态框
  showModal: (options) => {
    return new Promise((resolve) => {
      uni.showModal({
        ...options,
        success: (res) => {
          resolve(res.confirm)
        }
      })
    })
  },
  
  showToast: (options) => {
    return new Promise((resolve) => {
      if (typeof options === 'string') {
        options = { title: options }
      }
      uni.showToast({
        icon: 'none',
        duration: 2000,
        ...options,
        success: resolve
      })
    })
  },
  
  showLoading: (options) => {
    return new Promise((resolve) => {
      if (typeof options === 'string') {
        options = { title: options }
      }
      uni.showLoading({
        mask: true,
        ...options,
        success: resolve
      })
    })
  },
  
  hideToast: promisify(uni.hideToast),
  hideLoading: promisify(uni.hideLoading),
  
  showActionSheet: (options) => {
    return new Promise((resolve, reject) => {
      uni.showActionSheet({
        ...options,
        success: (res) => {
          resolve(res.tapIndex)
        },
        fail: reject
      })
    })
  },
  
  // 复制
  setClipboardData: (data) => {
    return new Promise((resolve, reject) => {
      uni.setClipboardData({
        data,
        success: resolve,
        fail: reject
      })
    })
  },
  
  getClipboardData: promisify(uni.getClipboardData),
  
  // 电话
  makePhoneCall: (phoneNumber) => {
    return new Promise((resolve, reject) => {
      uni.makePhoneCall({
        phoneNumber,
        success: resolve,
        fail: reject
      })
    })
  },
  
  // 权限
  authorize: promisify(uni.authorize),
  openSetting: promisify(uni.openSetting),
  getSetting: promisify(uni.getSetting),
  
  // 交互反馈
  showNavigationBarLoading: promisify(uni.showNavigationBarLoading),
  hideNavigationBarLoading: promisify(uni.hideNavigationBarLoading),
  
  // 键盘
  hideKeyboard: promisify(uni.hideKeyboard),
  
  // Canvas
  canvasToTempFilePath: promisify(uni.canvasToTempFilePath),
  canvasGetImageData: promisify(uni.canvasGetImageData),
  canvasPutImageData: promisify(uni.canvasPutImageData),
  
  /**
   * 创建扫码器
   * @param {object} options 配置选项
   * @returns {object} 扫码器实例
   */
  createScanner(options = {}) {
    const defaultOptions = {
      onlyFromCamera: false,
      scanType: ['qrCode', 'barCode'],
      success: null,
      fail: null
    }
    
    return {
      options: { ...defaultOptions, ...options },
      
      async scan() {
        try {
          const res = await this.scanCode(this.options)
          if (this.options.success) {
            this.options.success(res)
          }
          return res
        } catch (error) {
          if (this.options.fail) {
            this.options.fail(error)
          }
          throw error
        }
      },
      
      // 支持连续扫码
      async scanContinuously(callback) {
        while (true) {
          try {
            const res = await this.scan()
            if (callback) {
              const shouldContinue = callback(res)
              if (shouldContinue === false) break
            }
          } catch (error) {
            console.error('扫码失败:', error)
            break
          }
        }
      }
    }
  },
  
  /**
   * 批量操作
   * @param {Array} promises Promise数组
   * @returns {Promise} 批量操作结果
   */
  batch(promises) {
    return Promise.all(promises)
  },
  
  /**
   * 顺序执行
   * @param {Array} promises 返回Promise的函数数组
   * @returns {Promise} 顺序执行结果
   */
  sequence(tasks) {
    return tasks.reduce((promiseChain, currentTask) => {
      return promiseChain.then(chainResults =>
        currentTask().then(currentResult =>
          [...chainResults, currentResult]
        )
      )
    }, Promise.resolve([]))
  },
  
  /**
   * 防抖函数
   * @param {Function} fn 函数
   * @param {number} delay 延迟时间
   * @returns {Function} 防抖函数
   */
  debounce(fn, delay = 300) {
    let timer = null
    return function (...args) {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        fn.apply(this, args)
      }, delay)
    }
  },
  
  /**
   * 节流函数
   * @param {Function} fn 函数
   * @param {number} interval 间隔时间
   * @returns {Function} 节流函数
   */
  throttle(fn, interval = 300) {
    let lastTime = 0
    return function (...args) {
      const now = Date.now()
      if (now - lastTime >= interval) {
        fn.apply(this, args)
        lastTime = now
      }
    }
  },
  
  /**
   * 检查网络状态
   * @returns {Promise<object>} 网络状态
   */
  async checkNetwork() {
    try {
      const res = await this.getNetworkType()
      return {
        isConnected: true,
        networkType: res.networkType
      }
    } catch (error) {
      return {
        isConnected: false,
        networkType: 'none'
      }
    }
  },
  
  /**
   * 安全的API调用
   * @param {Function} apiFunc API函数
   * @param {Array} args 参数
   * @returns {Promise} 调用结果
   */
  safeCall(apiFunc, ...args) {
    return new Promise((resolve, reject) => {
      try {
        const result = apiFunc(...args)
        if (result && typeof result.then === 'function') {
          result.then(resolve).catch(reject)
        } else {
          resolve(result)
        }
      } catch (error) {
        reject(error)
      }
    })
  }
}

// 导出所有方法
export default wxApi

// 同时导出单个方法
export {
  promisify
}