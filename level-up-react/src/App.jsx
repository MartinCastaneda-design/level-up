import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import './css/estilos.css';

// Componente placeholder para vistas mientras se crean en la carpeta pages
const VistaEnConstruccion = ({ titulo, icono = 'bi-tools' }) => (
  <main className="container my-5 text-center flex-grow-1">
    <div className="card gamer-card p-5 my-4">
      <i className={`bi ${icono} text-info mb-3`} style={{ fontSize: '3rem' }}></i>
      <h2 className="text-white brand-font mb-2">{titulo}</h2>
      <p className="text-muted mb-4">
        Esta vista está lista para ser implementada en la carpeta <code>src/pages/</code>.
      </p>
      <div>
        <Link to="/" className="btn btn-outline-info">
          <i className="bi bi-arrow-left me-1"></i>Volver al Inicio
        </Link>
      </div>
    </div>
  </main>
);

export const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <Routes>
              {/* Rutas principales que apuntarán a las páginas en src/pages/ */}
              <Route path="/" element={<VistaEnConstruccion titulo="Página de Inicio" icono="bi-house-door" />} />
              <Route path="/catalogo" element={<VistaEnConstruccion titulo="Catálogo General" icono="bi-grid" />} />
              <Route path="/categoria/:cat" element={<VistaEnConstruccion titulo="Vista de Categoría" icono="bi-collection" />} />
              <Route path="/producto/:id" element={<VistaEnConstruccion titulo="Detalle de Producto" icono="bi-search" />} />
              <Route path="/ofertas" element={<VistaEnConstruccion titulo="Ofertas Especiales" icono="bi-tag" />} />
              <Route path="/carrito" element={<VistaEnConstruccion titulo="Carrito de Compras" icono="bi-cart3" />} />
              <Route path="/checkout" element={<VistaEnConstruccion titulo="Finalizar Compra / Pago" icono="bi-credit-card" />} />
              <Route path="/pago-exitoso" element={<VistaEnConstruccion titulo="Compra Exitosa" icono="bi-check-circle" />} />
              <Route path="/pago-fallido" element={<VistaEnConstruccion titulo="Pago No Realizado" icono="bi-x-circle" />} />
              <Route path="/login" element={<VistaEnConstruccion titulo="Iniciar Sesión" icono="bi-person" />} />
              <Route path="/registro" element={<VistaEnConstruccion titulo="Registro de Usuario" icono="bi-person-plus" />} />
              <Route path="/perfil" element={<VistaEnConstruccion titulo="Mi Perfil" icono="bi-person-badge" />} />
              <Route path="/opiniones" element={<VistaEnConstruccion titulo="Opiniones y Reseñas" icono="bi-chat-heart" />} />
              <Route path="/admin" element={<VistaEnConstruccion titulo="Panel Administrativo" icono="bi-speedometer2" />} />
              <Route path="*" element={<VistaEnConstruccion titulo="Página No Encontrada (404)" icono="bi-exclamation-triangle" />} />
            </Routes>
            <Footer />
            <WhatsAppButton />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
