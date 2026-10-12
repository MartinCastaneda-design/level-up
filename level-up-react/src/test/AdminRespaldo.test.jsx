import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminRespaldo from '../pages/AdminRespaldo';

describe('Prueba Unitaria: AdminRespaldo', () => {

  // Test 1: Renderizado inicial de elementos en pantalla
  // Verifica que el título y los dos botones principales existan al montar el componente.
  it('Debe renderizar el título de la página y los botones de exportar e importar', () => {
    render(<AdminRespaldo />);

    // IMPORTANTE: el título real en AdminRespaldo.jsx (línea 64) es
    // "Copias de Seguridad", NO "Respaldos del Sistema" como decía el
    // documento original (ese texto no existe en tu código).
    expect(screen.getByText(/Copias de Seguridad/i)).toBeInTheDocument();
    expect(screen.getByText(/Exportar respaldo/i)).toBeInTheDocument();
    expect(screen.getByText(/Importar respaldo/i)).toBeInTheDocument();
  });

  // Test 2: Evento de interacción al hacer clic en "Exportar respaldo"
  // Verifica que, al hacer clic, se dispare el alert de éxito que define
  // handleExportar() en el componente real.
  it('Debe ejecutar la alerta de éxito al hacer clic en Exportar Respaldo', () => {
    render(<AdminRespaldo />);

    // vi.spyOn "espía" window.alert: deja que lo detectemos sin que realmente
    // abra una ventana de alerta (que bloquearía el test).
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const btnExportar = screen.getByText(/Exportar respaldo/i);

    // Simulamos el clic del usuario en el botón
    fireEvent.click(btnExportar);

    // Confirmamos que se llamó a window.alert con el mensaje EXACTO que usa
    // handleExportar() en AdminRespaldo.jsx (línea 25).
    expect(alertMock).toHaveBeenCalledWith('¡Copia de seguridad descargada con éxito!');

    // Restauramos window.alert a su comportamiento original para no afectar otros tests
    alertMock.mockRestore();
  });

});
