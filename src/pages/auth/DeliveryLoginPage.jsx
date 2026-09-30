import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';
import { Truck, Lock, AlertCircle } from 'lucide-react';

export default function DeliveryLoginPage() {
  const navigate = useNavigate();
  const { loginDelivery } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please enter your Email or Phone and Password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await loginDelivery(identifier.trim(), password);
      if (res.success) {
        navigate('/portal/orders');
      } else {
        setError(res.message || 'Invalid delivery partner credentials.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', borderRadius: '1rem', background: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          <Truck size={14} /> LOGISTICS & DELIVERY PORTAL
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Delivery Partner Login
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
          Access assigned orders, accept/reject delivery runs, and manage APMC logistics.
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
          <label>Delivery Partner Email or Phone *</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. delivery@wholesale.com or phone"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Manually enter your registered delivery partner email ID or mobile number.
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
            Manually enter your secure password.
          </span>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ padding: '0.8rem', fontSize: '0.95rem', marginTop: '0.5rem', fontWeight: 700 }}
        >
          <Truck size={16} />
          <span>{loading ? 'Authenticating...' : 'Sign In as Delivery Partner'}</span>
        </button>

        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          New Delivery Partner?{' '}
          <Link
            to="/delivery/register"
            style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}
          >
            Register as Partner
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
