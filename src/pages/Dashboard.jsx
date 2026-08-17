import React, { useState, useEffect, useCallback } from 'react';
import LoggedInHeader from '../components/LoggedInHeader';
import Footer from '../components/Footer';
import ProductModal from '../components/ProductModal';
import SearchFilterBar from '../components/SearchFilterBar';
import PaginationControls from '../components/PaginationControls';
import { fetchProductsApi, createProductApi, updateProductApi, deleteProductApi } from '../services/api';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [expiryFilter, setExpiryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      // Determine if search input looks like a UPC code (all digits) or title
      const isUpc = /^\d+$/.test(searchTerm.trim());
      const data = await fetchProductsApi({
        page: currentPage,
        limit: 20,
        search: isUpc ? '' : searchTerm.trim(),
        upc: isUpc ? searchTerm.trim() : '',
        expiryWithinMonths: expiryFilter,
        status: statusFilter
      });
      setProducts(data.products || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, expiryFilter, statusFilter]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleExpiryFilterChange = (filterVal) => {
    setExpiryFilter(filterVal);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (statusVal) => {
    setStatusFilter(statusVal);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setExpiryFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (productData) => {
    setIsSaving(true);
    try {
      if (editingProduct) {
        await updateProductApi(editingProduct._id, productData);
      } else {
        await createProductApi(productData);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      await loadProducts();
    } catch (err) {
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setDeletingId(productId);
    try {
      await deleteProductApi(productId);
      await loadProducts();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status, expiryDate) => {
    const dateObj = new Date(expiryDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (status === 'Expired') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          Expired ({formattedDate})
        </span>
      );
    } else if (status === 'Expiring Soon') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500"></span>
          Expiring Soon ({formattedDate})
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500"></span>
          Good ({formattedDate})
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <LoggedInHeader />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your inventory and track upcoming product expiration dates.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="btn-primary flex items-center shadow-primary/25 shadow-md text-sm py-2.5 px-4 rounded-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Add Product
            </button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <SearchFilterBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          expiryFilter={expiryFilter}
          onExpiryFilterChange={handleExpiryFilterChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          onResetFilters={handleResetFilters}
        />

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center justify-between">
            <span>{error}</span>
            <button onClick={loadProducts} className="underline hover:text-red-900">Retry</button>
          </div>
        )}

        {/* Product List Content */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-3"></div>
            <p className="text-slate-500 font-medium text-sm">Loading inventory products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {searchTerm || expiryFilter || statusFilter ? 'No matching products found' : 'No products yet'}
            </h3>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
              {searchTerm || expiryFilter || statusFilter 
                ? 'Try adjusting your search keywords or range filters.' 
                : 'Get started by adding a product to track its expiration date.'}
            </p>
            {searchTerm || expiryFilter || statusFilter ? (
              <button onClick={handleResetFilters} className="btn-secondary text-sm px-4 py-2">
                Clear Filters
              </button>
            ) : (
              <button onClick={handleOpenAddModal} className="btn-primary text-sm px-4 py-2">
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Product Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Quantity</th>
                    <th className="py-3.5 px-4">UPC Barcode</th>
                    <th className="py-3.5 px-4">Expiry Status</th>
                    <th className="py-3.5 px-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {products.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="py-4 px-4 sm:px-6 font-semibold text-slate-900">
                        <div>{item.title}</div>
                        {item.notes && (
                          <div className="text-xs text-slate-400 font-normal mt-0.5">{item.notes}</div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                          {item.category || 'General'}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-700">
                        {item.amount} <span className="text-xs text-slate-400">{item.unit || 'pcs'}</span>
                      </td>

                      <td className="py-4 px-4 text-xs font-mono text-slate-500">
                        {item.upcCode ? (
                          <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-600">
                            {item.upcCode}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {getStatusBadge(item.status, item.expiryDate)}
                      </td>

                      <td className="py-4 px-4 text-right pr-6 space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(item._id)}
                          disabled={deletingId === item._id}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deletingId === item._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
            <PaginationControls
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              limit={pagination.limit}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}

      </main>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        initialData={editingProduct}
        isLoading={isSaving}
      />

      <Footer />
    </div>
  );
};

export default Dashboard;
