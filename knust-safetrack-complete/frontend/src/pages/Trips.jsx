import { useState, useEffect } from 'react';
import { Clock, MapPin, Users, ChevronRight, Calendar, RefreshCw } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';
import MenuDrawer from '../components/MenuDrawer';
import { tripsAPI } from '../services/api.js';

const FALLBACK_TRIPS = [
  { id: 1, type: 'walk', title: 'Walk With Security', from: 'Main Library', to: 'Hall 7', date: new Date(Date.now() - 90*60000).toISOString(), duration: '12 min', status: 'completed' },
  { id: 2, type: 'share', title: 'Location Shared', from: 'JQB', to: 'Brunei Hostel', date: new Date(Date.now() - 24*3600000).toISOString(), duration: '18 min', status: 'completed' },
  { id: 3, type: 'walk', title: 'Walk With Friend', from: 'Tech Junction', to: 'Gaza', date: new Date(Date.now() - 2*24*3600000).toISOString(), duration: '25 min', status: 'completed' },
  { id: 4, type: 'sos', title: 'SOS Alert', from: 'Near Casely-Hayford', to: 'Security Response', date: new Date(Date.now() - 4*24*3600000).toISOString(), duration: '3 min', status: 'resolved' },
];

function timeLabel(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const hrs = diff / 3600000;
  if (hrs < 2) return 'Today, ' + new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (hrs < 48) return 'Yesterday, ' + new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function Trips({ onSignOut }) {
  const [showMenu, setShowMenu] = useState(false);
  const [trips, setTrips] = useState(FALLBACK_TRIPS);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await tripsAPI.getAll();
      if (data.length > 0) setTrips(data);
    } catch {
      // Use fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrips(); }, []);

  const stats = {
    walks: trips.filter(t => t.type === 'walk').length,
    shares: trips.filter(t => t.type === 'share').length,
    totalMins: trips.reduce((acc, t) => acc + (parseInt(t.duration) || 0), 0),
  };

  return (
    <div className="relative w-full min-h-screen bg-bg-primary pb-20">
      <TopBar currentLocation="Trip History" showSearch={false} onMenuClick={() => setShowMenu(true)} />

      <div className="pt-20 px-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-bg-secondary rounded-xl p-4 border border-border">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center mb-2">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xl font-bold text-text-primary">{stats.walks}</p>
            <p className="text-xs text-text-secondary">Safe Walks</p>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 border border-border">
            <div className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center mb-2">
              <MapPin className="w-4 h-4 text-secondary" />
            </div>
            <p className="text-xl font-bold text-text-primary">{stats.shares}</p>
            <p className="text-xs text-text-secondary">Locations Shared</p>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 border border-border">
            <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center mb-2">
              <Clock className="w-4 h-4 text-accent" />
            </div>
            <p className="text-xl font-bold text-text-primary">{(stats.totalMins / 60).toFixed(1)}h</p>
            <p className="text-xs text-text-secondary">Total Time</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text-primary flex items-center gap-2">
            <Calendar className="w-5 h-5 text-text-secondary" />
            Recent Activity
          </h2>
          <button onClick={fetchTrips} aria-label="Refresh">
            <RefreshCw className={`w-4 h-4 text-text-secondary ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {trips.length === 0 ? (
          <div className="bg-bg-secondary rounded-xl p-6 border border-border text-center">
            <p className="font-semibold text-text-primary">No trips yet</p>
            <p className="text-sm text-text-secondary mt-1">Your walk sessions and alerts will show up here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => (
              <div key={trip.id} className="bg-bg-secondary rounded-xl p-4 border border-border hover:border-primary/30 transition-colors cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        trip.type === 'walk' ? 'bg-primary/20 text-primary'
                        : trip.type === 'share' ? 'bg-secondary/20 text-secondary'
                        : 'bg-danger/20 text-danger'
                      }`}>
                        {trip.title}
                      </span>
                      <span className={`text-xs ${trip.status === 'completed' ? 'text-primary' : trip.status === 'resolved' ? 'text-secondary' : 'text-text-muted'}`}>
                        ✓ {trip.status}
                      </span>
                    </div>
                    <div className="text-sm text-text-primary mb-1">{trip.from} → {trip.to}</div>
                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                      <span>{timeLabel(trip.date)}</span>
                      {trip.duration && <span>• {trip.duration}</span>}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-muted" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav activeTab="trips" />
      <MenuDrawer isOpen={showMenu} onClose={() => setShowMenu(false)} onSignOut={onSignOut} />
    </div>
  );
}
