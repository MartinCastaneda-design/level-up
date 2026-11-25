package com.example.LevelUpGamer.repository;

import com.example.LevelUpGamer.model.RefreshToken;
import com.example.LevelUpGamer.model.Usuario;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM RefreshToken r WHERE r.tokenHash = :tokenHash")
    Optional<RefreshToken> findByTokenHashForUpdate(@Param("tokenHash") String tokenHash);

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.fechaRevocacion = :now WHERE r.usuario = :usuario AND r.fechaRevocacion IS NULL")
    void revokeAllByUsuario(@Param("usuario") Usuario usuario, @Param("now") LocalDateTime now);

    void deleteByUsuario(Usuario usuario);
}
