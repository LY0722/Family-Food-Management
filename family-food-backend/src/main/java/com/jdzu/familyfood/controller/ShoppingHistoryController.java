package com.jdzu.familyfood.controller;

import com.jdzu.familyfood.entity.ShoppingHistory;
import com.jdzu.familyfood.entity.ShoppingHistoryItem;
import com.jdzu.familyfood.service.ShoppingHistoryService;
import com.jdzu.familyfood.utils.ResponseBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/shopping-history")
@RequiredArgsConstructor
public class ShoppingHistoryController {
    
    private final ShoppingHistoryService shoppingHistoryService;
    
    /**
     * 获取买菜记录列表
     */
    @GetMapping("/family/{familyId}")
    public ResponseEntity<Map<String, Object>> getShoppingHistory(
            @PathVariable Long familyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        
        Map<String, Object> result = shoppingHistoryService.getShoppingHistory(familyId, page, pageSize);
        return ResponseEntity.ok(ResponseBuilder.success("获取成功", result));
    }
    
    /**
     * 获取买菜记录详情
     */
    @GetMapping("/detail/{historyId}")
    public ResponseEntity<Map<String, Object>> getShoppingHistoryDetail(
            @PathVariable Long historyId) {
        
        List<ShoppingHistoryItem> items = shoppingHistoryService.getShoppingHistoryDetail(historyId);
        return ResponseEntity.ok(ResponseBuilder.success("获取成功", items));
    }
    
    /**
     * 完成买菜
     */
    @PostMapping("/complete")
    public ResponseEntity<Map<String, Object>> completeShopping(
            @RequestBody Map<String, Object> request) {
        
        Long familyId = Long.valueOf(request.get("familyId").toString());
        List<?> purchasedItemIdsRaw = (List<?>) request.get("purchasedItemIds");
        List<Long> purchasedItemIds = new java.util.ArrayList<>();
        for (Object id : purchasedItemIdsRaw) {
            purchasedItemIds.add(Long.valueOf(id.toString()));
        }
        
        ShoppingHistory history = shoppingHistoryService.completeShopping(familyId, purchasedItemIds);
        
        return ResponseEntity.ok(ResponseBuilder.success("买菜完成", history));
    }

    
}