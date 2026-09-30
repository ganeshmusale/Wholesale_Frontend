import React from 'react';
import { ShoppingBag, CheckCircle2 } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="auth-split-container">
      {/* Left Panel matching Whole Sale theme */}
      <div className="auth-left-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div className="logo-icon" style={{ width: '2.8rem', height: '2.8rem' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>Whole Sale</h2>
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

        {/* Connected Mandis Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem', display: 'flex', gap: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
            <span style={{ display: 'block', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Active Hubs:</span>
            Wai APMC • Nashik Mandi • Pune Yard
          </div>
        </div>
      </div>

      {/* Right Panel: Content Form */}
      <div className="auth-right-panel">
        <div style={{ maxWidth: '28rem', width: '100%', margin: '0 auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
