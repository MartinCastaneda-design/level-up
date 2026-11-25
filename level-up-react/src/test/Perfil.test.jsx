import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn().mockImplementation((url) => {
      if (url === '/ordenes/mis-compras') {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: {} });
    }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }
}));

vi.mock('../data/productsData', () => ({
  getProductById: vi.fn(() => ({ id: 'JM001', nombre: 'Catan', precio: 29990 }))
}));

const mockAuthContext = {
  usuario: null,
  logout: vi.fn(),
  setUsuarioDesdeBackend: vi.fn()
};

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }) => children
}));

describe('Pruebas Unitarias: Componente Perfil', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockAuthContext.usuario = null;
  });

  it('Test 1: Debe expulsar al usuario a /Login si no existe usuario autenticado', () => {
    render(
      <BrowserRouter>
        <Perfil />
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/Login');
  });

  it('Test 2: Carga los datos del usuario y cambia a la pestaña Historial de Compras', async () => {
    mockAuthContext.usuario = { correo: 'test@levelup.cl', nombre: 'Test', apellido: 'User', puntosLevelUp: 500, rol: 'cliente' };

    await act(async () => {
      render(
        <BrowserRouter>
          <Perfil />
        </BrowserRouter>
      );
    });

    expect(screen.getAllByText('Actualizar Datos').length).toBeGreaterThan(0);

    const btnCompras = screen.getByRole('button', { name: /Compras/i });
    await act(async () => {
      fireEvent.click(btnCompras);
    });

    expect(screen.getByText('Historial de Compras')).toBeDefined();
  });
});
