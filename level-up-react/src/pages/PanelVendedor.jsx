import { useState, useEffect } from 'react';
import api from '../services/api';
import { formatCLP } from '../utils/formatters';

export default function PanelVendedor() {
  const [ordenes, setOrdenes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [pestana, setPestana] = useState('ordenes');
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [errorOrdenes, setErrorOrdenes] = useState(null);
  const [errorProductos, setErrorProductos] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    setErrorOrdenes(null);
    setErrorProductos(null);

    // 1. Cargar Órdenes desde Backend oficial
    try {
      const res = await api.get('/ordenes');
      if (res.data && Array.isArray(res.data)) {
        setOrdenes(res.data);
      } else {
        setOrdenes([]);
      }
    } catch (e) {
      console.error('Error al cargar órdenes en panel vendedor:', e);
      setErrorOrdenes('No fue posible cargar las órdenes oficiales desde el servidor.');
      setOrdenes([]);
    }

    // 2. Cargar Productos desde Backend oficial
    try {
      const resProd = await api.get('/productos');
      if (resProd.data && Array.isArray(resProd.data)) {
        setProductos(resProd.data);
      } else {
        setProductos([]);
      }
    } catch (e) {
      console.error('Error al cargar productos en panel vendedor:', e);
      setErrorProductos('No fue posible cargar el inventario oficial desde el servidor.');
      setProductos([]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="container my-5 flex-grow-1">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <span className="badge bg-warning text-dark px-3 py-2 fw-bold mb-2">
            <i className="bi bi-briefcase-fill me-1"></i> ROL: VENDEDOR
          </span>
          <h1 className="h2 text-white brand-font mb-1">Portal de Ventas y Despacho</h1>
          <p className="text-muted mb-0">
            Visualización de órdenes de compra, clientes y existencias de productos en inventario.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={() => setPestana('ordenes')}
            className={`btn ${pestana === 'ordenes' ? 'btn-primary' : 'btn-outline-light'}`}
          >
            <i className="bi bi-receipt me-1"></i> Lista de Órdenes ({ordenes.length})
          </button>
          <button
            onClick={() => setPestana('productos')}
            className={`btn ${pestana === 'productos' ? 'btn-primary' : 'btn-outline-light'}`}
          >
            <i className="bi bi-box-seam me-1"></i> Catálogo de Productos ({productos.length})
          </button>
        </div>
      </div>

      {(errorOrdenes || errorProductos) && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4">
          <div>
            <i className="bi bi-exclamation-octagon-fill me-2"></i>
            {errorOrdenes || errorProductos}
          </div>
          <button className="btn btn-sm btn-outline-light" onClick={cargarDatos}>Reintentar</button>
        </div>
      )}

      {cargando ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status"></div>
          <p className="text-muted mt-2">Cargando información del servidor...</p>
        </div>
      ) : pestana === 'ordenes' ? (
        /* VISTA DE ÓRDENES Y BOLETAS */
        <div className="card gamer-card p-4">
          <h4 className="text-white h5 mb-3">
            <i className="bi bi-cart-check text-info me-2"></i>Historial de Ventas Registradas
          </h4>
          {ordenes.length === 0 ? (
            <p className="text-muted mb-0">No se han registrado órdenes todavía.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead>
                  <tr className="border-secondary text-secondary">
                    <th>N° Orden</th>
                    <th>Fecha</th>
                    <th>Comprador / Despacho</th>
                    <th>Método Pago</th>
                    <th>Total Pagado</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenes.map((ord, idx) => (
                    <tr key={ord.id || ord.idOrden || idx} className="border-secondary">
                      <td className="text-info fw-bold font-monospace">
                        {ord.numeroOrden || ord.idOrden || `#LVL-${idx + 1000}`}
                      </td>
                      <td className="text-light small">
                        {ord.fecha ? (typeof ord.fecha === 'string' ? ord.fecha.substring(0, 10) : ord.fecha) : 'Hoy'}
                      </td>
                      <td>
                        <div className="text-white fw-semibold">
                          {ord.usuario ? `${ord.usuario.nombre} ${ord.usuario.apellido || ''}` : (ord.nombreComprador || 'Cliente')}
                        </div>
                        <div className="text-muted small">
                          {ord.direccionDespacho || ord.direccionComprador || 'Retiro en Tienda'}
                        </div>
                      </td>
                      <td className="text-light small text-uppercase">{ord.metodoPago || ord.metodo || 'Webpay'}</td>
                      <td className="text-success font-monospace fw-bold">{formatCLP(ord.total || ord.totalPagado || 0)}</td>
                      <td>
                        <span className="badge bg-success bg-opacity-25 text-success border border-success">
                          {ord.estado || 'Pagado'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setOrdenSeleccionada(ord)}
                          className="btn btn-sm btn-outline-info"
                        >
                          <i className="bi bi-eye me-1"></i>Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* VISTA DE PRODUCTOS Y DETALLE */
        <div className="card gamer-card p-4">
          <h4 className="text-white h5 mb-3">
            <i className="bi bi-grid text-info me-2"></i>Inventario Disponible para Venta
          </h4>
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead>
                <tr className="border-secondary text-secondary">
                  <th>ID / Código</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio Venta</th>
                  <th>Stock Actual</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((prod) => (
                  <tr key={prod.id} className="border-secondary">
                    <td className="text-info font-monospace small">{prod.id}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {prod.imagen && (
                          <img
                            src={prod.imagen}
                            alt={prod.nombre}
                            style={{ width: '38px', height: '38px', objectFit: 'cover' }}
                            className="rounded-2 border border-secondary"
                          />
                        )}
                        <div>
                          <span className="text-white fw-semibold">{prod.nombre}</span>
                          <p className="text-muted small mb-0 text-truncate" style={{ maxWidth: '350px' }}>
                            {prod.descripcionCorta || 'Sin descripción'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-dark border border-secondary text-info">
                        {prod.categoria || 'General'}
                      </span>
                    </td>
                    <td className="text-success font-monospace fw-bold">{formatCLP(prod.precio)}</td>
                    <td>
                      <span className={`fw-bold ${prod.stock <= 3 ? 'text-danger' : 'text-light'}`}>
                        {prod.stock ?? 10} un.
                      </span>
                    </td>
                    <td>
                      {(prod.stock ?? 10) > 0 ? (
                        <span className="badge bg-success">Disponible</span>
                      ) : (
                        <span className="badge bg-danger">Agotado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Orden Seleccionada */}
      {ordenSeleccionada && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content gamer-card text-white border border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title brand-font text-info">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Detalle de Boleta {ordenSeleccionada.numeroOrden || ordenSeleccionada.idOrden}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setOrdenSeleccionada(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3 mb-3 p-3 bg-dark rounded-3 border border-secondary">
                  <div className="col-sm-6">
                    <span className="text-secondary small d-block">CLIENTE:</span>
                    <strong className="text-white">
                      {ordenSeleccionada.usuario ? `${ordenSeleccionada.usuario.nombre} ${ordenSeleccionada.usuario.apellido || ''}` : (ordenSeleccionada.nombreComprador || 'Cliente Registrado')}
                    </strong>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-secondary small d-block">MÉTODO DE PAGO:</span>
                    <strong className="text-white text-uppercase">
                      {ordenSeleccionada.metodoPago || ordenSeleccionada.metodo || 'Webpay Plus'}
                    </strong>
                  </div>
                  <div className="col-12">
                    <span className="text-secondary small d-block">DIRECCIÓN DE ENTREGA:</span>
                    <span className="text-light">
                      {ordenSeleccionada.direccionDespacho || ordenSeleccionada.direccionComprador || 'Sin dirección'}
                    </span>
                  </div>
                </div>

                <h6 className="text-white mb-2">Artículos Vendidos:</h6>
                {ordenSeleccionada.detalles && ordenSeleccionada.detalles.length > 0 ? (
                  <ul className="list-group list-group-flush mb-3">
                    {ordenSeleccionada.detalles.map((det, i) => (
                      <li key={i} className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between">
                        <span>{det.producto?.nombre || 'Producto'} x{det.cantidad}</span>
                        <strong className="text-success font-monospace">{formatCLP(det.subtotal)}</strong>
                      </li>
                    ))}
                  </ul>
                ) : ordenSeleccionada.productos && ordenSeleccionada.productos.length > 0 ? (
                  <ul className="list-group list-group-flush mb-3">
                    {ordenSeleccionada.productos.map((p, i) => (
                      <li key={i} className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between">
                        <span>{p.nombre} x{p.cantidad}</span>
                        <strong className="text-success font-monospace">{formatCLP(p.precio * p.cantidad)}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted small">Detalle registrado en sistema.</p>
                )}

                <div className="d-flex justify-content-between align-items-center pt-2 border-top border-secondary">
                  <span className="h6 text-white mb-0">Total Boleta:</span>
                  <span className="h4 text-success font-monospace fw-bold mb-0">
                    {formatCLP(ordenSeleccionada.total || ordenSeleccionada.totalPagado || 0)}
                  </span>
                </div>
              </div>
              <div className="modal-footer border-secondary">
                <button
                  type="button"
                  className="btn btn-outline-info"
                  onClick={() => setOrdenSeleccionada(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
