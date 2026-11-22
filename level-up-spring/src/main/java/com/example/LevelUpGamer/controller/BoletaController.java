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

        // 1. Validar productos, cantidades positivas y stock disponible antes de cualquier descuento
        int subtotalCalculado = 0;
        List<DetalleBoleta> detalles = new ArrayList<>();
        List<Producto> productosAActualizar = new ArrayList<>();

        for (Map<String, Object> item : items) {
            String prodId = String.valueOf(item.get("id"));
            Number cantNum = (Number) item.get("cantidad");
            if (cantNum == null || cantNum.intValue() <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cantidad inválida para el producto ID: " + prodId));
            }
            int cantidad = cantNum.intValue();

            Producto prod = productoRepository.findById(prodId).orElse(null);
            if (prod == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Producto no encontrado: " + prodId));
            }

            int stockActual = prod.getStock() != null ? prod.getStock() : 0;
            if (stockActual < cantidad) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                        "error", "Stock insuficiente para el producto: " + prod.getNombre() + " (Disponible: " + stockActual + ", Solicitado: " + cantidad + ")"
                ));
            }

            // Precio oficial tomado directamente de la base de datos (seguridad H-02)
            int precioOficial = prod.getPrecio() != null ? prod.getPrecio() : 0;
            int itemSubtotal = precioOficial * cantidad;
            subtotalCalculado += itemSubtotal;

            prod.setStock(stockActual - cantidad);
            productosAActualizar.add(prod);

            DetalleBoleta det = DetalleBoleta.builder()
                    .producto(prod)
                    .cantidad(cantidad)
                    .precioUnitario(precioOficial)
                    .subtotal(itemSubtotal)
                    .build();
            detalles.add(det);
        }

        // 2. Validar puntos usados contra saldo real del usuario
        int puntosActuales = usuario.getPuntosLevelUp() != null ? usuario.getPuntosLevelUp() : 0;
        int puntosUsados = payload.get("puntosUsados") != null ? Math.max(0, ((Number) payload.get("puntosUsados")).intValue()) : 0;

        if (puntosUsados > puntosActuales) {
            return ResponseEntity.badRequest().body(Map.of("error", "No tienes suficientes puntos LevelUp (Disponibles: " + puntosActuales + ")"));
        }

        // Descuento por puntos (10 puntos = $100 CLP => 1 punto = $10 CLP)
        int descuentoPuntos = puntosUsados * 10;
        int totalCalculado = Math.max(0, subtotalCalculado - descuentoPuntos);

        // Puntos ganados: 1 punto por cada $100 gastados sobre el total final pagado
        int puntosGanados = totalCalculado / 100;

        // Actualizar saldo de puntos
        usuario.setPuntosLevelUp(puntosActuales - puntosUsados + puntosGanados);
        usuarioRepository.save(usuario);

        // Descontar stock verificado de productos
        productoRepository.saveAll(productosAActualizar);

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
                .descuento(descuentoPuntos)
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
