package com.jdzu.familyfood.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;

@Service
public class FileStorageService {

    private final Path rootLocation;

    public FileStorageService(@Value("${file.upload-dir}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("无法创建上传目录", e);
        }
    }

    public String store(MultipartFile file, String subFolder) {
        String original = StringUtils.cleanPath(file.getOriginalFilename());
        String filename = System.currentTimeMillis() + "_" + original;
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("上传文件为空");
            }
            Path folder = this.rootLocation.resolve(subFolder).normalize();
            Files.createDirectories(folder);
            Path target = folder.resolve(filename).normalize();
            try (var in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
            // 返回相对 URL，例如 /uploads/avatars/xxx.jpg
            return "/uploads/" + subFolder + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("保存文件失败", e);
        }
    }
}