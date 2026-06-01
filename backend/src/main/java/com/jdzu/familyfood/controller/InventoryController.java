package com.jdzu.familyfood.controller;

import com.jdzu.familyfood.entity.Inventory;
import com.jdzu.familyfood.entity.User;
import com.jdzu.familyfood.service.InventoryService;
import com.jdzu.familyfood.service.UserService;
import com.jdzu.familyfood.utils.ApiResponse;
import com.jdzu.familyfood.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
@Slf4j
public class InventoryController {

    private final InventoryService inventoryService;
    private final JwtUtil jwtUtil;
    private final UserService userService;  // 注入UserService

    /**
     * 获取当前用户家庭的库存列表
     */
    @GetMapping("/family/{familyId}")
    public ApiResponse getFamilyInventory(@PathVariable Long familyId) {
        List<Inventory> inventory = inventoryService.getFamilyInventory(familyId);

        // 关联食材名称
        List<Map<String, Object>> result = inventory.stream().map(item -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", item.getId());
            map.put("familyId", item.getFamilyId());
            map.put("ingredientId", item.getIngredientId());
            map.put("ingredientName", item.getIngredientName());
            map.put("quantity", item.getQuantity());
            map.put("unit", item.getUnit());
            map.put("purchaseDate", item.getPurchaseDate());
            map.put("expiryDate", item.getExpiryDate());
            map.put("status", item.getStatus());
            return map;
        }).collect(Collectors.toList());

        return ApiResponse.ok(result);
    }

    /**
     * 获取家庭消耗记录（按时间排序）
     */
    @GetMapping("/family/{familyId}/consumed")
    public ApiResponse getFamilyConsumptionRecords(@PathVariable Long familyId,
                                                   @RequestParam(defaultValue = "30") int days) {
        try {
            List<Map<String, Object>> records = inventoryService.getConsumptionRecords(familyId, days);
            return ApiResponse.ok(Map.of(
                "familyId", familyId,
                "periodDays", days,
                "records", records
            ));
        } catch (Exception e) {
            return ApiResponse.error("获取消耗记录失败: " + e.getMessage());
        }
    }

    /**
     * 获取库存概览摘要（含预警数量）
     */
    @GetMapping("/family/{familyId}/summary")
    public ApiResponse getInventorySummary(@PathVariable Long familyId) {
        try {
            Map<String, Object> summary = inventoryService.getInventorySummary(familyId);
            return ApiResponse.ok(summary);
        } catch (Exception e) {
            return ApiResponse.error("获取库存概览失败: " + e.getMessage());
        }
    }
    /**
     * 添加食材
     */
    @PostMapping("/add")
    public ApiResponse addToInventory(@RequestBody Map<String, Object> request) {
        try {
            Long familyId = Long.valueOf(request.get("familyId").toString());
            Long ingredientId = Long.valueOf(request.get("ingredientId").toString());
            BigDecimal quantity = new BigDecimal(request.get("quantity").toString());
            String unit = (String) request.get("unit");
            LocalDate purchaseDate = request.get("purchaseDate") != null ?
                    LocalDate.parse(request.get("purchaseDate").toString()) : LocalDate.now();
            LocalDate expiryDate = request.get("expiryDate") != null ?
                    LocalDate.parse(request.get("expiryDate").toString()) : null;

            Inventory inventory = inventoryService.addToInventory(
                    familyId, ingredientId, quantity, unit, purchaseDate, expiryDate);

            return ApiResponse.success("添加成功", inventory);
        } catch (Exception e) {
            log.error("添加库存失败", e);
            return ApiResponse.error("添加失败: " + e.getMessage());
        }
    }

    /**
     * 消耗食材
     */
    @PostMapping("/consume")
    public ApiResponse consumeFromInventory(@RequestBody Map<String, Object> request) {
        try {
            Long familyId = Long.valueOf(request.get("familyId").toString());
            Long ingredientId = Long.valueOf(request.get("ingredientId").toString());
            BigDecimal quantity = new BigDecimal(request.get("quantity").toString());
            String mealType = (String) request.get("mealType");

            Inventory inventory = inventoryService.consumeFromInventory(
                    familyId, ingredientId, quantity, mealType);

            return ApiResponse.success("消耗成功", inventory);
        } catch (Exception e) {
            log.error("消耗库存失败", e);
            return ApiResponse.error("消耗失败: " + e.getMessage());
        }
    }

    /**
     * 获取即将过期食材
     */
    @GetMapping("/family/{familyId}/expiring")
    public ApiResponse getExpiringItems(@PathVariable Long familyId) {
        try {
            List<Inventory> expiringItems = inventoryService.getExpiringItems(familyId);
            return ApiResponse.success(expiringItems);
        } catch (Exception e) {
            log.error("获取即将过期食材失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage());
        }
    }

    /**
     * 获取已过期食材
     */
    @GetMapping("/family/{familyId}/expired")
    public ApiResponse getExpiredItems(@PathVariable Long familyId) {
        try {
            List<Inventory> expiredItems = inventoryService.getExpiredItems(familyId);
            return ApiResponse.success(expiredItems);
        } catch (Exception e) {
            log.error("获取已过期食材失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage());
        }
    }
    /**
     * 快捷记录餐食（自动扣减库存）
     */
    @PostMapping("/quick-record")
    public ApiResponse quickRecordMeal(@RequestBody Map<String, Object> request) {
        try {
            Long familyId = Long.valueOf(request.get("familyId").toString());
            String mealType = (String) request.get("mealType");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> ingredients = (List<Map<String, Object>>) request.get("ingredients");
            
            Map<String, Object> result = inventoryService.quickRecordMeal(familyId, mealType, ingredients);
            return ApiResponse.ok(result);
        } catch (Exception e) {
            return ApiResponse.error("快捷记录失败: " + e.getMessage());
        }
    }

    /**
     * 获取低库存预警列表
     */
    @GetMapping("/family/{familyId}/low-stock")
    public ApiResponse getLowStockItems(@PathVariable Long familyId) {
        try {
            List<Map<String, Object>> lowStockItems = inventoryService.getLowStockItems(familyId);
            return ApiResponse.ok(Map.of(
                "familyId", familyId,
                "count", lowStockItems.size(),
                "items", lowStockItems
            ));
        } catch (Exception e) {
            return ApiResponse.error("获取低库存预警失败: " + e.getMessage());
        }
    }

    /**
     * 删除库存项
     */
    @DeleteMapping("/{id}")
    public ApiResponse deleteInventoryItem(@PathVariable Long id) {
        try {
            inventoryService.deleteInventoryItem(id);
            return ApiResponse.success("删除成功");
        } catch (Exception e) {
            log.error("删除库存项失败", e);
            return ApiResponse.error("删除失败: " + e.getMessage());
        }
    }

    private Long getFamilyIdFromToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        Long userId = jwtUtil.getUserIdFromToken(token);
        if (userId == null) return null;

        User user = userService.getUserById(userId);
        return user != null ? user.getFamilyId() : null;
    }
}