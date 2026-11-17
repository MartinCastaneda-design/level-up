package com.example.LevelUpGamer.controller;

import com.example.LevelUpGamer.model.Boleta;
import com.example.LevelUpGamer.model.DetalleBoleta;
import com.example.LevelUpGamer.model.Producto;
import com.example.LevelUpGamer.model.Usuario;
import com.example.LevelUpGamer.repository.BoletaRepository;
import com.example.LevelUpGamer.repository.ProductoRepository;
import com.example.LevelUpGamer.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ordenes")
@CrossOrigin(origins = "*")
@Tag(name = "Órdenes y Boletas", description = "Endpoints de compra, emisión de boletas e historial")
@SecurityRequirement(name = "bearerAuth")
public class BoletaController {

    private final BoletaRepository boletaRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    public BoletaController(BoletaRepository boletaRepository,
                            ProductoRepository productoRepository,
                            UsuarioRepository usuarioRepository) {
        this.boletaRepository = boletaRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    @Operation(summary = "Listar todas las órdenes/boletas", description = "Accesible para Administrador y Vendedor")
    public ResponseEntity<List<Boleta>> listarTodas() {
        return ResponseEntity.ok(boletaRepository.findAllByOrderByFechaDesc());
    }

    @GetMapping("/mis-compras")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Ver historial de compras del usuario autenticado", description = "Cliente, Vendedor o Admin")
    public ResponseEntity<?> misCompras(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Usuario usuario = usuarioRepository.findByUsernameOrCorreo(auth.getName(), auth.getName()).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Usuario no encontrado"));
        }
        return ResponseEntity.ok(boletaRepository.findByUsuarioOrderByFechaDesc(usuario));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener detalle de boleta por ID", description = "Cliente (suya), Vendedor o Admin")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id, Authentication auth) {
        return boletaRepository.findById(id).map(boleta -> {
            boolean esAdminOVendedor = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_VENDEDOR"));
            boolean esDuenio = boleta.getUsuario().getUsername().equalsIgnoreCase(auth.getName())
                    || (boleta.getUsuario().getCorreo() != null && boleta.getUsuario().getCorreo().equalsIgnoreCase(auth.getName()));

            if (!esAdminOVendedor && !esDuenio) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "No tienes permiso para ver esta orden"));
            }
            return ResponseEntity.ok(boleta);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Transactional
    @Operation(summary = "Crear nueva orden y boleta (Checkout)", description = "Descuenta stock y acredita puntos LevelUp")
    public ResponseEntity<?> crearOrden(@RequestBody Map<String, Object> payload, Authentication auth) {
        Usuario usuario = usuarioRepository.findByUsernameOrCorreo(auth.getName(), auth.getName()).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Usuario no encontrado"));
        }

        String numeroOrden = "#LVL-" + (int)(10000 + Math.random() * 90000);
        Integer total = payload.get("total") != null ? ((Number) payload.get("total")).intValue() : 0;
        Integer subtotal = payload.get("subtotal") != null ? ((Number) payload.get("subtotal")).intValue() : total;
        Integer descuento = payload.get("descuento") != null ? ((Number) payload.get("descuento")).intValue() : 0;
        String metodoPago = (String) payload.getOrDefault("metodoPago", "Webpay Plus");

        String direccion = (String) payload.getOrDefault("direccion", "Sin dirección");
        String comuna = (String) payload.getOrDefault("comuna", "");
        String region = (String) payload.getOrDefault("region", "");
        String telefono = (String) payload.getOrDefault("telefono", "");

        int puntosGanados = total / 100; // 1 punto por cada $100 gastados
        int puntosUsados = payload.get("puntosUsados") != null ? ((Number) payload.get("puntosUsados")).intValue() : 0;

        // Actualizar puntos del usuario
        int puntosActuales = usuario.getPuntosLevelUp() != null ? usuario.getPuntosLevelUp() : 0;
        if (puntosUsados > 0) {
            puntosActuales = Math.max(0, puntosActuales - puntosUsados);
        }
        puntosActuales += puntosGanados;
        usuario.setPuntosLevelUp(puntosActuales);
        usuarioRepository.save(usuario);

        Boleta boleta = Boleta.builder()
                .numeroOrden(numeroOrden)
                .fecha(LocalDateTime.now())
                .total(total)
                .subtotal(subtotal)
                .descuento(descuento)
                .metodoPago(metodoPago)
                .estado("Completada")
                .direccionDespacho(direccion)
                .comuna(comuna)
                .region(region)
                .telefono(telefono)
                .puntosGanados(puntosGanados)
                .puntosUsados(puntosUsados)
                .usuario(usuario)
                .detalles(new ArrayList<>())
                .build();

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) payload.get("items");
        if (items != null) {
            for (Map<String, Object> item : items) {
                String prodId = String.valueOf(item.get("id"));
                int cantidad = ((Number) item.get("cantidad")).intValue();
                int precioUnitario = ((Number) item.get("precio")).intValue();

                Producto prod = productoRepository.findById(prodId).orElse(null);
                if (prod != null) {
                    // Descontar stock
                    if (prod.getStock() != null) {
                        prod.setStock(Math.max(0, prod.getStock() - cantidad));
                        productoRepository.save(prod);
                    }
                }

                DetalleBoleta det = DetalleBoleta.builder()
                        .boleta(boleta)
                        .producto(prod)
                        .cantidad(cantidad)
                        .precioUnitario(precioUnitario)
                        .subtotal(cantidad * precioUnitario)
                        .build();

                boleta.getDetalles().add(det);
            }
        }

        Boleta guardada = boletaRepository.save(boleta);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
    }
}
