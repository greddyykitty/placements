package com.placement.service;

import com.placement.entity.*;
import com.placement.exception.CustomException;
import com.placement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final DriveRepository driveRepository;

    @Value("${analytics.base-url}")
    private String analyticsBaseUrl;

    public String getBranchGraphUrl(String branch) {
        return analyticsBaseUrl + "/branch-graph/" + branch;
    }

    public String getCompanyGraphUrl(Long companyId) {
        return analyticsBaseUrl + "/company-graph/" + companyId;
    }

    public String getStudentGraphUrl(String rollNo) {
        return analyticsBaseUrl + "/student-graph/" + rollNo;
    }

    public Map<String, Object> getStudentAnalytics(String rollNo) {
        User student = userRepository.findByRollNo(rollNo)
                .orElseThrow(() -> new CustomException("Student not found with roll no: " + rollNo));

        List<Application> applications = applicationRepository.findByStudent(student);

        Map<String, Long> statusCounts = applications.stream()
                .collect(Collectors.groupingBy(a -> a.getStatus().name(), Collectors.counting()));

        return Map.of(
                "rollNo", rollNo,
                "studentName", student.getName(),
                "totalApplications", applications.size(),
                "statusBreakdown", statusCounts,
                "graphUrl", getStudentGraphUrl(rollNo));
    }

    public Map<String, Object> getBranchAnalytics(String branch) {
        List<User> branchStudents = userRepository.findAll().stream()
                .filter(u -> branch.equalsIgnoreCase(u.getBranch()) && u.getRole() == User.Role.STUDENT)
                .collect(Collectors.toList());

        long selected = branchStudents.stream()
                .flatMap(s -> applicationRepository.findByStudent(s).stream())
                .filter(a -> a.getStatus() == Application.ApplicationStatus.SELECTED)
                .count();

        return Map.of(
                "branch", branch,
                "totalStudents", branchStudents.size(),
                "selected", selected,
                "graphUrl", getBranchGraphUrl(branch));
    }

    public Map<String, Object> getCompanyAnalytics(Long companyId) {
        List<Drive> drives = driveRepository.findByCompanyId(companyId);
        List<Application> applications = drives.stream()
                .flatMap(d -> applicationRepository.findByDrive(d).stream())
                .collect(Collectors.toList());

        Map<String, Long> statusCounts = applications.stream()
                .collect(Collectors.groupingBy(a -> a.getStatus().name(), Collectors.counting()));

        return Map.of(
                "companyId", companyId,
                "totalDrives", drives.size(),
                "totalApplications", applications.size(),
                "statusBreakdown", statusCounts,
                "graphUrl", getCompanyGraphUrl(companyId));
    }
}
