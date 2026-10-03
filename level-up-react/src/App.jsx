import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import './css/estilos.css';

// Importación de Páginas
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import ProductDetail from './pages/ProductDetail';
import ProductReviews from './pages/ProductReviews';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

// Componente placeholder para vistas secundarias adicionales
const VistaEnConstruccion = ({ titulo, icono = 'bi-tools' }) => (
  <main className="container my-5 text-center flex-grow-1">
    <div className="card gamer-card p-5 my-4">
      <i className={`bi ${icono} text-info mb-3`} style={{ fontSize: '3rem' }}></i>
      <h2 className="text-white brand-font mb-2">{titulo}</h2>
      <p className="text-muted mb-4">
        Esta vista está disponible para ser implementada en la carpeta <code>src/pages/</code>.
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
              {/* Vistas Principales Implementadas */}
              <Route path="/" element={<Home />} />
              <Route path="/catalogo" element={<Gallery />} />
              <Route path="/producto/:id" element={<ProductDetail />} />
              <Route path="/opiniones" element={<ProductReviews />} />
              <Route path="/carrito" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />

              {/* Rutas Adicionales del Diagrama */}
              <Route path="/ofertas" element={<Gallery />} />
              <Route path="/login" element={<VistaEnConstruccion titulo="Iniciar Sesión" icono="bi-person" />} />
              <Route path="/registro" element={<VistaEnConstruccion titulo="Registro de Usuario" icono="bi-person-plus" />} />
              <Route path="/perfil" element={<VistaEnConstruccion titulo="Mi Perfil" icono="bi-person-badge" />} />
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

