package com.example.LevelUpGamer.service;

import com.example.LevelUpGamer.dto.CrearOrdenRequest;
import com.example.LevelUpGamer.dto.ItemOrdenRequest;
import com.example.LevelUpGamer.dto.OrdenCreadaResponse;
import com.example.LevelUpGamer.model.Boleta;
import com.example.LevelUpGamer.model.DetalleBoleta;
import com.example.LevelUpGamer.model.Producto;
import com.example.LevelUpGamer.model.Usuario;
import com.example.LevelUpGamer.repository.BoletaRepository;
import com.example.LevelUpGamer.repository.ProductoRepository;
import com.example.LevelUpGamer.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class OrdenService {

    private final BoletaRepository boletaRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    private static final AtomicLong ORDER_COUNTER = new AtomicLong(System.currentTimeMillis() % 100000);

    public OrdenService(BoletaRepository boletaRepository,
                        ProductoRepository productoRepository,
                        UsuarioRepository usuarioRepository) {
        this.boletaRepository = boletaRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    private synchronized String generarNumeroOrdenUnico() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        long seq = ORDER_COUNTER.incrementAndGet();
        return "LVL-" + timestamp + "-" + String.format("%04d", seq % 10000);
    }

    @Transactional
    public OrdenCreadaResponse crearOrden(CrearOrdenRequest req, String username) {
        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El carrito no puede estar vacío");
        }

        // 1. Bloqueo pesimista del usuario para proteger saldo de puntos
        Usuario usuario = usuarioRepository.findByUsernameOrCorreoForUpdate(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado"));

        // 2. Agrupar items repetidos por ID de producto de forma ordenada
        Map<String, Integer> itemsAgrupados = new TreeMap<>();
        for (ItemOrdenRequest item : req.getItems()) {
            if (item.getId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID de producto inválido");
            }
            if (item.getCantidad() == null || item.getCantidad() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cantidad debe ser mayor a 0");
            }
            String pId = String.valueOf(item.getId());
            itemsAgrupados.put(pId, Math.addExact(itemsAgrupados.getOrDefault(pId, 0), item.getCantidad()));
        }

        // 3. Prevalidación con bloqueo pesimista ordenado de productos (prevenir deadlock)
        Map<String, Producto> productosBloqueados = new LinkedHashMap<>();
        for (String pId : itemsAgrupados.keySet()) {
            Producto prod = productoRepository.findByIdForUpdate(pId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado: " + pId));
            int cantSolicitada = itemsAgrupados.get(pId);
            int stockDisponible = prod.getStock() != null ? prod.getStock() : 0;
            if (stockDisponible < cantSolicitada) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Stock insuficiente para '" + prod.getNombre() + "'. Solicitado: " + cantSolicitada + ", Disponible: " + stockDisponible);
            }
            productosBloqueados.put(pId, prod);
        }

        // 4. Calcular Subtotal oficial usando precios oficiales de BD
        long subtotal = 0L;
        for (Map.Entry<String, Integer> entry : itemsAgrupados.entrySet()) {
            Producto prod = productosBloqueados.get(entry.getKey());
            int cant = entry.getValue();
            long precioFinal = prod.getPrecio() != null ? prod.getPrecio() : 0L;
            if (Boolean.TRUE.equals(prod.getEnOferta()) && prod.getDescuento() != null && prod.getDescuento() > 0) {
                precioFinal = Math.round(precioFinal * (1.0 - (prod.getDescuento() / 100.0)));
            }
            subtotal = Math.addExact(subtotal, Math.multiplyExact(precioFinal, (long) cant));
        }

        // 5. Validar cupón de descuento en backend
        double porcentajeCupon = 0.0;
        String cupon = req.getCupon() != null ? req.getCupon().trim().toUpperCase() : "";
        if (!cupon.isEmpty()) {
            switch (cupon) {
                case "ESTUDIANTE20":
                    if (usuario.getCorreo() == null || !usuario.getCorreo().toLowerCase().endsWith("@duocuc.cl")) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El cupón ESTUDIANTE20 es exclusivo para correos @duocuc.cl");
                    }
                    porcentajeCupon = 0.20;
                    break;
                case "LEVELUP10":
                    porcentajeCupon = 0.10;
                    break;
                case "PROMO20":
                    porcentajeCupon = 0.20;
                    break;
                default:
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cupón inválido o expirado: " + cupon);
            }
        }
        long descuentoCupon = Math.round(subtotal * porcentajeCupon);
        long montoTrasCupon = Math.max(0L, subtotal - descuentoCupon);

        // 6. Validar Puntos LevelUp (1 punto = $10 CLP de descuento)
        int puntosUsados = req.getPuntosUsados() != null ? req.getPuntosUsados() : 0;
        if (puntosUsados < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Los puntos usados no pueden ser negativos");
        }

        int saldoPuntosActual = usuario.getPuntosLevelUp() != null ? usuario.getPuntosLevelUp() : 0;
        if (puntosUsados > saldoPuntosActual) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Puntos insuficientes. Disponibles: " + saldoPuntosActual + ", Solicitados: " + puntosUsados);
        }

        long descuentoPuntos = puntosUsados * 10L;
        if (descuentoPuntos > montoTrasCupon) {
            // El descuento de puntos no puede exceder el monto a pagar
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Los puntos ingresados superan el total a pagar. Puntos máximos aplicables: " + (montoTrasCupon / 10L));
        }

        long totalOficial = Math.max(0L, montoTrasCupon - descuentoPuntos);

        // 7. Validar método de pago si es Puntos LevelUp
        String metodoPago = req.getMetodoPago() != null ? req.getMetodoPago().trim() : "Webpay Plus (Simulado)";
        if ("Puntos LevelUp".equalsIgnoreCase(metodoPago) && totalOficial > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Los puntos no cubren el total de la orden");
        }

        // 8. Descontar stock atómicamente
        for (Map.Entry<String, Integer> entry : itemsAgrupados.entrySet()) {
            Producto prod = productosBloqueados.get(entry.getKey());
            prod.setStock(prod.getStock() - entry.getValue());
            productoRepository.save(prod);
        }

        // 9. Actualizar puntos del usuario (1 punto por cada $100 CLP efectivamente pagados)
        int puntosGanados = (int) (totalOficial / 100L);
        int nuevoSaldoPuntos = saldoPuntosActual - puntosUsados + puntosGanados;
        usuario.setPuntosLevelUp(nuevoSaldoPuntos);
        usuarioRepository.save(usuario);

        // 10. Persistir Boleta oficial
        String numOrden = generarNumeroOrdenUnico();
        Boleta boleta = Boleta.builder()
                .numeroOrden(numOrden)
                .fecha(LocalDateTime.now())
                .subtotal((int) subtotal)
                .descuento((int) (descuentoCupon + descuentoPuntos))
                .total((int) totalOficial)
                .metodoPago(metodoPago.contains("Simulado") ? metodoPago : metodoPago + " (Simulado)")
                .estado("Completada (Simulado)")
                .direccionDespacho(req.getDireccion())
                .comuna(req.getComuna())
                .region(req.getRegion())
                .telefono(req.getTelefono())
                .usuario(usuario)
                .detalles(new ArrayList<>())
                .build();

        Boleta boletaGuardada = boletaRepository.save(boleta);

        // 11. Persistir Detalle de Boleta
        List<OrdenCreadaResponse.DetalleItemResponse> detallesResponse = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : itemsAgrupados.entrySet()) {
            Producto prod = productosBloqueados.get(entry.getKey());
            int cant = entry.getValue();
            int precioUnit = prod.getPrecio() != null ? prod.getPrecio() : 0;
            if (Boolean.TRUE.equals(prod.getEnOferta()) && prod.getDescuento() != null && prod.getDescuento() > 0) {
                precioUnit = (int) Math.round(precioUnit * (1.0 - (prod.getDescuento() / 100.0)));
            }
            long itemSubtotal = (long) precioUnit * cant;

            DetalleBoleta det = DetalleBoleta.builder()
                    .boleta(boletaGuardada)
                    .producto(prod)
                    .cantidad(cant)
                    .precioUnitario(precioUnit)
                    .subtotal((int) itemSubtotal)
                    .build();

            boletaGuardada.getDetalles().add(det);

            detallesResponse.add(OrdenCreadaResponse.DetalleItemResponse.builder()
                    .productoId(Long.parseLong(prod.getId().replaceAll("\\D+", "").isEmpty() ? "1" : prod.getId().replaceAll("\\D+", "")))
                    .nombreProducto(prod.getNombre())
                    .cantidad(cant)
                    .precioUnitario(precioUnit)
                    .subtotal(itemSubtotal)
                    .build());
        }

        boletaRepository.save(boletaGuardada);

        return OrdenCreadaResponse.builder()
                .id(boletaGuardada.getId())
                .numeroOrden(boletaGuardada.getNumeroOrden())
                .fecha(boletaGuardada.getFecha())
                .subtotal(subtotal)
                .descuentoCupon(descuentoCupon)
                .descuentoPuntos(descuentoPuntos)
                .total(totalOficial)
                .puntosUsados(puntosUsados)
                .puntosGanados(puntosGanados)
                .saldoFinalPuntos(nuevoSaldoPuntos)
                .metodoPago(boletaGuardada.getMetodoPago())
                .estado(boletaGuardada.getEstado())
                .detalles(detallesResponse)
                .build();
    }
}
