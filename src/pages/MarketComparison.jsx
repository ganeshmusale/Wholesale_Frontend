import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  BarChart3,
  Calendar,
  Sparkles,
  TrendingDown,
  Building,
  HelpCircle,
  Search
} from 'lucide-react';

export default function MarketComparison() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [markets, setMarkets] = useState([]);
  const [matrixData, setMatrixData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchConsolidatedData = async (date) => {
    try {
      setLoading(true);
      const res = await api.get(`/rates/consolidated?date=${date}`);
      if (res.data.success) {
        setMarkets(res.data.markets || []);
        setMatrixData(res.data.consolidated_matrix || []);
      }
    } catch (err) {
      console.error('Failed to load consolidated rates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsolidatedData(selectedDate);
  }, [selectedDate]);

  const filteredData = matrixData.filter(item =>
    item.vegetable.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>APMC Consolidated Wholesale Rate Matrix</h1>
          <p>
            Cross-market rate comparison across <strong>Wai</strong>, <strong>Nashik</strong>, <strong>Pune</strong>, and <strong>Vashi</strong> to identify the lowest procurement price.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fff', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--card-border)' }}>
            <Calendar size={15} color="var(--primary)" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', fontWeight: 600 }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search vegetable..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.25rem', width: '13rem', padding: '0.4rem 0.75rem 0.4rem 2.2rem' }}
            />
          </div>
        </div>
      </div>

      {/* Highlights info card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        marginBottom: '1.25rem',
        boxShadow: 'var(--card-shadow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Sparkles size={18} color="var(--primary)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Procurement Advantage Analysis
          </h3>
        </div>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Different APMC yards have distinct specialty supplies (e.g. <strong>Nashik APMC</strong> for Onions and Grapes, <strong>Wai APMC</strong> for fresh local greens and potatoes). By analyzing the consolidated rates, wholesale buyers can achieve <strong>10% to 25% savings</strong> on bulk 250kg bags.
        </p>
      </div>

      {/* Main Consolidated Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Sr.</th>
                <th>Vegetable</th>
                <th>Category</th>
                <th>Standard Unit</th>
                <th>Min Bulk Qty</th>
                {markets.map(m => (
                  <th key={m.id} style={{ textAlign: 'right' }}>
                    {m.name.replace(' APMC Market', '')} (₹)
                  </th>
                ))}
                <th style={{ textAlign: 'center' }}>Best APMC Sourcing</th>
                <th style={{ textAlign: 'right' }}>Lowest Rate</th>
                <th style={{ textAlign: 'right' }}>Saving on 250kg</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6 + markets.length} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    Loading market comparison data...
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => {
                  // Calculate savings on a standard 250kg bulk purchase
                  const rateDiff = parseFloat(item.potential_saving_per_unit || 0);
                  const savingOn250 = (rateDiff * 250).toFixed(0);

                  return (
                    <tr key={item.product_id}>
                      <td>{item.sr}</td>
                      <td>
                        <strong style={{ fontSize: '0.9rem' }}>{item.vegetable}</strong>
                      </td>
                      <td>
                        <span className="pill-tag">{item.category}</span>
                      </td>
                      <td>{item.unit}</td>
                      <td>
                        <span className="badge badge-primary">{parseFloat(item.bulk_min_qty)} {item.unit}</span>
                      </td>

                      {/* Columns for each market */}
                      {markets.map(m => {
                        const rate = item.rates_by_market[m.id];
                        const isLowest = rate !== null && rate !== undefined && rate === item.lowest_rate;
                        return (
                          <td key={m.id} style={{ textAlign: 'right' }}>
                            {rate ? (
                              <span style={{
                                fontWeight: isLowest ? 700 : 500,
                                color: isLowest ? 'var(--success)' : 'var(--text-primary)',
                                background: isLowest ? 'var(--success-light)' : 'transparent',
                                padding: isLowest ? '0.15rem 0.45rem' : '0',
                                borderRadius: 'var(--radius-sm)'
                              }}>
                                ₹{rate.toFixed(2)}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>—</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Best market badge */}
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge pill-best">
                          {item.best_market_to_buy?.replace(' APMC Market', '') || 'Wai'}
                        </span>
                      </td>

                      {/* Lowest Rate */}
                      <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {item.lowest_rate ? `₹${parseFloat(item.lowest_rate).toFixed(2)}` : '—'}
                      </td>

                      {/* Saving on 250 kg */}
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>
                        {rateDiff > 0 ? `₹${savingOn250}` : '—'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6 + markets.length} style={{ textAlign: 'center', padding: '2rem' }}>
                    No market comparison records found for this date.
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
