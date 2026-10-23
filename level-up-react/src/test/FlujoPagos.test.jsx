import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import PaymentSuccess from '../pages/PaymentSuccess';
import PaymentFailure from '../pages/PaymentFailure';

const MockWrapper = ({ children }) => (
  <AuthProvider>
    <CartProvider>
      <BrowserRouter>{children}</BrowserRouter>
    </CartProvider>
  </AuthProvider>
);

describe('Vistas de Confirmación y Fallo de Pago', () => {
  it('PaymentSuccess: debe mostrar el mensaje de compra exitosa y botón a historial', () => {
    render(
      <MockWrapper>
        <PaymentSuccess />
      </MockWrapper>
    );
    expect(screen.getByText(/¡PAGO REALIZADO CON ÉXITO!/i)).toBeInTheDocument();
    expect(screen.getByText(/Ver en Mi Historial/i)).toBeInTheDocument();
  });

  it('PaymentFailure: debe renderizar la causa del rechazo y sugerencias para el usuario', () => {
    render(
      <MockWrapper>
        <PaymentFailure />
      </MockWrapper>
    );
    expect(screen.getByText(/NO SE PUDO REALIZAR EL PAGO/i)).toBeInTheDocument();
    expect(screen.getByText(/Reintentar Pago/i)).toBeInTheDocument();
  });
});
