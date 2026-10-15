import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Checkout } from '../pages/Checkout';
import * as CartContextModule from '../context/CartContext';
import * as AuthContextModule from '../context/AuthContext';

describe('Prueba Página: Checkout.jsx', () => {
  it('Debe solicitar inicio de sesión si el usuario no está autenticado', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      usuario: null,
      estaAutenticado: false
    });

    vi.spyOn(CartContextModule, 'useCart').mockReturnValue({
      carrito: [{ id: '1', nombre: 'Mouse Gamer', precio: 19990, cantidad: 1 }],
      total: 19990,
      subtotal: 19990,
      montoDescuento: 0,
      porcentajeDescuento: 0,
      vaciarCarrito: vi.fn()
    });

    render(
      <BrowserRouter>
        <Checkout />
      </BrowserRouter>
    );

    expect(screen.getByText(/Inicio de Sesión Requerido/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Iniciar Sesión/i })).toBeInTheDocument();
  });

  it('Debe renderizar los datos de contacto y el método de pago cuando hay usuario y carrito', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      usuario: { nombre: 'Fernando', apellido: 'Gamer', correo: 'fernando@levelup.cl', puntosLevelUp: 50 },
      estaAutenticado: true,
      agregarPuntos: vi.fn(),
      descontarPuntos: vi.fn()
    });

    vi.spyOn(CartContextModule, 'useCart').mockReturnValue({
      carrito: [{ id: '1', nombre: 'Mouse Gamer', precio: 19990, cantidad: 1, imagen: 'test.jpg' }],
      total: 19990,
      subtotal: 19990,
      montoDescuento: 0,
      porcentajeDescuento: 0,
      vaciarCarrito: vi.fn()
    });

    render(
      <BrowserRouter>
        <Checkout />
      </BrowserRouter>
    );

    const inputNombre = screen.getByLabelText(/Nombre \*/i);
    expect(inputNombre).toHaveValue('Fernando');
    expect(screen.getByText(/Webpay Plus/i)).toBeInTheDocument();
    expect(screen.getByText(/Artículos en tu pedido/i)).toBeInTheDocument();
  });
});
