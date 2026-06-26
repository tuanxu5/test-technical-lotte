import React from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Shield, Database, ChevronDown, RotateCcw, X } from 'lucide-react';
import { SegmentedControl } from './ui/Toggle';
import { USER_ROLE } from '../types';

export const Sidebar: React.FC = () => {
  const { userRole, setRole, resetDatabase, isSidebarOpen, setSidebarOpen, currentUser, t } = useApp();

  return (
    <>
      {/* Mobile Sidebar backdrop overlay */}
      {isSidebarOpen && (
        <div className="sidebar-mobile-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sys-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        {/* Workspace Selector Mock */}
        <div className="workspace-selector-wrapper">
          <div className="workspace-selector">
            <div className="workspace-avatar">L</div>
            <div className="workspace-info">
              <div className="workspace-title">LOTTE × CMC</div>
              <div className="workspace-sub">SYS Registry Console</div>
            </div>
            <ChevronDown size={16} className="workspace-chevron" />
          </div>

          {/* Mobile Sidebar Close Button */}
          <button
            type="button"
            className="btn-close-sidebar-mobile"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">{t('sidebarRegistryTitle')}</div>
          <a href="#" className="nav-item active" onClick={() => setSidebarOpen(false)}>
            <FileText size={16} />
            <span>{t('sidebarRegistryLink')}</span>
            <span className="nav-active-dot" />
          </a>

          <div className="nav-section-title">{t('sidebarManagementTitle')}</div>
          <a href="#" className="nav-item disabled" onClick={(e) => e.preventDefault()}>
            <Shield size={16} />
            <span>{t('sidebarAccessControl')}</span>
          </a>
          <a href="#" className="nav-item disabled" onClick={(e) => e.preventDefault()}>
            <Database size={16} />
            <span>{t('sidebarAuditLogs')}</span>
          </a>
        </nav>

        {/* Sleek Profile & Role Panel */}
        <div className="sidebar-user-section">
          {/* Compact User Card */}
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {currentUser.substring(0, 2).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="user-name">{currentUser}</div>
              <div className="user-role-label">{userRole} {t('sidebarRoleScope')}</div>
            </div>

            {/* Subtle seed reset action */}
            <button
              type="button"
              className="btn-reset-db-icon"
              onClick={() => {
                resetDatabase();
                setSidebarOpen(false);
              }}
              title={t('sidebarResetDb')}
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Segmented Control Switcher */}
          <SegmentedControl<USER_ROLE>
            selectedValue={userRole}
            onChange={(role) => {
              setRole(role);
              setSidebarOpen(false);
            }}
            options={[
              { value: USER_ROLE.ADMIN, label: 'ADMIN', activeClass: 'active-admin' },
              { value: USER_ROLE.STAFF, label: 'STAFF', activeClass: 'active-staff' },
            ]}
          />
        </div>
      </aside>
    </>
  );
};
