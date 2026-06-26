/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { DOCUMENT_CATEGORY, DOCUMENT_STATUS } from '../types';
import type { Document } from '../types';
import { useApp } from '../context/AppContext';
import { AlertTriangle, User } from 'lucide-react';
import { Modal, ModalHeader } from './ui/Card';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';

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
  const [category, setCategory] = useState<DOCUMENT_CATEGORY>(DOCUMENT_CATEGORY.CONTRACT);
  const [status, setStatus] = useState<DOCUMENT_STATUS>(DOCUMENT_STATUS.DRAFT);

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
      setCategory(DOCUMENT_CATEGORY.CONTRACT);
      setStatus(DOCUMENT_STATUS.DRAFT);
    }
    setErrors({});
    setApiError(null);
  }, [documentToEdit, isOpen]);

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
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader
        title={documentToEdit ? 'Edit EVD Document' : 'Create New EVD Document'}
        subtitle={
          documentToEdit
            ? 'Update document metadata and parameters in SYS registry'
            : 'Register a new document in the Lotte x CMC Global SYS EVD system'
        }
        onClose={onClose}
        disabled={isSubmitting}
      />

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
          <Input
            label="Document Code"
            required
            type="text"
            placeholder="e.g., LOTT-EVD-025"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="uppercase-text"
            error={errors.code}
            hint={!errors.code ? "Unique system identifier. Can only include alphanumeric characters and hyphens." : undefined}
            disabled={isSubmitting || !!documentToEdit}
          />

          {/* Input Row 2 - Title */}
          <Input
            label="Document Title"
            required
            type="text"
            placeholder="Enter a descriptive title for this document..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            disabled={isSubmitting}
          />

          {/* Double column grid for select drop-downs */}
          <div className="form-row-grid">
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as DOCUMENT_CATEGORY)}
              disabled={isSubmitting}
              options={[
                { value: DOCUMENT_CATEGORY.CONTRACT, label: 'Contract' },
                { value: DOCUMENT_CATEGORY.REPORT, label: 'Report' },
                { value: DOCUMENT_CATEGORY.INVOICE, label: 'Invoice' },
                { value: DOCUMENT_CATEGORY.TECHNICAL, label: 'Technical' },
              ]}
            />

            <Select
              label="Initial Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as DOCUMENT_STATUS)}
              disabled={isSubmitting}
              options={[
                { value: DOCUMENT_STATUS.DRAFT, label: 'Draft' },
                { value: DOCUMENT_STATUS.PENDING, label: 'Pending' },
                { value: DOCUMENT_STATUS.APPROVED, label: 'Approved' },
                { value: DOCUMENT_STATUS.REJECTED, label: 'Rejected' },
              ]}
            />
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
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
            {documentToEdit ? 'Save Changes' : 'Create Document'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
