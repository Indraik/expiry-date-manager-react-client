import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Search, CheckCircle2, AlertTriangle, XCircle, Package,
  Trash2, Pencil, ChevronLeft, ChevronRight, Loader2, AlertCircle,
  Barcode, Filter, RotateCcw, X
} from 'lucide-react';
import LoggedInHeader from '../components/LoggedInHeader';
import Footer from '../components/Footer';
import ProductModal from '../components/ProductModal';
import { fetchProductsApi, createProductApi, updateProductApi, deleteProductApi } from '../services/api';

/* ── helpers ── */
const getItemStatus = (dateStr) => {
  if (!dateStr) return { cls: 'fresh', label: 'Fresh', daysLeft: 99 };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const exp   = new Date(dateStr); exp.setHours(0, 0, 0, 0);
  const days  = Math.ceil((exp - today) / 86400000);
  if (days < 0)  return { cls: 'expired', label: 'Expired',       daysLeft: days };
  if (days <= 7) return { cls: 'warning', label: 'Expiring Soon', daysLeft: days };
  return          { cls: 'fresh',   label: 'Fresh',          daysLeft: days };
};

const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const StatusBadge = ({ status, expiryDate }) => {
  const { cls, label } = getItemStatus(expiryDate);
  return (
    <span className={`badge ${cls}`}>
      <span className="badge-dot" />
      {label} · {fmtDate(expiryDate)}
    </span>
  );
};

/* ── Component ── */
const Dashboard = () => {
  const [products,      setProducts]      = useState([]);
  const [pagination,    setPagination]    = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading,     setIsLoading]     = useState(true);
  const [error,         setError]         = useState('');

  // Search & filters
  const [searchInput,   setSearchInput]   = useState('');
  const [searchTerm,    setSearchTerm]    = useState('');
  const [expiryFilter,  setExpiryFilter]  = useState('');
  const [statusFilter,  setStatusFilter]  = useState('');
  const [currentPage,   setCurrentPage]   = useState(1);

  // Modal
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [editingProduct,setEditingProduct]= useState(null);
  const [isSaving,      setIsSaving]      = useState(false);
  const [deletingId,    setDeletingId]    = useState(null);

  const debounceRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const isUpc = /^\d+$/.test(searchTerm.trim());
      const data = await fetchProductsApi({
        page: currentPage,
        limit: 20,
        search: isUpc ? '' : searchTerm.trim(),
        upc: isUpc ? searchTerm.trim() : '',
        expiryWithinMonths: expiryFilter,
        status: statusFilter,
      });
      setProducts(data.products || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, expiryFilter, statusFilter]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // Metrics derived from current page's products
  const total   = pagination.total;
  const expired = products.filter(p => getItemStatus(p.expiryDate).cls === 'expired').length;
  const warning = products.filter(p => getItemStatus(p.expiryDate).cls === 'warning').length;
  const fresh   = products.filter(p => getItemStatus(p.expiryDate).cls === 'fresh').length;

  const hasFilters = searchTerm || expiryFilter || statusFilter;

  const handleReset = () => {
    setSearchInput('');
    setSearchTerm('');
    setExpiryFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  const openAdd = () => { setEditingProduct(null); setIsModalOpen(true); };
  const openEdit = (p) => { setEditingProduct(p); setIsModalOpen(true); };

  const handleSave = async (productData) => {
    setIsSaving(true);
    try {
      if (editingProduct) await updateProductApi(editingProduct._id, productData);
      else await createProductApi(productData);
      setIsModalOpen(false);
      setEditingProduct(null);
      await loadProducts();
    } catch (err) {
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    setDeletingId(id);
    try {
      await deleteProductApi(id);
      await loadProducts();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  /* Pagination helpers */
  const { page, totalPages } = pagination;
  const startItem = (page - 1) * 20 + 1;
  const endItem   = Math.min(page * 20, total);

  return (
    <div className="dashboard-layout">
      <LoggedInHeader />

      <main className="dashboard-main">

        {/* ── Header ── */}
        <div className="dash-header fade-in">
          <div>
            <h1 className="dash-title">Dashboard</h1>
            <p className="dash-sub">Manage your inventory and track upcoming product expiration dates.</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={17} /> Add Product
          </button>
        </div>

        {/* ── Metric cards ── */}
        <div className="metrics-grid">
          <div className="metric-card" style={{ '--i': 0, animationDelay: '0ms' }}>
            <div className="metric-icon blue"><Package size={22} /></div>
            <div className="metric-info">
              <div className="metric-value">{isLoading ? '—' : total}</div>
              <div className="metric-label">Total Products</div>
            </div>
          </div>
          <div className="metric-card" style={{ animationDelay: '60ms' }}>
            <div className="metric-icon green"><CheckCircle2 size={22} /></div>
            <div className="metric-info">
              <div className="metric-value">{isLoading ? '—' : fresh}</div>
              <div className="metric-label">Fresh</div>
            </div>
          </div>
          <div className="metric-card" style={{ animationDelay: '120ms' }}>
            <div className="metric-icon amber"><AlertTriangle size={22} /></div>
            <div className="metric-info">
              <div className="metric-value">{isLoading ? '—' : warning}</div>
              <div className="metric-label">Expiring Soon</div>
            </div>
          </div>
          <div className="metric-card" style={{ animationDelay: '180ms' }}>
            <div className="metric-icon red"><XCircle size={22} /></div>
            <div className="metric-info">
              <div className="metric-value">{isLoading ? '—' : expired}</div>
              <div className="metric-label">Expired</div>
            </div>
          </div>
        </div>

        {/* ── Search / Filter bar ── */}
        <div className="filter-bar">
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by title or UPC barcode..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button className="search-clear" onClick={() => setSearchInput('')} title="Clear">
                <X size={14} />
              </button>
            )}
          </div>

          <select
            className="filter-select"
            value={expiryFilter}
            onChange={e => { setExpiryFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">Expiry Range (All)</option>
            <option value="1">Within 1 Month</option>
            <option value="3">Within 3 Months</option>
            <option value="6">Within 6 Months</option>
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">Status (All)</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
          </select>

          {hasFilters && (
            <button className="reset-btn" onClick={handleReset}>
              <RotateCcw size={13} /> Reset
            </button>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="error-bar">
            <span style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
              <AlertCircle size={16} /> {error}
            </span>
            <button onClick={loadProducts} style={{ fontWeight: 600, color: 'inherit', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Retry</button>
          </div>
        )}

        {/* ── Content ── */}
        {isLoading ? (
          <div className="loading-box">
            <div className="spinner" style={{ margin: '0 auto' }} />
            <p>Loading inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Package size={32} /></div>
            <h3>{hasFilters ? 'No matching products' : 'No products yet'}</h3>
            <p>
              {hasFilters
                ? 'Try adjusting your search or filters.'
                : 'Get started by adding your first product to track its expiration date.'}
            </p>
            {hasFilters
              ? <button className="btn btn-secondary btn-sm" onClick={handleReset}>Clear Filters</button>
              : <button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={15} /> Add First Product</button>}
          </div>
        ) : (
          <div className="table-card">
            <div className="table-wrap">
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Qty</th>
                    <th><Barcode size={13} style={{ display: 'inline', marginRight: 4 }} />UPC</th>
                    <th><Filter size={13} style={{ display: 'inline', marginRight: 4 }} />Status</th>
                    <th style={{ textAlign: 'right', paddingRight: '1.25rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(item => (
                    <tr key={item._id}>
                      <td>
                        <div className="td-title">{item.title}</div>
                        {item.notes && <div className="td-notes">{item.notes}</div>}
                      </td>
                      <td><span className="cat-badge">{item.category || 'General'}</span></td>
                      <td className="td-qty">{item.amount}<span>{item.unit || 'pcs'}</span></td>
                      <td>
                        {item.upcCode
                          ? <span className="upc-code">{item.upcCode}</span>
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td><StatusBadge status={item.status} expiryDate={item.expiryDate} /></td>
                      <td style={{ textAlign: 'right', paddingRight: '1.25rem', whiteSpace: 'nowrap' }}>
                        <button
                          className="action-btn action-edit"
                          onClick={() => openEdit(item)}
                          title="Edit"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          className="action-btn action-delete"
                          onClick={() => handleDelete(item._id)}
                          disabled={deletingId === item._id}
                          title="Delete"
                          style={{ marginLeft: '.25rem' }}
                        >
                          {deletingId === item._id
                            ? <><Loader2 size={14} className="spin" /> Deleting</>
                            : <><Trash2 size={14} /> Delete</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <span className="page-info">
                {total > 0 ? `Showing ${startItem}–${endItem} of ${total} products` : `${total} products`}
              </span>
              <div className="page-controls">
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const pg = i + 1;
                  return (
                    <button
                      key={pg}
                      className={`page-btn ${pg === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pg)}
                    >
                      {pg}
                    </button>
                  );
                })}

                <button
                  className="page-btn"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={page >= totalPages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingProduct}
        isLoading={isSaving}
      />

      <Footer />
    </div>
  );
};

export default Dashboard;
