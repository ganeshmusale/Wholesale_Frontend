import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  TrendingUp,
  BarChart3,
  Package,
  Store,
  Settings2,
  LogOut,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
  const { user, logout, isSuperAdmin, isDelivery, isBusinessMan } = useAuth();

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    if (setIsOpen) setIsOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo matching analyserresum theme */}
        <div className="logo-container">
          <div className="logo-icon">
            <ShoppingBag size={20} />
          </div>
          <div className="logo-text">
            Whole Sale
            <span>Wholesale APMC</span>
          </div>
          {setIsOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="navbar-hamburger"
              style={{ marginLeft: 'auto', color: '#fff' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="sidebar-section-label">
          {isDelivery ? 'Delivery Partner Portal' : 'Main Menu'}
        </div>
        <ul className="nav-links">
          {!isDelivery && (
            <>
              <li
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleNavClick('dashboard')}
              >
                <LayoutDashboard className="nav-icon" />
                <span>Dashboard</span>
              </li>

              <li
                className={`nav-item ${activeTab === 'catalog' ? 'active' : ''}`}
                onClick={() => handleNavClick('catalog')}
              >
                <ShoppingBag className="nav-icon" />
                <span>Bulk Vegetable Store</span>
              </li>

              {!isBusinessMan && (
                <li
                  className={`nav-item ${activeTab === 'market-comparison' ? 'active' : ''}`}
                  onClick={() => handleNavClick('market-comparison')}
                >
                  <BarChart3 className="nav-icon" />
                  <span>Market Rate Comparison</span>
                </li>
              )}
            </>
          )}

          {/* Bulk Orders & Delivery - ONLY option for delivery partner, also available for business/admin */}
          <li
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => handleNavClick('orders')}
          >
            <Package className="nav-icon" />
            <span>
              {isDelivery
                ? 'Bulk Orders & Delivery Operations'
                : isBusinessMan
                ? 'My Bulk Orders'
                : 'Bulk Orders & Delivery'}
            </span>
            {isDelivery && (
              <span className="sidebar-badge badge-warning" style={{ color: '#fff', background: '#4f46e5' }}>Portal</span>
            )}
          </li>
        </ul>

        {/* Administration Section (Admin only) */}
        {isSuperAdmin && (
          <>
            <div className="sidebar-section-label" style={{ marginTop: '0.75rem' }}>Admin Control</div>
            <ul className="nav-links">
              <li
                className={`nav-item ${activeTab === 'daily-rates' ? 'active' : ''}`}
                onClick={() => handleNavClick('daily-rates')}
              >
                <TrendingUp className="nav-icon" />
                <span>Store Daily Prices</span>
                <span className="sidebar-badge badge-warning" style={{ color: '#fff', background: '#f59e0b' }}>Daily</span>
              </li>

              <li
                className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => handleNavClick('reports')}
              >
                <BarChart3 className="nav-icon" />
                <span>Reports & Analytics</span>
              </li>

              <li
                className={`nav-item ${activeTab === 'masters' ? 'active' : ''}`}
                onClick={() => handleNavClick('masters')}
              >
                <Settings2 className="nav-icon" />
                <span>Master Data</span>
              </li>
            </ul>
          </>
        )}

        {/* Business Profile Section (Shop Owner only — Registered Businesses is inside Master Data for Admin) */}
        {isBusinessMan && (
          <>
            <div className="sidebar-section-label" style={{ marginTop: '0.75rem' }}>Account & Profile</div>
            <ul className="nav-links">
              <li
                className={`nav-item ${activeTab === 'business' ? 'active' : ''}`}
                onClick={() => handleNavClick('business')}
              >
                <Store className="nav-icon" />
                <span>My Business Profile</span>
              </li>
            </ul>
          </>
        )}

        {/* User Footer matching theme */}
        <div className="sidebar-footer">
          <div className="user-avatar">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-info">
            <h4>{user?.full_name || 'Guest User'}</h4>
            <p>{user?.role?.replace('_', ' ') || 'Visitor'}</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
