import React from 'react';
import { Check, X, Clock, FileText, Shield } from 'lucide-react';
import { USER_ROLE } from '../../types';

type StatusValue = 'approved' | 'rejected' | 'pending' | 'draft' | string;

interface StatusBadgeProps {
  status: StatusValue;
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; className: string }> = {
  approved: { icon: <Check size={12} />, className: 'status-approved' },
  rejected: { icon: <X size={12} />, className: 'status-rejected' },
  pending: { icon: <Clock size={12} />, className: 'status-pending' },
  draft: { icon: <FileText size={12} />, className: 'status-draft' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status.toLowerCase()] ?? STATUS_CONFIG.draft;

  return (
    <span className={`badge-status ${config.className}`}>
      <span style={{ marginRight: 5, display: 'inline-flex' }}>{config.icon}</span>
      {status}
    </span>
  );
};

// ---

interface CodeBadgeProps {
  code: string;
}

export const CodeBadge: React.FC<CodeBadgeProps> = ({ code }) => (
  <span className="mono-code">{code}</span>
);

// ---

interface RoleBadgeProps {
  role: USER_ROLE;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const style: React.CSSProperties =
    role === USER_ROLE.ADMIN
      ? { backgroundColor: 'var(--lotte-red-light)', color: 'var(--lotte-red)' }
      : { backgroundColor: 'var(--cmc-blue-light)', color: 'var(--cmc-blue)' };

  return (
    <span className="role-badge" style={style}>
      <Shield size={10} style={{ marginRight: 3 }} />
      {role}
    </span>
  );
};
