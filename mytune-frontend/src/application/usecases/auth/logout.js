import { tokenStorage } from '../../../data/storage/tokenStorage';

export const logout = () => {
  tokenStorage.clear();
};
