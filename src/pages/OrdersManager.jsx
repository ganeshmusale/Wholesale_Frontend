import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  IndianRupee,
  Calendar,
  AlertCircle,
  Eye,
  ChevronDown,
  MapPin,
  Navigation,
  ThumbsUp,
  ThumbsDown,
  XCircle,
  Edit2,
  Save,
  Trash2,
  Plus
} from 'lucide-react';

export default function OrdersManager() {
  const { user, isSuperAdmin, isDelivery, isBusinessMan } = useAuth();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryUsers, setDeliveryUsers] = useState([]);
  const [paymentModal, setPaymentModal] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({ total_pages: 1, total: 0, limit: 10 });

  // Order Edit Modal state for Shop Owner / Admin
  const [editModal, setEditModal] = useState(null);
  const [editItems, setEditItems] = useState([]);
  const [editAddress, setEditAddress] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);

  const fetchOrders = async (page = currentPage, tab = activeTab) => {
    try {
      setLoading(true);
      const statusParam = (tab !== 'all' && tab !== 'pending_requests') ? `&status=${tab}` : '';
      const res = await api.get(`/orders?page=${page}&limit=10${statusParam}`);
      if (res.data.success) {
        setOrders(res.data.data);
        if (res.data.pagination) {
          setPaginationMeta(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchOrders(1, activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (isSuperAdmin) {
      api.get('/auth/users?role=delivery&limit=all')
        .then(res => {
          if (res.data.success) setDeliveryUsers(res.data.data);
        })
        .catch(err => console.error(err));
    }
  }, [isSuperAdmin]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchOrders(newPage, activeTab);
  };

  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { order_status: newStatus });
      fetchOrders();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAssignDelivery = async (orderId, deliveryUserId) => {
    try {
      await api.put(`/orders/${orderId}/status`, {
        delivery_user_id: deliveryUserId || null,
        order_status: deliveryUserId ? 'procurement' : 'placed'
      });
      fetchOrders();
    } catch (err) {
      alert('Failed to assign delivery: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeliveryResponse = async (orderId, action, reason = '') => {
    try {
      const res = await api.put(`/orders/${orderId}/respond-delivery`, {
        action,
        rejection_reason: reason
      });
      if (res.data.success) {
        setRejectModal(null);
        setRejectReason('');
        fetchOrders();
      }
    } catch (err) {
      alert('Action failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentModal || !payAmount) return;

    try {
      await api.post(`/orders/${paymentModal.id}/payment`, {
        amount_paid: parseFloat(payAmount)
      });
      setPaymentModal(null);
      setPayAmount('');
      fetchOrders();
    } catch (err) {
      alert('Failed to record payment: ' + (err.response?.data?.message || err.message));
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      if (res.data.success) {
        setSelectedOrder(res.data.data);
      } else {
        alert(res.data.message || 'Failed to load order details.');
      }
    } catch (err) {
      alert('Failed to load order details: ' + (err.response?.data?.message || err.message));
    }
  };

  const openEditModal = async (orderId) => {
    try {
      setEditError(null);
      const [orderRes, prodsRes] = await Promise.all([
        api.get(`/orders/${orderId}`),
        api.get('/rates/today')
      ]);

      if (orderRes.data.success) {
        const order = orderRes.data.data;
        setEditModal(order);
        setEditAddress(order.delivery_address || '');
        setEditNotes(order.notes || '');

        // Map order items to editable format
        const items = (order.items || []).map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          unit_symbol: item.unit_symbol,
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price),
          min_bulk_qty: parseFloat(item.min_bulk_qty || 50)
        }));
        setEditItems(items);
      }

      if (prodsRes.data.success) {
        setAvailableProducts(prodsRes.data.data || []);
      }
    } catch (err) {
      alert('Failed to load order for editing: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateItemQty = (productId, delta) => {
    setEditItems(prev => prev.map(item => {
      if (item.product_id === productId) {
        const newQty = Math.max(item.min_bulk_qty || 50, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleDirectQtyChange = (productId, val) => {
    const parsed = parseFloat(val);
    setEditItems(prev => prev.map(item => {
      if (item.product_id === productId) {
        return { ...item, quantity: isNaN(parsed) ? (item.min_bulk_qty || 50) : parsed };
      }
      return item;
    }));
  };

  const handleRemoveEditItem = (productId) => {
    if (editItems.length <= 1) {
      alert('Order must contain at least 1 vegetable.');
      return;
    }
    setEditItems(prev => prev.filter(i => i.product_id !== productId));
  };

  const handleAddProductToEdit = (prod) => {
    if (editItems.find(i => i.product_id === prod.product_id)) {
      alert('This vegetable is already in the order. Adjust its quantity instead.');
      return;
    }
    const minQty = parseFloat(prod.min_bulk_qty || 50);
    setEditItems(prev => [
      ...prev,
      {
        product_id: prod.product_id,
        product_name: prod.vegetable_name,
        unit_symbol: prod.unit_symbol,
        quantity: minQty,
        unit_price: parseFloat(prod.wholesale_price),
        min_bulk_qty: minQty
      }
    ]);
  };

  const handleSaveOrderEdit = async (e) => {
    e.preventDefault();
    if (!editModal) return;
    try {
      setEditSaving(true);
      setEditError(null);

      const payload = {
        items: editItems.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        delivery_address: editAddress,
        notes: editNotes
      };

      const res = await api.put(`/orders/${editModal.id}/edit`, payload);
      if (res.data.success) {
        setEditModal(null);
        fetchOrders();
      }
    } catch (err) {
      setEditError(err.response?.data?.message || err.message);
    } finally {
      setEditSaving(false);
    }
  };

  const filteredOrders = activeTab === 'all'
    ? orders
    : activeTab === 'pending_requests'
      ? orders.filter(o => o.delivery_request_status === 'pending')
      : orders.filter(o => o.order_status === activeTab);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'placed': return <span className="badge badge-primary">Placed</span>;
      case 'confirmed': return <span className="badge badge-info">Confirmed</span>;
      case 'procurement': return <span className="badge badge-warning">Procuring at APMC</span>;
      case 'out_for_delivery': return <span className="badge badge-warning" style={{ background: '#e0e7ff', color: '#4338ca' }}>Out for Delivery</span>;
      case 'delivered': return <span className="badge badge-success">Delivered</span>;
      case 'cancelled': return <span className="badge badge-danger">Cancelled</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const getDeliveryRequestBadge = (reqStatus, rejectionReason) => {
    switch (reqStatus) {
      case 'pending':
        return (
          <span className="badge badge-warning" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
            ⏳ Request Pending
          </span>
        );
      case 'accepted':
        return (
          <span className="badge badge-success" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
            ✓ Request Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="badge badge-danger" title={rejectionReason || 'Rejected by partner'} style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>
            ✕ Request Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>{isBusinessMan ? 'My Bulk Vegetable Orders' : 'Bulk Orders & Delivery Operations'}</h1>
          <p>
            Track bulk procurement from APMC, delivery progression, and Khata (Credit) payments.
          </p>
        </div>
      </div>

      {/* Delivery Partner Live Notification Banner */}
      {isDelivery && (
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
          color: '#ffffff',
          borderRadius: 'var(--radius)',
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          border: '1px solid rgba(129, 140, 248, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#4f46e5', padding: '0.6rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                Delivery Partner Portal: {user?.full_name}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#c7d2fe' }}>
                Assigned Orders: <strong>{orders.filter(o => o.delivery_user_id === user?.id).length}</strong> &bull; Pending Decision: <strong style={{ color: '#fef08a' }}>{orders.filter(o => o.delivery_request_status === 'pending').length}</strong> &bull; Base Hub: <strong>{user?.city || 'Wai'}</strong>
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.12)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
            ⚡ Admin sends delivery requests directly to your portal. You decide to Accept or Reject!
          </div>
        </div>
      )}

      {/* Admin Nearby Dispatching Hint */}
      {isSuperAdmin && (
        <div style={{
          background: '#f8fafc',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius)',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.825rem',
          color: 'var(--text-secondary)'
        }}>
          <Navigation size={16} color="var(--primary)" />
          <span>
            <strong>Smart Dispatching:</strong> When assigning orders, delivery partners located in the same city as the shop (e.g. Wai, Nashik, Pune) are marked with <strong style={{ color: 'var(--primary)' }}>📍 [NEARBY]</strong> and sorted first.
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-header">
        {isDelivery ? (
          [
            { key: 'all', label: 'All My Orders' },
            { key: 'pending_requests', label: 'Incoming Requests (Pending Decision)' },
            { key: 'out_for_delivery', label: 'Out for Delivery' },
            { key: 'delivered', label: 'Delivered' }
          ].map(t => (
            <button
              key={t.key}
              className={`tab-btn ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label} ({
                t.key === 'pending_requests'
                  ? orders.filter(o => o.delivery_request_status === 'pending').length
                  : orders.filter(o => t.key === 'all' || o.order_status === t.key).length
              })
            </button>
          ))
        ) : (
          ['all', 'placed', 'procurement', 'out_for_delivery', 'delivered'].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.replace(/_/g, ' ').toUpperCase()} ({orders.filter(o => tab === 'all' || o.order_status === tab).length})
            </button>
          ))
        )}
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Business Name</th>
                <th>Type</th>
                <th>Order Date</th>
                <th>Total Amount</th>
                <th>Payment Mode</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Delivery Person</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    Loading bulk orders...
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map(ord => (
                  <tr key={ord.id}>
                    <td>
                      <strong style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => viewOrderDetails(ord.id)}>
                        {ord.order_number}
                      </strong>
                    </td>
                    <td>
                      <strong>{ord.business_name}</strong>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{ord.city}</div>
                    </td>
                    <td>
                      <span className="pill-tag">{ord.business_type?.replace('_', ' ')}</span>
                    </td>
                    <td style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                      {new Date(ord.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.9rem' }}>₹{parseFloat(ord.total_amount).toLocaleString('en-IN')}</strong>
                      {parseFloat(ord.paid_amount) > 0 && parseFloat(ord.paid_amount) < parseFloat(ord.total_amount) && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--warning)' }}>
                          Paid: ₹{parseFloat(ord.paid_amount)}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="pill-tag">{ord.payment_type_name}</span>
                    </td>
                    <td>
                      <span className={`badge ${ord.payment_status === 'paid' ? 'badge-success' : ord.payment_status === 'partial' ? 'badge-warning' : 'badge-danger'}`}>
                        {ord.payment_status?.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div>
                        {getStatusBadge(ord.order_status)}
                        {ord.delivery_request_status && (
                          <div style={{ marginTop: '0.25rem' }}>
                            {getDeliveryRequestBadge(ord.delivery_request_status, ord.rejection_reason)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {isSuperAdmin && ord.order_status !== 'delivered' && ord.order_status !== 'cancelled' ? (
                        <div>
                          <select
                            className="form-input"
                            style={{
                              padding: '0.3rem 0.5rem',
                              fontSize: '0.75rem',
                              width: '11.5rem',
                              borderColor: ord.delivery_user_id ? 'var(--card-border)' : '#f59e0b',
                              background: ord.delivery_user_id ? '#fff' : '#fffbeb'
                            }}
                            value={ord.delivery_user_id || ''}
                            onChange={(e) => handleAssignDelivery(ord.id, e.target.value)}
                          >
                            <option value="">⚡ Assign Delivery Partner...</option>
                            {/* Sort nearby partners matching the shop city first */}
                            {[...deliveryUsers]
                              .sort((a, b) => {
                                const aMatches = (a.city || a.user_city)?.toLowerCase() === ord.city?.toLowerCase() ? -1 : 1;
                                const bMatches = (b.city || b.user_city)?.toLowerCase() === ord.city?.toLowerCase() ? -1 : 1;
                                return aMatches - bMatches;
                              })
                              .map(d => {
                                const partnerCity = d.city || d.user_city || '';
                                const isNearby = partnerCity && ord.city && partnerCity.toLowerCase() === ord.city.toLowerCase();
                                return (
                                  <option key={d.id} value={d.id}>
                                    {isNearby ? `📍 [NEARBY - ${partnerCity}] ` : partnerCity ? `[${partnerCity}] ` : ''}{d.full_name}
                                  </option>
                                );
                              })}
                          </select>
                          {ord.city && (
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <MapPin size={10} color="#6366f1" />
                              <span>Destination: <strong>{ord.city}</strong></span>
                            </div>
                          )}
                          {ord.delivery_request_status === 'pending' && (
                            <div style={{ fontSize: '0.68rem', color: '#b45309', marginTop: '0.15rem', fontWeight: 600 }}>
                              📨 Request sent to partner (awaiting decision)
                            </div>
                          )}
                          {ord.delivery_request_status === 'rejected' && (
                            <div style={{ fontSize: '0.68rem', color: '#b91c1c', marginTop: '0.15rem', fontWeight: 600 }}>
                              ⚠️ Partner rejected: {ord.rejection_reason || 'Reassign nearby'}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span style={{ fontSize: '0.8rem', fontWeight: ord.delivery_person_name ? 600 : 400, color: ord.delivery_person_name ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                            {ord.delivery_person_name || 'Unassigned'}
                          </span>
                          {ord.delivery_person_phone && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              📞 {ord.delivery_person_phone}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => viewOrderDetails(ord.id)}
                          title="View order details"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>

                        {/* Business Man / Admin: Edit Order (Allowed when placed or confirmed) */}
                        {(isBusinessMan || isSuperAdmin) && ['placed', 'confirmed'].includes(ord.order_status) && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => openEditModal(ord.id)}
                            title="Edit order quantities or details"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                        )}

                        {/* Delivery Partner: Accept or Reject incoming request from Admin */}
                        {isDelivery && ord.delivery_request_status === 'pending' && (
                          <>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleDeliveryResponse(ord.id, 'accept')}
                              title="Accept this delivery request"
                              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: 700 }}
                            >
                              <ThumbsUp size={12} />
                              <span>Accept</span>
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setRejectModal(ord)}
                              title="Reject this delivery request"
                              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: 700 }}
                            >
                              <ThumbsDown size={12} />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {/* Delivery Partner / Admin status advancement once accepted */}
                        {ord.delivery_request_status === 'accepted' && (
                          <>
                            {ord.order_status !== 'out_for_delivery' && ord.order_status !== 'delivered' && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleStatusUpdate(ord.id, 'out_for_delivery')}
                                title="Mark order out for delivery"
                              >
                                <Truck size={12} />
                                <span>Dispatch</span>
                              </button>
                            )}

                            {ord.order_status === 'out_for_delivery' && (
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleStatusUpdate(ord.id, 'delivered')}
                                title="Mark as delivered to shop"
                              >
                                <CheckCircle2 size={12} />
                                <span>Delivered</span>
                              </button>
                            )}
                          </>
                        )}

                        {(isSuperAdmin || isDelivery) && ord.payment_status !== 'paid' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setPaymentModal(ord);
                              setPayAmount((parseFloat(ord.total_amount) - parseFloat(ord.paid_amount || 0)).toString());
                            }}
                            title="Record Khata payment"
                          >
                            <IndianRupee size={12} />
                            <span>Collect</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>
                    No orders found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={paginationMeta.total_pages || 1}
          totalItems={paginationMeta.total || orders.length}
          pageSize={10}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '36rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--card-border)' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Order: {selectedOrder.order_number}</h3>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  Placed on {new Date(selectedOrder.created_at).toLocaleString('en-IN')}
                </p>
              </div>
              <div>{getStatusBadge(selectedOrder.order_status)}</div>
            </div>

            <div style={{ background: 'var(--page-bg)', padding: '0.875rem', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.825rem' }}>
              <div><strong>Customer / Business:</strong> {selectedOrder.business_name} ({selectedOrder.contact_person})</div>
              <div><strong>Mobile:</strong> {selectedOrder.mobile_number}</div>
              <div><strong>Delivery Address:</strong> {selectedOrder.delivery_address}</div>
              <div><strong>Payment Mode:</strong> {selectedOrder.payment_type_name}</div>
            </div>

            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Procured Vegetables Line Items</h4>
            <div className="table-responsive" style={{ marginBottom: '1rem' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Vegetable</th>
                    <th>Quantity</th>
                    <th>Wholesale Rate</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map(item => (
                    <tr key={item.id}>
                      <td><strong>{item.product_name}</strong></td>
                      <td>{parseFloat(item.quantity)} {item.unit_symbol}</td>
                      <td>₹{parseFloat(item.unit_price).toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        ₹{parseFloat(item.total_price).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--card-border)', paddingTop: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem' }}>
                Payment: <strong style={{ textTransform: 'uppercase' }}>{selectedOrder.payment_status}</strong> (Paid ₹{parseFloat(selectedOrder.paid_amount || 0).toLocaleString('en-IN')})
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                Total: ₹{parseFloat(selectedOrder.total_amount).toLocaleString('en-IN')}
              </div>
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => setSelectedOrder(null)}
              style={{ width: '100%', marginTop: '1.25rem' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentModal && (
        <div className="modal-overlay" onClick={() => setPaymentModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '26rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Collect Payment (Cash / Khata)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Order: {paymentModal.order_number} — Total: ₹{paymentModal.total_amount}
            </p>

            <form onSubmit={handleRecordPayment}>
              <div className="form-group">
                <label>Amount Received (₹):</label>
                <input
                  type="number"
                  step="1"
                  required
                  className="form-input"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setPaymentModal(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success" style={{ flex: 1 }}>
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Modal for Delivery Partner */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '28rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.5rem', borderRadius: '50%' }}>
                <XCircle size={20} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Decline Delivery Request
              </h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Are you sure you want to decline Order <strong>{rejectModal.order_number}</strong> ({rejectModal.business_name}, {rejectModal.city})? Admin will reassign this order to another nearby partner.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleDeliveryResponse(rejectModal.id, 'reject', rejectReason);
            }}>
              <div className="form-group">
                <label style={{ fontSize: '0.825rem', fontWeight: 600 }}>Reason for Declining (Optional):</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Vehicle full / Out of service area / Unavailable"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setRejectModal(null)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                >
                  Confirm Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Order Modal (Business Man / Admin) */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '44rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--card-border)' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                  Edit Bulk Order: {editModal.order_number}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  Update vegetable quantities, delivery address, or procurement notes before dispatch.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setEditModal(null)}
                style={{ padding: '0.35rem 0.6rem' }}
              >
                ✕ Close
              </button>
            </div>

            {editError && (
              <div style={{ background: 'var(--danger-light)', color: '#991b1b', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveOrderEdit}>
              {/* Order Items Table */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Order Vegetable Items ({editItems.length})
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Authoritative APMC daily rates applied
                  </span>
                </div>

                <div className="table-responsive" style={{ border: '1px solid var(--card-border)', borderRadius: 'var(--radius)' }}>
                  <table className="custom-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Vegetable</th>
                        <th>Rate</th>
                        <th style={{ textAlign: 'center' }}>Quantity</th>
                        <th>Line Total</th>
                        <th style={{ textAlign: 'center' }}>Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editItems.map(item => {
                        const lineTotal = (item.quantity * item.unit_price).toFixed(0);
                        return (
                          <tr key={item.product_id}>
                            <td>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.product_name}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                Min Bulk: {item.min_bulk_qty} {item.unit_symbol}
                              </div>
                            </td>
                            <td>
                              <strong>₹{item.unit_price.toFixed(2)}</strong>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}> /{item.unit_symbol}</span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => handleUpdateItemQty(item.product_id, -50)}
                                  disabled={item.quantity <= (item.min_bulk_qty || 50)}
                                  style={{ padding: '0.2rem 0.45rem' }}
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  step="10"
                                  min={item.min_bulk_qty || 50}
                                  className="form-input"
                                  value={item.quantity}
                                  onChange={(e) => handleDirectQtyChange(item.product_id, e.target.value)}
                                  style={{ width: '4.5rem', textAlign: 'center', fontWeight: 700, padding: '0.25rem', fontSize: '0.85rem' }}
                                />
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                  {item.unit_symbol}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => handleUpdateItemQty(item.product_id, 50)}
                                  style={{ padding: '0.2rem 0.45rem' }}
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td>
                              <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                ₹{Number(lineTotal).toLocaleString('en-IN')}
                              </strong>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleRemoveEditItem(item.product_id)}
                                title="Remove vegetable from order"
                                style={{ padding: '0.25rem 0.4rem', color: '#dc2626' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Add more vegetables dropdown */}
                {availableProducts.filter(p => !editItems.some(i => i.product_id === p.product_id)).length > 0 && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <select
                      className="form-input"
                      id="addVegetableSelect"
                      defaultValue=""
                      onChange={(e) => {
                        const pid = parseInt(e.target.value, 10);
                        const found = availableProducts.find(p => p.product_id === pid);
                        if (found) {
                          handleAddProductToEdit(found);
                          e.target.value = '';
                        }
                      }}
                      style={{ fontSize: '0.85rem', flex: 1 }}
                    >
                      <option value="" disabled>+ Add another vegetable to this order...</option>
                      {availableProducts
                        .filter(p => !editItems.some(i => i.product_id === p.product_id))
                        .map(p => (
                          <option key={p.product_id} value={p.product_id}>
                            {p.vegetable_name} ({p.category_name}) — ₹{parseFloat(p.wholesale_price).toFixed(2)}/{p.unit_symbol} (Min {p.min_bulk_qty || 50}{p.unit_symbol})
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Delivery Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.825rem', fontWeight: 600 }}>Delivery Address:</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.825rem', fontWeight: 600 }}>Procurement Notes / Instructions:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Early morning delivery preferred"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Total Summary Banner */}
              <div style={{
                background: 'var(--page-bg)',
                padding: '0.875rem 1.25rem',
                borderRadius: 'var(--radius)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                border: '1px solid var(--card-border)'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>REVISED TOTAL BILL</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                    ₹{editItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Total Items: <strong>{editItems.length}</strong> &bull; Total Volume: <strong>{editItems.reduce((sum, item) => sum + item.quantity, 0)} Units</strong>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditModal(null)}
                  disabled={editSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={editSaving || editItems.length === 0}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
                >
                  <Save size={15} />
                  <span>{editSaving ? 'Saving Changes...' : 'Save & Update Order'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
