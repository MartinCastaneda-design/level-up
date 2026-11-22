package com.example.LevelUpGamer.controller;

import com.example.LevelUpGamer.model.Usuario;
import com.example.LevelUpGamer.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
@Tag(name = "Administración de Usuarios", description = "Endpoints para listar y gestionar roles de usuarios (requiere ROLE_ADMIN)")
@SecurityRequirement(name = "bearerAuth")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
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
    @Operation(summary = "Cambiar rol de usuario", description = "Permite a un ADMIN asignar ROLE_ADMIN, ROLE_VENDEDOR o ROLE_CLIENTE")
    public ResponseEntity<?> cambiarRol(@PathVariable Long id, @RequestBody Map<String, String> body) {
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

        String finalRol = nuevoRol;
        return usuarioRepository.findById(id).map(usuario -> {
            usuario.setRol(finalRol);
            Usuario actualizado = usuarioRepository.save(usuario);

            Map<String, Object> resp = new HashMap<>();
            resp.put("id", actualizado.getId());
            resp.put("username", actualizado.getUsername());
            resp.put("rol", actualizado.getRol());
            return ResponseEntity.ok(resp);
        }).orElse(ResponseEntity.notFound().build());
    }
}
