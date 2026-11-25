import '@testing-library/jest-dom';

if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
}

const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('React Router Future Flag Warning')) {
    return;
  }
  originalWarn(...args);
};
