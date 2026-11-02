import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AdminUsuario from '../pages/AdminUsuario';

describe('Prueba Unitaria: AdminUsuario', () => {

  it('Debe renderizar los encabezados principales de la tabla de usuarios', () => {
    render(<AdminUsuario />);

    expect(screen.getByText(/Gestión de Usuarios/i)).toBeInTheDocument();
    expect(screen.getByText(/Usuario \/ Nombre/i)).toBeInTheDocument();
    expect(screen.getByText(/Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByText(/^Rol$/i)).toBeInTheDocument();
  });

  it('Debe actualizar el valor de la caja de búsqueda al escribir un nombre o correo', () => {
    render(<AdminUsuario />);

    const buscador = screen.getByPlaceholderText(/Buscar por nombre o correo.../i);

    fireEvent.change(buscador, { target: { value: 'cristobal@duocuc.cl' } });

    expect(buscador.value).toBe('cristobal@duocuc.cl');
  });

});
