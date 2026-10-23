import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export const PaymentFailure = () => {
  const location = useLocation();
  const motivo = location.state?.motivo || 'Fondos insuficientes o transacción rechazada por el banco emisor.';

  return (
    <main className="container my-5 flex-grow-1">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-7">
          <div className="card gamer-card border-danger p-4 p-md-5 text-center shadow-lg position-relative overflow-hidden">
            <div className="mb-3">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-25 p-4 mb-2"
                style={{ width: '90px', height: '90px' }}
              >
                <i className="bi bi-x-circle-fill text-danger display-4"></i>
              </div>
            </div>

            <h1 className="h2 text-white brand-font mb-2">NO SE PUDO REALIZAR EL PAGO</h1>
            <p className="text-secondary mb-4">
              Lo sentimos, la pasarela de pagos no pudo autorizar la transacción. No se ha realizado ningún cobro a tu tarjeta.
            </p>

            {/* Caja de Explicación del Error */}
            <div className="alert alert-danger bg-opacity-10 border border-danger text-start p-3 mb-4 rounded-3">
              <div className="d-flex align-items-center gap-2 mb-1">
                <i className="bi bi-exclamation-triangle-fill text-danger fs-5"></i>
                <strong className="text-white">Causa del rechazo:</strong>
              </div>
              <p className="text-danger-emphasis mb-0 small ps-4">
                {motivo}
              </p>
            </div>

            {/* Sugerencias para el usuario */}
            <div className="bg-dark p-3 rounded-3 text-start border border-secondary mb-4 small text-secondary">
              <p className="fw-bold text-white mb-2">Te sugerimos intentar lo siguiente:</p>
              <ul className="mb-0 ps-3">
                <li>Verifica que los datos de tu tarjeta (número, fecha, CVV) sean correctos.</li>
                <li>Asegúrate de contar con cupo o saldo disponible suficiente.</li>
                <li>Prueba con otro medio de pago alternativo (Transferencia o Débito).</li>
              </ul>
            </div>

            {/* Acciones */}
            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
              <Link to="/checkout" className="btn btn-warning fw-bold">
                <i className="bi bi-arrow-repeat me-2"></i>Reintentar Pago
              </Link>
              <Link to="/carrito" className="btn btn-outline-secondary text-white">
                <i className="bi bi-cart3 me-2"></i>Volver al Carrito
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentFailure;
