import { logout } from './logout';

jest.mock('../../../data/storage/tokenStorage', () => ({
  tokenStorage: { clear: jest.fn() },
}));

import { tokenStorage } from '../../../data/storage/tokenStorage';

test('logout clears tokens', () => {
  logout();
  expect(tokenStorage.clear).toHaveBeenCalledTimes(1);
});
