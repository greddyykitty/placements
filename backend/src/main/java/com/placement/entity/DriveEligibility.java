package com.placement.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "drive_eligibility")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriveEligibility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drive_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Drive drive;

    @Column(name = "roll_no", nullable = false)
    private String rollNo;
}
