import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Perfil from '../pages/Perfil'; 

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  const stableSearchParams = new URLSearchParams(); 

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [stableSearchParams], 
  };
});

vi.mock('../data/productsData', () => ({
  getProductById: vi.fn(() => ({ id: 'JM001', nombre: 'Catan', precio: 29990 }))
}));

describe('Pruebas Unitarias: Componente Perfil', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('Test 1: Debe expulsar al usuario a /Login si no existe usuario_activo', () => {
    render(
      <BrowserRouter>
        <Perfil />
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/Login');
  });

  it('Test 2: Carga los datos del usuario y cambia a la pestaña Historial de Compras', () => {
    const usuarioFalso = { correo: 'test@levelup.cl', nombre: 'Test', apellido: 'User' };
    localStorage.setItem('usuario_activo', JSON.stringify(usuarioFalso));
    localStorage.setItem('registros', JSON.stringify([
      { correo: 'test@levelup.cl', nombre: 'Test', apellido: 'User', puntosLevelUp: 500 }
    ]));

    render(
      <BrowserRouter>
        <Perfil />
      </BrowserRouter>
    );

    expect(screen.getByText('Actualizar Datos')).toBeDefined();

    const btnCompras = screen.getByRole('button', { name: /Compras/i });
    fireEvent.click(btnCompras);

    expect(screen.getByText('Historial de Compras')).toBeDefined();
    expect(screen.queryByText('Actualizar Datos')).toBeNull();
  });
});