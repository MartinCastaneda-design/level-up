import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const Perfil = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // 1. Estados para el usuario y la interfaz
  const [usuarioActivo, setUsuarioActivo] = useState(null);
  const [usuarioDetalles, setUsuarioDetalles] = useState(null); // Datos completos del localStorage
  const [puntos, setPuntos] = useState(0);
  const [nivel, setNivel] = useState({ nombre: 'Calculando...', color: 'bg-secondary', icono: '' });
  const [tabActiva, setTabActiva] = useState('datos'); // 'datos', 'compras', 'favoritos'

  // 2. Estados para los datos de las pestañas
  const [compras, setCompras] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [productosData, setProductosData] = useState([]); // Simula products-data.js

  // 3. Estados para el formulario de actualización
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    contrasena: ''
  });
  const [errores, setErrores] = useState({});
  const [mensajeExito, setMensajeExito] = useState(null);

  // Efecto inicial: Cargar datos al montar el componente
  useEffect(() => {
    const userString = localStorage.getItem("usuario_activo");
    if (!userString) {
      navigate('/Login');
      return;
    }

    const user = JSON.parse(userString);
    setUsuarioActivo(user);

    // Cargar registros completos para obtener puntos y código
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
        contrasena: '' // No pre-llenar contraseña por seguridad
      });
    }

    // Cargar compras
    const todasLasCompras = JSON.parse(localStorage.getItem('levelup_compras')) || [];
    const misCompras = todasLasCompras.filter(compra => compra.correo.toLowerCase() === user.correo.toLowerCase());
    setCompras(misCompras);

    // Cargar favoritos (Necesitarás tener PRODUCTOS_DATA disponible en React)
    const todosFavoritos = JSON.parse(localStorage.getItem('levelup_favoritos')) || [];
    const misFavoritos = todosFavoritos.filter(fav => fav.correo === user.correo);
    // Asumimos que tienes una forma de importar PRODUCTOS_DATA o lo pasas como prop/context
    // setFavoritos(misFavoritosConDetalle);

    // Revisar si viene un parámetro en la URL para cambiar de tab (ej: ?tab=compras)
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

  // Manejador del formulario de actualización
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

  // Formateador de moneda
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
        {/* Columna Izquierda: Menú Lateral controlado por Estado React */}
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

        {/* Columna Derecha: Contenido Renderizado Condicionalmente */}
        <div className="col-md-8 col-lg-9">
          
          {/* VISTA: DATOS PERSONALES */}
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

          {/* VISTA: COMPRAS */}
          {tabActiva === 'compras' && (
            <div className="card gamer-card p-4">
              <h3 className="h4 text-info mb-4 border-bottom border-secondary pb-2"><i className="bi bi-receipt me-2"></i>Historial de Compras</h3>
              
              {compras.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-bag-x fs-1 text-muted mb-3 d-block"></i>
                  <h5 className="text-white">Aún no tienes compras registradas</h5>
                  <p className="text-muted">Cuando finalices un pedido, aparecerá aquí.</p>
                  <Link to="/galeria" className="btn btn-outline-info mt-2">Ir al Catálogo</Link>
                </div>
              ) : (
                <div className="accordion d-flex flex-column gap-3">
                  {compras.map((compra, index) => (
                    <div key={index} className="accordion-item gamer-card bg-dark border-secondary rounded overflow-hidden">
                      {/* Aquí iría la estructura del acordeón de compras traducida a JSX */}
                      <div className="p-3 border-bottom border-secondary d-flex justify-content-between">
                         <span className="text-info fw-bold">Orden: {compra.idOrden}</span>
                         <span className="text-white">{formatCLP(compra.totalPagado)}</span>
                      </div>
                      <div className="p-3 text-muted small">
                         Fecha: {compra.fecha} <br/>
                         Artículos: {compra.cantidadItems}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VISTA: FAVORITOS */}
          {tabActiva === 'favoritos' && (
            <div className="card gamer-card p-4">
              <h3 className="h4 text-info mb-4 border-bottom border-secondary pb-2"><i className="bi bi-heart me-2"></i>Mis Favoritos</h3>
              <div className="text-center py-5">
                 {/* La lógica de favoritos completa requiere importar tu array de productos */}
                  <i className="bi bi-heartbreak fs-1 text-muted mb-3 d-block"></i>
                  <h5 className="text-white">Funcionalidad en construcción</h5>
                  <p className="text-muted">Para renderizar favoritos, asegúrate de importar PRODUCTOS_DATA en React.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
};

export default Perfil;