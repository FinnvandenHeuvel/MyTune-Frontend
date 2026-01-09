import { render, screen } from '@testing-library/react';
import App from './app/App';

test('renders main navigation', () => {
  render(<App />);

  expect(screen.getByRole('button', { name: /all reviews/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /search artists/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
});
