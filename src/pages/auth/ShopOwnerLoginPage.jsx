import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';
import { Phone, AlertCircle, Store } from 'lucide-react';

export default function ShopOwnerLoginPage() {
  const navigate = useNavigate();
  const { loginShopOwner } = useAuth();

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clean = phone.replace(/[^0-9]/g, '').slice(-10);
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await loginShopOwner(clean);
      if (res.success) {
        navigate('/portal/catalog');
      } else {
        setError(res.message || 'No registered shop account found with this number.');
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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', borderRadius: '1rem', background: '#d1fae5', color: '#065f46', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          <Store size={14} /> COMMERCIAL BUYER PORTAL
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Shop Owner Login
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
          Direct mobile access for vegetable shops, restaurants, messes & caterers.
        </p>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-light)', color: '#991b1b', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1.25rem', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* ONLY Mobile Number Field for Shop Owners */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Shop Owner Mobile Number *</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>⚡ No Password Needed</span>
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{
              position: 'absolute',
              left: '0.85rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              fontSize: '0.9rem'
            }}>
              +91
            </span>
            <input
              type="tel"
              required
              maxLength="10"
              className="form-input"
              placeholder="Enter 10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              style={{ paddingLeft: '3.25rem', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.05em' }}
            />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Manually type your registered 10-digit mobile number (e.g. 9876543210).
          </span>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ padding: '0.8rem', fontSize: '0.95rem', marginTop: '0.5rem', fontWeight: 700 }}
        >
          <Phone size={16} />
          <span>{loading ? 'Verifying Shop Account...' : 'Login as Shop Owner'}</span>
        </button>

        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          New Vegetable Shop or Commercial Buyer?{' '}
          <Link
            to="/shop-owner/register"
            style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}
          >
            Register Your Shop
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
