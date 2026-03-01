package com.placement.repository;

import com.placement.entity.Notification;
import com.placement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByStudentOrderByCreatedAtDesc(User student);

    List<Notification> findByStudentId(Long studentId);
}
