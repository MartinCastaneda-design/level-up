import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

export const Navbar = () => {
  const { totalArticulos } = useCart();
  const { usuario, estaAutenticado } = useAuth();
  const location = useLocation();

  const authRoutes = ["/Login", "/Register"];
  if (authRoutes.includes(location.pathname)) {
    return null;
  }

  const esRutaActiva = (ruta) => (location.pathname === ruta ? "active" : "");

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar sticky-top py-2 px-3 px-xl-4">
      <div className="container-fluid px-lg-3">
        <Link className="navbar-brand d-flex align-items-center gap-2 me-4" to="/">
          <img src={logo} alt="Level-Up Logo" style={{ maxHeight: "45px" }} />
          <span className="d-none d-sm-inline fw-bold brand-font text-info">
            LEVEL-UP
          </span>
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarGamer"
          aria-controls="navbarGamer"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarGamer">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1 gap-lg-2">
            <li className="nav-item">
              <Link className={`nav-link ${esRutaActiva("/")}`} to="/">
                <i className="bi bi-house-door me-1"></i>Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${esRutaActiva("/catalogo")}`}
                to="/catalogo"
              >
                <i className="bi bi-grid me-1"></i>Catálogo
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link text-danger fw-bold"
                to="/catalogo?cat=ofertas"
              >
                <i className="bi bi-fire me-1"></i>Ofertas
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${esRutaActiva("/opiniones")}`}
                to="/opiniones"
              >
                <i className="bi bi-chat-heart me-1"></i>Opiniones
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${esRutaActiva("/nosotros")}`}
                to="/nosotros"
              >
                <i className="bi bi-people me-1"></i>Nosotros
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${esRutaActiva("/blog")}`} to="/blog">
                <i className="bi bi-newspaper me-1"></i>Blog
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${esRutaActiva("/guias")}`}
                to="/guias"
              >
                <i className="bi bi-book me-1"></i>Comunidad/Guías
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3 ms-auto mt-2 mt-lg-0">
            <Link
              to="/carrito"
              className="btn btn-outline-info position-relative"
              title="Carrito de compras"
            >
              <i className="bi bi-cart3 fs-5"></i>
              {totalArticulos > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cart-count-badge">
                  {totalArticulos}
                </span>
              )}
            </Link>

            {estaAutenticado ? (
              <div
                id="perfil-container"
                className="d-flex align-items-center gap-2 gap-lg-3"
              >
                <Link
                  to="/perfil"
                  className="btn btn-outline-info d-flex align-items-center gap-2 px-3"
                >
                  <i className="bi bi-person-circle fs-5"></i>
                  <span id="txtNombre">{usuario?.nombre || "Mi cuenta"}</span>
                </Link>
                {usuario?.rol === "admin" && (
                  <Link
                    to="/admin"
                    className="btn btn-outline-warning d-flex align-items-center gap-1 px-3"
                  >
                    <i className="bi bi-speedometer2"></i>
                    <span className="d-none d-md-inline">Panel Admin</span>
                  </Link>
                )}
                {usuario?.rol === "vendedor" && (
                  <Link
                    to="/vendedor"
                    className="btn btn-outline-warning d-flex align-items-center gap-1 px-3"
                  >
                    <i className="bi bi-briefcase"></i>
                    <span className="d-none d-md-inline">Panel Ventas</span>
                  </Link>
                )}
                <div
                  className="badge bg-dark border border-warning text-warning d-flex align-items-center gap-1 px-3 py-2 fs-6 shadow-sm"
                  title="Tus puntos LevelUp"
                >
                  <span id="navPuntos" className="fw-bold">
                    {usuario?.puntosLevelUp || 0}
                  </span>
                  <i className="bi bi-coin text-warning"></i>
                </div>
              </div>
            ) : (
              <div
                id="autenticacion-buttons"
                className="d-flex align-items-center gap-2"
              >
                <Link to="/Login" className="btn btn-primary px-3">
                  <i className="bi bi-person me-1"></i>Ingresar
                </Link>
                <Link to="/Register" className="btn btn-outline-light px-3">
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
