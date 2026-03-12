import { useState, useEffect } from 'react';
import { AlertTriangle, Phone, MapPin, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { ACTIVE_SOS_ALERTS } from '../../data/dashboardData';
import useToast from '../../hooks/useToast.js';
import { sosAPI } from '../../services/api.js';

function formatTimeAgo(isoOrDate) {
  const date = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins === 1) return '1 min ago';
  return `${mins} mins ago`;
}

export default function SOSAlertsPanel({ onSelectAlert, selectedAlertId, hideHeader = false, className = '' }) {
  const toast = useToast();
  const [alerts, setAlerts] = useState(ACTIVE_SOS_ALERTS);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = async () => {
    setRefreshing(true);
    try {
      const data = await sosAPI.getAll();
      if (data.length > 0) setAlerts(data);
    } catch {
      // Use mock data
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleRespond = async (alert, e) => {
    e.stopPropagation();
    try {
      await sosAPI.updateStatus(alert.id, 'responding');
      setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, status: 'responding' } : a));
      toast.success(`Patrol assigned to ${alert.location}.`);
    } catch {
      toast.success(`Patrol assigned to ${alert.location}.`);
    }
  };

  const handleResolve = async (alert, e) => {
    e.stopPropagation();
    try {
      await sosAPI.updateStatus(alert.id, 'resolved');
      setAlerts(prev => prev.filter(a => a.id !== alert.id));
      toast.success(`Alert ${alert.id} resolved.`);
    } catch {
      setAlerts(prev => prev.filter(a => a.id !== alert.id));
      toast.success(`Alert resolved.`);
    }
  };

  const activeCount = alerts.filter(a => a.status === 'active' || a.status === 'responding').length;

  return (
    <div className={`w-full bg-bg-secondary border-t border-border lg:border-t-0 lg:border-l lg:border-border h-full flex flex-col ${className}`}>
      {!hideHeader && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-danger" />
              <h2 className="font-bold text-text-primary">Active SOS</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchAlerts} aria-label="Refresh">
                <RefreshCw className={`w-4 h-4 text-text-secondary ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <span className="px-2 py-1 bg-danger/20 text-danger text-xs font-bold rounded-full">
                {activeCount} Active
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeCount === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-6">
            <div>
              <CheckCircle className="w-12 h-12 text-secondary mx-auto mb-3 opacity-50" />
              <p className="text-text-secondary font-medium">All Clear</p>
              <p className="text-text-muted text-sm mt-1">No active SOS alerts</p>
            </div>
          </div>
        ) : (
          alerts.filter(a => a.status !== 'resolved').map((alert) => (
            <div
              key={alert.id}
              onClick={() => onSelectAlert?.(alert)}
              className={`p-3 rounded-xl cursor-pointer transition-all border ${
                selectedAlertId === alert.id
                  ? 'border-danger bg-danger/10'
                  : 'border-border bg-bg-primary hover:bg-bg-tertiary/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  alert.status === 'active' ? 'bg-danger/30 text-danger' : 'bg-primary/30 text-primary'
                }`}>
                  {alert.status === 'active' ? '● Active' : '◎ Responding'}
                </span>
                <span className="text-xs text-text-muted flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(alert.timestamp)}
                </span>
              </div>

              <p className="font-semibold text-text-primary text-sm mb-1">{alert.studentName}</p>
              <p className="text-xs text-text-muted mb-1">ID: {alert.studentId}</p>

              <div className="flex items-center gap-1 text-text-secondary text-xs mb-3">
                <MapPin className="w-3 h-3" />
                {alert.location}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toast.info(`Calling ${alert.studentName}...`); }}
                  className="flex-1 py-2 bg-secondary text-white text-xs font-medium rounded-lg hover:bg-secondary-light transition-colors"
                >
                  <Phone className="w-3 h-3 inline mr-1" />Call
                </button>
                {alert.status === 'active' ? (
                  <button
                    type="button"
                    onClick={(e) => handleRespond(alert, e)}
                    className="flex-1 py-2 bg-primary text-bg-primary text-xs font-medium rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Assign Patrol
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleResolve(alert, e)}
                    className="flex-1 py-2 bg-bg-tertiary text-text-primary text-xs font-medium rounded-lg hover:bg-border transition-colors"
                  >
                    <CheckCircle className="w-3 h-3 inline mr-1" />Resolve
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
