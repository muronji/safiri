package com.example.safiri.controller;

import com.example.safiri.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @GetMapping("/customers/pdf")
    public ResponseEntity<byte[]> downloadCustomerReport() {
        try {
            // Ensure user is authenticated
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).build(); // Unauthorized
            }

            byte[] pdf = reportService.generateCustomerReport();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "customer_report.pdf");

            return ResponseEntity.ok().headers(headers).body(pdf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
