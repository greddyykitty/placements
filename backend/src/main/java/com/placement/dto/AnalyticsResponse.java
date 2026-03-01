package com.placement.dto;

import lombok.*;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AnalyticsResponse {
    private String label;
    private Map<String, Object> data;
    private String imageUrl;
}
