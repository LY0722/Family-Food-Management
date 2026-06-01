# 家庭食材管家系统 (Family Food Management)

## 系统简介
本系统是一个基于Spring Boot + uni-app的家庭食材管理应用，提供食材库存管理、采购清单、智能推荐等功能。

## 项目结构
- `backend/`: 基于 Spring Boot 的 Java 后端服务
- `frontend/`: 基于 uni-app 的跨平台前端应用

## 系统要求
- JDK 17
- MySQL 8.0+
- Node.js 14+
- HBuilderX（用于运行uni-app前端）

## 安装方法

### 1. 数据库配置
```bash
# 创建数据库
CREATE DATABASE family_food_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 导入数据库脚本
# 脚本位于 backend/database-dump/database.sql
```

### 2. 后端安装
```bash
cd backend

# 修改数据库配置（如需要）
# 编辑 src/main/resources/application.yml
# 修改数据库用户名和密码 (YOUR_DATABASE_PASSWORD_HERE)

# 启动后端服务
mvn spring-boot:run
```

后端服务启动后访问：http://localhost:8080/api

### 3. 前端安装
```bash
cd frontend

# 安装依赖
npm install

# 使用HBuilderX打开项目
# 运行到浏览器或微信开发者工具
```

## 使用说明

### 登录方式
1. **手机号登录**：使用手机号和密码登录
2. **微信登录**：支持微信小程序一键登录

### 主要功能
- **首页**：查看库存概览、今日推荐、快捷操作
- **采购**：管理采购清单、查看采购历史
- **我的**：个人资料、家庭管理、数据报告

### 基本操作流程
1. 首次登录后创建家庭或加入家庭
2. 添加食材到库存
3. 根据库存情况生成采购清单
4. 记录餐食消耗，系统自动更新库存
5. 查看数据报告了解食材使用情况

## 测试账号

| 手机号 | 密码 | 说明 |
|--------|------|------|
| 15180292557 | 123123 | 测试用户1 |
| 15180292558 | 123123 | 测试用户2 |

## 数据库配置信息
- 数据库名：family_food_db
- 数据库用户名：root
- 数据库密码：请根据实际情况配置
- 后端端口：8080

## 注意事项
- 首次启动后端会自动创建数据库表结构
- 前端API地址默认为 http://localhost:8080/api
- 微信登录需要在微信开放平台配置小程序信息