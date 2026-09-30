import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { StarRating } from './StarRating';

export const ProductCard = ({ producto }) => {
  const { agregarAlCarrito } = useCart();

  const formatearCLP = (valor) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(valor);
  };

  return (
    <div className="card gamer-card h-100 position-relative">
      {producto.enOferta && (
        <span className="badge-offer">
          🔥 -{producto.descuento || 15}%
        </span>
      )}

      <img
        src={producto.imagen}
        className="card-img-top p-3"
        alt={producto.nombre}
        style={{ height: '220px', objectFit: 'contain' }}
        loading="lazy"
      />

      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="badge badge-category small">{producto.categoria}</span>
          <StarRating rating={producto.rating || 5} />
        </div>

        <h5 className="card-title text-white mt-2 mb-1" style={{ fontSize: '1.05rem' }}>
          {producto.nombre}
        </h5>

        <p className="card-text text-muted small flex-grow-1">
          {producto.descripcionCorta}
        </p>

        <div className="d-flex justify-content-between align-items-baseline mt-2 mb-3">
          <span className="price-tag fs-5">{formatearCLP(producto.precio)}</span>
          {producto.stock && (
            <span className="text-muted small">Stock: {producto.stock}</span>
          )}
        </div>

        <div className="d-grid gap-2">
          <button
            type="button"
            className="btn btn-primary btn-sm py-2"
            onClick={() => agregarAlCarrito(producto, 1)}
          >
            <i className="bi bi-cart-plus me-1"></i>Añadir al Carrito
          </button>
          <Link
            to={`/producto/${producto.id}`}
            className="btn btn-outline-info btn-sm"
          >
            Ver Detalle
          </Link>
        </div>
      </div>
    </div>
  );
};
