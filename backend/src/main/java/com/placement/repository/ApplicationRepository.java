package com.placement.repository;

import com.placement.entity.Application;
import com.placement.entity.User;
import com.placement.entity.Drive;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudent(User student);

    List<Application> findByDrive(Drive drive);

    List<Application> findByStudentId(Long studentId);

    boolean existsByStudentAndDrive(User student, Drive drive);

    Optional<Application> findByStudentAndDrive(User student, Drive drive);
}
