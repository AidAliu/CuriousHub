package com.company.CuriousHub.controller;

import com.company.CuriousHub.auth.AuthenticationRequest;
import com.company.CuriousHub.auth.AuthenticationResponse;
import com.company.CuriousHub.auth.AuthenticationService;
import com.company.CuriousHub.auth.RegisterRequest;
import com.company.CuriousHub.auth.RefreshTokenRequest;
import com.company.CuriousHub.config.JwtService; // Import JwtService
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthenticationController {

    private final AuthenticationService service;
    private final JwtService jwtService; // Inject JwtService

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        var userDetails = service.validateRefreshToken(request.getRefreshToken());
        var jwtToken = jwtService.generateToken(userDetails);

        return ResponseEntity.ok(AuthenticationResponse.builder()
                .token(jwtToken)
                .refreshToken(request.getRefreshToken())
                .role(userDetails.getAuthorities().iterator().next().getAuthority())
                .build());
    }
}
