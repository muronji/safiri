package com.example.safiri.service;

import com.example.safiri.dto.CustomerResponse;
import com.example.safiri.model.User;
import com.example.safiri.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileWriter;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
@Slf4j
public class ReportService {

    private final CustomerService customerService;

    public byte[] generateCustomerReport() throws Exception {

        // In your service method
        try {
            // Create a minimal valid JRXML content
            String minimalXml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                    "<jasperReport xmlns=\"http://jasperreports.sourceforge.net/jasperreports\"\n" +
                    "              xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n" +
                    "              xsi:schemaLocation=\"http://jasperreports.sourceforge.net/jasperreports\n" +
                    "              http://jasperreports.sourceforge.net/xsd/jasperreport.xsd\"\n" +
                    "              name=\"Simple\" pageWidth=\"595\" pageHeight=\"842\" columnWidth=\"555\"\n" +
                    "              leftMargin=\"20\" rightMargin=\"20\" topMargin=\"20\" bottomMargin=\"20\">\n" +
                    "    <field name=\"id\" class=\"java.lang.Long\"/>\n" +
                    "    <field name=\"firstName\" class=\"java.lang.String\"/>\n" +
                    "    <detail>\n" +
                    "        <band height=\"20\">\n" +
                    "            <textField>\n" +
                    "                <reportElement x=\"0\" y=\"0\" width=\"100\" height=\"20\"/>\n" +
                    "                <textFieldExpression><![CDATA[$F{id}]]></textFieldExpression>\n" +
                    "            </textField>\n" +
                    "        </band>\n" +
                    "    </detail>\n" +
                    "</jasperReport>";

            // Write to temporary file
            File tempFile = File.createTempFile("TempReport", ".jrxml");
            FileWriter writer = new FileWriter(tempFile);
            writer.write(minimalXml);
            writer.close();

            log.info("Created minimal test file at: {}", tempFile.getAbsolutePath());

            // Compile from this temporary file
            JasperReport compiledReport = JasperCompileManager.compileReport(new FileInputStream(tempFile));

            // If we get here, basic compilation works
            log.info("Successfully compiled minimal report");

            log.info("Generating customer report...");

            List<CustomerResponse> customers = customerService.getAllCustomers();
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(customers);

            // Update the path to match your directory structure
            Resource reportResource = new ClassPathResource("reports/CustomerReport.jrxml");

            log.info("Report file exists: {}", reportResource.exists());
            log.info("Report file path: {}", reportResource.getFile().getAbsolutePath());

            // Add debug log to verify file existence
            if (!reportResource.exists()) {
                log.error("Report template file not found at path: reports/CustomerReport.jrxml");
                throw new FileNotFoundException("Report template not found");
            }

            InputStream reportStream = reportResource.getInputStream();
            JasperReport jasperReport = JasperCompileManager.compileReport(reportStream);

            Map<String, Object> parameters = new HashMap<>();
            parameters.put("createdBy", "Safiri System");

            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);
            return JasperExportManager.exportReportToPdf(jasperPrint);
        } catch (Exception e) {
            log.error("Error generating customer report: {}", e.getMessage(), e);  // Log with stack trace
            throw new Exception("Error generating customer report: " + e.getMessage());
        }
    }
}