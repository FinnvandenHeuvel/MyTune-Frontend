import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../Pages/Login';
import { AuthContext } from '../../app/providers/AuthProvider';

import { login } from '../../application/usecases/auth/login';

jest.mock('../../application/usecases/auth/login', () => ({
  login: jest.fn(),
}));

test('successful login updates auth state and navigates', async () => {
  login.mockReturnValue(async () => ({ ok: true }));

  const setPage = jest.fn();
  const setIsAuthenticated = jest.fn();

  render(
    <AuthContext.Provider value={{ setIsAuthenticated }}>
      <Login setPage={setPage} />
    </AuthContext.Provider>,
  );

  userEvent.type(screen.getByPlaceholderText(/username/i), 'testuser');
  userEvent.type(screen.getByPlaceholderText(/password/i), 'password');
  userEvent.click(screen.getByRole('button', { name: /login/i }));

  // wait for async auth state update
  await waitFor(() => {
    expect(setIsAuthenticated).toHaveBeenCalledWith(true);
  });

  // sync assertions
  expect(login).toHaveBeenCalledTimes(1);
  expect(setPage).toHaveBeenCalledWith('reviews');
});
