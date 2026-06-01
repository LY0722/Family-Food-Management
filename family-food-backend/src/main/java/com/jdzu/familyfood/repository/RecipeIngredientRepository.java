//菜谱食材关系操作，支持批量查询食材需求
package com.jdzu.familyfood.repository;

import com.jdzu.familyfood.entity.RecipeIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredient, Long> {
    List<RecipeIngredient> findByRecipeId(Long recipeId);

    @Query("SELECT ri.ingredientId, SUM(ri.quantity) FROM RecipeIngredient ri " +
            "WHERE ri.recipeId IN :recipeIds GROUP BY ri.ingredientId")
    List<Object[]> getIngredientRequirements(@Param("recipeIds") List<Long> recipeIds);

    @Query("SELECT ri FROM RecipeIngredient ri WHERE ri.recipeId = :recipeId AND ri.ingredientId = :ingredientId")
    RecipeIngredient findByRecipeIdAndIngredientId(@Param("recipeId") Long recipeId,
                                                   @Param("ingredientId") Long ingredientId);
}