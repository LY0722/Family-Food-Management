/**
 * 文件路径：/store/index.js
 * 文件说明：Vuex根仓库，整合所有模块，创建store实例
 */
import { createStore } from 'vuex'
import user from './user'
import family from './family'
import inventory from './inventory'


const store = createStore({
  modules: {
    user,
    family,
    inventory
  },
  
  // 全局状态
  state: {
    isLoading: false,
    error: null,
    // 全局配置
    config: {
      baseURL: 'http://localhost:8080/api',
      tokenKey: 'family_food_token',
      userKey: 'family_food_user'
    }
  },
  
  mutations: {
    SET_LOADING(state, isLoading) {
      state.isLoading = isLoading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    CLEAR_ERROR(state) {
      state.error = null
    }
  },
  
  actions: {
    setLoading({ commit }, isLoading) {
      commit('SET_LOADING', isLoading)
    },
    setError({ commit }, error) {
      commit('SET_ERROR', error)
    },
    clearError({ commit }) {
      commit('CLEAR_ERROR')
    }
  },
  
  getters: {
    isLoading: state => state.isLoading,
    error: state => state.error,
    config: state => state.config
  }
})

export default store