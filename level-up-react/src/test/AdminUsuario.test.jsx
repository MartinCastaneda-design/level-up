import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AdminUsuario from '../pages/AdminUsuario';

describe('Prueba Unitaria: AdminUsuario', () => {

  // Test 1: Renderizado inicial de la tabla y encabezados
  // Verifica que el título de la página y las columnas principales de la tabla
  // existan en el DOM apenas se monta el componente.
  it('Debe renderizar los encabezados principales de la tabla de usuarios', () => {
    render(<AdminUsuario />);

    expect(screen.getByText(/Gestión de Usuarios/i)).toBeInTheDocument();
    expect(screen.getByText(/Usuario \/ Nombre/i)).toBeInTheDocument();
    expect(screen.getByText(/Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByText(/^Rol$/i)).toBeInTheDocument();
  });

  // Test 2: Interacción con el buscador de usuarios
  // Verifica que el input de búsqueda es "controlado" por React: lo que el
  // usuario escribe queda reflejado en el estado (y por lo tanto en el value
  // del input), gracias al onChange={(e) => setBusqueda(e.target.value)}.
  it('Debe actualizar el valor de la caja de búsqueda al escribir un nombre o correo', () => {
    render(<AdminUsuario />);

    // IMPORTANTE: el placeholder real en AdminUsuario.jsx (línea 83) es
    // "Buscar por nombre o correo...", NO "Buscar por nombre o email" como
    // decía el documento original (ese texto no existe en tu código).
    const buscador = screen.getByPlaceholderText(/Buscar por nombre o correo.../i);

    // Simulamos que el usuario escribe un correo en el buscador
    fireEvent.change(buscador, { target: { value: 'cristobal@duocuc.cl' } });

    // Confirmamos que el valor quedó guardado correctamente en el input
    expect(buscador.value).toBe('cristobal@duocuc.cl');
  });

});
