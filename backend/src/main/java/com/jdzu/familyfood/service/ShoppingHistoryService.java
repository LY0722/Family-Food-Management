package com.jdzu.familyfood.service;

import com.jdzu.familyfood.entity.*;
import com.jdzu.familyfood.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShoppingHistoryService {
    
    private final ShoppingHistoryRepository shoppingHistoryRepository;
    private final ShoppingHistoryItemRepository shoppingHistoryItemRepository;
    private final ShoppingListRepository shoppingListRepository;
    private final IngredientRepository ingredientRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryService inventoryService;
    
    /**
     * 完成买菜，将采购清单中的已勾选项保存到买菜记录，并添加到库存
     */
    @Transactional
    public ShoppingHistory completeShopping(Long familyId, List<Long> purchasedItemIds) {
        // 创建买菜记录
        ShoppingHistory history = new ShoppingHistory();
        history.setFamilyId(familyId);
        history.setShoppingDate(LocalDate.now());
        
        int totalItems = purchasedItemIds.size();
        int purchasedItems = 0;
        
        // 先保存买菜记录主表，获取ID
        history = shoppingHistoryRepository.save(history);
        
        // 处理每个已购买的食材
        for (Long itemId : purchasedItemIds) {
            ShoppingList shoppingItem = shoppingListRepository.findById(itemId).orElse(null);
            if (shoppingItem != null) {
                // 获取食材信息
                Ingredient ingredient = ingredientRepository.findById(shoppingItem.getIngredientId()).orElse(null);
                
                // 创建买菜记录详情
                ShoppingHistoryItem historyItem = new ShoppingHistoryItem();
                historyItem.setShoppingHistoryId(history.getId());
                historyItem.setIngredientId(shoppingItem.getIngredientId());
                historyItem.setIngredientName(ingredient != null ? ingredient.getName() : "未知食材");
                historyItem.setQuantity(shoppingItem.getQuantity());
                historyItem.setUnit(ingredient != null ? ingredient.getUnit() : "个");
                
                // 保存详情
                shoppingHistoryItemRepository.save(historyItem);
                
                // 添加到库存
                if (ingredient != null) {
                    try {
                        inventoryService.addIngredientToInventory(
                            familyId,
                            shoppingItem.getIngredientId(),
                            shoppingItem.getQuantity(),
                            LocalDate.now(),
                            null // 不设置过期日期
                        );
                    } catch (Exception e) {
                        // 添加库存失败不影响买菜记录的保存
                        System.err.println("添加食材到库存失败: " + e.getMessage());
                    }
                }
                
                purchasedItems++;
            }
        }
        
        history.setTotalItems(totalItems);
        history.setPurchasedItems(purchasedItems);
        
        // 计算完成率
        BigDecimal completionRate = totalItems > 0 
            ? new BigDecimal(purchasedItems).divide(new BigDecimal(totalItems), 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100))
            : BigDecimal.ZERO;
        history.setCompletionRate(completionRate);
        
        // 更新买菜记录
        history = shoppingHistoryRepository.save(history);
        
        // 清空采购清单中已购买的项
        for (Long itemId : purchasedItemIds) {
            shoppingListRepository.deleteById(itemId);
        }
        
        return history;
    }
    
    /**
     * 获取买菜记录列表
     */
    public Map<String, Object> getShoppingHistory(Long familyId, int page, int pageSize) {
        List<ShoppingHistory> allHistory = shoppingHistoryRepository.findByFamilyIdOrderByShoppingDateDesc(familyId);
        
        // 手动分页
        int totalItems = allHistory.size();
        int totalPages = (int) Math.ceil((double) totalItems / pageSize);
        
        int startIndex = page * pageSize;
        int endIndex = Math.min(startIndex + pageSize, totalItems);
        
        List<ShoppingHistory> pageHistory = allHistory.stream()
                .skip(startIndex)
                .limit(pageSize)
                .collect(Collectors.toList());
        
        // 获取统计数据
        Long totalShoppingCount = shoppingHistoryRepository.countByFamilyId(familyId);
        Long totalIngredientCount = shoppingHistoryRepository.sumTotalItemsByFamilyId(familyId);
        BigDecimal avgCompletionRate = shoppingHistoryRepository.avgCompletionRateByFamilyId(familyId);
        List<ShoppingHistory> latestList = shoppingHistoryRepository.findLatestByFamilyId(familyId);
        ShoppingHistory latest = latestList != null && !latestList.isEmpty() ? latestList.get(0) : null;
        
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("list", pageHistory);
        result.put("currentPage", page);
        result.put("pageSize", pageSize);
        result.put("totalItems", totalItems);
        result.put("totalPages", totalPages);
        result.put("totalShoppingCount", totalShoppingCount != null ? totalShoppingCount : 0);
        result.put("totalIngredientCount", totalIngredientCount != null ? totalIngredientCount : 0);
        result.put("averageCompletionRate", avgCompletionRate != null ? avgCompletionRate.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        result.put("lastShoppingDate", latest != null ? latest.getShoppingDate().toString() : "--");
        
        return result;
    }
    
    /**
     * 获取买菜记录详情
     */
    public List<ShoppingHistoryItem> getShoppingHistoryDetail(Long historyId) {
        return shoppingHistoryItemRepository.findByShoppingHistoryId(historyId);
    }
}