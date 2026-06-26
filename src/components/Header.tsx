import React from 'react';
import { useApp } from '../context/AppContext';
import { Globe, Shield, Menu } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, userRole, lang, setLang, t, setSidebarOpen } = useApp();

  return (
    <header className="sys-header">
      {/* Mobile Hamburger menu toggle */}
      <button 
        type="button" 
        className="btn-menu-mobile" 
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={24} />
      </button>

      <div className="header-meta">
        <h1>{t('title')}</h1>
        <p className="subtitle">{t('subtitle')}</p>
      </div>

      <div className="header-actions">
        {/* Language Switcher */}
        <div className="lang-switcher">
          <Globe size={14} className="lang-globe-icon" />
          <button
            type="button"
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLang('en')}
          >
            EN
          </button>
          <button
            type="button"
            className={`lang-btn ${lang === 'vi' ? 'active' : ''}`}
            onClick={() => setLang('vi')}
          >
            VI
          </button>
        </div>

        {/* User Card */}
        <div className="user-profile-card">
          <div className="avatar-placeholder">
            {currentUser.substring(0, 2).toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-name">{currentUser}</div>
            <div className="role-container">
              <span className={`role-badge badge-${userRole.toLowerCase()}`}>
                <Shield size={10} style={{ marginRight: 3 }} />
                {userRole}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
