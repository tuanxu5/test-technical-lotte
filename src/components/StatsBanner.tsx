import React from 'react';
import { useApp } from '../context/AppContext';

interface StatsProps {
  total: number;
  pending: number;
  approved: number;
  categoriesCount: number;
}

export const StatsBanner: React.FC<StatsProps> = ({ total, pending, approved, categoriesCount }) => {
  const { t } = useApp();

  const approvedRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  return (
    <div className="stats-banner">
      {/* Metric 1 */}
      <div className="stat-card">
        <div className="stat-value">{total}</div>
        <div className="stat-label">{t('totalDocs')}</div>
        <div className="stat-indicator indicator-blue"></div>
      </div>

      {/* Metric 2 */}
      <div className="stat-card">
        <div className="stat-value">{pending}</div>
        <div className="stat-label">{t('pendingDocs')}</div>
        <div className="stat-indicator indicator-yellow"></div>
      </div>

      {/* Metric 3 */}
      <div className="stat-card">
        <div className="stat-value">{approvedRate}%</div>
        <div className="stat-label">{t('approvedRate')}</div>
        <div className="stat-indicator indicator-green"></div>
      </div>

      {/* Metric 4 */}
      <div className="stat-card">
        <div className="stat-value">{categoriesCount}</div>
        <div className="stat-label">{t('activeCats')}</div>
        <div className="stat-indicator indicator-purple"></div>
      </div>
    </div>
  );
};
