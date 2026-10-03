import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCLP } from '../js/products-data';

export const Cart = () => {
  const {
    carrito,
    cupon,
    totalArticulos,
    subtotal,
    porcentajeDescuento,
    montoDescuento,
    total,
    actualizarCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    aplicarCuponDescuento,
    removerCupon
  } = useCart();

  const [inputCupon, setInputCupon] = useState('');
  const [feedbackCupon, setFeedbackCupon] = useState(null);

  const handleProcesarAplicarCupon = () => {
    if (!inputCupon.trim()) {
      setFeedbackCupon({ tipo: 'danger', mensaje: 'Por favor ingresa un código de cupón.' });
      return;
    }
    const resultado = aplicarCuponDescuento(inputCupon.trim());
    if (resultado.exito) {
      setFeedbackCupon({ tipo: 'success', mensaje: resultado.mensaje });
      setInputCupon('');
    } else {
      setFeedbackCupon({ tipo: 'danger', mensaje: resultado.mensaje });
    }
  };

  const handleProcesarRemoverCupon = () => {
    removerCupon();
    setFeedbackCupon({ tipo: 'warning', mensaje: 'Cupón removido.' });
    setTimeout(() => setFeedbackCupon(null), 3000);
  };

  const handleConfirmarVaciarCarrito = () => {
    if (window.confirm('¿Estás seguro de que deseas vaciar todos los productos de tu carrito?')) {
      vaciarCarrito();
    }
  };

  if (!carrito || carrito.length === 0) {
    return (
      <main className="container my-5 flex-grow-1">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="h2 mb-1">🛒 Carrito de Compras</h1>
            <p className="text-muted mb-0">Revisa y gestiona tus productos seleccionados</p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/catalogo" className="btn btn-outline-info btn-sm">
              <i className="bi bi-arrow-left me-1"></i>Seguir Comprando
            </Link>
          </div>
        </div>

        <div id="contenedorCarrito">
          <div className="card gamer-card p-5 text-center my-4">
            <i className="bi bi-cart-x fs-1 text-info mb-3"></i>
            <h3 className="text-white fw-bold">Tu carrito está vacío</h3>
            <p className="text-muted mb-4">Aún no has agregado ningún producto a tu compra.</p>
            <div>
              <Link to="/catalogo" className="btn btn-primary btn-lg px-4">
                <i className="bi bi-controller me-2"></i>Ir al Catálogo de Productos
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container my-5 flex-grow-1">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 mb-1">🛒 Carrito de Compras</h1>
          <p className="text-muted mb-0">Revisa y gestiona tus productos seleccionados</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/catalogo" className="btn btn-outline-info btn-sm">
            <i className="bi bi-arrow-left me-1"></i>Seguir Comprando
          </Link>
          <button id="btnVaciarTodo" className="btn btn-outline-danger btn-sm" onClick={handleConfirmarVaciarCarrito}>
            <i className="bi bi-trash me-1"></i>Vaciar Carrito
          </button>
        </div>
      </div>

      <div id="contenedorCarrito">
        <div className="row g-4">
          {/* Lista de Productos en Tabla */}
          <div className="col-lg-8">
            <div className="card gamer-card p-3 p-md-4">
              <div className="table-responsive">
                <table className="table table-dark table-borderless align-middle mb-0">
                  <thead>
                    <tr className="border-bottom border-secondary text-muted small text-uppercase">
                      <th colSpan="2">Producto</th>
                      <th className="d-none d-md-table-cell">Precio</th>
                      <th>Cantidad</th>
                      <th className="text-end pe-3">Subtotal</th>
                      <th className="text-center">Quitar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.map((item) => (
                      <tr key={item.id}>
                        <td style={{ width: '90px' }}>
                          <img
                            src={item.imagen}
                            alt={item.nombre}
                            className="rounded-3 border border-secondary"
                            style={{ width: '75px', height: '75px', objectFit: 'cover' }}
                          />
                        </td>
                        <td>
                          <h6 className="text-white mb-1">
                            <Link to={`/producto/${item.id}`} className="text-white text-decoration-none hover-info">
                              {item.nombre}
                            </Link>
                          </h6>
                          <span className="badge badge-category small">{item.categoria || 'Gamer'}</span>
                          <div className="text-muted small mt-1 d-md-none">Unitario: {formatCLP(item.precio)}</div>
                        </td>
                        <td className="d-none d-md-table-cell align-middle">
                          <span className="text-light">{formatCLP(item.precio)}</span>
                        </td>
                        <td className="align-middle" style={{ width: '140px' }}>
                          <div className="input-group input-group-sm">
                            <button
                              className="btn btn-outline-secondary text-white"
                              type="button"
                              onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              className="form-control bg-dark border-secondary text-light text-center fw-bold px-1"
                              value={item.cantidad}
                              min="1"
                              onChange={(e) => actualizarCantidad(item.id, e.target.value)}
                            />
                            <button
                              className="btn btn-outline-secondary text-white"
                              type="button"
                              onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="align-middle text-end pe-3">
                          <strong className="price-tag fs-6">{formatCLP(item.precio * item.cantidad)}</strong>
                        </td>
                        <td className="align-middle text-center" style={{ width: '50px' }}>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Eliminar producto"
                            onClick={() => eliminarDelCarrito(item.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sección de Cupón de Descuento */}
            <div className="card gamer-card p-3 p-md-4 mt-4">
              <h5 className="text-white brand-font h6 mb-3">
                <i className="bi bi-ticket-perforated text-info me-2"></i>¿Tienes un cupón de descuento?
              </h5>
              <div className="row g-2 align-items-center">
                <div className="col-12 col-sm-8">
                  <div className="input-group">
                    <input
                      type="text"
                      id="inputCodigoCupon"
                      className="form-control bg-dark text-light border-secondary"
                      placeholder="Ej: ESTUDIANTE20 o LEVELUP10"
                      value={inputCupon || (cupon ? cupon.codigo : '')}
                      onChange={(e) => setInputCupon(e.target.value)}
                    />
                    <button
                      className="btn btn-info text-dark fw-bold px-3"
                      type="button"
                      onClick={handleProcesarAplicarCupon}
                    >
                      Aplicar
                    </button>
                  </div>
                  {feedbackCupon && (
                    <div className={`small mt-2 text-${feedbackCupon.tipo}`}>
                      {feedbackCupon.mensaje}
                    </div>
                  )}
                </div>
                <div className="col-12 col-sm-4 text-sm-end">
                  {cupon && (
                    <button className="btn btn-outline-warning btn-sm" onClick={handleProcesarRemoverCupon}>
                      <i className="bi bi-x-circle me-1"></i>Quitar cupón
                    </button>
                  )}
                </div>
              </div>
              <div className="small text-muted mt-2">
                <i className="bi bi-info-circle me-1"></i>Usa <code className="text-warning bg-dark px-1 rounded">ESTUDIANTE20</code> para 20% de descuento o <code className="text-warning bg-dark px-1 rounded">LEVELUP10</code> para 10%.
              </div>
            </div>
          </div>

          {/* Resumen del Pedido */}
          <div className="col-lg-4">
            <div className="card gamer-card p-4 sticky-top" style={{ top: '90px' }}>
              <h4 className="h5 text-white brand-font mb-3 pb-2 border-bottom border-secondary">Resumen del Pedido</h4>

              <div className="d-flex justify-content-between text-muted mb-2">
                <span>Artículos ({totalArticulos}):</span>
                <span className="text-light">{formatCLP(subtotal)}</span>
              </div>

              {montoDescuento > 0 && (
                <div className="d-flex justify-content-between text-warning mb-2">
                  <span>Descuento ({porcentajeDescuento}%):</span>
                  <span>-{formatCLP(montoDescuento)}</span>
                </div>
              )}

              <div className="d-flex justify-content-between text-muted mb-3">
                <span>Costo de Envío:</span>
                <span className="text-success fw-bold">Gratis</span>
              </div>

              <hr className="border-secondary my-3" />

              <div className="d-flex justify-content-between align-items-baseline mb-4">
                <span className="text-white fw-bold fs-5">Total a Pagar:</span>
                <span className="price-tag fs-2">{formatCLP(total)}</span>
              </div>

              <div className="d-grid gap-2">
                <Link to="/checkout" className="btn btn-primary btn-lg py-2">
                  <i className="bi bi-credit-card me-2"></i>Ir al Checkout / Pagar
                </Link>
                <Link to="/catalogo" className="btn btn-outline-info btn-sm">
                  Seguir Comprando
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cart;
