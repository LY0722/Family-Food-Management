package com.jdzu.familyfood.entity;

import javax.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "family")
@Data
public class Family {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "family_code", unique = true, nullable = false, length = 20)
    private String familyCode;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "admin_user_id")
    private Long adminUserId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}