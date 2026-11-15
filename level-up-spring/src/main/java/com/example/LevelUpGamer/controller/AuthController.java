package com.example.LevelUpGamer.controller;

import com.example.LevelUpGamer.model.Usuario;
import com.example.LevelUpGamer.repository.UsuarioRepository;
import com.example.LevelUpGamer.security.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticación", description = "Endpoints de Login, Registro y Sesión con JWT")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Valida credenciales y genera token JWT")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String identifier = loginRequest.containsKey("correo") ? loginRequest.get("correo")
                : (loginRequest.containsKey("email") ? loginRequest.get("email") : loginRequest.get("username"));
        String password = loginRequest.containsKey("contrasena") ? loginRequest.get("contrasena") : loginRequest.get("password");

        if (identifier == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Credenciales incompletas"));
        }

        Usuario usuario = usuarioRepository.findByUsernameOrCorreo(identifier, identifier).orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Usuario no encontrado"));
        }

        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Contraseña incorrecta"));
        }

        String rol = usuario.getRol() != null ? usuario.getRol() : "ROLE_CLIENTE";
        String token = jwtService.generateToken(usuario.getUsername(), rol);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("id", usuario.getId());
        response.put("username", usuario.getUsername());
        response.put("nombre", usuario.getNombre());
        response.put("apellido", usuario.getApellido());
        response.put("correo", usuario.getCorreo());
        response.put("rol", rol);
        response.put("puntosLevelUp", usuario.getPuntosLevelUp() != null ? usuario.getPuntosLevelUp() : 0);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    @Operation(summary = "Registrar nuevo usuario", description = "Crea una nueva cuenta con rol ROLE_CLIENTE")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> req) {
        String username = (String) req.get("username");
        String correo = req.containsKey("correo") ? (String) req.get("correo") : (String) req.get("email");
        String password = req.containsKey("contrasena") ? (String) req.get("contrasena") : (String) req.get("password");
        String nombre = (String) req.get("nombre");
        String apellido = (String) req.get("apellido");

        if (correo == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Correo y contraseña son obligatorios"));
        }

        if (username == null || username.trim().isEmpty()) {
            username = correo;
        }

        if (usuarioRepository.existsByUsername(username) || usuarioRepository.existsByCorreo(correo)) {
            return ResponseEntity.status(409).body(Map.of("error", "El correo o nombre de usuario ya está registrado"));
        }

        Usuario nuevo = Usuario.builder()
                .username(username)
                .correo(correo)
                .password(passwordEncoder.encode(password))
                .nombre(nombre != null ? nombre : "Gamer")
                .apellido(apellido != null ? apellido : "")
                .rol("ROLE_CLIENTE")
                .puntosLevelUp(100)
                .build();

        usuarioRepository.save(nuevo);

        String token = jwtService.generateToken(nuevo.getUsername(), nuevo.getRol());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("id", nuevo.getId());
        response.put("username", nuevo.getUsername());
        response.put("nombre", nuevo.getNombre());
        response.put("apellido", nuevo.getApellido());
        response.put("correo", nuevo.getCorreo());
        response.put("rol", nuevo.getRol());
        response.put("puntosLevelUp", nuevo.getPuntosLevelUp());

        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Obtener perfil autenticado", description = "Retorna la información del usuario en sesión")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsername(username).orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Usuario no encontrado"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", usuario.getId());
        response.put("username", usuario.getUsername());
        response.put("nombre", usuario.getNombre());
        response.put("apellido", usuario.getApellido());
        response.put("correo", usuario.getCorreo());
        response.put("rol", usuario.getRol());
        response.put("puntosLevelUp", usuario.getPuntosLevelUp());

        return ResponseEntity.ok(response);
    }
}
