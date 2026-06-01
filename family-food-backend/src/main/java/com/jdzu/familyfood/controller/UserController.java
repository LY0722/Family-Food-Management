package com.jdzu.familyfood.controller;

import com.jdzu.familyfood.entity.Family;
import com.jdzu.familyfood.entity.User;
import com.jdzu.familyfood.repository.UserRepository;
import com.jdzu.familyfood.service.FamilyService;
import com.jdzu.familyfood.service.UserService;
import com.jdzu.familyfood.service.FileStorageService;
import com.jdzu.familyfood.utils.ApiResponse;
import com.jdzu.familyfood.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final FamilyService familyService;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final Map<String, String> verificationCodeCache = new ConcurrentHashMap<>();

    // ==================== 1. 登录相关 ====================
/**
 * 微信登录
 * POST /user/wechat-login
 */
@PostMapping("/wechat-login")
public ApiResponse wechatLogin(@RequestBody Map<String, String> request) {
    String code = request.get("code");

    if (code == null || code.isEmpty()) {
        return ApiResponse.error("微信授权码不能为空");
    }

    // 1. 调用微信API获取openid和session_key
    String openid = getWechatOpenid(code);
    if (openid == null) {
        return ApiResponse.error("微信授权失败");
    }

    // 2. 根据openid查找用户
    User user = userService.findByOpenid(openid);

    // 3. 如果用户不存在，返回401提示需要注册
    if (user == null) {
        return ApiResponse.error(401, "用户不存在，请先注册");
    }

    // 4. 生成token
    String token = jwtUtil.generateToken(user.getId(), user.getOpenid());

    // 5. 构建返回数据
    Map<String, Object> result = new HashMap<>();
    result.put("token", token);
    result.put("userInfo", userService.buildUserInfo(user));

    if (user.getFamilyId() != null) {
        result.put("familyInfo", userService.getFamilyInfo(user.getFamilyId()));
    }

    return ApiResponse.ok(result);
}

/**
 * 调用微信API获取openid（需要实现）
 */
private String getWechatOpenid(String code) {
    // 这里需要调用微信小程序登录接口
    // GET https://api.weixin.qq.com/sns/jscode2session
    // 参数：appid, secret, js_code, grant_type
    // 返回：openid, session_key等
    
    // 临时实现（开发测试用）
    // 实际项目中需要调用微信API
    return "test_openid_" + code;
}
    /**
     * 用户登录
     * POST /user/login
     */
    @PostMapping("/login")
    public ApiResponse login(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        String password = request.get("password");

        if (phone == null || phone.isEmpty()) {
            return ApiResponse.error("手机号不能为空");
        }
        if (password == null || password.isEmpty()) {
            return ApiResponse.error("密码不能为空");
        }

        // 先检查用户是否存在
        User user = userService.findByPhone(phone);
        if (user == null) {
            return ApiResponse.error(404, "该用户未注册");
        }

        // 验证密码
        user = userService.findByPhoneAndPassword(phone, password);
        if (user == null) {
            return ApiResponse.error(401, "密码错误");
        }

        // 生成token
        String token = jwtUtil.generateToken(user.getId(), user.getOpenid());

        // 构建返回数据
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("userInfo", userService.buildUserInfo(user));

        if (user.getFamilyId() != null) {
            result.put("familyInfo", userService.getFamilyInfo(user.getFamilyId()));
        }

        return ApiResponse.ok(result);
    }

    // ==================== 2. 注册相关 ====================

    /**
     * 发送验证码
     * POST /user/send-code
     */
    @PostMapping("/send-code")
    public ApiResponse sendCode(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");

        if (phone == null || phone.isEmpty()) {
            return ApiResponse.error("手机号不能为空");
        }
        if (!phone.matches("^1[3-9]\\d{9}$")) {
            return ApiResponse.error("请输入正确的手机号");
        }

        // 生成6位验证码
        String code = String.format("%06d", new Random().nextInt(999999));

        // 存储到缓存
        verificationCodeCache.put(phone, code);

        // 开发环境：打印并返回验证码
        System.out.println("========== 验证码 ==========");
        System.out.println("手机号: " + phone);
        System.out.println("验证码: " + code);
        System.out.println("===========================");

        // 返回验证码（仅开发测试用）
        Map<String, String> result = new HashMap<>();
        result.put("code", code);

        return ApiResponse.ok(result);
    }

    /**
     * 用户注册
     * POST /user/register
     */
    @PostMapping("/register")
    public ApiResponse register(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        String verifyCode = request.get("verifyCode");
        String password = request.get("password");
        String wechatCode = request.get("wechatCode");

        // 1. 验证手机号
        if (phone == null || phone.isEmpty()) {
            return ApiResponse.error("手机号不能为空");
        }
        if (!phone.matches("^1[3-9]\\d{9}$")) {
            return ApiResponse.error("请输入正确的手机号");
        }

        // 2. 验证验证码
        String cachedCode = verificationCodeCache.get(phone);
        if (cachedCode == null || !cachedCode.equals(verifyCode)) {
            return ApiResponse.error("验证码错误或已过期");
        }

        // 3. 验证密码
        if (password == null || password.length() < 6) {
            return ApiResponse.error("密码长度不能少于6位");
        }

        // 4. 检查用户是否已存在
        if (userService.findByPhone(phone) != null) {
            return ApiResponse.error("该手机号已注册");
        }

        // 5. 创建用户
        User user = userService.register(phone, password, wechatCode);

        // 6. 为新用户自动创建家庭
        try {
            Family family = familyService.createFamily(user.getId(), user.getNickname() + "的家庭");
            user.setFamilyId(family.getId());
            userRepository.save(user);

            // 更新用户信息以包含家庭信息
            user = userService.getUserById(user.getId());
        } catch (Exception e) {
            // 家庭创建失败不影响用户注册
            System.err.println("自动创建家庭失败: " + e.getMessage());
        }

        // 7. 清除验证码缓存
        verificationCodeCache.remove(phone);

        // 8. 生成token
        String token = jwtUtil.generateToken(user.getId(), user.getOpenid());

        // 9. 构建返回数据
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("userInfo", userService.buildUserInfo(user));

        // 如果成功创建家庭，返回家庭信息
        if (user.getFamilyId() != null) {
            result.put("familyInfo", userService.getFamilyInfo(user.getFamilyId()));
        }

        return ApiResponse.ok(result);
    }

    // ==================== 3. 用户信息相关 ====================

    /**
     * 获取当前登录用户信息
     * GET /user/current
     */
    @GetMapping("/current")
    public ApiResponse getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ApiResponse.error(401, "未登录");
        }

        User user = userService.getUserById(userId);
        if (user == null) {
            return ApiResponse.error(401, "用户不存在");
        }

        return ApiResponse.ok(userService.buildUserInfo(user));
    }

    /**
     * 更新用户信息
     * PUT /user/profile
     */
    @PutMapping("/profile")
    public ApiResponse updateProfile(@RequestBody Map<String, String> request,
                                     @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ApiResponse.error(401, "未登录");
        }

        String nickname = request.get("nickname");
        String avatarUrl = request.get("avatarUrl");

        User user = userService.updateUserInfo(userId, nickname, avatarUrl);
        return ApiResponse.ok(userService.buildUserInfo(user));
    }

    /**
     * 上传头像
     * POST /user/avatar
     */
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse uploadAvatar(@RequestParam("file") MultipartFile file,
                                    @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ApiResponse.error(401, "未登录");
        }

        if (file == null || file.isEmpty()) {
            return ApiResponse.error("请选择要上传的文件");
        }

        try {
            String url = fileStorageService.store(file, "avatars");
            userService.updateUserAvatar(userId, url);

            Map<String, String> result = new HashMap<>();
            result.put("avatarUrl", url);
            return ApiResponse.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("上传失败: " + e.getMessage());
        }
    }

    // ==================== 4. 健康标签相关 ====================

    /**
     * 获取用户健康标签
     * GET /user/health-tags
     */
    @GetMapping("/health-tags")
    public ApiResponse getHealthTags(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ApiResponse.error(401, "未登录");
        }

        List<String> healthTags = userService.getHealthTags(userId);
        return ApiResponse.ok(healthTags);
    }

    /**
     * 更新用户健康标签
     * PUT /user/health-tags
     */
    @PutMapping("/health-tags")
    public ApiResponse updateHealthTags(@RequestBody Map<String, List<String>> request,
                                        @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ApiResponse.error(401, "未登录");
        }

        List<String> healthTags = request.get("tags");
        User user = userService.updateUserHealthTags(userId, healthTags);
        return ApiResponse.ok(user.getHealthTags());
    }

    // ==================== 5. 通知设置相关 ====================

    /**
     * 获取用户通知偏好设置
     */
    @GetMapping("/notification-settings")
    public ApiResponse getNotificationSettings(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ApiResponse.error(401, "未登录");
        }

        User user = userService.getUserById(userId);

        // 默认通知设置
        Map<String, Object> defaultSettings = new HashMap<>();
        defaultSettings.put("expiryReminder", true);
        defaultSettings.put("lowStockAlert", true);
        defaultSettings.put("weeklyReport", true);
        defaultSettings.put("pushNotification", true);
        defaultSettings.put("emailNotification", false);

        Map<String, Object> settings = new HashMap<>(defaultSettings);

        // 如果用户有自定义设置，则合并
        if (user.getNotificationSettings() != null && !user.getNotificationSettings().isEmpty()) {
            // 这里可以解析JSON格式的通知设置
            // 简化处理：假设用户设置存储在JSON字段中
            settings.putAll(parseNotificationSettings(user.getNotificationSettings()));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("userId", userId);
        result.put("settings", settings);

        return ApiResponse.ok(result);
    }

    /**
     * 更新用户通知偏好设置
     */
    @PutMapping("/notification-settings")
    public ApiResponse updateNotificationSettings(@RequestBody Map<String, Object> request,
                                                  @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ApiResponse.error(401, "未登录");
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> settings = (Map<String, Object>) request.get("settings");

        // 更新用户通知设置
        userService.updateNotificationSettings(userId, settings);

        return ApiResponse.ok("通知设置更新成功");
    }

    /**
     * 解析通知设置（简化实现）
     */
    private Map<String, Object> parseNotificationSettings(String settingsJson) {
        // 简化实现，实际项目中应该使用JSON解析库
        Map<String, Object> settings = new HashMap<>();
        if (settingsJson != null && settingsJson.contains("expiryReminder")) {
            settings.put("expiryReminder", settingsJson.contains("true"));
        }
        if (settingsJson != null && settingsJson.contains("lowStockAlert")) {
            settings.put("lowStockAlert", settingsJson.contains("true"));
        }
        return settings;
    }

    // ==================== 6. 其他 ====================

    /**
     * 退出登录
     * POST /user/logout
     */
    @PostMapping("/logout")
    public ApiResponse logout() {
        return ApiResponse.ok("退出成功");
    }

    // ==================== 私有方法 ====================

    /**
     * 从请求头中获取用户ID
     */
    private Long getUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        return jwtUtil.getUserIdFromToken(token);
    }
}