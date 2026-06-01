/**
 * 文件路径：/utils/storage.js
 * 文件说明：本地存储工具，封装微信小程序本地缓存操作
 */

const storage = {
  /**
   * 设置缓存数据
   * @param {string} key 缓存key
   * @param {any} value 缓存值
   * @param {number} expire 过期时间（秒）
   */
  set(key, value, expire = null) {
    try {
      const data = {
        value,
        expire: expire ? Date.now() + expire * 1000 : null
      }
      uni.setStorageSync(key, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('设置缓存失败:', error)
      return false
    }
  },
  
  /**
   * 获取缓存数据
   * @param {string} key 缓存key
   * @returns {any} 缓存值
   */
      get(key) {
        try {
          const dataStr = uni.getStorageSync(key)
          if (!dataStr) return null
          
          // 尝试解析 JSON
          let data
          try {
            data = JSON.parse(dataStr)
          } catch (e) {
            // 如果不是 JSON 格式（旧数据），直接返回原值
            return dataStr
          }
          
          // 检查是否是带过期时间的格式
          if (data && typeof data === 'object' && 'value' in data) {
            // 检查是否过期
            if (data.expire && Date.now() > data.expire) {
              this.remove(key)
              return null
            }
            return data.value
          }
          
          // 如果是普通对象但不是 {value, expire} 格式，直接返回
          return data
        } catch (error) {
          console.error('获取缓存失败:', error)
          return null
        }
      },
  
  /**
   * 移除缓存数据
   * @param {string} key 缓存key
   */
  remove(key) {
    try {
      uni.removeStorageSync(key)
      return true
    } catch (error) {
      console.error('移除缓存失败:', error)
      return false
    }
  },
  
  /**
   * 清空所有缓存
   */
  clear() {
    try {
      uni.clearStorageSync()
      return true
    } catch (error) {
      console.error('清空缓存失败:', error)
      return false
    }
  },
  
  /**
   * 获取所有缓存key
   * @returns {string[]} 所有缓存key
   */
  keys() {
    try {
      const info = uni.getStorageInfoSync()
      return info.keys
    } catch (error) {
      console.error('获取缓存key失败:', error)
      return []
    }
  },
  
  /**
   * 检查缓存是否存在
   * @param {string} key 缓存key
   * @returns {boolean} 是否存在
   */
  has(key) {
    return this.get(key) !== null
  },
  
  /**
   * 获取缓存信息
   * @returns {object} 缓存信息
   */
  getInfo() {
    try {
      return uni.getStorageInfoSync()
    } catch (error) {
      console.error('获取缓存信息失败:', error)
      return null
    }
  }
}

export default storage