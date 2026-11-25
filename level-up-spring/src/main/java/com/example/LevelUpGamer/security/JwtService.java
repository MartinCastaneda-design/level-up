package com.example.LevelUpGamer.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationTime;
    private final long refreshExpirationTime;

    public JwtService(
            @Value("${jwt.secret}") String secretString,
            @Value("${jwt.expiration:900000}") long expirationTime,
            @Value("${jwt.refresh-expiration:604800000}") long refreshExpirationTime) {
        if (secretString == null || secretString.trim().isEmpty()) {
            throw new IllegalArgumentException("JWT_SECRET no está configurada o está vacía. Debe proporcionarse una clave de al menos 256 bits (32 bytes).");
        }
        byte[] keyBytes;
        try {
            byte[] decoded = Base64.getDecoder().decode(secretString.trim());
            if (decoded.length >= 32) {
                keyBytes = decoded;
            } else {
                keyBytes = secretString.getBytes(StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            keyBytes = secretString.getBytes(StandardCharsets.UTF_8);
        }

        if (keyBytes.length < 32) {
            throw new IllegalArgumentException("La clave JWT debe tener al menos 256 bits (32 bytes). Longitud actual: " + keyBytes.length + " bytes.");
        }
        if (expirationTime <= 0) {
            throw new IllegalArgumentException("JWT_EXPIRATION debe ser un valor positivo.");
        }

        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationTime = expirationTime;
        this.refreshExpirationTime = refreshExpirationTime > 0 ? refreshExpirationTime : 604800000;
    }

    public String generateToken(String username, String rol) {
        return Jwts.builder()
                .subject(username)
                .claim("rol", rol)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(secretKey)
                .compact();
    }

    public long getExpirationTime() {
        return expirationTime;
    }

    public long getRefreshExpirationTime() {
        return refreshExpirationTime;
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public String extractRol(String token) {
        return extractClaims(token).get("rol", String.class);
    }

    public boolean validateToken(String token, String username) {
        try {
            String tokenUsername = extractUsername(token);
            return (tokenUsername.equals(username) && !isTokenExpired(token));
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
