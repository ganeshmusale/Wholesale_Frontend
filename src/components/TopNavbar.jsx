import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Menu, ShoppingCart, Shield, Truck, Building2, LogIn } from 'lucide-react';

export default function TopNavbar({ onMenuClick, onOpenCart, onOpenAuth }) {
  const { user, isSuperAdmin, isDelivery, isBusinessMan } = useAuth();
  const { itemCount, cartTotal } = useCart();

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button className="navbar-hamburger" onClick={onMenuClick} title="Toggle Menu">
          <Menu size={22} />
        </button>

        {!isSuperAdmin && (
          <div className="market-ticker">
            <span className="ticker-dot" />
            <span>APMC Live: Wai & Nashik Wholesale Mandi Rates Active</span>
          </div>
        )}
      </div>

      <div className="navbar-right">
        {/* Cart button (Only for buyers / shop owners / admin, not delivery) */}
        {!isDelivery && (
          <button
            className="btn btn-secondary"
            onClick={onOpenCart}
            style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ShoppingCart size={16} color="var(--primary)" />
            <span style={{ fontWeight: 600 }}>Bulk Cart</span>
            {itemCount > 0 && (
              <span
                style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  borderRadius: '1rem',
                  padding: '0.1rem 0.45rem',
                  marginLeft: '0.2rem'
                }}
              >
                {itemCount} (₹{cartTotal.toFixed(0)})
              </span>
            )}
          </button>
        )}

        {/* User Role Badge */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className={`badge ${isSuperAdmin ? 'badge-primary' : isDelivery ? 'badge-warning' : 'badge-success'}`}>
              {isSuperAdmin && <Shield size={12} />}
              {isDelivery && <Truck size={12} />}
              {isBusinessMan && <Building2 size={12} />}
              {user.role.replace('_', ' ').toUpperCase()}
            </span>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user.full_name}
            </span>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={onOpenAuth}>
            <LogIn size={15} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
