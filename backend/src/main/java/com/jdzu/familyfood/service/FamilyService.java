package com.jdzu.familyfood.service;

import com.jdzu.familyfood.entity.Family;
import com.jdzu.familyfood.entity.User;
import com.jdzu.familyfood.repository.FamilyRepository;
import com.jdzu.familyfood.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FamilyService {
    private final FamilyRepository familyRepository;
    private final UserRepository userRepository;

    @Transactional
    public Family createFamily(Long adminUserId, String familyName) {
        Family family = new Family();
        family.setFamilyCode(generateFamilyCode());
        family.setName(familyName);
        family.setAdminUserId(adminUserId);
        family = familyRepository.save(family);

        User adminUser = userRepository.findById(adminUserId).orElseThrow(() ->
                new RuntimeException("用户不存在"));
        adminUser.setFamilyId(family.getId());
        userRepository.save(adminUser);

        return family;
    }

    @Transactional
    public Family joinFamily(Long userId, String familyCode) {
        Family family = familyRepository.findByFamilyCode(familyCode).orElse(null);
        if (family == null) {
            return null;
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }

        // 如果用户已属于该家庭，直接返回
        if (family.getId().equals(user.getFamilyId())) {
            return family;
        }

        // 如果用户已有家庭，先退出原家庭
        if (user.getFamilyId() != null) {
            leaveFamily(userId, user.getFamilyId());
        }

        user.setFamilyId(family.getId());
        userRepository.save(user);
        return family;
    }

    public List<User> getFamilyMembers(Long familyId) {
        return userRepository.findByFamilyId(familyId);
    }

    public Long getFamilyAdminId(Long familyId) {
        return familyRepository.findById(familyId)
                .map(Family::getAdminUserId)
                .orElse(null);
    }

    // ========== 以下为新增方法 ==========

    /**
     * 根据ID获取家庭信息
     */
    public Family getFamilyById(Long familyId) {
        return familyRepository.findById(familyId).orElse(null);
    }

    /**
     * 获取家庭成员数量
     */
    public int getFamilyMemberCount(Long familyId) {
        return userRepository.countByFamilyId(familyId);
    }

    /**
     * 退出家庭
     */
    @Transactional
    public boolean leaveFamily(Long userId, Long familyId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return false;
        }

        // 如果用户不属于该家庭，直接返回成功（允许退出不属于自己的家庭）
        if (!familyId.equals(user.getFamilyId())) {
            return true;
        }

        user.setFamilyId(null);
        userRepository.save(user);
        return true;
    }

    /**
     * 移除家庭成员（仅管理员可操作）
     */
    @Transactional
    public boolean removeMember(Long familyId, Long memberId) {
        // 检查家庭是否存在
        Family family = familyRepository.findById(familyId).orElse(null);
        if (family == null) {
            return false;
        }

        // 不能移除管理员自己
        if (family.getAdminUserId().equals(memberId)) {
            return false;
        }

        User member = userRepository.findById(memberId).orElse(null);
        if (member == null || !familyId.equals(member.getFamilyId())) {
            return false;
        }

        member.setFamilyId(null);
        userRepository.save(member);
        return true;
    }

    /**
     * 切换当前家庭
     */
    @Transactional
    public boolean switchCurrentFamily(Long userId, Long familyId) {
        // 检查用户是否存在
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return false;
        }

        // 检查目标家庭是否存在
        Family family = familyRepository.findById(familyId).orElse(null);
        if (family == null) {
            return false;
        }

        // 检查用户是否属于该家庭
        if (!familyId.equals(user.getFamilyId())) {
            return false;
        }

        // 更新用户的当前家庭ID
        user.setCurrentFamilyId(familyId);
        userRepository.save(user);
        return true;
    }

    private String generateFamilyCode() {
        String code;
        do {
            code = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (familyRepository.existsByFamilyCode(code));
        return code;
    }
}