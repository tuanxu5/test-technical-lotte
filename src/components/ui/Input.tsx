import React from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  required,
  className = '',
  id,
  ...rest
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className={`form-label ${required ? 'required-field' : ''}`}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`form-input ${error ? 'form-input-error' : ''} ${className}`}
        {...rest}
      />
      {error ? (
        <div className="form-error-msg">
          <AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
          {error}
        </div>
      ) : hint ? (
        <span className="form-hint">{hint}</span>
      ) : null}
    </div>
  );
};
