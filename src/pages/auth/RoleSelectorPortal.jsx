import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Store, Truck, Shield, ArrowRight, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

export default function RoleSelectorPortal() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Top Navbar matching analyserresum.netlify.app */}
      <header className="home-nav">
        <div className="home-nav-logo">
          <div className="home-nav-logo-icon">
            <ShoppingBag size={20} />
          </div>
          <div className="home-nav-logo-text">
            Whole Sale
            <span>Wholesale APMC Network</span>
          </div>
        </div>

        <div className="home-nav-actions">
          <button
            className="home-nav-signin"
            onClick={() => navigate('/shop-owner/login')}
          >
            🏪 Shop Owner
          </button>
          <button
            className="home-nav-signin"
            onClick={() => navigate('/delivery/login')}
          >
            🚚 Delivery Partner
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/admin')}
          >
            <Shield size={14} /> Admin Sign In
          </button>
        </div>
      </header>

      {/* Hero Section matching analyserresum.netlify.app */}
      <section className="home-hero">
        <div className="home-hero-badge">
          <span className="home-hero-badge-dot" />
          <span>Live APMC Mandi Sourcing & Trading Network</span>
        </div>

        <h1>
          Direct Bulk Vegetable Trading
          <span>From APMC Mandis</span>
        </h1>

        <p>
          Procure commercial vegetable volumes (250kg+ crates, quintals, bags) with daily live rates, 
          transparent APMC auction pricing, and dedicated logistics matching for shops, restaurants & caterers.
        </p>

        <div className="home-hero-cta">
          <button
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
            onClick={() => navigate('/shop-owner/login')}
          >
            <Store size={18} />
            <span>Shop Owner Login (Mobile)</span>
          </button>

          <button
            className="btn-outline-home"
            onClick={() => navigate('/delivery/login')}
          >
            <Truck size={18} />
            <span>Delivery Partner Portal</span>
          </button>

          <button
            className="btn-outline-home"
            onClick={() => navigate('/admin')}
          >
            <Shield size={18} />
            <span>Admin Portal</span>
          </button>
        </div>
      </section>

      {/* Stats Bar matching analyserresum.netlify.app */}
      <section className="home-stats">
        <div className="home-stats-grid">
          <div className="home-stat-item">
            <div className="home-stat-val">Live Rates</div>
            <div className="home-stat-label">Wai, Nashik & Pune Yards Active</div>
          </div>
          <div className="home-stat-item">
            <div className="home-stat-val">250kg+</div>
            <div className="home-stat-label">Bulk Crates & Wholesale Bags</div>
          </div>
          <div className="home-stat-item">
            <div className="home-stat-val">100% Direct</div>
            <div className="home-stat-label">From Mandi Auction to Shop Door</div>
          </div>
        </div>
      </section>

      {/* Role Feature Cards Section matching analyserresum.netlify.app */}
      <section className="home-features">
        <div className="home-section-header">
          <h2>Select Your Dedicated Access Portal</h2>
          <p>Separate secure authentication routes for commercial buyers, delivery partners, and administrators.</p>
        </div>

        <div className="home-features-grid">
          {/* Card 1: Shop Owner */}
          <div className="home-feature-card">
            <div>
              <div
                className="home-feature-icon"
                style={{ background: '#d1fae5', color: '#059669' }}
              >
                <Store size={26} />
              </div>
              <span className="badge badge-success" style={{ marginBottom: '0.75rem' }}>
                Commercial Buyer
              </span>
              <h3>Shop Owner Portal</h3>
              <p>
                Instant access via 10-digit registered mobile number with zero password friction. 
                Browse fresh inventory, compare APMC mandi prices, and submit wholesale orders.
              </p>
            </div>

            <div>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', marginBottom: '0.75rem' }}
                onClick={() => navigate('/shop-owner/login')}
              >
                <span>Login as Shop Owner</span>
                <ArrowRight size={16} />
              </button>
              <div style={{ textAlign: 'center' }}>
                <Link
                  to="/shop-owner/register"
                  style={{ fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 600 }}
                >
                  New Shop? Register Here
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Delivery Partner */}
          <div className="home-feature-card">
            <div>
              <div
                className="home-feature-icon"
                style={{ background: '#fef3c7', color: '#d97706' }}
              >
                <Truck size={26} />
              </div>
              <span className="badge badge-warning" style={{ marginBottom: '0.75rem' }}>
                Logistics & Fleet
              </span>
              <h3>Delivery Partner Portal</h3>
              <p>
                Accept or decline delivery assignments dispatched by APMC admins. 
                Focused operational view for nearby vegetable drop-offs and dispatch verification.
              </p>
            </div>

            <div>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', marginBottom: '0.75rem' }}
                onClick={() => navigate('/delivery/login')}
              >
                <span>Partner Sign In</span>
                <ArrowRight size={16} />
              </button>
              <div style={{ textAlign: 'center' }}>
                <Link
                  to="/delivery/register"
                  style={{ fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 600 }}
                >
                  Join Delivery Fleet? Register
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3: Admin */}
          <div className="home-feature-card">
            <div>
              <div
                className="home-feature-icon"
                style={{ background: '#e0e7ff', color: '#4f46e5' }}
              >
                <Shield size={26} />
              </div>
              <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
                APMC Administrator
              </span>
              <h3>Super Admin Portal</h3>
              <p>
                Full mandi administration, product master control, APMC daily rate broadcasts, 
                and dynamic local delivery partner matching and dispatching.
              </p>
            </div>

            <div>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', marginBottom: '0.75rem' }}
                onClick={() => navigate('/admin')}
              >
                <span>Admin Sign In</span>
                <ArrowRight size={16} />
              </button>
              <div style={{ textAlign: 'center', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Official APMC Personnel Only
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer matching analyserresum.netlify.app */}
      <footer style={{
        borderTop: '1px solid #e9ecef',
        background: '#fafafa',
        padding: '2.5rem',
        textAlign: 'center',
        fontSize: '0.825rem',
        color: '#6b7280'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div className="home-nav-logo-icon" style={{ width: '1.5rem', height: '1.5rem' }}>
            <ShoppingBag size={13} />
          </div>
          <strong style={{ color: '#111827' }}>Whole Sale APMC Network</strong>
        </div>
        <p style={{ margin: 0 }}>
          Direct bulk vegetable trading platform inspired by modern web standards &bull; &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
