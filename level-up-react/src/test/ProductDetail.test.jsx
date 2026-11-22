import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProductDetail } from '../pages/ProductDetail';
import * as CartContextModule from '../context/CartContext';
import * as AuthContextModule from '../context/AuthContext';

const mockProducto = {
  id: 'JM001',
  nombre: 'Catan El Juego',
  categoria: 'Juegos de Mesa',
  categoriaSlug: 'juegos-de-mesa',
  precio: 29990,
  imagen: '/img/productos/catan.jpg',
  destacado: true,
  enOferta: false,
  stock: 15,
  descripcionCorta: 'Juego de mesa clásico de estrategia y comercio.',
  descripcionLarga: 'Los colonos de Catan es un juego de mesa para toda la familia.',
  rating: 4.8,
  numReviews: 24
};

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn().mockImplementation((url) => {
      if (url.includes('/productos/JM001')) {
        return Promise.resolve({ data: mockProducto });
      }
      return Promise.reject(new Error('Not found'));
    })
  }
}));

describe('Prueba Página: ProductDetail.jsx', () => {
  it('Debe renderizar la información, precio y especificaciones de un producto existente', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ usuario: null });
    vi.spyOn(CartContextModule, 'useCart').mockReturnValue({ agregarAlCarrito: vi.fn() });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/producto/JM001']}>
          <Routes>
            <Route path="/producto/:id" element={<ProductDetail />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(screen.getByRole('heading', { level: 1, name: /Catan/i })).toBeInTheDocument();
    expect(screen.getByText(/Ficha Técnica & Especificaciones/i)).toBeInTheDocument();
    expect(document.getElementById('btnAgregar')).toBeInTheDocument();
  });

  it('Debe permitir incrementar la cantidad y llamar a agregarAlCarrito al presionar el botón', async () => {
    const mockAgregarAlCarrito = vi.fn();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({ usuario: null });
    vi.spyOn(CartContextModule, 'useCart').mockReturnValue({ agregarAlCarrito: mockAgregarAlCarrito });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/producto/JM001']}>
          <Routes>
            <Route path="/producto/:id" element={<ProductDetail />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const btnSumar = screen.getByRole('button', { name: '+' });
    await act(async () => {
      fireEvent.click(btnSumar);
    });

    const inputCantidad = screen.getByDisplayValue('2');
    expect(inputCantidad).toBeInTheDocument();

    const btnAgregar = document.getElementById('btnAgregar');
    await act(async () => {
      fireEvent.click(btnAgregar);
    });

    expect(mockAgregarAlCarrito).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'JM001' }),
      2
    );
  });
});
