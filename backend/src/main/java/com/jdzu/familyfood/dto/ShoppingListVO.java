package com.jdzu.familyfood.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ShoppingListVO {
    private Long id;
    private Long familyId;
    private Long ingredientId;
    private String name;
    private BigDecimal quantity;
    private String unit;
    private Byte priority;
    private Byte status;
    private LocalDateTime createdAt;
}