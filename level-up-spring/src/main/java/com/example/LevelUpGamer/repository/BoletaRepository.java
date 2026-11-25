package com.example.LevelUpGamer.repository;

import com.example.LevelUpGamer.model.Boleta;
import com.example.LevelUpGamer.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoletaRepository extends JpaRepository<Boleta, Long> {
    List<Boleta> findByUsuarioOrderByFechaDesc(Usuario usuario);
    List<Boleta> findAllByOrderByFechaDesc();
    Optional<Boleta> findByNumeroOrden(String numeroOrden);
}
