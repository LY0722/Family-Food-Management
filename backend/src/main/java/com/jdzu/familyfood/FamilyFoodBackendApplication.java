package com.jdzu.familyfood;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FamilyFoodBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(FamilyFoodBackendApplication.class, args);
        System.out.println("✅ 家庭食材管理系统后端启动成功！");
        System.out.println("✅ 数据库: family_food_db");
        System.out.println("✅ 端口: 8080");
        System.out.println("✅ API基础路径: /api");
        System.out.println("✅ API文档: http://localhost:8080/api/docs");
    }
}