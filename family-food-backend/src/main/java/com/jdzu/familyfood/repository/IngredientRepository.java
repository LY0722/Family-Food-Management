//食材基础信息操作，支持按名称搜索和分类查询
package com.jdzu.familyfood.repository;

import com.jdzu.familyfood.entity.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {
    List<Ingredient> findByNameContaining(String name);

    List<Ingredient> findByCategory(String category);

    @Query("SELECT DISTINCT category FROM Ingredient WHERE category IS NOT NULL")
    List<String> findAllCategories();
}