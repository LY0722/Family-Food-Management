package com.jdzu.familyfood.controller;

import com.jdzu.familyfood.entity.Ingredient;
import com.jdzu.familyfood.service.IngredientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ingredient")
@RequiredArgsConstructor
public class IngredientController {
    private final IngredientService ingredientService;

    /**
     * 搜索食材
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchIngredients(
            @RequestParam String keyword) {
        List<Ingredient> ingredients = ingredientService.searchIngredients(keyword);

        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "搜索成功");
        response.put("data", ingredients);
        return ResponseEntity.ok(response);
    }

    /**
     * 获取所有分类
     */
    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getAllCategories() {
        List<String> categories = ingredientService.getAllCategories();

        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "获取成功");
        response.put("data", categories);
        return ResponseEntity.ok(response);
    }

    /**
     * 创建食材
     */
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createIngredient(
            @RequestBody Map<String, String> request) {
        String name = request.get("name");
        String category = request.get("category");
        String unit = request.get("unit");

        Ingredient ingredient = ingredientService.createIngredient(name, category, unit);

        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "创建成功");
        response.put("data", ingredient);
        return ResponseEntity.ok(response);
    }

    /**
     * 扫码添加食材
     */
    @PostMapping("/scan")
    public ResponseEntity<Map<String, Object>> scanBarcode(
            @RequestBody Map<String, String> request) {
        String barcode = request.get("barcode");

        Ingredient ingredient = ingredientService.getIngredientByBarcode(barcode);

        Map<String, Object> response = new HashMap<>();
        if (ingredient != null) {
            response.put("code", 200);
            response.put("message", "识别成功");
            response.put("data", ingredient);
        } else {
            response.put("code", 404);
            response.put("message", "未找到对应的食材信息");
        }
        return ResponseEntity.ok(response);
    }
}