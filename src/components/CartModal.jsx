import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingCart,
  X,
  Trash2,
  CheckCircle2,
  Calendar,
  CreditCard,
  MapPin,
  AlertCircle
} from 'lucide-react';

export default function CartModal({ isOpen, onClose, onOrderPlaced }) {
  const { user, isBusinessMan } = useAuth();
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();

  const [paymentTypes, setPaymentTypes] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setOrderSuccess(null);
      setError(null);
      api.get('/masters/payment-types')
        .then(res => {
          if (res.data.success && res.data.data.length > 0) {
            setPaymentTypes(res.data.data);
            setSelectedPayment(res.data.data[0].id);
          }
        })
        .catch(console.error);

      // Pre-fill delivery address from user's business profile
      if (user?.shop_address) {
        setDeliveryAddress(`${user.shop_address}, ${user.city}`);
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        payment_type_id: selectedPayment,
        delivery_address: deliveryAddress || 'Store Mandi Address',
        delivery_date: deliveryDate,
        notes,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          unit_id: item.unit_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      };

      const res = await api.post('/orders', payload);
      if (res.data.success) {
        setOrderSuccess(res.data.data);
        clearCart();
        if (onOrderPlaced) onOrderPlaced();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '38rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingCart size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Wholesale Bulk Cart</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {orderSuccess ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ width: '4rem', height: '4rem', background: 'var(--success-light)', color: 'var(--success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Bulk Order Placed Successfully!
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Your order number is <strong style={{ color: 'var(--primary)' }}>{orderSuccess.order_number}</strong>.
            </p>
            <div style={{ background: 'var(--page-bg)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', display: 'inline-block' }}>
              <div>Total Order Value: <strong>₹{parseFloat(orderSuccess.total_amount).toLocaleString('en-IN')}</strong></div>
              <div>Items Count: <strong>{orderSuccess.items_count} Vegetables</strong></div>
            </div>
            <div>
              <button className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>
                Done & Track Delivery
              </button>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <ShoppingCart size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>Your bulk vegetable cart is empty.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.35rem' }}>
              Browse the catalog and add wholesale produce (e.g. 250kg bags).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder}>
            {error && (
              <div style={{ background: 'var(--danger-light)', color: '#991b1b', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.825rem' }}>
                <AlertCircle size={15} style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
                {error}
              </div>
            )}

            {/* Line Items Table */}
            <div className="table-responsive" style={{ maxHeight: '16rem', overflowY: 'auto', marginBottom: '1rem' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Vegetable</th>
                    <th>Rate</th>
                    <th style={{ width: '8.5rem' }}>Quantity</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map(item => (
                    <tr key={item.product_id}>
                      <td>
                        <strong>{item.vegetable_name}</strong>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Min: {item.min_bulk_qty} {item.unit_symbol}
                        </div>
                      </td>
                      <td>₹{item.unit_price.toFixed(2)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <input
                            type="number"
                            step="10"
                            min={item.min_bulk_qty}
                            className="form-input"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.product_id, e.target.value)}
                            style={{ padding: '0.25rem 0.4rem', fontSize: '0.85rem' }}
                          />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.unit_symbol}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        ₹{item.total_price.toLocaleString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product_id)}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Banner */}
            <div style={{ background: 'var(--page-bg)', padding: '0.875rem 1rem', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Estimated Bulk Total:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                ₹{cartTotal.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Delivery & Payment Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
              <div className="form-group">
                <label>Payment Terms *</label>
                <select
                  required
                  className="form-input"
                  value={selectedPayment}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                >
                  {paymentTypes.map(pt => (
                    <option key={pt.id} value={pt.id}>{pt.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Requested Delivery Date *</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Delivery Destination / Shop Address *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Shop address, Mandi stall, or Kitchen location"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Special Instructions / Procurement Notes</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Medium size sorting, dispatch early morning 6 AM"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                Continue Shopping
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1.5 }}>
                {submitting ? 'Placing Order...' : `Confirm Bulk Order (₹${cartTotal.toLocaleString('en-IN')})`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
