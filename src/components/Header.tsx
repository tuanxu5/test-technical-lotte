import { memo } from 'react';
import { useApp } from '../context/AppContext';
import type { LangType } from '../context/AppContext';
import { Globe, Menu } from 'lucide-react';
import { RoleBadge } from './ui/Badge';
import { SegmentedControl } from './ui/Toggle';

export const Header = memo(() => {
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
          <SegmentedControl<LangType>
            className=""
            buttonClassName="lang-btn"
            options={[
              { value: 'en', label: 'EN' },
              { value: 'vi', label: 'VI' },
            ]}
            selectedValue={lang}
            onChange={(val) => setLang(val)}
          />
        </div>

        {/* User Card */}
        <div className="user-profile-card">
          <div className="avatar-placeholder">
            {currentUser.substring(0, 2).toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-name">{currentUser}</div>
            <div className="role-container">
              <RoleBadge role={userRole} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});
