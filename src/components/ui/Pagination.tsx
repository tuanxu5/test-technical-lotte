import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="sys-pagination">
      <div className="pagination-info">
        Showing <strong>{startIndex}</strong> to <strong>{endIndex}</strong> of{' '}
        <strong>{totalRecords}</strong> documents
      </div>

      <div className="pagination-controls">
        {/* Page size selector */}
        <div className="page-size-selector">
          <span>Page size:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="select-page-size"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        {/* Page number buttons */}
        <div className="page-buttons">
          <button
            type="button"
            className="btn-page-nav"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              className={`btn-page-num ${pageNum === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(pageNum)}
              aria-current={pageNum === currentPage ? 'page' : undefined}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            className="btn-page-nav"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};
