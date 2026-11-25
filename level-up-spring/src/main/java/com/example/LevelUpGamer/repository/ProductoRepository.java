package com.example.LevelUpGamer.repository;

import com.example.LevelUpGamer.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, String> {
    List<Producto> findByCategoriaSlug(String categoriaSlug);
    List<Producto> findByDestacadoTrue();
    List<Producto> findByEnOfertaTrue();
}
