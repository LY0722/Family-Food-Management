package com.jdzu.familyfood.dto;

import lombok.Data;
import com.jdzu.familyfood.entity.User;
import java.time.LocalDateTime;

@Data
public class UserLoginVO {
    private Long userId;
    private String openid;
    private String nickname;
    private String avatarUrl;
    private Long familyId;
    private String familyCode;
    private String token;
    private LocalDateTime loginTime;

    public static UserLoginVO fromUser(User user, String token, String familyCode) {
        UserLoginVO vo = new UserLoginVO();
        vo.setUserId(user.getId());
        vo.setOpenid(user.getOpenid());
        vo.setNickname(user.getNickname());
        vo.setAvatarUrl(user.getAvatarUrl());
        vo.setFamilyId(user.getFamilyId());
        vo.setFamilyCode(familyCode);
        vo.setToken(token);
        vo.setLoginTime(LocalDateTime.now());
        return vo;
    }
}