package com.example.LevelUpGamer.repository;

import com.example.LevelUpGamer.model.RefreshToken;
import com.example.LevelUpGamer.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);
    void deleteByUsuario(Usuario usuario);
}
