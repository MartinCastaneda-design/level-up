import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // 1. IMPORTAMOS EL CONTEXTO DE AUTENTICACIÓN
import { formatCLP, getProductReviewsInfo } from '../js/products-data';

export const ProductCard = ({ producto }) => {
  const { agregarAlCarrito } = useCart();
  const { usuario } = useAuth(); // 2. TRAEMOS AL USUARIO ACTIVO
  
  // 3. ESTADO PARA CONTROLAR EL COLOR DEL CORAZÓN
  const [esFavorito, setEsFavorito] = useState(false);

  // 4. AL CARGAR LA TARJETA, REVISAMOS SI YA ERA FAVORITO
  useEffect(() => {
    if (usuario) {
      const favoritos = JSON.parse(localStorage.getItem('levelup_favoritos')) || [];
      const existe = favoritos.some(fav => fav.correo === usuario.correo && fav.idProducto === producto.id);
      setEsFavorito(existe);
    } else {
      setEsFavorito(false);
    }
  }, [usuario, producto.id]);

  // 5. FUNCIÓN QUE SE EJECUTA AL HACER CLIC EN EL CORAZÓN
  const toggleFavorito = (e) => {
    e.preventDefault(); // Evita que el navegador intente abrir un enlace por accidente
    
    if (!usuario) {
      alert("¡Debes iniciar sesión con tu cuenta Gamer para guardar favoritos!");
      return;
    }

    let favoritos = JSON.parse(localStorage.getItem('levelup_favoritos')) || [];
    const index = favoritos.findIndex(fav => fav.correo === usuario.correo && fav.idProducto === producto.id);

    if (index === -1) {
      // Si no existe, lo agregamos y ponemos el corazón rojo
      favoritos.push({ correo: usuario.correo, idProducto: producto.id });
      setEsFavorito(true);
    } else {
      // Si ya existe, lo quitamos y dejamos el corazón vacío
      favoritos.splice(index, 1);
      setEsFavorito(false);
    }
    
    localStorage.setItem('levelup_favoritos', JSON.stringify(favoritos));
  };

  const revInfo = (typeof getProductReviewsInfo === 'function')
    ? getProductReviewsInfo(producto.id)
    : { rating: producto.rating || 5, count: producto.numReviews || 0 };

  const stockBadgeClass = producto.stock <= 0
    ? 'badge-stock-out'
    : (producto.stock <= 5 ? 'badge-stock-low' : 'badge-stock');
  const stockTexto = producto.stock <= 0 ? 'Agotado' : `Stock: ${producto.stock} un.`;
  const estaAgotado = producto.stock <= 0;

  return (
    <div className="card gamer-card h-100 d-flex flex-column">
      <div className="position-relative overflow-hidden" style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
        <Link to={`/producto/${producto.id}`}>
          <img
            src={producto.imagen}
            className="card-img-top"
            alt={producto.nombre}
            style={{ height: '210px', objectFit: 'cover' }}
          />
        </Link>
        
        {/* 6. BOTÓN DE FAVORITO: Aparece flotando en la esquina superior izquierda */}
        <button 
          className="btn btn-sm btn-dark position-absolute top-0 start-0 m-2 rounded-circle shadow-sm"
          style={{ width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: 'rgba(33, 37, 41, 0.85)' }}
          onClick={toggleFavorito}
          title={esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <i className={`bi ${esFavorito ? 'bi-heart-fill text-danger' : 'bi-heart text-white'}`}></i>
        </button>

        {producto.enOferta && (
          <span className="badge badge-discount position-absolute top-0 end-0 m-2">
            -{producto.descuento}% OFF
          </span>
        )}
      </div>

      <div className="card-body d-flex flex-column p-3">
        <div className="d-flex flex-wrap gap-2 mb-2 align-items-center">
          <span className="badge badge-category">{producto.categoria}</span>
          <span className={`badge ${stockBadgeClass}`}>{stockTexto}</span>
        </div>

        <h6 className="card-title text-white mb-3" style={{ minHeight: '2.4rem' }}>
          <Link to={`/producto/${producto.id}`} className="text-white text-decoration-none hover-info">
            {producto.nombre}
          </Link>
        </h6>

        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span className="price-tag fs-5">{formatCLP(producto.precio)}</span>
              {producto.enOferta && (
                <>
                  <br />
                  <small className="text-decoration-line-through text-muted">
                    {formatCLP(Math.round(producto.precio * (1 + producto.descuento / 100)))}
                  </small>
                </>
              )}
            </div>
            <div className="text-warning small text-end">
              <div><i className="bi bi-star-fill"></i> {revInfo.rating}</div>
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                ({revInfo.count} {revInfo.count === 1 ? 'reseña' : 'reseñas'})
              </span>
            </div>
          </div>

          <div className="d-grid gap-2">
            <Link to={`/producto/${producto.id}`} className="btn btn-outline-info btn-sm">
              Ver Detalle
            </Link>
            <button
              onClick={() => agregarAlCarrito(producto, 1)}
              className="btn btn-primary btn-sm"
              disabled={estaAgotado}
            >
              <i className="bi bi-cart-plus me-1"></i>
              {estaAgotado ? 'Agotado' : 'Añadir al Carrito'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;