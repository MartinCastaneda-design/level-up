import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getProductById } from '../data/productsData';
import { formatCLP } from '../utils/formatters';

const Perfil = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [usuarioActivo, setUsuarioActivo] = useState(null);
  const [usuarioDetalles, setUsuarioDetalles] = useState(null);
  const [puntos, setPuntos] = useState(0);
  const [nivel, setNivel] = useState({ nombre: 'Calculando...', color: 'bg-secondary', icono: '' });
  const [tabActiva, setTabActiva] = useState('datos'); 

  const [compras, setCompras] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [productosData, setProductosData] = useState([]); 

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    contrasena: ''
  });
  const [errores, setErrores] = useState({});
  const [mensajeExito, setMensajeExito] = useState(null);

  useEffect(() => {
    const userString = localStorage.getItem("usuario_activo");
    if (!userString) {
      navigate('/Login');
      return;
    }

    const user = JSON.parse(userString);
    setUsuarioActivo(user);

    const registros = JSON.parse(localStorage.getItem("registros")) || [];
    const userDb = registros.find(u => u.correo.toLowerCase() === user.correo.toLowerCase());
    
    if (userDb) {
      setUsuarioDetalles(userDb);
      const pts = userDb.puntosLevelUp || 0;
      setPuntos(pts);
      setNivel(calcularNivelGamer(pts));
      
      setFormData({
        nombre: userDb.nombre || '',
        apellido: userDb.apellido || '',
        email: userDb.correo || '',
        contrasena: '' 
      });
    }

    const todasLasCompras = JSON.parse(localStorage.getItem('levelup_compras')) || [];
    const misCompras = todasLasCompras.filter(compra => compra.correo.toLowerCase() === user.correo.toLowerCase());
    setCompras(misCompras);

    const todosFavoritos = JSON.parse(localStorage.getItem('levelup_favoritos')) || [];
    const misFavoritosIds = todosFavoritos.filter(fav => fav.correo.toLowerCase() === user.correo.toLowerCase());
    
    const misFavoritosConDetalle = misFavoritosIds.map(fav => {
      const producto = getProductById(fav.idProducto);
      return producto ? producto : null;
    }).filter(prod => prod !== null); 

    setFavoritos(misFavoritosConDetalle);

    const tabParam = searchParams.get('tab');
    if (tabParam === 'compras' || tabParam === 'favoritos') {
      setTabActiva(tabParam);
    }
    
  }, [navigate, searchParams]);

  const calcularNivelGamer = (pts) => {
    if (pts >= 2000) return { nombre: 'Leyenda', color: 'bg-info text-dark', icono: 'bi-gem' };
    if (pts >= 500) return { nombre: 'Oro', color: 'bg-warning text-dark', icono: 'bi-trophy-fill' };
    if (pts >= 100) return { nombre: 'Plata', color: 'bg-light text-dark', icono: 'bi-controller' };
    return { nombre: 'Bronce', color: 'bg-secondary text-white', icono: 'bi-joystick' };
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem("usuario_activo");
    navigate('/Login');
  };

  const handleCopiarCodigo = () => {
    if (usuarioDetalles && usuarioDetalles.codigo) {
      navigator.clipboard.writeText(usuarioDetalles.codigo).then(() => {
        alert(`¡Código ${usuarioDetalles.codigo} copiado al portapapeles!`);
      });
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const key = id.replace('txt', '').toLowerCase();
    setFormData({ ...formData, [key]: value });
    if (errores[key]) setErrores({ ...errores, [key]: null });
  };

  const handleActualizarPerfil = (e) => {
    e.preventDefault();
    let nuevosErrores = {};
    let hayErrores = false;

    if (!formData.nombre.trim()) { nuevosErrores.nombre = "El nombre es obligatorio."; hayErrores = true; }
    if (!formData.apellido.trim()) { nuevosErrores.apellido = "El apellido es obligatorio."; hayErrores = true; }
    if (!formData.email.trim()) { nuevosErrores.email = "El email es obligatorio."; hayErrores = true; }

    if (hayErrores) {
      setErrores(nuevosErrores);
      return;
    }

    let registros = JSON.parse(localStorage.getItem("registros")) || [];
    const usuarioIndex = registros.findIndex(u => u.correo.toLowerCase() === usuarioActivo.correo.toLowerCase());
    
    if (usuarioIndex !== -1) {
      registros[usuarioIndex].nombre = formData.nombre;
      registros[usuarioIndex].apellido = formData.apellido;
      registros[usuarioIndex].correo = formData.email;
      if (formData.contrasena.trim() !== "") {
        registros[usuarioIndex].contrasena = formData.contrasena;
      }
      localStorage.setItem("registros", JSON.stringify(registros));
    }

    const nuevoActivo = { ...usuarioActivo, nombre: formData.nombre, apellido: formData.apellido, correo: formData.email };
    localStorage.setItem("usuario_activo", JSON.stringify(nuevoActivo));
    setUsuarioActivo(nuevoActivo);

    setMensajeExito("Datos actualizados correctamente.");
    setTimeout(() => setMensajeExito(null), 3000);
  };

  const formatCLP = (valor) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(valor);
  };

  if (!usuarioActivo) return <div className="text-center mt-5 text-white">Cargando perfil...</div>;

  return (
    <main className="container my-5 flex-grow-1">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary pb-3">
        <div>
          <h1 className="h2 mb-1 brand-font text-white">Mi Cuenta</h1>
          <p className="text-muted mb-0">Gestiona tu información, revisa tus compras y productos favoritos</p>
        </div>
        <button type="button" className="btn btn-outline-danger" onClick={handleCerrarSesion}>
          <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
        </button>
      </div>

      <div className="row g-4 align-items-start">
        <div className="col-md-4 col-lg-3 sticky-md-top" style={{ top: '100px' }}>
          <div className="nav flex-column nav-pills gamer-card p-3 gap-2">
            <button 
              className={`nav-link text-start px-3 py-2 fw-bold ${tabActiva === 'datos' ? 'active' : ''}`}
              onClick={() => setTabActiva('datos')}
            >
              <i className="bi bi-person-vcard me-2"></i>Datos personales
            </button>
            <button 
              className={`nav-link text-start px-3 py-2 fw-bold ${tabActiva === 'compras' ? 'active' : ''}`}
              onClick={() => setTabActiva('compras')}
            >
              <i className="bi bi-bag-check me-2"></i>Compras
            </button>
            <button 
              className={`nav-link text-start px-3 py-2 fw-bold ${tabActiva === 'favoritos' ? 'active' : ''}`}
              onClick={() => setTabActiva('favoritos')}
            >
              <i className="bi bi-heart me-2"></i>Productos favoritos
            </button>
          </div>
        </div>

        <div className="col-md-8 col-lg-9">
          
          {tabActiva === 'datos' && (
            <div className="card gamer-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary pb-2">
                <h3 className="h4 text-info mb-0"><i className="bi bi-gear me-2"></i>Actualizar Datos</h3>
                <span className={`badge fs-6 shadow-sm ${nivel.color}`}>
                  <i className={`bi ${nivel.icono} me-1`}></i> Rango: {nivel.nombre} ({puntos} pts)
                </span>
              </div>
              
              {mensajeExito && (
                <div className="alert alert-success alert-box-status mb-4 d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill text-success fs-5"></i>
                  <div>{mensajeExito}</div>
                </div>
              )}

              <form onSubmit={handleActualizarPerfil}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="txtNombre" className="form-label text-muted small">Nombre</label>
                    <input type="text" className={`form-control bg-dark text-white border-secondary ${errores.nombre ? 'is-invalid' : ''}`} id="txtNombre" value={formData.nombre} onChange={handleInputChange} />
                    {errores.nombre && <div className="invalid-feedback-custom text-danger small mt-1">{errores.nombre}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="txtApellido" className="form-label text-muted small">Apellido</label>
                    <input type="text" className={`form-control bg-dark text-white border-secondary ${errores.apellido ? 'is-invalid' : ''}`} id="txtApellido" value={formData.apellido} onChange={handleInputChange} />
                    {errores.apellido && <div className="invalid-feedback-custom text-danger small mt-1">{errores.apellido}</div>}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="txtEmail" className="form-label text-muted small">Email</label>
                    <input type="email" className={`form-control bg-dark text-white border-secondary ${errores.email ? 'is-invalid' : ''}`} id="txtEmail" value={formData.email} onChange={handleInputChange} />
                    {errores.email && <div className="invalid-feedback-custom text-danger small mt-1">{errores.email}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="txtContrasena" className="form-label text-muted small">Nueva Contraseña</label>
                    <input type="password" className="form-control bg-dark text-white border-secondary" id="txtContrasena" placeholder="Dejar en blanco para no cambiar" value={formData.contrasena} onChange={handleInputChange} />
                  </div>
                </div>   
                
                <div className="mb-3 p-3 bg-dark rounded-3 border border-secondary d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small d-block">Tu código de invitación Level-Up:</span>
                    <strong className="text-warning fs-5 tracking-wide">{usuarioDetalles?.codigo || '-'}</strong>
                  </div>
                  <button type="button" className="btn btn-outline-info btn-sm" onClick={handleCopiarCodigo}>
                    <i className="bi bi-clipboard me-1"></i>Copiar código
                  </button>
                </div>    
                
                <div className="d-flex justify-content-end mt-3">
                  <button type="submit" className="btn btn-primary px-5">Guardar cambios</button>
                </div>
              </form>
            </div>
          )}

          {/* VISTA: COMPRAS CON ACORDEÓN BOOTSTRAP */}
          {tabActiva === 'compras' && (
            <div className="card bg-dark border-secondary p-4 shadow">
              <div className="d-flex align-items-center gap-2 mb-4 border-bottom border-secondary pb-3">
                <i className="bi bi-receipt fs-4 text-info"></i>
                <h3 className="mb-0 text-info brand-font">Historial de Compras</h3>
              </div>
              
              {compras.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-bag-x fs-1 text-muted mb-3 d-block"></i>
                  <h5 className="text-white">Aún no tienes compras registradas</h5>
                  <p className="text-muted">Cuando finalices un pedido, aparecerá aquí.</p>
                  <Link to="/catalogo" className="btn btn-outline-info mt-2">Ir al Catálogo</Link>
                </div>
              ) : (
                <div className="accordion accordion-flush" id="accordionHistorial">
                  {compras.map((compra, index) => (
                    <div className="accordion-item bg-dark border-secondary text-white" key={compra.idOrden || index}>
                      
                        <h2 className="accordion-header" id={`heading-${index}`}>
                        <button
                          className="accordion-button collapsed bg-dark text-white shadow-none border-bottom border-secondary p-3"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#collapse-${index}`}
                          aria-expanded="false"
                          aria-controls={`collapse-${index}`}
                        >
                          <div className="d-flex justify-content-between align-items-center w-100 me-3">
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-box-seam fs-5 text-info"></i>
                              <span className="fs-5">Orden: <span className="text-info fw-bold">#{compra.idOrden || `LVL-${1000 + index}`}</span></span>
                            </div>
                            
                            <div className="d-flex align-items-center gap-3 d-none d-md-flex">
                              {/* Calcula los puntos dinámicamente si no vienen en la compra (ej. 5% de la compra) */}
                              <span className="badge bg-warning text-dark px-2 py-1 fs-6">+{compra.puntosGanados || Math.floor(compra.totalPagado * 0.05)} pts</span>
                              <span className="text-success fw-bold fs-5">{formatCLP(compra.totalPagado)}</span>
                              <span className="text-light">{compra.fecha}</span>
                            </div>
                          </div>
                        </button>
                      </h2>

                      <div
                        id={`collapse-${index}`}
                        className="accordion-collapse collapse"
                        aria-labelledby={`heading-${index}`}
                        data-bs-parent="#accordionHistorial"
                      >
                        <div className="accordion-body pt-4">
                          
                          <div className="row mb-4 text-light small">
                            <div className="col-md-6">
                              <div><strong>Fecha de Orden:</strong> {compra.fecha}</div>
                              <div><strong>Método de Pago:</strong> {compra.metodoPago || 'Webpay Plus (Débito/Crédito)'}</div>
                            </div>
                            <div className="col-md-6 text-md-end mt-3 mt-md-0">
                              <div><strong>Comprador:</strong> {compra.nombreComprador || `${usuarioActivo.nombre} ${usuarioActivo.apellido}`}</div>
                              <div><strong>Despacho:</strong> {compra.direccionDespacho || 'Envío estándar'}</div>
                            </div>
                          </div>

                          <h6 className="text-info mb-3">Artículos comprados:</h6>
                          
                          {compra.productos && compra.productos.length > 0 ? (
                            compra.productos.map((producto, idx) => (
                              <div className="card bg-transparent border-secondary text-white mb-2" key={idx}>
                                <div className="card-body p-2 d-flex justify-content-between align-items-center">
                                  <div className="d-flex align-items-center gap-3">
                                    {producto.imagen && (
                                      <img 
                                        src={producto.imagen} 
                                        alt={producto.nombre} 
                                        className="rounded" 
                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                                      />
                                    )}
                                    <div>
                                      <div className="fw-bold">{producto.nombre}</div>
                                      <div className="small text-muted">Cantidad: {producto.cantidad} x {formatCLP(producto.precio)}</div>
                                    </div>
                                  </div>
                                  <div className="text-success fw-bold">
                                    {formatCLP(producto.cantidad * producto.precio)}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-muted small mb-3 border border-secondary p-3 rounded">
                              <i className="bi bi-info-circle me-2"></i>
                              Resumen de compra: <strong>{compra.cantidadItems} artículo(s)</strong>. Los detalles específicos no fueron guardados en esta versión del historial.
                            </div>
                          )}

                          <div className="d-flex justify-content-between align-items-center mt-4 border-top border-secondary pt-3">
                            <div>
                              <span className="text-light me-2">Estado:</span>
                              <span className="badge bg-success">{compra.estado || 'En preparación / Pagado'}</span>
                            </div>
                            <div className="fs-5">
                              <span className="text-light me-2">Total pagado:</span>
                              <span className="text-info fw-bold">{formatCLP(compra.totalPagado)}</span>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* vista de favoritos */}

          {tabActiva === 'favoritos' && (
            <div className="card gamer-card p-4">
              <div className="d-flex align-items-center gap-2 mb-4 border-bottom border-secondary pb-3">
                <i className="bi bi-heart-fill fs-4 text-danger"></i>
                <h3 className="mb-0 text-info brand-font">Mis Favoritos</h3>
              </div>
              
              {favoritos.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-heartbreak fs-1 text-muted mb-3 d-block"></i>
                  <h5 className="text-white">Aún no tienes productos favoritos</h5>
                  <p className="text-muted">Explora nuestro catálogo y guarda los artículos que más te gusten.</p>
                  <Link to="/catalogo" className="btn btn-outline-info mt-2">Explorar Catálogo</Link>
                </div>
              ) : (
                <div className="row g-3">
                  {favoritos.map((producto, index) => (
                    <div className="col-md-6 col-lg-4" key={index}>
                      <div className="card h-100 bg-dark border-secondary">
                        <img 
                          src={producto.imagen} 
                          className="card-img-top p-2 rounded" 
                          alt={producto.nombre}
                          style={{ height: '180px', objectFit: 'cover' }}
                        />
                        <div className="card-body d-flex flex-column text-white">
                          <h6 className="card-title text-truncate" title={producto.nombre}>{producto.nombre}</h6>
                          <div className="d-flex justify-content-between align-items-center mt-auto">
                            <span className="text-success fw-bold">{formatCLP(producto.precio)}</span>
                            <span className="badge bg-secondary text-light">{producto.categoria}</span>
                          </div>
                        </div>
                        <div className="card-footer bg-transparent border-secondary d-flex gap-2 p-2">
                          <Link to={`/producto/${producto.id}`} className="btn btn-sm btn-info flex-grow-1">
                            <i className="bi bi-eye"></i> Ver
                          </Link>
                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            title="Eliminar de favoritos"
                            onClick={() => {
                              const nuevosFavs = JSON.parse(localStorage.getItem('levelup_favoritos')).filter(
                                f => !(f.correo === usuarioActivo.correo && f.idProducto === producto.id)
                              );
                              localStorage.setItem('levelup_favoritos', JSON.stringify(nuevosFavs));
                              setFavoritos(favoritos.filter(p => p.id !== producto.id)); // Actualiza la vista
                            }}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </main>
  );
};

export default Perfil;