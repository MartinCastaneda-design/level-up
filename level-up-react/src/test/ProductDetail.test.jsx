import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProductDetail } from '../pages/ProductDetail';
import * as CartContextModule from '../context/CartContext';
import * as AuthContextModule from '../context/AuthContext';

describe('Prueba Página: ProductDetail.jsx', () => {
  it('Debe renderizar la información, precio y especificaciones de un producto existente', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ usuario: null });
    vi.spyOn(CartContextModule, 'useCart').mockReturnValue({ agregarAlCarrito: vi.fn() });

    render(
      <MemoryRouter initialEntries={['/producto/JM001']}>
        <Routes>
          <Route path="/producto/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /Catan/i })).toBeInTheDocument();
    expect(screen.getByText(/Ficha Técnica & Especificaciones/i)).toBeInTheDocument();
    expect(document.getElementById('btnAgregar')).toBeInTheDocument();
  });

  it('Debe permitir incrementar la cantidad y llamar a agregarAlCarrito al presionar el botón', () => {
    const mockAgregarAlCarrito = vi.fn();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ usuario: null });
    vi.spyOn(CartContextModule, 'useCart').mockReturnValue({ agregarAlCarrito: mockAgregarAlCarrito });

    render(
      <MemoryRouter initialEntries={['/producto/JM001']}>
        <Routes>
          <Route path="/producto/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>
    );

    const btnSumar = screen.getByRole('button', { name: '+' });
    fireEvent.click(btnSumar);

    const inputCantidad = screen.getByDisplayValue('2');
    expect(inputCantidad).toBeInTheDocument();

    const btnAgregar = document.getElementById('btnAgregar');
    fireEvent.click(btnAgregar);

    expect(mockAgregarAlCarrito).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'JM001' }),
      2
    );
  });
});
