import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register'; 

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('Pruebas Unitarias: Componente Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('Test 1: Permite ingresar texto en los campos Nombre y Apellido', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const inputNombre = screen.getByLabelText(/Nombre/i);
    const inputApellido = screen.getByLabelText(/Apellido/i);

    // Simulam escritura
    fireEvent.change(inputNombre, { target: { value: 'Juan', id: 'txtNombre' } });
    fireEvent.change(inputApellido, { target: { value: 'Pérez', id: 'txtApellido' } });

    expect(inputNombre.value).toBe('Juan');
    expect(inputApellido.value).toBe('Pérez');
  });

  it('Test 2: Valida que el usuario sea mayor de 18 años', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    // Simula una fecha de nacimiento del año actual (menor de edad)
    const inputFecha = screen.getByLabelText(/Fecha de nacimiento/i);
    const añoActual = new Date().getFullYear();
    fireEvent.change(inputFecha, { target: { value: `${añoActual}-01-01`, id: 'dateFechaNacimiento' } });

    const btnSubmit = screen.getByRole('button', { name: /Hecho/i });
    fireEvent.click(btnSubmit);

    // Verifica que la validación detecte la diferencia de edad y lance el error exacto
    const mensajeError = screen.getByText(/Debes ser mayor de 18/i);
    expect(mensajeError).toBeDefined();
  });
});