package com.placement.service;

import com.placement.dto.DriveRequest;
import com.placement.entity.*;
import com.placement.exception.CustomException;
import com.placement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final CompanyRepository companyRepository;
    private final DriveRepository driveRepository;
    private final ApplicationRepository applicationRepository;
    private final EligibilityRepository eligibilityRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final CsvService csvService;

    public Company addCompany(Company company) {
        return companyRepository.save(company);
    }

    public Drive createDrive(DriveRequest request) {
        Company company = companyRepository.findByNameIgnoreCase(request.getCompanyName())
                .orElseThrow(() -> new CustomException("Company not found: " + request.getCompanyName(),
                        HttpStatus.NOT_FOUND));

        Drive.DriveStatus status = Drive.DriveStatus.OPEN;
        if (request.getStatus() != null) {
            try {
                status = Drive.DriveStatus.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }

        Drive drive = Drive.builder()
                .company(company)
                .driveDate(request.getDriveDate())
                .status(status)
                .build();

        return driveRepository.save(drive);
    }

    public Map<String, Object> uploadEligibility(String companyName, String driveDate, MultipartFile file) {
        Company company = companyRepository.findByNameIgnoreCase(companyName)
                .orElseThrow(() -> new CustomException("Company not found: " + companyName, HttpStatus.NOT_FOUND));

        LocalDate date = LocalDate.parse(driveDate);
        Drive drive = driveRepository.findByCompanyAndDriveDate(company, date)
                .orElseThrow(() -> new CustomException(
                        "No drive found for '" + companyName + "' on " + driveDate, HttpStatus.NOT_FOUND));

        List<String> rollNumbers = csvService.parseRollNumbers(file);
        int count = 0;

        for (String rollNo : rollNumbers) {
            if (!eligibilityRepository.existsByDriveIdAndRollNo(drive.getId(), rollNo)) {
                DriveEligibility eligibility = DriveEligibility.builder()
                        .drive(drive)
                        .rollNo(rollNo)
                        .build();
                eligibilityRepository.save(eligibility);
                count++;

                // Send notification to eligible student
                userRepository.findByRollNo(rollNo).ifPresent(student -> {
                    Notification notification = Notification.builder()
                            .student(student)
                            .drive(drive)
                            .message("You are eligible for drive: " + drive.getCompany().getName() + " on "
                                    + drive.getDriveDate())
                            .status(Notification.NotificationStatus.UNREAD)
                            .build();
                    notificationRepository.save(notification);
                });
            }
        }

        return Map.of("message", "Eligibility uploaded", "recordsAdded", count, "totalRollNumbers", rollNumbers.size());
    }

    public Application updateApplicationStatus(Long applicationId, String status) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new CustomException("Application not found", HttpStatus.NOT_FOUND));

        try {
            application.setStatus(Application.ApplicationStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new CustomException("Invalid status value. Must be APPLIED, ONGOING, REJECTED, or SELECTED");
        }

        Application updated = applicationRepository.save(application);

        // Notify the student
        Notification notification = Notification.builder()
                .student(updated.getStudent())
                .drive(updated.getDrive())
                .message("Your application status for " + updated.getDrive().getCompany().getName()
                        + " has been updated to: " + updated.getStatus())
                .status(Notification.NotificationStatus.UNREAD)
                .build();
        notificationRepository.save(notification);

        return updated;
    }

    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    public List<Application> getApplicationsByDrive(String companyName, String driveDate) {
        Company company = companyRepository.findByNameIgnoreCase(companyName)
                .orElseThrow(() -> new CustomException("Company not found: " + companyName, HttpStatus.NOT_FOUND));

        LocalDate date = LocalDate.parse(driveDate);
        Drive drive = driveRepository.findByCompanyAndDriveDate(company, date)
                .orElseThrow(() -> new CustomException(
                        "No drive found for '" + companyName + "' on " + driveDate, HttpStatus.NOT_FOUND));

        return applicationRepository.findByDrive(drive);
    }

    public List<Application> getApplicationsByStudent(Long studentId) {
        return applicationRepository.findByStudentId(studentId);
    }
}
