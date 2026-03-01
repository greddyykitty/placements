package com.placement.repository;

import com.placement.entity.Company;
import com.placement.entity.Drive;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DriveRepository extends JpaRepository<Drive, Long> {
    List<Drive> findByStatus(Drive.DriveStatus status);

    List<Drive> findByCompanyId(Long companyId);

    Optional<Drive> findByCompanyAndDriveDate(Company company, LocalDate driveDate);
}
