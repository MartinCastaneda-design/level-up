import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminUsuario from '../pages/AdminUsuario';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn().mockImplementation((url) => {
      if (url === '/usuarios') {
        return Promise.resolve({
          data: [
            { id: 1, username: 'admin@levelup.cl', correo: 'admin@levelup.cl', nombre: 'Admin', apellido: 'Gamer', rol: 'ROLE_ADMIN', puntosLevelUp: 100 }
          ]
        });
      }
      return Promise.resolve({ data: [] });
    }),
    patch: vi.fn().mockResolvedValue({ data: {} })
  }
}));

describe('Prueba Unitaria: AdminUsuario', () => {

  it('Debe renderizar los encabezados principales de la tabla de usuarios', async () => {
    await act(async () => {
      render(<AdminUsuario />);
    });

    expect(screen.getByText(/Gestión de Usuarios/i)).toBeInTheDocument();
    expect(screen.getByText(/Usuario \/ Nombre/i)).toBeInTheDocument();
    expect(screen.getByText(/Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByText(/Rol Oficial/i)).toBeInTheDocument();
  });

  it('Debe actualizar el valor de la caja de búsqueda al escribir un nombre o correo', async () => {
    await act(async () => {
      render(<AdminUsuario />);
    });

    const buscador = screen.getByPlaceholderText(/Buscar por nombre o correo.../i);

    fireEvent.change(buscador, { target: { value: 'cristobal@duocuc.cl' } });

    expect(buscador.value).toBe('cristobal@duocuc.cl');
  });

});