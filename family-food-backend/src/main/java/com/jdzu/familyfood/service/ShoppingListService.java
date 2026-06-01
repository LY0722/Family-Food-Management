package com.jdzu.familyfood.service;

import com.jdzu.familyfood.dto.ShoppingListVO;
import com.jdzu.familyfood.entity.ConsumptionRecord;
import com.jdzu.familyfood.entity.Ingredient;
import com.jdzu.familyfood.entity.Inventory;
import com.jdzu.familyfood.entity.RecipeIngredient;
import com.jdzu.familyfood.entity.ShoppingList;
import com.jdzu.familyfood.repository.ConsumptionRecordRepository;
import com.jdzu.familyfood.repository.IngredientRepository;
import com.jdzu.familyfood.repository.InventoryRepository;
import com.jdzu.familyfood.repository.RecipeIngredientRepository;
import com.jdzu.familyfood.repository.ShoppingListRepository;
import javax.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShoppingListService {
    private final ShoppingListRepository shoppingListRepository;
    private final InventoryRepository inventoryRepository;
    private final IngredientRepository ingredientRepository;
    private final ConsumptionRecordRepository consumptionRecordRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;

    private ShoppingListVO convertToVO(ShoppingList shoppingList) {
        ShoppingListVO vo = new ShoppingListVO();
        vo.setId(shoppingList.getId());
        vo.setFamilyId(shoppingList.getFamilyId());
        vo.setIngredientId(shoppingList.getIngredientId());
        vo.setQuantity(shoppingList.getQuantity());
        vo.setPriority(shoppingList.getPriority());
        vo.setStatus(shoppingList.getStatus());
        vo.setCreatedAt(shoppingList.getCreatedAt());
        
        Ingredient ingredient = ingredientRepository.findById(shoppingList.getIngredientId()).orElse(null);
        if (ingredient != null) {
            vo.setName(ingredient.getName());
            vo.setUnit(ingredient.getUnit());
        } else {
            vo.setName("未知食材");
            vo.setUnit("个");
        }
        
        return vo;
    }

    public List<ShoppingList> getShoppingList(Long familyId) {
        return shoppingListRepository.findPendingItemsByPriority(familyId);
    }

    /**
     * 获取分页的采购清单
     */
    public Map<String, Object> getShoppingListWithPagination(Long familyId, int page, int size) {
        List<ShoppingList> allItems = shoppingListRepository.findPendingItemsByPriority(familyId);
        
        List<ShoppingListVO> allVOs = allItems.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        
        int totalItems = allVOs.size();
        int totalPages = (int) Math.ceil((double) totalItems / size);
        
        int startIndex = page * size;
        int endIndex = Math.min(startIndex + size, totalItems);
        
        List<ShoppingListVO> pageItems = allVOs.stream()
                .skip(startIndex)
                .limit(size)
                .collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        result.put("items", pageItems);
        result.put("currentPage", page);
        result.put("pageSize", size);
        result.put("totalItems", totalItems);
        result.put("totalPages", totalPages);
        result.put("hasNext", page < totalPages - 1);
        result.put("hasPrevious", page > 0);
        
        return result;
    }

    @Transactional
    public ShoppingListVO addToShoppingList(Long familyId, Long ingredientId,
                                          BigDecimal quantity, Byte priority) {
        ShoppingList item = new ShoppingList();
        item.setFamilyId(familyId);
        item.setIngredientId(ingredientId);
        item.setQuantity(quantity);
        item.setPriority(priority != null ? priority : (byte) 1);
        item = shoppingListRepository.save(item);
        return convertToVO(item);
    }

    @Transactional
    public void markAsPurchased(Long shoppingItemId) {
        ShoppingList item = shoppingListRepository.findById(shoppingItemId).orElseThrow(() ->
                new RuntimeException("采购项不存在"));

        if (item.getStatus() == 1) {
            throw new RuntimeException("该项已被标记为已购买");
        }

        item.setStatus((byte) 1);
        shoppingListRepository.save(item);

        // 自动添加到库存
        LocalDate today = LocalDate.now();
        // 默认保质期设置为7天后
        LocalDate expiryDate = today.plusDays(7);

        Inventory inventory = inventoryRepository.findByFamilyIdAndIngredientId(
                item.getFamilyId(), item.getIngredientId());

        if (inventory != null) {
            inventory.setQuantity(inventory.getQuantity().add(item.getQuantity()));
            inventory.setPurchaseDate(today);
            inventory.setExpiryDate(expiryDate);
        } else {
            inventory = new Inventory();
            inventory.setFamilyId(item.getFamilyId());
            inventory.setIngredientId(item.getIngredientId());
            inventory.setQuantity(item.getQuantity());
            inventory.setPurchaseDate(today);
            inventory.setExpiryDate(expiryDate);
        }
        inventoryRepository.save(inventory);
    }

    @Transactional
    public ShoppingList findById(Long id) {
        return shoppingListRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("采购项不存在，id: " + id));
    }
    public void generateSmartShoppingList(Long familyId) {
        // 获取即将过期的食材
        List<Inventory> expiringItems = inventoryRepository.findExpiringItems(
                familyId, LocalDate.now(), LocalDate.now().plusDays(3));

        // 获取最近消耗记录生成预测
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(30);
        List<Object[]> consumptionSummary = consumptionRecordRepository.getConsumptionSummary(
                familyId, startDate, endDate);

        // 这里应该添加AI预测逻辑，暂时使用简单的预测
        for (Object[] summary : consumptionSummary) {
            Long ingredientId = (Long) summary[0];
            BigDecimal avgConsumption = ((BigDecimal) summary[1]).divide(BigDecimal.valueOf(30), 2);

            // 检查库存
            Inventory inventory = inventoryRepository.findByFamilyIdAndIngredientId(familyId, ingredientId);
            BigDecimal currentStock = inventory != null ? inventory.getQuantity() : BigDecimal.ZERO;

            // 如果库存小于平均7天的消耗量，则添加到购物清单
            if (currentStock.compareTo(avgConsumption.multiply(BigDecimal.valueOf(7))) < 0) {
                // 检查是否已在购物清单中
                boolean exists = shoppingListRepository.findByFamilyIdAndStatus(familyId, (byte) 0)
                        .stream()
                        .anyMatch(item -> item.getIngredientId().equals(ingredientId));

                if (!exists) {
                    ShoppingList item = new ShoppingList();
                    item.setFamilyId(familyId);
                    item.setIngredientId(ingredientId);
                    item.setQuantity(avgConsumption.multiply(BigDecimal.valueOf(7)).subtract(currentStock));
                    item.setPriority((byte) 2); // 中等优先级
                    shoppingListRepository.save(item);
                }
            }
        }
    }
    @Transactional
    public void deleteById(Long id) {
        ShoppingList item = findById(id);
        shoppingListRepository.delete(item);
    }

    /**
     * 增强的智能采购清单生成
     */
    public void generateEnhancedSmartShoppingList(Long familyId) {
        // 1. 获取库存
        List<Inventory> inventory = inventoryRepository.findByFamilyId(familyId);

        // 2. 获取最近30天的消耗记录
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(30);

        // 3. 为每个食材计算建议采购量
        for (Inventory item : inventory) {
            // 获取历史消耗数据
            List<ConsumptionRecord> records = consumptionRecordRepository
                    .findByFamilyIdAndIngredientIdAndRecordDateBetween(
                            familyId, item.getIngredientId(), startDate, endDate);

            if (!records.isEmpty()) {
                // 计算日均消耗
                BigDecimal totalConsumed = records.stream()
                        .map(ConsumptionRecord::getQuantity)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal avgDailyConsumption = totalConsumed.divide(
                        BigDecimal.valueOf(records.size()), 2);

                // 建议保持7天的库存量
                BigDecimal suggestedStock = avgDailyConsumption.multiply(BigDecimal.valueOf(7));

                // 如果当前库存 < 建议库存的30%，则添加到采购清单
                BigDecimal threshold = suggestedStock.multiply(BigDecimal.valueOf(0.3));
                if (item.getQuantity().compareTo(threshold) < 0) {
                    BigDecimal neededQuantity = suggestedStock.subtract(item.getQuantity());

                    // 检查是否已在采购清单中
                    boolean exists = shoppingListRepository.findByFamilyIdAndStatus(familyId, (byte) 0)
                            .stream()
                            .anyMatch(sl -> sl.getIngredientId().equals(item.getIngredientId()));

                    if (!exists && neededQuantity.compareTo(BigDecimal.ZERO) > 0) {
                        ShoppingList shoppingItem = new ShoppingList();
                        shoppingItem.setFamilyId(familyId);
                        shoppingItem.setIngredientId(item.getIngredientId());
                        shoppingItem.setQuantity(neededQuantity);

                        // 根据过期时间设置优先级
                        if (item.getExpiryDate() != null &&
                                item.getExpiryDate().isBefore(LocalDate.now().plusDays(3))) {
                            shoppingItem.setPriority((byte) 3); // 高优先级
                        } else {
                            shoppingItem.setPriority((byte) 2); // 中优先级
                        }

                        shoppingListRepository.save(shoppingItem);
                    }
                }
            }
        }
    }

    /**
     * 批量添加食谱食材到采购清单
     */
    @Transactional
    public int addRecipeIngredientsToShoppingList(Long familyId, Long recipeId) {
        // 获取食谱的所有食材
        List<RecipeIngredient> recipeIngredients = recipeIngredientRepository.findByRecipeId(recipeId);
        
        int addedCount = 0;
        
        for (RecipeIngredient recipeIngredient : recipeIngredients) {
            Long ingredientId = recipeIngredient.getIngredientId();
            BigDecimal quantity = recipeIngredient.getQuantity();
            
            // 检查是否已在采购清单中
            boolean exists = shoppingListRepository.findByFamilyIdAndStatus(familyId, (byte) 0)
                    .stream()
                    .anyMatch(item -> item.getIngredientId().equals(ingredientId));
            
            if (!exists) {
                ShoppingList shoppingItem = new ShoppingList();
                shoppingItem.setFamilyId(familyId);
                shoppingItem.setIngredientId(ingredientId);
                shoppingItem.setQuantity(quantity);
                shoppingItem.setPriority((byte) 2); // 中等优先级
                shoppingListRepository.save(shoppingItem);
                addedCount++;
            }
        }
        
        return addedCount;
    }
    @Transactional
public void clearPurchasedItems(Long familyId, List<Long> purchasedItemIds) {
    for (Long itemId : purchasedItemIds) {
        shoppingListRepository.deleteById(itemId);
    }
}

@Transactional
public void clearAllItems(Long familyId) {
    shoppingListRepository.deleteByFamilyIdAndStatus(familyId, (byte) 1);
}
}