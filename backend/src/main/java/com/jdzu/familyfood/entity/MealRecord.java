// 文件路径：d:\AAAcode\Finally\family-food-backend\src\main\java\com\jdzu\familyfood\entity\MealRecord.java
package com.jdzu.familyfood.entity;

import javax.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "meal_record")
@Data
public class MealRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "family_id", nullable = false)
    private Long familyId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "recipe_id")
    private Long recipeId;

    @Column(name = "meal_type", nullable = false, length = 20)
    private String mealType;

    @Column(name = "meal_date", nullable = false)
    private LocalDate mealDate;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (mealDate == null) {
            mealDate = LocalDate.now();
        }
    }
}