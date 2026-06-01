package com.jdzu.familyfood.entity;

import javax.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "`user`")  // MySQL关键字需要用反引号
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "openid", unique = true, nullable = false, length = 100)
    private String openid;

    @Column(name = "nickname", length = 100)
    private String nickname;

    @Column(name = "phone")
    private String phone;

    @Column(name = "password", length = 100)
    private String password;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "family_id")
    private Long familyId;

    @Column(name = "current_family_id")
    private Long currentFamilyId;

    @Column(name = "health_tags", columnDefinition = "json")
    private String healthTags;

    @Column(name = "notification_settings", columnDefinition = "json")
    private String notificationSettings;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }



}