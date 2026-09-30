import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Shield,
  Truck,
  Building2,
  Lock,
  Phone,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AuthPage({ onSuccess, onClose }) {
  const { login, loginWithMobile, loginByRole, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loginMode, setLoginMode] = useState('business_man'); // 'business_man' | 'super_admin' | 'delivery'
  const [mobileNumber, setMobileNumber] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration fields
  const [regData, setRegData] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: '',
    role: 'business_man',
    business_name: '',
    business_type: 'vegetable_shop',
    shop_address: '',
    city: 'Wai'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login(identifier, password);
    setLoading(false);
    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setError(res.message || 'Login failed. Please check credentials.');
    }
  };

  const handleDirectMobileLogin = async (e) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setError(null);
    const res = await loginWithMobile(mobileNumber.trim());
    setLoading(false);
    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setError(res.message || 'No shop account found with this mobile number.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await register(regData);
    setLoading(false);
    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setError(res.message || 'Registration failed.');
    }
  };

  return (
    <div className="auth-split-container">
      {/* Left Panel matching analyserresum theme */}
      <div className="auth-left-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div className="logo-icon" style={{ width: '2.8rem', height: '2.8rem' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Whole Sale</h2>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Wholesale Bulk Vegetable Trading
            </span>
          </div>
        </div>

        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '1rem', color: '#fff' }}>
          Direct Bulk Vegetable Sourcing from APMC Mandis
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          Procure bulk quantities (250kg+ bags, crates, quintals) directly from Wai, Nashik, and Pune yards at live wholesale prices.
        </p>

        {/* Feature List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} color="#818cf8" />
            </div>
            <span style={{ fontSize: '0.85rem', color: '#e0e7ff' }}>Daily Live Rates set according to APMC markets</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} color="#818cf8" />
            </div>
            <span style={{ fontSize: '0.85rem', color: '#e0e7ff' }}>Cross-market comparison (Wai vs Nashik lowest price guarantee)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} color="#818cf8" />
            </div>
            <span style={{ fontSize: '0.85rem', color: '#e0e7ff' }}>Tailored for Vegetable Shops, Restaurants, Messes & Caterers</span>
          </div>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="auth-right-panel">
        <div style={{ maxWidth: '28rem', width: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {isRegister ? 'Register Commercial Buyer' : 'Sign In to Platform'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginTop: '0.2rem' }}>
                {isRegister
                  ? 'Create an account for your vegetable shop, restaurant, or mess'
                  : 'Enter your phone number or email to continue'}
              </p>
            </div>
            {onClose && (
              <button onClick={onClose} className="btn btn-secondary btn-sm">Close</button>
            )}
          </div>

          {error && (
            <div style={{ background: 'var(--danger-light)', color: '#991b1b', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1.25rem', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {!isRegister ? (
            <div>
              {/* Role Selection Dropdown */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>
                  Select Login Role:
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    className="form-input"
                    value={loginMode}
                    onChange={(e) => {
                      setLoginMode(e.target.value);
                      setError(null);
                      setIdentifier('');
                      setPassword('');
                      setMobileNumber('');
                    }}
                    style={{
                      fontSize: '0.925rem',
                      fontWeight: 600,
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius)',
                      borderColor: 'var(--primary)',
                      background: '#f8fafc',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="business_man">🏪 Shop Owner / Commercial Buyer (Mobile Only)</option>
                    <option value="super_admin">👑 Super Administrator (Email & Password)</option>
                    <option value="delivery">🚚 Delivery Partner (Email & Password)</option>
                  </select>
                </div>
              </div>

              {loginMode === 'business_man' ? (
                /* ONLY Mobile Number Field for Shop Owners */
                <form onSubmit={handleDirectMobileLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, ''))}
                        style={{ paddingLeft: '3.25rem', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.05em' }}
                      />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Manually type your registered 10-digit mobile number (e.g. 9876543210).
                    </span>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                    <Phone size={16} />
                    <span>{loading ? 'Verifying Shop...' : 'Login as Shop Owner'}</span>
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    New Vegetable Shop or Commercial Buyer?{' '}
                    <button
                      type="button"
                      onClick={() => setIsRegister(true)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Register 
                    </button>
                  </div>
                </form>
              ) : (
                /* ONLY Email ID and Password for Super Admin and Delivery Partner */
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label>
                      {loginMode === 'super_admin' ? 'Admin Email ID *' : 'Delivery Partner Email ID *'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        required
                        className="form-input"
                        placeholder={loginMode === 'super_admin' ? 'e.g. admin@wholesale.com' : 'e.g. delivery@wholesale.com'}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                      />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Manually type your official registered email address.
                    </span>
                  </div>

                  <div className="form-group">
                    <label>Account Password *</label>
                    <input
                      type="password"
                      required
                      className="form-input"
                      placeholder="Enter account password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Manually type your secure account password.
                    </span>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    <Lock size={15} />
                    <span>{loading ? 'Authenticating...' : `Sign In as ${loginMode === 'super_admin' ? 'Admin' : 'Delivery Partner'}`}</span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Register Form with Role Selection */
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div className="form-group">
                <label style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Select Registration Role *</label>
                <select
                  className="form-input"
                  value={regData.role}
                  onChange={(e) => setRegData({ ...regData, role: e.target.value })}
                  style={{ fontWeight: 600, borderColor: 'var(--primary)', background: '#f8fafc' }}
                >
                  <option value="business_man">🏪 Shop Owner / Commercial Buyer (Vegetable Shop, Restaurant, Mess)</option>
                  <option value="delivery">🚚 Delivery Partner (Logistics & Transport)</option>
                </select>
              </div>

              <div className="form-group">
                <label>{regData.role === 'delivery' ? 'Full Name of Delivery Partner *' : 'Your Full Name *'}</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder={regData.role === 'delivery' ? 'e.g. Ramesh Shinde' : 'e.g. Suresh Patil'}
                  value={regData.full_name}
                  onChange={(e) => setRegData({ ...regData, full_name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    maxLength="10"
                    className="form-input"
                    placeholder="9876543210"
                    value={regData.phone}
                    onChange={(e) => setRegData({ ...regData, phone: e.target.value.replace(/[^0-9]/g, '') })}
                  />
                </div>

                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    required
                    className="form-input"
                    placeholder="Create password"
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  />
                </div>
              </div>

              {regData.role === 'delivery' ? (
                /* Delivery Partner Specific Fields */
                <>
                  <div className="form-group">
                    <label>Official Email ID (Optional for sign-in notifications)</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. ramesh.delivery@wholesale.com"
                      value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label>Assigned Delivery Hub / Base City *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="e.g. Wai, Nashik, or Pune"
                        value={regData.city}
                        onChange={(e) => setRegData({ ...regData, city: e.target.value })}
                      />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Admin will match you to nearby orders based on this city.
                      </span>
                    </div>

                    <div className="form-group">
                      <label>Operating Vehicle / Area</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Mini Truck / Pickup Van"
                        value={regData.shop_address}
                        onChange={(e) => setRegData({ ...regData, shop_address: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Shop Owner / Commercial Buyer Fields */
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label>Business / Shop Name *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="Kailash Veg Store"
                        value={regData.business_name}
                        onChange={(e) => setRegData({ ...regData, business_name: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Business Type *</label>
                      <select
                        className="form-input"
                        value={regData.business_type}
                        onChange={(e) => setRegData({ ...regData, business_type: e.target.value })}
                      >
                        <option value="vegetable_shop">Vegetable Shop</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="mess">Mess / Canteen</option>
                        <option value="caterers">Caterers</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label>Shop Address *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="Main Mandi Road"
                        value={regData.shop_address}
                        onChange={(e) => setRegData({ ...regData, shop_address: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="Wai"
                        value={regData.city}
                        onChange={(e) => setRegData({ ...regData, city: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                {loading ? 'Creating Account...' : regData.role === 'delivery' ? 'Register Delivery Partner Account' : 'Register Commercial Shop Account'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
