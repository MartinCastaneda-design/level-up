package com.example.LevelUpGamer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Respuesta de previsualización / cotización oficial de una orden")
public class CotizacionResponse {

    private Long subtotal;
    private Long descuentoCupon;
    private Long descuentoPuntos;
    private Long total;
    private Integer puntosUsados;
    private Integer puntosMaximosCanjeables;
    private Integer puntosGanar;
    private Integer saldoPuntosDisponible;
    private List<ItemCotizadoResponse> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemCotizadoResponse {
        private String productoId;
        private String nombreProducto;
        private Integer cantidad;
        private Integer precioOriginal;
        private Integer precioUnitarioFinal;
        private Integer descuentoPorcentaje;
        private Long subtotal;
    }
}
