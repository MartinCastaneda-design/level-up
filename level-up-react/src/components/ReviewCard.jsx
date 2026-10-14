import React from 'react';

export const ReviewCard = ({ autor, nombreProducto, calificacion = 5, comentario, fecha }) => {
  const estrellas = '⭐'.repeat(calificacion || 5);

  return (
    <div className="card gamer-card p-4">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <h6 className="text-info mb-1">
            <i className="bi bi-person-circle me-2"></i>{autor}
          </h6>
          {nombreProducto && (
            <small className="text-muted">
              Reseña sobre: <strong className="text-white">{nombreProducto}</strong>
            </small>
          )}
        </div>
        <div className="text-end">
          <div className="mb-1">{estrellas}</div>
          <small className="text-muted">{fecha || 'Reciente'}</small>
        </div>
      </div>
      <hr className="border-secondary my-2" />
      <p className="text-light mb-0 mt-2">"{comentario}"</p>
    </div>
  );
};

export default ReviewCard;
