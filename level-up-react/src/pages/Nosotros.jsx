import React from 'react';
import { Link } from 'react-router-dom';

export const Nosotros = () => {
  return (
    <>
      {/* Contenido Principal */}
      <main className="container my-5 flex-grow-1">
        
        {/* Hero Nosotros */}
        <section className="hero-banner p-4 p-md-5 mb-5 text-white">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <span className="badge badge-category px-3 py-2 rounded-pill mb-3">🚀 Conócenos</span>
              <h1 className="display-5 fw-bold mb-3">
                Diseñado por gamers, <span className="text-info">para gamers</span>
              </h1>
              <p className="lead text-light mb-4">
                En <strong>Level-Up Gamer</strong> impulsamos la pasión por los videojuegos y la tecnología en Chile, acercando el mejor hardware, consolas, periféricos y juegos de mesa con servicio de primer nivel.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/catalogo" className="btn btn-primary btn-lg px-4">
                  <i className="bi bi-controller me-2"></i>Explorar Catálogo
                </Link>
                {/* Usamos una etiqueta <a> normal para enlaces ancla (anchor) de la misma página */}
                <a href="#mision-vision" className="btn btn-outline-info btn-lg px-4">
                  Misión & Visión
                </a>
              </div>
            </div>
            <div className="col-lg-5 text-center mt-4 mt-lg-0">
              <img 
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80" 
                alt="Level-Up Team Setup" 
                className="img-fluid rounded-4 shadow-lg border border-secondary" 
                style={{ maxHeight: '290px', width: '100%', objectFit: 'cover' }} 
              />
            </div>
          </div>
        </section>

        {/* Estadísticas Clave */}
        <section className="mb-5">
          <div className="row g-3 text-center">
            <div className="col-6 col-md-3">
              <div className="card gamer-card p-4 h-100">
                <h2 className="text-info brand-font mb-1">+10.000</h2>
                <p className="text-muted small mb-0">Gamers Satisfechos</p>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card gamer-card p-4 h-100">
                <h2 className="text-info brand-font mb-1">100%</h2>
                <p className="text-muted small mb-0">Productos Originales</p>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card gamer-card p-4 h-100">
                <h2 className="text-info brand-font mb-1">24/7</h2>
                <p className="text-muted small mb-0">Soporte Técnico Gamer</p>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card gamer-card p-4 h-100">
                <h2 className="text-info brand-font mb-1">Todo Chile</h2>
                <p className="text-muted small mb-0">Despachos Express</p>
              </div>
            </div>
          </div>
        </section>

        {/* Misión, Visión y Valores */}
        <section id="mision-vision" className="mb-5">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card gamer-card p-4 p-md-5 h-100 border-info">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-3 bg-dark rounded-circle border border-info text-info fs-3">
                    <i className="bi bi-crosshair"></i>
                  </div>
                  <h3 className="h4 text-white mb-0">Nuestra Misión</h3>
                </div>
                <p className="text-light mb-0">
                  Proveer a la comunidad gamer y entusiasta de la tecnología en Chile el equipamiento de más alto rendimiento, accesorios personalizados y juegos de mesa que potencien su experiencia de entretenimiento, garantizando asesoría experta, precios justos y una experiencia de compra rápida y segura.
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card gamer-card p-4 p-md-5 h-100 border-info">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-3 bg-dark rounded-circle border border-info text-info fs-3">
                    <i className="bi bi-eye"></i>
                  </div>
                  <h3 className="h4 text-white mb-0">Nuestra Visión</h3>
                </div>
                <p className="text-light mb-0">
                  Ser la tienda referente líder en el ecosistema gamer de Chile y Latinoamérica, reconocida por su excelencia en servicio técnico, fidelización comunitaria mediante Puntos Level-Up y compromiso inquebrantable con la innovación y los esports.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Nuestros Valores y Pilares */}
        <section className="mb-5">
          <div className="text-center mb-4">
            <h2 className="h3 text-white brand-font mb-2">🎮 Por Qué Elegir Level-Up Gamer</h2>
            <p className="text-muted">Nuestros compromisos fundamentales contigo en cada compra</p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card gamer-card p-4 h-100 text-center">
                <i className="bi bi-shield-check text-info fs-1 mb-3"></i>
                <h5 className="text-white mb-2">Garantía Oficial</h5>
                <p className="text-muted small mb-0">
                  Todos nuestros productos cuentan con garantía directa de fábrica y soporte local certificado para máxima tranquilidad.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card gamer-card p-4 h-100 text-center">
                <i className="bi bi-truck text-info fs-1 mb-3"></i>
                <h5 className="text-white mb-2">Envíos Rápidos y Seguros</h5>
                <p className="text-muted small mb-0">
                  Embalaje especial de alta protección con seguimiento en tiempo real de tu pedido a cualquier región del país.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card gamer-card p-4 h-100 text-center">
                <i className="bi bi-award text-info fs-1 mb-3"></i>
                <h5 className="text-white mb-2">Puntos y Descuentos</h5>
                <p className="text-muted small mb-0">
                  Acumula Puntos Level-Up en cada compra e invitación para canjear productos y aprovecha el 20% especial para estudiantes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Historia */}
        <section className="card gamer-card p-4 p-md-5 my-5">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h3 className="h4 text-white brand-font mb-3">
                <i className="bi bi-journal-bookmark text-info me-2"></i>Nuestra Historia
              </h3>
              <p className="text-light mb-3">
                Nacimos como un proyecto apasionado entre amigos gamers y estudiantes de tecnología que buscaban una tienda online confiable, transparente y especializada. Con el tiempo, hemos crecido incorporando marcas globales líderes como Sony, Microsoft, ASUS ROG, Logitech, HyperX, Razer y Devir.
              </p>
              <p className="text-muted small mb-0">
                Hoy somos una comunidad en constante expansión, comprometida con llevar el mejor equipamiento a jugadores casuales, creadores de contenido y competidores de esports en todo Chile.
              </p>
            </div>
            <div className="col-lg-6 mt-4 mt-lg-0 text-center">
              <img 
                src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80" 
                alt="Level-Up Gaming Room" 
                className="img-fluid rounded-3 border border-secondary" 
                style={{ maxHeight: '260px', width: '100%', objectFit: 'cover' }} 
              />
            </div>
          </div>
        </section>
      </main>

      {/* Botón Flotante de WhatsApp */}
      <a 
        href="https://wa.me/56912345678?text=Hola%20Level-Up%20Gamer,%20quiero%20conocer%20m%C3%A1s%20sobre%20ustedes" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="whatsapp-float" 
        title="Soporte Técnico por WhatsApp"
      >
        <i className="bi bi-whatsapp"></i>
      </a>
    </>
  );
};

export default Nosotros;