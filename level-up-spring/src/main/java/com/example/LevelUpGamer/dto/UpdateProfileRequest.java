package com.example.LevelUpGamer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Petición de actualización de perfil de usuario")
public class UpdateProfileRequest {

    @Size(max = 50, message = "El nombre no puede exceder 50 caracteres")
    private String nombre;

    @Size(max = 50, message = "El apellido no puede exceder 50 caracteres")
    private String apellido;

    @Email(message = "El formato de correo no es válido")
    private String correo;

    private String contrasenaActual;

    @Size(min = 6, message = "La nueva contraseña debe tener al menos 6 caracteres")
    private String nuevaContrasena;
}
