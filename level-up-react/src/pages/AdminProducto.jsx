import React, { useState, useEffect } from 'react';

import { PRODUCTOS_DATA } from '../js/products-data';

export default function AdminProducto() {
    // 1. Estado para almacenar productos y filtro de búsqueda
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');

    // Estado para controlar la visibilidad del modal y el modo (crear o editar)
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);

    // Estado para el formulario del producto
    const [formProducto, setFormProducto] = useState({
        id: '',
        nombre: '',
        categoria: 'Consolas',
        precio: '',
        stock: '',
        imagen: '',
        descripcion: ''
    });

    // 2. Cargar productos desde localStorage al cargar la página
    useEffect(() => {
    const productosGuardados = localStorage.getItem('levelup_productos');

    if (productosGuardados) {
        try {
            setProductos(JSON.parse(productosGuardados));
        } catch (e) {
            console.error('Error al parsear productos:', e);
            setProductos(PRODUCTOS_DATA);
            localStorage.setItem(
                'levelup_productos',
                JSON.stringify(PRODUCTOS_DATA)
            );
        }
    } else {
        // Si el localStorage está vacío, copiamos el catálogo base inicial
        setProductos(PRODUCTOS_DATA);
        localStorage.setItem(
            'levelup_productos',
            JSON.stringify(PRODUCTOS_DATA)
        );
    }
    }, []);

    // Guardar productos en localStorage y actualizar la vista
    const guardarProductos = (nuevosProductos) => {
        setProductos(nuevosProductos);
        localStorage.setItem(
            'levelup_productos',
            JSON.stringify(nuevosProductos)
        );
    };

    // Manejar cambios en las cajas de texto del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormProducto({
            ...formProducto,
            [name]: value
        });
    };

    // Abrir modal para crear un nuevo producto
    const abrirModalCrear = () => {
        setModoEdicion(false);

        setFormProducto({
            id: Date.now().toString(),
            nombre: '',
            categoria: 'Consolas',
            precio: '',
            stock: '',
            imagen: '/img/productos/default.jpg',
            descripcion: ''
        });

        setModalAbierto(true);
    };

    // Abrir modal para editar un producto existente
    const abrirModalEditar = (prod) => {
        setModoEdicion(true);
        setFormProducto({ ...prod });
        setModalAbierto(true);
    };

    // Guardar producto (agregar o actualizar)
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formProducto.nombre || !formProducto.precio) {
            alert('Por favor completa el nombre y el precio del producto.');
            return;
        }

        let nuevosProductos;

        if (modoEdicion) {
            // Actualizar producto existente
            nuevosProductos = productos.map((p) =>
                p.id === formProducto.id ? formProducto : p
            );
        } else {
            // Agregar nuevo producto
            nuevosProductos = [...productos, formProducto];
        }

        guardarProductos(nuevosProductos);
        setModalAbierto(false);

        alert(
            modoEdicion
                ? '¡Producto actualizado correctamente!'
                : '¡Producto agregado al inventario!'
        );
    };

    // Eliminar producto
    const handleEliminar = (id, nombre) => {
        if (
            window.confirm(
                `¿Seguro que deseas eliminar "${nombre}" del catálogo?`
            )
        ) {
            const nuevos = productos.filter((p) => p.id !== id);
            guardarProductos(nuevos);
        }
    };

    // Filtrar productos según la búsqueda
    const productosFiltrados = productos.filter(
        (p) =>
            (p.nombre &&
                p.nombre
                    .toLowerCase()
                    .includes(busqueda.toLowerCase())) ||
            (p.categoria &&
                p.categoria
                    .toLowerCase()
                    .includes(busqueda.toLowerCase()))
    );

    return (
        <main className="container py-4">
            {/* Encabezado y botón Agregar */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>Gestión de Inventario</h2>
                    <p>
                        Administra el catálogo de productos disponibles en
                        Level-Up Gamer.
                    </p>
                </div>

                <div className="d-flex gap-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar producto..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        style={{ maxWidth: '250px' }}
                    />

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={abrirModalCrear}
                    >
                        Agregar producto
                    </button>
                </div>
            </div>

            {/* Tabla de productos */}
            <div className="table-responsive">
                <table className="table table-dark table-striped table-hover align-middle">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {productosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-4">
                                    No hay productos registrados en el
                                    inventario.
                                </td>
                            </tr>
                        ) : (
                            productosFiltrados.map((prod) => (
                                <tr key={prod.id}>
                                    <td>#{prod.id}</td>

                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            {prod.imagen && (
                                                <img
                                                    src={prod.imagen}
                                                    alt={prod.nombre}
                                                    style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px'
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display =
                                                            'none';
                                                    }}
                                                />
                                            )}

                                            <span>{prod.nombre}</span>
                                        </div>
                                    </td>

                                    <td>
                                        <span className="badge bg-secondary">
                                            {prod.categoria}
                                        </span>
                                    </td>

                                    <td>
                                        ${' '}
                                        {Number(prod.precio).toLocaleString(
                                            'es-CL'
                                        )}
                                    </td>

                                    <td>
                                        <span
                                            className={`badge ${
                                                Number(prod.stock) > 0
                                                    ? 'bg-success'
                                                    : 'bg-danger'
                                            }`}
                                        >
                                            {prod.stock} unids.
                                        </span>
                                    </td>

                                    <td>
                                        <div className="d-flex gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-warning"
                                                onClick={() =>
                                                    abrirModalEditar(prod)
                                                }
                                            >
                                                Editar
                                            </button>

                                            <button
                                                type="button"
                                                className="btn btn-sm btn-danger"
                                                onClick={() =>
                                                    handleEliminar(
                                                        prod.id,
                                                        prod.nombre
                                                    )
                                                }
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Formulario / Modal para Agregar y Editar */}
            {modalAbierto && (
                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                    }}
                >
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {modoEdicion
                                        ? 'Editar Producto'
                                        : 'Nuevo Producto'}
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setModalAbierto(false)}
                                ></button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        {/* Nombre */}
                                        <div className="col-md-6">
                                            <label
                                                htmlFor="nombre"
                                                className="form-label"
                                            >
                                                Nombre
                                            </label>

                                            <input
                                                type="text"
                                                id="nombre"
                                                name="nombre"
                                                className="form-control"
                                                value={formProducto.nombre}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        {/* Categoría */}
                                        <div className="col-md-6">
                                            <label
                                                htmlFor="categoria"
                                                className="form-label"
                                            >
                                                Categoría
                                            </label>

                                            <select
                                                id="categoria"
                                                name="categoria"
                                                className="form-select"
                                                value={
                                                    formProducto.categoria
                                                }
                                                onChange={handleChange}
                                            >
                                                <option value="Consolas">
                                                    Consolas
                                                </option>
                                                <option value="Videojuegos">
                                                    Videojuegos
                                                </option>
                                                <option value="Accesorios">
                                                    Accesorios
                                                </option>
                                                <option value="PC Gaming">
                                                    PC Gaming
                                                </option>
                                                <option value="Perifericos">
                                                    Periféricos
                                                </option>
                                            </select>
                                        </div>

                                        {/* Precio */}
                                        <div className="col-md-6">
                                            <label
                                                htmlFor="precio"
                                                className="form-label"
                                            >
                                                Precio
                                            </label>

                                            <input
                                                type="number"
                                                id="precio"
                                                name="precio"
                                                className="form-control"
                                                min="0"
                                                value={formProducto.precio}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        {/* Stock */}
                                        <div className="col-md-6">
                                            <label
                                                htmlFor="stock"
                                                className="form-label"
                                            >
                                                Stock
                                            </label>

                                            <input
                                                type="number"
                                                id="stock"
                                                name="stock"
                                                className="form-control"
                                                min="0"
                                                value={formProducto.stock}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        {/* Imagen */}
                                        <div className="col-12">
                                            <label
                                                htmlFor="imagen"
                                                className="form-label"
                                            >
                                                URL de imagen
                                            </label>

                                            <input
                                                type="text"
                                                id="imagen"
                                                name="imagen"
                                                className="form-control"
                                                value={formProducto.imagen}
                                                onChange={handleChange}
                                                placeholder="/img/productos/producto.jpg"
                                            />
                                        </div>

                                        {/* Descripción */}
                                        <div className="col-12">
                                            <label
                                                htmlFor="descripcion"
                                                className="form-label"
                                            >
                                                Descripción
                                            </label>

                                            <textarea
                                                id="descripcion"
                                                name="descripcion"
                                                className="form-control"
                                                rows="4"
                                                value={
                                                    formProducto.descripcion
                                                }
                                                onChange={handleChange}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() =>
                                            setModalAbierto(false)
                                        }
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        {modoEdicion
                                            ? 'Guardar cambios'
                                            : 'Agregar producto'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
