package com.jdzu.familyfood.controller;

import com.jdzu.familyfood.entity.Inventory;
import com.jdzu.familyfood.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notification")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    /**
     * 获取过期预警通知
     */
    @GetMapping("/expiring")
    public ResponseEntity<?> getExpiringNotifications(@RequestParam Long familyId) {
        List<Inventory> notifications = notificationService.getExpiringNotifications(familyId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * 获取补货预警通知
     */
    @GetMapping("/replenish")
    public ResponseEntity<?> getReplenishNotifications(@RequestParam Long familyId) {
        List<Map<String, Object>> notifications = notificationService.getReplenishNotifications(familyId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * 获取所有通知（合并）
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllNotifications(@RequestParam Long familyId) {
        Map<String, Object> response = new HashMap<>();
        response.put("expiring", notificationService.getExpiringNotifications(familyId));
        response.put("replenish", notificationService.getReplenishNotifications(familyId));
        return ResponseEntity.ok(response);
    }
}
