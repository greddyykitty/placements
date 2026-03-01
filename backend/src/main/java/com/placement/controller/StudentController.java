package com.placement.controller;

import com.placement.entity.*;
import com.placement.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/drives")
    public ResponseEntity<List<Drive>> getEligibleDrives(Authentication auth) {
        return ResponseEntity.ok(studentService.getEligibleDrives(auth.getName()));
    }

    @PostMapping("/apply/{driveId}")
    public ResponseEntity<Application> apply(@PathVariable Long driveId, Authentication auth) {
        return ResponseEntity.ok(studentService.apply(auth.getName(), driveId));
    }

    @GetMapping("/applications")
    public ResponseEntity<List<Application>> getMyApplications(Authentication auth) {
        return ResponseEntity.ok(studentService.getMyApplications(auth.getName()));
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getMyNotifications(Authentication auth) {
        return ResponseEntity.ok(studentService.getMyNotifications(auth.getName()));
    }
}
