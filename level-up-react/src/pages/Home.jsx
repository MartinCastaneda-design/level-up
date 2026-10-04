import React from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTOS_DATA } from '../js/products-data';
import { ProductCard } from '../components/ProductCard';

export const Home = () => {
  const productosDestacados = PRODUCTOS_DATA.filter((p) => p.destacado).slice(0, 4);

  return (
    <main className="container my-4">
      {/* Banner Hero Principal */}
      <section className="hero-banner p-4 p-md-5 mb-5 text-white position-relative">
        <div className="row align-items-center">
          <div className="col-lg-7">
            <span className="badge badge-category px-3 py-2 rounded-pill mb-3">🔥 Especial Gamers Chile</span>
            <h1 className="display-5 fw-bold mb-3">
              Desafía tus límites con <span className="text-info">Level-Up</span>
            </h1>
            <p className="lead text-light mb-4">
              Consolas de última generación, PC Master Race, periféricos de alta precisión y juegos de mesa para toda la comunidad.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <Link to="/catalogo" className="btn btn-primary btn-lg px-4">
                <i className="bi bi-controller me-2"></i>Ver Catálogo Completo
              </Link>
              <a href="#info-descuento" className="btn btn-outline-info btn-lg px-4">
                20% Descuento Especial
              </a>
            </div>
          </div>
          <div className="col-lg-5 text-center mt-4 mt-lg-0">
            <img
              src="https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=500&q=80"
              alt="PlayStation 5 Level-Up"
              className="img-fluid rounded-4 shadow-lg border border-secondary"
              style={{ maxHeight: '280px', objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* Accesos Rápidos por Categoría */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h2 className="h3 mb-1">Categorías Populares</h2>
            <p className="text-muted mb-0">Explora nuestro equipamiento gamer por secciones</p>
          </div>
          <Link to="/catalogo" className="text-info text-decoration-none">
            Ver todas <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
        <div className="row g-3 text-center">
          <div className="col-6 col-md-4 col-lg-2">
            <Link to="/catalogo?cat=consolas" className="card gamer-card p-3 text-decoration-none text-white h-100">
              <i className="bi bi-controller fs-1 text-info mb-2"></i>
              <h6 className="mb-0">Consolas</h6>
            </Link>
          </div>
          <div className="col-6 col-md-4 col-lg-2">
            <Link to="/catalogo?cat=computadores-gamers" className="card gamer-card p-3 text-decoration-none text-white h-100">
              <i className="bi bi-pc-display-horizontal fs-1 text-info mb-2"></i>
              <h6 className="mb-0">PC Gamers</h6>
            </Link>
          </div>
          <div className="col-6 col-md-4 col-lg-2">
            <Link to="/catalogo?cat=mouse" className="card gamer-card p-3 text-decoration-none text-white h-100">
              <i className="bi bi-mouse fs-1 text-info mb-2"></i>
              <h6 className="mb-0">Mouse</h6>
            </Link>
          </div>
          <div className="col-6 col-md-4 col-lg-2">
            <Link to="/catalogo?cat=accesorios" className="card gamer-card p-3 text-decoration-none text-white h-100">
              <i className="bi bi-headset fs-1 text-info mb-2"></i>
              <h6 className="mb-0">Accesorios</h6>
            </Link>
          </div>
          <div className="col-6 col-md-4 col-lg-2">
            <Link to="/catalogo?cat=sillas-gamers" className="card gamer-card p-3 text-decoration-none text-white h-100">
              <i className="bi bi-person-workspace fs-1 text-info mb-2"></i>
              <h6 className="mb-0">Sillas</h6>
            </Link>
          </div>
          <div className="col-6 col-md-4 col-lg-2">
            <Link to="/catalogo?cat=juegos-de-mesa" className="card gamer-card p-3 text-decoration-none text-white h-100">
              <i className="bi bi-dice-5 fs-1 text-info mb-2"></i>
              <h6 className="mb-0">Juegos de Mesa</h6>
            </Link>
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section id="destacados" className="mb-5">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h2 className="h3 mb-1">🔥 Productos Destacados</h2>
            <p className="text-muted mb-0">Los artículos más codiciados por la comunidad</p>
          </div>
          <Link to="/catalogo" className="btn btn-outline-info btn-sm">
            Ver Catálogo Completo
          </Link>
        </div>
        <div className="row g-4" id="contenedorDestacados">
          {productosDestacados.map((prod) => (
            <div key={prod.id} className="col-sm-6 col-md-3">
              <ProductCard producto={prod} />
            </div>
          ))}
        </div>
      </section>

      {/* Beneficios y Descuento Especial */}
      <section id="info-descuento" className="card gamer-card p-4 p-md-5 my-5 border-info">
        <div className="row align-items-center">
          <div className="col-lg-8">
            <span className="badge bg-warning text-dark px-3 py-1 fw-bold mb-2">🎁 Beneficio Exclusivo</span>
            <h3 className="fw-bold mb-2">¿Quieres un descuento especial?</h3>
            <p className="text-light mb-3">
              Obtén un <strong>20% de descuento</strong> en todos tus pedidos usando el cupón{' '}
              <code className="bg-dark text-warning px-2 py-1 rounded">ESTUDIANTE20</code> o{' '}
              <code className="bg-dark text-warning px-2 py-1 rounded">PROMO20</code> al pagar.
            </p>
            <div className="d-flex gap-2">
              <Link to="/Register" className="btn btn-primary">
                Registrarme ahora
              </Link>
            </div>
          </div>
          <div className="col-lg-4 text-center mt-4 mt-lg-0">
            <div className="p-3 bg-dark rounded-3 border border-secondary">
              <i className="bi bi-shield-check fs-1 text-info mb-2"></i>
              <h5 className="text-white mb-1">Garantía & Despacho</h5>
              <p className="text-muted small mb-0">Envíos rápidos y seguros a todo Chile continental.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
