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
     * Skips blank lines and header rows (non-numeric / "rollno" / "roll_no" etc.)
     * Expected CSV format: one roll number per row (first column).
     */
    public List<String> parseRollNumbers(MultipartFile file) {
        List<String> rollNumbers = new ArrayList<>();
        boolean firstRow = true;
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] line;
            while ((line = reader.readNext()) != null) {
                if (line.length == 0 || line[0].isBlank())
                    continue;

                String value = line[0].trim();

                // Skip header row (first row if it looks like a header)
                if (firstRow) {
                    firstRow = false;
                    String lower = value.toLowerCase();
                    if (lower.equals("rollno") || lower.equals("roll_no")
                            || lower.equals("roll no") || lower.equals("rollnumber")
                            || lower.equals("roll number")) {
                        continue; // skip header
                    }
                }

                rollNumbers.add(value);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse CSV file: " + e.getMessage());
        }
        return rollNumbers;
    }
}
