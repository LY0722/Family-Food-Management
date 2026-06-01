"use strict";
const common_vendor = require("../common/vendor.js");
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
        expire: expire ? Date.now() + expire * 1e3 : null
      };
      common_vendor.index.setStorageSync(key, JSON.stringify(data));
      return true;
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/storage.js:22", "设置缓存失败:", error);
      return false;
    }
  },
  /**
   * 获取缓存数据
   * @param {string} key 缓存key
   * @returns {any} 缓存值
   */
  get(key) {
    try {
      const dataStr = common_vendor.index.getStorageSync(key);
      if (!dataStr)
        return null;
      let data;
      try {
        data = JSON.parse(dataStr);
      } catch (e) {
        return dataStr;
      }
      if (data && typeof data === "object" && "value" in data) {
        if (data.expire && Date.now() > data.expire) {
          this.remove(key);
          return null;
        }
        return data.value;
      }
      return data;
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/storage.js:59", "获取缓存失败:", error);
      return null;
    }
  },
  /**
   * 移除缓存数据
   * @param {string} key 缓存key
   */
  remove(key) {
    try {
      common_vendor.index.removeStorageSync(key);
      return true;
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/storage.js:73", "移除缓存失败:", error);
      return false;
    }
  },
  /**
   * 清空所有缓存
   */
  clear() {
    try {
      common_vendor.index.clearStorageSync();
      return true;
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/storage.js:86", "清空缓存失败:", error);
      return false;
    }
  },
  /**
   * 获取所有缓存key
   * @returns {string[]} 所有缓存key
   */
  keys() {
    try {
      const info = common_vendor.index.getStorageInfoSync();
      return info.keys;
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/storage.js:100", "获取缓存key失败:", error);
      return [];
    }
  },
  /**
   * 检查缓存是否存在
   * @param {string} key 缓存key
   * @returns {boolean} 是否存在
   */
  has(key) {
    return this.get(key) !== null;
  },
  /**
   * 获取缓存信息
   * @returns {object} 缓存信息
   */
  getInfo() {
    try {
      return common_vendor.index.getStorageInfoSync();
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/storage.js:122", "获取缓存信息失败:", error);
      return null;
    }
  }
};
exports.storage = storage;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/storage.js.map
