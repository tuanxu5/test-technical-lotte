import React from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Shield, Database, ChevronDown, RotateCcw, X } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { userRole, setRole, resetDatabase, isSidebarOpen, setSidebarOpen, currentUser } = useApp();

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
          <div className="nav-section-title">EVD Registry</div>
          <a href="#" className="nav-item active" onClick={() => setSidebarOpen(false)}>
            <FileText size={16} />
            <span>Documents Registry</span>
            <span className="nav-active-dot" />
          </a>
          
          <div className="nav-section-title">Management</div>
          <a href="#" className="nav-item disabled" onClick={(e) => e.preventDefault()}>
            <Shield size={16} />
            <span>Access Controls</span>
          </a>
          <a href="#" className="nav-item disabled" onClick={(e) => e.preventDefault()}>
            <Database size={16} />
            <span>System Audit Logs</span>
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
              <div className="user-role-label">{userRole} Scope</div>
            </div>
            
            {/* Subtle seed reset action */}
            <button 
              type="button" 
              className="btn-reset-db-icon" 
              onClick={() => {
                resetDatabase();
                setSidebarOpen(false);
              }}
              title="Restore demo seeds"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Segmented Control Switcher */}
          <div className="role-segment-selector">
            <button
              type="button"
              className={`role-segment-btn ${userRole === 'ADMIN' ? 'active-admin' : ''}`}
              onClick={() => {
                setRole('ADMIN');
                setSidebarOpen(false);
              }}
            >
              ADMIN
            </button>
            <button
              type="button"
              className={`role-segment-btn ${userRole === 'STAFF' ? 'active-staff' : ''}`}
              onClick={() => {
                setRole('STAFF');
                setSidebarOpen(false);
              }}
            >
              STAFF
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
