import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';
import { Lock, Mail, AlertCircle, Shield } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please enter both Admin Email/Phone and Password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await loginAdmin(identifier.trim(), password);
      if (res.success) {
        navigate('/portal/dashboard');
      } else {
        setError(res.message || 'Invalid administrator credentials.');
      }
    } catch (err) {
      setError('Connection error. Please ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', borderRadius: '1rem', background: '#e0e7ff', color: '#4338ca', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          <Shield size={14} /> APMC ADMINISTRATOR PORTAL
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Admin Sign In
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
          Enter your official administrator email ID and password to manage mandi operations.
        </p>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-light)', color: '#991b1b', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1.25rem', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label>Admin Email ID *</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Mail size={16} />
            </span>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. admin@wholesale.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Manually type your official registered admin email address.
          </span>
        </div>

        <div className="form-group">
          <label>Account Password *</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Lock size={16} />
            </span>
            <input
              type="password"
              required
              className="form-input"
              placeholder="Enter account password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Manually type your secure administrator password.
          </span>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ padding: '0.8rem', fontSize: '0.95rem', marginTop: '0.5rem', fontWeight: 700 }}
        >
          <Lock size={16} />
          <span>{loading ? 'Authenticating Admin...' : 'Sign In as Admin'}</span>
        </button>
      </form>
    </AuthLayout>
  );
}
