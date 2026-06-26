import React from 'react';

export interface SegmentedControlOption<T> {
  value: T;
  label: string;
  activeClass?: string; // Optional class name when active (e.g. active-admin, active-staff, active)
  disabled?: boolean;
}

interface SegmentedControlProps<T> {
  options: SegmentedControlOption<T>[];
  selectedValue: T;
  onChange: (value: T) => void;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
}

export function SegmentedControl<T>({
  options,
  selectedValue,
  onChange,
  className = 'role-segment-selector',
  buttonClassName = 'role-segment-btn',
  disabled = false,
}: SegmentedControlProps<T>) {
  return (
    <div className={`${className} ${disabled ? 'disabled' : ''}`}>
      {options.map((opt) => {
        const isActive = opt.value === selectedValue;
        const activeClass = isActive ? (opt.activeClass || 'active') : '';
        const isOptDisabled = disabled || opt.disabled;
        return (
          <button
            key={String(opt.value)}
            type="button"
            className={`${buttonClassName} ${activeClass}`}
            onClick={() => !isOptDisabled && onChange(opt.value)}
            disabled={isOptDisabled}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// Simple Boolean Switch Toggle
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <label className={`sys-toggle-container ${disabled ? 'disabled' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sys-toggle-input"
      />
      <span className="sys-toggle-slider" />
      {label && <span className="sys-toggle-label">{label}</span>}
    </label>
  );
};
