package com.example.LevelUpGamer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Petición para crear o actualizar un producto")
public class ProductoDto {

    private String id;

    @NotBlank(message = "El nombre del producto es obligatorio")
    @Size(max = 200, message = "El nombre no puede exceder 200 caracteres")
    private String nombre;

    @NotBlank(message = "La categoría es obligatoria")
    private String categoria;

    private String categoriaSlug;

    @NotNull(message = "El precio es obligatorio")
    @Min(value = 0, message = "El precio no puede ser negativo")
    private Integer precio;

    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock;

    private String imagen;
    private Boolean destacado;
    private Boolean enOferta;

    @Min(value = 0, message = "El descuento no puede ser menor a 0")
    @jakarta.validation.constraints.Max(value = 100, message = "El descuento no puede ser superior a 100%")
    private Integer descuento;

    private String descripcionCorta;
    private String descripcionLarga;
}
