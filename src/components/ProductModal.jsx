import React, { useState, useEffect } from 'react';
import { X, Camera, Save, Plus } from 'lucide-react';
import CameraScannerModal from './CameraScannerModal';

const ProductModal = ({ isOpen, onClose, onSave, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: '', upcCode: '', amount: 1, unit: 'pcs',
    category: 'General', expiryDate: '', notes: ''
  });
  const [error, setError] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title:      initialData.title      || '',
        upcCode:    initialData.upcCode    || '',
        amount:     initialData.amount     || 1,
        unit:       initialData.unit       || 'pcs',
        category:   initialData.category   || 'General',
        expiryDate: initialData.expiryDate
          ? new Date(initialData.expiryDate).toISOString().split('T')[0]
          : '',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({ title: '', upcCode: '', amount: 1, unit: 'pcs', category: 'General', expiryDate: '', notes: '' });
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
    if (!formData.title.trim()) { setError('Product title is required.'); return; }
    if (!formData.expiryDate)   { setError('Expiration date is required.'); return; }
    try {
      setError('');
      await onSave({ ...formData, amount: Number(formData.amount), expiryDate: new Date(formData.expiryDate).toISOString() });
    } catch (err) {
      setError(err.message || 'Failed to save product.');
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="modal-box">
          <div className="modal-header">
            <h2 className="modal-title">
              {initialData ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button className="modal-close" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="form-error" style={{ marginBottom: '1rem' }}>
                  {error}
                </div>
              )}

              {/* Title */}
              <div className="modal-form-group">
                <label className="modal-label">
                  Product Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Whole Milk 1L, Vitamin D Capsules"
                  required
                  className="modal-input"
                />
              </div>

              {/* UPC + Expiry date */}
              <div className="modal-grid-2">
                <div className="modal-form-group">
                  <label className="modal-label">UPC / Barcode</label>
                  <div className="modal-input-wrap">
                    <input
                      type="text"
                      name="upcCode"
                      value={formData.upcCode}
                      onChange={handleChange}
                      placeholder="Scan or type code"
                      className="modal-input"
                    />
                    <button
                      type="button"
                      className="modal-input-btn"
                      onClick={() => setIsCameraOpen(true)}
                      title="Scan with camera"
                    >
                      <Camera size={16} />
                    </button>
                  </div>
                </div>

                <div className="modal-form-group">
                  <label className="modal-label">
                    Expiry Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    required
                    className="modal-input"
                  />
                </div>
              </div>

              {/* Amount + Unit + Category */}
              <div className="modal-grid-3">
                <div className="modal-form-group">
                  <label className="modal-label">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    min="0"
                    value={formData.amount}
                    onChange={handleChange}
                    className="modal-input"
                  />
                </div>

                <div className="modal-form-group">
                  <label className="modal-label">Unit</label>
                  <select name="unit" value={formData.unit} onChange={handleChange} className="modal-input">
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

                <div className="modal-form-group">
                  <label className="modal-label">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="modal-input">
                    <option value="General">General</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Pantry">Pantry</option>
                    <option value="Medicine">Medicine</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Meat">Meat</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Produce">Produce</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="modal-form-group" style={{ marginBottom: 0 }}>
                <label className="modal-label">Notes</label>
                <textarea
                  name="notes"
                  rows="2"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="e.g. Keep refrigerated, Opened Monday"
                  className="modal-input"
                  style={{ resize: 'none' }}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</>
                ) : initialData ? (
                  <><Save size={15} /> Update</>
                ) : (
                  <><Plus size={15} /> Add Product</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <CameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScanSuccess={(code) => {
          setFormData(prev => ({ ...prev, upcCode: code }));
          setIsCameraOpen(false);
        }}
      />
    </>
  );
};

export default ProductModal;
