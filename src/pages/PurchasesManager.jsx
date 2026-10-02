import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Plus,
  Calendar,
  Filter,
  Trash2,
  Edit2,
  TrendingDown,
  TrendingUp,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Search,
  RefreshCw,
  X,
  DollarSign,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function PurchasesManager() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [viewMode, setViewMode] = useState('summary'); // 'summary' (product-wise grouped) or 'list' (individual lots)
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Data states
  const [purchases, setPurchases] = useState([]);
  const [summaryData, setSummaryData] = useState({
    overall: { total_lots: 0, unique_products: 0, total_quantity: 0, total_amount: 0, overall_avg_rate: 0 },
    products: []
  });
  const [productsMaster, setProductsMaster] = useState([]);
  const [marketsMaster, setMarketsMaster] = useState([]);
  const [unitsMaster, setUnitsMaster] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Multi-item form state for Add Purchase Modal
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formItems, setFormItems] = useState([
    {
      product_id: '',
      market_id: '',
      custom_market: '',
      supplier_name: '',
      unit_id: 1,
      quantity: '',
      unit_price: '',
      total_price: 0,
      payment_status: 'paid',
      notes: ''
    }
  ]);

  // Fetch Master Data (products, markets, units)
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const res = await api.get('/masters/all');
        if (res.data.success) {
          setProductsMaster(res.data.data.products || []);
          setMarketsMaster(res.data.data.markets || []);
          setUnitsMaster(res.data.data.units || []);
        }
      } catch (err) {
        console.error('Failed to load masters:', err);
      }
    };
    fetchMasters();
  }, []);

  // Fetch Purchases & Summary for Selected Date
  const fetchProcurementData = async (date) => {
    try {
      setLoading(true);
      setMessage(null);

      const [purchasesRes, summaryRes] = await Promise.all([
        api.get(`/purchases${date ? `?date=${date}` : ''}`),
        api.get(`/purchases/summary${date ? `?date=${date}` : ''}`)
      ]);

      if (purchasesRes.data.success) {
        setPurchases(purchasesRes.data.data || []);
      }
      if (summaryRes.data.success) {
        setSummaryData({
          overall: summaryRes.data.overall || { total_lots: 0, unique_products: 0, total_quantity: 0, total_amount: 0, overall_avg_rate: 0 },
          products: summaryRes.data.products || []
        });
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: 'Failed to load purchase records: ' + (err.response?.data?.message || err.message)
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcurementData(selectedDate);
  }, [selectedDate]);

  // Quick Date Selectors
  const setQuickDate = (daysAgo) => {
    if (daysAgo === 'all') {
      setSelectedDate('');
      return;
    }
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  // Add Item Row in Modal Form
  const handleAddFormRow = () => {
    setFormItems(prev => [
      ...prev,
      {
        product_id: prev[prev.length - 1]?.product_id || '',
        market_id: '',
        custom_market: '',
        supplier_name: '',
        unit_id: 1,
        quantity: '',
        unit_price: '',
        total_price: 0,
        payment_status: 'paid',
        notes: ''
      }
    ]);
  };

  // Remove Item Row from Modal Form
  const handleRemoveFormRow = (index) => {
    if (formItems.length === 1) return;
    setFormItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Update Item in Form
  const handleFormItemChange = (index, field, value) => {
    setFormItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      // Auto calculate total
      if (field === 'quantity' || field === 'unit_price') {
        const q = parseFloat(field === 'quantity' ? value : item.quantity) || 0;
        const p = parseFloat(field === 'unit_price' ? value : item.unit_price) || 0;
        item.total_price = parseFloat((q * p).toFixed(2));
      }

      updated[index] = item;
      return updated;
    });
  };

  // Calculate Form Grand Total
  const formGrandTotal = formItems.reduce((acc, item) => acc + (parseFloat(item.total_price) || 0), 0);
  const formGrandQty = formItems.reduce((acc, item) => acc + (parseFloat(item.quantity) || 0), 0);

  // Submit Add Purchases
  const handleSavePurchases = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);

      // Validate items
      for (let i = 0; i < formItems.length; i++) {
        const item = formItems[i];
        if (!item.product_id) {
          setMessage({ type: 'warning', text: `Row ${i + 1}: Please select a vegetable / product.` });
          setSaving(false);
          return;
        }
        if (!item.quantity || parseFloat(item.quantity) <= 0) {
          setMessage({ type: 'warning', text: `Row ${i + 1}: Please enter a valid quantity greater than 0.` });
          setSaving(false);
          return;
        }
        if (item.unit_price === '' || parseFloat(item.unit_price) < 0) {
          setMessage({ type: 'warning', text: `Row ${i + 1}: Please enter a valid purchase price.` });
          setSaving(false);
          return;
        }
      }

      const payload = {
        purchase_date: formDate,
        items: formItems.map(item => ({
          purchase_date: formDate,
          product_id: parseInt(item.product_id),
          market_id: item.market_id ? parseInt(item.market_id) : null,
          market_name: item.market_id === 'custom' ? item.custom_market : (marketsMaster.find(m => m.id === parseInt(item.market_id))?.name || item.custom_market || null),
          supplier_name: item.supplier_name || null,
          unit_id: parseInt(item.unit_id) || 1,
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price),
          total_price: parseFloat(item.total_price),
          payment_status: item.payment_status || 'paid',
          notes: item.notes || null
        }))
      };

      const res = await api.post('/purchases', payload);
      if (res.data.success) {
        setMessage({ type: 'success', text: `Successfully saved ${formItems.length} purchase entry/entries!` });
        setIsAddModalOpen(false);
        // Reset form
        setFormItems([
          {
            product_id: '',
            market_id: '',
            custom_market: '',
            supplier_name: '',
            unit_id: 1,
            quantity: '',
            unit_price: '',
            total_price: 0,
            payment_status: 'paid',
            notes: ''
          }
        ]);
        // Refresh data
        fetchProcurementData(selectedDate);
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: 'Failed to record purchases: ' + (err.response?.data?.message || err.message)
      });
    } finally {
      setSaving(false);
    }
  };

  // Submit Edit Purchase
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setSaving(true);
      const res = await api.put(`/purchases/${editingItem.id}`, {
        purchase_date: editingItem.purchase_date,
        product_id: parseInt(editingItem.product_id),
        market_id: editingItem.market_id ? parseInt(editingItem.market_id) : null,
        market_name: editingItem.market_name,
        supplier_name: editingItem.supplier_name,
        unit_id: parseInt(editingItem.unit_id) || 1,
        quantity: parseFloat(editingItem.quantity),
        unit_price: parseFloat(editingItem.unit_price),
        total_price: parseFloat((parseFloat(editingItem.quantity) * parseFloat(editingItem.unit_price)).toFixed(2)),
        payment_status: editingItem.payment_status,
        notes: editingItem.notes
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Purchase record updated successfully!' });
        setIsEditModalOpen(false);
        setEditingItem(null);
        fetchProcurementData(selectedDate);
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: 'Failed to update purchase: ' + (err.response?.data?.message || err.message)
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete Purchase
  const handleDeletePurchase = async (id) => {
    if (!window.confirm('Are you sure you want to delete this purchase entry?')) return;
    try {
      const res = await api.delete(`/purchases/${id}`);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Purchase entry deleted successfully.' });
        fetchProcurementData(selectedDate);
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: 'Failed to delete purchase: ' + (err.response?.data?.message || err.message)
      });
    }
  };

  // Filtered purchases for search
  const filteredPurchases = purchases.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.product_name?.toLowerCase().includes(q) ||
      p.market_name?.toLowerCase().includes(q) ||
      p.supplier_name?.toLowerCase().includes(q) ||
      p.notes?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="daily-rates-container" style={{ paddingBottom: '3rem' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div className="stat-icon-bg purple" style={{ width: '2.5rem', height: '2.5rem' }}>
              <ShoppingBag size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Haat & Mandi Procurement (हाट / मंडी खरेदी)
              </h1>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Record daily vegetable purchases across different mandis & haats with multi-lot pricing
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setFormDate(selectedDate || new Date().toISOString().slice(0, 10));
              setIsAddModalOpen(true);
            }}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#10b981', borderColor: '#10b981' }}
          >
            <Plus size={18} />
            <span>Record Haat Purchase (+ नवीन खरेदी)</span>
          </button>
          <button
            onClick={() => fetchProcurementData(selectedDate)}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            title="Refresh Data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Alert Notifications */}
      {message && (
        <div
          className={`alert alert-${message.type}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.875rem 1.25rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            background: message.type === 'success' ? '#ecfdf5' : message.type === 'warning' ? '#fffbeb' : '#fef2f2',
            color: message.type === 'success' ? '#065f46' : message.type === 'warning' ? '#92400e' : '#991b1b',
            border: `1px solid ${message.type === 'success' ? '#a7f3d0' : message.type === 'warning' ? '#fde68a' : '#fecaca'}`
          }}
        >
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Date Filter & View Switcher Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          borderRadius: '0.75rem',
          marginBottom: '1.5rem',
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        {/* Date Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
            <Calendar size={18} color="#6366f1" />
            <span>Procurement Date:</span>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field"
            style={{ width: '160px', padding: '0.45rem 0.75rem', borderRadius: '0.5rem' }}
          />
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              onClick={() => setQuickDate(0)}
              className={`btn btn-sm ${selectedDate === new Date().toISOString().slice(0, 10) ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
            >
              Today
            </button>
            <button
              onClick={() => setQuickDate(1)}
              className="btn btn-sm btn-outline"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
            >
              Yesterday
            </button>
            <button
              onClick={() => setQuickDate('all')}
              className={`btn btn-sm ${selectedDate === '' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
            >
              All Dates
            </button>
          </div>
        </div>

        {/* View Mode Toggle & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search vegetable, mandi, farmer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.25rem', width: '220px', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', background: 'var(--page-bg)', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setViewMode('summary')}
              style={{
                padding: '0.4rem 0.85rem',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: viewMode === 'summary' ? '#4f46e5' : 'transparent',
                color: viewMode === 'summary' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              वस्तू निहाय (Average / Summary)
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '0.4rem 0.85rem',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: viewMode === 'list' ? '#4f46e5' : 'transparent',
                color: viewMode === 'list' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              सर्व नोंदी (All Lots)
            </button>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-icon-bg green" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Spent (खरेदी रक्कम)</p>
            <h3 className="stat-value" style={{ color: '#059669' }}>
              ₹{Number(summaryData.overall.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="stat-helper">For {selectedDate || 'all dates'}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg blue" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <Layers size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Quantity (एकूण आवक)</p>
            <h3 className="stat-value">
              {Number(summaryData.overall.total_quantity).toLocaleString('en-IN')} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>kg</span>
            </h3>
            <span className="stat-helper">{summaryData.overall.total_lots} procurement lots</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg purple" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
            <ShoppingBag size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Vegetables Bought</p>
            <h3 className="stat-value">{summaryData.overall.unique_products}</h3>
            <span className="stat-helper">Unique varieties</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg yellow" style={{ background: '#fffbeb', color: '#f59e0b' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Overall Avg Rate</p>
            <h3 className="stat-value">
              ₹{summaryData.overall.overall_avg_rate.toFixed(2)} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>/kg</span>
            </h3>
            <span className="stat-helper">Weighted procurement cost</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card-bg)', borderRadius: '0.75rem' }}>
          <div className="stat-icon-bg purple" style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem' }}>
            <RefreshCw size={24} className="animate-spin" />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading procurement records...</p>
        </div>
      ) : viewMode === 'summary' ? (
        /* PRODUCT-WISE AGGREGATE SUMMARY (Shows multiple lots for same product, weighted average price) */
        <div className="card" style={{ padding: '1.25rem', borderRadius: '0.75rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Product-wise Consolidated Purchases (वस्तू निहाय खरेदी)
              </h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Showing weighted average cost per vegetable, even when purchased at different rates from multiple mandis
              </p>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {summaryData.products.length} Products Found
            </span>
          </div>

          {summaryData.products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <ShoppingBag size={48} style={{ opacity: 0.3, margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem' }}>No Purchases Recorded for {selectedDate || 'Selected Dates'}</h3>
              <p style={{ fontSize: '0.875rem', margin: '0 0 1rem' }}>Click below to record today's bulk vegetable purchases from Wai, Nashik, or any local haat.</p>
              <button
                onClick={() => {
                  setFormDate(selectedDate || new Date().toISOString().slice(0, 10));
                  setIsAddModalOpen(true);
                }}
                className="btn btn-primary"
                style={{ background: '#10b981', borderColor: '#10b981' }}
              >
                <Plus size={16} /> Record Purchase
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {summaryData.products.map(product => {
                const hasMultipleLots = product.lots && product.lots.length > 1;
                return (
                  <div
                    key={product.product_id}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.75rem',
                      padding: '1rem 1.25rem',
                      background: 'var(--page-bg)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      {/* Product Info */}
                      <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '0.5rem',
                            background: '#e0e7ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            overflow: 'hidden'
                          }}
                        >
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            '🥦'
                          )}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {product.product_name}
                          </h3>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem' }}>
                            <span style={{ fontSize: '0.75rem', background: '#e0e7ff', color: '#4338ca', padding: '0.15rem 0.5rem', borderRadius: '1rem', fontWeight: 600 }}>
                              {product.category_name || 'Vegetable'}
                            </span>
                            {hasMultipleLots && (
                              <span style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#92400e', padding: '0.15rem 0.5rem', borderRadius: '1rem', fontWeight: 600 }}>
                                ⚡ {product.lots.length} Different Lots / Markets
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Weighted Average & Total Numbers */}
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>Total Procured</span>
                          <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {Number(product.total_quantity).toLocaleString('en-IN')} {product.unit_symbol}
                          </span>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>Average Cost Rate</span>
                          <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#4f46e5' }}>
                            ₹{Number(product.weighted_avg_rate).toFixed(2)}
                            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>/{product.unit_symbol}</span>
                          </span>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>Total Spent</span>
                          <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#059669' }}>
                            ₹{Number(product.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Breakdown of Individual Lots (e.g. Potato in Wai @ ₹20 and Nashik @ ₹18) */}
                    <div style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px dashed var(--border-color)' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>
                        Purchased Lots Breakup (खरेदी तपशील):
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {product.lots?.map((lot, idx) => (
                          <div
                            key={lot.id || idx}
                            style={{
                              background: 'var(--card-bg)',
                              border: '1px solid var(--border-color)',
                              padding: '0.4rem 0.75rem',
                              borderRadius: '0.5rem',
                              fontSize: '0.825rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            <span style={{ fontWeight: 600, color: '#4338ca' }}>📍 {lot.market_name}</span>
                            <span style={{ color: 'var(--border-color)' }}>|</span>
                            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{lot.quantity} {product.unit_symbol}</span>
                            <span>@</span>
                            <span style={{ fontWeight: 800, color: '#059669' }}>₹{Number(lot.unit_price).toFixed(2)}</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>(= ₹{Number(lot.total_price).toLocaleString('en-IN')})</span>
                            {lot.supplier_name && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>({lot.supplier_name})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* INDIVIDUAL TRANSACTIONS TABLE VIEW */
        <div className="card" style={{ padding: '1.25rem', borderRadius: '0.75rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Individual Procurement Entries (सर्व खरेदी पावत्या)
            </h2>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {filteredPurchases.length} Lots Found
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--page-bg)', borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Date & Lot</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Vegetable</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Mandi / Haat</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Farmer / Trader</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Quantity</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Rate (₹)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total (₹)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Payment</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                      No purchase entries found matching the filter.
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.purchase_date}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>#{p.id}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.25rem' }}>🥦</span>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.product_name}</div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.category_name}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: '#4338ca', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={14} /> {p.market_name}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                        {p.supplier_name || '—'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-main)' }}>
                        {Number(p.quantity).toLocaleString('en-IN')} {p.unit_symbol}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                        ₹{Number(p.unit_price).toFixed(2)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: 'var(--text-main)' }}>
                        ₹{Number(p.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '1rem',
                            background: p.payment_status === 'paid' ? '#ecfdf5' : '#fffbeb',
                            color: p.payment_status === 'paid' ? '#059669' : '#d97706'
                          }}
                        >
                          {p.payment_status?.toUpperCase() || 'PAID'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => {
                              setEditingItem(p);
                              setIsEditModalOpen(true);
                            }}
                            title="Edit Record"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#6366f1',
                              padding: '0.25rem'
                            }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePurchase(p.id)}
                            title="Delete Record"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#ef4444',
                              padding: '0.25rem'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* ADD PURCHASES MODAL (Multi-item & Duplicate product friendly) */}
      {/* ========================================================== */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: 'var(--card-bg)',
              borderRadius: '1rem',
              width: '100%',
              maxWidth: '900px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              border: '1px solid var(--border-color)',
              padding: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Record Haat & Mandi Purchases (खरेदी नोंदवा)
                </h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Add single or multiple vegetables. You can add the same vegetable multiple times from different mandis / rates!
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePurchases}>
              {/* Common Date */}
              <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>Purchase Date:</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="input-field"
                  style={{ width: '180px', padding: '0.45rem 0.75rem' }}
                  required
                />
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {formItems.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'var(--page-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.75rem',
                      padding: '1rem',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#4f46e5' }}>
                        Lot #{index + 1}
                      </span>
                      {formItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFormRow(index)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}
                        >
                          <Trash2 size={14} /> Remove Lot
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                      {/* Vegetable / Product */}
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                          Vegetable / भाजीपाला *
                        </label>
                        <select
                          value={item.product_id}
                          onChange={(e) => handleFormItemChange(index, 'product_id', e.target.value)}
                          className="input-field"
                          style={{ width: '100%', padding: '0.45rem 0.5rem' }}
                          required
                        >
                          <option value="">-- Select Vegetable --</option>
                          {productsMaster.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.unit_symbol})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Mandi / Haat */}
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                          Mandi / Haat (बाजार)
                        </label>
                        <select
                          value={item.market_id}
                          onChange={(e) => handleFormItemChange(index, 'market_id', e.target.value)}
                          className="input-field"
                          style={{ width: '100%', padding: '0.45rem 0.5rem' }}
                        >
                          <option value="">-- Select Mandi --</option>
                          {marketsMaster.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.city})
                            </option>
                          ))}
                          <option value="custom">+ Other / Custom Haat</option>
                        </select>
                      </div>

                      {/* Custom Haat Name if selected */}
                      {item.market_id === 'custom' && (
                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                            Haat / Market Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Satara Weekly Haat"
                            value={item.custom_market}
                            onChange={(e) => handleFormItemChange(index, 'custom_market', e.target.value)}
                            className="input-field"
                            style={{ width: '100%', padding: '0.45rem 0.5rem' }}
                          />
                        </div>
                      )}

                      {/* Farmer / Supplier */}
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                          Farmer / Trader (शेतकरी)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Kisan Patil"
                          value={item.supplier_name}
                          onChange={(e) => handleFormItemChange(index, 'supplier_name', e.target.value)}
                          className="input-field"
                          style={{ width: '100%', padding: '0.45rem 0.5rem' }}
                        />
                      </div>

                      {/* Quantity */}
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                          Quantity (kg) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 100"
                          value={item.quantity}
                          onChange={(e) => handleFormItemChange(index, 'quantity', e.target.value)}
                          className="input-field"
                          style={{ width: '100%', padding: '0.45rem 0.5rem' }}
                          required
                        />
                      </div>

                      {/* Purchase Rate per unit */}
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                          Rate / Price (₹ per kg) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 20.00"
                          value={item.unit_price}
                          onChange={(e) => handleFormItemChange(index, 'unit_price', e.target.value)}
                          className="input-field"
                          style={{ width: '100%', padding: '0.45rem 0.5rem' }}
                          required
                        />
                      </div>

                      {/* Total Amount (Auto Calculated) */}
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                          Total Amount (रक्कम)
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={`₹${(item.total_price || 0).toLocaleString('en-IN')}`}
                          className="input-field"
                          style={{ width: '100%', padding: '0.45rem 0.5rem', background: '#e0e7ff', fontWeight: 700, color: '#4338ca' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Row Button */}
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleAddFormRow}
                  className="btn btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
                >
                  <Plus size={16} /> + Add Another Vegetable / Lot (दुसरी भाजी / दर जोडा)
                </button>

                {/* Grand Summary of the bill */}
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '1rem' }}>
                    Total Quantity: <strong>{formGrandQty} kg</strong>
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>
                    Grand Total: ₹{formGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ background: '#10b981', borderColor: '#10b981' }}
                >
                  {saving ? 'Saving...' : `Save ${formItems.length} Purchases (खरेदी जतन करा)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* EDIT PURCHASE MODAL */}
      {/* ========================================================== */}
      {isEditModalOpen && editingItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: 'var(--card-bg)',
              borderRadius: '1rem',
              width: '100%',
              maxWidth: '550px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              border: '1px solid var(--border-color)',
              padding: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Edit Purchase Lot #{editingItem.id}
              </h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingItem(null);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={editingItem.purchase_date}
                    onChange={(e) => setEditingItem({ ...editingItem, purchase_date: e.target.value })}
                    className="input-field"
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                    Vegetable / Product
                  </label>
                  <select
                    value={editingItem.product_id}
                    onChange={(e) => setEditingItem({ ...editingItem, product_id: e.target.value })}
                    className="input-field"
                    style={{ width: '100%' }}
                    required
                  >
                    {productsMaster.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                    Mandi / Haat Name
                  </label>
                  <input
                    type="text"
                    value={editingItem.market_name || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, market_name: e.target.value })}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                    Farmer / Supplier Name
                  </label>
                  <input
                    type="text"
                    value={editingItem.supplier_name || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, supplier_name: e.target.value })}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                      Quantity (kg)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingItem.quantity}
                      onChange={(e) => setEditingItem({ ...editingItem, quantity: e.target.value })}
                      className="input-field"
                      style={{ width: '100%' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                      Rate / Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingItem.unit_price}
                      onChange={(e) => setEditingItem({ ...editingItem, unit_price: e.target.value })}
                      className="input-field"
                      style={{ width: '100%' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                    Payment Status
                  </label>
                  <select
                    value={editingItem.payment_status || 'paid'}
                    onChange={(e) => setEditingItem({ ...editingItem, payment_status: e.target.value })}
                    className="input-field"
                    style={{ width: '100%' }}
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending / Udhar</option>
                    <option value="partial">Partial</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? 'Saving...' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
