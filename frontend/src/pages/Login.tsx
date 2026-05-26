import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';

import Logo from '../components/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await authApi.login({ email, password });

      if (data.success) {
        login(data.user, data.user.token);
        
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/client');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
          <Logo size={80} />
        </div>

        {error && (
          <div style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid var(--accent-danger)', 
            color: 'var(--accent-danger)', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Email Address
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)',
                borderRadius: '0.5rem',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color var(--transition-fast)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Password
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)',
                borderRadius: '0.5rem',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color var(--transition-fast)'
              }}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ marginTop: '0.5rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: '600' }}>Sign up here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
