import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  loading = false,
  children,
  className = '',
  disabled,
  ...rest
}) => {
  const variantClass = variant === 'link' ? 'btn-link' : `btn btn-${variant}`;

  return (
    <button
      className={`${variantClass} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <div className="spinner-loader spinner-small" />}
      {children}
    </button>
  );
};
