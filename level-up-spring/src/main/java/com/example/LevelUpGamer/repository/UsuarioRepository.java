package com.example.LevelUpGamer.repository;

import com.example.LevelUpGamer.model.Usuario;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsername(String username);
    Optional<Usuario> findByCorreo(String correo);
    Optional<Usuario> findByUsernameOrCorreo(String username, String correo);
    boolean existsByUsername(String username);
    boolean existsByCorreo(String correo);

    long countByRol(String rol);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM Usuario u WHERE u.id = :id")
    Optional<Usuario> findByIdForUpdate(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM Usuario u WHERE u.username = :username OR u.correo = :username")
    Optional<Usuario> findByUsernameOrCorreoForUpdate(@Param("username") String username);
}
