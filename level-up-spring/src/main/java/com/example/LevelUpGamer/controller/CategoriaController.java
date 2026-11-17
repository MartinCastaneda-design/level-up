package com.example.LevelUpGamer.controller;

import com.example.LevelUpGamer.model.Categoria;
import com.example.LevelUpGamer.repository.CategoriaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "*")
@Tag(name = "Categorías", description = "Endpoints para consultar y administrar categorías de productos")
public class CategoriaController {

    private final CategoriaRepository categoriaRepository;

    public CategoriaController(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping
    @Operation(summary = "Listar todas las categorías", description = "Acceso público")
    public ResponseEntity<List<Categoria>> listarTodas() {
        return ResponseEntity.ok(categoriaRepository.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener categoría por ID", description = "Acceso público")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        return categoriaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Obtener categoría por Slug", description = "Acceso público")
    public ResponseEntity<?> obtenerPorSlug(@PathVariable String slug) {
        return categoriaRepository.findBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear nueva categoría", description = "Solo Administrador")
    public ResponseEntity<?> crear(@RequestBody Categoria categoria) {
        if (categoria.getSlug() == null || categoria.getSlug().isBlank()) {
            categoria.setSlug(categoria.getNombre().toLowerCase().trim().replace(" ", "-"));
        }
        if (categoriaRepository.existsBySlug(categoria.getSlug())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ya existe una categoría con ese slug"));
        }
        Categoria guardada = categoriaRepository.save(categoria);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar categoría existente", description = "Solo Administrador")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Categoria nueva) {
        return categoriaRepository.findById(id).map(cat -> {
            cat.setNombre(nueva.getNombre());
            cat.setSlug(nueva.getSlug());
            cat.setDescripcion(nueva.getDescripcion());
            cat.setIcono(nueva.getIcono());
            return ResponseEntity.ok(categoriaRepository.save(cat));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar categoría", description = "Solo Administrador")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        if (!categoriaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        categoriaRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("mensaje", "Categoría eliminada con éxito"));
    }
}
