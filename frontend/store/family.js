/**
 * 文件路径：/store/family.js
 * 文件说明：Vuex家庭模块，管理家庭信息、家庭成员等
 */
import api from '@/utils/api'
import storage from '@/utils/storage'

const family = {
  state: {
    currentFamily: uni.getStorageSync('currentFamily') || null,
    familyMembers: [],
    families: [],
    familyCode: null
  },
  
  mutations: {
    SET_CURRENT_FAMILY(state, family) {
      state.currentFamily = family
      uni.setStorageSync('currentFamily', family)
    },
    
    SET_FAMILY_MEMBERS(state, members) {
      state.familyMembers = members
    },
    
    SET_FAMILIES(state, families) {
      state.families = families
    },
    
    SET_FAMILY_CODE(state, code) {
      state.familyCode = code
    },
    
    CLEAR_FAMILY(state) {
      state.currentFamily = null
      state.familyMembers = []
      state.families = []
      state.familyCode = null
      uni.removeStorageSync('currentFamily')
    },
    
    ADD_FAMILY_MEMBER(state, member) {
      state.familyMembers.push(member)
    },
    
    REMOVE_FAMILY_MEMBER(state, memberId) {
      state.familyMembers = state.familyMembers.filter(m => m.id !== memberId)
    }
  },
  
  actions: {
    // 创建家庭
    async createFamily({ commit }, familyData) {
      try {
        const response = await api.family.create(familyData)
        if (response.code === 200) {
          commit('SET_CURRENT_FAMILY', response.data)
          return response.data
        }
      } catch (error) {
        console.error('创建家庭失败:', error)
        throw error
      }
    },
    
    // 加入家庭
    async joinFamily({ commit, dispatch }, joinData) {
      try {
        const response = await api.family.join(joinData)
        if (response.code === 200) {
          // 获取家庭信息
          await dispatch('fetchFamilyInfo', joinData.familyCode)
          return response.data
        }
      } catch (error) {
        console.error('加入家庭失败:', error)
        throw error
      }
    },
    
    // 获取家庭成员
    async fetchFamilyMembers({ commit, state }) {
      if (!state.currentFamily?.id) return
      
      try {
        const response = await api.family.getMembers(state.currentFamily.id)
        if (response.code === 200) {
          commit('SET_FAMILY_MEMBERS', response.data)
        }
      } catch (error) {
        console.error('获取家庭成员失败:', error)
        throw error
      }
    },
    
    // 获取家庭信息
    async fetchFamilyInfo({ commit }, familyCode) {
      try {
        // 这里需要根据实际情况实现
        // 暂时模拟
        const familyInfo = {
          id: 1,
          familyCode,
          name: '我的家庭'
        }
        commit('SET_CURRENT_FAMILY', familyInfo)
      } catch (error) {
        console.error('获取家庭信息失败:', error)
        throw error
      }
    },
    
    // 移除家庭成员
    async removeFamilyMember({ commit }, memberId) {
      try {
        // 调用后端接口移除成员
        // await api.family.removeMember(memberId)
        commit('REMOVE_FAMILY_MEMBER', memberId)
      } catch (error) {
        console.error('移除家庭成员失败:', error)
        throw error
      }
    },
    
    // 退出家庭
    async leaveFamily({ commit, state }) {
      if (!state.currentFamily?.id) return
      
      try {
        // 调用后端接口退出家庭
        // await api.family.leave(state.currentFamily.id)
        commit('CLEAR_FAMILY')
      } catch (error) {
        console.error('退出家庭失败:', error)
        throw error
      }
    }
  },
  
  getters: {
    currentFamily: state => state.currentFamily,
    familyMembers: state => state.familyMembers,
    families: state => state.families,
    familyCode: state => state.familyCode,
    isFamilyOwner: (state, getters, rootState) => {
      return state.currentFamily?.adminUserId === rootState.user.userInfo?.id
    }
  }
}

export default family