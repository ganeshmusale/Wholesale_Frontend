import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  Save,
  Copy,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Info,
  Store,
  MapPin
} from 'lucide-react';

export default function DailyRatesManager() {
  const { user, isSuperAdmin, isBusinessMan } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedBusinessId, setSelectedBusinessId] = useState(() => user?.business_id || 1);
  const [currentBusiness, setCurrentBusiness] = useState(null);
  const [allStores, setAllStores] = useState([]);
  const [sheetData, setSheetData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchPriceSheet = async (date, bizId) => {
    try {
      setLoading(true);
      setMessage(null);
      const targetId = bizId || selectedBusinessId;
      const [sheetRes, catRes] = await Promise.all([
        api.get(`/rates/store-sheet?date=${date}&business_id=${targetId}`),
        api.get('/masters/categories')
      ]);

      if (sheetRes.data.success) {
        setSheetData(sheetRes.data.data);
        setCurrentBusiness(sheetRes.data.business);
        if (sheetRes.data.all_stores) setAllStores(sheetRes.data.all_stores);
      }

      if (catRes.data.success) {
        const activeCats = catRes.data.data.filter(c => c.is_active).map(c => c.name);
        const dataCats = sheetRes.data.data ? sheetRes.data.data.map(i => i.category) : [];
        setCategories(Array.from(new Set([...activeCats, ...dataCats])).filter(Boolean));
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to load price sheet: ' + (err.response?.data?.message || err.message) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceSheet(selectedDate, selectedBusinessId);
  }, [selectedDate, selectedBusinessId]);


  const handlePriceChange = (productId, newPrice) => {
    setSheetData(prev =>
      prev.map(item => {
        if (item.product_id === productId) {
          const val = parseFloat(newPrice) || 0;
          let diff = null;
          let trend = 'same';
          if (item.yesterday_price !== null) {
            diff = (val - item.yesterday_price).toFixed(2);
            if (val > item.yesterday_price) trend = 'up';
            else if (val < item.yesterday_price) trend = 'down';
          }
          return {
            ...item,
            today_price: val,
            price_diff: diff,
            trend
          };
        }
        return item;
      })
    );
  };

  const handleMinQtyChange = (productId, newQty) => {
    setSheetData(prev =>
      prev.map(item =>
        item.product_id === productId
          ? { ...item, min_bulk_qty: parseFloat(newQty) || 50 }
          : item
      )
    );
  };

  const handleAvailabilityToggle = (productId) => {
    setSheetData(prev =>
      prev.map(item =>
        item.product_id === productId
          ? { ...item, is_available: !item.is_available }
          : item
      )
    );
  };

  const handleNotesChange = (productId, notes) => {
    setSheetData(prev =>
      prev.map(item =>
        item.product_id === productId
          ? { ...item, notes }
          : item
      )
    );
  };

  // Copy yesterday's prices for empty fields
  const handleCopyYesterday = () => {
    setSheetData(prev =>
      prev.map(item => {
        if (item.yesterday_price !== null) {
          return {
            ...item,
            today_price: item.yesterday_price,
            price_diff: '0.00',
            trend: 'same'
          };
        }
        return item;
      })
    );
    setMessage({ type: 'success', text: "Copied yesterday's baseline prices. You can now adjust individual items." });
  };

  // Save price sheet
  const handleSaveSheet = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const payload = {
        rate_date: selectedDate,
        business_id: selectedBusinessId,
        rates: sheetData.map(item => ({
          product_id: item.product_id,
          wholesale_price: item.today_price || 0,
          min_bulk_qty: item.min_bulk_qty || 50,
          is_available: item.is_available,
          notes: item.notes
        }))
      };

      const res = await api.post('/rates/save-store-sheet', payload);
      if (res.data.success) {
        setMessage({
          type: 'success',
          text: `Successfully updated daily wholesale prices for ${currentBusiness?.business_name || 'Store'} on ${selectedDate}!`
        });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error saving rates: ' + (err.response?.data?.message || err.message) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>
            {isBusinessMan ? 'My Store Daily Vegetable Prices' : 'Daily Vegetable Wholesale Price Manager'}
          </h1>
          <p>
            {isBusinessMan
              ? `Manage selling prices for your store: ${currentBusiness?.business_name || 'My Store'} (${currentBusiness?.city || 'Wai'}, ${currentBusiness?.state || 'Maharashtra'})`
              : 'Super Admin & Shop Owners set daily wholesale prices and bulk quantities according to APMC market rates across India.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Store Selector for Super Admin */}
          {isSuperAdmin && allStores.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fff', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius)', border: '1px solid var(--card-border)' }}>
              <Store size={15} color="var(--primary)" />
              <select
                className="form-input"
                style={{ border: 'none', background: 'transparent', outline: 'none', padding: '0.1rem 0.25rem', fontSize: '0.85rem', fontWeight: 600 }}
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(Number(e.target.value))}
              >
                {allStores.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.business_name} ({s.city}, {s.state})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fff', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--card-border)' }}>
            <Calendar size={15} color="var(--primary)" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', fontWeight: 600 }}
            />
          </div>

          <button className="btn btn-secondary" onClick={handleCopyYesterday} title="Copy yesterday's prices as baseline">
            <Copy size={15} />
            <span>Copy Yesterday's</span>
          </button>

          <button className="btn btn-primary" onClick={handleSaveSheet} disabled={saving}>
            <Save size={15} />
            <span>{saving ? 'Saving...' : 'Save & Publish Rates'}</span>
          </button>
        </div>
      </div>

      {/* Active Store Indicator Banner */}
      {currentBusiness && (
        <div style={{
          background: 'var(--primary-xlight)',
          border: '1px solid var(--primary-light)',
          borderRadius: 'var(--radius)',
          padding: '0.65rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.825rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3730a3' }}>
            <Store size={16} />
            <span>
              Active Store: <strong>{currentBusiness.business_name}</strong> &bull; {currentBusiness.city}, {currentBusiness.state}
            </span>
          </div>
          <span className="badge badge-primary">Pan-India Store</span>
        </div>
      )}

      {/* Notice/Alert Banner */}
      {message && (
        <div style={{
          background: message.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius)',
          border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fca5a5'}`,
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600
        }}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Mandi Benchmark Guide Banner */}
      <div style={{
        background: 'var(--primary-xlight)',
        border: '1px solid var(--primary-light)',
        borderRadius: 'var(--radius)',
        padding: '0.875rem 1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.825rem',
        color: '#3730a3'
      }}>
        <Info size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
        <div>
          <strong>APMC Market Benchmarks:</strong> Columns indicate arrival prices recorded today in major APMC hubs (e.g. Wai Mandi, Nashik Mandi). Set your store's wholesale price with appropriate margin and logistics.
        </div>
      </div>

      {/* Category Filter Tabs */}
      {categories.length > 0 && (
        <div className="tabs-header" style={{ marginBottom: '1rem' }}>
          <button
            className={`tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All Categories ({sheetData.length})
          </button>
          {categories.map(cat => {
            const count = sheetData.filter(i => i.category === cat).length;
            return (
              <button
                key={cat}
                className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Main Table Card */}
      <div className="card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Sr.</th>
                <th>Vegetable</th>
                <th>Category</th>
                <th>Mandi Benchmark Rates</th>
                <th>Yesterday's Price</th>
                <th style={{ width: '10.5rem' }}>Today's Wholesale Price (₹)</th>
                <th>Difference</th>
                <th style={{ width: '9rem' }}>Min Bulk Qty</th>
                <th>In Stock</th>
                <th>Batch Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    Loading today's price sheet...
                  </td>
                </tr>
              ) : sheetData.length > 0 ? (
                sheetData
                  .filter(item => activeCategory === 'all' || item.category === activeCategory)
                  .map((item, idx) => (
                  <tr key={item.product_id} style={{ opacity: item.is_available ? 1 : 0.6 }}>
                    <td>{idx + 1}</td>
                    <td>
                      <strong style={{ fontSize: '0.9rem' }}>{item.name}</strong>
                    </td>
                    <td>
                      <span className="pill-tag">{item.category}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {item.mandi_benchmarks && item.mandi_benchmarks.length > 0 ? (
                          item.mandi_benchmarks.map((mb, i) => (
                            <span key={i} className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                              {mb.market}: ₹{mb.mandi_rate}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Wai APMC: ₹18</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {item.yesterday_price !== null ? (
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                          ₹{item.yesterday_price.toFixed(2)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>₹</span>
                        <input
                          type="number"
                          step="0.50"
                          min="0"
                          className="form-input"
                          value={item.today_price !== null ? item.today_price : ''}
                          onChange={(e) => handlePriceChange(item.product_id, e.target.value)}
                          placeholder="0.00"
                          style={{
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            padding: '0.4rem 0.5rem',
                            fontSize: '0.9rem'
                          }}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/{item.unit}</span>
                      </div>
                    </td>
                    <td>
                      {item.price_diff !== null && item.price_diff !== '0.00' ? (
                        <span className={`badge ${parseFloat(item.price_diff) > 0 ? 'badge-danger' : 'badge-success'}`}>
                          {parseFloat(item.price_diff) > 0 ? (
                            <>
                              <ArrowUp size={12} /> +₹{item.price_diff}
                            </>
                          ) : (
                            <>
                              <ArrowDown size={12} /> ₹{item.price_diff}
                            </>
                          )}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>0.00</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <input
                          type="number"
                          step="10"
                          min="10"
                          className="form-input"
                          value={item.min_bulk_qty}
                          onChange={(e) => handleMinQtyChange(item.product_id, e.target.value)}
                          style={{ padding: '0.4rem 0.5rem', width: '5.5rem' }}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.unit}</span>
                      </div>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={item.is_available}
                        onChange={() => handleAvailabilityToggle(item.product_id)}
                        style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Fresh Agra lot"
                        value={item.notes || ''}
                        onChange={(e) => handleNotesChange(item.product_id, e.target.value)}
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.775rem' }}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>
                    No products found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
