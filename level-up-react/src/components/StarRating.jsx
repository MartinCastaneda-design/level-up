import React from 'react';

export const StarRating = ({ rating = 5 }) => {
  const estrellasLlenas = Math.floor(rating);
  const tieneMedia = rating % 1 >= 0.5;

  return (
    <div className="text-warning small d-inline-flex align-items-center gap-1">
      {[...Array(5)].map((_, i) => {
        if (i < estrellasLlenas) {
          return <i key={i} className="bi bi-star-fill"></i>;
        } else if (i === estrellasLlenas && tieneMedia) {
          return <i key={i} className="bi bi-star-half"></i>;
        } else {
          return <i key={i} className="bi bi-star"></i>;
        }
      })}
      <span className="text-muted ms-1" style={{ fontSize: '0.75rem' }}>
        ({rating.toFixed(1)})
      </span>
    </div>
  );
};
