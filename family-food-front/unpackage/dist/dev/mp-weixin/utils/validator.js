"use strict";
const validator = {
  /**
   * 校验规则定义
   */
  rules: {
    required: {
      test: (value) => {
        if (value === void 0 || value === null)
          return false;
        if (typeof value === "string")
          return value.trim().length > 0;
        if (Array.isArray(value))
          return value.length > 0;
        return true;
      },
      message: "此项为必填项"
    },
    email: {
      test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: "请输入有效的邮箱地址"
    },
    phone: {
      test: (value) => /^1[3-9]\d{9}$/.test(value),
      message: "请输入有效的手机号码"
    },
    minLength: {
      test: (value, length) => {
        if (typeof value === "string")
          return value.length >= length;
        if (Array.isArray(value))
          return value.length >= length;
        return false;
      },
      message: (length) => `长度不能少于${length}个字符`
    },
    maxLength: {
      test: (value, length) => {
        if (typeof value === "string")
          return value.length <= length;
        if (Array.isArray(value))
          return value.length <= length;
        return true;
      },
      message: (length) => `长度不能超过${length}个字符`
    },
    number: {
      test: (value) => !isNaN(parseFloat(value)) && isFinite(value),
      message: "请输入有效的数字"
    },
    integer: {
      test: (value) => Number.isInteger(Number(value)),
      message: "请输入整数"
    },
    min: {
      test: (value, min) => Number(value) >= min,
      message: (min) => `值不能小于${min}`
    },
    max: {
      test: (value, max) => Number(value) <= max,
      message: (max) => `值不能大于${max}`
    },
    url: {
      test: (value) => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      message: "请输入有效的URL地址"
    },
    date: {
      test: (value) => !isNaN(new Date(value).getTime()),
      message: "请输入有效的日期"
    },
    positive: {
      test: (value) => Number(value) > 0,
      message: "请输入正数"
    },
    // 新增：验证码校验
    verifyCode: {
      test: (value) => /^\d{6}$/.test(value),
      message: "请输入6位数字验证码"
    },
    // 新增：密码强度校验
    password: {
      test: (value) => {
        if (!value)
          return false;
        return value.length >= 6 && value.length <= 20;
      },
      message: "密码长度需为6-20位"
    },
    // 新增：确认密码校验
    confirmPassword: {
      test: (value, originalPassword) => value === originalPassword,
      message: "两次输入的密码不一致"
    },
    // 新增：协议勾选校验
    agreement: {
      test: (value) => value === true,
      message: "请阅读并同意用户协议"
    }
  },
  /**
   * 校验单个字段
   * @param {any} value 字段值
   * @param {Array} validators 校验规则数组
   * @returns {string|null} 错误信息或null
   */
  validateField(value, validators) {
    for (const validatorItem of validators) {
      if (typeof validatorItem === "string") {
        const rule = this.rules[validatorItem];
        if (rule && !rule.test(value)) {
          return rule.message;
        }
      } else if (typeof validatorItem === "object") {
        const rule = this.rules[validatorItem.rule];
        if (rule && !rule.test(value, validatorItem.param)) {
          return typeof rule.message === "function" ? rule.message(validatorItem.param) : rule.message;
        }
      } else if (typeof validatorItem === "function") {
        const result = validatorItem(value);
        if (result !== true) {
          return result || "校验失败";
        }
      }
    }
    return null;
  },
  /**
   * 校验表单数据
   * @param {object} data 表单数据
   * @param {object} rules 校验规则
   * @returns {object} 校验结果 { isValid: boolean, errors: object }
   */
  validateForm(data, rules) {
    const errors = {};
    let isValid = true;
    for (const [field, fieldRules] of Object.entries(rules)) {
      const error = this.validateField(data[field], fieldRules);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    }
    return { isValid, errors };
  },
  /**
   * 登录表单校验规则
   * @param {object} data 登录数据 { phone, password }
   * @returns {object} 校验结果
   */
  validateLogin(data) {
    const rules = {
      phone: ["required", "phone"],
      password: ["required", "password"]
    };
    return this.validateForm(data, rules);
  },
  /**
   * 注册表单校验规则
   * @param {object} data 注册数据 { phone, verifyCode, password, confirmPassword, agreed }
   * @returns {object} 校验结果
   */
  validateRegister(data) {
    const rules = {
      phone: ["required", "phone"],
      verifyCode: ["required", "verifyCode"],
      password: ["required", "password"],
      confirmPassword: ["required", { rule: "confirmPassword", param: data.password }],
      agreed: ["required", "agreement"]
    };
    return this.validateForm(data, rules);
  },
  /**
   * 发送验证码表单校验
   * @param {object} data 数据 { phone }
   * @returns {object} 校验结果
   */
  validateSendCode(data) {
    const rules = {
      phone: ["required", "phone"]
    };
    return this.validateForm(data, rules);
  },
  /**
   * 食材表单校验规则
   */
  ingredientRules: {
    name: ["required", { rule: "minLength", param: 1 }, { rule: "maxLength", param: 100 }],
    quantity: ["required", "number", "positive"],
    unit: ["required", { rule: "maxLength", param: 20 }],
    category: ["required"],
    expiryDate: ["date", (value) => {
      if (!value)
        return true;
      const expiry = new Date(value);
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      return expiry >= today || "过期日期不能早于今天";
    }],
    purchaseDate: ["date"]
  },
  /**
   * 菜谱表单校验规则
   */
  recipeRules: {
    name: ["required", { rule: "minLength", param: 1 }, { rule: "maxLength", param: 200 }],
    cookingTime: ["required", "integer", "positive"],
    difficulty: ["required", (value) => [1, 2, 3].includes(Number(value)) || "难度必须是1-3之间的数字"],
    description: [{ rule: "maxLength", param: 1e3 }]
  },
  /**
   * 用户表单校验规则
   */
  userRules: {
    nickname: ["required", { rule: "minLength", param: 2 }, { rule: "maxLength", param: 20 }],
    healthTags: [(value) => {
      if (!Array.isArray(value))
        return "健康标签必须是数组";
      if (value.length > 10)
        return "健康标签最多选择10个";
      return true;
    }]
  },
  /**
   * 校验库存添加数据
   * @param {object} data 库存数据
   * @returns {object} 校验结果
   */
  validateInventory(data) {
    return this.validateForm(data, this.ingredientRules);
  },
  /**
   * 校验采购清单数据
   * @param {object} data 采购数据
   * @returns {object} 校验结果
   */
  validateShoppingItem(data) {
    const rules = {
      ingredientId: ["required", "integer"],
      quantity: ["required", "number", "positive"],
      priority: ["required", (value) => [1, 2, 3].includes(Number(value)) || "优先级必须是1-3之间的数字"]
    };
    return this.validateForm(data, rules);
  },
  /**
   * 校验消耗记录数据
   * @param {object} data 消耗数据
   * @returns {object} 校验结果
   */
  validateConsumption(data) {
    const rules = {
      ingredientId: ["required", "integer"],
      quantity: ["required", "number", "positive"],
      mealType: ["required", (value) => ["早餐", "午餐", "晚餐", "零食"].includes(value) || "无效的餐次类型"]
    };
    return this.validateForm(data, rules);
  },
  /**
   * 快速校验
   * @param {string} type 校验类型
   * @param {any} value 校验值
   * @param {any} param 参数
   * @returns {boolean} 是否通过
   */
  quickValidate(type, value, param) {
    const rule = this.rules[type];
    if (!rule)
      return true;
    return rule.test(value, param);
  }
};
exports.validator = validator;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/validator.js.map
