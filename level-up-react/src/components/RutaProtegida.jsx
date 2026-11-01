import { useAuth } from "../context/AuthContext";
import { Navigate, Link } from "react-router-dom";

export const RutaProtegida = ({ children }) => {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/Login" />;
  }

  if (usuario.rol !== 'admin') {
    return (
      <main className="container my-5 text-center flex-grow-1">
        <div className="card gamer-card p-5 my-4">
          <i className="bi bi-slash-circle text-danger mb-3" style={{ fontSize: '3rem' }}></i>
          <h2 className="text-white brand-font mb-2">Acceso denegado</h2>
          <p className="text-muted mb-4">
            Iniciaste sesión correctamente, pero tu cuenta no tiene permisos de administrador.
          </p>
          <Link to="/" className="btn btn-outline-info">
            <i className="bi bi-arrow-left me-1"></i>Volver al Inicio
          </Link>
        </div>
      </main>
    );
  }

  return children;
};