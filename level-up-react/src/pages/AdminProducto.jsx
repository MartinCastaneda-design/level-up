import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminProducto() {
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [mostrarSoloCriticos, setMostrarSoloCriticos] = useState(false);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);

    const [formProducto, setFormProducto] = useState({
        id: '',
        nombre: '',
        categoria: 'Consolas',
        precio: '',
        stock: '',
        imagen: '',
        descripcion: ''
    });

    const [cargando, setCargando] = useState(false);
    const [errorCarga, setErrorCarga] = useState(null);

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        setCargando(true);
        setErrorCarga(null);
        try {
            const res = await api.get('/productos');
            if (res.data && Array.isArray(res.data)) {
                setProductos(res.data);
            } else {
                setProductos([]);
            }
        } catch (e) {
            console.error('Error al listar productos desde el backend:', e);
            setErrorCarga('No fue posible conectar con el servidor para obtener el inventario.');
            setProductos([]);
        } finally {
            setCargando(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormProducto({
            ...formProducto,
            [name]: value
        });
    };

    const abrirModalCrear = () => {
        setModoEdicion(false);

        setFormProducto({
            id: '',
            nombre: '',
            categoria: 'Consolas',
            precio: '',
            stock: '',
            imagen: '/img/productos/default.jpg',
            descripcion: ''
        });

        setModalAbierto(true);
    };

    const abrirModalEditar = (prod) => {
        setModoEdicion(true);
        setFormProducto({ ...prod });
        setModalAbierto(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formProducto.nombre || !formProducto.precio) {
            alert('Por favor completa el nombre y el precio del producto.');
            return;
        }

        const payload = {
            id: formProducto.id || undefined,
            nombre: formProducto.nombre.trim(),
            categoria: formProducto.categoria,
            categoriaSlug: formProducto.categoria.toLowerCase().replace(/ /g, '-'),
            precio: Number(formProducto.precio),
            stock: Number(formProducto.stock) || 0,
            imagen: formProducto.imagen || '/img/productos/default.jpg',
            descripcionCorta: formProducto.descripcion || formProducto.descripcionCorta || '',
            descripcionLarga: formProducto.descripcion || formProducto.descripcionLarga || ''
        };

        try {
            if (modoEdicion) {
                await api.put(`/productos/${formProducto.id}`, payload);
            } else {
                await api.post('/productos', payload);
            }
            await cargarProductos();
            setModalAbierto(false);
            alert(
                modoEdicion
                    ? '¡Producto actualizado correctamente!'
                    : '¡Producto agregado al inventario!'
            );
        } catch (err) {
            console.error('Error al guardar producto en API:', err);
            const msg = err.response?.data?.error || err.response?.data?.message || 'Error al comunicarse con el servidor';
            alert(`No se pudo guardar el producto: ${msg}`);
        }
    };

    const handleEliminar = async (id, nombre) => {
        if (
            window.confirm(
                `¿Seguro que deseas eliminar "${nombre}" del catálogo?`
            )
        ) {
            try {
                await api.delete(`/productos/${id}`);
                await cargarProductos();
                alert(`Producto "${nombre}" eliminado correctamente.`);
            } catch (err) {
                console.error('Error al eliminar en API:', err);
                const msg = err.response?.data?.error || err.response?.data?.message || 'No se pudo eliminar del servidor';
                alert(`Error al eliminar: ${msg}`);
            }
        }
    };

    const productosFiltrados = productos.filter((p) => {
        const coincideBusqueda =
            (p.nombre && p.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
            (p.categoria && p.categoria.toLowerCase().includes(busqueda.toLowerCase()));

        const esCritico = Number(p.stock) <= 5

        return coincideBusqueda && (!mostrarSoloCriticos || esCritico);
        });

return (
        <main className="container py-4">
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

            {errorCarga && (
                <div className="alert alert-danger d-flex justify-content-between align-items-center mb-3">
                    <div><i className="bi bi-exclamation-octagon-fill me-2"></i>{errorCarga}</div>
                    <button className="btn btn-sm btn-outline-light" onClick={cargarProductos}>Reintentar</button>
                </div>
            )}

            {cargando && (
                <div className="text-center py-4">
                    <div className="spinner-border text-info" role="status"></div>
                    <p className="text-muted mt-2">Cargando inventario oficial...</p>
                </div>
            )}

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
                                            type='button'
                                            className={mostrarSoloCriticos ? "btn btn-warning" : "btn btn-outline-warning"}
                                            onClick={() => setMostrarSoloCriticos(!mostrarSoloCriticos)}

                                            >
                                                {mostrarSoloCriticos ? "X Mostrar todos": "⚠ Ver solo críticos"}

                                            </button>
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
