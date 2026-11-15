package com.example.LevelUpGamer.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Producto {

    @Id
    private String id;

    @Column(nullable = false)
    private String nombre;

    private String categoria;
    private String categoriaSlug;
    private Integer precio;

    @Column(length = 1000)
    private String imagen;

    private Boolean destacado;
    private Boolean enOferta;
    private Integer descuento;

    @Column(length = 2000)
    private String descripcionCorta;

    @Column(length = 4000)
    private String descripcionLarga;

    private Integer stock;
    private Double rating;
    private Integer numReviews;
}
