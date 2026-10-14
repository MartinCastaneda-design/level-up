import '@testing-library/jest-dom';

// Mock de window.scrollTo no implementado en JSDOM
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
}

// Silenciar avisos informativos sobre flags futuras de React Router v7
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('React Router Future Flag Warning')) {
    return;
  }
  originalWarn(...args);
};
