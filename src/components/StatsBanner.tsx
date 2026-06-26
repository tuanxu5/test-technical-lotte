import { memo } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from './ui/Card';

interface StatsProps {
  total: number;
  pending: number;
  approved: number;
  categoriesCount: number;
}

export const StatsBanner = memo<StatsProps>(({ total, pending, approved, categoriesCount }) => {
  const { t } = useApp();

  const approvedRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  return (
    <div className="stats-banner">
      {/* Metric 1 */}
      <StatCard value={total} label={t('totalDocs')} indicatorClass="indicator-blue" />

      {/* Metric 2 */}
      <StatCard value={pending} label={t('pendingDocs')} indicatorClass="indicator-yellow" />

      {/* Metric 3 */}
      <StatCard value={`${approvedRate}%`} label={t('approvedRate')} indicatorClass="indicator-green" />

      {/* Metric 4 */}
      <StatCard value={categoriesCount} label={t('activeCats')} indicatorClass="indicator-purple" />
    </div>
  );
});
