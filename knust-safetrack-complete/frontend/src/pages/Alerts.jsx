import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, MapPin, Clock, Plus, X, RefreshCw } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';
import MenuDrawer from '../components/MenuDrawer';
import { alertsAPI } from '../services/api.js';
import useToast from '../hooks/useToast.js';
import { useAuth } from '../App.jsx';

// Fallback mock alerts for offline mode
const FALLBACK_ALERTS = [
  { id: 1, title: 'Safety Notice', message: 'Avoid unlit paths near Tech Junction after 10 PM.', location: 'Tech Junction', time: new Date(Date.now() - 30 * 60000).toISOString(), type: 'notice' },
  { id: 2, title: 'Shuttle Update', message: 'Route A delays due to high traffic near Commercial Area.', location: 'Commercial Area', time: new Date(Date.now() - 105 * 60000).toISOString(), type: 'shuttle' },
  { id: 3, title: 'Security Advisory', message: 'Increased patrols around Main Library tonight.', location: 'Main Library', time: new Date(Date.now() - 24 * 3600000).toISOString(), type: 'security' },
];

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Alerts({ onSignOut }) {
  const toast = useToast();
  const { userType } = useAuth() || {};
  const [showMenu, setShowMenu] = useState(false);
  const [alerts, setAlerts] = useState(FALLBACK_ALERTS);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlert, setNewAlert] = useState({ title: '', message: '', location: '', type: 'notice' });
  const [submitting, setSubmitting] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await alertsAPI.getAll();
      setAlerts(data);
    } catch {
      // Use fallback mock data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, []);

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!newAlert.title || !newAlert.message) return;
    setSubmitting(true);
    try {
      const created = await alertsAPI.create(newAlert);
      setAlerts(prev => [created, ...prev]);
      setNewAlert({ title: '', message: '', location: '', type: 'notice' });
      setShowCreateForm(false);
      toast.success('Alert published to all students');
    } catch {
      toast.error('Failed to publish alert');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await alertsAPI.delete(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
      toast.success('Alert removed');
    } catch {
      toast.error('Failed to delete alert');
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-bg-primary pb-20">
      <TopBar
        currentLocation="Alerts"
        showSearch={false}
        onMenuClick={() => setShowMenu(true)}
      />

      <div className="pt-20 px-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-text-primary">Latest Updates</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAlerts}
              className="p-2 rounded-lg bg-bg-secondary border border-border hover:bg-bg-tertiary transition-colors"
              aria-label="Refresh alerts"
            >
              <RefreshCw className={`w-4 h-4 text-text-secondary ${loading ? 'animate-spin' : ''}`} />
            </button>
            {userType === 'security' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-primary text-bg-primary rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                Post Alert
              </button>
            )}
          </div>
        </div>

        {/* Create Alert Form (security only) */}
        {showCreateForm && (
          <div className="bg-bg-secondary rounded-xl border border-primary/30 p-4 mb-4 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-text-primary text-sm">Post New Alert</h3>
              <button onClick={() => setShowCreateForm(false)} className="p-1 hover:bg-bg-tertiary rounded">
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>
            <form onSubmit={handleCreateAlert} className="space-y-3">
              <select
                value={newAlert.type}
                onChange={e => setNewAlert(p => ({ ...p, type: e.target.value }))}
                className="w-full h-10 px-3 bg-bg-primary border border-border rounded-lg text-text-primary text-sm outline-none"
                style={{ fontSize: '16px' }}
              >
                <option value="notice">Safety Notice</option>
                <option value="security">Security Advisory</option>
                <option value="shuttle">Shuttle Update</option>
              </select>
              <input
                type="text"
                inputMode="text"
                autoComplete="off"
                placeholder="Alert title (e.g. Safety Notice)"
                value={newAlert.title}
                onChange={e => setNewAlert(p => ({ ...p, title: e.target.value }))}
                className="w-full h-10 px-3 bg-bg-primary border border-border rounded-lg text-text-primary text-sm outline-none focus:border-primary"
                style={{ fontSize: '16px' }}
                required
              />
              <input
                type="text"
                inputMode="text"
                autoComplete="off"
                placeholder="Location (e.g. Tech Junction)"
                value={newAlert.location}
                onChange={e => setNewAlert(p => ({ ...p, location: e.target.value }))}
                className="w-full h-10 px-3 bg-bg-primary border border-border rounded-lg text-text-primary text-sm outline-none focus:border-primary"
                style={{ fontSize: '16px' }}
              />
              <textarea
                placeholder="Alert message"
                value={newAlert.message}
                onChange={e => setNewAlert(p => ({ ...p, message: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 bg-bg-primary border border-border rounded-lg text-text-primary text-sm outline-none focus:border-primary resize-none"
                style={{ fontSize: '16px' }}
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-primary text-bg-primary font-semibold rounded-lg text-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {submitting ? 'Publishing...' : 'Publish Alert'}
              </button>
            </form>
          </div>
        )}

        {/* Alert List */}
        {loading && alerts === FALLBACK_ALERTS ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-bg-secondary rounded-xl p-4 border border-border animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-bg-tertiary rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-bg-tertiary rounded w-1/3" />
                    <div className="h-3 bg-bg-tertiary rounded w-2/3" />
                    <div className="h-3 bg-bg-tertiary rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-bg-secondary rounded-xl p-6 border border-border text-center">
            <p className="font-semibold text-text-primary">No alerts yet</p>
            <p className="text-sm text-text-secondary mt-1">Updates and safety notices will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const badge =
                alert.type === 'security'
                  ? { bg: 'bg-secondary/20', text: 'text-secondary', icon: Shield }
                  : alert.type === 'shuttle'
                    ? { bg: 'bg-accent/20', text: 'text-accent', icon: MapPin }
                    : { bg: 'bg-primary/20', text: 'text-primary', icon: AlertTriangle };
              const Icon = badge.icon;
              return (
                <div
                  key={alert.id}
                  className="bg-bg-secondary rounded-xl p-4 border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${badge.bg} rounded-lg flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${badge.text}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-text-primary">{alert.title}</p>
                          <p className="text-sm text-text-secondary mt-1">{alert.message}</p>
                        </div>
                        {userType === 'security' && (
                          <button
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="p-1 hover:bg-bg-tertiary rounded transition-colors shrink-0"
                            aria-label="Delete alert"
                          >
                            <X className="w-4 h-4 text-text-muted hover:text-danger" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-text-secondary">
                        {alert.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {alert.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(alert.time)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav activeTab="alerts" />
      <MenuDrawer isOpen={showMenu} onClose={() => setShowMenu(false)} onSignOut={onSignOut} />
    </div>
  );
}
