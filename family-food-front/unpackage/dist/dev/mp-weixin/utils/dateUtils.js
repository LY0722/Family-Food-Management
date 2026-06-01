"use strict";
const dateUtils = {
  /**
   * 格式化日期
   * @param {Date|string} date 日期对象或字符串
   * @param {string} format 格式字符串
   * @returns {string} 格式化后的日期字符串
   */
  format(date, format = "YYYY-MM-DD") {
    if (!date)
      return "";
    const d = new Date(date);
    if (isNaN(d.getTime()))
      return "";
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hour = d.getHours();
    const minute = d.getMinutes();
    const second = d.getSeconds();
    const pad = (n) => n.toString().padStart(2, "0");
    return format.replace("YYYY", year).replace("MM", pad(month)).replace("DD", pad(day)).replace("HH", pad(hour)).replace("mm", pad(minute)).replace("ss", pad(second));
  },
  /**
   * 格式化相对时间
   * @param {Date|string} date 日期
   * @returns {string} 相对时间字符串
   */
  formatRelative(date) {
    if (!date)
      return "";
    const d = new Date(date);
    if (isNaN(d.getTime()))
      return "";
    const now = /* @__PURE__ */ new Date();
    const diffMs = now - d;
    const diffSec = Math.floor(diffMs / 1e3);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    if (diffSec < 60) {
      return "刚刚";
    } else if (diffMin < 60) {
      return `${diffMin}分钟前`;
    } else if (diffHour < 24) {
      return `${diffHour}小时前`;
    } else if (diffDay < 7) {
      return `${diffDay}天前`;
    } else {
      return this.format(d, "YYYY-MM-DD");
    }
  },
  /**
   * 计算日期差（天数）
   * @param {Date|string} date1 日期1
   * @param {Date|string} date2 日期2
   * @returns {number} 天数差
   */
  diffDays(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime()))
      return 0;
    const diffMs = Math.abs(d2 - d1);
    return Math.floor(diffMs / (1e3 * 60 * 60 * 24));
  },
  /**
   * 获取今天日期
   * @returns {string} YYYY-MM-DD格式的今天日期
   */
  getToday() {
    return this.format(/* @__PURE__ */ new Date(), "YYYY-MM-DD");
  },
  /**
   * 获取明天日期
   * @returns {string} YYYY-MM-DD格式的明天日期
   */
  getTomorrow() {
    const tomorrow = /* @__PURE__ */ new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.format(tomorrow, "YYYY-MM-DD");
  },
  /**
   * 获取昨天日期
   * @returns {string} YYYY-MM-DD格式的昨天日期
   */
  getYesterday() {
    const yesterday = /* @__PURE__ */ new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.format(yesterday, "YYYY-MM-DD");
  },
  /**
   * 日期加减天数
   * @param {Date|string} date 基准日期
   * @param {number} days 加减天数（正数为加，负数为减）
   * @returns {Date} 计算后的日期
   */
  addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  },
  /**
   * 判断是否为同一天
   * @param {Date|string} date1 日期1
   * @param {Date|string} date2 日期2
   * @returns {boolean} 是否为同一天
   */
  isSameDay(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  },
  /**
   * 获取本周的起始和结束日期
   * @returns {object} { start, end }
   */
  getWeekRange() {
    const now = /* @__PURE__ */ new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start: this.format(monday, "YYYY-MM-DD"),
      end: this.format(sunday, "YYYY-MM-DD")
    };
  },
  /**
   * 获取本月的起始和结束日期
   * @returns {object} { start, end }
   */
  getMonthRange() {
    const now = /* @__PURE__ */ new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      start: this.format(firstDay, "YYYY-MM-DD"),
      end: this.format(lastDay, "YYYY-MM-DD")
    };
  },
  /**
   * 检查日期是否在范围内
   * @param {Date|string} date 检查日期
   * @param {Date|string} start 开始日期
   * @param {Date|string} end 结束日期
   * @returns {boolean} 是否在范围内
   */
  isDateInRange(date, start, end) {
    const d = new Date(date).getTime();
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return d >= s && d <= e;
  },
  /**
   * 获取过期状态
   * @param {Date|string} expiryDate 过期日期
   * @param {number} daysBefore 提前几天预警
   * @returns {string} 状态：fresh, expiring, expired
   */
  getExpiryStatus(expiryDate, daysBefore = 3) {
    if (!expiryDate)
      return "fresh";
    const today = /* @__PURE__ */ new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1e3 * 60 * 60 * 24));
    if (diffDays < 0) {
      return "expired";
    } else if (diffDays <= daysBefore) {
      return "expiring";
    } else {
      return "fresh";
    }
  }
};
exports.dateUtils = dateUtils;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/dateUtils.js.map
