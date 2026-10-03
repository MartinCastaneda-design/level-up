import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export const Navbar = () => {
  const { totalArticulos } = useCart();
  const { usuario, estaAutenticado } = useAuth();
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
              <Link className={`nav-link ${esRutaActiva('/opiniones')}`} to="/opiniones">
                <i className="bi bi-chat-heart me-1"></i>Opiniones
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${esRutaActiva('/nosotros')}`} to="/nosotros">
                <i className="bi bi-people me-1"></i>Nosotros
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${esRutaActiva('/blog')}`} to="/blog">
                <i className="bi bi-newspaper me-1"></i>Blog
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${esRutaActiva('/guias')}`} to="/guias">
                <i className="bi bi-book me-1"></i>Comunidad/Guías
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center me-3">
            <Link to="/carrito" className="btn btn-outline-info position-relative">
              <i className="bi bi-cart3 fs-5"></i>
              {totalArticulos > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cart-count-badge">
                  {totalArticulos}
                </span>
              )}
            </Link>
          </div>

          {estaAutenticado ? (
            <div id="perfil-container" className="d-flex align-items-center gap-3">
              <Link to="/perfil" className="btn btn-outline-info d-flex align-items-center gap-2 px-3">
                <i className="bi bi-person-circle fs-5"></i>
                <span id="txtNombre">{usuario?.nombre || 'Mi cuenta'}</span>
              </Link>
              <div
                className="badge bg-dark border border-warning text-warning d-flex align-items-center gap-1 px-3 py-2 fs-6 shadow-sm"
                title="Tus puntos LevelUp"
              >
                <span id="navPuntos" className="fw-bold">{usuario?.puntosLevelUp || 0}</span>
                <i className="bi bi-coin text-warning"></i>
              </div>
            </div>
          ) : (
            <div id="autenticacion-buttons" className="d-flex align-items-center gap-2">
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
    </nav>
  );
};
