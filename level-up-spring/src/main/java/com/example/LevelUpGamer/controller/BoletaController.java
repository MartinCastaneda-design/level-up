package com.example.LevelUpGamer.controller;

import com.example.LevelUpGamer.dto.CotizacionResponse;
import com.example.LevelUpGamer.dto.CotizarOrdenRequest;
import com.example.LevelUpGamer.dto.CrearOrdenRequest;
import com.example.LevelUpGamer.dto.OrdenCreadaResponse;
import com.example.LevelUpGamer.model.Boleta;
import com.example.LevelUpGamer.model.Usuario;
import com.example.LevelUpGamer.repository.BoletaRepository;
import com.example.LevelUpGamer.repository.UsuarioRepository;
import com.example.LevelUpGamer.service.OrdenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ordenes")
@Tag(name = "Órdenes y Boletas", description = "Endpoints de compra, emisión de boletas e historial")
@SecurityRequirement(name = "bearerAuth")
public class BoletaController {

    private final OrdenService ordenService;
    private final BoletaRepository boletaRepository;
    private final UsuarioRepository usuarioRepository;

    public BoletaController(OrdenService ordenService,
                            BoletaRepository boletaRepository,
                            UsuarioRepository usuarioRepository) {
        this.ordenService = ordenService;
        this.boletaRepository = boletaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/cotizar")
    @Operation(summary = "Cotizar / Previsualizar orden", description = "Calcula totales oficiales, ofertas, cupón y puntos máximos sin descontar stock")
    public ResponseEntity<CotizacionResponse> cotizarOrden(@Valid @RequestBody CotizarOrdenRequest request,
                                                           Authentication authentication) {
        String username = authentication.getName();
        CotizacionResponse response = ordenService.cotizarOrden(request, username);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Crear orden de compra", description = "Procesa el pago simulado, descuenta inventario y emite la boleta")
    public ResponseEntity<OrdenCreadaResponse> crearOrden(@Valid @RequestBody CrearOrdenRequest request,
                                                         Authentication authentication) {
        String username = authentication.getName();
        OrdenCreadaResponse response = ordenService.crearOrden(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/mis-compras")
    @Operation(summary = "Mis compras", description = "Retorna el historial de compras del usuario autenticado")
    public ResponseEntity<List<Boleta>> getMisCompras(Authentication authentication) {
        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsernameOrCorreo(username, username).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(boletaRepository.findByUsuarioOrderByFechaDesc(usuario));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    @Operation(summary = "Listar todas las órdenes", description = "Solo para administradores y vendedores")
    public ResponseEntity<List<Boleta>> getAllOrdenes() {
        return ResponseEntity.ok(boletaRepository.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener boleta por ID", description = "Clientes solo ven la suya; ADMIN y VENDEDOR ven cualquiera")
    public ResponseEntity<?> getOrdenById(@PathVariable Long id, Authentication authentication) {
        Boleta boleta = boletaRepository.findById(id).orElse(null);
        if (boleta == null) {
            return ResponseEntity.notFound().build();
        }

        String rol = authentication.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority())
                .orElse("");

        boolean esAdminOVendedor = rol.contains("ADMIN") || rol.contains("VENDEDOR");
        String username = authentication.getName();

        if (!esAdminOVendedor) {
            if (boleta.getUsuario() == null ||
                    (!username.equals(boleta.getUsuario().getUsername()) && !username.equals(boleta.getUsuario().getCorreo()))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "No autorizado para ver esta boleta"));
            }
        }

        return ResponseEntity.ok(boleta);
    }
}
