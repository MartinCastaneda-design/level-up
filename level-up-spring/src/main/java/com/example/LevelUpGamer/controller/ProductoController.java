package com.example.LevelUpGamer.controller;

import com.example.LevelUpGamer.dto.ProductoDto;
import com.example.LevelUpGamer.model.Producto;
import com.example.LevelUpGamer.repository.ProductoRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/productos")
@Tag(name = "Productos", description = "Operaciones CRUD sobre el catálogo gamer")
public class ProductoController {

    private final ProductoRepository productoRepository;

    public ProductoController(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @GetMapping
    @Operation(summary = "Listar catálogo", description = "Obtiene todos los productos o filtra por categoría")
    public List<Producto> listar(@RequestParam(required = false) String categoria) {
        if (categoria != null && !categoria.trim().isEmpty() && !categoria.equalsIgnoreCase("Todas") && !categoria.equalsIgnoreCase("todos")) {
            return productoRepository.findByCategoriaSlug(categoria.toLowerCase());
        }
        return productoRepository.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de producto", description = "Obtiene los detalles de un producto por su identificador")
    public ResponseEntity<Producto> obtenerPorId(@PathVariable String id) {
        return productoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Crear producto", description = "Agrega un nuevo producto al catálogo con validación (requiere ROLE_ADMIN)")
    public ResponseEntity<Producto> crear(@Valid @RequestBody ProductoDto dto) {
        String prodId = (dto.getId() != null && !dto.getId().trim().isEmpty())
                ? dto.getId().trim()
                : "PROD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        if (productoRepository.existsById(prodId)) {
            return ResponseEntity.status(409).build();
        }

        String catSlug = dto.getCategoriaSlug();
        if (catSlug == null || catSlug.trim().isEmpty()) {
            catSlug = dto.getCategoria().toLowerCase().replace(" ", "-");
        }

        Producto nuevo = Producto.builder()
                .id(prodId)
                .nombre(dto.getNombre().trim())
                .categoria(dto.getCategoria().trim())
                .categoriaSlug(catSlug)
                .precio(dto.getPrecio())
                .stock(dto.getStock())
                .imagen(dto.getImagen() != null ? dto.getImagen() : "/img/productos/default.jpg")
                .destacado(Boolean.TRUE.equals(dto.getDestacado()))
                .enOferta(Boolean.TRUE.equals(dto.getEnOferta()))
                .descuento(dto.getDescuento() != null ? dto.getDescuento() : 0)
                .descripcionCorta(dto.getDescripcionCorta())
                .descripcionLarga(dto.getDescripcionLarga())
                .rating(5.0)
                .numReviews(0)
                .build();

        Producto guardado = productoRepository.save(nuevo);
        return ResponseEntity.status(201).body(guardado);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar producto", description = "Modifica un producto existente con validación (requiere ROLE_ADMIN)")
    public ResponseEntity<Producto> actualizar(@PathVariable String id, @Valid @RequestBody ProductoDto dto) {
        return productoRepository.findById(id)
                .map(p -> {
                    p.setNombre(dto.getNombre().trim());
                    p.setCategoria(dto.getCategoria().trim());
                    String catSlug = dto.getCategoriaSlug();
                    if (catSlug == null || catSlug.trim().isEmpty()) {
                        catSlug = dto.getCategoria().toLowerCase().replace(" ", "-");
                    }
                    p.setCategoriaSlug(catSlug);
                    p.setPrecio(dto.getPrecio());
                    p.setStock(dto.getStock());
                    if (dto.getImagen() != null) p.setImagen(dto.getImagen());
                    p.setDestacado(Boolean.TRUE.equals(dto.getDestacado()));
                    p.setEnOferta(Boolean.TRUE.equals(dto.getEnOferta()));
                    p.setDescuento(dto.getDescuento() != null ? dto.getDescuento() : 0);
                    if (dto.getDescripcionCorta() != null) p.setDescripcionCorta(dto.getDescripcionCorta());
                    if (dto.getDescripcionLarga() != null) p.setDescripcionLarga(dto.getDescripcionLarga());
                    return ResponseEntity.ok(productoRepository.save(p));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar producto", description = "Elimina un producto del catálogo (requiere ROLE_ADMIN)")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        if (productoRepository.existsById(id)) {
            productoRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
