package com.placement.service;

import com.opencsv.CSVReader;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Service
public class CsvService {

    /**
     * Parse a CSV file and return a list of roll numbers.
     * Expected CSV format: one roll number per row (first column).
     */
    public List<String> parseRollNumbers(MultipartFile file) {
        List<String> rollNumbers = new ArrayList<>();
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] line;
            while ((line = reader.readNext()) != null) {
                if (line.length > 0 && !line[0].isBlank()) {
                    rollNumbers.add(line[0].trim());
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse CSV file: " + e.getMessage());
        }
        return rollNumbers;
    }
}
