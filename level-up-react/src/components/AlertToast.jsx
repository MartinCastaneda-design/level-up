import React from 'react';

export const AlertToast = ({ mensaje, tipo = 'info', onClose }) => {
  if (!mensaje) return null;

  const iconos = {
    success: 'bi-check-circle-fill',
    danger: 'bi-exclamation-octagon-fill',
    warning: 'bi-exclamation-triangle-fill',
    info: 'bi-info-circle-fill'
  };

  return (
    <div
      className={`alert alert-${tipo} alert-box-status position-fixed top-0 end-0 m-4 shadow-lg d-flex align-items-center gap-2`}
      style={{ zIndex: 9999, minWidth: '280px' }}
      role="alert"
    >
      <i className={`bi ${iconos[tipo] || iconos.info} fs-5`}></i>
      <div className="flex-grow-1">{mensaje}</div>
      {onClose && (
        <button
          type="button"
          className="btn-close btn-close-white ms-2"
          aria-label="Close"
          onClick={onClose}
        ></button>
      )}
    </div>
  );
};

export default AlertToast;
