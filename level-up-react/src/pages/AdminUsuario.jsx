import React, { useState, useEffect } from 'react';

export default function AdminUsuario() {
  // 1. Estado para almacenar la lista de usuarios y la búsqueda
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  // 2. useEffect: Carga únicamente los usuarios reales guardados en localStorage
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
      // Si está vacío, simplemente dejamos la lista vacía
      setUsuarios([]);
    }
  }, []);

  // Función para guardar cambios en localStorage y actualizar la vista
  const guardarUsuarios = (nuevosUsuarios) => {
    setUsuarios(nuevosUsuarios);
    localStorage.setItem('registros', JSON.stringify(nuevosUsuarios));
  };

  // 3. Cambiar Rol (Cliente <-> Admin)
  const toggleRol = (email) => {
    const nuevos = usuarios.map(u => {
      if (u.email === email) {
        const nuevoRol = u.rol === 'admin' ? 'cliente' : 'admin';
        return { ...u, rol: nuevoRol };
      }
      return u;
    });
    guardarUsuarios(nuevos);
  };

  // 4. Cambiar Estado (Activo <-> Suspendido)
  const toggleEstado = (email) => {
    const nuevos = usuarios.map(u => {
      if (u.email === email) {
        const nuevoEstado = u.estado === 'suspendido' ? 'activo' : 'suspendido';
        return { ...u, estado: nuevoEstado };
      }
      return u;
    });
    guardarUsuarios(nuevos);
  };

  // 5. Eliminar usuario
  const eliminarUsuario = (email) => {
    if (window.confirm(`¿Seguro que deseas eliminar al usuario ${email}?`)) {
      const nuevos = usuarios.filter(u => u.email !== email);
      guardarUsuarios(nuevos);
    }
  };

  // Filtrado de usuarios según la caja de búsqueda
  const usuariosFiltrados = usuarios.filter(u =>
    (u.nombre && u.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <main className="container py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2>Gestión de Usuarios</h2>
          <p className="text-muted mb-0">
            Administra los roles y estados de los usuarios registrados en la plataforma.
          </p>
        </div>

        {/* Buscador controlado */}
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

      {/* Tabla de Usuarios */}
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
                <tr key={u.email || index}>
                  <td>{u.nombre || "Sin Nombre"}</td>
                  <td>{u.email}</td>
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
                        onClick={() => toggleRol(u.email)}
                        title="Cambiar rol"
                      >
                        <i className="bi bi-person-gear"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => toggleEstado(u.email)}
                        title="Activar / Suspender"
                      >
                        <i className="bi bi-slash-circle"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => eliminarUsuario(u.email)}
                        title="Eliminar usuario"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}