package com.example.LevelUpGamer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Petición para crear o actualizar una categoría")
public class CategoriaDto {

    private Long id;

    @NotBlank(message = "El nombre de la categoría es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    private String nombre;

    @NotBlank(message = "El slug de la categoría es obligatorio")
    @Size(max = 100, message = "El slug no puede exceder 100 caracteres")
    private String slug;

    private String descripcion;
    private String icono;
}
