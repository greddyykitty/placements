package com.placement.controller;

import com.placement.dto.DriveRequest;
import com.placement.entity.*;
import com.placement.service.AdminService;
import com.placement.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final AnalyticsService analyticsService;

    @PostMapping("/company")
    public ResponseEntity<Company> addCompany(@RequestBody Company company) {
        return ResponseEntity.ok(adminService.addCompany(company));
    }

    @PostMapping("/drive")
    public ResponseEntity<Drive> createDrive(@RequestBody DriveRequest request) {
        return ResponseEntity.ok(adminService.createDrive(request));
    }

    @PostMapping("/upload-eligibility")
    public ResponseEntity<Map<String, Object>> uploadEligibility(
            @RequestParam String companyName,
            @RequestParam String driveDate,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(adminService.uploadEligibility(companyName, driveDate, file));
    }

    @PutMapping("/application/{id}")
    public ResponseEntity<Application> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(adminService.updateApplicationStatus(id, status));
    }

    @GetMapping("/applications")
    public ResponseEntity<List<Application>> getAllApplications() {
        return ResponseEntity.ok(adminService.getAllApplications());
    }

    @GetMapping("/analytics/student/{rollNo}")
    public ResponseEntity<Map<String, Object>> getStudentAnalytics(@PathVariable String rollNo) {
        return ResponseEntity.ok(analyticsService.getStudentAnalytics(rollNo));
    }

    @GetMapping("/analytics/branch/{branch}")
    public ResponseEntity<Map<String, Object>> getBranchAnalytics(@PathVariable String branch) {
        return ResponseEntity.ok(analyticsService.getBranchAnalytics(branch));
    }

    @GetMapping("/analytics/company/{companyName}")
    public ResponseEntity<Map<String, Object>> getCompanyAnalytics(@PathVariable String companyName) {
        return ResponseEntity.ok(analyticsService.getCompanyAnalytics(companyName));
    }
}
