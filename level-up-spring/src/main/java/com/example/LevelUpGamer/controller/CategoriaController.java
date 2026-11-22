package com.example.LevelUpGamer.controller;

import com.example.LevelUpGamer.dto.CategoriaDto;
import com.example.LevelUpGamer.model.Categoria;
import com.example.LevelUpGamer.repository.CategoriaRepository;
import com.example.LevelUpGamer.repository.ProductoRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categorias")
@Tag(name = "Categorías", description = "Endpoints para consultar y administrar categorías de productos")
public class CategoriaController {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    public CategoriaController(CategoriaRepository categoriaRepository, ProductoRepository productoRepository) {
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
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
    public ResponseEntity<?> crear(@Valid @RequestBody CategoriaDto dto) {
        String slug = (dto.getSlug() != null && !dto.getSlug().trim().isEmpty())
                ? dto.getSlug().trim().toLowerCase().replace(" ", "-")
                : dto.getNombre().toLowerCase().trim().replace(" ", "-");

        if (categoriaRepository.existsBySlug(slug)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Ya existe una categoría con ese slug"));
        }

        Categoria categoria = Categoria.builder()
                .nombre(dto.getNombre().trim())
                .slug(slug)
                .descripcion(dto.getDescripcion())
                .icono(dto.getIcono() != null ? dto.getIcono() : "bi-tag")
                .build();

        Categoria guardada = categoriaRepository.save(categoria);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar categoría existente", description = "Solo Administrador")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @Valid @RequestBody CategoriaDto dto) {
        return categoriaRepository.findById(id).map(cat -> {
            String slug = (dto.getSlug() != null && !dto.getSlug().trim().isEmpty())
                    ? dto.getSlug().trim().toLowerCase().replace(" ", "-")
                    : dto.getNombre().toLowerCase().trim().replace(" ", "-");

            if (!cat.getSlug().equalsIgnoreCase(slug) && categoriaRepository.existsBySlug(slug)) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Ya existe otra categoría con ese slug"));
            }

            cat.setNombre(dto.getNombre().trim());
            cat.setSlug(slug);
            cat.setDescripcion(dto.getDescripcion());
            cat.setIcono(dto.getIcono());
            return ResponseEntity.ok((Object) categoriaRepository.save(cat));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar categoría", description = "Solo Administrador")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        Categoria cat = categoriaRepository.findById(id).orElse(null);
        if (cat == null) {
            return ResponseEntity.notFound().build();
        }

        // Impedir eliminar si hay productos asociados a esta categoría
        if (!productoRepository.findByCategoriaSlug(cat.getSlug()).isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "No se puede eliminar la categoría porque tiene productos asociados en el catálogo"));
        }

        categoriaRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("mensaje", "Categoría eliminada con éxito"));
    }
}
