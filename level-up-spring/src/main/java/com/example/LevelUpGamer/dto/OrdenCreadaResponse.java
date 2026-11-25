package com.example.LevelUpGamer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Respuesta oficial tras crear una orden")
public class OrdenCreadaResponse {

    private Long id;
    private String numeroOrden;
    private LocalDateTime fecha;
    private Long subtotal;
    private Long descuentoCupon;
    private Long descuentoPuntos;
    private Long total;
    private Integer puntosUsados;
    private Integer puntosGanados;
    private Integer saldoFinalPuntos;
    private String metodoPago;
    private String estado;
    private List<DetalleItemResponse> detalles;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetalleItemResponse {
        private String productoId;
        private String nombreProducto;
        private Integer cantidad;
        private Integer precioUnitario;
        private Long subtotal;
    }
}
