import '@testing-library/jest-dom';

// Mock de window.scrollTo no implementado en JSDOM
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
}
