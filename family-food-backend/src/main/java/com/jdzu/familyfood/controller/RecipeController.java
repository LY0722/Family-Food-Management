package com.jdzu.familyfood.controller;

import com.jdzu.familyfood.entity.*;
import com.jdzu.familyfood.repository.RecipeRepository;
import com.jdzu.familyfood.service.RecipeService;
import com.jdzu.familyfood.utils.ResponseBuilder;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/recipe")
@RequiredArgsConstructor
public class RecipeController {
    private static final Logger log = LoggerFactory.getLogger(RecipeController.class);
    private final RecipeService recipeService;
    private final RecipeRepository recipeRepository;

    @GetMapping("/recommend")
    public ResponseEntity<Map<String, Object>> recommendRecipes(
            @RequestParam Long familyId,
            @RequestParam Long userId) {
        List<Recipe> recipes = recipeService.recommendRecipes(familyId, userId);
        return ResponseEntity.ok(ResponseBuilder.success("获取成功", recipes));
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createRecipe(@RequestBody Recipe recipe) {
        try {
            Recipe savedRecipe = recipeRepository.save(recipe);
            return ResponseEntity.ok(ResponseBuilder.success("创建成功", savedRecipe));
        } catch (Exception e) {
            log.error("创建菜谱失败", e);
            return ResponseEntity.ok(ResponseBuilder.error("创建失败: " + e.getMessage()));
        }
    }

    @GetMapping("/today-recommend")
    public ResponseEntity<Map<String, Object>> todayRecommendRecipes(
            @RequestParam Long familyId,
            @RequestParam Long userId) {
        List<Map<String, Object>> recipes = recipeService.smartRecommendRecipes(familyId, userId, 3);
        return ResponseEntity.ok(ResponseBuilder.success(
                "今日菜谱推荐成功",
                Map.of(
                        "recipes", recipes,
                        "recommendationReason", "基于您的库存和健康标签智能匹配"
                )
        ));
    }
   @GetMapping("/date-recommend")
    public ResponseEntity<Map<String, Object>> dateRecommendRecipes(
            @RequestParam Long familyId,
            @RequestParam Long userId,
            @RequestParam String date) {
        try {
            java.time.LocalDate mealDate = java.time.LocalDate.parse(date);
            List<Map<String, Object>> recipes = recipeService.getDateRecommendRecipes(familyId, userId, mealDate, 3);
            return ResponseEntity.ok(ResponseBuilder.success(
                    "日期菜谱推荐成功",
                    Map.of(
                            "recipes", recipes,
                            "date", date,
                            "recommendationReason", "基于您的库存、健康标签和日期智能匹配"
                    )
            ));
        } catch (Exception e) {
            log.error("按日期获取菜谱推荐失败", e);
            return ResponseEntity.ok(ResponseBuilder.error("获取失败: " + e.getMessage()));
        }
    }
    /**
     * 智能推荐食谱（包含健康标签过滤）
     * 替代原来的health-tags接口
     */
    @GetMapping("/smart-recommend")
    public ResponseEntity<Map<String, Object>> smartRecommendRecipes(
            @RequestParam Long familyId,
            @RequestParam Long userId,
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(required = false) List<String> healthTags) {

        List<Map<String, Object>> recipes = recipeService.smartRecommendRecipes(familyId, userId, limit);

        // 如果指定了健康标签，进行额外过滤
        if (healthTags != null && !healthTags.isEmpty()) {
            recipes = recipes.stream()
                    .filter(recipe -> {
                        String recipeTags = (String) recipe.get("healthTags");
                        if (recipeTags == null) return false;

                        List<String> recipeTagList = Arrays.asList(recipeTags.split(","));
                        return recipeTagList.stream().anyMatch(healthTags::contains);
                    })
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(ResponseBuilder.success(
                "智能推荐成功",
                Map.of(
                        "recipes", recipes,
                        "recommendationReason", "基于您的库存、健康标签和消耗习惯智能匹配",
                        "filteredByHealthTags", healthTags != null && !healthTags.isEmpty()
                )
        ));
    }
    /**
     * 按标签查菜谱
     */
    @GetMapping("/health-tags")
    public ResponseEntity<Map<String, Object>> getRecipesByHealthTags(
            @RequestParam Long familyId,
            @RequestParam Long userId,
            @RequestParam String tags) {
        try {
            List<String> tagList = Arrays.asList(tags.split(","));
            List<Recipe> recipes = recipeService.getRecipesByHealthTags(tagList);
            return ResponseEntity.ok(ResponseBuilder.success("获取成功", recipes));
        } catch (Exception e) {
            log.error("按标签获取菜谱失败", e);
            return ResponseEntity.ok(ResponseBuilder.error("获取失败: " + e.getMessage()));
        }
    }
    /**
     * 判断能否制作
     */
    @GetMapping("/{recipeId:[0-9]+}/can-cook")
    public ResponseEntity<Map<String, Object>> canCookRecipe(
            @PathVariable Long recipeId,
            @RequestParam Long familyId) {
        try {
            Map<String, Object> result = recipeService.canCookRecipe(recipeId, familyId);
            return ResponseEntity.ok(ResponseBuilder.success("检查成功", result));
        } catch (Exception e) {
            log.error("检查能否制作失败", e);
            return ResponseEntity.ok(ResponseBuilder.error("检查失败: " + e.getMessage()));
        }
    }
    @GetMapping("/{recipeId:[0-9]+}")
    public ResponseEntity<Map<String, Object>> getRecipeDetail(
            @PathVariable Long recipeId) {
        Recipe recipe = recipeService.getRecipeWithIngredients(recipeId);
        List<RecipeIngredient> ingredients = recipeService.getRecipeIngredients(recipeId);

        Map<String, Object> data = new HashMap<>();
        data.put("recipe", recipe);
        data.put("ingredients", ingredients);

        return ResponseEntity.ok(ResponseBuilder.success("获取成功", data));
    }

    // 添加获取菜谱列表的API
    @GetMapping
    public ResponseEntity<Map<String, Object>> getRecipes(
            @RequestParam(required = false) Long familyId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        try {
            List<Recipe> allRecipes = recipeRepository.findAll();
            
            // 根据分类筛选
            if (category != null && !category.isEmpty() && !"all".equals(category)) {
                allRecipes = allRecipes.stream()
                    .filter(recipe -> category.equals(recipe.getCategory()))
                    .collect(Collectors.toList());
            }
            
            // 根据关键词筛选
            if (keyword != null && !keyword.isEmpty()) {
                allRecipes = allRecipes.stream()
                    .filter(recipe -> recipe.getName().toLowerCase().contains(keyword.toLowerCase()))
                    .collect(Collectors.toList());
            }
            
            // 分页处理
            int startIndex = page * pageSize;
            if (startIndex >= allRecipes.size()) {
                return ResponseEntity.ok(ResponseBuilder.success("获取成功", Map.of(
                    "list", new ArrayList<>(),
                    "total", allRecipes.size(),
                    "page", page,
                    "pageSize", pageSize
                )));
            }
            
            int endIndex = Math.min(startIndex + pageSize, allRecipes.size());
            List<Recipe> pagedRecipes = allRecipes.subList(startIndex, endIndex);
            
            return ResponseEntity.ok(ResponseBuilder.success("获取成功", Map.of(
                "list", pagedRecipes,
                "total", allRecipes.size(),
                "page", page,
                "pageSize", pageSize
            )));
        } catch (Exception e) {
            log.error("获取菜谱列表失败", e);
            return ResponseEntity.ok(ResponseBuilder.error("获取失败: " + e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchRecipes(
            @RequestParam String keyword) {
        try {
            List<Recipe> recipes = recipeRepository.findByNameContaining(keyword);
            return ResponseEntity.ok(ResponseBuilder.success("搜索成功", recipes));
        } catch (Exception e) {
            log.error("搜索食谱失败", e);
            return ResponseEntity.ok(ResponseBuilder.error("搜索失败: " + e.getMessage()));
        }
    }

    @PostMapping("/{recipeId:[0-9]+}/cook")
    public ResponseEntity<Map<String, Object>> cookRecipe(
            @PathVariable Long recipeId,
            @RequestParam Long familyId,
            @RequestParam(defaultValue = "今日餐食") String mealType) {
        try {
            Map<String, Object> canCookResult = recipeService.canCookRecipe(familyId, recipeId);
            boolean canCook = (boolean) canCookResult.get("canCook");
            if (!canCook) {
                return ResponseEntity.ok(ResponseBuilder.error("库存不足，无法烹饪该食谱"));
            }

            // 执行烹饪操作（返回void，不需要接收返回值）
            recipeService.cookRecipe(familyId, recipeId, mealType);
            
            // 构建成功响应
            Map<String, Object> result = new HashMap<>();
            result.put("familyId", familyId);
            result.put("recipeId", recipeId);
            result.put("mealType", mealType);
            result.put("cookedAt", java.time.LocalDateTime.now().toString());
            
            return ResponseEntity.ok(ResponseBuilder.success("烹饪成功", result));
        } catch (Exception e) {
            return ResponseEntity.ok(ResponseBuilder.error("烹饪失败: " + e.getMessage()));
        }
    }

    /**
     * 获取前一天的用餐记录
     * 用于智能推荐，将前一天的菜谱作为当天的默认推荐
     */
    @GetMapping("/previous-day-records")
    public ResponseEntity<Map<String, Object>> getPreviousDayRecords(
            @RequestParam Long familyId,
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        try {
            List<MealRecord> records = recipeService.getPreviousDayMealRecords(familyId, userId, date);
            
            // 转换为前端需要的格式
            List<Map<String, Object>> result = records.stream()
                .map(record -> {
                    Recipe recipe = recipeRepository.findById(record.getRecipeId())
                        .orElseThrow(() -> new RuntimeException("菜谱不存在: " + record.getRecipeId()));
                    return recipeService.convertMealRecordToRecommendation(record, recipe);
                })
                .collect(Collectors.toList());
                
            return ResponseEntity.ok(ResponseBuilder.success("获取成功", result));
        } catch (Exception e) {
            log.error("获取前一天用餐记录失败", e);
            return ResponseEntity.ok(ResponseBuilder.error("获取失败: " + e.getMessage()));
        }
    }

    /**
     * 获取指定日期的用餐记录
     */
    @GetMapping("/day-records")
    public ResponseEntity<Map<String, Object>> getDayRecords(
            @RequestParam Long familyId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        try {
            List<MealRecord> records = recipeService.getDayMealRecords(familyId, date);
            
            // 转换为前端需要的格式
            List<Map<String, Object>> result = records.stream()
                .map(record -> {
                    // 如果 recipeId 为 null，表示是自定义菜品
                    if (record.getRecipeId() == null) {
                        return recipeService.convertMealRecordToRecommendation(record, null);
                    }
                    Recipe recipe = recipeRepository.findById(record.getRecipeId())
                        .orElseThrow(() -> new RuntimeException("菜谱不存在: " + record.getRecipeId()));
                    return recipeService.convertMealRecordToRecommendation(record, recipe);
                })
                .collect(Collectors.toList());
                
            return ResponseEntity.ok(ResponseBuilder.success("获取成功", result));
        } catch (Exception e) {
            log.error("获取指定日期用餐记录失败", e);
            return ResponseEntity.ok(ResponseBuilder.error("获取失败: " + e.getMessage()));
        }
    }

    /**
     * 保存或更新指定日期的用餐记录
     */
    @PostMapping("/save-meal-record")
    public ResponseEntity<Map<String, Object>> saveMealRecord(
            @RequestParam Long familyId,
            @RequestParam Long userId,
            @RequestParam Long recipeId,
            @RequestParam String mealType,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date,
            @RequestParam(required = false) String dishName) {
        try {
            recipeService.saveMealRecord(familyId, userId, recipeId, mealType, date, dishName);
            return ResponseEntity.ok(ResponseBuilder.success("保存成功", null));
        } catch (Exception e) {
            log.error("保存用餐记录失败", e);
            return ResponseEntity.ok(ResponseBuilder.error("保存失败: " + e.getMessage()));
        }
    }

    /**
     * 删除指定日期的用餐记录
     */
    @DeleteMapping("/delete-meal-record")
    public ResponseEntity<Map<String, Object>> deleteMealRecord(
            @RequestParam Long familyId,
            @RequestParam String mealType,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        try {
            recipeService.deleteMealRecord(familyId, mealType, date);
            return ResponseEntity.ok(ResponseBuilder.success("删除成功", null));
        } catch (Exception e) {
            log.error("删除用餐记录失败", e);
            return ResponseEntity.ok(ResponseBuilder.error("删除失败: " + e.getMessage()));
        }
    }
}