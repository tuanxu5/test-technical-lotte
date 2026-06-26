/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import type { Document } from '../types';
import { useApp } from '../context/AppContext';
import { Check, X, Edit2, Trash2, ChevronLeft, ChevronRight, Clock, FileText, AlertCircle } from 'lucide-react';

interface DocumentTableProps {
  documents: Document[];
  loading: boolean;
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEditSave: (id: string, updatedFields: Partial<Document>) => Promise<void>;
  onDeleteClick: (doc: Document) => void;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  loading,
  totalRecords,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEditSave,
  onDeleteClick,
}) => {
  const { userRole, t } = useApp();

  // Inline editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Document>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Start inline editing for a row
  const startEditing = (doc: Document) => {
    setEditingId(doc.id);
    setEditData({
      code: doc.code,
      title: doc.title,
      category: doc.category,
      status: doc.status,
    });
    setEditErrors({});
  };

  // Cell validation logic
  const validateField = (field: keyof Document, value: string): string => {
    if (field === 'code') {
      if (!value.trim()) return 'Code is required';
      if (!/^[A-Za-z0-9-]+$/.test(value)) return 'Alphanumeric and dashes only';
      if (value.length > 20) return 'Max 20 characters';
    }
    if (field === 'title') {
      if (!value.trim()) return 'Title is required';
      if (value.trim().length < 5) return 'Min 5 characters';
      if (value.trim().length > 100) return 'Max 100 characters';
    }
    return '';
  };

  // Handle cell text / select changes
  const handleCellChange = (field: keyof Document, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));

    // Validate cell
    const errorMsg = validateField(field, value);
    setEditErrors((prev) => {
      const next = { ...prev };
      if (errorMsg) {
        next[field] = errorMsg;
      } else {
        delete next[field];
      }
      return next;
    });
  };

  // Cancel inline editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
    setEditErrors({});
  };

  // Save inline edit
  const handleSave = async (id: string, originalDoc: Document) => {
    // Validate all fields first
    const codeError = validateField('code', editData.code || '');
    const titleError = validateField('title', editData.title || '');

    const newErrors: Record<string, string> = {};
    if (codeError) newErrors.code = codeError;
    if (titleError) newErrors.title = titleError;

    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      return;
    }

    // Check if anything changed
    const hasChanges =
      editData.code !== originalDoc.code ||
      editData.title !== originalDoc.title ||
      editData.category !== originalDoc.category ||
      editData.status !== originalDoc.status;

    if (!hasChanges) {
      setEditingId(null);
      return;
    }

    setIsSaving(true);
    try {
      await onEditSave(id, editData);
      setEditingId(null);
    } catch (err: any) {
      setEditErrors((prev) => ({
        ...prev,
        code: err.message || 'Validation failed',
      }));
    } finally {
      setIsSaving(false);
    }
  };

  // Formatter for date
  const formatDate = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return isoString;
    }
  };

  // Check if a field is dirty
  const isDirty = (field: keyof Document, originalValue: string): boolean => {
    const currentValue = editData[field];
    if (currentValue === undefined) return false;
    return currentValue !== originalValue;
  };

  // Get matching status icon
  const renderStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'approved':
        return (
          <span className="badge-status status-approved">
            <Check size={12} style={{ marginRight: 5 }} />
            {status}
          </span>
        );
      case 'rejected':
        return (
          <span className="badge-status status-rejected">
            <X size={12} style={{ marginRight: 5 }} />
            {status}
          </span>
        );
      case 'pending':
        return (
          <span className="badge-status status-pending">
            <Clock size={12} style={{ marginRight: 5 }} />
            {status}
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="badge-status status-draft">
            <FileText size={12} style={{ marginRight: 5 }} />
            {status}
          </span>
        );
    }
  };

  // Pagination details
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startRecordIndex = (currentPage - 1) * pageSize + 1;
  const endRecordIndex = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="table-section-container">
      <div className="table-responsive-wrapper">
        <table className="sys-table">
          <thead>
            <tr>
              <th style={{ width: '15%' }}>{t('code')}</th>
              <th style={{ width: '35%' }}>{t('docTitle')}</th>
              <th style={{ width: '12%' }}>{t('category')}</th>
              <th style={{ width: '13%' }}>{t('status')}</th>
              <th style={{ width: '13%' }}>{t('createdBy')}</th>
              <th style={{ width: '12%' }}>{t('createdDate')}</th>
              <th style={{ width: '10%', textAlign: 'center' }}>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="table-loading-state">
                  <div className="spinner-loader"></div>
                  <p>{t('loading')}</p>
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={7} className="table-empty-state">
                  <div className="empty-icon-box">
                    <FileText size={40} />
                  </div>
                  <h3>{t('emptyState')}</h3>
                  <p>{t('emptyAction')}</p>
                </td>
              </tr>
            ) : (
              documents.map((doc) => {
                const isCurrentRowEditing = editingId === doc.id;

                return (
                  <tr
                    key={doc.id}
                    className={`${isCurrentRowEditing ? 'row-editing' : ''}`}
                    onDoubleClick={() => !isCurrentRowEditing && startEditing(doc)}
                  >
                    {/* Code Column */}
                    <td>
                      {isCurrentRowEditing ? (
                        <div className="cell-input-container">
                          <input
                            type="text"
                            value={editData.code ?? ''}
                            onChange={(e) => handleCellChange('code', e.target.value)}
                            className={`cell-input ${editErrors.code ? 'cell-invalid' : ''} ${
                              isDirty('code', doc.code) ? 'cell-changed' : ''
                            }`}
                          />
                          {isDirty('code', doc.code) && !editErrors.code && (
                            <span className="dirty-indicator" title="Unsaved changes" />
                          )}
                          {editErrors.code && (
                            <div className="validation-tooltip">
                              <AlertCircle size={10} style={{ marginRight: 4, display: 'inline' }} />
                              {editErrors.code}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="mono-code">{doc.code}</span>
                      )}
                    </td>

                    {/* Title Column */}
                    <td>
                      {isCurrentRowEditing ? (
                        <div className="cell-input-container">
                          <input
                            type="text"
                            value={editData.title ?? ''}
                            onChange={(e) => handleCellChange('title', e.target.value)}
                            className={`cell-input ${editErrors.title ? 'cell-invalid' : ''} ${
                              isDirty('title', doc.title) ? 'cell-changed' : ''
                            }`}
                          />
                          {isDirty('title', doc.title) && !editErrors.title && (
                            <span className="dirty-indicator" title="Unsaved changes" />
                          )}
                          {editErrors.title && (
                            <div className="validation-tooltip">
                              <AlertCircle size={10} style={{ marginRight: 4, display: 'inline' }} />
                              {editErrors.title}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="doc-title-text" title={doc.title}>
                          {doc.title}
                        </span>
                      )}
                    </td>

                    {/* Category Column */}
                    <td>
                      {isCurrentRowEditing ? (
                        <div className="cell-input-container">
                          <select
                            value={editData.category ?? 'Contract'}
                            onChange={(e) => handleCellChange('category', e.target.value)}
                            className={`cell-select ${
                              isDirty('category', doc.category) ? 'cell-changed' : ''
                            }`}
                          >
                            <option value="Contract">Contract</option>
                            <option value="Report">Report</option>
                            <option value="Invoice">Invoice</option>
                            <option value="Technical">Technical</option>
                          </select>
                          {isDirty('category', doc.category) && (
                            <span className="dirty-indicator" title="Unsaved changes" />
                          )}
                        </div>
                      ) : (
                        <span className="category-text">{doc.category}</span>
                      )}
                    </td>

                    {/* Status Column */}
                    <td>
                      {isCurrentRowEditing ? (
                        <div className="cell-input-container">
                          <select
                            value={editData.status ?? 'Draft'}
                            onChange={(e) => handleCellChange('status', e.target.value)}
                            className={`cell-select ${
                              isDirty('status', doc.status) ? 'cell-changed' : ''
                            }`}
                          >
                            <option value="Draft">Draft</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          {isDirty('status', doc.status) && (
                            <span className="dirty-indicator" title="Unsaved changes" />
                          )}
                        </div>
                      ) : (
                        renderStatusBadge(doc.status)
                      )}
                    </td>

                    {/* Created By Column */}
                    <td>
                      <span className="creator-text">{doc.createdBy}</span>
                    </td>

                    {/* Created Date Column */}
                    <td>
                      <span className="date-text">{formatDate(doc.createdDate)}</span>
                    </td>

                    {/* Action Column */}
                    <td>
                      <div className="actions-cell">
                        {isCurrentRowEditing ? (
                          <>
                            <button
                              type="button"
                              className="action-icon-btn btn-save"
                              onClick={() => handleSave(doc.id, doc)}
                              disabled={isSaving}
                              title={t('save')}
                            >
                              <Check size={16} />
                            </button>
                            <button
                              type="button"
                              className="action-icon-btn btn-cancel"
                              onClick={cancelEditing}
                              disabled={isSaving}
                              title={t('cancel')}
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="action-icon-btn btn-edit"
                              onClick={() => startEditing(doc)}
                              title={t('edit')}
                            >
                              <Edit2 size={16} />
                            </button>
                            {userRole === 'ADMIN' && (
                              <button
                                type="button"
                                className="action-icon-btn btn-delete"
                                onClick={() => onDeleteClick(doc)}
                                title={t('delete')}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && documents.length > 0 && (
        <div className="sys-pagination">
          <div className="pagination-info">
            Showing <strong>{startRecordIndex}</strong> to <strong>{endRecordIndex}</strong> of{' '}
            <strong>{totalRecords}</strong> documents
          </div>

          <div className="pagination-controls">
            {/* Page Size Selector */}
            <div className="page-size-selector">
              <span>Page size:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="select-page-size"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>

            {/* Navigation buttons */}
            <div className="page-buttons">
              <button
                type="button"
                className="btn-page-nav"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={`btn-page-num ${pageNumber === currentPage ? 'active' : ''}`}
                  onClick={() => onPageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                className="btn-page-nav"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
