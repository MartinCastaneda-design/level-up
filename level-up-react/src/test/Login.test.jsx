import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login'; 

// 1. Mock de React Router (Navegación y Parámetros)
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams()],
  };
});

// 2. Mock del AuthContext
const mockLogin = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin })
}));

describe('Pruebas Unitarias: Componente Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Test 1: Debe renderizar los campos de Email y Contraseña correctamente', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Busca los inputs mediante su etiqueta (label)
    const inputEmail = screen.getByLabelText(/Email/i);
    const inputPassword = screen.getByLabelText(/Contraseña/i);
    const btnSubmit = screen.getByRole('button', { name: /Iniciar sesión/i });
    
    expect(inputEmail).toBeDefined();
    expect(inputPassword).toBeDefined();
    expect(btnSubmit).toBeDefined();
  });

  it('Test 2: Debe mostrar mensajes de error si se envía el formulario vacío', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const btnSubmit = screen.getByRole('button', { name: /Iniciar sesión/i });
    
    // Simular el envío del formulario sin escribir nada
    fireEvent.click(btnSubmit);
    
    // Verificar que aparezcan los textos de validación exactos
    expect(screen.getByText('Por favor ingresa tu correo electrónico.')).toBeDefined();
    expect(screen.getByText('Por favor ingresa tu contraseña.')).toBeDefined();
    
    // La función login del contexto NO debe llamarse porque hay errores
    expect(mockLogin).not.toHaveBeenCalled();
  });
});