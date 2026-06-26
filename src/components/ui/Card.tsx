import React from 'react';

interface CardProps {
  value: string | number;
  label: string;
  indicatorClass?: string;
}

export const StatCard: React.FC<CardProps> = ({ value, label, indicatorClass }) => (
  <div className="stat-card">
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
    {indicatorClass && <div className={`stat-indicator ${indicatorClass}`} />}
  </div>
);

// ---

interface SpinnerProps {
  small?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({ small = false }) => (
  <div className={`spinner-loader ${small ? 'spinner-small' : ''}`} />
);

// ---

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  wrapperClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, wrapperClassName = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fade-in" onClick={onClose}>
      <div
        className={`modal-content-wrapper ${wrapperClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  disabled?: boolean;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ title, subtitle, onClose, disabled }) => (
  <div className="modal-header">
    <div>
      <h2>{title}</h2>
      {subtitle && <p className="modal-subtitle">{subtitle}</p>}
    </div>
    <button type="button" className="btn-close-modal" onClick={onClose} disabled={disabled}>
      ✕
    </button>
  </div>
);
