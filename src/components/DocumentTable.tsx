/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import type { Document } from '../types';
import { useApp } from '../context/AppContext';
import { Check, X, Edit2, Trash2, FileText, AlertCircle } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from './ui/Table';
import { StatusBadge, CodeBadge } from './ui/Badge';
import { Pagination } from './ui/Pagination';

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

  // Pagination details
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  return (
    <div className="table-section-container">
      <div className="table-responsive-wrapper">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell style={{ width: '15%' }}>{t('code')}</TableHeaderCell>
              <TableHeaderCell style={{ width: '35%' }}>{t('docTitle')}</TableHeaderCell>
              <TableHeaderCell style={{ width: '12%' }}>{t('category')}</TableHeaderCell>
              <TableHeaderCell style={{ width: '13%' }}>{t('status')}</TableHeaderCell>
              <TableHeaderCell style={{ width: '13%' }}>{t('createdBy')}</TableHeaderCell>
              <TableHeaderCell style={{ width: '12%' }}>{t('createdDate')}</TableHeaderCell>
              <TableHeaderCell style={{ width: '10%', textAlign: 'center' }}>{t('actions')}</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="table-loading-state">
                  <div className="spinner-loader"></div>
                  <p>{t('loading')}</p>
                </TableCell>
              </TableRow>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="table-empty-state">
                  <div className="empty-icon-box">
                    <FileText size={40} />
                  </div>
                  <h3>{t('emptyState')}</h3>
                  <p>{t('emptyAction')}</p>
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => {
                const isCurrentRowEditing = editingId === doc.id;

                return (
                  <TableRow
                    key={doc.id}
                    className={`${isCurrentRowEditing ? 'row-editing' : ''}`}
                    onDoubleClick={() => !isCurrentRowEditing && startEditing(doc)}
                  >
                    {/* Code Column */}
                    <TableCell>
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
                        <CodeBadge code={doc.code} />
                      )}
                    </TableCell>

                    {/* Title Column */}
                    <TableCell>
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
                    </TableCell>

                    {/* Category Column */}
                    <TableCell>
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
                    </TableCell>

                    {/* Status Column */}
                    <TableCell>
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
                        <StatusBadge status={doc.status} />
                      )}
                    </TableCell>

                    {/* Created By Column */}
                    <TableCell>
                      <span className="creator-text">{doc.createdBy}</span>
                    </TableCell>

                    {/* Created Date Column */}
                    <TableCell>
                      <span className="date-text">{formatDate(doc.createdDate)}</span>
                    </TableCell>

                    {/* Action Column */}
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {!loading && documents.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
};
