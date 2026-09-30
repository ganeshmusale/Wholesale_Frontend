import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import StatCard from '../components/StatCard';
import {
  ShoppingBag,
  TrendingUp,
  BarChart3,
  Truck,
  IndianRupee,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Dashboard({ setActiveTab }) {
  const { user, isSuperAdmin, isBusinessMan } = useAuth();
  const { addToCart } = useCart();

  const [stats, setStats] = useState(null);
  const [todayRates, setTodayRates] = useState([]);
  const [consolidatedData, setConsolidatedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedNotice, setAddedNotice] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // 1. Fetch live rates
        const ratesRes = await api.get('/rates/today');
        if (ratesRes.data.success) {
          setTodayRates(ratesRes.data.data.slice(0, 6));
        }

        // 2. Fetch consolidated comparison
        const compRes = await api.get('/rates/consolidated');
        if (compRes.data.success) {
          setConsolidatedData(compRes.data.consolidated_matrix.slice(0, 5));
        }

        // 3. Fetch summary stats if admin
        if (isSuperAdmin) {
          const summaryRes = await api.get('/reports/dashboard-summary');
          if (summaryRes.data.success) {
            setStats(summaryRes.data.data.stats);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isSuperAdmin]);

  const handleQuickAdd = (product) => {
    addToCart(product, product.min_bulk_qty);
    setAddedNotice(`Added ${product.min_bulk_qty} ${product.unit_symbol} of ${product.vegetable_name} to cart!`);
    setTimeout(() => setAddedNotice(''), 3000);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Wholesale Vegetable Trading Dashboard</h1>
          <p>
            Welcome back, <strong>{user?.full_name || 'Business Partner'}</strong>! Track APMC market rates, manage bulk procurement, and place wholesale orders.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          {isSuperAdmin && (
            <button className="btn btn-primary" onClick={() => setActiveTab('daily-rates')}>
              <TrendingUp size={15} />
              <span>Update Today's Prices</span>
            </button>
          )}
          {!isBusinessMan && (
            <button className="btn btn-secondary" onClick={() => setActiveTab('market-comparison')}>
              <BarChart3 size={15} />
              <span>Market Comparison</span>
            </button>
          )}
        </div>
      </div>

      {/* Added to cart notice */}
      {addedNotice && (
        <div style={{
          background: 'var(--success-light)',
          color: '#065f46',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius)',
          border: '1px solid #a7f3d0',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} color="var(--success)" />
          <span>{addedNotice}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="dashboard-grid">
        <StatCard
          title="Today's Active Rates"
          value={todayRates.length ? `${todayRates.length} Vegetables` : '8 Items'}
          footer="Fresh bulk availability today"
          icon={ShoppingBag}
          color="purple"
        />
        <StatCard
          title="Monitored APMC Mandis"
          value="4 Markets"
          footer="Wai, Nashik, Pune & Vashi"
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Active Businesses"
          value={stats ? `${stats.businesses_count}` : 'Vegetable Shops & Mess'}
          footer="Shops, Restaurants, Messes, Caterers"
          icon={BarChart3}
          color="green"
        />
        <StatCard
          title="Total Bulk Orders"
          value={stats ? `${stats.orders_count}` : 'Active'}
          footer={stats ? `₹${parseFloat(stats.revenue).toLocaleString('en-IN')} Total` : 'Deliveries in progress'}
          icon={IndianRupee}
          color="orange"
        />
      </div>

      {/* Grid: Live Today Rates + Market Comparison Highlight */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(28rem, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        
        {/* Today's Wholesale Rates Table */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ShoppingBag size={18} color="var(--primary)" />
              <span>Today's Wholesale Selling Rates (Bulk)</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('catalog')}>
              View All & Order
            </button>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Vegetable</th>
                  <th>Category</th>
                  <th>Wholesale Rate</th>
                  <th>Min Order Qty</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {todayRates.length > 0 ? (
                  todayRates.map((prod) => (
                    <tr key={prod.product_id}>
                      <td style={{ fontWeight: 600 }}>{prod.vegetable_name}</td>
                      <td>
                        <span className="pill-tag">{prod.category_name}</span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          ₹{parseFloat(prod.wholesale_price).toFixed(2)}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> /{prod.unit_symbol}</span>
                      </td>
                      <td>
                        <span className="badge badge-primary">
                          {parseFloat(prod.min_bulk_qty)} {prod.unit_symbol}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleQuickAdd(prod)}
                          title="Add bulk quantity to cart"
                        >
                          <Plus size={13} />
                          <span>Add Bulk</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                      Loading today's wholesale rates...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cross-Market Comparison Highlight (Wai vs Nashik vs Pune) - Only for Super Admin & Delivery */}
        {!isBusinessMan && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <BarChart3 size={18} color="var(--primary)" />
                <span>APMC Cross-Market Comparison (from Notebook)</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('market-comparison')}>
                Full Matrix
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Comparing mandi rates across <strong>Wai</strong>, <strong>Nashik</strong>, and <strong>Pune</strong> to procure at lowest cost:
            </p>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Vegetable</th>
                    <th>Wai APMC</th>
                    <th>Nashik APMC</th>
                    <th>Lowest Sourced</th>
                    <th>Best APMC Market</th>
                  </tr>
                </thead>
                <tbody>
                  {consolidatedData.length > 0 ? (
                    consolidatedData.map((item) => (
                      <tr key={item.product_id}>
                        <td style={{ fontWeight: 600 }}>{item.vegetable}</td>
                        <td>
                          {item.rates_by_market[1] ? `₹${item.rates_by_market[1].toFixed(2)}` : '—'}
                        </td>
                        <td>
                          {item.rates_by_market[2] ? `₹${item.rates_by_market[2].toFixed(2)}` : '—'}
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                          ₹{parseFloat(item.lowest_rate || 0).toFixed(2)}
                        </td>
                        <td>
                          <span className="badge pill-best">
                            {item.best_market_to_buy?.replace(' APMC Market', '') || 'Wai'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                        Loading consolidated comparison...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Real-world Wholesale Procurement Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e2346, #2d3778)',
        color: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
            Bulk Vegetable Supply for Commercial Buyers
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'rgba(255, 255, 255, 0.75)' }}>
            Are you running a <strong>Vegetable Shop</strong>, <strong>Restaurant</strong>, <strong>Mess</strong>, or <strong>Catering</strong> service? Place direct 250kg+ bulk orders with flexible Credit / Khata (Udhar) settlements.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={() => setActiveTab('catalog')}>
            <ShoppingBag size={15} />
            <span>Order Wholesale Vegetables</span>
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveTab('business')}>
            <span>Register Business</span>
          </button>
        </div>
      </div>
    </div>
  );
}
