import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

export const Footer = () => {
  const location = useLocation();

  const authRoutes = ['/Login', '/Register'];
  if (authRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <footer className="gamer-footer py-5 text-light">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-lg-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <img src={logo} alt="Level-Up" style={{ maxHeight: '40px' }} />
              <span className="fw-bold brand-font text-info fs-5">LEVEL-UP GAMER</span>
            </div>
            <p className="text-muted small">
              Tu tienda de videojuegos y hardware en Chile. Diseñada por gamers, para gamers. Descubre la mejor tecnología y accesorios.
            </p>
            <div className="d-flex gap-3 fs-5">
              <a href="#" className="text-info"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-info"><i className="bi bi-instagram"></i></a>
              <a href="#" className="text-info"><i className="bi bi-discord"></i></a>
              <a href="#" className="text-info"><i className="bi bi-youtube"></i></a>
            </div>
          </div>
          <div className="col-6 col-lg-2">
            <h6 className="text-white brand-font mb-3">Navegación</h6>
            <ul className="list-unstyled small text-muted">
              <li className="mb-2"><Link to="/" className="text-muted text-decoration-none">Inicio</Link></li>
              <li className="mb-2"><Link to="/catalogo" className="text-muted text-decoration-none">Catálogo</Link></li>
              <li className="mb-2"><Link to="/opiniones" className="text-muted text-decoration-none">Opiniones</Link></li>
              <li className="mb-2"><Link to="/nosotros" className="text-muted text-decoration-none">Nosotros</Link></li>
              <li className="mb-2"><Link to="/carrito" className="text-muted text-decoration-none">Mi Carrito</Link></li>
            </ul>
          </div>
          <div className="col-6 col-lg-3">
            <h6 className="text-white brand-font mb-3">Categorías</h6>
            <ul className="list-unstyled small text-muted">
              <li className="mb-2"><Link to="/catalogo?cat=consolas" className="text-muted text-decoration-none">Consolas</Link></li>
              <li className="mb-2"><Link to="/catalogo?cat=computadores-gamers" className="text-muted text-decoration-none">Computadores</Link></li>
              <li className="mb-2"><Link to="/catalogo?cat=mouse" className="text-muted text-decoration-none">Periféricos & Mouse</Link></li>
              <li className="mb-2"><Link to="/catalogo?cat=juegos-de-mesa" className="text-muted text-decoration-none">Juegos de Mesa</Link></li>
            </ul>
          </div>
          <div className="col-lg-3">
            <h6 className="text-white brand-font mb-3">Contacto & Soporte</h6>
            <p className="text-muted small mb-1"><i className="bi bi-geo-alt me-2 text-info"></i>Despachos a todo Chile</p>
            <p className="text-muted small mb-1"><i className="bi bi-envelope me-2 text-info"></i>soporte@levelupgamer.cl</p>
            <p className="text-muted small mb-3"><i className="bi bi-whatsapp me-2 text-success"></i>+56 9 1234 5678</p>
          </div>
        </div>
        <hr className="border-secondary" />
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center text-muted small">
          <p className="mb-0">© 2026 Level-Up Gamer SpA. Todos los derechos reservados.</p>
          <p className="mb-0">Proyecto Front-End - Tienda Online</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;