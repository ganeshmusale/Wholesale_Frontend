import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';
import { Store, AlertCircle, Building2, User, MapPin } from 'lucide-react';

export default function ShopOwnerRegisterPage() {
  const navigate = useNavigate();
  const { registerShopOwner } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    business_name: '',
    business_type: 'vegetable_shop',
    shop_address: '',
    city: 'Wai'
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

    setLoading(true);
    setError(null);
    try {
      const res = await registerShopOwner({
        ...formData,
        phone: cleanPhone
      });
      if (res.success) {
        navigate('/portal/catalog');
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', borderRadius: '1rem', background: '#d1fae5', color: '#065f46', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          <Store size={14} /> NEW SHOP ONBOARDING
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Register Your Shop
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
          Direct mobile onboarding for vegetable shops, restaurants, messes & caterers.
        </p>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-light)', color: '#991b1b', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1.25rem', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {/* 1. Full Name */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Your Full Name *</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <User size={16} />
            </span>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Suresh Patil"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        {/* 2. Mobile Number with +91 badge */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Mobile Number *</span>
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
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '') })}
              style={{ paddingLeft: '3.25rem', fontWeight: 600, letterSpacing: '0.02em' }}
            />
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Used for instant 1-click login without any password.
          </span>
        </div>

        {/* 3. Business / Shop Name */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Business / Shop Name *</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Store size={16} />
            </span>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Kailash Veg Store"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        {/* 4. Business Type & City (2 Columns, matched 1-line labels) */}
        <div className="form-row-2">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Business Type *</label>
            <select
              className="form-input"
              value={formData.business_type}
              onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
            >
              <option value="vegetable_shop">Vegetable Shop</option>
              <option value="restaurant">Restaurant</option>
              <option value="mess">Mess / Canteen</option>
              <option value="caterers">Caterers</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>City *</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <MapPin size={15} />
              </span>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Wai, Pune"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
          </div>
        </div>

        {/* 5. Shop Address */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Shop / Delivery Address *</label>
          <input
            type="text"
            required
            className="form-input"
            placeholder="e.g. Gala No. 4, Main Mandi Road, Near Market Yard"
            value={formData.shop_address}
            onChange={(e) => setFormData({ ...formData, shop_address: e.target.value })}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ padding: '0.8rem', fontSize: '0.95rem', marginTop: '0.4rem', fontWeight: 700 }}
        >
          <Building2 size={16} />
          <span>{loading ? 'Registering Shop...' : 'Register Commercial Shop Account'}</span>
        </button>

        <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link
            to="/shop-owner/login"
            style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}
          >
            Sign In with Mobile
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
