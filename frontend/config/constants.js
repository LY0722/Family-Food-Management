/**
 * 文件路径：/config/constants.js
 * 文件说明：常量配置文件，定义项目中使用的常量、枚举值
 */
// 常量配置
export const INVENTORY_STATUS = {
  NORMAL: 1,      // 正常
  EXPIRING: 2,    // 即将过期
  EXPIRED: 3      // 已过期
}

export const INGREDIENT_CATEGORIES = [
  '蔬菜',
  '水果',
  '肉类',
  '海鲜',
  '豆制品',
  '粮油',
  '调料',
  '饮料',
  '其他'
]

export const MEAL_TYPES = [
  '早餐',
  '午餐',
  '晚餐',
  '零食'
]

export const HEALTH_TAGS = [
  '低脂',
  '低盐',
  '低糖',
  '高蛋白',
  '高纤维',
  '无麸质',
  '素食',
  '有机'
]

export const RECIPE_DIFFICULTY = [
  { label: '简单', value: 1 },
  { label: '中等', value: 2 },
  { label: '困难', value: 3 }
]