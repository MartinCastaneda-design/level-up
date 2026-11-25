import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminUsuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorCarga, setErrorCarga] = useState(null);

  const [compras, setCompras] = useState([]);
  const [cargandoCompras, setCargandoCompras] = useState(false);
  const [errorComprasModal, setErrorComprasModal] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setCargando(true);
    setErrorCarga(null);
    try {
      const res = await api.get('/usuarios');
      if (res.data && Array.isArray(res.data)) {
        setUsuarios(res.data);
      } else {
        setUsuarios([]);
      }
    } catch (e) {
      console.error("Error al cargar usuarios desde la API:", e);
      setErrorCarga("No fue posible cargar el listado de usuarios desde el servidor.");
      setUsuarios([]);
    } finally {
      setCargando(false);
    }
  };

  const handleCambiarRol = async (u, nuevoRol) => {
    if (!u.id) {
      alert("Error: El usuario no tiene un ID oficial asignado por el servidor.");
      return;
    }

    const rolFormateado = nuevoRol.startsWith('ROLE_') ? nuevoRol : `ROLE_${nuevoRol}`;
    const confirmar = window.confirm(`¿Estás seguro de cambiar el rol de ${u.nombre || u.correo} a ${rolFormateado.replace('ROLE_', '')}?`);
    if (!confirmar) return;

    try {
      await api.patch(`/usuarios/${u.id}/rol`, { rol: rolFormateado });
      await cargarUsuarios();
      alert(`Rol actualizado a ${rolFormateado.replace('ROLE_', '')} correctamente.`);
    } catch (err) {
      console.error('Error al actualizar rol en API:', err);
      const msg = err.response?.data?.error || err.response?.data?.message || 'No se pudo actualizar el rol en el servidor.';
      alert(`Error: ${msg}`);
    }
  };

  const abrirModalCompras = async (u) => {
    setUsuarioSeleccionado(u);
    setCargandoCompras(true);
    setErrorComprasModal(null);
    setCompras([]);

    try {
      const res = await api.get(`/usuarios/${u.id}/ordenes`);
      if (res.data && Array.isArray(res.data)) {
        setCompras(res.data);
      } else {
        setCompras([]);
      }
    } catch (err) {
      console.error("Error al cargar órdenes del usuario:", err);
      setErrorComprasModal("No fue posible cargar el historial de órdenes de este usuario.");
    } finally {
      setCargandoCompras(false);
    }
  };

  const usuariosFiltrados = usuarios.filter(u =>
    (u.nombre && u.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
    (u.correo && u.correo.toLowerCase().includes(busqueda.toLowerCase())) ||
    (u.username && u.username.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <main className="container py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2>Gestión de Usuarios</h2>
          <p className="text-muted mb-0">
            Administra los roles oficiales (CLIENTE, VENDEDOR, ADMIN) de los usuarios en la base de datos.
          </p>
        </div>

        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button className="btn btn-outline-info" onClick={cargarUsuarios} title="Recargar lista">
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>

      {errorCarga && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <div><i className="bi bi-exclamation-octagon-fill me-2"></i>{errorCarga}</div>
          <button className="btn btn-sm btn-outline-light" onClick={cargarUsuarios}>Reintentar</button>
        </div>
      )}

      {cargando ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status"></div>
          <p className="text-muted mt-2">Cargando usuarios desde el servidor...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario / Nombre</th>
                <th>Correo Electrónico</th>
                <th>Rol Oficial</th>
                <th>Puntos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    {errorCarga ? "Error de conexión." : "No se encontraron usuarios registrados en la base de datos."}
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((u) => {
                  const rolActual = (u.rol || 'ROLE_CLIENTE').toUpperCase();
                  return (
                    <tr key={u.id || u.correo}>
                      <td>#{u.id}</td>
                      <td>
                        <strong>{u.nombre || "Sin Nombre"} {u.apellido || ""}</strong>
                        <div className="small text-muted">@{u.username}</div>
                      </td>
                      <td>{u.correo}</td>
                      <td>
                        <span className={`badge ${rolActual.includes('ADMIN') ? 'bg-warning text-dark' : (rolActual.includes('VENDEDOR') ? 'bg-info text-dark' : 'bg-secondary')}`}>
                          {rolActual.replace('ROLE_', '')}
                        </span>
                      </td>
                      <td>
                        <span className="text-warning fw-bold">{u.puntosLevelUp || 0} pts</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <select
                            className="form-select form-select-sm bg-dark text-white border-secondary"
                            style={{ width: '130px' }}
                            value={rolActual}
                            onChange={(e) => handleCambiarRol(u, e.target.value)}
                          >
                            <option value="ROLE_CLIENTE">CLIENTE</option>
                            <option value="ROLE_VENDEDOR">VENDEDOR</option>
                            <option value="ROLE_ADMIN">ADMIN</option>
                          </select>

                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => abrirModalCompras(u)}
                            title="Ver historial de órdenes en base de datos"
                          >
                            <i className='bi bi-receipt'></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {usuarioSeleccionado && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark text-white border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-info">
                  <i className="bi bi-receipt me-2"></i>
                  Órdenes oficiales de {usuarioSeleccionado.nombre} ({usuarioSeleccionado.correo})
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setUsuarioSeleccionado(null)}
                ></button>
              </div>
              <div className="modal-body">
                {cargandoCompras && (
                  <div className="text-center py-4">
                    <div className="spinner-border text-info" role="status"></div>
                    <p className="text-muted mt-2">Cargando órdenes del servidor...</p>
                  </div>
                )}

                {errorComprasModal && (
                  <div className="alert alert-danger">{errorComprasModal}</div>
                )}

                {!cargandoCompras && !errorComprasModal && compras.length === 0 && (
                  <p className="text-muted text-center py-3 mb-0">Este usuario no tiene compras registradas en el backend.</p>
                )}

                {!cargandoCompras && !errorComprasModal && compras.length > 0 && (
                  <div className="list-group list-group-flush border-secondary">
                    {compras.map((compra) => (
                      <div key={compra.id} className="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center">
                        <div>
                          <strong>#{compra.numeroOrden}</strong>
                          <div className="small text-muted">{compra.fecha ? new Date(compra.fecha).toLocaleString('es-CL') : 'Fecha no registrada'} — {compra.metodoPago}</div>
                          <span className="badge bg-primary mt-1">{compra.estado}</span>
                        </div>
                        <div className="text-end">
                          <div className="text-success fw-bold">${(compra.total || 0).toLocaleString('es-CL')}</div>
                          <small className="text-muted">{compra.detalles ? compra.detalles.length : 0} producto(s)</small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer border-secondary">
                <button type="button" className="btn btn-secondary" onClick={() => setUsuarioSeleccionado(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
