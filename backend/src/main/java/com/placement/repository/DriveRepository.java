package com.placement.repository;

import com.placement.entity.Drive;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DriveRepository extends JpaRepository<Drive, Long> {
    List<Drive> findByStatus(Drive.DriveStatus status);

    List<Drive> findByCompanyId(Long companyId);
}
