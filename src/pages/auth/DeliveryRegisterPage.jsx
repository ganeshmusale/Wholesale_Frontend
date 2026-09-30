import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';
import { Truck, AlertCircle } from 'lucide-react';

export default function DeliveryRegisterPage() {
  const navigate = useNavigate();
  const { registerDelivery } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: '',
    city: 'Wai',
    shop_address: 'Mini Truck / Pickup Van'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!formData.password || formData.password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await registerDelivery({
        ...formData,
        phone: cleanPhone
      });
      if (res.success) {
        navigate('/portal/orders');
      } else {
        setError(res.message || 'Delivery partner registration failed.');
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
          <Truck size={14} /> NEW FLEET PARTNER
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Register Delivery Partner
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
          Join the APMC Mandi delivery fleet to receive assigned runs from administrators.
        </p>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-light)', color: '#991b1b', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1.25rem', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div className="form-group">
          <label>Full Name of Delivery Partner *</label>
          <input
            type="text"
            required
            className="form-input"
            placeholder="e.g. Ramesh Shinde"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label>Mobile Number *</label>
            <input
              type="tel"
              required
              maxLength="10"
              className="form-input"
              placeholder="9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '') })}
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="Create password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Official Email ID (Optional for sign-in & notifications)</label>
          <input
            type="email"
            className="form-input"
            placeholder="e.g. ramesh.delivery@wholesale.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label>Assigned Hub / Base City *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Wai, Nashik, or Pune"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Admin will assign orders near this hub.
            </span>
          </div>

          <div className="form-group">
            <label>Operating Vehicle / Area</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Tempo / Pickup / Mini Truck"
              value={formData.shop_address}
              onChange={(e) => setFormData({ ...formData, shop_address: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ padding: '0.8rem', fontSize: '0.95rem', marginTop: '0.5rem', fontWeight: 700 }}
        >
          <Truck size={16} />
          <span>{loading ? 'Creating Partner Account...' : 'Register Delivery Partner Account'}</span>
        </button>

        <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already registered?{' '}
          <Link
            to="/delivery/login"
            style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}
          >
            Sign In as Partner
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
