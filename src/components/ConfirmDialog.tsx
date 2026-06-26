import { memo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './ui/Card';
import { Button } from './ui/Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
}

export const ConfirmDialog = memo<ConfirmDialogProps>(({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} wrapperClassName="modal-confirm-wrapper">
      <div className="modal-body-confirm">
        <div className="confirm-icon-box">
          <AlertTriangle size={32} className="warning-icon" />
        </div>
        
        <div className="confirm-text-content">
          <h3>{title}</h3>
          <p>{message}</p>
        </div>
      </div>

      <div className="modal-footer-confirm">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Confirm Delete'}
        </Button>
      </div>
    </Modal>
  );
});
