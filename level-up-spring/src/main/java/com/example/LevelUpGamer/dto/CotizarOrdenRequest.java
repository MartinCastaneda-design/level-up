package com.example.LevelUpGamer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
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
@Schema(description = "Petición para cotizar / previsualizar una orden")
public class CotizarOrdenRequest {

    @NotEmpty(message = "La orden debe contener al menos un producto")
    @Valid
    private List<ItemOrdenRequest> items;

    private String cupon;
    private Integer puntosUsados;
}
