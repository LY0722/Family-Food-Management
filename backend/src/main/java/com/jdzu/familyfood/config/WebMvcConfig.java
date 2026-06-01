package com.jdzu.familyfood.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
        // 静态资源映射：/api/uploads/** -> 本地文件夹
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations(uploadPath.toUri().toString());
        // 也可以加静态目录映射（如有需要）
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
    }
}