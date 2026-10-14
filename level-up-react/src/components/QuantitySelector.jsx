import React from 'react';

export const QuantitySelector = ({ cantidad, stock = 99, onIncrementar, onDecrementar, onChange, disabled = false }) => {
  return (
    <div className="input-group" style={{ width: '135px' }}>
      <button
        className="btn btn-outline-secondary text-white"
        type="button"
        disabled={disabled || cantidad <= 1}
        onClick={onDecrementar}
      >
        -
      </button>
      <input
        type="number"
        className="form-control bg-dark border-secondary text-light text-center fw-bold px-1"
        value={cantidad}
        min="1"
        max={stock}
        disabled={disabled}
        onChange={(e) => {
          if (onChange) {
            onChange(Number(e.target.value));
          }
        }}
      />
      <button
        className="btn btn-outline-secondary text-white"
        type="button"
        disabled={disabled || cantidad >= stock}
        onClick={onIncrementar}
      >
        +
      </button>
    </div>
  );
};

export default QuantitySelector;
