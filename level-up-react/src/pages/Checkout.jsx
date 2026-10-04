import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCLP } from '../js/products-data';

export const Checkout = () => {
  const { carrito, subtotal, montoDescuento, porcentajeDescuento, total, vaciarCarrito } = useCart();
  const { usuario, agregarPuntos, descontarPuntos } = useAuth();

  // Estados del Formulario de Envío
  const [nombre, setNombre] = useState(usuario ? usuario.nombre : '');
  const [apellido, setApellido] = useState(usuario ? (usuario.apellido || '') : '');
  const [email, setEmail] = useState(usuario ? usuario.correo : '');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [region, setRegion] = useState('');
  const [comuna, setComuna] = useState('');
  const [metodoPago, setMetodoPago] = useState('Webpay Plus (Débito/Crédito)');

  // Modal de Compra Exitosa
  const [ordenExitosa, setOrdenExitosa] = useState(null);

  // Si no hay usuario activo registrado/logueado
  if (!usuario) {
    return (
      <main className="container my-5 flex-grow-1">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h2 mb-1">💳 Finalizar Compra</h1>
            <p className="text-muted mb-0">Completa tus datos de despacho y método de pago</p>
          </div>
          <Link to="/carrito" className="btn btn-outline-info btn-sm">
            <i className="bi bi-arrow-left me-1"></i>Volver al Carrito
          </Link>
        </div>

        <div className="card gamer-card p-5 text-center my-4">
          <i className="bi bi-shield-lock-fill fs-1 text-warning mb-3"></i>
          <h3 className="text-white fw-bold">Inicio de Sesión Requerido</h3>
          <p className="text-muted mb-4">
            Debes estar registrado o haber iniciado sesión con tu cuenta gamer para proceder al pago de tu orden.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/Login" className="btn btn-primary btn-lg px-4">
              <i className="bi bi-box-arrow-in-right me-2"></i>Iniciar Sesión
            </Link>
            <Link to="/Register" className="btn btn-outline-light btn-lg px-4">
              <i className="bi bi-person-plus me-2"></i>Crear Cuenta
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Si no hay productos en el carrito y no hay orden finalizada
  if ((!carrito || carrito.length === 0) && !ordenExitosa) {
    return (
      <main className="container my-5 flex-grow-1">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h2 mb-1">💳 Finalizar Compra</h1>
            <p className="text-muted mb-0">Completa tus datos de despacho y método de pago</p>
          </div>
          <Link to="/carrito" className="btn btn-outline-info btn-sm">
            <i className="bi bi-arrow-left me-1"></i>Volver al Carrito
          </Link>
        </div>

        <div className="card gamer-card p-5 text-center my-4">
          <i className="bi bi-cart-x fs-1 text-info mb-3"></i>
          <h3 className="text-white fw-bold">No hay productos por pagar</h3>
          <p className="text-muted mb-4">Tu carrito está vacío. Agrega artículos antes de proceder al checkout.</p>
          <div>
            <Link to="/catalogo" className="btn btn-primary btn-lg px-4">
              <i className="bi bi-controller me-2"></i>Ir al Catálogo de Productos
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const handleProcesarPago = (e) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim() || !email.trim() || !direccion.trim() || !region || !comuna.trim()) {
      alert('Por favor completa todos los campos requeridos con asterisco (*).');
      return;
    }

    let puntosUsados = 0;
    let puntosGanados = 0;

    // Lógica condicional de pago
    if (metodoPago === 'Puntos LevelUp') {
      const puntosNecesarios = Math.floor(total / 10); // 1 punto equivale a $10 CLP
      
      if ((usuario.puntosLevelUp || 0) < puntosNecesarios) {
        alert(`Saldo insuficiente. Necesitas ${puntosNecesarios} pts, pero tienes ${usuario.puntosLevelUp || 0} pts.`);
        return; // Detiene la compra instantáneamente
      }
      
      // Ejecutamos el descuento de puntos
      descontarPuntos(puntosNecesarios);
      puntosUsados = puntosNecesarios;
    } else {
      // Si paga con otro método (Webpay, Transferencia), GANA puntos
      puntosGanados = Math.floor(total / 1000);
      agregarPuntos(puntosGanados);
    }
    
    const numOrden = '#LVL-' + Math.floor(10000 + Math.random() * 90000);
    
    const nuevaCompra = {
      idOrden: numOrden,
      fecha: new Date().toLocaleDateString('es-CL'),
      correo: usuario.correo, 
      metodo: metodoPago,
      cantidadItems: carrito.reduce((acc, item) => acc + item.cantidad, 0),
      totalPagado: total,
      puntosGanados: puntosGanados, // Si pagó con puntos, esto será 0
      puntosUsados: puntosUsados,   // Si ganó puntos, esto será 0
      productos: carrito
    };

    let historialCompras = JSON.parse(localStorage.getItem('levelup_compras')) || [];
    historialCompras.unshift(nuevaCompra);
    localStorage.setItem('levelup_compras', JSON.stringify(historialCompras));

    const orden = {
      numOrden,
      destinatario: `${nombre} ${apellido}`,
      total: total,
      metodoPago: metodoPago,
      direccion: `${direccion}, ${comuna}, ${region}`
    };

    setOrdenExitosa(orden);
    vaciarCarrito();
  };

  return (
    <main className="container my-5 flex-grow-1">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">💳 Finalizar Compra</h1>
          <p className="text-muted mb-0">Completa tus datos de despacho y método de pago</p>
        </div>
        <Link to="/carrito" className="btn btn-outline-info btn-sm">
          <i className="bi bi-arrow-left me-1"></i>Volver al Carrito
        </Link>
      </div>

      <div id="contenedorCheckout">
        <div className="row g-4">
          {/* Formulario de Despacho y Pago */}
          <div className="col-lg-7">
            <form id="formCheckout" onSubmit={handleProcesarPago} noValidate>
              {/* 1. Datos Personales */}
              <div className="card gamer-card p-4 mb-4">
                <h4 className="h5 text-white brand-font mb-3">
                  <i className="bi bi-person-lines-fill text-info me-2"></i>1. Datos de Contacto y Facturación
                </h4>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="checkNombre" className="form-label text-muted small">Nombre *</label>
                    <input
                      type="text"
                      className="form-control bg-dark border-secondary text-light"
                      id="checkNombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="checkApellido" className="form-label text-muted small">Apellido *</label>
                    <input
                      type="text"
                      className="form-control bg-dark border-secondary text-light"
                      id="checkApellido"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="checkEmail" className="form-label text-muted small">Correo Electrónico *</label>
                    <input
                      type="email"
                      className="form-control bg-dark border-secondary text-light"
                      id="checkEmail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="checkTelefono" className="form-label text-muted small">Teléfono de Contacto *</label>
                    <input
                      type="tel"
                      className="form-control bg-dark border-secondary text-light"
                      id="checkTelefono"
                      placeholder="+56 9 1234 5678"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 2. Dirección de Envío */}
              <div className="card gamer-card p-4 mb-4">
                <h4 className="h5 text-white brand-font mb-3">
                  <i className="bi bi-geo-alt-fill text-info me-2"></i>2. Dirección de Despacho (Chile)
                </h4>
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="checkDireccion" className="form-label text-muted small">Calle, Número, Depto / Casa *</label>
                    <input
                      type="text"
                      className="form-control bg-dark border-secondary text-light"
                      id="checkDireccion"
                      placeholder="Ej: Av. Providencia 1234, Depto 502"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="checkRegion" className="form-label text-muted small">Región *</label>
                    <select
                      className="form-select bg-dark border-secondary text-light"
                      id="checkRegion"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      required
                    >
                      <option value="" disabled>Selecciona Región</option>
                      <option value="Metropolitana">Región Metropolitana</option>
                      <option value="Valparaiso">Región de Valparaíso</option>
                      <option value="Biobio">Región del Biobío</option>
                      <option value="Antofagasta">Región de Antofagasta</option>
                      <option value="Araucania">Región de La Araucanía</option>
                      <option value="Coquimbo">Región de Coquimbo</option>
                      <option value="LosLagos">Región de Los Lagos</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="checkComuna" className="form-label text-muted small">Comuna / Ciudad *</label>
                    <input
                      type="text"
                      className="form-control bg-dark border-secondary text-light"
                      id="checkComuna"
                      placeholder="Ej: Santiago / Providencia / Viña"
                      value={comuna}
                      onChange={(e) => setComuna(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 3. Selección de Método de Pago */}
              <div className="card gamer-card p-4 mb-4">
                <h4 className="h5 text-white brand-font mb-3">
                  <i className="bi bi-wallet2 text-info me-2"></i>3. Método de Pago Simulado
                </h4>
                <div className="d-flex flex-column gap-3">
                  <div className="form-check p-3 bg-dark rounded-3 border border-secondary d-flex align-items-center gap-3">
                    <input
                      className="form-check-input ms-0 me-2"
                      type="radio"
                      name="metodoPago"
                      id="pagoWebpay"
                      value="Webpay Plus (Débito/Crédito)"
                      checked={metodoPago === 'Webpay Plus (Débito/Crédito)'}
                      onChange={(e) => setMetodoPago(e.target.value)}
                    />
                    <label className="form-check-label text-white w-100 cursor-pointer d-flex justify-content-between align-items-center" htmlFor="pagoWebpay">
                      <span><strong>Webpay Plus</strong> (Tarjetas de Débito y Crédito)</span>
                      <i className="bi bi-credit-card-2-front text-info fs-4"></i>
                    </label>
                  </div>

                  <div className="form-check p-3 bg-dark rounded-3 border border-secondary d-flex align-items-center gap-3">
                    <input
                      className="form-check-input ms-0 me-2"
                      type="radio"
                      name="metodoPago"
                      id="pagoTransferencia"
                      value="Transferencia Bancaria"
                      checked={metodoPago === 'Transferencia Bancaria'}
                      onChange={(e) => setMetodoPago(e.target.value)}
                    />
                    <label className="form-check-label text-white w-100 cursor-pointer d-flex justify-content-between align-items-center" htmlFor="pagoTransferencia">
                      <span><strong>Transferencia Electrónica</strong> (Banco Estado / Santander / Chile)</span>
                      <i className="bi bi-bank text-info fs-4"></i>
                    </label>
                  </div>

                  <div className="form-check p-3 bg-dark rounded-3 border border-secondary d-flex align-items-center gap-3">
                    <input
                      className="form-check-input ms-0 me-2"
                      type="radio"
                      name="metodoPago"
                      id="pagoPuntos"
                      value="Puntos LevelUp"
                      checked={metodoPago === 'Puntos LevelUp'}
                      onChange={(e) => setMetodoPago(e.target.value)}
                    />
                    <label className="form-check-label text-white w-100 cursor-pointer d-flex justify-content-between align-items-center" htmlFor="pagoPuntos">
                      <span><strong>Puntos LevelUp</strong> (Canje Gamer)</span>
                      <i className="bi bi-star-fill text-warning fs-4"></i>
                    </label>
                  </div>
                </div>

                {/* Detalle del Pago Simulado */}
                <div id="panelDetallePago" className="p-3 bg-dark rounded-3 border border-secondary mt-3">
                  {metodoPago.includes('Webpay') && (
                    <>
                      <div className="small text-muted mb-2"><i className="bi bi-info-circle text-info me-1"></i>Ingreso de tarjeta de prueba:</div>
                      <div className="row g-2">
                        <div className="col-8">
                          <input type="text" className="form-control form-control-sm bg-dark border-secondary text-light" placeholder="1234 5678 9101 1121" maxLength="19" defaultValue="4512 8899 7744 1234" />
                        </div>
                        <div className="col-4">
                          <input type="text" className="form-control form-control-sm bg-dark border-secondary text-light" placeholder="MM/AA" maxLength="5" defaultValue="12/28" />
                        </div>
                      </div>
                    </>
                  )}
                  {metodoPago.includes('Transferencia') && (
                    <div className="small text-light">
                      <strong>Datos para transferencia:</strong><br />
                      Banco: Banco Estado / Santander<br />
                      Cuenta Corriente: 99882233-1<br />
                      RUT: 76.889.000-K - Level-Up Gamer SpA<br />
                      Correo: pagos@levelupgamer.cl
                    </div>
                  )}
                  {metodoPago.includes('Puntos') && (
                    <div className="small text-warning">
                      <i className="bi bi-star-fill me-1"></i>Se descontarán tus puntos LevelUp acumulados como método de pago de esta orden (10 pts = $100 CLP).
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-100 py-3 fw-bold">
                <i className="bi bi-lock-fill me-2"></i>Confirmar y Realizar Pedido ({formatCLP(total)})
              </button>
            </form>
          </div>

          {/* Resumen del Pedido */}
          <div className="col-lg-5">
            <div className="card gamer-card p-4 sticky-top" style={{ top: '90px' }}>
              <h4 className="h5 text-white brand-font mb-3 pb-2 border-bottom border-secondary">Resumen de la Compra</h4>

              <div className="mb-3" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {carrito.map((item) => (
                  <div key={item.id} className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary">
                    <div className="d-flex align-items-center gap-2">
                      <img src={item.imagen} alt={item.nombre} className="rounded-2" style={{ width: '45px', height: '45px', objectFit: 'cover' }} />
                      <div>
                        <h6 className="text-white mb-0 small text-truncate" style={{ maxWidth: '170px' }}>{item.nombre}</h6>
                        <span className="text-muted small">Cant: {item.cantidad}</span>
                      </div>
                    </div>
                    <span className="text-light small fw-bold">{formatCLP(item.precio * item.cantidad)}</span>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-between text-muted mb-2">
                <span>Subtotal:</span>
                <span className="text-light">{formatCLP(subtotal)}</span>
              </div>

              {montoDescuento > 0 && (
                <div className="d-flex justify-content-between text-warning mb-2">
                  <span>Descuento aplicado ({porcentajeDescuento}%):</span>
                  <span>-{formatCLP(montoDescuento)}</span>
                </div>
              )}

              <div className="d-flex justify-content-between text-muted mb-3">
                <span>Costo de Despacho:</span>
                <span className="text-success fw-bold">Gratis</span>
              </div>

              <hr className="border-secondary my-3" />

              {/* Puntos a ganar por la compra */}
              <div className="p-3 mb-3 rounded-3 d-flex align-items-center justify-content-between" style={{ background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-coin text-warning fs-4"></i>
                  <div>
                    <strong className="text-white small d-block">Puntos LevelUp que ganarás:</strong>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>1 punto por cada $1.000 gastados</span>
                  </div>
                </div>
                <span className="badge bg-warning text-dark fs-6 fw-bold px-3 py-2 shadow-sm" id="badgePuntosGanar">
                  +{Math.floor(total / 1000)} pts
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-baseline mb-4">
                <span className="text-white fw-bold fs-5">Total a Pagar:</span>
                <span className="price-tag fs-2">{formatCLP(total)}</span>
              </div>

              <div className="p-3 bg-dark rounded-3 border border-secondary text-muted small">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <i className="bi bi-shield-check text-success fs-5"></i>
                  <strong className="text-white">Transacción 100% Protegida</strong>
                </div>
                <span>Tus datos de compra viajan encriptados de extremo a extremo.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Compra Exitosa */}
      {ordenExitosa && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1060 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-white" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <div className="modal-header border-bottom border-secondary">
                <h5 className="modal-title brand-font text-info">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>¡Compra Realizada con Éxito!
                </h5>
              </div>
              <div className="modal-body text-center py-4">
                <div className="mb-3">
                  <i className="bi bi-controller text-info" style={{ fontSize: '3.5rem' }}></i>
                </div>
                <h4 className="text-white fw-bold mb-2">¡Gracias por tu compra en Level-Up Gamer!</h4>
                <p className="text-muted small mb-3">
                  Hemos recibido tu pedido correctamente. En breve recibirás un correo con el comprobante y el seguimiento de tu despacho.
                </p>
                <div className="p-3 bg-dark rounded-3 border border-secondary text-start mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted small">Número de Orden:</span>
                    <strong className="text-info">{ordenExitosa.numOrden}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted small">Destinatario:</span>
                    <span className="text-light small">{ordenExitosa.destinatario}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted small">Total Pagado:</span>
                    <strong className="price-tag">{formatCLP(ordenExitosa.total)}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small">Método de Pago:</span>
                    <span className="text-light small">{ordenExitosa.metodoPago}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top border-secondary justify-content-center gap-2">
                <Link to="/" className="btn btn-primary px-3">
                  <i className="bi bi-house-door me-1"></i>Volver al Inicio
                </Link>
                <Link to="/catalogo" className="btn btn-outline-light px-3">
                  <i className="bi bi-controller me-1"></i>Seguir Explorando
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Checkout;
