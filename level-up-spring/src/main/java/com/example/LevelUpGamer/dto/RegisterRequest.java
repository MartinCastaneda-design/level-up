package com.example.LevelUpGamer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Petición de registro de nuevo usuario")
public class RegisterRequest {

    @NotBlank(message = "El nombre de usuario o correo es obligatorio")
    @Size(min = 3, max = 50, message = "El username debe tener entre 3 y 50 caracteres")
    private String username;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El formato de correo no es válido")
    private String correo;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String contrasena;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 50)
    private String nombre;

    @Size(max = 50)
    private String apellido;

    @NotBlank(message = "La fecha de nacimiento es obligatoria")
    @jakarta.validation.constraints.Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "La fecha debe tener formato yyyy-MM-dd")
    private String fechaNacimiento;

    @NotBlank(message = "El sexo es obligatorio")
    @jakarta.validation.constraints.Pattern(regexp = "^(femenino|masculino|otro)$", message = "El sexo debe ser 'femenino', 'masculino' u 'otro'")
    private String sexo;

    @Size(max = 30, message = "El código de referido no puede exceder 30 caracteres")
    private String codigoReferido;
}
