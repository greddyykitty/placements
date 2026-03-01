package com.placement.service;

import com.placement.config.JwtUtil;
import com.placement.dto.LoginRequest;
import com.placement.dto.RegisterRequest;
import com.placement.entity.User;
import com.placement.exception.CustomException;
import com.placement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public Map<String, Object> register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException("Email already registered", HttpStatus.CONFLICT);
        }

        User.Role role;
        try {
            role = User.Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new CustomException("Invalid role. Must be ADMIN or STUDENT");
        }

        User user = User.builder()
                .rollNo(request.getRollNo())
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .branch(request.getBranch())
                .build();

        User saved = userRepository.save(user);
        return Map.of(
                "message", "User registered successfully",
                "userId", saved.getId(),
                "role", saved.getRole().name());
    }

    public Map<String, Object> login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return Map.of(
                "token", token,
                "role", user.getRole().name(),
                "name", user.getName(),
                "email", user.getEmail(),
                "id", user.getId(),
                "branch", user.getBranch() != null ? user.getBranch() : "",
                "rollNo", user.getRollNo() != null ? user.getRollNo() : "");
    }
}
