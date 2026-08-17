import React, { useState, useEffect } from 'react';

const ProductModal = ({ isOpen, onClose, onSave, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    upcCode: '',
    amount: 1,
    unit: 'pcs',
    category: 'General',
    expiryDate: '',
    notes: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      // Format ISO string date to YYYY-MM-DD for HTML input[type="date"]
      const formattedDate = initialData.expiryDate
        ? new Date(initialData.expiryDate).toISOString().split('T')[0]
        : '';
      setFormData({
        title: initialData.title || '',
        upcCode: initialData.upcCode || '',
        amount: initialData.amount || 1,
        unit: initialData.unit || 'pcs',
        category: initialData.category || 'General',
        expiryDate: formattedDate,
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        title: '',
        upcCode: '',
        amount: 1,
        unit: 'pcs',
        category: 'General',
        expiryDate: '',
        notes: ''
      });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Product title is required.');
      return;
    }
    if (!formData.expiryDate) {
      setError('Expiration date is required.');
      return;
    }

    try {
      setError('');
      await onSave({
        ...formData,
        amount: Number(formData.amount),
        expiryDate: new Date(formData.expiryDate).toISOString()
      });
    } catch (err) {
      setError(err.message || 'Failed to save product.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 animate-scale-up">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">
            {initialData ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Product Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Whole Milk 1L, Organic Eggs"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                UPC / Barcode
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="upcCode"
                  value={formData.upcCode}
                  onChange={handleChange}
                  placeholder="Scan or type barcode"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Amount</label>
              <input
                type="number"
                name="amount"
                min="0"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 outline-none"
              >
                <option value="pcs">pcs</option>
                <option value="pack">pack</option>
                <option value="box">box</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="l">l</option>
                <option value="ml">ml</option>
                <option value="other">other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 outline-none"
              >
                <option value="General">General</option>
                <option value="Dairy">Dairy</option>
                <option value="Pantry">Pantry</option>
                <option value="Medicine">Medicine</option>
                <option value="Beverages">Beverages</option>
                <option value="Meat">Meat</option>
                <option value="Bakery">Bakery</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Notes / Reminders</label>
            <textarea
              name="notes"
              rows="2"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Keep in freezer, Opened on Monday"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                initialData ? 'Update Product' : 'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
