import { render, screen } from '@testing-library/react';
import App from './App';
describe('Componente App', () => {
    test('Renderiza el componente correctamente', () => {
        render(<App />);
        expect(screen.getByRole('heading', { level:1})).toBeInTheDocument();
    });
});