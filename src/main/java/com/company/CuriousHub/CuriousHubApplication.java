package com.company.CuriousHub;


import com.company.CuriousHub.user.User;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@SpringBootApplication
@RestController
public class CuriousHubApplication {

	public static void main(String[] args) {
		SpringApplication.run(CuriousHubApplication.class, args);


	}
	@GetMapping
	public List<User> hello() {
		return List.of(new User(1L, "AlbertEinstein","relativity299792458","einstein@gmail.com"));
	}

}
