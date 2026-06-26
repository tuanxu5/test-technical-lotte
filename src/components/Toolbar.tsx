/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { DocumentCategory, DocumentStatus } from '../types';
import { Search, X, Plus, Upload } from 'lucide-react';

interface ToolbarProps {
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: DocumentCategory | 'ALL') => void;
  onStatusChange: (status: DocumentStatus | 'ALL') => void;
  currentCategory: DocumentCategory | 'ALL';
  currentStatus: DocumentStatus | 'ALL';
  currentSearch: string;
  onAddClick: () => void;
  onImportClick: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  currentCategory,
  currentStatus,
  currentSearch,
  onAddClick,
  onImportClick,
}) => {
  const { t } = useApp();
  const [localSearch, setLocalSearch] = useState(currentSearch);

  // Debounce logic for search
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [localSearch, onSearchChange]);

  // Sync local search when external search changes (like reset)
  useEffect(() => {
    setLocalSearch(currentSearch);
  }, [currentSearch]);

  const handleClearFilters = () => {
    setLocalSearch('');
    onCategoryChange('ALL');
    onStatusChange('ALL');
  };

  const hasActiveFilters = localSearch !== '' || currentCategory !== 'ALL' || currentStatus !== 'ALL';

  return (
    <div className="sys-toolbar">
      <div className="filter-group">
        {/* Search Input */}
        <div className="search-wrapper">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            className="search-input"
            placeholder={t('searchPlaceholder')}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          {localSearch && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setLocalSearch('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="select-wrapper">
          <label className="select-label">{t('category')}</label>
          <select
            value={currentCategory}
            onChange={(e) => onCategoryChange(e.target.value as DocumentCategory | 'ALL')}
            className="filter-select"
          >
            <option value="ALL">{t('all')}</option>
            <option value="Contract">Contract</option>
            <option value="Report">Report</option>
            <option value="Invoice">Invoice</option>
            <option value="Technical">Technical</option>
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="select-wrapper">
          <label className="select-label">{t('status')}</label>
          <select
            value={currentStatus}
            onChange={(e) => onStatusChange(e.target.value as DocumentStatus | 'ALL')}
            className="filter-select"
          >
            <option value="ALL">{t('all')}</option>
            <option value="Draft">Draft</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            className="btn-clear-filters"
            onClick={handleClearFilters}
            title="Reset Filters"
          >
            <X size={14} />
            <span>Clear</span>
          </button>
        )}
      </div>

      <div className="action-group">
        <button type="button" className="btn btn-secondary" onClick={onImportClick}>
          <Upload size={16} />
          <span>{t('bulkImport')}</span>
        </button>
        
        <button type="button" className="btn btn-primary" onClick={onAddClick}>
          <Plus size={16} />
          <span>{t('createDoc')}</span>
        </button>
      </div>
    </div>
  );
};
