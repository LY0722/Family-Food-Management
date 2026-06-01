//用户相关操作，包括根据openid查找、根据familyId查找家庭成员
// package: com.jdzu.familyfood.repository

package com.jdzu.familyfood.repository;

import com.jdzu.familyfood.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByOpenid(String openid);
    User findByPhone(String phone);
    int countByFamilyId(Long familyId);

    List<User> findByFamilyId(Long familyId);

    @Query("SELECT u FROM User u WHERE u.familyId = :familyId AND u.id != :userId")
    List<User> findOtherUsersInFamily(@Param("familyId") Long familyId, @Param("userId") Long userId);

    User findByPhoneAndPassword(String phone, String password);
}