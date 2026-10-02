import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import CartModal from './components/CartModal';

// Authenticated Application Views
import Dashboard from './pages/Dashboard';
import BulkOrderCatalog from './pages/BulkOrderCatalog';
import DailyRatesManager from './pages/DailyRatesManager';
import MarketComparison from './pages/MarketComparison';
import OrdersManager from './pages/OrdersManager';
import BusinessRegistration from './pages/BusinessRegistration';
import MastersManager from './pages/MastersManager';
import ReportsManager from './pages/ReportsManager';
import PurchasesManager from './pages/PurchasesManager';

// Role-specific Auth Pages
import RoleSelectorPortal from './pages/auth/RoleSelectorPortal';
import AdminLoginPage from './pages/auth/AdminLoginPage';
import ShopOwnerLoginPage from './pages/auth/ShopOwnerLoginPage';
import ShopOwnerRegisterPage from './pages/auth/ShopOwnerRegisterPage';
import DeliveryLoginPage from './pages/auth/DeliveryLoginPage';
import DeliveryRegisterPage from './pages/auth/DeliveryRegisterPage';

import './styles/theme.css';

// Authenticated Portal Layout Wrapper
function PortalLayout() {
  const { user, isDelivery, loading } = useAuth();
  const navigate = useNavigate();
  const { tab = (user?.role === 'delivery' ? 'orders' : 'dashboard') } = useParams();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    // Delivery partners only have access to orders/delivery operations
    if (user?.role === 'delivery' && tab !== 'orders') {
      navigate('/portal/orders', { replace: true });
    }
  }, [user, tab, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--page-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="stat-icon-bg purple" style={{ width: '3.5rem', height: '3.5rem', margin: '0 auto 1rem' }}>
            ⏳
          </div>
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Connecting to APMC Mandi Server...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to portal gateway
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleTabChange = (newTab) => {
    navigate(`/portal/${newTab}`);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        activeTab={tab}
        setActiveTab={handleTabChange}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <TopNavbar
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAuth={() => {}}
        />

        <main className="page-content">
          {tab === 'dashboard' && <Dashboard setActiveTab={handleTabChange} />}
          {tab === 'catalog' && <BulkOrderCatalog onOpenCart={() => setIsCartOpen(true)} />}
          {tab === 'purchases' && <PurchasesManager />}
          {tab === 'daily-rates' && <DailyRatesManager />}
          {tab === 'market-comparison' && <MarketComparison />}
          {tab === 'orders' && <OrdersManager />}
          {tab === 'reports' && <ReportsManager />}
          {tab === 'business' && (user?.role === 'super_admin' ? <MastersManager initialTab="businesses" /> : <BusinessRegistration />)}
          {tab === 'masters' && <MastersManager />}
        </main>
      </div>

      {/* Cart Drawer Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderPlaced={() => navigate('/portal/orders')}
      />
    </div>
  );
}

// Redirect helpers if user is already authenticated
function PublicRoute({ children, defaultPortalTab = 'dashboard' }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    const target = user.role === 'delivery' ? 'orders' : defaultPortalTab;
    return <Navigate to={`/portal/${target}`} replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing Gateway: Role Selection */}
            <Route path="/" element={
              <PublicRoute>
                <RoleSelectorPortal />
              </PublicRoute>
            } />

            {/* 1. Admin Dedicated Routes */}
            <Route path="/admin" element={
              <PublicRoute defaultPortalTab="dashboard">
                <AdminLoginPage />
              </PublicRoute>
            } />
            <Route path="/admin/login" element={
              <PublicRoute defaultPortalTab="dashboard">
                <AdminLoginPage />
              </PublicRoute>
            } />

            {/* 2. Shop Owner Dedicated Routes */}
            <Route path="/shop-owner" element={<Navigate to="/shop-owner/login" replace />} />
            <Route path="/shop" element={<Navigate to="/shop-owner/login" replace />} />
            <Route path="/business" element={<Navigate to="/shop-owner/login" replace />} />
            <Route path="/shop-owner/login" element={
              <PublicRoute defaultPortalTab="catalog">
                <ShopOwnerLoginPage />
              </PublicRoute>
            } />
            <Route path="/shop/login" element={<Navigate to="/shop-owner/login" replace />} />
            <Route path="/business/login" element={<Navigate to="/shop-owner/login" replace />} />
            <Route path="/shop-owner/register" element={
              <PublicRoute defaultPortalTab="catalog">
                <ShopOwnerRegisterPage />
              </PublicRoute>
            } />
            <Route path="/shop/register" element={<Navigate to="/shop-owner/register" replace />} />
            <Route path="/business/register" element={<Navigate to="/shop-owner/register" replace />} />

            {/* 3. Delivery Partner Dedicated Routes */}
            <Route path="/delivery" element={<Navigate to="/delivery/login" replace />} />
            <Route path="/delivery-partner" element={<Navigate to="/delivery/login" replace />} />
            <Route path="/delivery/login" element={
              <PublicRoute defaultPortalTab="orders">
                <DeliveryLoginPage />
              </PublicRoute>
            } />
            <Route path="/delivery-partner/login" element={<Navigate to="/delivery/login" replace />} />
            <Route path="/delivery/register" element={
              <PublicRoute defaultPortalTab="orders">
                <DeliveryRegisterPage />
              </PublicRoute>
            } />
            <Route path="/delivery-partner/register" element={<Navigate to="/delivery/register" replace />} />

            {/* Authenticated Application Portal */}
            <Route path="/portal/:tab" element={<PortalLayout />} />
            <Route path="/portal" element={<Navigate to="/portal/dashboard" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
