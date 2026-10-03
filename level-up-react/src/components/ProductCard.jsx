import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCLP, getProductReviewsInfo } from '../js/products-data';

export const ProductCard = ({ producto }) => {
  const { agregarAlCarrito } = useCart();

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
