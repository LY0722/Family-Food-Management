# 基于AI预测的家庭食材全流程管控小程序

## 项目简介

本项目是一款围绕“家庭食材管控”设计的微信小程序，致力于实现家庭食材从采购、存储、消耗到智能推荐的全流程闭环管理。通过AI消耗预测、智能膳食推荐等功能，帮助家庭高效管理食材库存，减少浪费，提升健康饮食水平。

---

## 主要功能

### 1. 家庭共享库存管理
- 支持扫码或手动录入食材（名称、数量、保质期）
- 多家庭成员共享库存信息
- 智能生成采购清单（基于消耗预测）
- 库存实时更新，支持编辑与删除

### 2. AI消耗预测与预警
- 基于历史消耗、用餐频率、节假日等预测食材消耗趋势
- 推送“即将过期”与“需要补货”预警提醒
- 消耗预测准确率目标 ≥85%

### 3. 智能膳食推荐
- 根据库存食材与成员健康标签（如低盐、低脂、高蛋白）推荐菜谱
- 推荐菜谱可一键加入“今日餐食”并自动扣减库存

### 4. 自动化记录与报告
- 一键记录餐食，自动扣减库存
- 生成消耗报告（可视化图表展示消耗趋势）
- 管理员端可管理食材库、用户数据、系统日志

---

## 页面设计与功能（底部三大导航）

## 一、Home（首页）—— 核心管控页

### 1. 顶部区域
- 家庭名称 + 切换家庭入口（下拉选择）
- 当前日期显示（格式：YYYY年MM月DD日 E）
- 悬浮AI小助手（圆形浮动按钮，右下角固定位置）
  - 点击展开半屏对话窗口
  - 支持文本输入和语音输入
  - 示例对话：
    - “今天能做什么菜？”
    - “快过期的食材有哪些？”
    - “帮我生成采购清单”
    - “记录我今天吃了番茄炒蛋”

### 2. 预警卡片区（横向滚动）
- 即将过期食材卡片（3-5条）
  - 显示：食材名称、剩余天数、数量
  - 颜色标识：红色（1-2天）、橙色（3-5天）、黄色（6-7天）
- 需要补货提醒卡片
  - 显示：食材名称、建议补货数量
- 点击任意卡片跳转库存详情页

### 3. 库存概览区
- 标题：“当前库存” + “查看全部”链接
- 网格布局（2列或3列）
  - 每项显示：食材图标、名称、数量、单位
  - 剩余天数角标（颜色标识）
- 底部快捷操作：
  - “手动添加食材”按钮
  - “扫码录入”按钮

### 4. 今日推荐膳食区
- 标题：“今日推荐” + “更多推荐”链接
- 横向滚动卡片（1-2条可见）
  - 每项显示：菜谱图片、名称、所需食材数、烹饪时间
  - 标签：健康标签（低脂、高蛋白等）
  - 按钮：“一键开吃”
- 点击卡片跳转菜谱详情

### 5. 快捷记录区
- 标题：“最近常吃”
- 横向滚动（最近使用的3-5个菜谱）
- 每个菜谱显示名称 + “记录”按钮
- “手动记录餐食”按钮（底部）

### 6. AI悬浮助手详细设计
- 位置：右下角，所有页面可见
- 状态：收起（圆形图标）→ 展开（半屏窗口）
- 窗口内容：
  - 顶部：标题“AI小助手” + 关闭按钮
  - 中间：对话记录区域（气泡形式）
  - 底部：输入框 + 发送按钮 + 语音按钮
- 支持的意图：
  - 查询库存：“鸡蛋还有多少？”
  - 推荐菜谱：“推荐一个低脂菜谱”
  - 记录用餐：“记录我吃了红烧肉”
  - 采购清单：“生成这周的采购清单”
  - 预警查询：“有什么快过期的？”

---

## 二、Shopping（购物页）—— 采购清单 + 库存补充

### 1. 顶部Tab切换
- Tab1：待购清单（默认选中）
- Tab2：已购清单

### 2. 操作栏
- 标题：“采购清单”
- “AI生成采购清单”按钮（主要操作）
- “手动添加采购项”按钮（次要操作）
- 搜索框（按食材名称搜索）

### 3. 待购清单列表
每个采购项卡片包含：
- 食材名称 + 数量 + 单位
- 来源标记：🤖 AI生成 / 📝 手动添加
- 建议采购原因：库存不足 / 即将用完 / 常购食材
- 操作按钮：
  - ✅ 标记已购（移到已购清单）
  - 🗑️ 删除采购项
  - ✏️ 编辑数量

列表排序规则：
- 按推荐优先级排序（AI标记 > 手动添加）
- 同优先级按添加时间倒序

### 4. 已购清单列表
每个已购项卡片包含：
- 食材名称 + 数量 + 单位
- 购买时间
- “重新添加”按钮（移回待购清单）

### 5. AI智能生成区域
点击“AI生成采购清单”后弹出模态框：
- 展示现有库存分析摘要
- 展示AI建议采购清单（与现有清单对比）
- 差异化显示：
  - 新增项（绿色标记）
  - 数量调整项（黄色标记）
  - 删除建议项（红色标记）
- 操作按钮：“应用建议” / “取消”

### 6. 底部操作栏
- “一键加入购物车”（批量选中待购项）
- “导出采购清单”（分享文本/图片）
- 总采购项数量统计

---

## 三、Profile（我的页）—— 设置 + 数据 + 管理

### 1. 顶部用户信息区
- 圆形头像（可点击更换）
- 用户昵称 + 编辑图标
- 家庭成员角色标签（家长/成员）
- “切换家庭”按钮

### 2. 功能菜单区（网格布局，2×2或3×3）
每个菜单项包含：图标 + 名称 + 红点提示（如有更新）

菜单项列表：
- 健康标签
- 家庭成员
- 数据报告
- 通知设置
- 食材库管理（仅管理员）
- 用户数据管理（仅管理员）
- 系统日志（仅管理员）
- 关于我们
- 退出登录

### 3. 健康标签管理页（点击进入）
- 标题：“我的健康标签”
- 标签云/多选框：
  - 饮食目标：减脂 / 增肌 / 保持健康
  - 忌口：无 / 海鲜过敏 / 坚果过敏 / 乳糖不耐
  - 偏好：低盐 / 低脂 / 高蛋白 / 低碳水 / 无糖
  - 其他：素食 / 清真 / 少油
- “保存”按钮（调用更新接口）

### 4. 家庭成员管理页（点击进入）
- 顶部：“家庭码” + 复制按钮
- “邀请成员”按钮
- 成员列表：
  - 头像 + 昵称 + 角色 + 加入时间
  - 家长可操作：移除成员 / 转让家长
- 底部：“退出家庭”按钮（红色警告）

### 5. 数据报告页（点击进入）
- 时间筛选：本周 / 本月 / 自定义
- 图表区域（使用图表库）：
  - 消耗趋势折线图（按天/周）
  - 食材分类消耗饼图
  - 浪费金额统计柱状图
- 统计数据卡片：
  - 总消耗食材数量
  - 总浪费金额
  - 节省预估（相比无管控状态）
- “导出报告”按钮（PDF/图片）

### 6. 通知设置页（点击进入）
- 开关项：
  - 即将过期提醒（默认开启）
  - 每日消耗总结（默认关闭）
  - AI采购建议（默认开启）
  - 家庭成员动态（默认开启）
- 提醒时间设置（仅过期提醒）：
  - 提前天数：1天 / 2天 / 3天
  - 提醒时间：09:00 / 12:00 / 18:00

### 7. 管理员专属区域（仅管理员可见）
- 食材库管理：
  - 食材列表（分页）
  - 添加/编辑/删除食材
  - 批量导入（Excel）
- 用户数据管理：
  - 用户列表
  - 查看用户家庭
  - 数据统计概览
- 系统日志：
  - 日志级别筛选
  - 时间范围筛选
  - 日志搜索

### 8. 底部版本信息
- 版本号：v1.0.0
- 用户协议 | 隐私政策


## 页面交互与设计建议

- **设计风格**：简洁，主色调为白色，辅以绿色（健康/新鲜）和橙色（预警提示）
- **交互逻辑**：卡片式设计，减少页面跳转，多用弹窗与滑动操作
- **技术实现**：
  - 前端：微信小程序框架
  - 后端：Spring Boot + MySQL
  - AI模型：Python训练，通过API集成

---
---

        // ========== 用户管理 ==========
        apis.add(api("POST", "/user/wechat-login", "微信一键登录"));
        apis.add(api("POST", "/user/login", "手机号登录"));
        apis.add(api("POST", "/user/send-code", "发送验证码"));
        apis.add(api("POST", "/user/register", "用户注册"));
        apis.add(api("GET", "/user/current", "获取当前用户"));
        apis.add(api("PUT", "/user/profile", "更新用户信息"));
        apis.add(api("GET", "/user/health-tags", "获取健康标签"));
        apis.add(api("PUT", "/user/health-tags", "更新健康标签"));
        apis.add(api("GET", "/user/notification-settings", "获取通知设置"));
        apis.add(api("PUT", "/user/notification-settings", "更新通知设置"));
        apis.add(api("POST", "/user/avatar", "上传头像"));
        apis.add(api("POST", "/user/logout", "退出登录"));

        // ========== 家庭管理 ==========
        apis.add(api("POST", "/family/create", "创建家庭"));
        apis.add(api("POST", "/family/join", "加入家庭"));
        apis.add(api("GET", "/family/{familyId}/members", "家庭成员"));
        apis.add(api("GET", "/family/{familyId}/info", "获取家庭信息"));
        apis.add(api("POST", "/family/{familyId}/leave", "退出家庭"));
        apis.add(api("POST", "/family/switch", "切换当前家庭"));
        apis.add(api("DELETE", "/family/{familyId}/member/{memberId}", "移除成员"));

        // ========== 库存管理 ==========
        apis.add(api("GET", "/inventory/family/{familyId}", "库存列表"));
        apis.add(api("POST", "/inventory/add", "添加食材"));
        apis.add(api("POST", "/inventory/consume", "消耗食材"));
        apis.add(api("GET", "/inventory/family/{familyId}/expiring", "即将过期"));
        apis.add(api("GET", "/inventory/family/{familyId}/expired", "已过期"));
        apis.add(api("GET", "/inventory/family/{familyId}/consumed", "消耗记录"));
        apis.add(api("GET", "/inventory/family/{familyId}/summary", "库存概览"));
        apis.add(api("GET", "/inventory/family/{familyId}/low-stock", "低库存预警"));
        apis.add(api("POST", "/inventory/quick-record", "快捷记录餐食"));

        // ========== 食谱管理 ==========
        apis.add(api("GET", "/recipe/recommend", "推荐菜谱"));
        apis.add(api("GET", "/recipe/today-recommend", "今日推荐"));
        apis.add(api("GET", "/recipe/smart-recommend", "智能推荐"));
        apis.add(api("GET", "/recipe/health-tags", "按标签查菜谱"));
        apis.add(api("GET", "/recipe/{recipeId}", "菜谱详情"));
        apis.add(api("GET", "/recipe/{recipeId}/can-cook", "能否制作"));
        apis.add(api("POST", "/recipe/{recipeId}/cook", "制作菜谱"));

        // ========== 购物清单 ==========
        apis.add(api("GET", "/shopping/family/{familyId}", "采购清单"));
        apis.add(api("POST", "/shopping/add", "添加采购项"));
        apis.add(api("PUT", "/shopping/{id}/purchase", "标记已购"));
        apis.add(api("POST", "/shopping/family/{familyId}/generate-enhanced", "生成智能清单"));
        apis.add(api("DELETE", "/shopping/{id}", "删除采购项"));

        // ========== AI助手 ==========
        apis.add(api("GET", "/ai/predict-consumption", "预测消耗"));
        apis.add(api("POST", "/ai/chat", "AI对话"));
        apis.add(api("GET", "/ai/smart-notifications/expiring", "智能预警"));
        apis.add(api("GET", "/ai/recommend-recipes", "AI推荐"));
        apis.add(api("POST", "/ai/record-meal", "记录用餐"));
        apis.add(api("GET", "/ai/shopping-list", "AI采购清单"));

        // ========== 数据报告 ==========
        apis.add(api("GET", "/report/consumption-trend", "消耗趋势"));
        apis.add(api("GET", "/report/waste-statistics", "浪费统计"));
        apis.add(api("GET", "/report/consumption-report", "消耗报告"));

        // ========== 通知管理 ==========
        apis.add(api("GET", "/notification/expiring", "过期预警"));
        apis.add(api("GET", "/notification/replenish", "补货预警"));
        apis.add(api("GET", "/notification/all", "所有通知"));

        // ========== 食材管理 ==========
        apis.add(api("GET", "/ingredient/search", "搜索食材"));
        apis.add(api("GET", "/ingredient/categories", "获取分类"));
        apis.add(api("POST", "/ingredient/create", "创建食材"));
        apis.add(api("POST", "/ingredient/scan", "扫码识别"));

        // ========== AI训练 ==========
        apis.add(api("POST", "/ai-training/train-consumption", "训练消耗预测模型"));
        apis.add(api("GET", "/ai-training/predict-consumption", "预测食材消耗"));
        apis.add(api("POST", "/ai-training/batch-train", "批量训练模型"));
        apis.add(api("GET", "/ai-training/status", "获取模型状态"));
        apis.add(api("DELETE", "/ai-training/model", "删除模型"));

        // ========== AI对话 ==========
        apis.add(api("POST", "/llm-chat/send", "发送消息（一次性回复）"));
        apis.add(api("POST", "/llm-chat/stream", "流式对话（打字机效果）"));
        apis.add(api("POST", "/llm-chat/clear-history", "清除对话历史"));
        apis.add(api("GET", "/llm-chat/suggestions", "获取对话建议"));
        apis.add(api("GET", "/llm-chat/test", "测试LLM连接"));
