import { tokenStorage } from '../../../data/storage/tokenStorage';

export const login =
  ({ authGateway }) =>
  async ({ username, password }) => {
    const data = await authGateway.login({ username, password });

    if (data?.access) {
      tokenStorage.setAccess(data.access);
      tokenStorage.setRefresh(data.refresh);
      return { ok: true };
    }
    return { ok: false, message: 'Invalid username or password' };
  };
