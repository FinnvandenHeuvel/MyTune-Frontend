export const tokenStorage = {
  getAccess: () => localStorage.getItem('access'),
  setAccess: (t) => localStorage.setItem('access', t),
  getRefresh: () => localStorage.getItem('refresh'),
  setRefresh: (t) => localStorage.setItem('refresh', t),
  clear: () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  },
};
