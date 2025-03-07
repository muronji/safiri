package com.example.safiri;

import com.example.safiri.dto.AcknowledgeResponse;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SafiriApplication {

	public static void main(String[] args) {
		SpringApplication.run(SafiriApplication.class, args);
	}

	@Bean
	public AcknowledgeResponse getAcknowledgeResponse() {
		AcknowledgeResponse acknowledgeResponse = new AcknowledgeResponse();
		acknowledgeResponse.setMessage("Success");
		return new AcknowledgeResponse();
	}

}
