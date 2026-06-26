/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import type { Document, DocumentCategory, DocumentStatus } from '../types';
import { useApp } from '../context/AppContext';
import { X, AlertTriangle, User } from 'lucide-react';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (docData: Omit<Document, 'id' | 'createdDate'>) => Promise<void>;
  documentToEdit?: Document | null;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  documentToEdit,
}) => {
  const { currentUser } = useApp();
  
  // Form states
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Contract');
  const [status, setStatus] = useState<DocumentStatus>('Draft');
  
  // Validation error states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Sync state if editing a document
  useEffect(() => {
    if (documentToEdit) {
      setCode(documentToEdit.code);
      setTitle(documentToEdit.title);
      setCategory(documentToEdit.category);
      setStatus(documentToEdit.status);
    } else {
      setCode('');
      setTitle('');
      setCategory('Contract');
      setStatus('Draft');
    }
    setErrors({});
    setApiError(null);
  }, [documentToEdit, isOpen]);

  if (!isOpen) return null;

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!code.trim()) {
      newErrors.code = 'Document code is required.';
    } else if (!/^[A-Za-z0-9-]+$/.test(code)) {
      newErrors.code = 'Code can only contain letters, numbers, and dashes (-).';
    } else if (code.length > 20) {
      newErrors.code = 'Code must be 20 characters or less.';
    }

    if (!title.trim()) {
      newErrors.title = 'Document title is required.';
    } else if (title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters.';
    } else if (title.trim().length > 100) {
      newErrors.title = 'Title must be 100 characters or less.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const docPayload = {
        code: code.trim().toUpperCase(),
        title: title.trim(),
        category,
        status,
        createdBy: documentToEdit ? documentToEdit.createdBy : currentUser,
      };

      await onSave(docPayload);
      onClose();
    } catch (err: any) {
      setApiError(err.message || 'An error occurred while saving the document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop fade-in">
      <div className="modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h2>{documentToEdit ? 'Edit EVD Document' : 'Create New EVD Document'}</h2>
            <p className="modal-subtitle">
              {documentToEdit 
                ? 'Update document metadata and parameters in SYS registry'
                : 'Register a new document in the Lotte x CMC Global SYS EVD system'}
            </p>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} disabled={isSubmitting}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {apiError && (
              <div className="alert-message alert-error">
                <AlertTriangle size={18} style={{ marginRight: 8, flexShrink: 0 }} />
                <span>{apiError}</span>
              </div>
            )}

            {/* Input Row 1 - Code */}
            <div className="form-group">
              <label className="form-label required-field">Document Code</label>
              <input
                type="text"
                placeholder="e.g., LOTT-EVD-025"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`form-input uppercase-text ${errors.code ? 'form-input-error' : ''}`}
                disabled={isSubmitting || !!documentToEdit} // Lock code if editing
              />
              {errors.code ? (
                <div className="form-error-msg">{errors.code}</div>
              ) : (
                <span className="form-hint">Unique system identifier. Can only include alphanumeric characters and hyphens.</span>
              )}
            </div>

            {/* Input Row 2 - Title */}
            <div className="form-group">
              <label className="form-label required-field">Document Title</label>
              <input
                type="text"
                placeholder="Enter a descriptive title for this document..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`form-input ${errors.title ? 'form-input-error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.title && <div className="form-error-msg">{errors.title}</div>}
            </div>

            {/* Double column grid for select drop-downs */}
            <div className="form-row-grid">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                  className="form-select"
                  disabled={isSubmitting}
                >
                  <option value="Contract">Contract</option>
                  <option value="Report">Report</option>
                  <option value="Invoice">Invoice</option>
                  <option value="Technical">Technical</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Initial Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DocumentStatus)}
                  className="form-select"
                  disabled={isSubmitting}
                >
                  <option value="Draft">Draft</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Author indicator Info box */}
            <div className="form-info-box">
              <User size={16} className="info-box-icon" />
              <div>
                <span>Document owner will be registered as: </span>
                <strong>{documentToEdit ? documentToEdit.createdBy : `${currentUser} (ADMIN)`}</strong>
              </div>
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="spinner-loader spinner-small"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{documentToEdit ? 'Save Changes' : 'Create Document'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
