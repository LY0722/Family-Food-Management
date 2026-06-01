//家庭相关操作，包括根据家庭码查找
package com.jdzu.familyfood.repository;

import com.jdzu.familyfood.entity.Family;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface FamilyRepository extends JpaRepository<Family, Long> {
    Optional<Family> findByFamilyCode(String familyCode);

    boolean existsByFamilyCode(String familyCode);

}