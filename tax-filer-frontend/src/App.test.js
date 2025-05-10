import { render, screen } from '@testing-library/react';
import App from './App';

test('renders welcome heading', () => {
  render(<App />);
  const headingElement = screen.getByText(
    /Welcome to the Intelligent Tax Filer/i
  );
  expect(headingElement).toBeInTheDocument();
});
