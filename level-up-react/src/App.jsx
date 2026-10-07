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
import Register from './pages/Register';  
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import Nosotros from './pages/Nosotros';
import AdminRespaldo from './pages/AdminRespaldo';
import AdminUsuario from './pages/AdminUsuario';
import AdminProducto from './pages/AdminProducto';
import GuiaCrear from './pages/GuiaCrear';
import GuiasLista from './pages/GuiasLista';
import BlogLista from './pages/BlogLista';

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
              <Route path="/Register" element={<Register />} />
              <Route path="/Login" element={<Login />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/nosotros" element={<Nosotros />} />
              <Route path="/guias" element={<GuiasLista />} />
              <Route path="/crear-guia" element={<GuiaCrear />} />
              <Route path="/blog" element={<BlogLista />} />
              
              {/* Rutas Adicionales del Diagrama */}
              <Route path="/ofertas" element={<Gallery />} />
              <Route path="/admin" element={<VistaEnConstruccion titulo="Panel Administrativo" icono="bi-speedometer2" />} />
              <Route path="*" element={<VistaEnConstruccion titulo="Página No Encontrada (404)" icono="bi-exclamation-triangle" />} />
              <Route path="/AdminRespaldo" element={<AdminRespaldo />} />
              <Route path="/AdminUsuario" element={<AdminUsuario />} />
              <Route path="/AdminProducto" element={<AdminProducto />} />

              

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

