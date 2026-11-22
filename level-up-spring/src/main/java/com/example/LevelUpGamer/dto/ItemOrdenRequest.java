package com.example.LevelUpGamer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Item de producto para una orden")
public class ItemOrdenRequest {

    @NotBlank(message = "El ID del producto es obligatorio")
    private String id;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    @jakarta.validation.constraints.Max(value = 999, message = "La cantidad no puede exceder 999 unidades por línea")
    private Integer cantidad;
}
