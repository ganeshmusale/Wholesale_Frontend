import React, { useState, useEffect } from 'react';
import api from '../api';
import Pagination from '../components/Pagination';
import {
  Settings2,
  Layers,
  Scale,
  Building,
  Store,
  Tag,
  CreditCard,
  Plus,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2
} from 'lucide-react';

export default function MastersManager({ initialTab = 'products' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [masters, setMasters] = useState({
    units: [],
    categories: [],
    businessTypes: [],
    markets: [],
    products: [],
    paymentTypes: []
  });
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null); // 'product' | 'unit' | 'market' | 'category' | 'businessType' | 'payment'
  const [newProduct, setNewProduct] = useState({
    name: '',
    category_id: '',
    unit_id: '',
    default_bulk_min_qty: 250,
    description: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [newMarket, setNewMarket] = useState({ name: '', city: '', state: 'Maharashtra' });
  const [newUnit, setNewUnit] = useState({ name: '', symbol: '', conversion_to_kg: 1 });
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [newBusinessType, setNewBusinessType] = useState({ name: '', code: '', description: '' });
  const [editingBusinessType, setEditingBusinessType] = useState(null);

  // Registered Businesses state
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [bizLoading, setBizLoading] = useState(false);
  const [bizFilter, setBizFilter] = useState('all');
  const [bizPage, setBizPage] = useState(1);
  const [bizPagination, setBizPagination] = useState({ total_pages: 1, total: 0, limit: 10 });
  const [bizMessage, setBizMessage] = useState(null);
  const [showCreateBizModal, setShowCreateBizModal] = useState(false);
  const [createBizSubmitting, setCreateBizSubmitting] = useState(false);
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

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const fetchMasters = async () => {
    try {
      setLoading(true);
      const res = await api.get('/masters/all');
      if (res.data.success) {
        setMasters(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBusinesses = async (page = bizPage, filter = bizFilter) => {
    try {
      setBizLoading(true);
      const typeParam = filter !== 'all' ? `&business_type=${filter}` : '';
      const res = await api.get(`/business/all?page=${page}&limit=10${typeParam}`);
      if (res.data.success) {
        setAllBusinesses(res.data.data);
        if (res.data.pagination) {
          setBizPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Error loading registered businesses:', err);
    } finally {
      setBizLoading(false);
    }
  };

  useEffect(() => {
    fetchMasters();
  }, []);

  useEffect(() => {
    setBizPage(1);
    loadBusinesses(1, bizFilter);
  }, [bizFilter]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/masters/products', newProduct);
      setModalType(null);
      setNewProduct({ name: '', category_id: '', unit_id: '', default_bulk_min_qty: 250, description: '' });
      fetchMasters();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleCreateMarket = async (e) => {
    e.preventDefault();
    try {
      await api.post('/masters/markets', newMarket);
      setModalType(null);
      setNewMarket({ name: '', city: '', state: 'Maharashtra' });
      fetchMasters();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleCreateUnit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/masters/units', newUnit);
      setModalType(null);
      setNewUnit({ name: '', symbol: '', conversion_to_kg: 1 });
      fetchMasters();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/masters/categories', newCategory);
      setModalType(null);
      setNewCategory({ name: '', description: '' });
      fetchMasters();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/masters/categories/${editingCategory.id}`, {
        name: editingCategory.name,
        description: editingCategory.description
      });
      setEditingCategory(null);
      fetchMasters();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/masters/products/${editingProduct.id}`, editingProduct);
      setEditingProduct(null);
      fetchMasters();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to delete or deactivate "${product.name}"?`)) return;
    try {
      const res = await api.delete(`/masters/products/${product.id}`);
      alert(res.data.message || 'Vegetable deleted/deactivated.');
      fetchMasters();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleCreateBusinessType = async (e) => {
    e.preventDefault();
    try {
      await api.post('/masters/business-types', newBusinessType);
      setModalType(null);
      setNewBusinessType({ name: '', code: '', description: '' });
      fetchMasters();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleUpdateBusinessType = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/masters/business-types/${editingBusinessType.id}`, {
        name: editingBusinessType.name,
        code: editingBusinessType.code,
        description: editingBusinessType.description,
        is_active: editingBusinessType.is_active
      });
      setEditingBusinessType(null);
      fetchMasters();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`Are you sure you want to delete or deactivate category "${category.name}"?`)) return;
    try {
      const res = await api.delete(`/masters/categories/${category.id}`);
      alert(res.data.message || 'Category deleted/deactivated.');
      fetchMasters();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteBusinessType = async (bt) => {
    if (!window.confirm(`Are you sure you want to delete or deactivate business type "${bt.name}"?`)) return;
    try {
      const res = await api.delete(`/masters/business-types/${bt.id}`);
      alert(res.data.message || 'Business type deleted/deactivated.');
      fetchMasters();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleAdminCreateShopOwner = async (e) => {
    e.preventDefault();
    try {
      setCreateBizSubmitting(true);
      const res = await api.post('/business/admin-create-shop-owner', newOwnerData);
      if (res.data.success) {
        setBizMessage({
          type: 'success',
          text: `Shop Owner "${newOwnerData.business_name}" (${newOwnerData.city}) created! Login Phone: ${newOwnerData.phone}`
        });
        setShowCreateBizModal(false);
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
        loadBusinesses(1, bizFilter);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setCreateBizSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Master Data Management</h1>
          <p>
            Configure wholesale vegetable catalogs, registered commercial businesses, APMC market locations, units of measure, and payment terms.
          </p>
        </div>

        <div>
          {activeTab === 'products' && (
            <button className="btn btn-primary" onClick={() => setModalType('product')}>
              <Plus size={15} /> Add New Vegetable
            </button>
          )}
          {activeTab === 'businesses' && (
            <button className="btn btn-primary" onClick={() => setShowCreateBizModal(true)}>
              <Plus size={15} /> Onboard Shop Owner (Pan-India)
            </button>
          )}
          {activeTab === 'markets' && (
            <button className="btn btn-primary" onClick={() => setModalType('market')}>
              <Plus size={15} /> Add APMC Market
            </button>
          )}
          {activeTab === 'units' && (
            <button className="btn btn-primary" onClick={() => setModalType('unit')}>
              <Plus size={15} /> Add Bulk Unit
            </button>
          )}
          {activeTab === 'categories' && (
            <button className="btn btn-primary" onClick={() => setModalType('category')}>
              <Plus size={15} /> Add Category
            </button>
          )}
          {activeTab === 'businessTypes' && (
            <button className="btn btn-primary" onClick={() => setModalType('businessType')}>
              <Plus size={15} /> Add Business Type
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Vegetables Master ({masters.products.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'businesses' ? 'active' : ''}`}
          onClick={() => setActiveTab('businesses')}
        >
          Registered Businesses ({bizPagination.total || allBusinesses.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories ({masters.categories.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'businessTypes' ? 'active' : ''}`}
          onClick={() => setActiveTab('businessTypes')}
        >
          Business Types ({masters.businessTypes?.length || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === 'markets' ? 'active' : ''}`}
          onClick={() => setActiveTab('markets')}
        >
          APMC Markets ({masters.markets.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'units' ? 'active' : ''}`}
          onClick={() => setActiveTab('units')}
        >
          Units Master ({masters.units.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payment Types ({masters.paymentTypes.length})
        </button>
      </div>

      {/* Content based on Tab */}
      <div className="card">
        {activeTab === 'products' && (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Vegetable Name</th>
                  <th>Category</th>
                  <th>Default Unit</th>
                  <th>Default Bulk Min Qty</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {masters.products.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td><span className="pill-tag">{p.category_name}</span></td>
                    <td>{p.unit_name} ({p.unit_symbol})</td>
                    <td><span className="badge badge-primary">{p.default_bulk_min_qty} {p.unit_symbol}</span></td>
                    <td style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>{p.description || '—'}</td>
                    <td>
                      {p.is_active ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-danger">Inactive</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.5rem' }}
                          title="Edit Vegetable"
                          onClick={() => setEditingProduct({ ...p })}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.5rem', color: 'var(--danger)' }}
                          title="Delete / Deactivate Vegetable"
                          onClick={() => handleDeleteProduct(p)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'markets' && (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Market Name</th>
                  <th>City / Mandi Yard</th>
                  <th>State</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {masters.markets.map(m => (
                  <tr key={m.id}>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.city}</td>
                    <td>{m.state}</td>
                    <td><span className="badge badge-success">Active Mandi</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {masters.categories.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="pill-tag" style={{ fontWeight: 600 }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.description || '—'}</td>
                    <td>
                      {c.is_active ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-danger">Inactive</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.5rem' }}
                          title="Edit Category"
                          onClick={() => setEditingCategory({ ...c })}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.5rem', color: 'var(--danger)' }}
                          title="Delete / Deactivate Category"
                          onClick={() => handleDeleteCategory(c)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'businessTypes' && (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Business Type Name</th>
                  <th>System Code</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {masters.businessTypes?.map(bt => (
                  <tr key={bt.id}>
                    <td>
                      <strong>{bt.name}</strong>
                    </td>
                    <td>
                      <code>{bt.code}</code>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{bt.description || '—'}</td>
                    <td>
                      {bt.is_active ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-danger">Inactive</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.5rem' }}
                          title="Edit Business Type"
                          onClick={() => setEditingBusinessType({ ...bt })}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.5rem', color: 'var(--danger)' }}
                          title="Delete / Deactivate Business Type"
                          onClick={() => handleDeleteBusinessType(bt)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'units' && (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Unit Name</th>
                  <th>Symbol</th>
                  <th>Conversion (KG)</th>
                </tr>
              </thead>
              <tbody>
                {masters.units.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td><code>{u.symbol}</code></td>
                    <td>{u.conversion_to_kg} KG</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'businesses' && (
          <div>
            {bizMessage && (
              <div style={{
                background: bizMessage.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
                color: bizMessage.type === 'success' ? '#065f46' : '#991b1b',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius)',
                border: `1px solid ${bizMessage.type === 'success' ? '#a7f3d0' : '#fca5a5'}`,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600
              }}>
                {bizMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>{bizMessage.text}</span>
              </div>
            )}

            {/* Business Type Filter Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${bizFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setBizFilter('all')}
              >
                ALL
              </button>
              {(masters.businessTypes?.length > 0
                ? masters.businessTypes.filter(b => b.is_active)
                : [
                    { code: 'vegetable_shop', name: 'Vegetable Shop' },
                    { code: 'restaurant', name: 'Restaurant' },
                    { code: 'mess', name: 'Mess' },
                    { code: 'caterers', name: 'Caterers' }
                  ]
              ).map(bt => (
                <button
                  type="button"
                  key={bt.code}
                  className={`btn btn-sm ${bizFilter === bt.code ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setBizFilter(bt.code)}
                >
                  {bt.name}
                </button>
              ))}
            </div>

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
                  {bizLoading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        Loading registered businesses...
                      </td>
                    </tr>
                  ) : allBusinesses.length > 0 ? (
                    allBusinesses.map(b => (
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

            <Pagination
              currentPage={bizPage}
              totalPages={bizPagination.total_pages || 1}
              totalItems={bizPagination.total || allBusinesses.length}
              pageSize={10}
              onPageChange={(p) => {
                setBizPage(p);
                loadBusinesses(p, bizFilter);
              }}
              loading={bizLoading}
            />
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Payment Type</th>
                  <th>Code</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {masters.paymentTypes.map(pt => (
                  <tr key={pt.id}>
                    <td><strong>{pt.name}</strong></td>
                    <td><code>{pt.code}</code></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{pt.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Onboard New Shop Owner (Pan-India) Modal */}
      {showCreateBizModal && (
        <div className="modal-overlay" onClick={() => setShowCreateBizModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '38rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Onboard New Shop Owner (Pan-India)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Create a commercial buyer account. The Shop Owner can log in with their mobile number and place bulk orders.
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
                    {masters.businessTypes?.filter(b => b.is_active).length > 0 ? (
                      masters.businessTypes.filter(b => b.is_active).map(bt => (
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

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateBizModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createBizSubmitting}
                  style={{ flex: 1.5 }}
                >
                  {createBizSubmitting ? 'Onboarding...' : 'Onboard & Create Shop Owner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {modalType === 'product' && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Add New Vegetable Master</h3>
            <form onSubmit={handleCreateProduct}>
              <div className="form-group">
                <label>Vegetable Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Potato (Batata - Agra)"
                  value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  required
                  className="form-input"
                  value={newProduct.category_id}
                  onChange={e => setNewProduct({ ...newProduct, category_id: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {masters.categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Primary Bulk Unit *</label>
                <select
                  required
                  className="form-input"
                  value={newProduct.unit_id}
                  onChange={e => setNewProduct({ ...newProduct, unit_id: e.target.value })}
                >
                  <option value="">Select Unit</option>
                  {masters.units.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Default Bulk Minimum Quantity *</label>
                <input
                  type="number"
                  required
                  step="10"
                  className="form-input"
                  value={newProduct.default_bulk_min_qty}
                  onChange={e => setNewProduct({ ...newProduct, default_bulk_min_qty: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description / Grade Details</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 50kg sorting bag"
                  value={newProduct.description}
                  onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Vegetable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Market Modal */}
      {modalType === 'market' && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Add APMC Market</h3>
            <form onSubmit={handleCreateMarket}>
              <div className="form-group">
                <label>Market Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Wai APMC Market"
                  value={newMarket.name}
                  onChange={e => setNewMarket({ ...newMarket, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>City / Location *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Wai"
                  value={newMarket.city}
                  onChange={e => setNewMarket({ ...newMarket, city: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Market
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Unit Modal */}
      {modalType === 'unit' && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Add Bulk Unit</h3>
            <form onSubmit={handleCreateUnit}>
              <div className="form-group">
                <label>Unit Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Quintal"
                  value={newUnit.name}
                  onChange={e => setNewUnit({ ...newUnit, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Symbol *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. qtl"
                  value={newUnit.symbol}
                  onChange={e => setNewUnit({ ...newUnit, symbol: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Equivalent in KG</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={newUnit.conversion_to_kg}
                  onChange={e => setNewUnit({ ...newUnit, conversion_to_kg: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {modalType === 'category' && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Add Category</h3>
            <form onSubmit={handleCreateCategory}>
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Exotic Vegetables"
                  value={newCategory.name}
                  onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Broccoli, Zucchini, Baby Corn"
                  value={newCategory.description}
                  onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="modal-overlay" onClick={() => setEditingCategory(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Edit Category</h3>
            <form onSubmit={handleUpdateCategory}>
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editingCategory.name}
                  onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingCategory.description || ''}
                  onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingCategory(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Update Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product / Vegetable Modal */}
      {editingProduct && (
        <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Edit Vegetable Master</h3>
            <form onSubmit={handleUpdateProduct}>
              <div className="form-group">
                <label>Vegetable Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  required
                  className="form-input"
                  value={editingProduct.category_id}
                  onChange={e => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                >
                  {masters.categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Primary Bulk Unit *</label>
                <select
                  required
                  className="form-input"
                  value={editingProduct.unit_id}
                  onChange={e => setEditingProduct({ ...editingProduct, unit_id: e.target.value })}
                >
                  {masters.units.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Default Bulk Minimum Quantity *</label>
                <input
                  type="number"
                  required
                  step="10"
                  className="form-input"
                  value={editingProduct.default_bulk_min_qty}
                  onChange={e => setEditingProduct({ ...editingProduct, default_bulk_min_qty: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description / Grade Details</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingProduct.description || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingProduct(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Update Vegetable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Business Type Modal */}
      {modalType === 'businessType' && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Add Commercial Business Type</h3>
            <form onSubmit={handleCreateBusinessType}>
              <div className="form-group">
                <label>Business Type Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Supermarket / Mart (सुपरमार्केट)"
                  value={newBusinessType.name}
                  onChange={e => setNewBusinessType({ ...newBusinessType, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>System Code / Identifier (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. supermarket (auto-generated if blank)"
                  value={newBusinessType.code}
                  onChange={e => setNewBusinessType({ ...newBusinessType, code: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Modern retail grocery chains & supermarkets"
                  value={newBusinessType.description}
                  onChange={e => setNewBusinessType({ ...newBusinessType, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Business Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Business Type Modal */}
      {editingBusinessType && (
        <div className="modal-overlay" onClick={() => setEditingBusinessType(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Edit Business Type</h3>
            <form onSubmit={handleUpdateBusinessType}>
              <div className="form-group">
                <label>Business Type Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editingBusinessType.name}
                  onChange={e => setEditingBusinessType({ ...editingBusinessType, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>System Code</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editingBusinessType.code}
                  onChange={e => setEditingBusinessType({ ...editingBusinessType, code: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingBusinessType.description || ''}
                  onChange={e => setEditingBusinessType({ ...editingBusinessType, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingBusinessType(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Update Business Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
