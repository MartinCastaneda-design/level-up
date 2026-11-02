import { useState, useEffect } from 'react';

export default function AdminUsuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  const [compras, setCompras] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  useEffect(() => {
    const registrosGuardados = localStorage.getItem('registros');
    if (registrosGuardados) {
      try {
        setUsuarios(JSON.parse(registrosGuardados));
      } catch (e) {
        console.error("Error al parsear usuarios:", e);
        setUsuarios([]);
      }
    } else {
      setUsuarios([]);
    }
  }, []);

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

  const guardarUsuarios = (nuevosUsuarios) => {
    setUsuarios(nuevosUsuarios);
    localStorage.setItem('registros', JSON.stringify(nuevosUsuarios));
  };

  const toggleRol = (email) => {
    const nuevos = usuarios.map(u => {
      if (u.correo === email) {
        const nuevoRol = u.rol === 'admin' ? 'cliente' : 'admin';
        return { ...u, rol: nuevoRol };
      }
      return u;
    });
    guardarUsuarios(nuevos);
  };

  const toggleEstado = (email) => {
    const nuevos = usuarios.map(u => {
      if (u.correo === email) {
        const nuevoEstado = u.estado === 'suspendido' ? 'activo' : 'suspendido';
        return { ...u, estado: nuevoEstado };
      }
      return u;
    });
    guardarUsuarios(nuevos);
  };

  const eliminarUsuario = (email) => {
    if (window.confirm(`¿Seguro que deseas eliminar al usuario ${email}?`)) {
      const nuevos = usuarios.filter(u => u.correo !== email);
      guardarUsuarios(nuevos);
    }
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
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted py-4">
                  No se encontraron usuarios registrados en el sistema.
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map((u, index) => (
                <tr key={u.correo || index}>
                  <td>{u.nombre || "Sin Nombre"}</td>
                  <td>{u.correo}</td>
                  <td>
                    <span className={`badge ${u.rol === 'admin' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                      {u.rol ? u.rol.toUpperCase() : 'CLIENTE'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.estado === 'suspendido' ? 'bg-danger' : 'bg-success'}`}>
                      {u.estado ? u.estado.toUpperCase() : 'ACTIVO'}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => toggleRol(u.correo)}
                        title="Cambiar rol"
                      >
                        <i className="bi bi-person-gear"></i>
                      </button>

                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => toggleEstado(u.correo)}
                        title="Activar / Suspender"
                      >
                        <i className="bi bi-slash-circle"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => eliminarUsuario(u.correo)}
                        title="Eliminar usuario"
                      >
                        <i className="bi bi-trash"></i>
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