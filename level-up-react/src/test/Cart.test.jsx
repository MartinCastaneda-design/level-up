import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Cart } from '../pages/Cart';
import * as CartContextModule from '../context/CartContext';

describe('Prueba Página: Cart.jsx', () => {
  it('Debe renderizar el mensaje de carrito vacío cuando no hay productos agregados', () => {
    vi.spyOn(CartContextModule, 'useCart').mockReturnValue({
      carrito: [],
      cupon: null,
      totalArticulos: 0,
      subtotal: 0,
      porcentajeDescuento: 0,
      montoDescuento: 0,
      total: 0,
      actualizarCantidad: vi.fn(),
      eliminarDelCarrito: vi.fn(),
      vaciarCarrito: vi.fn(),
      aplicarCuponDescuento: vi.fn(),
      removerCupon: vi.fn()
    });

    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );

    expect(screen.getByText(/Tu carrito está vacío/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ir al Catálogo de Productos/i })).toBeInTheDocument();
  });

  it('Debe renderizar los productos en la tabla y permitir aplicar un cupón de descuento', () => {
    const mockAplicarCupon = vi.fn().mockReturnValue({ exito: true, mensaje: '¡Cupón aplicado!' });

    vi.spyOn(CartContextModule, 'useCart').mockReturnValue({
      carrito: [
        {
          id: 'JM001',
          nombre: 'Catan',
          precio: 29990,
          cantidad: 1,
          imagen: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09',
          categoria: 'Juegos de Mesa'
        }
      ],
      cupon: null,
      totalArticulos: 1,
      subtotal: 29990,
      porcentajeDescuento: 0,
      montoDescuento: 0,
      total: 29990,
      actualizarCantidad: vi.fn(),
      eliminarDelCarrito: vi.fn(),
      vaciarCarrito: vi.fn(),
      aplicarCuponDescuento: mockAplicarCupon,
      removerCupon: vi.fn()
    });

    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );

    expect(screen.getByText('Catan')).toBeInTheDocument();

    const inputCupon = screen.getByPlaceholderText(/Ej: ESTUDIANTE20 o LEVELUP10/i);
    const btnAplicar = screen.getByRole('button', { name: /Aplicar/i });

    fireEvent.change(inputCupon, { target: { value: 'ESTUDIANTE20' } });
    fireEvent.click(btnAplicar);

    expect(mockAplicarCupon).toHaveBeenCalledWith('ESTUDIANTE20');
  });
});
