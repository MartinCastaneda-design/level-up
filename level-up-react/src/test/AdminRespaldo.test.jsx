import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminRespaldo from '../pages/AdminRespaldo';

describe('Prueba Unitaria: AdminRespaldo', () => {

  it('Debe renderizar el título de la página y los botones de exportar e importar', () => {
    render(<AdminRespaldo />);

    expect(screen.getByText(/Copias de Seguridad/i)).toBeInTheDocument();
    expect(screen.getByText(/Exportar respaldo/i)).toBeInTheDocument();
    expect(screen.getByText(/Importar respaldo/i)).toBeInTheDocument();
  });

  it('Debe ejecutar la alerta de éxito al hacer clic en Exportar Respaldo', () => {
    render(<AdminRespaldo />);

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const btnExportar = screen.getByText(/Exportar respaldo/i);

    fireEvent.click(btnExportar);

    expect(alertMock).toHaveBeenCalledWith('¡Copia de seguridad descargada con éxito!');

    alertMock.mockRestore();
  });

});
