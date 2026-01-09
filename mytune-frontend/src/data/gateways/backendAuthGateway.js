export const createBackendAuthGateway = ({ http }) => ({
  register: (data) => http.post('/register/', data),
  login: (data) => http.post('/token/', data),
});
