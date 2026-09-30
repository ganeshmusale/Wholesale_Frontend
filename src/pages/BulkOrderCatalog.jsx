import React, { useState, useEffect } from 'react';
import api from '../api';
import { useCart } from '../context/CartContext';
import Pagination from '../components/Pagination';
import {
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle,
  Filter,
  ShoppingCart,
  Calendar,
  AlertCircle,
  Table as TableIcon,
  LayoutGrid
} from 'lucide-react';

export default function BulkOrderCatalog({ onOpenCart }) {
  const { addToCart } = useCart();
  const [rates, setRates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [rateDate, setRateDate] = useState('');
  const [addedItem, setAddedItem] = useState(null);
  const [catalogPage, setCatalogPage] = useState(1);
  const [viewMode, setViewMode] = useState('table'); // Default in table form as requested
  const pageSize = 10;

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const [ratesRes, catsRes] = await Promise.all([
          api.get('/rates/today'),
          api.get('/masters/categories')
        ]);

        let catalogRates = [];
        if (ratesRes.data.success) {
          catalogRates = ratesRes.data.data;
          setRates(catalogRates);
          setRateDate(ratesRes.data.rate_date);

          // Initialize default quantities to min_bulk_qty (e.g. 250kg)
          const initialQty = {};
          catalogRates.forEach(item => {
            initialQty[item.product_id] = parseFloat(item.min_bulk_qty || 50);
          });
          setQuantities(initialQty);
        }

        // Dynamically get all active categories from DB masters
        if (catsRes.data.success) {
          const activeMasterCats = catsRes.data.data
            .filter(c => c.is_active)
            .map(c => c.name);
          // Combine with any categories present in products
          const productCats = catalogRates.map(item => item.category_name);
          const combined = Array.from(new Set([...activeMasterCats, ...productCats])).filter(Boolean);
          setCategories(combined);
        }
      } catch (err) {
        console.error('Failed to load catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  const handleQtyChange = (productId, minQty, delta) => {
    setQuantities(prev => {
      const current = prev[productId] || minQty;
      const updated = Math.max(current + delta, minQty);
      return { ...prev, [productId]: updated };
    });
  };

  const handleDirectQtyInput = (productId, minQty, val) => {
    const parsed = parseFloat(val);
    setQuantities(prev => ({
      ...prev,
      [productId]: isNaN(parsed) ? minQty : parsed
    }));
  };

  const handleAddToCart = (product) => {
    const minQty = parseFloat(product.min_bulk_qty || 50);
    const qty = quantities[product.product_id] || minQty;
    const finalQty = Math.max(qty, minQty);

    addToCart(product, finalQty);
    setAddedItem({ name: product.vegetable_name, qty: finalQty, unit: product.unit_symbol });
    setTimeout(() => setAddedItem(null), 3000);
  };

  const filteredRates = activeCategory === 'all'
    ? rates
    : rates.filter(r => r.category_name === activeCategory);

  const totalCatalogPages = Math.max(1, Math.ceil(filteredRates.length / pageSize));
  const paginatedRates = filteredRates.slice((catalogPage - 1) * pageSize, catalogPage * pageSize);

  const handleCategorySelect = (cat) => {
    setActiveCategory(cat);
    setCatalogPage(1);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Bulk Vegetable Wholesale Catalog</h1>
          <p>
            Daily fresh bulk arrivals directly from APMC mandi farmers. Minimum order quantity applicable per item.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* View Mode Toggle: Table (Default) vs Grid */}
          <div style={{
            display: 'inline-flex',
            background: 'var(--page-bg)',
            padding: '0.25rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--card-border)',
            gap: '0.25rem'
          }}>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: viewMode === 'table' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
              title="Table View (Default)"
            >
              <TableIcon size={14} />
              <span>Table View</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: viewMode === 'grid' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
              title="Card Grid View"
            >
              <LayoutGrid size={14} />
              <span>Card Grid</span>
            </button>
          </div>

          <span className="badge badge-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            <Calendar size={14} /> Active Date: {rateDate || 'Today'}
          </span>
          <button className="btn btn-primary" onClick={onOpenCart}>
            <ShoppingCart size={15} />
            <span>Review Bulk Cart</span>
          </button>
        </div>
      </div>

      {/* Added notice */}
      {addedItem && (
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
          <CheckCircle size={18} color="var(--success)" />
          <span>Added {addedItem.qty} {addedItem.unit} of {addedItem.name} to bulk order!</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => handleCategorySelect('all')}
        >
          All Vegetables ({rates.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => handleCategorySelect(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Display (Table by default, or Card Grid) */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading daily wholesale vegetable catalog...
        </div>
      ) : (
        <>
          {viewMode === 'table' ? (
            /* Table Form View (Default) */
            <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.25rem' }}>
              <div className="table-responsive">
                <table className="custom-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Vegetable</th>
                      <th>Category</th>
                      <th>Wholesale Rate</th>
                      <th>Minimum Bulk</th>
                      <th style={{ textAlign: 'center' }}>Quantity</th>
                      <th>Line Total</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRates.length > 0 ? (
                      paginatedRates.map(prod => {
                        const minQty = parseFloat(prod.min_bulk_qty || 50);
                        const currentQty = quantities[prod.product_id] || minQty;
                        const price = parseFloat(prod.wholesale_price);
                        const totalLineCost = (currentQty * price).toFixed(0);

                        return (
                          <tr key={prod.product_id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                    {prod.vegetable_name}
                                  </div>
                                  {prod.notes && (
                                    <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                                      {prod.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="pill-tag">{prod.category_name}</span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.05rem' }}>
                                ₹{price.toFixed(2)}
                                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}> /{prod.unit_symbol}</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                {minQty} {prod.unit_symbol}
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => handleQtyChange(prod.product_id, minQty, -50)}
                                  disabled={currentQty <= minQty}
                                  style={{ padding: '0.25rem 0.45rem' }}
                                >
                                  <Minus size={12} />
                                </button>
                                <input
                                  type="number"
                                  step="10"
                                  min={minQty}
                                  className="form-input"
                                  value={currentQty}
                                  onChange={(e) => handleDirectQtyInput(prod.product_id, minQty, e.target.value)}
                                  style={{ width: '4.5rem', textAlign: 'center', fontWeight: 700, padding: '0.25rem', fontSize: '0.85rem' }}
                                />
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                  {prod.unit_symbol}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => handleQtyChange(prod.product_id, minQty, 50)}
                                  style={{ padding: '0.25rem 0.45rem' }}
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </td>
                            <td>
                              <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                ₹{Number(totalLineCost).toLocaleString('en-IN')}
                              </strong>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => handleAddToCart(prod)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', fontWeight: 600 }}
                              >
                                <Plus size={13} />
                                <span>Add to Cart</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No vegetables available in this category.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <Pagination
                currentPage={catalogPage}
                totalPages={totalCatalogPages}
                totalItems={filteredRates.length}
                pageSize={pageSize}
                onPageChange={setCatalogPage}
                loading={loading}
              />
            </div>
          ) : (
            /* Card Grid Form View */
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))',
                gap: '1.25rem',
                marginBottom: '1.5rem'
              }}>
                {paginatedRates.map(prod => {
                  const minQty = parseFloat(prod.min_bulk_qty || 50);
                  const currentQty = quantities[prod.product_id] || minQty;
                  const price = parseFloat(prod.wholesale_price);
                  const totalLineCost = (currentQty * price).toFixed(0);

                  return (
                    <div key={prod.product_id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="pill-tag">{prod.category_name}</span>
                        <span className="badge badge-success">Live Rate</span>
                      </div>

                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                          {prod.vegetable_name}
                        </h3>
                        {prod.notes && (
                          <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                            {prod.notes}
                          </p>
                        )}
                      </div>

                      {/* Pricing & Min Bulk Banner */}
                      <div style={{
                        background: 'var(--page-bg)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline'
                      }}>
                        <div>
                          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                            ₹{price.toFixed(2)}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> /{prod.unit_symbol}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>MINIMUM BULK</div>
                          <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {minQty} {prod.unit_symbol}
                          </div>
                        </div>
                      </div>

                      {/* Bulk Quantity Stepper */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <span>Order Quantity:</span>
                          <span>Line Total: <strong>₹{Number(totalLineCost).toLocaleString('en-IN')}</strong></span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleQtyChange(prod.product_id, minQty, -50)}
                            disabled={currentQty <= minQty}
                            style={{ padding: '0.4rem 0.6rem' }}
                          >
                            <Minus size={14} />
                          </button>

                          <input
                            type="number"
                            step="10"
                            min={minQty}
                            className="form-input"
                            value={currentQty}
                            onChange={(e) => handleDirectQtyInput(prod.product_id, minQty, e.target.value)}
                            style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', padding: '0.35rem' }}
                          />

                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', minWidth: '1.5rem' }}>
                            {prod.unit_symbol}
                          </span>

                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleQtyChange(prod.product_id, minQty, 50)}
                            style={{ padding: '0.4rem 0.6rem' }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        className="btn btn-primary"
                        onClick={() => handleAddToCart(prod)}
                        style={{ marginTop: 'auto', width: '100%' }}
                      >
                        <Plus size={15} />
                        <span>Add {currentQty} {prod.unit_symbol} (₹{Number(totalLineCost).toLocaleString('en-IN')})</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Catalog Pagination Controls */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <Pagination
                  currentPage={catalogPage}
                  totalPages={totalCatalogPages}
                  totalItems={filteredRates.length}
                  pageSize={pageSize}
                  onPageChange={setCatalogPage}
                  loading={loading}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
