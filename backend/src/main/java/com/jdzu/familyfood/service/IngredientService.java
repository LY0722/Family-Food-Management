package com.jdzu.familyfood.service;

import com.jdzu.familyfood.entity.Ingredient;
import com.jdzu.familyfood.repository.IngredientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IngredientService {
    private final IngredientRepository ingredientRepository;

    public Ingredient createIngredient(String name, String category, String unit) {
        Ingredient ingredient = new Ingredient();
        ingredient.setName(name);
        ingredient.setCategory(category);
        ingredient.setUnit(unit);
        return ingredientRepository.save(ingredient);
    }

    public List<Ingredient> searchIngredients(String keyword) {
        return ingredientRepository.findByNameContaining(keyword);
    }

    public List<String> getAllCategories() {
        return ingredientRepository.findAllCategories();
    }

    public Ingredient getIngredientByBarcode(String barcode) {
        // 这里应该调用外部API或本地数据库查询条形码对应的食材
        // 暂时返回null，需要根据实际情况实现
        return null;
    }

    public List<Ingredient> getIngredientsByCategory(String category) {
        return List.of();
    }
}