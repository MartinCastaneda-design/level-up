package com.example.LevelUpGamer.controller;

import com.example.LevelUpGamer.model.Producto;
import com.example.LevelUpGamer.repository.ProductoRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
        if (categoria != null && !categoria.trim().isEmpty() && !categoria.equalsIgnoreCase("Todas")) {
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
    @Operation(summary = "Crear producto", description = "Agrega un nuevo producto al catálogo (requiere ROLE_ADMIN)")
    public ResponseEntity<Producto> crear(@RequestBody Producto producto) {
        if (producto.getId() == null || producto.getId().trim().isEmpty()) {
            producto.setId("PROD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (producto.getCategoriaSlug() == null && producto.getCategoria() != null) {
            producto.setCategoriaSlug(producto.getCategoria().toLowerCase().replace(" ", "-"));
        }
        Producto guardado = productoRepository.save(producto);
        return ResponseEntity.status(201).body(guardado);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar producto", description = "Modifica un producto existente (requiere ROLE_ADMIN)")
    public ResponseEntity<Producto> actualizar(@PathVariable String id, @RequestBody Producto actualizado) {
        return productoRepository.findById(id)
                .map(p -> {
                    p.setNombre(actualizado.getNombre());
                    p.setCategoria(actualizado.getCategoria());
                    p.setCategoriaSlug(actualizado.getCategoriaSlug());
                    p.setPrecio(actualizado.getPrecio());
                    p.setImagen(actualizado.getImagen());
                    p.setStock(actualizado.getStock());
                    p.setDestacado(actualizado.getDestacado());
                    p.setEnOferta(actualizado.getEnOferta());
                    p.setDescuento(actualizado.getDescuento());
                    p.setDescripcionCorta(actualizado.getDescripcionCorta());
                    p.setDescripcionLarga(actualizado.getDescripcionLarga());
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
