package com.company.CuriousHub.controller;

import com.company.CuriousHub.auth.AuthenticationRequest;
import com.company.CuriousHub.auth.AuthenticationResponse;
import com.company.CuriousHub.auth.AuthenticationService;
import com.company.CuriousHub.auth.RegisterRequest;
import com.company.CuriousHub.auth.RefreshTokenRequest;
import com.company.CuriousHub.config.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthenticationController {

    private final AuthenticationService service;
    private final JwtService jwtService;

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
        try {
            // Validate refresh token
            UserDetails userDetails = service.validateRefreshToken(request.getRefreshToken());

            // Generate new tokens
            String newAccessToken = jwtService.generateToken(userDetails);
            String newRefreshToken = jwtService.generateRefreshToken(userDetails);

            // Build and return the new response with tokens
            return ResponseEntity.ok(
                    AuthenticationResponse.builder()
                            .token(newAccessToken)
                            .refreshToken(newRefreshToken)
                            .role(service.getRole(userDetails.getUsername())) // Adjusted to call getRole correctly
                            .build()
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
