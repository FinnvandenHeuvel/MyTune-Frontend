import React, { useMemo, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from '../../app/providers/AuthProvider';
import { container } from '../../app/di/container';
import { login } from '../../application/usecases/auth/login';

export default function Login({ setPage }) {
  const { setIsAuthenticated } = useContext(AuthContext);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);

  const loginUC = useMemo(() => login({ authGateway: container.authGateway }), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const result = await loginUC(formData);
    if (result.ok) {
      setIsAuthenticated(true);
      setPage('reviews');
    } else {
      setError(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />

      <button type="submit">Login</button>
    </form>
  );
}

Login.propTypes = {
  setPage: PropTypes.func.isRequired,
};
