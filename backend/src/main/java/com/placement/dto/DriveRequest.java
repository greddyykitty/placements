package com.placement.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class DriveRequest {
    private Long companyId;
    private LocalDate driveDate;
    private String status;
}
