package com.jdzu.familyfood.controller;

import com.jdzu.familyfood.dto.ShoppingListVO;
import com.jdzu.familyfood.entity.ShoppingList;
import com.jdzu.familyfood.service.ShoppingListService;
import com.jdzu.familyfood.utils.ResponseBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.List;


@RestController
@RequestMapping("/shopping")
@RequiredArgsConstructor
public class ShoppingListController {
    private final ShoppingListService shoppingListService;

    /**
     * 获取采购清单（支持分页）
     */
    @GetMapping("/family/{familyId}")
    public ResponseEntity<Map<String, Object>> getShoppingList(
            @PathVariable Long familyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Map<String, Object> result = shoppingListService.getShoppingListWithPagination(familyId, page, size);
        return ResponseEntity.ok(ResponseBuilder.success("获取成功", result));
    }

    /**
     * 添加采购项
     */
    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addToShoppingList(
            @RequestBody Map<String, Object> request) {
        Long familyId = Long.valueOf(request.get("familyId").toString());
        Long ingredientId = Long.valueOf(request.get("ingredientId").toString());
        BigDecimal quantity = new BigDecimal(request.get("quantity").toString());

        Byte priority = null;
        if (request.get("priority") != null) {
            priority = Byte.valueOf(request.get("priority").toString());
        }

        ShoppingListVO item = shoppingListService.addToShoppingList(
                familyId, ingredientId, quantity, priority);

        return ResponseEntity.ok(ResponseBuilder.success("添加成功", item));
    }

    /**
     * 标记为已购买
     */
    @PutMapping("/{id}/purchase")
    public ResponseEntity<Map<String, Object>> markAsPurchased(
            @PathVariable Long id) {
        try {
            shoppingListService.markAsPurchased(id);
            return ResponseEntity.ok(ResponseBuilder.success("标记成功"));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(ResponseBuilder.error(e.getMessage()));
        }
    }

    /**
     * 生成智能采购清单
     */
    @PostMapping("/family/{familyId}/generate-enhanced")
    public ResponseEntity<Map<String, Object>> generateEnhancedSmartShoppingList(
            @PathVariable Long familyId) {
        shoppingListService.generateEnhancedSmartShoppingList(familyId);
        return ResponseEntity.ok(ResponseBuilder.success(
                "增强智能采购清单生成成功",
                Map.of("aiFeatures", "基于历史消耗预测和库存优化")
        ));
    }

    /**
     * 删除采购项
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteShoppingItem(
            @PathVariable Long id) {
        try {
            shoppingListService.deleteById(id);
            return ResponseEntity.ok(ResponseBuilder.success("删除成功"));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(ResponseBuilder.error(404, e.getMessage()));
        }
    }

    /**
     * 批量添加采购项（从食谱）
     */
    @PostMapping("/add-batch")
    public ResponseEntity<Map<String, Object>> addBatchToShoppingList(
            @RequestBody Map<String, Object> request) {
        try {
            Long familyId = Long.valueOf(request.get("familyId").toString());
            Long recipeId = Long.valueOf(request.get("recipeId").toString());
            
            int addedCount = shoppingListService.addRecipeIngredientsToShoppingList(familyId, recipeId);
            
            return ResponseEntity.ok(ResponseBuilder.success(
                "批量添加成功",
                Map.of("addedCount", addedCount, "recipeId", recipeId)
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(ResponseBuilder.error("批量添加失败: " + e.getMessage()));
        }
    }
    /**
 * 清空已购买的采购项
 */
@PostMapping("/clear-purchased")
public ResponseEntity<Map<String, Object>> clearPurchasedItems(
        @RequestBody Map<String, Object> request) {
    Long familyId = Long.valueOf(request.get("familyId").toString());
    List<?> purchasedItemIdsRaw = (List<?>) request.get("purchasedItemIds");
    List<Long> purchasedItemIds = new java.util.ArrayList<>();
    for (Object id : purchasedItemIdsRaw) {
        purchasedItemIds.add(Long.valueOf(id.toString()));
    }
    shoppingListService.clearPurchasedItems(familyId, purchasedItemIds);
    return ResponseEntity.ok(ResponseBuilder.success("清空成功"));
}

/**
 * 清空所有已购买的采购项
 */
@PostMapping("/clear-all")
public ResponseEntity<Map<String, Object>> clearAllPurchasedItems(
        @PathVariable Long familyId) {
    
    shoppingListService.clearAllItems(familyId);
    
    return ResponseEntity.ok(ResponseBuilder.success("清空成功"));
}
}