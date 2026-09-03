let productosAdmin = [];
let idEnEdicion = null; // null = modo "agregar nuevo", un id = modo "editando ese producto"

function guardarProductos(productos) {
    localStorage.setItem('levelup_productos', JSON.stringify(productos));
}

function inicializarProductos() {
    const datosGuardados = localStorage.getItem('levelup_productos');
    if (datosGuardados !== null) {
        return JSON.parse(datosGuardados);
    } else {
        const copiaInicial = [...PRODUCTOS_DATA];
        guardarProductos(copiaInicial);
        return copiaInicial;
    }
}

function renderizarTabla() {
    const tbody = document.getElementById('listaProductosAdmin');
    tbody.innerHTML = '';

    productosAdmin.forEach(producto => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td class="brand-font text-info">${producto.id}</td>
            <td><span class="badge badge-category">${producto.categoria}</span></td>
            <td><strong>${producto.nombre}</strong></td>
            <td class="price-tag">${formatCLP(producto.precio)}</td>
            <td class="text-center">
                <button type="button" class="btn btn-sm btn-outline-warning me-1 btn-editar" data-id="${producto.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${producto.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

function guardarDesdeFormulario(event) {
    event.preventDefault();

    const producto = {
        id: document.getElementById('prodId').value.trim(),
        categoria: document.getElementById('prodCategoria').value,
        nombre: document.getElementById('prodNombre').value.trim(),
        precio: Number(document.getElementById('prodPrecio').value)
    };

    if (idEnEdicion === null) {
        // Modo agregar: producto nuevo al final del array
        productosAdmin.push(producto);
    } else {
        // Modo editar: buscamos la posición del producto original y lo reemplazamos
        const indice = productosAdmin.findIndex(p => p.id === idEnEdicion);
        productosAdmin[indice] = producto;
        idEnEdicion = null;
    }

    guardarProductos(productosAdmin);
    renderizarTabla();

    event.target.reset();
    bootstrap.Modal.getInstance(document.getElementById('modalProducto')).hide();
}

function prepararEdicion(id) {
    const producto = productosAdmin.find(p => p.id === id);
    if (!producto) return;

    document.getElementById('prodId').value = producto.id;
    document.getElementById('prodCategoria').value = producto.categoria;
    document.getElementById('prodNombre').value = producto.nombre;
    document.getElementById('prodPrecio').value = producto.precio;

    idEnEdicion = id;

    const modal = new bootstrap.Modal(document.getElementById('modalProducto'));
    modal.show();
}

function eliminarProducto(id) {
    productosAdmin = productosAdmin.filter(p => p.id !== id);
    guardarProductos(productosAdmin);
    renderizarTabla();
}

document.addEventListener('DOMContentLoaded', () => {
    productosAdmin = inicializarProductos();
    renderizarTabla();

    document.getElementById('formProducto').addEventListener('submit', guardarDesdeFormulario);

    document.getElementById('listaProductosAdmin').addEventListener('click', (event) => {
        const btnEditar = event.target.closest('.btn-editar');
        const btnEliminar = event.target.closest('.btn-eliminar');

        if (btnEditar) {
            prepararEdicion(btnEditar.dataset.id);
        }
        if (btnEliminar) {
            eliminarProducto(btnEliminar.dataset.id);
        }
    });
});