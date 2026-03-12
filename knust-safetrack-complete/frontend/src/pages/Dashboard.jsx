import { useRef, useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import SOSAlertsPanel from '../components/dashboard/SOSAlertsPanel';
import DashboardMap from '../components/dashboard/DashboardMap';
import StatsOverview from '../components/dashboard/StatsOverview';
import { Map, Flame, Menu, AlertTriangle, X, Shield, Bell, Clock, Users, MapPin, LogOut, CheckCircle, Edit2, Save, Phone, Radio, ChevronRight, UserCheck } from 'lucide-react';
import { ACTIVE_SOS_ALERTS, PATROL_UNITS } from '../data/dashboardData';
import useFocusTrap from '../hooks/useFocusTrap';
import useToast from '../hooks/useToast.js';

const SECURITY_PROFILE_KEY = 'safetrack_security_profile';

const DEFAULT_SECURITY_PROFILE = {
  name: 'Security Admin',
  badgeId: 'KSS-0042',
  phone: '+233 24 000 0001',
  shift: 'Night (6PM–6AM)',
  area: 'Main Campus',
  rank: 'Senior Officer',
  status: 'on-duty',
};

const PATROL_DETAILS = {
  'PATROL-1': { name: 'Unit Alpha', officer: 'Sgt. Kweku Boateng', phone: '+233 24 111 2233', vehicle: 'Motorbike KN-1102', area: 'North Campus', status: 'available', lat: 6.676, lng: -1.570 },
  'PATROL-2': { name: 'Unit Beta', officer: 'Cpl. Abena Frimpong', phone: '+233 24 222 3344', vehicle: 'On foot', area: 'South Hostels', status: 'responding', lat: 6.672, lng: -1.568 },
  'PATROL-3': { name: 'Unit Gamma', officer: 'Sgt. Yaw Darko', phone: '+233 24 333 4455', vehicle: 'Vehicle KN-9981', area: 'Main Gate', status: 'available', lat: 6.680, lng: -1.574 },
};

function loadProfile() {
  try { return JSON.parse(localStorage.getItem(SECURITY_PROFILE_KEY)) || DEFAULT_SECURITY_PROFILE; }
  catch { return DEFAULT_SECURITY_PROFILE; }
}

export default function Dashboard({ onSignOut }) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [alertsDrawerOpen, setAlertsDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const drawerCloseRef = useRef(null);
  useFocusTrap({ enabled: alertsDrawerOpen, containerRef: drawerRef, initialFocusRef: drawerCloseRef });

  // Security profile
  const [profile, setProfile] = useState(loadProfile);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});

  // Patrol assignment modal
  const [assignModal, setAssignModal] = useState(null); // { alert }
  const [selectedPatrol, setSelectedPatrol] = useState(null);
  const [assigning, setAssigning] = useState(false);

  const handleAlertSelect = (alert) => setSelectedAlert(alert);

  const openAssignModal = (alert) => {
    setAssignModal({ alert });
    setSelectedPatrol(null);
  };

  const handleAssign = () => {
    if (!selectedPatrol) return;
    setAssigning(true);
    setTimeout(() => {
      toast.success(`${PATROL_DETAILS[selectedPatrol].name} assigned to ${assignModal.alert.studentName} at ${assignModal.alert.location}`);
      setAssigning(false);
      setAssignModal(null);
      setSelectedPatrol(null);
    }, 900);
  };

  const saveProfile = () => {
    const updated = { ...profile, ...profileForm };
    setProfile(updated);
    localStorage.setItem(SECURITY_PROFILE_KEY, JSON.stringify(updated));
    setEditingProfile(false);
    toast.success('Profile updated');
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'sos': return 'Active SOS Alerts';
      case 'heatmap': return 'Traffic Heatmap';
      case 'settings': return 'Settings';
      default: return 'Security Dashboard';
    }
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'sos':
        return (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-danger/10 border border-danger/30 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-danger/20 rounded-full flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-danger" /></div>
                  <div><p className="text-2xl font-bold text-danger">{ACTIVE_SOS_ALERTS.filter(a => a.status === 'active').length}</p><p className="text-xs text-text-secondary">Active Alerts</p></div>
                </div>
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center"><Clock className="w-5 h-5 text-primary" /></div>
                  <div><p className="text-2xl font-bold text-primary">{ACTIVE_SOS_ALERTS.filter(a => a.status === 'responding').length}</p><p className="text-xs text-text-secondary">Responding</p></div>
                </div>
                <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center"><CheckCircle className="w-5 h-5 text-secondary" /></div>
                  <div><p className="text-2xl font-bold text-secondary">12</p><p className="text-xs text-text-secondary">Resolved Today</p></div>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">All Active Alerts</h3>
              <div className="space-y-3">
                {ACTIVE_SOS_ALERTS.map((alert) => (
                  <div key={alert.id} onClick={() => handleAlertSelect(alert)}
                    className={`p-4 rounded-xl cursor-pointer transition-all bg-bg-secondary border ${selectedAlert?.id === alert.id ? 'border-danger bg-danger/10' : 'border-border hover:bg-bg-tertiary/30'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${alert.status === 'active' ? 'bg-danger/30 text-danger' : 'bg-primary/30 text-primary'}`}>
                        {alert.status === 'active' ? '● Active' : '◎ Responding'}
                      </span>
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />{Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)} min ago
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-bg-tertiary rounded-full flex items-center justify-center"><Users className="w-5 h-5 text-text-secondary" /></div>
                      <div><p className="font-semibold text-text-primary">{alert.studentName}</p><p className="text-xs text-text-secondary">ID: {alert.studentId}</p></div>
                    </div>
                    <div className="flex items-center gap-1 text-text-secondary text-sm mb-3"><MapPin className="w-4 h-4" />{alert.location}</div>
                    <div className="flex gap-2">
                      <button type="button" onClick={e => { e.stopPropagation(); toast.info(`Calling ${alert.studentName}...`); }}
                        className="flex-1 py-2.5 bg-secondary text-white text-sm font-medium rounded-lg hover:bg-secondary-light transition-colors flex items-center justify-center gap-1">
                        <Phone className="w-4 h-4" /> Call Student
                      </button>
                      <button type="button" onClick={e => { e.stopPropagation(); openAssignModal(alert); }}
                        className="flex-1 py-2.5 bg-primary text-bg-primary text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-1">
                        <Radio className="w-4 h-4" /> Assign Patrol
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'heatmap':
        return (
          <div className="flex-1 min-h-0 flex flex-col relative">
            <div className="bg-bg-secondary/90 backdrop-blur-sm border-b border-border px-3 py-2 flex items-center gap-3 flex-wrap z-10">
              <Flame className="w-4 h-4 text-danger shrink-0" />
              <span className="text-xs font-medium text-text-primary">Incident Density (7d)</span>
              <span className="text-text-muted">|</span>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-secondary/60" /><span className="text-[10px] text-text-secondary">Low</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-primary/60" /><span className="text-[10px] text-text-secondary">Med</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-danger/60" /><span className="text-[10px] text-text-secondary">High</span></div>
            </div>
            <div className="flex-1 min-h-0"><DashboardMap showHeatmap={true} selectedAlert={selectedAlert} onAlertClick={handleAlertSelect} /></div>
          </div>
        );

      case 'settings':
        return (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="p-3 sm:p-4">
              {/* Security Profile — Editable */}
              <div className="bg-bg-secondary rounded-xl border border-border p-4 mb-3">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-secondary" />
                    <h3 className="text-sm font-semibold text-text-primary">My Profile</h3>
                  </div>
                  {editingProfile ? (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setEditingProfile(false)} className="p-1.5 bg-bg-tertiary rounded-lg hover:bg-border"><X className="w-4 h-4 text-text-secondary" /></button>
                      <button type="button" onClick={saveProfile} className="p-1.5 bg-primary rounded-lg hover:bg-primary-dark"><Save className="w-4 h-4 text-bg-primary" /></button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => { setProfileForm({ ...profile }); setEditingProfile(true); }}
                      className="flex items-center gap-1 text-xs text-primary font-medium hover:opacity-80">
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                  )}
                </div>
                {/* Avatar row */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                  <div className="w-14 h-14 bg-secondary/20 rounded-full flex items-center justify-center">
                    <Shield className="w-7 h-7 text-secondary" />
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">{profile.name}</p>
                    <p className="text-xs text-text-secondary">Badge #{profile.badgeId}</p>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1 ${profile.status === 'on-duty' ? 'bg-secondary/20 text-secondary' : 'bg-bg-tertiary text-text-muted'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${profile.status === 'on-duty' ? 'bg-secondary' : 'bg-text-muted'}`} />
                      {profile.status === 'on-duty' ? 'On Duty' : 'Off Duty'}
                    </span>
                  </div>
                </div>
                {editingProfile ? (
                  <div className="space-y-3">
                    {[
                      { key: 'name', label: 'Full Name', type: 'text', inputMode: 'text' },
                      { key: 'badgeId', label: 'Badge ID', type: 'text', inputMode: 'text' },
                      { key: 'phone', label: 'Phone', type: 'tel', inputMode: 'numeric' },
                      { key: 'rank', label: 'Rank', type: 'text', inputMode: 'text' },
                      { key: 'area', label: 'Patrol Area', type: 'text', inputMode: 'text' },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="text-xs text-text-muted uppercase tracking-wide mb-1 block">{field.label}</label>
                        <input type={field.type} inputMode={field.inputMode}
                          value={profileForm[field.key] || ''}
                          onChange={e => {
                            let val = e.target.value;
                            if (field.inputMode === 'numeric') { if (!/^[\d\s\+\-\(\)]*$/.test(val)) return; }
                            else if (field.key === 'name') { if (!/^[a-zA-Z\s\.\-']*$/.test(val)) return; }
                            setProfileForm(p => ({ ...p, [field.key]: val }));
                          }}
                          className="w-full h-9 px-3 bg-bg-primary border border-border rounded-lg text-text-primary text-sm outline-none focus:border-primary"
                          style={{ fontSize: '16px' }} />
                      </div>
                    ))}
                    <div>
                      <label className="text-xs text-text-muted uppercase tracking-wide mb-1 block">Shift</label>
                      <select value={profileForm.shift || ''} onChange={e => setProfileForm(p => ({ ...p, shift: e.target.value }))}
                        className="w-full h-9 px-3 bg-bg-primary border border-border rounded-lg text-text-primary text-sm outline-none focus:border-primary">
                        <option value="Morning (6AM–2PM)">Morning (6AM–2PM)</option>
                        <option value="Afternoon (2PM–10PM)">Afternoon (2PM–10PM)</option>
                        <option value="Night (6PM–6AM)">Night (6PM–6AM)</option>
                        <option value="Full Day (8AM–8PM)">Full Day (8AM–8PM)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-text-muted uppercase tracking-wide mb-1 block">Status</label>
                      <div className="flex gap-2">
                        {['on-duty', 'off-duty'].map(s => (
                          <button key={s} type="button" onClick={() => setProfileForm(p => ({ ...p, status: s }))}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${profileForm.status === s ? (s === 'on-duty' ? 'bg-secondary text-white' : 'bg-bg-tertiary text-text-primary border border-border') : 'bg-bg-primary text-text-muted border border-border'}`}>
                            {s === 'on-duty' ? '● On Duty' : '○ Off Duty'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {[
                      { key: 'Phone', val: profile.phone },
                      { key: 'Rank', val: profile.rank },
                      { key: 'Shift', val: profile.shift },
                      { key: 'Area', val: profile.area },
                    ].map((row, i, arr) => (
                      <div key={row.key} className={`flex items-center justify-between py-2 ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
                        <span className="text-xs text-text-secondary">{row.key}</span>
                        <span className="text-xs font-medium text-text-primary">{row.val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notification Settings */}
              <div className="bg-bg-secondary rounded-xl border border-border p-4 mb-3">
                <div className="flex items-center gap-2 mb-3"><Bell className="w-4 h-4 text-primary" /><h3 className="text-sm font-semibold text-text-primary">Notifications</h3></div>
                <div className="space-y-2">
                  {[
                    { label: 'SOS Alerts', desc: 'New SOS triggered', defaultChecked: true },
                    { label: 'Patrol Alerts', desc: 'New assignments', defaultChecked: true },
                    { label: 'System Updates', desc: 'Maintenance info', defaultChecked: false },
                    { label: 'Sound Alerts', desc: 'Critical SOS sounds', defaultChecked: true },
                  ].map((setting) => (
                    <div key={setting.label} className="flex items-center justify-between gap-3 py-1.5">
                      <div className="min-w-0"><p className="text-sm font-medium text-text-primary truncate">{setting.label}</p><p className="text-xs text-text-secondary truncate">{setting.desc}</p></div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" defaultChecked={setting.defaultChecked} className="sr-only peer" onChange={e => toast.success(`${setting.label} ${e.target.checked ? 'enabled' : 'disabled'}`)} />
                        <div className="w-9 h-5 bg-bg-tertiary rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patrol Units — quick view */}
              <div className="bg-bg-secondary rounded-xl border border-border p-4 mb-3">
                <div className="flex items-center gap-2 mb-3"><Radio className="w-4 h-4 text-primary" /><h3 className="text-sm font-semibold text-text-primary">Active Patrol Units</h3></div>
                <div className="space-y-2">
                  {Object.values(PATROL_DETAILS).map(p => (
                    <div key={p.name} className="flex items-center gap-3 py-1.5 border-b border-border last:border-0">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${p.status === 'available' ? 'bg-secondary' : 'bg-primary'}`} />
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium text-text-primary">{p.name}</p><p className="text-xs text-text-muted truncate">{p.officer} · {p.area}</p></div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'available' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}>{p.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-bg-secondary rounded-xl border border-danger/30 p-4">
                <button type="button" onClick={onSignOut} className="w-full py-2.5 bg-danger/10 text-danger border border-danger/30 text-sm font-medium rounded-lg hover:bg-danger/20 transition-colors flex items-center justify-center gap-2">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <>
            <StatsOverview />
            <div className="flex-1 min-h-0 flex flex-col xl:flex-row overflow-hidden">
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex-1 min-h-0"><DashboardMap showHeatmap={showHeatmap} selectedAlert={selectedAlert} onAlertClick={handleAlertSelect} /></div>
                <div className="lg:hidden min-h-0 h-[45dvh] bg-bg-secondary">
                  <SOSAlertsPanel selectedAlertId={selectedAlert?.id} onSelectAlert={handleAlertSelect} onAssignPatrol={openAssignModal} />
                </div>
              </div>
              <div className="hidden xl:block w-80 min-h-0 bg-bg-secondary">
                <SOSAlertsPanel selectedAlertId={selectedAlert?.id} onSelectAlert={handleAlertSelect} onAssignPatrol={openAssignModal} />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="flex h-[100dvh] bg-bg-primary overflow-hidden">
      <div className="hidden md:flex"><Sidebar activeTab={activeTab} onTabChange={setActiveTab} onSignOut={onSignOut} /></div>
      {mobileSidebarOpen && <Sidebar variant="drawer" activeTab={activeTab} onTabChange={setActiveTab} onClose={() => setMobileSidebarOpen(false)} onSignOut={onSignOut} />}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-bg-secondary border-b border-border px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-text-primary">{getHeaderTitle()}</h1>
              <p className="text-sm text-text-secondary">Real-time campus security monitoring</p>
            </div>
            <button type="button" onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden w-10 h-10 rounded-lg bg-bg-tertiary text-text-primary flex items-center justify-center hover:bg-border transition-colors shrink-0" aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </button>
          </div>
          {activeTab === 'dashboard' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button type="button" onClick={() => setShowHeatmap(false)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${!showHeatmap ? 'bg-primary text-bg-primary' : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'}`}>
                <Map className="w-4 h-4" /> Live Map
              </button>
              <button type="button" onClick={() => setShowHeatmap(true)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${showHeatmap ? 'bg-primary text-bg-primary' : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'}`}>
                <Flame className="w-4 h-4" /> Heatmap
              </button>
            </div>
          )}
        </header>
        {renderMainContent()}
      </div>

      {/* Patrol Assignment Modal */}
      {assignModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="bg-bg-secondary rounded-2xl border border-border w-full max-w-sm overflow-hidden">
            <div className="px-4 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-primary" />
                <span className="font-bold text-text-primary">Assign Patrol</span>
              </div>
              <button type="button" onClick={() => setAssignModal(null)} className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"><X className="w-5 h-5 text-text-secondary" /></button>
            </div>

            {/* Alert summary */}
            <div className="mx-4 mt-4 p-3 bg-danger/10 rounded-xl border border-danger/30 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-danger" />
                <p className="text-sm font-semibold text-danger">SOS — {assignModal.alert.studentName}</p>
              </div>
              <p className="text-xs text-text-secondary flex items-center gap-1"><MapPin className="w-3 h-3" />{assignModal.alert.location}</p>
              <p className="text-xs text-text-muted mt-0.5">ID: {assignModal.alert.studentId}</p>
            </div>

            <p className="px-4 text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Select a Patrol Unit</p>
            <div className="px-4 space-y-2 max-h-52 overflow-y-auto pb-1">
              {Object.entries(PATROL_DETAILS).map(([id, p]) => {
                const isSelected = selectedPatrol === id;
                const unavailable = p.status !== 'available';
                return (
                  <button key={id} type="button" disabled={unavailable}
                    onClick={() => setSelectedPatrol(isSelected ? null : id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${isSelected ? 'border-primary bg-primary/10' : unavailable ? 'border-border opacity-50 cursor-not-allowed' : 'border-border hover:border-primary/40 bg-bg-primary'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary/20' : 'bg-bg-tertiary'}`}>
                        <Shield className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-text-muted'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-text-primary">{p.name}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${p.status === 'available' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}>{p.status}</span>
                        </div>
                        <p className="text-xs text-text-secondary truncate">{p.officer}</p>
                        <p className="text-xs text-text-muted">{p.vehicle} · {p.area}</p>
                      </div>
                      {isSelected && <CheckCircle className="w-5 h-5 text-primary shrink-0" />}
                    </div>
                    {isSelected && (
                      <div className="mt-2 pt-2 border-t border-primary/20 flex items-center gap-1 text-xs text-text-secondary">
                        <Phone className="w-3 h-3" /> {p.phone}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-border mt-3">
              <button type="button" onClick={handleAssign} disabled={!selectedPatrol || assigning}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${selectedPatrol && !assigning ? 'bg-primary text-bg-primary hover:bg-primary-dark' : 'bg-bg-tertiary text-text-muted cursor-not-allowed'}`}>
                {assigning ? (
                  <><span className="w-4 h-4 border-2 border-bg-primary/40 border-t-bg-primary rounded-full animate-spin" /> Assigning...</>
                ) : (
                  <><UserCheck className="w-4 h-4" /> Confirm Assignment</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
