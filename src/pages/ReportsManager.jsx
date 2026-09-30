import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Package,
  Truck,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export default function ReportsManager() {
  const { isSuperAdmin } = useAuth();

  // Active Report Tab: 'sales' | 'procurement' | 'delivery' | 'khata'
  const [activeReport, setActiveReport] = useState('sales');

  // Filter States
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [searchTerm, setSearchTerm] = useState('');

  // Data States
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Quick Date Range helper
  const setQuickRange = (rangeType) => {
    const today = new Date();
    const toStr = today.toISOString().slice(0, 10);
    setDateTo(toStr);

    if (rangeType === 'today') {
      setDateFrom(toStr);
    } else if (rangeType === 'week') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setDateFrom(d.toISOString().slice(0, 10));
    } else if (rangeType === 'month') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setDateFrom(d.toISOString().slice(0, 10));
    } else if (rangeType === 'all') {
      setDateFrom('');
      setDateTo('');
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      let endpoint = '';
      const params = new URLSearchParams();
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      if (activeReport === 'sales') endpoint = `/reports/sales?${params.toString()}`;
      else if (activeReport === 'procurement') endpoint = `/reports/procurement?${params.toString()}`;
      else if (activeReport === 'delivery') endpoint = `/reports/delivery?${params.toString()}`;
      else if (activeReport === 'khata') endpoint = `/reports/khata-ledger`;

      const res = await api.get(endpoint);
      if (res.data.success) {
        setReportData(res.data.data || []);
        setSummaryData(res.data.summary || null);
      } else {
        setErrorMsg('Could not fetch report data.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.response?.data?.error || 'Failed to fetch report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeReport, dateFrom, dateTo]);

  // Export Table to CSV
  const handleExportCSV = () => {
    if (!reportData || reportData.length === 0) {
      alert('No data available to export.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeReport === 'sales') {
      csvContent += 'Order ID,Order Number,Date,Shop Name,Contact,Type,Total Items,Volume,Total (Rs),Paid (Rs),Balance (Rs),Order Status,Payment Status\n';
      reportData.forEach(r => {
        csvContent += `"${r.id}","${r.order_number}","${new Date(r.created_at).toLocaleDateString()}","${r.business_name}","${r.mobile_number || ''}","${r.payment_type_name}","${r.total_items}","${r.total_volume}","${r.total_amount}","${r.paid_amount}","${r.balance_amount}","${r.order_status}","${r.payment_status}"\n`;
      });
    } else if (activeReport === 'procurement') {
      csvContent += 'Vegetable,Category,Orders Count,Total Demanded,Unit,Average Rate (Rs),Procurement Cost (Rs)\n';
      reportData.forEach(r => {
        csvContent += `"${r.vegetable_name}","${r.category_name}","${r.orders_count}","${r.total_quantity_demanded}","${r.unit_symbol}","${parseFloat(r.average_rate || 0).toFixed(2)}","${parseFloat(r.total_procurement_cost || 0).toFixed(2)}"\n`;
      });
    } else if (activeReport === 'delivery') {
      csvContent += 'Partner Name,Phone,Home City,Total Assigned,Accepted,Rejected,Delivered,Active In-Transit,Total Value Delivered (Rs)\n';
      reportData.forEach(r => {
        csvContent += `"${r.partner_name}","${r.partner_phone}","${r.home_city}","${r.total_assigned}","${r.accepted_count}","${r.rejected_count}","${r.delivered_count}","${r.active_in_transit}","${r.total_delivered_value}"\n`;
      });
    } else if (activeReport === 'khata') {
      csvContent += 'Shop Name,Owner/Contact,Phone,City,Total Orders,Total Billed (Rs),Total Paid (Rs),Outstanding Khata Balance (Rs),Unpaid Orders\n';
      reportData.forEach(r => {
        csvContent += `"${r.business_name}","${r.contact_person || ''}","${r.mobile_number || ''}","${r.city || ''}","${r.total_orders}","${r.total_billed}","${r.total_paid}","${r.outstanding_khata_due}","${r.unpaid_orders_count}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Whole_Sale_${activeReport}_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered rows based on search input
  const filteredData = reportData.filter(item => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    if (activeReport === 'sales') {
      return (
        item.order_number?.toLowerCase().includes(term) ||
        item.business_name?.toLowerCase().includes(term) ||
        item.mobile_number?.toLowerCase().includes(term) ||
        item.payment_status?.toLowerCase().includes(term)
      );
    }
    if (activeReport === 'procurement') {
      return (
        item.vegetable_name?.toLowerCase().includes(term) ||
        item.category_name?.toLowerCase().includes(term)
      );
    }
    if (activeReport === 'delivery') {
      return (
        item.partner_name?.toLowerCase().includes(term) ||
        item.partner_phone?.toLowerCase().includes(term) ||
        item.home_city?.toLowerCase().includes(term)
      );
    }
    if (activeReport === 'khata') {
      return (
        item.business_name?.toLowerCase().includes(term) ||
        item.contact_person?.toLowerCase().includes(term) ||
        item.mobile_number?.toLowerCase().includes(term) ||
        item.city?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  if (!isSuperAdmin) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
        <h3>Access Restricted</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Detailed reports and operational ledger generation are only available to Super Admin.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header Banner */}
      <div className="orders-header-banner">
        <div className="orders-header-title">
          <h2>
            <FileText size={26} color="var(--primary-color)" />
            Mandi Reports & Analytics Center
          </h2>
          <p>
            Generate comprehensive APMC wholesale reports, analyze procurement demand, delivery performance, and khata credit balances.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCSV}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '0.5rem', padding: '0.6rem 1.2rem', fontWeight: 600 }}
          >
            <Download size={18} />
            Export CSV Report
          </button>
          <button
            onClick={fetchReport}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '0.5rem', padding: '0.6rem 1rem' }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Report Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', margin: '1.5rem 0', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveReport('sales')}
          className={`btn ${activeReport === 'sales' ? 'btn-primary' : 'btn-outline'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '0.5rem' }}
        >
          <DollarSign size={16} />
          Sales & Revenue Report
        </button>

        <button
          onClick={() => setActiveReport('procurement')}
          className={`btn ${activeReport === 'procurement' ? 'btn-primary' : 'btn-outline'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '0.5rem' }}
        >
          <Package size={16} />
          Vegetable Procurement Demand
        </button>

        <button
          onClick={() => setActiveReport('delivery')}
          className={`btn ${activeReport === 'delivery' ? 'btn-primary' : 'btn-outline'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '0.5rem' }}
        >
          <Truck size={16} />
          Delivery Partner Performance
        </button>

        <button
          onClick={() => setActiveReport('khata')}
          className={`btn ${activeReport === 'khata' ? 'btn-primary' : 'btn-outline'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '0.5rem' }}
        >
          <Users size={16} />
          Shop Owner Khata Ledger
        </button>
      </div>

      {/* Date Filters & Search Toolbar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Quick Preset Buttons (for date-applicable reports) */}
          {activeReport !== 'khata' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Presets:</span>
              <button onClick={() => setQuickRange('today')} className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>Today</button>
              <button onClick={() => setQuickRange('week')} className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>Last 7 Days</button>
              <button onClick={() => setQuickRange('month')} className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>Last 30 Days</button>
              <button onClick={() => setQuickRange('all')} className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>All Time</button>
            </div>
          )}

          {/* Date Picker Inputs */}
          {activeReport !== 'khata' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={15} color="var(--text-secondary)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>From:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="form-control"
                  style={{ width: 'auto', padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>To:</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="form-control"
                  style={{ width: 'auto', padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          )}

          {/* Search bar inside current report */}
          <div style={{ position: 'relative', minWidth: '15rem', flex: 1, maxWidth: '22rem' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder={`Search in ${activeReport} report...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
            />
          </div>
        </div>
      </div>

      {/* Summary KPI Cards if available */}
      {summaryData && activeReport === 'sales' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL ORDERS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {summaryData.total_orders}
            </div>
          </div>
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL BILLED REVENUE</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary-color)', marginTop: '0.25rem' }}>
              ₹{parseFloat(summaryData.total_revenue || 0).toLocaleString()}
            </div>
          </div>
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL COLLECTED</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981', marginTop: '0.25rem' }}>
              ₹{parseFloat(summaryData.total_collected || 0).toLocaleString()}
            </div>
          </div>
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PENDING KHATA BALANCE</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ef4444', marginTop: '0.25rem' }}>
              ₹{parseFloat(summaryData.total_pending_credit || 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {summaryData && activeReport === 'khata' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL REGISTERED SHOPS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {summaryData.total_shops}
            </div>
          </div>
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>LIFETIME MARKET TURNOVER</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary-color)', marginTop: '0.25rem' }}>
              ₹{parseFloat(summaryData.total_turnover || 0).toLocaleString()}
            </div>
          </div>
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>OUTSTANDING MARKET CREDIT DUE</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ef4444', marginTop: '0.25rem' }}>
              ₹{parseFloat(summaryData.total_market_credit || 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Error Notice */}
      {errorMsg && (
        <div style={{ background: '#fee2e2', border: '1px solid #f87171', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          {errorMsg}
        </div>
      )}

      {/* Report Table Display */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--primary-color)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Generating report data...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <FileText size={40} style={{ margin: '0 auto 1rem', color: 'var(--text-secondary)', opacity: 0.5 }} />
            <h4>No Records Found</h4>
            <p style={{ color: 'var(--text-secondary)' }}>There is no data matching the selected date range or search filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {/* 1. SALES & REVENUE REPORT TABLE */}
            {activeReport === 'sales' && (
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--hover-bg)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Order No</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Date</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Shop / Business</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Contact</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Payment Type</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Items</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Total (₹)</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Paid (₹)</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Balance (₹)</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Order Status</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--primary-color)' }}>
                        {row.order_number}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>
                        {new Date(row.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 500 }}>
                        {row.business_name}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{row.city || 'Wai'}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>
                        {row.mobile_number || '-'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>
                        {row.payment_type_name}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontSize: '0.85rem' }}>
                        {row.total_items} items ({row.total_volume} kg)
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700 }}>
                        ₹{parseFloat(row.total_amount || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                        ₹{parseFloat(row.paid_amount || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: parseFloat(row.balance_amount || 0) > 0 ? '#ef4444' : 'var(--text-secondary)', fontWeight: 600 }}>
                        ₹{parseFloat(row.balance_amount || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <span className={`badge ${row.order_status === 'delivered' ? 'badge-success' : row.order_status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                          {row.order_status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <span className={`badge ${row.payment_status === 'paid' ? 'badge-success' : 'badge-danger'}`}>
                          {row.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 2. VEGETABLE PROCUREMENT DEMAND REPORT TABLE */}
            {activeReport === 'procurement' && (
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--hover-bg)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>#</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Vegetable</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Orders Demanding</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Total Quantity Demanded</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Avg Rate</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Total Procurement Value</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, idx) => (
                    <tr key={row.product_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{idx + 1}</td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{row.vegetable_name}</td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>{row.category_name}</td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 600 }}>
                        <span className="badge badge-warning" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                          {row.orders_count} orders
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--primary-color)' }}>
                        {row.total_quantity_demanded} {row.unit_symbol}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        ₹{parseFloat(row.average_rate || 0).toFixed(2)} / {row.unit_symbol}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700 }}>
                        ₹{parseFloat(row.total_procurement_cost || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 3. DELIVERY OPERATIONS REPORT TABLE */}
            {activeReport === 'delivery' && (
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--hover-bg)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Delivery Partner</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Phone</th>
                    <th style={{ padding: '0.85rem 1rem' }}>City</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Assigned</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Accepted</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Rejected</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Delivered</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>In Transit</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Fulfilled Value</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row) => (
                    <tr key={row.delivery_partner_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{row.partner_name}</td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>{row.partner_phone || '-'}</td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>{row.home_city}</td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 600 }}>{row.total_assigned}</td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#10b981', fontWeight: 600 }}>{row.accepted_count}</td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#ef4444', fontWeight: 600 }}>{row.rejected_count}</td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <span className="badge badge-success">{row.delivered_count}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <span className="badge badge-warning">{row.active_in_transit}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700 }}>
                        ₹{parseFloat(row.total_delivered_value || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 4. SHOP OWNER KHATA LEDGER REPORT TABLE */}
            {activeReport === 'khata' && (
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--hover-bg)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Shop / Business Name</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Owner / Contact</th>
                    <th style={{ padding: '0.85rem 1rem' }}>City</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Total Orders</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Total Billed (₹)</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Total Paid (₹)</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Outstanding Khata (₹)</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Unpaid Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row) => (
                    <tr key={row.business_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--primary-color)' }}>
                        {row.business_name}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{row.business_type}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div>{row.contact_person || 'N/A'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{row.mobile_number}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>{row.city || 'Wai'}</td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 600 }}>{row.total_orders}</td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 600 }}>
                        ₹{parseFloat(row.total_billed || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                        ₹{parseFloat(row.total_paid || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: parseFloat(row.outstanding_khata_due || 0) > 0 ? '#ef4444' : 'var(--text-secondary)' }}>
                        ₹{parseFloat(row.outstanding_khata_due || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        {parseInt(row.unpaid_orders_count || 0) > 0 ? (
                          <span className="badge badge-danger">{row.unpaid_orders_count} pending</span>
                        ) : (
                          <span className="badge badge-success">Clear</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
