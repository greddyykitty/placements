package com.placement.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class DriveRequest {
    private String companyName;
    private LocalDate driveDate;
    private String status;
}
