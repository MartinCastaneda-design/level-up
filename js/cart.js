// Administrador del Carrito de Compras en LocalStorage
const CLAVE_CARRITO = 'levelup_carrito';
const CLAVE_CUPON = 'levelup_cupon';

function obtenerCarrito() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || [];
    } catch (e) {
        return [];
    }
}

function guardarCarrito(carrito) {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    actualizarContadorCarrito();
}

function agregarAlCarrito(idProducto, cantidad = 1) {
    const cant = parseInt(cantidad, 10) || 1;
    const producto = getProductById(idProducto);
    if (!producto) {
        alert('Producto no encontrado');
        return false;
    }

    const carrito = obtenerCarrito();
    const indiceExiste = carrito.findIndex(item => item.id === idProducto);

    if (indiceExiste > -1) {
        carrito[indiceExiste].cantidad += cant;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            categoria: producto.categoria,
            cantidad: cant
        });
    }

    guardarCarrito(carrito);
    mostrarAvisoFlotante(producto.nombre + ' añadido al carrito (' + cant + ')');
    return true;
}

function actualizarCantidadCarrito(idProducto, cantidad) {
    const cant = parseInt(cantidad, 10);
    let carrito = obtenerCarrito();
    if (cant <= 0) {
        eliminarDelCarrito(idProducto);
        return;
    }
    const item = carrito.find(i => i.id === idProducto);
    if (item) {
        item.cantidad = cant;
        guardarCarrito(carrito);
    }
}

function eliminarDelCarrito(idProducto) {
    let carrito = obtenerCarrito();
    carrito = carrito.filter(item => item.id !== idProducto);
    guardarCarrito(carrito);
}

function vaciarCarrito() {
    localStorage.removeItem(CLAVE_CARRITO);
    localStorage.removeItem(CLAVE_CUPON);
    actualizarContadorCarrito();
}

function calcularTotalesCarrito() {
    const carrito = obtenerCarrito();
    const subtotal = carrito.reduce((acumulado, item) => acumulado + (item.precio * item.cantidad), 0);
    const totalArticulos = carrito.reduce((acumulado, item) => acumulado + item.cantidad, 0);

    const cupon = obtenerCuponActivo();
    let montoDescuento = 0;
    let porcentajeDescuento = 0;

    if (cupon) {
        porcentajeDescuento = cupon.porcentaje;
        montoDescuento = Math.round(subtotal * (porcentajeDescuento / 100));
    }

    const total = Math.max(0, subtotal - montoDescuento);

    return {
        subtotal: subtotal,
        totalArticulos: totalArticulos,
        porcentajeDescuento: porcentajeDescuento,
        montoDescuento: montoDescuento,
        total: total,
        codigoCupon: cupon ? cupon.codigo : null
    };
}

function obtenerCuponActivo() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_CUPON)) || null;
    } catch (e) {
        return null;
    }
}

function aplicarCupon(codigo) {
    const codigoLimpio = (codigo || '').trim().toUpperCase();
    if (codigoLimpio === 'ESTUDIANTE20' || codigoLimpio === 'PROMO20') {
        const cupon = { codigo: codigoLimpio, porcentaje: 20, descripcion: 'Descuento Especial (20%)' };
        localStorage.setItem(CLAVE_CUPON, JSON.stringify(cupon));
        return { exito: true, mensaje: '¡Cupón de 20% de descuento aplicado correctamente!', cupon: cupon };
    } else if (codigoLimpio === 'LEVELUP10') {
        const cupon = { codigo: codigoLimpio, porcentaje: 10, descripcion: 'Descuento Gamer (10%)' };
        localStorage.setItem(CLAVE_CUPON, JSON.stringify(cupon));
        return { exito: true, mensaje: '¡Cupón de 10% de descuento aplicado!', cupon: cupon };
    } else {
        return { exito: false, mensaje: 'Cupón no válido. Puedes probar con ESTUDIANTE20 o LEVELUP10.' };
    }
}

function eliminarCupon() {
    localStorage.removeItem(CLAVE_CUPON);
}

function actualizarContadorCarrito() {
    const insignias = document.querySelectorAll('.contador-carrito-badge');
    const totales = calcularTotalesCarrito();
    insignias.forEach(insignia => {
        insignia.textContent = totales.totalArticulos;
        if (totales.totalArticulos > 0) {
            insignia.classList.remove('d-none');
        } else {
            insignia.classList.add('d-none');
        }
    });
}

function mostrarAvisoFlotante(mensaje) {
    let contenedorAvisos = document.getElementById('contenedorAvisos');
    if (!contenedorAvisos) {
        contenedorAvisos = document.createElement('div');
        contenedorAvisos.id = 'contenedorAvisos';
        contenedorAvisos.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        contenedorAvisos.style.zIndex = '1090';
        document.body.appendChild(contenedorAvisos);
    }

    const elementoAviso = document.createElement('div');
    elementoAviso.className = 'toast align-items-center text-bg-dark border-info show shadow-lg';
    elementoAviso.setAttribute('role', 'alert');
    elementoAviso.innerHTML = '<div class="d-flex"><div class="toast-body d-flex align-items-center gap-2"><i class="bi bi-cart-check-fill text-info fs-5"></i><div>' + mensaje + '</div></div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>';
    contenedorAvisos.appendChild(elementoAviso);
    setTimeout(() => {
        elementoAviso.classList.remove('show');
        setTimeout(() => elementoAviso.remove(), 400);
    }, 2800);
}

// Compatibilidad de nombres de funciones
function getCart() { return obtenerCarrito(); }
function addToCart(id, qty) { return agregarAlCarrito(id, qty); }
function updateCartQuantity(id, qty) { return actualizarCantidadCarrito(id, qty); }
function removeFromCart(id) { return eliminarDelCarrito(id); }
function clearCart() { return vaciarCarrito(); }
function getCartTotals() { return calcularTotalesCarrito(); }
function applyCoupon(c) { return aplicarCupon(c); }

document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorCarrito();
});
