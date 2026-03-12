import { useState, useEffect } from 'react';
import { AlertTriangle, Users, Shield, CheckCircle, Clock, Activity } from 'lucide-react';
import { dashboardAPI } from '../../services/api.js';
import { DASHBOARD_STATS } from '../../data/dashboardData';

export default function StatsOverview() {
  const [stats, setStats] = useState(DASHBOARD_STATS);

  useEffect(() => {
    dashboardAPI.getStats().then(setStats).catch(() => {});
    const interval = setInterval(() => {
      dashboardAPI.getStats().then(setStats).catch(() => {});
    }, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const statConfig = [
    { id: 'alerts', label: 'Active SOS', value: stats.activeAlerts, icon: AlertTriangle, color: 'danger', urgent: true },
    { id: 'walks', label: 'Active Walks', value: stats.activeWalks, icon: Users, color: 'secondary' },
    { id: 'patrols', label: 'Patrols On Duty', value: stats.patrolsOnDuty, icon: Shield, color: 'primary' },
    { id: 'resolved', label: 'Resolved Today', value: stats.resolvedToday, icon: CheckCircle, color: 'secondary' },
    { id: 'response', label: 'Avg. Response', value: stats.averageResponseTime, icon: Clock, color: 'primary' },
    { id: 'students', label: 'Students Active', value: stats.studentsActive, icon: Activity, color: 'text-secondary' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-4 bg-bg-secondary border-b border-border">
      {statConfig.map((stat) => {
        const Icon = stat.icon;
        const bgColor = stat.color === 'danger' ? 'bg-danger/20' : stat.color === 'secondary' ? 'bg-secondary/20' : stat.color === 'primary' ? 'bg-primary/20' : 'bg-bg-tertiary';
        const textColor = stat.color === 'danger' ? 'text-danger' : stat.color === 'secondary' ? 'text-secondary' : stat.color === 'primary' ? 'text-primary' : 'text-text-secondary';
        return (
          <div key={stat.id} className={`p-3 rounded-xl ${bgColor} ${stat.urgent && stat.value > 0 ? 'animate-pulse-subtle' : ''}`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${textColor}`} />
              <span className="text-xs text-text-secondary">{stat.label}</span>
            </div>
            <p className={`text-2xl font-bold ${textColor}`}>{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
}
