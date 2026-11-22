import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProductById } from '../data/productsData';
import { formatCLP } from '../utils/formatters';
import api from '../services/api';

const Perfil = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const authContext = useAuth() || {};
  const { usuario, logout, setUsuarioDesdeBackend } = authContext;

  const [usuarioActivo, setUsuarioActivo] = useState(usuario);
  const [puntos, setPuntos] = useState(usuario?.puntosLevelUp || 0);
  const [nivel, setNivel] = useState({ nombre: 'Calculando...', color: 'bg-secondary', icono: '' });
  const [tabActiva, setTabActiva] = useState('datos'); 

  const [compras, setCompras] = useState([]);
  const [errorCompras, setErrorCompras] = useState(null);
  const [cargandoCompras, setCargandoCompras] = useState(false);
  const [favoritos, setFavoritos] = useState([]);

  const [formData, setFormData] = useState({
    nombre: usuario?.nombre || '',
    apellido: usuario?.apellido || '',
    email: usuario?.correo || '',
    contrasenaActual: '',
    nuevaContrasena: ''
  });
  const [errores, setErrores] = useState({});
  const [mensajeExito, setMensajeExito] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calcularNivelGamer = (pts) => {
    if (pts >= 2000) return { nombre: 'Leyenda', color: 'bg-info text-dark', icono: 'bi-gem' };
    if (pts >= 500) return { nombre: 'Oro', color: 'bg-warning text-dark', icono: 'bi-trophy-fill' };
    if (pts >= 100) return { nombre: 'Plata', color: 'bg-light text-dark', icono: 'bi-controller' };
    return { nombre: 'Bronce', color: 'bg-secondary text-white', icono: 'bi-joystick' };
  };

  useEffect(() => {
    if (!usuario) {
      navigate('/Login');
      return;
    }

    setUsuarioActivo(usuario);
    const pts = usuario.puntosLevelUp || 0;
    setPuntos(pts);
    setNivel(calcularNivelGamer(pts));
    setFormData({
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      email: usuario.correo || '',
      contrasenaActual: '',
      nuevaContrasena: ''
    });

    // Cargar historial de compras desde Spring Boot (/api/ordenes/mis-compras)
    setCargandoCompras(true);
    setErrorCompras(null);
    api.get('/ordenes/mis-compras')
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          const comprasBackend = res.data.map(b => ({
            idOrden: b.numeroOrden,
            fecha: b.fecha ? new Date(b.fecha).toLocaleDateString('es-CL') : 'Reciente',
            metodo: b.metodoPago || 'Webpay Plus (Simulado)',
            totalPagado: b.total,
            puntosGanados: b.puntosGanados || 0,
            puntosUsados: b.puntosUsados || 0,
            estado: b.estado || 'Completada (Simulado)',
            productos: (b.detalles || []).map(d => ({
              nombre: d.producto?.nombre || 'Producto Gamer',
              precio: d.precioUnitario,
              cantidad: d.cantidad,
              imagen: d.producto?.imagen || '/img/productos/default.jpg'
            }))
          }));
          setCompras(comprasBackend);
        } else {
          setCompras([]);
        }
      })
      .catch(() => {
        setErrorCompras('No fue posible cargar el historial de compras desde el servidor.');
        setCompras([]);
      })
      .finally(() => {
        setCargandoCompras(false);
      });

    try {
      const todosFavoritos = JSON.parse(localStorage.getItem('levelup_favoritos')) || [];
      const misFavoritosIds = todosFavoritos.filter(fav => fav.correo && fav.correo.toLowerCase() === usuario.correo?.toLowerCase());
      const misFavoritosConDetalle = misFavoritosIds.map(fav => {
        const producto = getProductById(fav.idProducto);
        return producto || null;
      }).filter(Boolean);
      setFavoritos(misFavoritosConDetalle);
    } catch {
      setFavoritos([]);
    }

    const tabParam = searchParams.get('tab');
    if (tabParam === 'compras' || tabParam === 'favoritos') {
      setTabActiva(tabParam);
    }
  }, [navigate, searchParams, usuario]);

  const handleCerrarSesion = () => {
    if (logout) logout();
    navigate('/Login');
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const key = id.replace('txt', '').toLowerCase();
    let formKey = key;
    if (id === 'txtContrasenaActual') formKey = 'contrasenaActual';
    if (id === 'txtNuevaContrasena') formKey = 'nuevaContrasena';
    setFormData({ ...formData, [formKey]: value });
    if (errores[formKey] || errores[key]) {
      setErrores({ ...errores, [formKey]: null, [key]: null, general: null });
    }
  };

  const handleActualizarPerfil = async (e) => {
    e.preventDefault();
    let nuevosErrores = {};
    let hayErrores = false;

    if (!formData.nombre.trim()) { nuevosErrores.nombre = "El nombre es obligatorio."; hayErrores = true; }
    if (!formData.apellido.trim()) { nuevosErrores.apellido = "El apellido es obligatorio."; hayErrores = true; }
    if (!formData.email.trim()) { nuevosErrores.email = "El email es obligatorio."; hayErrores = true; }

    if (formData.nuevaContrasena.trim()) {
      if (!formData.contrasenaActual.trim()) {
        nuevosErrores.contrasenaActual = "Debes ingresar tu contraseña actual para cambiarla.";
        hayErrores = true;
      }
      if (formData.nuevaContrasena.trim().length < 6) {
        nuevosErrores.nuevaContrasena = "La nueva contraseña debe tener al menos 6 caracteres.";
        hayErrores = true;
      }
    }

    if (hayErrores) {
      setErrores(nuevosErrores);
      return;
    }

    setIsSubmitting(true);
    setMensajeExito(null);

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        correo: formData.email.trim()
      };
      if (formData.nuevaContrasena.trim()) {
        payload.contrasenaActual = formData.contrasenaActual.trim();
        payload.nuevaContrasena = formData.nuevaContrasena.trim();
      }

      const res = await api.put('/auth/me', payload);

      if (res.status === 200 && res.data) {
        if (setUsuarioDesdeBackend) {
          setUsuarioDesdeBackend(res.data);
        }
        setUsuarioActivo(res.data);
        setFormData(prev => ({
          ...prev,
          nombre: res.data.nombre,
          apellido: res.data.apellido,
          email: res.data.correo,
          contrasenaActual: '',
          nuevaContrasena: ''
        }));
        setMensajeExito("Datos actualizados correctamente en el servidor.");
        setTimeout(() => setMensajeExito(null), 3500);
      }
    } catch (apiErr) {
      if (apiErr.response && apiErr.response.status === 409) {
        setErrores({ email: "El correo ingresado ya está en uso por otro usuario." });
      } else if (apiErr.response && apiErr.response.data && apiErr.response.data.error) {
        setErrores({ general: apiErr.response.data.error });
      } else {
        setErrores({ general: "Error al comunicarse con el servidor. No se guardaron los cambios." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!usuarioActivo) return <div className="text-center mt-5 text-white">Cargando perfil...</div>;

  return (
    <main className="container my-5 flex-grow-1">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary pb-3">
        <div>
          <h1 className="h2 mb-1 brand-font text-white">Mi Cuenta</h1>
          <p className="text-muted mb-0">Gestiona tu información oficial, revisa tus compras y puntos gamer</p>
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
              <i className="bi bi-person-fill me-2"></i>Actualizar Datos
            </button>
            <button 
              className={`nav-link text-start px-3 py-2 fw-bold ${tabActiva === 'compras' ? 'active' : ''}`}
              onClick={() => setTabActiva('compras')}
            >
              <i className="bi bi-receipt me-2"></i>Compras ({compras.length})
            </button>
            <button 
              className={`nav-link text-start px-3 py-2 fw-bold ${tabActiva === 'favoritos' ? 'active' : ''}`}
              onClick={() => setTabActiva('favoritos')}
            >
              <i className="bi bi-heart-fill me-2"></i>Favoritos ({favoritos.length})
            </button>
          </div>

          <div className="gamer-card p-3 mt-3 text-center">
            <div className="d-flex justify-content-center mb-2">
              <span className={`badge ${nivel.color} px-3 py-2 fs-6`}>
                <i className={`bi ${nivel.icono} me-1`}></i>Nivel {nivel.nombre}
              </span>
            </div>
            <h4 className="text-warning brand-font mb-0">{puntos} Puntos</h4>
            <small className="text-muted">1 punto por cada $100 gastados</small>
          </div>
        </div>

        <div className="col-md-8 col-lg-9">
          {tabActiva === 'datos' && (
            <div className="gamer-card p-4 shadow">
              <div className="d-flex align-items-center gap-2 mb-4 border-bottom border-secondary pb-3">
                <i className="bi bi-person-vcard fs-4 text-info"></i>
                <h3 className="mb-0 text-info brand-font">Actualizar Datos</h3>
              </div>

              {errores.general && (
                <div className="alert alert-danger d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <div>{errores.general}</div>
                </div>
              )}
              
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
                  <div className="col-md-12 mb-3">
                    <label htmlFor="txtEmail" className="form-label text-muted small">Email</label>
                    <input type="email" className={`form-control bg-dark text-white border-secondary ${errores.email ? 'is-invalid' : ''}`} id="txtEmail" value={formData.email} onChange={handleInputChange} />
                    {errores.email && <div className="invalid-feedback-custom text-danger small mt-1">{errores.email}</div>}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="txtContrasenaActual" className="form-label text-muted small">Contraseña Actual</label>
                    <input type="password" className={`form-control bg-dark text-white border-secondary ${errores.contrasenaActual ? 'is-invalid' : ''}`} id="txtContrasenaActual" placeholder="Requerida si cambias contraseña" value={formData.contrasenaActual} onChange={handleInputChange} />
                    {errores.contrasenaActual && <div className="invalid-feedback-custom text-danger small mt-1">{errores.contrasenaActual}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="txtNuevaContrasena" className="form-label text-muted small">Nueva Contraseña</label>
                    <input type="password" className={`form-control bg-dark text-white border-secondary ${errores.nuevaContrasena ? 'is-invalid' : ''}`} id="txtNuevaContrasena" placeholder="Mínimo 6 caracteres" value={formData.nuevaContrasena} onChange={handleInputChange} />
                    {errores.nuevaContrasena && <div className="invalid-feedback-custom text-danger small mt-1">{errores.nuevaContrasena}</div>}
                  </div>
                </div>   
                
                <div className="d-flex justify-content-end mt-3">
                  <button type="submit" className="btn btn-primary px-5" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {tabActiva === 'compras' && (
            <div className="gamer-card p-4 shadow">
              <div className="d-flex align-items-center gap-2 mb-4 border-bottom border-secondary pb-3">
                <i className="bi bi-receipt fs-4 text-info"></i>
                <h3 className="mb-0 text-info brand-font">Historial de Compras</h3>
              </div>

              {cargandoCompras && (
                <div className="text-center py-4">
                  <div className="spinner-border text-info" role="status"></div>
                  <div className="text-muted mt-2">Cargando compras desde el servidor...</div>
                </div>
              )}

              {errorCompras && (
                <div className="alert alert-danger d-flex align-items-center justify-content-between">
                  <div><i className="bi bi-exclamation-octagon-fill me-2"></i>{errorCompras}</div>
                  <button className="btn btn-sm btn-outline-light" onClick={() => window.location.reload()}>Reintentar</button>
                </div>
              )}
              
              {!cargandoCompras && !errorCompras && compras.length === 0 && (
                <div className="text-center py-5">
                  <i className="bi bi-bag-x fs-1 text-muted mb-3 d-block"></i>
                  <h5 className="text-white">Aún no tienes compras registradas</h5>
                  <p className="text-muted">Cuando finalices un pedido, aparecerá aquí.</p>
                  <Link to="/catalogo" className="btn btn-outline-info mt-2">Ir al Catálogo</Link>
                </div>
              )}

              {!cargandoCompras && !errorCompras && compras.length > 0 && (
                <div className="accordion accordion-flush" id="accordionHistorial">
                  {compras.map((compra, index) => (
                    <div className="accordion-item bg-dark border-secondary text-white" key={compra.idOrden || index}>
                      <h2 className="accordion-header" id={`heading-${index}`}>
                        <button className="accordion-button collapsed bg-dark text-white border-secondary" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse-${index}`}>
                          <div className="d-flex justify-content-between align-items-center w-100 me-3">
                            <div>
                              <strong className="text-info">#{compra.idOrden}</strong>
                              <span className="text-muted small ms-2">{compra.fecha}</span>
                            </div>
                            <span className="badge bg-success">{formatCLP(compra.totalPagado)}</span>
                          </div>
                        </button>
                      </h2>
                      <div id={`collapse-${index}`} className="accordion-collapse collapse" data-bs-parent="#accordionHistorial">
                        <div className="accordion-body bg-dark text-white">
                          <p className="text-muted small mb-2">Método de pago: <strong>{compra.metodo}</strong></p>
                          <p className="text-muted small mb-3">Estado: <span className="badge bg-primary">{compra.estado}</span></p>
                          <ul className="list-group list-group-flush border-secondary">
                            {compra.productos.map((prod, pIdx) => (
                              <li key={pIdx} className="list-group-item bg-dark text-white d-flex justify-content-between align-items-center px-0">
                                <div>
                                  <span>{prod.nombre}</span>
                                  <span className="text-muted small ms-2">x{prod.cantidad}</span>
                                </div>
                                <span>{formatCLP(prod.precio * prod.cantidad)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tabActiva === 'favoritos' && (
            <div className="gamer-card p-4 shadow">
              <div className="d-flex align-items-center gap-2 mb-4 border-bottom border-secondary pb-3">
                <i className="bi bi-heart-fill fs-4 text-danger"></i>
                <h3 className="mb-0 text-info brand-font">Mis Favoritos</h3>
              </div>
              {favoritos.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-heartbreak fs-1 text-muted mb-3 d-block"></i>
                  <h5 className="text-white">No tienes productos en favoritos</h5>
                  <p className="text-muted">Explora la tienda y agrega los que más te gusten.</p>
                  <Link to="/catalogo" className="btn btn-outline-info mt-2">Ir al Catálogo</Link>
                </div>
              ) : (
                <div className="row g-3">
                  {favoritos.map((prod) => (
                    <div key={prod.id} className="col-md-6 col-lg-4">
                      <div className="card h-100 bg-dark text-white border-secondary">
                        <img src={prod.imagen} className="card-img-top" alt={prod.nombre} style={{ height: '140px', objectFit: 'cover' }} />
                        <div className="card-body d-flex flex-column">
                          <h6 className="card-title text-info">{prod.nombre}</h6>
                          <div className="mt-auto d-flex justify-content-between align-items-center">
                            <span className="fw-bold">{formatCLP(prod.precio)}</span>
                            <Link to={`/producto/${prod.id}`} className="btn btn-sm btn-outline-info">Ver</Link>
                          </div>
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
