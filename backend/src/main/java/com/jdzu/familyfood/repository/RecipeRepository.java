//菜谱操作，支持健康标签、难度和烹饪时间筛选
package com.jdzu.familyfood.repository;

import com.jdzu.familyfood.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    List<Recipe> findByNameContaining(String name);

    @Query("SELECT r FROM Recipe r WHERE r.healthTags LIKE %:healthTag%")
    List<Recipe> findByHealthTag(@Param("healthTag") String healthTag);

    @Query("SELECT r FROM Recipe r WHERE r.difficulty <= :maxDifficulty")
    List<Recipe> findByMaxDifficulty(@Param("maxDifficulty") Byte maxDifficulty);

    @Query("SELECT r FROM Recipe r WHERE r.cookingTime <= :maxCookingTime")
    List<Recipe> findByMaxCookingTime(@Param("maxCookingTime") Integer maxCookingTime);
}