package com.example.LevelUpGamer.controller;

import com.example.LevelUpGamer.model.Boleta;
import com.example.LevelUpGamer.model.Usuario;
import com.example.LevelUpGamer.repository.BoletaRepository;
import com.example.LevelUpGamer.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
@Tag(name = "Administración de Usuarios", description = "Endpoints para listar y gestionar roles de usuarios (requiere ROLE_ADMIN)")
@SecurityRequirement(name = "bearerAuth")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final BoletaRepository boletaRepository;

    public UsuarioController(UsuarioRepository usuarioRepository, BoletaRepository boletaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.boletaRepository = boletaRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar todos los usuarios", description = "Devuelve el catálogo de usuarios sin exponer contraseñas")
    public ResponseEntity<List<Map<String, Object>>> listarTodos() {
        List<Map<String, Object>> usuariosDto = usuarioRepository.findAll().stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("username", u.getUsername());
            map.put("nombre", u.getNombre());
            map.put("apellido", u.getApellido());
            map.put("correo", u.getCorreo());
            map.put("rol", u.getRol());
            map.put("puntosLevelUp", u.getPuntosLevelUp() != null ? u.getPuntosLevelUp() : 0);
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(usuariosDto);
    }

    @PatchMapping("/{id}/rol")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Operation(summary = "Cambiar rol de usuario", description = "Permite a un ADMIN asignar ROLE_ADMIN, ROLE_VENDEDOR o ROLE_CLIENTE con validación de último admin")
    public ResponseEntity<?> cambiarRol(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication authentication) {
        String nuevoRol = body.get("rol");
        if (nuevoRol == null || nuevoRol.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El campo 'rol' es obligatorio"));
        }

        nuevoRol = nuevoRol.toUpperCase().trim();
        if (!nuevoRol.startsWith("ROLE_")) {
            nuevoRol = "ROLE_" + nuevoRol;
        }

        if (!nuevoRol.equals("ROLE_ADMIN") && !nuevoRol.equals("ROLE_VENDEDOR") && !nuevoRol.equals("ROLE_CLIENTE")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Rol inválido. Permitidos: ROLE_ADMIN, ROLE_VENDEDOR, ROLE_CLIENTE"));
        }

        Usuario usuario = usuarioRepository.findByIdForUpdate(id).orElse(null);
        if (usuario == null) {
            return ResponseEntity.notFound().build();
        }

        String adminAutenticado = authentication.getName();
        if ((adminAutenticado.equals(usuario.getUsername()) || adminAutenticado.equals(usuario.getCorreo()))
                && !nuevoRol.equals("ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Un administrador no puede removerse a sí mismo el rol ADMIN"));
        }

        if ("ROLE_ADMIN".equals(usuario.getRol()) && !nuevoRol.equals("ROLE_ADMIN")) {
            long totalAdmins = usuarioRepository.countByRol("ROLE_ADMIN");
            if (totalAdmins <= 1) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "No se puede degradar al último administrador del sistema"));
            }
        }

        usuario.setRol(nuevoRol);
        Usuario actualizado = usuarioRepository.save(usuario);

        Map<String, Object> resp = new HashMap<>();
        resp.put("id", actualizado.getId());
        resp.put("username", actualizado.getUsername());
        resp.put("rol", actualizado.getRol());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/{id}/ordenes")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Ver órdenes de un usuario específico", description = "Permite a un ADMIN consultar el historial de compras de cualquier usuario")
    public ResponseEntity<?> getOrdenesDeUsuario(@PathVariable Long id) {
        Usuario usuario = usuarioRepository.findById(id).orElse(null);
        if (usuario == null) {
            return ResponseEntity.notFound().build();
        }
        List<Boleta> ordenes = boletaRepository.findByUsuarioOrderByFechaDesc(usuario);
        return ResponseEntity.ok(ordenes);
    }
}
