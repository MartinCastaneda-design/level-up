let productosAdmin = [];
let idEnEdicion = null; // null = modo "agregar nuevo", un id = modo "editando ese producto"

//Recibe el array de productos y lo percite en localStorage, para que sobreviva si el usuario recarga
//o cierra el navegador 
function guardarProductos(productos) {
    localStorage.setItem('levelup_productos', JSON.stringify(productos));
}
//Revisa si ya hay productos guardados; si sí, los usa, y si no, copia el catálogo original 
// y lo guarda por primera vez.
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

// Usar en caso de reinicar la pagina y vuelva a la base de datos:  localStorage.removeItem('levelup_productos');


//Actúa como el "puente" entre los datos en memoria y lo que ve el usuario
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
    //Se captura los datos de los inputs del modal
    const producto = {
        id: document.getElementById('prodId').value.trim(),
        categoria: document.getElementById('prodCategoria').value,
        nombre: document.getElementById('prodNombre').value.trim(),
        precio: Number(document.getElementById('prodPrecio').value)
    };

    //IDS DUPLICADOS
    if(idEnEdicion === null){
        const idExiste = productosAdmin.some(p=> p.id.toLowerCase() === producto.id.toLowerCase());
        if(idExiste){
            alert(`Error: El Código/ID "${producto.id}" ya existe en el inventario.`);
            return
        }
    }

    

    //Validar el largo minimo del nombre
    if(producto.nombre.lenght < 3){
        alert("El nombre del producto debe tener al menos 3 caracteres");
        return // se detiene la ejecucion y no guarda nada
    }

    //Validar el precio mayor a 0
    if (isNaN(producto.precio) || producto.precio <=0){
        alert("Por favor, Ingrese un precio valido mayor a 0.")
        return; //Detiene la ejecucion
    }


    //Si pasa todas las validacion, el codigo continua 
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