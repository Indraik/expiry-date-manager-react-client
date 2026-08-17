import React from 'react';

const SearchFilterBar = ({ 
  searchTerm, 
  onSearchChange, 
  expiryFilter, 
  onExpiryFilterChange,
  statusFilter,
  onStatusFilterChange,
  onResetFilters
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 mb-6 transition-all">
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        
        {/* Search Input */}
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products by Title or UPC Barcode..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 outline-none text-sm placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
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
  );
};

export default SearchFilterBar;
