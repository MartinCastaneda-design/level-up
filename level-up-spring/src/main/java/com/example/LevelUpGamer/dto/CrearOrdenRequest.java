package com.example.LevelUpGamer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Petición para crear una nueva orden / boleta")
public class CrearOrdenRequest {

    @NotEmpty(message = "La orden debe contener al menos un producto")
    @Valid
    private List<ItemOrdenRequest> items;

    private String cupon;

    @Min(value = 0, message = "Los puntos usados no pueden ser negativos")
    private Integer puntosUsados;

    private String metodoPago;
    private String direccion;
    private String comuna;
    private String region;
    private String telefono;
}
