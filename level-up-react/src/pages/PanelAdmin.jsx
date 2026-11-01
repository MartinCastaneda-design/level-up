import React from "react";
import { Link } from "react-router-dom";

export default function PanelAdmin() {
  return (
    <div className="container py-4">
      <h2 className="mb-3">Panel Administrativo</h2>
      <p className="text-muted mb-4">
        Accede a la gestion de productos, usuarios y respaldos del sistema.
      </p>

      <div className="list-group" data-bs-theme="dark">
        <Link
          to="/AdminProducto"
          className="list-group-item list-group-item-action d-flex align-items-center gap-3"
        >
          <i className="bi bi-box-seam fs-4 text-info"></i>
          <div>
            <h3 className="h6 mb-0">Gestión de Productos</h3>
            <small className="text-muted">
              Ver, agregar, editar y filtrar productos críticos
            </small>
          </div>
        </Link>

        <Link
          to="/AdminUsuario"
          className="list-group-item list-group-item-action d-flex align-items-center gap-3"
        >
          <i className="bi bi-people fs-4 text-warning"></i>
          <div>
            <h3 className="h6 mb-0">Gestión de Usuarios</h3>
            <small className="text-muted">
              Roles, estados y historial de compras de cada usuario
            </small>
          </div>
        </Link>

        <Link
          to="/AdminRespaldo"
          className="list-group-item list-group-item-action d-flex align-items-center gap-3"
        >
          <i className="bi bi-cloud-arrow-down fs-4 text-success"></i>
          <div>
            <h3 className="h6 mb-0">Copias de Seguridad</h3>
            <small className="text-muted">
              Exportar o restaurar el respaldo del sistema
            </small>
          </div>
        </Link>
      </div>
    </div>
  );
}
