/**
 * 文件路径：/store/user.js
 * 文件说明：用户状态管理模块
 */
import apiConfig from '@/config/api'

export default {
  namespaced: true,
  
  state: {
    token: '',
    userInfo: null,
    currentFamily: null,
    isLoggedIn: false
  },
  
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      uni.setStorageSync('token', token)
    },
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo
      state.isLoggedIn = !!(userInfo && userInfo.id)
      uni.setStorageSync('userInfo', userInfo)
    },
    SET_CURRENT_FAMILY(state, family) {
      // 验证和清理家庭数据
      if (family && family.id) {
        // 确保 id 是数字
        if (typeof family.id === 'string') {
          // 尝试从字符串中提取数字
          const numId = parseInt(family.id.replace(/[^0-9-]/g, ''), 10)
          if (!isNaN(numId) && numId > 0) {
            family.id = numId
          } else {
            console.error('无效的家庭ID:', family.id)
            family = null
          }
        } else if (typeof family.id !== 'number' || family.id <= 0) {
          console.error('无效的家庭ID类型或值:', family.id)
          family = null
        }
      } else {
        console.error('家庭数据缺少id字段:', family)
        family = null
      }
      
      state.currentFamily = family
      uni.setStorageSync('currentFamily', family)
    },
    CLEAR_USER(state) {
      state.token = ''
      state.userInfo = null
      state.currentFamily = null
      state.isLoggedIn = false
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
      uni.removeStorageSync('currentFamily')
    }
  },
  
  actions: {
    // 初始化用户
    async initUser({ commit, dispatch }) {
      const token = uni.getStorageSync('token')
      const userInfo = uni.getStorageSync('userInfo')
      const currentFamily = uni.getStorageSync('currentFamily')
      
      console.log('初始化用户数据:', { hasToken: !!token, hasUserInfo: !!userInfo, currentFamily })
      
      if (token && userInfo) {
        // 处理头像 URL
        if (userInfo.avatarUrl && !userInfo.avatarUrl.startsWith('http')) {
          userInfo.avatarUrl = `${apiConfig.baseURL}${userInfo.avatarUrl}`
        }
        
        // 开发环境：如果头像 URL 是 HTTP 协议，使用默认头像（微信小程序不支持 HTTP）
        if (process.env.NODE_ENV === 'development' && userInfo.avatarUrl?.startsWith('http:')) {
          userInfo.avatarUrl = '/static/images/default-avatar.png'
        }
        
        commit('SET_TOKEN', token)
        commit('SET_USER_INFO', userInfo)
        
        if (currentFamily) {
          commit('SET_CURRENT_FAMILY', currentFamily)
        } else if (userInfo.familyId) {
          // 如果用户有 familyId 但没有 currentFamily，尝试获取家庭信息
          console.log('用户有 familyId 但没有 currentFamily，尝试获取家庭信息:', userInfo.familyId)
          try {
            const response = await uni.$api.family.getInfo(userInfo.familyId)
            if (response.code === 200 && response.data) {
              console.log('成功获取家庭信息:', response.data)
              commit('SET_CURRENT_FAMILY', response.data)
            } else {
              console.warn('获取家庭信息失败:', response)
            }
          } catch (error) {
            console.error('获取家庭信息异常:', error)
          }
        }
        
        return true
      }
      return false
    },
    
    // 登录
    login({ commit }, { token, userInfo, familyInfo }) {
      commit('SET_TOKEN', token)
      commit('SET_USER_INFO', userInfo)
      if (familyInfo) {
        commit('SET_CURRENT_FAMILY', familyInfo)
      }
    },
    
    // 退出登录
    logout({ commit }) {
      commit('CLEAR_USER')
    },
    
    async fetchUserFamily({ commit, state }) {
      if (!state.userInfo?.familyId) return
      
      try {
        const response = await uni.$api.family.getInfo(state.userInfo.familyId)
        if (response.code === 200) {
          commit('SET_CURRENT_FAMILY', response.data)
          return response.data
        }
      } catch (error) {
        console.error('获取家庭信息失败:', error)
        return null
      }
    }
  },
  
  getters: {
    token: state => state.token,
    userInfo: state => state.userInfo,
    currentFamily: state => state.currentFamily,
    isLoggedIn: state => state.isLoggedIn,
    hasFamily: state => !!(state.currentFamily && state.currentFamily.id),
    userName: state => state.userInfo?.nickname || '用户',
    userId: state => state.userInfo?.id || null,
    familyId: state => state.currentFamily?.id || null
  }
}