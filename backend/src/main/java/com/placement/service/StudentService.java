package com.placement.service;

import com.placement.entity.*;
import com.placement.exception.CustomException;
import com.placement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final UserRepository userRepository;
    private final DriveRepository driveRepository;
    private final ApplicationRepository applicationRepository;
    private final EligibilityRepository eligibilityRepository;
    private final NotificationRepository notificationRepository;

    public List<Drive> getEligibleDrives(String email) {
        User student = getUserByEmail(email);
        String rollNo = student.getRollNo();

        List<DriveEligibility> eligibilities = eligibilityRepository.findByRollNo(rollNo);
        List<Long> driveIds = eligibilities.stream()
                .map(e -> e.getDrive().getId())
                .collect(Collectors.toList());

        return driveRepository.findAll().stream()
                .filter(d -> driveIds.contains(d.getId()) && d.getStatus() == Drive.DriveStatus.OPEN)
                .collect(Collectors.toList());
    }

    public Application apply(String email, Long driveId) {
        User student = getUserByEmail(email);
        Drive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new CustomException("Drive not found", HttpStatus.NOT_FOUND));

        if (drive.getStatus() != Drive.DriveStatus.OPEN) {
            throw new CustomException("Drive is not open for applications");
        }

        String rollNo = student.getRollNo();
        if (rollNo == null || !eligibilityRepository.existsByDriveIdAndRollNo(driveId, rollNo)) {
            throw new CustomException("You are not eligible for this drive", HttpStatus.FORBIDDEN);
        }

        if (applicationRepository.existsByStudentAndDrive(student, drive)) {
            throw new CustomException("You have already applied to this drive", HttpStatus.CONFLICT);
        }

        Application application = Application.builder()
                .student(student)
                .drive(drive)
                .status(Application.ApplicationStatus.APPLIED)
                .attended(false)
                .build();

        return applicationRepository.save(application);
    }

    public List<Application> getMyApplications(String email) {
        User student = getUserByEmail(email);
        return applicationRepository.findByStudent(student);
    }

    public List<Notification> getMyNotifications(String email) {
        User student = getUserByEmail(email);
        return notificationRepository.findByStudentOrderByCreatedAtDesc(student);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
    }
}
