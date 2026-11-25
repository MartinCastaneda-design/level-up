package com.example.LevelUpGamer.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens", indexes = {
    @Index(name = "idx_token_hash", columnList = "tokenHash", unique = true)
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 128)
    private String tokenHash;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false)
    private LocalDateTime fechaExpiracion;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaRevocacion;

    private String replacedByTokenHash;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.fechaExpiracion);
    }

    public boolean isRevoked() {
        return this.fechaRevocacion != null;
    }
}
