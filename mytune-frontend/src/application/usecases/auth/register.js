export const register =
  ({ authGateway }) =>
  async (payload) => {
    const data = await authGateway.register(payload);
    // your backend returns {message: "..."} on success
    if (data?.message) return { ok: true, message: data.message };
    return { ok: false, message: 'Registration failed', data };
  };
