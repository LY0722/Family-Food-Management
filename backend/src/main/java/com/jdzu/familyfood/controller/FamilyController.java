package com.jdzu.familyfood.controller;

import com.jdzu.familyfood.entity.Family;
import com.jdzu.familyfood.entity.User;
import com.jdzu.familyfood.service.FamilyService;
import com.jdzu.familyfood.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/family")
@RequiredArgsConstructor
public class FamilyController {
    private final FamilyService familyService;
    private final UserService userService;
    /**
     * 创建家庭
     */
@PostMapping("/create")
public ResponseEntity<Map<String, Object>> createFamily(
        @RequestBody Map<String, Object> request,
        @RequestHeader("Authorization") String token) {
    
    // 从token获取userId（这里先从请求体获取）
    Long adminUserId = null;
    if (request.get("userId") != null) {
        adminUserId = Long.valueOf(request.get("userId").toString());
    }
    
    if (adminUserId == null) {
        Map<String, Object> response = new HashMap<>();
        response.put("code", 401);
        response.put("message", "用户未登录");
        return ResponseEntity.ok(response);
    }
    
    // 同时支持 name 和 familyName
    String familyName = (String) request.get("name");
    if (familyName == null) {
        familyName = (String) request.get("familyName");
    }
    
    if (familyName == null || familyName.trim().isEmpty()) {
        Map<String, Object> response = new HashMap<>();
        response.put("code", 400);
        response.put("message", "家庭名称不能为空");
        return ResponseEntity.ok(response);
    }
    
    Family family = familyService.createFamily(adminUserId, familyName.trim());
    Map<String, Object> response = new HashMap<>();
    response.put("code", 200);
    response.put("message", "家庭创建成功");
    response.put("data", Map.of(
            "id", family.getId(),
            "name", family.getName(),
            "inviteCode", family.getFamilyCode()
    ));
    return ResponseEntity.ok(response);
}

@PostMapping("/join")
public ResponseEntity<Map<String, Object>> joinFamily(
        @RequestBody Map<String, Object> request,
        @RequestHeader("Authorization") String token) {
    
    // 从请求体获取userId
    Long userId = null;
    if (request.get("userId") != null) {
        userId = Long.valueOf(request.get("userId").toString());
    }
    
    if (userId == null) {
        Map<String, Object> response = new HashMap<>();
        response.put("code", 401);
        response.put("message", "用户未登录");
        return ResponseEntity.ok(response);
    }
    
    // 同时支持 code 和 familyCode
    String familyCode = (String) request.get("code");
    if (familyCode == null) {
        familyCode = (String) request.get("familyCode");
    }
    
    if (familyCode == null || familyCode.trim().isEmpty()) {
        Map<String, Object> response = new HashMap<>();
        response.put("code", 400);
        response.put("message", "家庭码不能为空");
        return ResponseEntity.ok(response);
    }
    
    Family family = familyService.joinFamily(userId, familyCode.trim());
    
    Map<String, Object> response = new HashMap<>();
    if (family != null) {
        response.put("code", 200);
        response.put("message", "加入家庭成功");
        response.put("data", Map.of(
                "id", family.getId(),
                "name", family.getName(),
                "inviteCode", family.getFamilyCode()
        ));
    } else {
        response.put("code", 400);
        response.put("message", "家庭码无效或已加入该家庭");
    }
    return ResponseEntity.ok(response);
}

    /**
     * 获取家庭成员
     */
    @GetMapping("/{familyId}/members")
    public ResponseEntity<Map<String, Object>> getFamilyMembers(@PathVariable Long familyId) {
        List<User> members = familyService.getFamilyMembers(familyId);
        Long adminId = familyService.getFamilyAdminId(familyId);

        List<Map<String, Object>> formattedMembers = members.stream().map(user -> {
            Map<String, Object> member = new HashMap<>();
            member.put("id", user.getId());
            member.put("nickname", user.getNickname());
            member.put("avatarUrl", user.getAvatarUrl());
            member.put("role", user.getId().equals(adminId) ? "owner" : "member");
            member.put("joinedAt", user.getCreatedAt());
            member.put("healthTags", parseHealthTags(user.getHealthTags()));
            return member;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "获取成功");
        response.put("data", formattedMembers);
        return ResponseEntity.ok(response);
    }

    // ========== 以下为新增接口 ==========

    /**
     * 获取家庭信息
     * GET /family/{familyId}/info
     */
    @GetMapping("/{familyId}/info")
    public ResponseEntity<Map<String, Object>> getFamilyInfo(@PathVariable Long familyId) {
        Family family = familyService.getFamilyById(familyId);
        if (family == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("code", 404);
            response.put("message", "家庭不存在");
            return ResponseEntity.ok(response);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "获取成功");
        response.put("data", Map.of(
                "id", family.getId(),
                "name", family.getName(),
                "familyCode", family.getFamilyCode(),
                "adminUserId", family.getAdminUserId(),
                "memberCount", familyService.getFamilyMemberCount(familyId)
        ));
        return ResponseEntity.ok(response);
    }

    /**
     * 退出家庭
     * POST /family/{familyId}/leave
     */
    @PostMapping("/{familyId}/leave")
    public ResponseEntity<Map<String, Object>> leaveFamily(
            @PathVariable Long familyId,
            @RequestBody Map<String, Object> request) {
        
        Long userId = null;
        if (request.get("userId") != null) {
            userId = Long.valueOf(request.get("userId").toString());
        }
        
        if (userId == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("code", 401);
            response.put("message", "用户未登录");
            return ResponseEntity.ok(response);
        }

        boolean success = familyService.leaveFamily(userId, familyId);

        Map<String, Object> response = new HashMap<>();
        if (success) {
            response.put("code", 200);
            response.put("message", "已退出家庭");
        } else {
            response.put("code", 400);
            response.put("message", "退出失败");
        }
        return ResponseEntity.ok(response);
    }

    /**
     * 切换当前家庭
     * POST /family/switch
     */
    @PostMapping("/switch")
    public ResponseEntity<Map<String, Object>> switchFamily(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        Long familyId = Long.valueOf(request.get("familyId").toString());

        boolean success = familyService.switchCurrentFamily(userId, familyId);

        Map<String, Object> response = new HashMap<>();
        if (success) {
            response.put("code", 200);
            response.put("message", "家庭切换成功");
            response.put("currentFamilyId", familyId);
        } else {
            response.put("code", 400);
            response.put("message", "家庭切换失败");
        }
        return ResponseEntity.ok(response);
    }

    /**
     * 移除家庭成员
     * DELETE /family/{familyId}/member/{memberId}
     */
    @DeleteMapping("/{familyId}/member/{memberId}")
    public ResponseEntity<Map<String, Object>> removeMember(
            @PathVariable Long familyId,
            @PathVariable Long memberId) {

        boolean success = familyService.removeMember(familyId, memberId);

        Map<String, Object> response = new HashMap<>();
        if (success) {
            response.put("code", 200);
            response.put("message", "移除成功");
        } else {
            response.put("code", 400);
            response.put("message", "移除失败");
        }
        return ResponseEntity.ok(response);
    }

    private List<String> parseHealthTags(String tagsJson) {
        if (tagsJson == null || tagsJson.equals("[]")) {
            return new ArrayList<>();
        }
        try {
            String content = tagsJson.substring(1, tagsJson.length() - 1);
            if (content.isEmpty()) {
                return new ArrayList<>();
            }
            String[] parts = content.split("\",\"");
            List<String> result = new ArrayList<>();
            for (String part : parts) {
                String cleaned = part.replace("\"", "").trim();
                if (!cleaned.isEmpty()) {
                    result.add(cleaned);
                }
            }
            return result;
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}