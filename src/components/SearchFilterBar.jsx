import React, { useState } from 'react';
import CameraScannerModal from './CameraScannerModal';

const SearchFilterBar = ({ 
  searchTerm, 
  onSearchChange, 
  expiryFilter, 
  onExpiryFilterChange,
  statusFilter,
  onStatusFilterChange,
  onResetFilters
}) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleCameraScanSuccess = (scannedCode) => {
    onSearchChange(scannedCode);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 mb-6 transition-all">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-grow max-w-md flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by Title or UPC Barcode..."
              className="w-full pl-10 pr-20 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 outline-none text-sm placeholder:text-slate-400"
            />
            
            <div className="absolute right-2 flex items-center gap-1">
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                  title="Clear Search"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                title="Scan QR or Barcode with Camera"
                className="p-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all flex items-center gap-1 text-xs font-semibold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden sm:inline">Scan</span>
              </button>
            </div>
          </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <select
              value={expiryFilter}
              onChange={(e) => onExpiryFilterChange(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700 font-medium text-sm outline-none cursor-pointer"
            >
              <option value="">Expiry Range (All)</option>
              <option value="1">Expiring within 1 Month</option>
              <option value="3">Expiring within 3 Months</option>
              <option value="6">Expiring within 6 Months</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700 font-medium text-sm outline-none cursor-pointer"
            >
              <option value="">Status (All)</option>
              <option value="Expiring Soon">Expiring Soon 🟠</option>
              <option value="Expired">Expired 🔴</option>
            </select>
          </div>

          {(searchTerm || expiryFilter || statusFilter) && (
            <button
              onClick={onResetFilters}
              className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
          )}
        </div>

      </div>
    </div>

    <CameraScannerModal
      isOpen={isCameraOpen}
      onClose={() => setIsCameraOpen(false)}
      onScanSuccess={handleCameraScanSuccess}
    />
    </>
  );
};

export default SearchFilterBar;
