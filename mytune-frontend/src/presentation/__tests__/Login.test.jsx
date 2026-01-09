import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../Pages/Login';
import { AuthContext } from '../../app/providers/AuthProvider';

// 🔹 mock the USECASE, not the service
jest.mock('../../application/usecases/auth/login', () => ({
  login: jest.fn(),
}));

import { login } from '../../application/usecases/auth/login';

test('successful login updates auth state and navigates', async () => {
  login.mockReturnValue(async () => ({ ok: true }));

  const setPage = jest.fn();
  const setIsAuthenticated = jest.fn();

  render(
    <AuthContext.Provider value={{ setIsAuthenticated }}>
      <Login setPage={setPage} />
    </AuthContext.Provider>,
  );

  await userEvent.type(screen.getByPlaceholderText(/username/i), 'testuser');
  await userEvent.type(screen.getByPlaceholderText(/password/i), 'password');
  await userEvent.click(screen.getByRole('button', { name: /login/i }));

  expect(login).toHaveBeenCalled();
  expect(setIsAuthenticated).toHaveBeenCalledWith(true);
  expect(setPage).toHaveBeenCalledWith('reviews');
});
