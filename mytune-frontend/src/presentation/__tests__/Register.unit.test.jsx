import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../Pages/Register';

import { register } from '../../application/usecases/auth/register';

jest.mock('../../application/usecases/auth/register', () => ({
  register: jest.fn(),
}));

function fillForm() {
  fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testuser' } });
  fireEvent.change(screen.getByPlaceholderText(/email/i), {
    target: { value: 'test@example.com' },
  });
  fireEvent.change(screen.getByPlaceholderText(/^password$/i), { target: { value: 'secret' } });
  fireEvent.change(screen.getByPlaceholderText(/confirm password/i), {
    target: { value: 'secret' },
  });
}

test('success: calls register, alerts, and navigates to login', async () => {
  const registerFn = jest.fn().mockResolvedValue({ ok: true });
  register.mockReturnValue(registerFn);

  globalThis.alert = jest.fn();
  const setPage = jest.fn();

  render(<Register setPage={setPage} />);

  fillForm();
  fireEvent.click(screen.getByRole('button', { name: /register/i }));

  await waitFor(() => {
    expect(registerFn).toHaveBeenCalledTimes(1);
  });

  expect(globalThis.alert).toHaveBeenCalledWith('Registration successful! Please log in.');
  expect(setPage).toHaveBeenCalledWith('login');
});

test('error: shows message when register fails (no data)', async () => {
  const registerFn = jest.fn().mockResolvedValue({ ok: false, message: 'Invalid' });
  register.mockReturnValue(registerFn);

  const setPage = jest.fn();
  render(<Register setPage={setPage} />);

  fillForm();
  fireEvent.click(screen.getByRole('button', { name: /register/i }));

  expect(await screen.findByText('Invalid')).toBeInTheDocument();
  expect(setPage).not.toHaveBeenCalled();
});

test('error: appends JSON data when register fails with data', async () => {
  const registerFn = jest.fn().mockResolvedValue({
    ok: false,
    message: 'Invalid',
    data: { email: ['already exists'] },
  });
  register.mockReturnValue(registerFn);

  render(<Register setPage={jest.fn()} />);

  fillForm();
  fireEvent.click(screen.getByRole('button', { name: /register/i }));

  expect(await screen.findByText(/Invalid: \{"email":\["already exists"]}/)).toBeInTheDocument();
});
