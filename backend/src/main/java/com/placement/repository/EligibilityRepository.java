package com.placement.repository;

import com.placement.entity.DriveEligibility;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EligibilityRepository extends JpaRepository<DriveEligibility, Long> {
    List<DriveEligibility> findByRollNo(String rollNo);

    List<DriveEligibility> findByDriveId(Long driveId);

    boolean existsByDriveIdAndRollNo(Long driveId, String rollNo);
}
