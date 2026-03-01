package com.placement.repository;

import com.placement.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByNameIgnoreCase(String name);

    List<Company> findByNameContainingIgnoreCase(String name);
}
