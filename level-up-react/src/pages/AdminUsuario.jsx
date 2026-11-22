import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminUsuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  const [compras, setCompras] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const res = await api.get('/usuarios');
      if (res.data && Array.isArray(res.data)) {
        setUsuarios(res.data);
        return;
      }
    } catch (e) {
      console.warn("Backend no disponible para listar usuarios, usando respaldo local:", e);
    }

    const registrosGuardados = localStorage.getItem('registros');
    if (registrosGuardados) {
      try {
        setUsuarios(JSON.parse(registrosGuardados));
      } catch {
        setUsuarios([]);
      }
    } else {
      setUsuarios([]);
    }
  };

  useEffect(() => {
    const comprasGuardadas = localStorage.getItem('levelup_compras');
    if (comprasGuardadas) {
      try {
        setCompras(JSON.parse(comprasGuardadas));
      } catch (e) {
        console.error("Error al parsear la compra: ", e);
        setCompras([]);
      }
    } else {
      setCompras([]);
    }
  }, []);

  const toggleRol = async (u) => {
    const rolActual = (u.rol || '').toLowerCase();
    const proximoRol = rolActual.includes('admin') ? 'ROLE_CLIENTE' : 'ROLE_ADMIN';

    try {
      if (u.id) {
        await api.patch(`/usuarios/${u.id}/rol`, { rol: proximoRol });
        await cargarUsuarios();
        alert(`Rol del usuario actualizado a ${proximoRol}`);
        return;
      }
    } catch (err) {
      console.error('Error al actualizar rol en API:', err);
      const msg = err.response?.data?.error || err.response?.data?.message || 'No se pudo actualizar el rol en el servidor.';
      alert(`Error: ${msg}`);
      return;
    }

    // Fallback local solo si el usuario no tiene ID de backend
    const nuevos = usuarios.map(item => {
      if (item.correo === u.correo) {
        return { ...item, rol: proximoRol.toLowerCase().replace('role_', '') };
      }
      return item;
    });
    setUsuarios(nuevos);
    localStorage.setItem('registros', JSON.stringify(nuevos));
  };

  const usuariosFiltrados = usuarios.filter(u =>
    (u.nombre && u.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
    (u.correo && u.correo.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const usuarioData = usuarios.find(u => u.correo === usuarioSeleccionado);
  const comprasDelUsuario = compras.filter(c => c.correo === usuarioSeleccionado);

  return (
    <main className="container py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2>Gestión de Usuarios</h2>
          <p className="text-muted mb-0">
            Administra los roles y estados de los usuarios registrados en la plataforma.
          </p>
        </div>

        <div>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle">
          <thead>
            <tr>
              <th>Usuario / Nombre</th>
              <th>Correo Electrónico</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted py-4">
                  No se encontraron usuarios registrados en el sistema.
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map((u, index) => (
                <tr key={u.correo || index}>
                  <td>{u.nombre || "Sin Nombre"}</td>
                  <td>{u.correo}</td>
                  <td>
                    <span className={`badge ${((u.rol || '').toLowerCase().includes('admin')) ? 'bg-warning text-dark' : (((u.rol || '').toLowerCase().includes('vendedor')) ? 'bg-info text-dark' : 'bg-secondary')}`}>
                      {u.rol ? u.rol.toUpperCase().replace('ROLE_', '') : 'CLIENTE'}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => toggleRol(u)}
                        title="Cambiar rol (Admin / Cliente)"
                      >
                        <i className="bi bi-person-gear me-1"></i>Cambiar Rol
                      </button>

                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => setUsuarioSeleccionado(u.correo)}
                        title="Ver historial de compras"
                      >
                        <i className='bi bi-receipt'></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {usuarioSeleccionado && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-receipt me-2"></i>
                  Compras de {usuarioData ? `${usuarioData.nombre} ${usuarioData.apellido}` : usuarioSeleccionado}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setUsuarioSeleccionado(null)}
                ></button>
              </div>
              <div className="modal-body">
                {comprasDelUsuario.length === 0 ? (
                  <p className="text-muted mb-0">Este usuario no tiene compras registradas.</p>
                ) : (
                  comprasDelUsuario.map((compra) => (
                    <div key={compra.idOrden} className="border rounded p-2 mb-2">
                      <strong>{compra.idOrden}</strong> — {compra.cantidadItems} artículo(s) — ${compra.totalPagado}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}