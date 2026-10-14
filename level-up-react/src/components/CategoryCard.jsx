import React from 'react';
import { Link } from 'react-router-dom';

export const CategoryCard = ({ slug, nombre, icono, desc }) => {
  return (
    <div className="col-6 col-md-4 col-lg-2">
      <Link
        to={`/catalogo?cat=${slug}`}
        className="card gamer-card p-3 text-decoration-none text-white h-100 text-center"
      >
        <div className="text-info mb-2 fs-1">
          <i className={`bi ${icono}`}></i>
        </div>
        <h6 className="mb-0">{nombre}</h6>
        {desc && <small className="text-muted mt-1 d-block" style={{ fontSize: '0.75rem' }}>{desc}</small>}
      </Link>
    </div>
  );
};

export default CategoryCard;
