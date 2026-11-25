package com.example.LevelUpGamer.service;

import com.example.LevelUpGamer.dto.CotizacionResponse;
import com.example.LevelUpGamer.dto.CotizarOrdenRequest;
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

    private static final Set<String> METODOS_PAGO_PERMITIDOS = Set.of(
            "WEBPAY PLUS (SIMULADO)",
            "WEBPAY PLUS",
            "WEBPAY PLUS (DÉBITO/CRÉDITO)",
            "TRANSFERENCIA BANCARIA (SIMULADA)",
            "TRANSFERENCIA BANCARIA",
            "PUNTOS LEVELUP"
    );

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

    public static int calcularPrecioFinal(Producto prod) {
        int precioOriginal = prod.getPrecio() != null ? prod.getPrecio() : 0;
        int descPorc = (Boolean.TRUE.equals(prod.getEnOferta()) && prod.getDescuento() != null) ? prod.getDescuento() : 0;
        if (descPorc < 0) descPorc = 0;
        if (descPorc > 100) descPorc = 100;
        return descPorc > 0 ? (int) Math.round(precioOriginal * (1.0 - (descPorc / 100.0))) : precioOriginal;
    }

    @Transactional(readOnly = true)
    public CotizacionResponse cotizarOrden(CotizarOrdenRequest req, String username) {
        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El carrito no puede estar vacío");
        }

        Usuario usuario = usuarioRepository.findByUsernameOrCorreo(username, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado"));

        Map<String, Integer> itemsAgrupados = agruparItems(req.getItems());

        long subtotal = 0L;
        List<CotizacionResponse.ItemCotizadoResponse> itemsResp = new ArrayList<>();

        for (Map.Entry<String, Integer> entry : itemsAgrupados.entrySet()) {
            String pId = entry.getKey();
            int cant = entry.getValue();
            Producto prod = productoRepository.findById(pId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado: " + pId));

            int precioOriginal = prod.getPrecio() != null ? prod.getPrecio() : 0;
            int descPorc = (Boolean.TRUE.equals(prod.getEnOferta()) && prod.getDescuento() != null) ? Math.min(100, Math.max(0, prod.getDescuento())) : 0;
            int precioFinal = calcularPrecioFinal(prod);
            long itemSubtotal = (long) precioFinal * cant;
            subtotal += itemSubtotal;

            itemsResp.add(CotizacionResponse.ItemCotizadoResponse.builder()
                    .productoId(prod.getId())
                    .nombreProducto(prod.getNombre())
                    .cantidad(cant)
                    .precioOriginal(precioOriginal)
                    .precioUnitarioFinal(precioFinal)
                    .descuentoPorcentaje(descPorc)
                    .subtotal(itemSubtotal)
                    .build());
        }

        long descuentoCupon = calcularDescuentoCupon(req.getCupon(), usuario, subtotal);
        long montoTrasCupon = Math.max(0L, subtotal - descuentoCupon);

        int saldoPuntos = usuario.getPuntosLevelUp() != null ? usuario.getPuntosLevelUp() : 0;
        int maxPuntosCanjeables = (int) Math.min((long) saldoPuntos, montoTrasCupon / 10L);

        int puntosUsados = req.getPuntosUsados() != null ? Math.max(0, req.getPuntosUsados()) : 0;
        if (puntosUsados > maxPuntosCanjeables) {
            puntosUsados = maxPuntosCanjeables;
        }

        long descuentoPuntos = puntosUsados * 10L;
        long totalOficial = Math.max(0L, montoTrasCupon - descuentoPuntos);
        int puntosGanar = (int) (totalOficial / 100L);
        boolean pagoTotalPuntos = (saldoPuntos * 10L >= montoTrasCupon) && (montoTrasCupon % 10L == 0L);

        return CotizacionResponse.builder()
                .subtotal(subtotal)
                .descuentoCupon(descuentoCupon)
                .descuentoPuntos(descuentoPuntos)
                .total(totalOficial)
                .puntosUsados(puntosUsados)
                .puntosMaximosCanjeables(maxPuntosCanjeables)
                .puntosGanar(puntosGanar)
                .saldoPuntosDisponible(saldoPuntos)
                .pagoTotalConPuntosDisponible(pagoTotalPuntos)
                .items(itemsResp)
                .build();
    }

    @Transactional
    public OrdenCreadaResponse crearOrden(CrearOrdenRequest req, String username) {
        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El carrito no puede estar vacío");
        }

        // 1. Validar método de pago permitido
        String metodoNormalizado = req.getMetodoPago() != null ? req.getMetodoPago().trim().toUpperCase() : "WEBPAY PLUS (SIMULADO)";
        if (!METODOS_PAGO_PERMITIDOS.contains(metodoNormalizado) && !METODOS_PAGO_PERMITIDOS.contains(metodoNormalizado.replace(" (SIMULADO)", ""))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Método de pago no permitido: " + req.getMetodoPago());
        }

        // 2. Obtener usuario para compra
        Usuario usuario = usuarioRepository.findByUsernameOrCorreo(username, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado"));

        // 3. Agrupar items repetidos por ID de producto alfanumérico
        Map<String, Integer> itemsAgrupados = agruparItems(req.getItems());

        // 4. Prevalidación de existencia y stock de productos
        Map<String, Producto> productosValidados = new LinkedHashMap<>();
        for (String pId : itemsAgrupados.keySet()) {
            Producto prod = productoRepository.findById(pId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado: " + pId));
            int cantSolicitada = itemsAgrupados.get(pId);
            int stockDisponible = prod.getStock() != null ? prod.getStock() : 0;
            if (stockDisponible < cantSolicitada) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Stock insuficiente para '" + prod.getNombre() + "'. Solicitado: " + cantSolicitada + ", Disponible: " + stockDisponible);
            }
            productosValidados.put(pId, prod);
        }

        // 5. Calcular Subtotal oficial usando precios oficiales de BD y ofertas
        long subtotal = 0L;
        for (Map.Entry<String, Integer> entry : itemsAgrupados.entrySet()) {
            Producto prod = productosValidados.get(entry.getKey());
            int cant = entry.getValue();
            int precioFinal = calcularPrecioFinal(prod);
            long itemSubtotal = (long) precioFinal * cant;
            subtotal += itemSubtotal;
        }

        // 6. Validar cupón de descuento en backend
        long descuentoCupon = calcularDescuentoCupon(req.getCupon(), usuario, subtotal);
        long montoTrasCupon = Math.max(0L, subtotal - descuentoCupon);

        // 7. Validar Puntos LevelUp (1 punto = $10 CLP de descuento)
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
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Los puntos ingresados superan el total a pagar. Puntos máximos aplicables: " + (montoTrasCupon / 10L));
        }

        long totalOficial = Math.max(0L, montoTrasCupon - descuentoPuntos);

        // 8. Validar método de pago si es Puntos LevelUp
        String metodoPagoFinal = req.getMetodoPago() != null ? req.getMetodoPago().trim() : "Webpay Plus (Simulado)";
        if ("Puntos LevelUp".equalsIgnoreCase(metodoPagoFinal) && totalOficial > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Los puntos no cubren el total de la orden");
        }

        // 9. Descontar stock
        for (Map.Entry<String, Integer> entry : itemsAgrupados.entrySet()) {
            Producto prod = productosValidados.get(entry.getKey());
            prod.setStock(prod.getStock() - entry.getValue());
            productoRepository.save(prod);
        }

        // 10. Actualizar puntos del usuario (1 punto por cada $100 CLP efectivamente pagados)
        int puntosGanados = (int) (totalOficial / 100L);
        int nuevoSaldoPuntos = saldoPuntosActual - puntosUsados + puntosGanados;
        usuario.setPuntosLevelUp(nuevoSaldoPuntos);
        usuarioRepository.save(usuario);

        // 11. Persistir Boleta oficial
        String numOrden = generarNumeroOrdenUnico();
        String metodoGuardado = metodoPagoFinal.contains("Simulado") ? metodoPagoFinal : (metodoPagoFinal.equalsIgnoreCase("Puntos LevelUp") ? "Puntos LevelUp" : metodoPagoFinal + " (Simulado)");

        Boleta boleta = Boleta.builder()
                .numeroOrden(numOrden)
                .fecha(LocalDateTime.now())
                .subtotal((int) subtotal)
                .descuento((int) (descuentoCupon + descuentoPuntos))
                .total((int) totalOficial)
                .metodoPago(metodoGuardado)
                .estado("Completada (Simulado)")
                .direccionDespacho(req.getDireccion())
                .comuna(req.getComuna())
                .region(req.getRegion())
                .telefono(req.getTelefono())
                .usuario(usuario)
                .detalles(new ArrayList<>())
                .build();

        Boleta boletaGuardada = boletaRepository.save(boleta);

        // 12. Persistir Detalle de Boleta conservando el ID original alfanumérico
        List<OrdenCreadaResponse.DetalleItemResponse> detallesResponse = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : itemsAgrupados.entrySet()) {
            Producto prod = productosValidados.get(entry.getKey());
            int cant = entry.getValue();
            int precioUnit = calcularPrecioFinal(prod);
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
                    .productoId(prod.getId())
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

    private Map<String, Integer> agruparItems(List<ItemOrdenRequest> items) {
        Map<String, Integer> agrupados = new TreeMap<>();
        for (ItemOrdenRequest item : items) {
            if (item.getId() == null || item.getId().trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID de producto inválido o vacío");
            }
            if (item.getCantidad() == null || item.getCantidad() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cantidad debe ser mayor a 0");
            }
            if (item.getCantidad() > 999) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cantidad no puede exceder 999 unidades por línea");
            }
            String pId = item.getId().trim();
            agrupados.put(pId, agrupados.getOrDefault(pId, 0) + item.getCantidad());
        }
        return agrupados;
    }

    private long calcularDescuentoCupon(String cuponRaw, Usuario usuario, long subtotal) {
        if (cuponRaw == null || cuponRaw.trim().isEmpty()) return 0L;
        String cupon = cuponRaw.trim().toUpperCase();
        double porcentajeCupon = 0.0;
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
        return Math.round(subtotal * porcentajeCupon);
    }
}
