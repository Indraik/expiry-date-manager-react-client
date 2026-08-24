import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Package,
  Trash2,
  Pencil,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Barcode,
  Filter,
  Camera,
  QrCode,
  Scan,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BarcodeScannerModal from './BarcodeScannerModal';

const API_BASE_URL = 'http://localhost:5001';

export default function DashboardPage() {
  const { user, token } = useAuth();

  // ── Product list state ──
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Search & Filter state ──
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expiryWithin, setExpiryWithin] = useState('');

  // ── Add/Edit Modal state ──
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = add mode, object = edit mode
  const [formTitle, setFormTitle] = useState('');
  const [formUpcCode, setFormUpcCode] = useState('');
  const [formCategory, setFormCategory] = useState('Groceries');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formQuantity, setFormQuantity] = useState(1);
  const [formNotes, setFormNotes] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // ── Delete state ──
  const [deletingId, setDeletingId] = useState(null);

  // ── Scanner state ──
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState('global'); // 'global' | 'form'
  const [scanNotification, setScanNotification] = useState('');

  const LIMIT = 20;
  const debounceTimerRef = useRef(null);

  const handleScanSuccess = (code) => {
    if (scannerTarget === 'form') {
      setFormUpcCode(code);
      setScanNotification(`Scanned code: ${code}`);
      setTimeout(() => setScanNotification(''), 4000);
    } else {
      setSearchQuery(code);
      const matched = products.find((p) => p.upcCode === code);
      if (matched) {
        setScanNotification(`Found item: "${matched.title}" (Code: ${code})`);
      } else {
        setScanNotification(`Scanned: "${code}". Showing search results.`);
      }
      setTimeout(() => setScanNotification(''), 5000);
    }
  };

  // ── Debounce search input ──
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // reset to page 1 on new search
    }, 400);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // ── Fetch products from API ──
  const fetchProducts = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: LIMIT.toString(),
      });

      if (debouncedSearch.trim()) {
        params.set('search', debouncedSearch.trim());
      }

      if (expiryWithin) {
        params.set('expiryWithin', expiryWithin);
      }

      const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products');
      }

      setProducts(data.data.products || []);
      setTotalPages(data.data.totalPages || 1);
      setTotalCount(data.data.totalCount || 0);
    } catch (err) {
      setError(err.message || 'Could not load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [token, page, debouncedSearch, expiryWithin]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Reset page when filter changes ──
  useEffect(() => {
    setPage(1);
  }, [expiryWithin]);

  // ── Helper: compute status & days left ──
  const getItemStatus = (dateStr) => {
    if (!dateStr) return { status: 'fresh', daysLeft: 99, label: 'Fresh' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(dateStr);
    exp.setHours(0, 0, 0, 0);

    const diffTime = exp.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return { status: 'expired', daysLeft, label: 'Expired' };
    } else if (daysLeft <= 3) {
      return { status: 'warning', daysLeft, label: 'Expiring Soon' };
    } else {
      return { status: 'fresh', daysLeft, label: 'Fresh' };
    }
  };

  // ── Metrics ──
  const productsWithStatus = products.map((p) => ({
    ...p,
    ...getItemStatus(p.expiryDate),
  }));

  // ── Modal helpers ──
  const openAddModal = () => {
    setEditingProduct(null);
    setFormTitle('');
    setFormUpcCode('');
    setFormCategory('Groceries');
    setFormExpiryDate('');
    setFormQuantity(1);
    setFormNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormTitle(product.title || '');
    setFormUpcCode(product.upcCode || '');
    setFormCategory(product.category || 'Groceries');
    setFormExpiryDate(
      product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : ''
    );
    setFormQuantity(product.quantity || 1);
    setFormNotes(product.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormError('');
  };

  // ── Add / Edit Submit ──
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formExpiryDate) return;

    setFormLoading(true);
    setFormError('');

    const body = {
      title: formTitle.trim(),
      upcCode: formUpcCode.trim(),
      category: formCategory,
      expiryDate: formExpiryDate,
      quantity: parseInt(formQuantity, 10) || 1,
      notes: formNotes.trim(),
    };

    try {
      const isEdit = !!editingProduct;
      const url = isEdit
        ? `${API_BASE_URL}/products/${editingProduct._id}`
        : `${API_BASE_URL}/products`;

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${isEdit ? 'update' : 'add'} product`);
      }

      closeModal();
      fetchProducts(); // refresh the list
    } catch (err) {
      setFormError(err.message || 'Something went wrong');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete product ──
  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setDeletingId(productId);
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete product');
      }

      // If we deleted the last item on the current page, go back a page
      if (products.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchProducts();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Compute stat counts from current page (these are for the visible page only)
  const freshCount = productsWithStatus.filter((i) => i.status === 'fresh').length;
  const warningCount = productsWithStatus.filter((i) => i.status === 'warning').length;
  const expiredCount = productsWithStatus.filter((i) => i.status === 'expired').length;

  return (
    <div className="dashboard-container fade-in">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="dashboard-welcome">
          <h1>Hello, {user?.name || 'Manager'} 👋</h1>
          <p>Here is your real-time inventory and expiry tracking dashboard.</p>
        </div>

        <div className="dashboard-header-actions">
          <button
            type="button"
            className="btn btn-secondary btn-header-scan"
            onClick={() => {
              setScannerTarget('global');
              setIsScannerOpen(true);
            }}
            title="Scan barcode or QR code with camera"
          >
            <Camera size={18} />
            <span>Scan Barcode / QR</span>
          </button>

          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#e2e8f0', color: '#334155' }}>
            <Package size={24} />
          </div>
          <div>
            <div className="stat-val">{totalCount}</div>
            <div className="stat-label">Total Products</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#d1fae5', color: '#059669' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-val" style={{ color: '#059669' }}>{freshCount}</div>
            <div className="stat-label">Fresh & Good</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="stat-val" style={{ color: '#d97706' }}>{warningCount}</div>
            <div className="stat-label">Expiring Soon</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <XCircle size={24} />
          </div>
          <div>
            <div className="stat-val" style={{ color: '#dc2626' }}>{expiredCount}</div>
            <div className="stat-label">Expired Items</div>
          </div>
        </div>
      </div>

      {/* Scan notification banner */}
      {scanNotification && (
        <div className="scan-notification-toast">
          <CheckCircle2 size={18} />
          <span>{scanNotification}</span>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => setScanNotification('')}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="controls-bar">
        <div className="search-box">
          <Search className="input-icon" size={18} />
          <input
            type="text"
            className="form-input search-input-with-action"
            placeholder="Search by title or UPC code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="button"
            className="search-inline-scan-btn"
            onClick={() => {
              setScannerTarget('global');
              setIsScannerOpen(true);
            }}
            title="Scan barcode or QR code to search"
          >
            <Scan size={16} />
          </button>
        </div>

        <div className="filter-dropdown-wrapper">
          <Filter size={16} className="filter-icon" />
          <select
            className="filter-select"
            value={expiryWithin}
            onChange={(e) => setExpiryWithin(e.target.value)}
          >
            <option value="">All Expiry Dates</option>
            <option value="7">Within 7 Days</option>
            <option value="14">Within 14 Days</option>
            <option value="30">Within 1 Month</option>
            <option value="90">Within 3 Months</option>
            <option value="180">Within 6 Months</option>
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
          }}
        >
          <Loader2 size={40} style={{ color: '#059669', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#64748b', marginTop: '1rem', fontSize: '0.95rem' }}>
            Loading your products...
          </p>
        </div>
      ) : productsWithStatus.length === 0 ? (
        /* Empty State */
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
          }}
        >
          <Package size={48} style={{ color: '#94a3b8', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: '700' }}>
            {debouncedSearch || expiryWithin ? 'No products match your search' : 'No products tracked yet'}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            {debouncedSearch || expiryWithin
              ? 'Try adjusting your search or filter criteria.'
              : 'Click "Add Product" to start tracking your inventory.'}
          </p>
        </div>
      ) : (
        /* Items Grid */
        <div className="items-grid">
          {productsWithStatus.map((item) => (
            <div key={item._id} className="item-card">
              <div>
                <div className="item-header">
                  <div>
                    <div className="item-name">{item.title}</div>
                    <div className="item-category">{item.category}</div>
                    {item.upcCode && (
                      <div className="item-upc">
                        <Barcode size={12} />
                        {item.upcCode}
                      </div>
                    )}
                  </div>

                  {item.status === 'fresh' && (
                    <span className="badge badge-fresh">
                      <CheckCircle2 size={12} /> Fresh
                    </span>
                  )}
                  {item.status === 'warning' && (
                    <span className="badge badge-warning">
                      <AlertTriangle size={12} /> Expiring Soon
                    </span>
                  )}
                  {item.status === 'expired' && (
                    <span className="badge badge-expired">
                      <XCircle size={12} /> Expired
                    </span>
                  )}
                </div>

                <div className="item-details">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={15} style={{ color: '#64748b' }} />
                    <span>
                      Expiry:{' '}
                      <strong>
                        {new Date(item.expiryDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </strong>
                    </span>
                  </div>

                  <div
                    style={{
                      fontWeight: '600',
                      color:
                        item.status === 'expired'
                          ? '#dc2626'
                          : item.status === 'warning'
                          ? '#d97706'
                          : '#059669',
                    }}
                  >
                    {item.daysLeft < 0
                      ? `Expired ${Math.abs(item.daysLeft)} days ago`
                      : item.daysLeft === 0
                      ? 'Expires Today!'
                      : `${item.daysLeft} days remaining`}
                  </div>

                  {item.notes && (
                    <div
                      style={{
                        fontSize: '0.82rem',
                        color: '#64748b',
                        fontStyle: 'italic',
                        marginTop: '0.2rem',
                      }}
                    >
                      &ldquo;{item.notes}&rdquo;
                    </div>
                  )}
                </div>
              </div>

              <div className="item-footer">
                <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>
                  Qty: {item.quantity}
                </span>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => openEditModal(item)}
                    title="Edit product"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDeleteProduct(item._id)}
                    style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                    title="Delete product"
                    disabled={deletingId === item._id}
                  >
                    {deletingId === item._id ? (
                      <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="pagination-bar">
          <button
            className="btn btn-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <span className="pagination-info">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            <span className="pagination-count">({totalCount} products)</span>
          </span>

          <button
            className="btn btn-secondary btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card fade-in">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="error-banner" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Product Title *</label>
                <input
                  type="text"
                  className="form-input form-input-no-icon"
                  placeholder="e.g. Organic Greek Yogurt 500g"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label">UPC Barcode</label>
                  <button
                    type="button"
                    className="btn-text-scan"
                    onClick={() => {
                      setScannerTarget('form');
                      setIsScannerOpen(true);
                    }}
                  >
                    <Camera size={13} />
                    <span>Scan with Camera</span>
                  </button>
                </div>
                <div className="form-input-wrapper">
                  <Barcode className="input-icon" size={18} />
                  <input
                    type="text"
                    className="form-input input-with-action"
                    placeholder="Scan or enter UPC code..."
                    value={formUpcCode}
                    onChange={(e) => setFormUpcCode(e.target.value)}
                  />
                  <button
                    type="button"
                    className="input-inline-scan-btn"
                    onClick={() => {
                      setScannerTarget('form');
                      setIsScannerOpen(true);
                    }}
                    title="Scan barcode or QR with camera"
                  >
                    <Camera size={16} />
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-input form-input-no-icon"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                >
                  <option value="Groceries">Groceries</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Produce">Produce</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Cosmetics">Cosmetics</option>
                  <option value="Pantry">Pantry</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Expiry Date *</label>
                <input
                  type="date"
                  className="form-input form-input-no-icon"
                  value={formExpiryDate}
                  onChange={(e) => setFormExpiryDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  min="1"
                  className="form-input form-input-no-icon"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <input
                  type="text"
                  className="form-input form-input-no-icon"
                  placeholder="Storage location or notes..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={closeModal}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Saving...
                    </>
                  ) : editingProduct ? (
                    'Update Product'
                  ) : (
                    'Save Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode & QR Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        title={scannerTarget === 'form' ? 'Scan Product Barcode / QR' : 'Quick Barcode / QR Lookup'}
      />
    </div>
  );
}
