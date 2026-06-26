import { memo } from 'react';
import { useApp } from '../context/AppContext';
import { DOCUMENT_CATEGORY, DOCUMENT_STATUS } from '../types';
import { Search, X, Plus, Upload } from 'lucide-react';
import { Select } from './ui/Select';
import { Button } from './ui/Button';

interface ToolbarProps {
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: DOCUMENT_CATEGORY | 'ALL') => void;
  onStatusChange: (status: DOCUMENT_STATUS | 'ALL') => void;
  currentCategory: DOCUMENT_CATEGORY | 'ALL';
  currentStatus: DOCUMENT_STATUS | 'ALL';
  currentSearch: string;
  onAddClick: () => void;
  onImportClick: () => void;
}

export const Toolbar = memo<ToolbarProps>(({
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

  const handleClearFilters = () => {
    onSearchChange('');
    onCategoryChange('ALL');
    onStatusChange('ALL');
  };

  const hasActiveFilters = currentSearch !== '' || currentCategory !== 'ALL' || currentStatus !== 'ALL';

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
            value={currentSearch}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {currentSearch && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <Select
          label={t('category')}
          value={currentCategory}
          onChange={(e) => onCategoryChange(e.target.value as DOCUMENT_CATEGORY | 'ALL')}
          className="filter-select"
          options={[
            { value: 'ALL', label: t('all') },
            { value: DOCUMENT_CATEGORY.CONTRACT, label: 'Contract' },
            { value: DOCUMENT_CATEGORY.REPORT, label: 'Report' },
            { value: DOCUMENT_CATEGORY.INVOICE, label: 'Invoice' },
            { value: DOCUMENT_CATEGORY.TECHNICAL, label: 'Technical' },
          ]}
        />

        {/* Status Dropdown */}
        <Select
          label={t('status')}
          value={currentStatus}
          onChange={(e) => onStatusChange(e.target.value as DOCUMENT_STATUS | 'ALL')}
          className="filter-select"
          options={[
            { value: 'ALL', label: t('all') },
            { value: DOCUMENT_STATUS.DRAFT, label: 'Draft' },
            { value: DOCUMENT_STATUS.PENDING, label: 'Pending' },
            { value: DOCUMENT_STATUS.APPROVED, label: 'Approved' },
            { value: DOCUMENT_STATUS.REJECTED, label: 'Rejected' },
          ]}
        />

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="secondary"
            className="btn-clear-filters"
            onClick={handleClearFilters}
            title="Reset Filters"
          >
            <X size={14} />
            <span>Clear</span>
          </Button>
        )}
      </div>

      <div className="action-group">
        <Button variant="secondary" onClick={onImportClick}>
          <Upload size={16} />
          <span>{t('bulkImport')}</span>
        </Button>

        <Button variant="primary" onClick={onAddClick}>
          <Plus size={16} />
          <span>{t('createDoc')}</span>
        </Button>
      </div>
    </div>
  );
});
