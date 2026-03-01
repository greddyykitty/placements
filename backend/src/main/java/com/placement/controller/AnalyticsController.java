package com.placement.controller;

import com.placement.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class AnalyticsController {

    @Value("${analytics.base-url}")
    private String analyticsBaseUrl;

    /**
     * Proxy analytics PNG from Python service so frontend doesn't need to call it
     * directly.
     */
    @GetMapping("/branch/{branch}")
    public ResponseEntity<byte[]> branchGraph(@PathVariable String branch) {
        return fetchImage(analyticsBaseUrl + "/branch-graph/" + branch);
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<byte[]> companyGraph(@PathVariable Long companyId) {
        return fetchImage(analyticsBaseUrl + "/company-graph/" + companyId);
    }

    @GetMapping("/student/{rollNo}")
    public ResponseEntity<byte[]> studentGraph(@PathVariable String rollNo) {
        return fetchImage(analyticsBaseUrl + "/student-graph/" + rollNo);
    }

    private ResponseEntity<byte[]> fetchImage(String url) {
        try {
            RestTemplate rest = new RestTemplate();
            ResponseEntity<byte[]> response = rest.exchange(url, HttpMethod.GET, null, byte[].class);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .body(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
    }
}
