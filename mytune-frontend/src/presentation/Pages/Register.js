import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { container } from '../../app/di/container';
import { register } from '../../application/usecases/auth/register';

export default function Register({ setPage }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });
  const [error, setError] = useState(null);

  const registerUC = useMemo(() => register({ authGateway: container.authGateway }), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const result = await registerUC(formData);
    if (result.ok) {
      alert('Registration successful! Please log in.');
      setPage('login');
    } else {
      setError(result.message + (result.data ? `: ${JSON.stringify(result.data)}` : ''));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input
        type="text"
        placeholder="Username"
        required
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        required
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        required
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        required
        onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
      />

      <button type="submit">Register</button>
    </form>
  );
}

Register.propTypes = {
  setPage: PropTypes.func.isRequired,
};
