# 登录状态管理修复说明

## 问题描述

1. **启动时页面跳转问题**：小程序启动时应该进入登录页面，但有时会直接进入首页
2. **个人信息显示问题**：登录后个人信息突然消失，Vuex 状态未正确初始化
3. **未登录状态访问问题**：未登录用户可以访问需要登录的页面
4. **退出登录后跳转问题**：退出登录后没有立即跳转到登录页，且页面数据未清除

## 解决方案

### 1. 修改 App.vue - 正确初始化 Vuex 用户状态

**文件**：`d:\AAAcode\Finally\family-food-front\App.vue`

**修改内容**：
- 在 `onLaunch` 中先调用 `this.$store.dispatch('user/initUser')` 初始化 Vuex 状态
- 根据初始化结果决定跳转到登录页还是首页
- 修改 `onPageNotFound` 处理，重定向到登录页而不是首页

### 2. 创建页面守卫工具

**文件**：`d:\AAAcode\Finally\family-food-front\utils\pageGuard.js`

**功能**：
- `requireLogin()` 函数：检查用户是否登录，未登录则跳转到登录页
- `pageGuard()` 函数：页面级守卫，检查当前页面是否在白名单中
- 白名单：`['/pages/login/login', '/pages/login/register']`

### 3. 创建登录守卫 Mixin

**文件**：`d:\AAAcode\Finally\family-food-front\mixins\loginGuard.js`

**功能**：
- 提供统一的 `onLoad` 和 `onShow` 生命周期钩子
- 自动进行登录检查，未登录则跳转到登录页

### 4. 修改 profile.vue - 移除登录注册按钮

**文件**：`d:\AAAcode\Finally\family-food-front\pages\profile\profile.vue`

**修改内容**：
- 移除未登录状态下的"立即登录"和"注册账号"按钮
- 修改退出登录逻辑：
  - 立即跳转到登录页（不再延迟）
  - 清除页面数据（healthTags、familyMembers、currentFamily、overviewData）
  - 使用 `requireLogin()` 替代 `checkLoginStatus()`
- 移除 `checkLoginStatus()` 方法

### 5. 为主要页面添加登录检查

已添加登录检查的页面：
- `pages/home/home.vue`
- `pages/profile/profile.vue`
- `pages/shopping/shopping.vue`
- `pages/shopping/RecipeHistory.vue`
- `pages/shopping/recipe.vue`
- `pages/profile/family/family.vue`
- `pages/profile/reports/reports.vue`
- `pages/home/chart.vue`
- `pages/home/history.vue`
- `pages/home/ai/chat.vue`

**添加方式**：
```javascript
import { requireLogin } from '@/utils/pageGuard'

export default {
  onLoad() {
    if (!requireLogin()) {
      return
    }
    // 其他逻辑...
  },
  
  onShow() {
    if (!requireLogin()) {
      return
    }
    // 其他逻辑...
  }
}
```

## 工作流程

### 启动流程

1. 小程序启动 → `App.vue` 的 `onLaunch`
2. 调用 `store.dispatch('user/initUser')` 初始化用户状态
3. 从 localStorage 读取 token 和 userInfo
4. 如果有 token 和 userInfo：
   - 设置 Vuex 状态
   - 尝试获取家庭信息
   - 跳转到首页
5. 如果没有 token 或 userInfo：
   - 跳转到登录页

### 页面访问流程

1. 用户访问任何页面
2. 页面的 `onLoad` 或 `onShow` 被调用
3. 调用 `requireLogin()` 检查登录状态
4. 如果未登录：
   - 立即跳转到登录页
   - 阻止后续逻辑执行
5. 如果已登录：
   - 继续执行页面逻辑

### 退出登录流程

1. 用户点击"退出登录"
2. 调用 Vuex 的 `logout` action 清除用户数据
3. 清除 localStorage 中的 token、userInfo、currentFamily
4. 清除页面数据（healthTags、familyMembers 等）
5. 立即跳转到登录页

## 注意事项

1. **pages.json 配置**：login 页面已在 pages 数组的第一位，小程序默认会打开第一个页面
2. **白名单页面**：login 和 register 页面不需要登录检查
3. **Vuex 状态管理**：所有页面都应该从 Vuex 获取用户信息，而不是直接从 localStorage 读取
4. **API 拦截器**：utils/api.js 中的 401 错误处理会自动跳转到登录页

## 测试建议

1. 清除小程序缓存后重新启动，应该进入登录页
2. 登录后刷新页面，个人信息应该正常显示
3. 退出登录后，应该立即跳转到登录页
4. 未登录状态下，访问任何需要登录的页面都应该跳转到登录页
5. 已登录状态下，可以正常访问所有页面