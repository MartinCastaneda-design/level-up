package com.example.LevelUpGamer.service;

import com.example.LevelUpGamer.model.RefreshToken;
import com.example.LevelUpGamer.model.Usuario;
import com.example.LevelUpGamer.repository.RefreshTokenRepository;
import com.example.LevelUpGamer.security.JwtService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, JwtService jwtService) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
    }

    public String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 no disponible", e);
        }
    }

    @Transactional
    public String createRefreshToken(Usuario usuario) {
        String rawToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        String hash = hashToken(rawToken);

        long expMillis = jwtService.getRefreshExpirationTime();
        LocalDateTime expiresAt = LocalDateTime.now().plusNanos(expMillis * 1_000_000);

        RefreshToken refreshToken = RefreshToken.builder()
                .usuario(usuario)
                .tokenHash(hash)
                .fechaCreacion(LocalDateTime.now())
                .fechaExpiracion(expiresAt)
                .build();

        refreshTokenRepository.save(refreshToken);
        return rawToken;
    }

    @Transactional
    public Optional<RefreshToken> verifyAndRotate(String rawToken, String[] newRawTokenHolder) {
        String hash = hashToken(rawToken);
        // Bloqueo pesimista para evitar que peticiones concurrentes roten el mismo token dos veces
        Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByTokenHashForUpdate(hash);

        if (tokenOpt.isEmpty()) {
            return Optional.empty();
        }

        RefreshToken token = tokenOpt.get();

        if (token.isRevoked() || token.isExpired()) {
            return Optional.empty();
        }

        // Rotar token: marcar actual como revocado y registrar reemplazo
        token.setFechaRevocacion(LocalDateTime.now());

        String newRawToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        String newHash = hashToken(newRawToken);
        token.setReplacedByTokenHash(newHash);
        refreshTokenRepository.save(token);

        long expMillis = jwtService.getRefreshExpirationTime();
        LocalDateTime expiresAt = LocalDateTime.now().plusNanos(expMillis * 1_000_000);

        RefreshToken nextToken = RefreshToken.builder()
                .usuario(token.getUsuario())
                .tokenHash(newHash)
                .fechaCreacion(LocalDateTime.now())
                .fechaExpiracion(expiresAt)
                .build();

        refreshTokenRepository.save(nextToken);
        newRawTokenHolder[0] = newRawToken;

        return Optional.of(token);
    }

    @Transactional
    public void revokeToken(String rawToken) {
        if (rawToken == null || rawToken.trim().isEmpty()) return;
        String hash = hashToken(rawToken);
        refreshTokenRepository.findByTokenHashForUpdate(hash).ifPresent(token -> {
            token.setFechaRevocacion(LocalDateTime.now());
            refreshTokenRepository.save(token);
        });
    }

    @Transactional
    public void revokeAllByUsuario(Usuario usuario) {
        if (usuario != null) {
            refreshTokenRepository.revokeAllByUsuario(usuario, LocalDateTime.now());
        }
    }
}
