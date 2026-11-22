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
import java.util.HashMap;
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
    @Operation(summary = "Crear nueva orden y boleta (Checkout)", description = "Valida inventario, recalcula precios oficiales en servidor y descuenta stock atómicamente")
    public ResponseEntity<?> crearOrden(@RequestBody Map<String, Object> payload, Authentication auth) {
        Usuario usuario = usuarioRepository.findByUsernameOrCorreo(auth.getName(), auth.getName()).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Usuario no encontrado"));
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) payload.get("items");
        if (items == null || items.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "La orden debe contener al menos un producto"));
        }

        // 1. Fase de Validación estricta en memoria SIN tocar ni modificar entidades todavía
        int subtotalCalculado = 0;
        List<DetalleBoleta> detalles = new ArrayList<>();
        Map<String, Integer> cantidadesAgrupadas = new HashMap<>();

        for (Map<String, Object> item : items) {
            String prodId = String.valueOf(item.get("id"));
            Number cantNum = (Number) item.get("cantidad");
            if (cantNum == null || cantNum.intValue() <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cantidad inválida para el producto ID: " + prodId));
            }
            cantidadesAgrupadas.put(prodId, cantidadesAgrupadas.getOrDefault(prodId, 0) + cantNum.intValue());
        }

        List<Producto> productosAfectados = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : cantidadesAgrupadas.entrySet()) {
            String prodId = entry.getKey();
            int cantidadTotal = entry.getValue();

            Producto prod = productoRepository.findById(prodId).orElse(null);
            if (prod == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Producto no encontrado: " + prodId));
            }

            int stockActual = prod.getStock() != null ? prod.getStock() : 0;
            if (stockActual < cantidadTotal) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                        "error", "Stock insuficiente para el producto: " + prod.getNombre() + " (Disponible: " + stockActual + ", Solicitado: " + cantidadTotal + ")"
                ));
            }
            productosAfectados.add(prod);
        }

        // Construir detalles con precio oficial de base de datos
        for (Map<String, Object> item : items) {
            String prodId = String.valueOf(item.get("id"));
            int cantidad = ((Number) item.get("cantidad")).intValue();
            Producto prod = productosAfectados.stream().filter(p -> p.getId().equals(prodId)).findFirst().get();

            int precioOficial = prod.getPrecio() != null ? prod.getPrecio() : 0;
            int itemSubtotal = precioOficial * cantidad;
            subtotalCalculado += itemSubtotal;

            DetalleBoleta det = DetalleBoleta.builder()
                    .producto(prod)
                    .cantidad(cantidad)
                    .precioUnitario(precioOficial)
                    .subtotal(itemSubtotal)
                    .build();
            detalles.add(det);
        }

        // 2. Validación de Cupón de Descuento (P0-05)
        String codigoCupon = payload.get("codigoCupon") != null ? String.valueOf(payload.get("codigoCupon")).trim().toUpperCase() : null;
        int descuentoCupon = 0;
        if (codigoCupon != null && !codigoCupon.isEmpty()) {
            if ("ESTUDIANTE20".equals(codigoCupon)) {
                // Requiere correo Duoc UC o beneficiario
                boolean esDuoc = usuario.getCorreo() != null && usuario.getCorreo().toLowerCase().endsWith("@duocuc.cl");
                if (esDuoc) {
                    descuentoCupon = (int) Math.round(subtotalCalculado * 0.20);
                } else {
                    return ResponseEntity.badRequest().body(Map.of("error", "El cupón ESTUDIANTE20 es exclusivo para correos @duocuc.cl"));
                }
            } else if ("LEVELUP10".equals(codigoCupon)) {
                descuentoCupon = (int) Math.round(subtotalCalculado * 0.10);
            } else if ("PROMO20".equals(codigoCupon)) {
                descuentoCupon = (int) Math.round(subtotalCalculado * 0.20);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Cupón no válido o expirado"));
            }
        }

        // 3. Validación de Puntos LevelUp canjeados
        int puntosActuales = usuario.getPuntosLevelUp() != null ? usuario.getPuntosLevelUp() : 0;
        int puntosUsados = payload.get("puntosUsados") != null ? Math.max(0, ((Number) payload.get("puntosUsados")).intValue()) : 0;

        if (puntosUsados > puntosActuales) {
            return ResponseEntity.badRequest().body(Map.of("error", "No tienes suficientes puntos LevelUp (Disponibles: " + puntosActuales + ")"));
        }

        // Descuento por puntos (1 punto = $10 CLP)
        int descuentoPuntos = puntosUsados * 10;
        int descuentoTotal = descuentoCupon + descuentoPuntos;
        int totalCalculado = Math.max(0, subtotalCalculado - descuentoTotal);

        // Puntos ganados: 1 punto por cada $100 CLP efectivamente pagados
        int puntosGanados = totalCalculado / 100;

        // 4. FASE DE APLICACIÓN ATÓMICA (solo tras superar todas las validaciones)
        for (Producto prod : productosAfectados) {
            int cantTotal = cantidadesAgrupadas.get(prod.getId());
            prod.setStock(prod.getStock() - cantTotal);
        }
        productoRepository.saveAll(productosAfectados);

        usuario.setPuntosLevelUp(puntosActuales - puntosUsados + puntosGanados);
        usuarioRepository.save(usuario);

        String numeroOrden = "#LVL-" + (int)(10000 + Math.random() * 90000);
        String metodoPago = (String) payload.getOrDefault("metodoPago", "Webpay Plus");
        String direccion = (String) payload.getOrDefault("direccion", "Sin dirección");
        String comuna = (String) payload.getOrDefault("comuna", "");
        String region = (String) payload.getOrDefault("region", "");
        String telefono = (String) payload.getOrDefault("telefono", "");

        Boleta boleta = Boleta.builder()
                .numeroOrden(numeroOrden)
                .fecha(LocalDateTime.now())
                .total(totalCalculado)
                .subtotal(subtotalCalculado)
                .descuento(descuentoTotal)
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

        for (DetalleBoleta det : detalles) {
            det.setBoleta(boleta);
            boleta.getDetalles().add(det);
        }

        Boleta guardada = boletaRepository.save(boleta);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
    }
}
