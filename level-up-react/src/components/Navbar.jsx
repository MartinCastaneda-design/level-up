import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export const Navbar = () => {
  const { totalArticulos } = useCart();
  const { usuario, estaAutenticado, logout } = useAuth();
  const location = useLocation();

  const esRutaActiva = (ruta) => (location.pathname === ruta ? 'active' : '');

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar sticky-top py-2">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <img src={logo} alt="Level-Up Logo" style={{ maxHeight: '45px' }} />
          <span className="d-none d-sm-inline fw-bold brand-font text-info">LEVEL-UP</span>
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
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
            <li className="nav-item">
              <Link className={`nav-link ${esRutaActiva('/')}`} to="/">
                <i className="bi bi-house-door me-1"></i>Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${esRutaActiva('/catalogo')}`} to="/catalogo">
                <i className="bi bi-grid me-1"></i>Catálogo
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${esRutaActiva('/ofertas')}`} to="/ofertas">
                <i className="bi bi-tag me-1"></i>Ofertas
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${esRutaActiva('/opiniones')}`} to="/opiniones">
                <i className="bi bi-chat-heart me-1"></i>Opiniones
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            <Link to="/carrito" className={`btn btn-outline-info position-relative ${esRutaActiva('/carrito')}`}>
              <i className="bi bi-cart3 fs-5"></i>
              {totalArticulos > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cart-count-badge">
                  {totalArticulos}
                </span>
              )}
            </Link>

            {estaAutenticado ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-info dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle"></i>
                  <span>{usuario.nombre}</span>
                  {usuario.puntosLevelUp > 0 && (
                    <span className="badge bg-warning text-dark">{usuario.puntosLevelUp} pts</span>
                  )}
                </button>
                <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/perfil">
                      <i className="bi bi-person me-2"></i>Mi Perfil
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin">
                      <i className="bi bi-speedometer2 me-2"></i>Panel Admin
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider border-secondary" />
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={logout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-primary px-3">
                  <i className="bi bi-person me-1"></i>Ingresar
                </Link>
                <Link to="/registro" className="btn btn-outline-light px-3">
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
