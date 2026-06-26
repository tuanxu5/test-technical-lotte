import React from 'react';
import { Check, X, Clock, FileText } from 'lucide-react';

type StatusValue = 'approved' | 'rejected' | 'pending' | 'draft' | string;

interface StatusBadgeProps {
  status: StatusValue;
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; className: string }> = {
  approved: { icon: <Check size={12} />, className: 'status-approved' },
  rejected: { icon: <X size={12} />, className: 'status-rejected' },
  pending:  { icon: <Clock size={12} />, className: 'status-pending' },
  draft:    { icon: <FileText size={12} />, className: 'status-draft' },
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

type RoleVariant = 'ADMIN' | 'STAFF';

interface RoleBadgeProps {
  role: RoleVariant;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const style: React.CSSProperties =
    role === 'ADMIN'
      ? { backgroundColor: 'var(--lotte-red-light)', color: 'var(--lotte-red)' }
      : { backgroundColor: 'var(--cmc-blue-light)', color: 'var(--cmc-blue)' };

  return (
    <span className="role-badge" style={style}>
      {role}
    </span>
  );
};
