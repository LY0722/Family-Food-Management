package com.jdzu.familyfood.service;

import com.jdzu.familyfood.entity.Family;
import com.jdzu.familyfood.entity.User;
import com.jdzu.familyfood.repository.FamilyRepository;
import com.jdzu.familyfood.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;

    // ==================== 1. 用户查询 ====================
    /**
     * 用户注册
     */
    @Transactional
    public User register(String phone, String password, String wechatCode) {
        // 检查手机号是否已存在
        if (findByPhone(phone) != null) {
            throw new RuntimeException("该手机号已注册");
        }

        // 创建新用户
        User user = new User();
        user.setPhone(phone);
        user.setPassword(password);
        user.setOpenid(wechatCode != null ? wechatCode : generateOpenid(phone));
        user.setNickname("用户" + phone.substring(7)); // 取手机号后4位作为昵称
        user.setCreatedAt(java.time.LocalDateTime.now());
        user.setUpdatedAt(java.time.LocalDateTime.now());

        return userRepository.save(user);
    }

    /**
     * 生成openid（如果微信登录未提供）
     */
    private String generateOpenid(String phone) {
        return "user_" + phone + "_" + System.currentTimeMillis();
    }
    /**
     * 根据ID获取用户
     */
    public User getUserById(Long userId) {
        return userRepository.findById(userId).orElse(null);
    }

    /**
     * 根据openid获取用户
     */
    public User findByOpenid(String openid) {
        return userRepository.findByOpenid(openid);
    }

    /**
     * 根据手机号获取用户
     */
    public User findByPhone(String phone) {
        return userRepository.findByPhone(phone);
    }

    /**
     * 根据手机号和密码查找用户
     */
    public User findByPhoneAndPassword(String phone, String password) {
        User user = userRepository.findByPhone(phone);
        if (user != null && password.equals(user.getPassword())) {
            return user;
        }
        return null;
    }

    /**
     * 根据openid查找或创建用户
     */
    @Transactional
    public User findOrCreateByOpenid(String openid) {
        User user = userRepository.findByOpenid(openid);
        if (user == null) {
            user = new User();
            user.setOpenid(openid);
            user.setNickname("微信用户");
            user = userRepository.save(user);
        }
        return user;
    }

    /**
     * 保存用户
     */
    public User save(User user) {
        return userRepository.save(user);
    }

    // ==================== 2. 用户信息更新 ====================

    /**
     * 更新用户信息
     */
    @Transactional
    public User updateUserInfo(Long userId, String nickname, String avatarUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        if (nickname != null && !nickname.isEmpty()) {
            user.setNickname(nickname);
        }
        if (avatarUrl != null && !avatarUrl.isEmpty()) {
            user.setAvatarUrl(avatarUrl);
        }

        return userRepository.save(user);
    }

    /**
     * 更新用户头像
     */
    @Transactional
    public void updateUserAvatar(Long userId, String avatarUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
    }

    /**
     * 更新用户健康标签
     */
    @Transactional
    public User updateUserHealthTags(Long userId, List<String> healthTags) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        user.setHealthTags(convertToJson(healthTags));
        return userRepository.save(user);
    }

    // ==================== 3. 健康标签解析 ====================

    /**
     * 获取用户健康标签（解析JSON）
     */
    public List<String> getHealthTags(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        String healthTagsJson = user.getHealthTags();
        if (healthTagsJson == null || healthTagsJson.equals("[]")) {
            return new ArrayList<>();
        }

        // 简单解析JSON数组
        String content = healthTagsJson.substring(1, healthTagsJson.length() - 1);
        if (content.isEmpty()) {
            return new ArrayList<>();
        }
        return Arrays.asList(content.split("\",\""));
    }

    /**
     * 将健康标签列表转换为JSON字符串
     */
    private String convertToJson(List<String> list) {
        if (list == null || list.isEmpty()) {
            return "[]";
        }
        return "[\"" + String.join("\",\"", list) + "\"]";
    }

    // ==================== 4. 家庭信息 ====================

    /**
     * 获取家庭信息
     */
    public Map<String, Object> getFamilyInfo(Long familyId) {
        Optional<Family> familyOpt = familyRepository.findById(familyId);
        if (!familyOpt.isPresent()) {
            return null;
        }

        Family family = familyOpt.get();
        Map<String, Object> familyInfo = new HashMap<>();
        familyInfo.put("id", family.getId());
        familyInfo.put("name", family.getName());
        familyInfo.put("familyCode", family.getFamilyCode());
        return familyInfo;
    }

    /**
     * 构建用户信息返回对象
     */
    public Map<String, Object> buildUserInfo(User user) {
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("openid", user.getOpenid());
        userInfo.put("nickname", user.getNickname());
        userInfo.put("avatarUrl", user.getAvatarUrl());
        userInfo.put("phone", user.getPhone());
        userInfo.put("healthTags", user.getHealthTags());
        userInfo.put("familyId", user.getFamilyId());
        return userInfo;
    }

    // ==================== 5. 通知设置相关 ====================

    /**
     * 更新用户通知偏好设置
     */
    @Transactional
    public void updateNotificationSettings(Long userId, Map<String, Object> settings) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        // 将设置转换为JSON字符串存储
        // 简化实现，实际项目中应该使用JSON序列化库
        StringBuilder settingsJson = new StringBuilder("{");
        settings.forEach((key, value) -> {
            settingsJson.append("\"").append(key).append("\":");
            if (value instanceof Boolean) {
                settingsJson.append(value);
            } else {
                settingsJson.append("\"").append(value).append("\"");
            }
            settingsJson.append(",");
        });
        if (settingsJson.length() > 1) {
            settingsJson.setLength(settingsJson.length() - 1); // 移除最后一个逗号
        }
        settingsJson.append("}");
        
        user.setNotificationSettings(settingsJson.toString());
        userRepository.save(user);
    }

    /**
     * 根据ID查找用户（简化版）
     */
    public User findById(Long userId) {
        return userRepository.findById(userId).orElse(null);
    }
}