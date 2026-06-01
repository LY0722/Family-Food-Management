package com.jdzu.familyfood.service;

import com.jdzu.familyfood.entity.*;
import com.jdzu.familyfood.repository.*;
import javax.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecipeService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(RecipeService.class);
    private final RecipeRepository recipeRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;
    private final InventoryRepository inventoryRepository;
    private final ConsumptionRecordRepository consumptionRecordRepository;
    private final UserRepository userRepository;
    private final MealRecordRepository mealRecordRepository;

    public List<Recipe> recommendRecipes(Long familyId, Long userId) {
        List<String> userHealthTags = getUserHealthTags(userId);
        Map<Long, BigDecimal> availableIngredients = getAvailableIngredients(familyId);
        
        List<Recipe> allRecipes = recipeRepository.findAll();
        Map<Long, List<RecipeIngredient>> ingredientsMap = recipeIngredientRepository.findAll()
            .stream()
            .collect(Collectors.groupingBy(RecipeIngredient::getRecipeId));
        
        LocalDate now = LocalDate.now();
        LocalDate startDate = now.minusDays(30);
        List<ConsumptionRecord> allConsumptionRecords = consumptionRecordRepository
            .findByFamilyIdAndRecordDateBetween(familyId, startDate, now);
        Map<Long, Long> consumptionFrequencyMap = allConsumptionRecords.stream()
            .collect(Collectors.groupingBy(ConsumptionRecord::getIngredientId, Collectors.counting()));

        return allRecipes.stream()
            .map(recipe -> calculateRecipeMatch(recipe, userHealthTags, availableIngredients, ingredientsMap.getOrDefault(recipe.getId(), Collections.emptyList()), familyId, consumptionFrequencyMap))
            .sorted((a, b) -> Double.compare(b.getTotalScore(), a.getTotalScore()))
            .map(RecipeMatch::getRecipe)
            .collect(Collectors.toList());
    }

    public List<Recipe> getRecipesByHealthTags(List<String> healthTags) {
        if (healthTags == null || healthTags.isEmpty()) {
            return recipeRepository.findAll();
        }
        Set<String> tags = healthTags.stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());

        return recipeRepository.findAll().stream()
            .filter(recipe -> !Collections.disjoint(parseHealthTags(recipe.getHealthTags()), tags))
            .collect(Collectors.toList());
    }

    public Recipe getRecipeWithIngredients(Long recipeId) {
        return recipeRepository.findById(recipeId).orElse(null);
    }

    public List<RecipeIngredient> getRecipeIngredients(Long recipeId) {
        return recipeIngredientRepository.findByRecipeId(recipeId);
    }

    @Transactional
    public void cookRecipe(Long familyId, Long recipeId, String mealType) {
        Map<String, Object> canCookResult = canCookRecipe(familyId, recipeId);
        boolean canCook = (boolean) canCookResult.get("canCook");
        if (!canCook) {
            throw new RuntimeException("食材不足，无法制作");
        }

        Map<Long, Inventory> inventoryMap = inventoryRepository.findByFamilyId(familyId).stream()
            .collect(Collectors.toMap(Inventory::getIngredientId, inv -> inv, (a, b) -> a));

        LocalDate now = LocalDate.now();
        List<RecipeIngredient> recipeIngredients = recipeIngredientRepository.findByRecipeId(recipeId); // 移动到方法内部
        
        for (RecipeIngredient required : recipeIngredients) {
            Inventory inv = inventoryMap.get(required.getIngredientId());
            if (inv == null) {
                continue;
            }

            inv.setQuantity(inv.getQuantity().subtract(required.getQuantity()));
            if (inv.getExpiryDate() != null) {
                if (inv.getExpiryDate().isBefore(now)) {
                    inv.setStatus((byte) 3);
                } else if (inv.getExpiryDate().isBefore(now.plusDays(3))) {
                    inv.setStatus((byte) 2);
                } else {
                    inv.setStatus((byte) 1);
                }
            }
            inventoryRepository.save(inv);

            ConsumptionRecord record = new ConsumptionRecord();
            record.setFamilyId(familyId);
            record.setIngredientId(required.getIngredientId());
            record.setQuantity(required.getQuantity());
            record.setRecordDate(now);
            record.setMealType(mealType);
            consumptionRecordRepository.save(record);
        }
    }

    public List<Map<String, Object>> smartRecommendRecipes(Long familyId, Long userId, int limit) {
        return getDateRecommendRecipes(familyId, userId, LocalDate.now(), limit);
    }

    public List<Map<String, Object>> getDateRecommendRecipes(Long familyId, Long userId, LocalDate targetDate, int limit) {
        List<String> userHealthTags = getUserHealthTags(userId);
        Map<Long, BigDecimal> availableIngredients = getAvailableIngredients(familyId);
        
        List<Recipe> allRecipes = recipeRepository.findAll();
        Map<Long, List<RecipeIngredient>> ingredientsMap = recipeIngredientRepository.findAll()
            .stream()
            .collect(Collectors.groupingBy(RecipeIngredient::getRecipeId));
        
        LocalDate now = LocalDate.now();
        LocalDate startDate = now.minusDays(30);
        List<ConsumptionRecord> allConsumptionRecords = consumptionRecordRepository
            .findByFamilyIdAndRecordDateBetween(familyId, startDate, now);
        Map<Long, Long> consumptionFrequencyMap = allConsumptionRecords.stream()
            .collect(Collectors.groupingBy(ConsumptionRecord::getIngredientId, Collectors.counting()));

        List<RecipeMatch> recipeMatches = allRecipes.stream()
            .map(recipe -> calculateRecipeMatch(recipe, userHealthTags, availableIngredients, ingredientsMap.getOrDefault(recipe.getId(), Collections.emptyList()), familyId, consumptionFrequencyMap))
            .sorted((a, b) -> Double.compare(b.getTotalScore(), a.getTotalScore()))
            .limit(limit)
            .collect(Collectors.toList());

        return recipeMatches.stream()
            .map(RecipeMatch::toMap)
            .collect(Collectors.toList());
    }

    private List<String> getUserHealthTags(Long userId) {
        return userRepository.findById(userId)
            .map(User::getHealthTags)
            .map(this::parseHealthTags)
            .orElse(Collections.emptyList());
    }

    private Map<Long, BigDecimal> getAvailableIngredients(Long familyId) {
        return inventoryRepository.findByFamilyId(familyId).stream()
            .filter(inv -> inv.getQuantity().compareTo(BigDecimal.ZERO) > 0)
            .collect(Collectors.toMap(Inventory::getIngredientId, Inventory::getQuantity, BigDecimal::add));
    }

    private List<String> parseHealthTags(String tags) {
        if (tags == null || tags.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String trimmed = tags.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            trimmed = trimmed.substring(1, trimmed.length() - 1);
        }

        return Arrays.stream(trimmed.split(","))
            .map(String::trim)
            .map(s -> s.replaceAll("^\"|\"$", ""))
            .filter(s -> !s.isEmpty())
            .collect(Collectors.toList());
    }

    private RecipeMatch calculateRecipeMatch(Recipe recipe, List<String> userHealthTags,
                                             Map<Long, BigDecimal> availableIngredients, List<RecipeIngredient> recipeIngredients, Long familyId, Map<Long, Long> consumptionFrequencyMap) {
        RecipeMatch match = new RecipeMatch(recipe);

        double inventoryScore = calculateInventoryMatch(recipeIngredients, availableIngredients, match);
        match.setInventoryScore(inventoryScore);

        double healthScore = calculateHealthMatch(recipe, userHealthTags);
        match.setHealthScore(healthScore);

        double smartScore = calculateSmartScore(recipe, availableIngredients, recipeIngredients, familyId, consumptionFrequencyMap);
        match.setSmartScore(smartScore);

        match.setTotalScore(inventoryScore * 0.4 + healthScore * 0.3 + smartScore * 0.3);

        return match;
    }

    private double calculateInventoryMatch(List<RecipeIngredient> recipeIngredients,
                                           Map<Long, BigDecimal> availableIngredients, RecipeMatch match) {
        if (recipeIngredients.isEmpty()) {
            return 0.0;
        }

        int totalIngredients = recipeIngredients.size();
        int availableCount = 0;
        int sufficientCount = 0;
        boolean hasMissing = false;

        for (RecipeIngredient required : recipeIngredients) {
            BigDecimal available = availableIngredients.get(required.getIngredientId());
            if (available != null) {
                availableCount++;
                if (available.compareTo(required.getQuantity()) >= 0) {
                    sufficientCount++;
                } else {
                    hasMissing = true;
                    match.getReasons().add("食材不足，id=" + required.getIngredientId());
                }
            } else {
                hasMissing = true;
                match.getReasons().add("缺少食材，id=" + required.getIngredientId());
            }
        }

        match.setHasMissingIngredients(hasMissing);

        double availabilityScore = (double) availableCount / totalIngredients;
        double sufficiencyScore = (double) sufficientCount / totalIngredients;

        return availabilityScore * 0.7 + sufficiencyScore * 0.3;
    }

    private double calculateHealthMatch(Recipe recipe, List<String> userHealthTags) {
        if (userHealthTags.isEmpty() || recipe.getHealthTags() == null) {
            return 0.5;
        }

        List<String> recipeHealthTags = parseHealthTags(recipe.getHealthTags());
        if (recipeHealthTags.isEmpty()) {
            return 0.5;
        }

        long matchedTags = recipeHealthTags.stream()
            .filter(userHealthTags::contains)
            .count();

        return (double) matchedTags / recipeHealthTags.size();
    }

    private double calculateSmartScore(Recipe recipe, Map<Long, BigDecimal> availableIngredients, List<RecipeIngredient> recipeIngredients, Long familyId, Map<Long, Long> consumptionFrequencyMap) {
        double score = 0.0;

        double expiringScore = calculateExpiringIngredientScore(recipeIngredients, familyId);
        score += expiringScore * 0.4;

        double frequencyScore = calculateConsumptionFrequencyScore(recipeIngredients, consumptionFrequencyMap);
        score += frequencyScore * 0.3;

        double difficultyScore = Math.max(0, 1.0 - (recipe.getDifficulty() - 1) * 0.25);
        score += difficultyScore * 0.3;

        return score;
    }
    public Map<String, Object> canCookRecipe(Long familyId, Long recipeId) {
        Recipe recipe = recipeRepository.findById(recipeId).orElse(null);
        if (recipe == null) {
            throw new RuntimeException("食谱不存在");
        }

        List<RecipeIngredient> ingredients = recipeIngredientRepository.findByRecipeId(recipeId);
        List<Inventory> inventory = inventoryRepository.findByFamilyId(familyId);

        Map<String, Object> result = new HashMap<>();
        result.put("recipeId", recipeId);
        result.put("recipeName", recipe.getName());
        result.put("canCook", true);
        result.put("missingIngredients", new ArrayList<>());
        result.put("availableIngredients", new ArrayList<>());

        List<Map<String, Object>> missing = new ArrayList<>();
        List<Map<String, Object>> available = new ArrayList<>();

        for (RecipeIngredient ingredient : ingredients) {
            boolean found = false;
            for (Inventory inv : inventory) {
                if (inv.getIngredientId().equals(ingredient.getIngredientId()) &&
                        inv.getQuantity().compareTo(ingredient.getQuantity()) >= 0) {
                    available.add(Map.of(
                            "ingredientId", ingredient.getIngredientId(),
                            "name", inv.getIngredientName(),
                            "required", ingredient.getQuantity(),
                            "available", inv.getQuantity()
                    ));
                    found = true;
                    break;
                }
            }

            if (!found) {
                String ingredientName = "未知食材";
                if (ingredient.getIngredient() != null) {
                    ingredientName = ingredient.getIngredient().getName();
                }
                
                missing.add(Map.of(
                        "ingredientId", ingredient.getIngredientId(),
                        "name", ingredientName,
                        "required", ingredient.getQuantity()
                ));
            }
        }

        result.put("canCook", missing.isEmpty());
        result.put("missingIngredients", missing);
        result.put("availableIngredients", available);

        return result;
    }

    // 新增：获取前一天的用餐记录
    public List<MealRecord> getPreviousDayMealRecords(Long familyId, Long userId, LocalDate date) {
        LocalDate yesterday = date.minusDays(1);
        return mealRecordRepository.findByFamilyIdAndUserIdAndMealDate(familyId, userId, yesterday);
    }

    // 新增：获取指定日期的用餐记录
    public List<MealRecord> getDayMealRecords(Long familyId, LocalDate date) {
        return mealRecordRepository.findByFamilyIdAndMealDateOrderByMealType(familyId, date);
    }

    // 新增：保存或更新用餐记录
    @Transactional
    public void saveMealRecord(Long familyId, Long userId, Long recipeId, String mealType, LocalDate date, String dishName) {
        // 先删除该日期该餐类型的旧记录
        mealRecordRepository.findByFamilyIdAndMealDate(familyId, date).stream()
            .filter(record -> record.getMealType().equals(mealType))
            .forEach(record -> mealRecordRepository.delete(record));
        
        // 创建新记录
        MealRecord record = new MealRecord();
        record.setFamilyId(familyId);
        record.setUserId(userId);
        record.setMealType(mealType);
        record.setMealDate(date);
        
        // 如果 recipeId 为 0 或 null，表示是自定义菜品
        if (recipeId == null || recipeId == 0) {
            record.setRecipeId(null);
            record.setNotes(dishName != null ? dishName : "自定义菜品");
        } else {
            record.setRecipeId(recipeId);
        }
        
        mealRecordRepository.save(record);
    }

    // 新增：删除用餐记录
    @Transactional
    public void deleteMealRecord(Long familyId, String mealType, LocalDate date) {
        mealRecordRepository.findByFamilyIdAndMealDate(familyId, date).stream()
            .filter(record -> record.getMealType().equals(mealType))
            .forEach(record -> mealRecordRepository.delete(record));
    }

    // 新增：将MealRecord转换为前端需要的格式
    public Map<String, Object> convertMealRecordToRecommendation(MealRecord record, Recipe recipe) {
        // 如果 recipeId 为 null，表示是自定义菜品，使用 notes 字段
        if (record.getRecipeId() == null) {
            return Map.of(
                "mealType", record.getMealType(),
                "id", 0,
                "name", record.getNotes() != null ? record.getNotes() : "自定义菜品",
                "description", "自定义菜品",
                "cover", ""
            );
        }
        
        return Map.of(
            "mealType", record.getMealType(),
            "id", recipe.getId(),
            "name", recipe.getName(),
            "description", recipe.getDescription(),
            "cover", recipe.getImageUrl()
        );
    }

    private double calculateExpiringIngredientScore(List<RecipeIngredient> recipeIngredients, Long familyId) {
        LocalDate now = LocalDate.now();
        LocalDate endDate = now.plusDays(3);
        List<Inventory> expiringItems = inventoryRepository.findExpiringItems(familyId, now, endDate);
        Set<Long> expiringIngredientIds = expiringItems.stream()
            .map(Inventory::getIngredientId)
            .collect(Collectors.toSet());

        if (recipeIngredients.isEmpty()) {
            return 0.5;
        }

        long matched = recipeIngredients.stream()
            .map(RecipeIngredient::getIngredientId)
            .filter(expiringIngredientIds::contains)
            .count();

        return Math.min(1.0, 0.5 + (double) matched / recipeIngredients.size() * 0.5);
    }

    private double calculateConsumptionFrequencyScore(List<RecipeIngredient> recipeIngredients, Map<Long, Long> consumptionFrequencyMap) {
        if (recipeIngredients.isEmpty()) {
            return 0.5;
        }

        double totalScore = 0.0;
        for (RecipeIngredient required : recipeIngredients) {
            Long frequency = consumptionFrequencyMap.getOrDefault(required.getIngredientId(), 0L);
            double score = Math.min(1.0, frequency / 5.0);
            totalScore += score;
        }

        return Math.min(1.0, totalScore / recipeIngredients.size());
    }

    public static class RecipeMatch {
        private Recipe recipe;
        private double inventoryScore;
        private double healthScore;
        private double smartScore;
        private double totalScore;
        private List<String> reasons;
        private boolean hasMissingIngredients;

        public RecipeMatch(Recipe recipe) {
            this.recipe = recipe;
            this.reasons = new ArrayList<>();
            this.hasMissingIngredients = false;
        }

        public Recipe getRecipe() {
            return recipe;
        }

        public void setRecipe(Recipe recipe) {
            this.recipe = recipe;
        }

        public double getInventoryScore() {
            return inventoryScore;
        }

        public void setInventoryScore(double inventoryScore) {
            this.inventoryScore = inventoryScore;
        }

        public double getHealthScore() {
            return healthScore;
        }

        public void setHealthScore(double healthScore) {
            this.healthScore = healthScore;
        }

        public double getSmartScore() {
            return smartScore;
        }

        public void setSmartScore(double smartScore) {
            this.smartScore = smartScore;
        }

        public double getTotalScore() {
            return totalScore;
        }

        public void setTotalScore(double totalScore) {
            this.totalScore = totalScore;
        }

        public List<String> getReasons() {
            return reasons;
        }

        public void setReasons(List<String> reasons) {
            this.reasons = reasons;
        }

        public boolean isHasMissingIngredients() {
            return hasMissingIngredients;
        }

        public void setHasMissingIngredients(boolean hasMissingIngredients) {
            this.hasMissingIngredients = hasMissingIngredients;
        }

        public Map<String, Object> toMap() {
            Map<String, Object> map = new HashMap<>();
            map.put("id", recipe.getId());
            map.put("name", recipe.getName());
            map.put("description", recipe.getDescription());
            map.put("imageUrl", recipe.getImageUrl());
            map.put("healthTags", recipe.getHealthTags());
            map.put("difficulty", recipe.getDifficulty());
            map.put("cookingTime", recipe.getCookingTime());
            map.put("matchScore", totalScore);
            map.put("inventoryScore", inventoryScore);
            map.put("healthScore", healthScore);
            map.put("smartScore", smartScore);
            map.put("reasons", reasons);
            map.put("hasMissingIngredients", hasMissingIngredients);
            return map;
        }
    }
}