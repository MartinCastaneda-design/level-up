import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AdminProducto from '../pages/AdminProducto';

describe('Prueba Unitaria: AdminProducto', () => {

  it('Debe renderizar el título de la página y el botón para agregar producto', () => {
    render(<AdminProducto />);

    expect(screen.getByText(/Gestión de Inventario/i)).toBeInTheDocument();
    expect(screen.getByText(/Agregar producto/i)).toBeInTheDocument();
  });

  it('Debe permitir escribir en el filtro de búsqueda de productos', () => {
    render(<AdminProducto />);

    const buscador = screen.getByPlaceholderText(/Buscar producto.../i);

    fireEvent.change(buscador, { target: { value: 'Consolas' } });

    expect(buscador.value).toBe('Consolas');
  });

});
