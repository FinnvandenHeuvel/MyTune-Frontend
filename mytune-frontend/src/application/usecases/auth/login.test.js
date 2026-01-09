import { login } from './login';

jest.mock('../../../data/storage/tokenStorage', () => ({
  tokenStorage: {
    setAccess: jest.fn(),
    setRefresh: jest.fn(),
  },
}));

import { tokenStorage } from '../../../data/storage/tokenStorage';

test('login stores tokens when gateway returns access', async () => {
  const fakeAuthGateway = {
    login: jest.fn().mockResolvedValue({ access: 'A', refresh: 'R' }),
  };

  const run = login({ authGateway: fakeAuthGateway });
  const result = await run({ username: 'u', password: 'p' });

  expect(fakeAuthGateway.login).toHaveBeenCalledWith({ username: 'u', password: 'p' });
  expect(tokenStorage.setAccess).toHaveBeenCalledWith('A');
  expect(tokenStorage.setRefresh).toHaveBeenCalledWith('R');
  expect(result).toEqual({ ok: true });
});
