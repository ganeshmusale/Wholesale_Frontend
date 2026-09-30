import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';
import {
  Store,
  Building,
  MapPin,
  Phone,
  User,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus
} from 'lucide-react';

export default function BusinessRegistration() {
  const { user, isSuperAdmin, isBusinessMan, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: 'vegetable_shop',
    contact_person: '',
    mobile_number: '',
    shop_address: '',
    city: 'Wai',
    state: 'Maharashtra',
    gst_number: ''
  });

  const [allBusinesses, setAllBusinesses] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [bizPage, setBizPage] = useState(1);
  const [bizPagination, setBizPagination] = useState({ total_pages: 1, total: 0, limit: 10 });

  // Super Admin Onboarding Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [newOwnerData, setNewOwnerData] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: 'password123',
    business_name: '',
    business_type: 'vegetable_shop',
    shop_address: '',
    city: '',
    state: 'Maharashtra',
    gst_number: ''
  });

  const indianStates = [
    'Maharashtra', 'Gujarat', 'Karnataka', 'Madhya Pradesh', 'Rajasthan',
    'Uttar Pradesh', 'Delhi', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana',
    'Punjab', 'Haryana', 'West Bengal', 'Bihar', 'Kerala', 'Odisha'
  ];

  const loadBusinesses = async (page = bizPage, filter = activeFilter) => {
    try {
      setLoading(true);
      // Fetch dynamic business types
      try {
        const btRes = await api.get('/masters/business-types');
        if (btRes.data.success) {
          setBusinessTypes(btRes.data.data.filter(b => b.is_active));
        }
      } catch (e) {
        console.error('Failed to load business types:', e);
      }

      if (isBusinessMan) {
        const res = await api.get('/business/my-business');
        if (res.data.success && res.data.data) {
          setFormData(res.data.data);
        }
      } else {
        const typeParam = filter !== 'all' ? `&business_type=${filter}` : '';
        const res = await api.get(`/business/all?page=${page}&limit=10${typeParam}`);
        if (res.data.success) {
          setAllBusinesses(res.data.data);
          if (res.data.pagination) {
            setBizPagination(res.data.pagination);
          }
        }
      }
    } catch (err) {
      console.error('Error loading business:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setBizPage(1);
    loadBusinesses(1, activeFilter);
  }, [isBusinessMan, activeFilter]);

  const handleAdminCreateShopOwner = async (e) => {
    e.preventDefault();
    try {
      setCreateSubmitting(true);
      const res = await api.post('/business/admin-create-shop-owner', newOwnerData);
      if (res.data.success) {
        setMessage({
          type: 'success',
          text: `Shop Owner "${newOwnerData.business_name}" (${newOwnerData.city}) created! Login Phone: ${newOwnerData.phone} | Pass: ${newOwnerData.password}`
        });
        setShowCreateModal(false);
        setNewOwnerData({
          full_name: '',
          phone: '',
          email: '',
          password: 'password123',
          business_name: '',
          business_type: 'vegetable_shop',
          shop_address: '',
          city: '',
          state: 'Maharashtra',
          gst_number: ''
        });
        loadBusinesses();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      const res = await api.post('/business/save-profile', formData);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Business profile saved successfully!' });
        refreshUser();
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to save business: ' + (err.response?.data?.message || err.message) });
    } finally {
      setSaving(false);
    }
  };

  const filteredBusinesses = activeFilter === 'all'
    ? allBusinesses
    : allBusinesses.filter(b => b.business_type === activeFilter);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>{isBusinessMan ? 'My Business Registration Profile' : 'Commercial Business Master Directory (Pan-India)'}</h1>
          <p>
            {isBusinessMan
              ? 'Update your commercial establishment details for bulk vegetable deliveries and Khata credit.'
              : 'Registered Vegetable Shops, Restaurants, Messes, and Caterers across India.'}
          </p>
        </div>

        {isSuperAdmin && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={15} />
            <span>+ Onboard Shop Owner (Pan-India)</span>
          </button>
        )}
      </div>

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

      {/* If Business Man: Edit Form */}
      {isBusinessMan ? (
        <div className="card" style={{ maxWidth: '42rem' }}>
          <div className="card-header">
            <div className="card-title">
              <Store size={18} color="var(--primary)" />
              <span>Business Registration Details (from Notebook Page 2)</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Business / Shop Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Kailash Fresh Vegetables"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Business Type *</label>
                <select
                  className="form-input"
                  value={formData.business_type}
                  onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                >
                  {businessTypes.length > 0 ? (
                    businessTypes.map(bt => (
                      <option key={bt.code} value={bt.code}>{bt.name}</option>
                    ))
                  ) : (
                    <>
                      <option value="vegetable_shop">Vegetable Shop (भाजीपाला दुकान)</option>
                      <option value="restaurant">Restaurant / Hotel</option>
                      <option value="mess">Mess / Canteen (खानवळ)</option>
                      <option value="caterers">Eaters / Caterers (केटरर्स)</option>
                      <option value="other">Other Commercial Buyer</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Contact Person Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Suresh Patil"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Mobile Number *</label>
                <input
                  type="tel"
                  required
                  className="form-input"
                  placeholder="e.g. 9876543210"
                  value={formData.mobile_number}
                  onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Shop / Establishment Address *</label>
              <textarea
                rows="2"
                required
                className="form-input"
                placeholder="Shop No., Market Street, Landmark"
                value={formData.shop_address}
                onChange={(e) => setFormData({ ...formData, shop_address: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>City / Town *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Wai, Nashik, Pune"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>GST Number / APMC Trade License (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  value={formData.gst_number || ''}
                  onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
              <Save size={15} />
              <span>{saving ? 'Saving...' : 'Save Business Profile'}</span>
            </button>
          </form>
        </div>
      ) : (
        /* Admin / Delivery Directory View */
        <div>
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              ALL ({allBusinesses.length})
            </button>
            {(businessTypes.length > 0
              ? businessTypes
              : [
                  { code: 'vegetable_shop', name: 'Vegetable Shop' },
                  { code: 'restaurant', name: 'Restaurant' },
                  { code: 'mess', name: 'Mess' },
                  { code: 'caterers', name: 'Caterers' }
                ]
            ).map(bt => {
              const count = allBusinesses.filter(b => b.business_type === bt.code).length;
              return (
                <button
                  key={bt.code}
                  className={`tab-btn ${activeFilter === bt.code ? 'active' : ''}`}
                  onClick={() => setActiveFilter(bt.code)}
                >
                  {bt.name} ({count})
                </button>
              );
            })}
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Business Name</th>
                    <th>Type</th>
                    <th>Contact Person</th>
                    <th>Mobile (Login)</th>
                    <th>City / State</th>
                    <th>Shop Address</th>
                    <th>GST Number</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        Loading registered businesses...
                      </td>
                    </tr>
                  ) : filteredBusinesses.length > 0 ? (
                    filteredBusinesses.map(b => (
                      <tr key={b.id}>
                        <td><strong>{b.business_name}</strong></td>
                        <td>
                          <span className="badge badge-primary">{b.business_type?.replace('_', ' ')}</span>
                        </td>
                        <td>{b.contact_person}</td>
                        <td><code>{b.mobile_number}</code></td>
                        <td>
                          <strong>{b.city}</strong>
                          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{b.state || 'Maharashtra'}</div>
                        </td>
                        <td style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>{b.shop_address}</td>
                        <td>{b.gst_number || '—'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                        No businesses registered in this category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls (Limit: 10) */}
            <Pagination
              currentPage={bizPage}
              totalPages={bizPagination.total_pages || 1}
              totalItems={bizPagination.total || allBusinesses.length}
              pageSize={10}
              onPageChange={(p) => {
                setBizPage(p);
                loadBusinesses(p, activeFilter);
              }}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Super Admin: Onboard Shop Owner (Pan-India) Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '38rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Onboard New Shop Owner (Pan-India)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Create a commercial buyer account. The Shop Owner can log in, place bulk orders, and set their own daily store vegetable prices.
            </p>

            <form onSubmit={handleAdminCreateShopOwner} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Owner Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Ramesh Kulkarni"
                    value={newOwnerData.full_name}
                    onChange={e => setNewOwnerData({ ...newOwnerData, full_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Mobile Number (Used as Login) *</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    placeholder="e.g. 9822001122"
                    value={newOwnerData.phone}
                    onChange={e => setNewOwnerData({ ...newOwnerData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Business / Shop Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Kulkarni Fresh Vegetables"
                    value={newOwnerData.business_name}
                    onChange={e => setNewOwnerData({ ...newOwnerData, business_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Business Type *</label>
                  <select
                    className="form-input"
                    value={newOwnerData.business_type}
                    onChange={e => setNewOwnerData({ ...newOwnerData, business_type: e.target.value })}
                  >
                    {businessTypes.length > 0 ? (
                      businessTypes.map(bt => (
                        <option key={bt.code} value={bt.code}>{bt.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="vegetable_shop">Vegetable Shop (भाजीपाला दुकान)</option>
                        <option value="restaurant">Restaurant / Hotel</option>
                        <option value="mess">Mess / Canteen (खानवळ)</option>
                        <option value="caterers">Eaters / Caterers (केटरर्स)</option>
                        <option value="other">Other Commercial Buyer</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>City / Town *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Pune, Indore, Bangalore"
                    value={newOwnerData.city}
                    onChange={e => setNewOwnerData({ ...newOwnerData, city: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>State (Pan-India) *</label>
                  <select
                    className="form-input"
                    value={newOwnerData.state}
                    onChange={e => setNewOwnerData({ ...newOwnerData, state: e.target.value })}
                  >
                    {indianStates.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Shop / Mandi Stall Address *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Plot No., Main APMC Market yard, or Street address"
                  value={newOwnerData.shop_address}
                  onChange={e => setNewOwnerData({ ...newOwnerData, shop_address: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Login Password *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={newOwnerData.password}
                    onChange={e => setNewOwnerData({ ...newOwnerData, password: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>GST Number / APMC Trade ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Optional"
                    value={newOwnerData.gst_number}
                    onChange={e => setNewOwnerData({ ...newOwnerData, gst_number: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createSubmitting}
                  style={{ flex: 1.5 }}
                >
                  {createSubmitting ? 'Onboarding...' : 'Onboard & Create Shop Owner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
