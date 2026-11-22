package com.example.LevelUpGamer.controller;

import com.example.LevelUpGamer.dto.RegisterRequest;
import com.example.LevelUpGamer.dto.UpdateProfileRequest;
import com.example.LevelUpGamer.model.RefreshToken;
import com.example.LevelUpGamer.model.Usuario;
import com.example.LevelUpGamer.repository.UsuarioRepository;
import com.example.LevelUpGamer.security.JwtService;
import com.example.LevelUpGamer.service.RefreshTokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticación", description = "Endpoints de Login, Registro, Sesión, Refresh y Logout con JWT")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://localhost:4173}")
    private String allowedOrigins;

    private boolean isValidOrigin(HttpServletRequest request) {
        String origin = request.getHeader("Origin");
        if (origin == null || origin.trim().isEmpty()) {
            String referer = request.getHeader("Referer");
            if (referer != null) origin = referer;
        }
        if (origin == null) return true;
        List<String> valid = Arrays.stream(allowedOrigins.split(",")).map(String::trim).toList();
        return valid.stream().anyMatch(origin::startsWith);
    }

    public AuthController(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService,
                          RefreshTokenService refreshTokenService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    private void attachRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        boolean isProd = "prod".equalsIgnoreCase(activeProfile);
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(isProd)
                .path("/")
                .maxAge(jwtService.getRefreshExpirationTime() / 1000)
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        boolean isProd = "prod".equalsIgnoreCase(activeProfile);
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(isProd)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    private String extractRefreshTokenFromCookies(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> "refreshToken".equals(c.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElse(null);
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Valida credenciales, genera access token JWT y refresh cookie HttpOnly")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest, HttpServletResponse servletResponse) {
        String identifier = loginRequest.containsKey("correo") ? loginRequest.get("correo")
                : (loginRequest.containsKey("email") ? loginRequest.get("email") : loginRequest.get("username"));
        String password = loginRequest.containsKey("contrasena") ? loginRequest.get("contrasena") : loginRequest.get("password");

        if (identifier == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Credenciales incompletas"));
        }

        Usuario usuario = usuarioRepository.findByUsernameOrCorreo(identifier.trim(), identifier.trim()).orElse(null);

        if (usuario == null || !passwordEncoder.matches(password, usuario.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Credenciales incorrectas"));
        }

        String rol = usuario.getRol() != null ? usuario.getRol() : "ROLE_CLIENTE";
        String token = jwtService.generateToken(usuario.getUsername(), rol);
        String refreshToken = refreshTokenService.createRefreshToken(usuario);
        attachRefreshTokenCookie(servletResponse, refreshToken);

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
    @Operation(summary = "Registrar nuevo usuario", description = "Crea una nueva cuenta con rol ROLE_CLIENTE y persiste los datos de perfil")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req, HttpServletResponse servletResponse) {
        String username = req.getUsername() != null ? req.getUsername().trim() : "";
        String correo = req.getCorreo() != null ? req.getCorreo().trim().toLowerCase() : "";
        String password = req.getContrasena();
        String nombre = req.getNombre() != null ? req.getNombre().trim() : "Gamer";
        String apellido = req.getApellido() != null ? req.getApellido().trim() : "";

        if (correo.isEmpty() || password == null || password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Correo válido y contraseña de al menos 6 caracteres son obligatorios"));
        }

        if (username.isEmpty()) {
            username = correo;
        }

        if (usuarioRepository.existsByUsername(username) || usuarioRepository.existsByCorreo(correo)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "El correo o nombre de usuario ya está registrado"));
        }

        // Validar mayoría de edad (18 años) en servidor
        if (req.getFechaNacimiento() != null) {
            try {
                java.time.LocalDate fechaNac = java.time.LocalDate.parse(req.getFechaNacimiento());
                java.time.LocalDate hoy = java.time.LocalDate.now();
                if (fechaNac.isAfter(hoy)) {
                    return ResponseEntity.badRequest().body(Map.of("error", "La fecha de nacimiento no puede ser futura"));
                }
                if (java.time.Period.between(fechaNac, hoy).getYears() < 18) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Debes ser mayor de 18 años para registrarte"));
                }
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Formato de fecha de nacimiento inválido (use yyyy-MM-dd)"));
            }
        }

        Usuario nuevo = Usuario.builder()
                .username(username)
                .correo(correo)
                .password(passwordEncoder.encode(password))
                .nombre(nombre)
                .apellido(apellido)
                .rol("ROLE_CLIENTE")
                .puntosLevelUp(100)
                .fechaNacimiento(req.getFechaNacimiento())
                .sexo(req.getSexo())
                .codigoReferido(req.getCodigoReferido())
                .build();

        Usuario guardado = usuarioRepository.save(nuevo);

        String token = jwtService.generateToken(guardado.getUsername(), guardado.getRol());
        String refreshToken = refreshTokenService.createRefreshToken(guardado);
        attachRefreshTokenCookie(servletResponse, refreshToken);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("id", guardado.getId());
        response.put("username", guardado.getUsername());
        response.put("nombre", guardado.getNombre());
        response.put("apellido", guardado.getApellido());
        response.put("correo", guardado.getCorreo());
        response.put("rol", guardado.getRol());
        response.put("puntosLevelUp", guardado.getPuntosLevelUp());
        response.put("fechaNacimiento", guardado.getFechaNacimiento());
        response.put("sexo", guardado.getSexo());
        response.put("codigoReferido", guardado.getCodigoReferido());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar JWT con Refresh Token", description = "Valida cookie refreshToken, aplica rotación y emite nuevo access token")
    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse servletResponse) {
        if (!isValidOrigin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Origen no permitido o sospecha de CSRF"));
        }
        String rawToken = extractRefreshTokenFromCookies(request);
        if (rawToken == null || rawToken.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No se encontró cookie de refresh token"));
        }

        String[] newRawTokenHolder = new String[1];
        Optional<RefreshToken> oldTokenOpt = refreshTokenService.verifyAndRotate(rawToken, newRawTokenHolder);

        if (oldTokenOpt.isEmpty()) {
            clearRefreshTokenCookie(servletResponse);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Refresh token inválido, expirado o ya utilizado"));
        }

        Usuario usuario = oldTokenOpt.get().getUsuario();
        String newAccessToken = jwtService.generateToken(usuario.getUsername(), usuario.getRol());
        attachRefreshTokenCookie(servletResponse, newRawTokenHolder[0]);

        Map<String, Object> response = new HashMap<>();
        response.put("token", newAccessToken);
        response.put("id", usuario.getId());
        response.put("username", usuario.getUsername());
        response.put("nombre", usuario.getNombre());
        response.put("apellido", usuario.getApellido());
        response.put("correo", usuario.getCorreo());
        response.put("rol", usuario.getRol());
        response.put("puntosLevelUp", usuario.getPuntosLevelUp());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Cerrar sesión", description = "Revoca el refresh token y limpia la cookie de autenticación")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse servletResponse) {
        if (!isValidOrigin(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Origen no permitido o sospecha de CSRF"));
        }
        String rawToken = extractRefreshTokenFromCookies(request);
        if (rawToken != null) {
            refreshTokenService.revokeToken(rawToken);
        }
        clearRefreshTokenCookie(servletResponse);
        return ResponseEntity.ok(Map.of("mensaje", "Sesión cerrada correctamente"));
    }

    @GetMapping("/me")
    @Operation(summary = "Obtener perfil autenticado", description = "Retorna la información del usuario en sesión")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }

        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsernameOrCorreo(username, username).orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Usuario no encontrado"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", usuario.getId());
        response.put("username", usuario.getUsername());
        response.put("nombre", usuario.getNombre());
        response.put("apellido", usuario.getApellido());
        response.put("correo", usuario.getCorreo());
        response.put("rol", usuario.getRol());
        response.put("puntosLevelUp", usuario.getPuntosLevelUp() != null ? usuario.getPuntosLevelUp() : 0);
        response.put("fechaNacimiento", usuario.getFechaNacimiento());
        response.put("sexo", usuario.getSexo());
        response.put("codigoReferido", usuario.getCodigoReferido());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    @Transactional
    @Operation(summary = "Actualizar perfil propio", description = "Actualiza nombre, apellido o contraseña validando contraseña actual y revocando sesiones previas")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest body, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }

        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsernameOrCorreo(username, username).orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Usuario no encontrado"));
        }

        if (body.getNombre() != null && !body.getNombre().trim().isEmpty()) {
            usuario.setNombre(body.getNombre().trim());
        }
        if (body.getApellido() != null && !body.getApellido().trim().isEmpty()) {
            usuario.setApellido(body.getApellido().trim());
        }

        // Si intenta cambiar correo
        if (body.getCorreo() != null && !body.getCorreo().trim().isEmpty()) {
            String nuevoCorreo = body.getCorreo().trim().toLowerCase();
            if (!nuevoCorreo.equalsIgnoreCase(usuario.getCorreo())) {
                if (usuarioRepository.existsByCorreo(nuevoCorreo)) {
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "El correo ya está en uso por otro usuario"));
                }
                usuario.setCorreo(nuevoCorreo);
            }
        }

        // Si intenta cambiar contraseña
        boolean passwordChanged = false;
        if (body.getNuevaContrasena() != null && !body.getNuevaContrasena().trim().isEmpty()) {
            if (body.getContrasenaActual() == null || !passwordEncoder.matches(body.getContrasenaActual(), usuario.getPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "La contraseña actual es incorrecta"));
            }
            if (body.getNuevaContrasena().trim().length() < 6) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "La nueva contraseña debe tener al menos 6 caracteres"));
            }
            usuario.setPassword(passwordEncoder.encode(body.getNuevaContrasena().trim()));
            passwordChanged = true;
        }

        Usuario guardado = usuarioRepository.save(usuario);

        // Al cambiar contraseña, revocar todos los refresh tokens existentes por seguridad
        if (passwordChanged) {
            refreshTokenService.revokeAllByUsuario(guardado);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", guardado.getId());
        response.put("username", guardado.getUsername());
        response.put("nombre", guardado.getNombre());
        response.put("apellido", guardado.getApellido());
        response.put("correo", guardado.getCorreo());
        response.put("rol", guardado.getRol());
        response.put("puntosLevelUp", guardado.getPuntosLevelUp());

        return ResponseEntity.ok(response);
    }
}
