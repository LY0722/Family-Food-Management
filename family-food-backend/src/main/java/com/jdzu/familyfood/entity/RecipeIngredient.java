package com.jdzu.familyfood.entity;

import javax.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "recipe_ingredient")
@Data
public class RecipeIngredient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recipe_id", nullable = false)
    private Long recipeId;

    @Column(name = "ingredient_id", nullable = false)
    private Long ingredientId;

    @Column(name = "quantity", precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(name = "unit", length = 20)
    private String unit;

    public Recipe getIngredient() {
        return null;
    }
}