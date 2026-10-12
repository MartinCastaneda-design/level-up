// Importamos las herramientas de Testing Library para React:
// - render: monta el componente en un DOM virtual (JSDOM)
// - screen: nos da acceso a lo que "se ve" después del render, para buscar elementos
// - fireEvent: simula eventos reales del usuario (clics, escribir en un input, etc.)
import { render, screen, fireEvent } from '@testing-library/react';
// Funciones de Vitest para declarar y organizar las pruebas
import { describe, it, expect } from 'vitest';
// El componente real que vamos a probar
import AdminProducto from '../pages/AdminProducto';

// 'describe' agrupa un conjunto de pruebas relacionadas bajo un mismo nombre
describe('Prueba Unitaria: AdminProducto', () => {

  // Test 1: Renderizado inicial del panel de inventario
  // Verifica que, al montar el componente, aparezcan el título y el botón principal.
  it('Debe renderizar el título de la página y el botón para agregar producto', () => {
    // Montamos el componente como si un navegador lo hubiera cargado
    render(<AdminProducto />);

    // getByText busca un elemento visible por su texto (con /i = sin importar mayúsculas/minúsculas)
    // Si no lo encuentra, el test falla automáticamente con un error descriptivo
    expect(screen.getByText(/Gestión de Inventario/i)).toBeInTheDocument();
    expect(screen.getByText(/Agregar producto/i)).toBeInTheDocument();
  });

  // Test 2: Interacción con el filtro de búsqueda de catálogo
  // Verifica que el input de búsqueda sea "controlado": que su valor en pantalla
  // refleje exactamente lo que el usuario escribe (confirma que el estado de React
  // y el onChange del input están conectados correctamente).
  it('Debe permitir escribir en el filtro de búsqueda de productos', () => {
    render(<AdminProducto />);

    // IMPORTANTE: el placeholder real del input en AdminProducto.jsx (línea 165)
    // es "Buscar producto...", NO "Buscar por nombre o categoría" como decía
    // el documento original. Por eso buscamos el texto real del código.
    const buscador = screen.getByPlaceholderText(/Buscar producto.../i);

    // Simulamos que el usuario escribe "Consolas" en el input.
    // fireEvent.change dispara el evento 'change' igual que si tecleara.
    fireEvent.change(buscador, { target: { value: 'Consolas' } });

    // Confirmamos que el valor del input (controlado por el estado 'busqueda')
    // quedó efectivamente en "Consolas".
    expect(buscador.value).toBe('Consolas');
  });

});
