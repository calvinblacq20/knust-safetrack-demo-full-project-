import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Bell, Shield, LogOut, ChevronRight, Edit2, Save, X, Plus, Trash2, Check, BellOff, Volume2, VolumeX, Navigation } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';
import MenuDrawer from '../components/MenuDrawer';
import { userAPI } from '../services/api.js';
import useToast from '../hooks/useToast.js';
import { useAuth } from '../App.jsx';

const DEFAULT_USER = {
  fullName: 'Kofi Mensah', studentId: '20481234',
  email: 'kofi.mensah@st.knust.edu.gh', phone: '+233 24 123 4567',
  hostel: 'Unity Hall (Conti)',
  emergencyContacts: [{ name: 'Mom', phone: '+233 20 987 6543' }, { name: 'Dad', phone: '+233 24 555 1234' }],
  savedLocations: [
    { id: 'sl-1', name: 'Home (Hostel)', location: 'Unity Hall, Room 215' },
    { id: 'sl-2', name: 'Main Library', location: 'KNUST Library' },
    { id: 'sl-3', name: 'Tech Junction', location: 'Engineering Faculty' },
  ],
};

const DEFAULT_NOTIF = { sos: true, walk: true, alerts: true, patrol: false, sound: true, vibrate: true };
const DEFAULT_LOC_FORM = { name: '', location: '' };

export default function Profile({ onSignOut }) {
  const toast = useToast();
  const { currentUser, setCurrentUser } = useAuth() || {};
  const [showMenu, setShowMenu] = useState(false);
  const [userData, setUserData] = useState(currentUser || DEFAULT_USER);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [addingContact, setAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });

  // Notification settings panel
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [notifSettings, setNotifSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('safetrack_notif') || 'null') || DEFAULT_NOTIF; }
    catch { return DEFAULT_NOTIF; }
  });

  // Saved locations panel
  const [showLocPanel, setShowLocPanel] = useState(false);
  const [addingLoc, setAddingLoc] = useState(false);
  const [newLoc, setNewLoc] = useState(DEFAULT_LOC_FORM);
  const [editingLocId, setEditingLocId] = useState(null);
  const [editLocForm, setEditLocForm] = useState(DEFAULT_LOC_FORM);

  useEffect(() => {
    userAPI.getMe().then(u => {
      setUserData(u);
      if (setCurrentUser) setCurrentUser(u);
    }).catch(() => {});
  }, []);

  const toggleNotif = (key) => {
    const updated = { ...notifSettings, [key]: !notifSettings[key] };
    setNotifSettings(updated);
    localStorage.setItem('safetrack_notif', JSON.stringify(updated));
    toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${updated[key] ? 'on' : 'off'}`);
  };

  const handleEdit = () => {
    setEditForm({ fullName: userData.fullName, phone: userData.phone, hostel: userData.hostel });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await userAPI.updateMe(editForm);
      setUserData(updated);
      if (setCurrentUser) setCurrentUser(updated);
      setEditing(false);
      toast.success('Profile updated');
    } catch {
      setUserData(prev => ({ ...prev, ...editForm }));
      setEditing(false);
      toast.success('Profile updated');
    } finally { setSaving(false); }
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) return;
    const updated = { emergencyContacts: [...(userData.emergencyContacts || []), newContact] };
    try { const result = await userAPI.updateMe(updated); setUserData(result); }
    catch { setUserData(prev => ({ ...prev, ...updated })); }
    setNewContact({ name: '', phone: '' });
    setAddingContact(false);
    toast.success('Emergency contact added');
  };

  const handleRemoveContact = async (idx) => {
    const contacts = userData.emergencyContacts.filter((_, i) => i !== idx);
    try { const result = await userAPI.updateMe({ emergencyContacts: contacts }); setUserData(result); }
    catch { setUserData(prev => ({ ...prev, emergencyContacts: contacts })); }
    toast.success('Contact removed');
  };

  const handleAddLocation = () => {
    if (!newLoc.name || !newLoc.location) { toast.error('Fill in both fields'); return; }
    const loc = { id: `sl-${Date.now()}`, ...newLoc };
    const updated = [...(userData.savedLocations || []), loc];
    setUserData(prev => ({ ...prev, savedLocations: updated }));
    setNewLoc(DEFAULT_LOC_FORM);
    setAddingLoc(false);
    toast.success('Location saved');
  };

  const handleDeleteLocation = (id) => {
    const updated = (userData.savedLocations || []).filter(l => l.id !== id);
    setUserData(prev => ({ ...prev, savedLocations: updated }));
    toast.success('Location removed');
  };

  const handleEditLocation = (loc) => {
    setEditingLocId(loc.id);
    setEditLocForm({ name: loc.name, location: loc.location });
  };

  const handleSaveLocation = () => {
    const updated = (userData.savedLocations || []).map(l =>
      l.id === editingLocId ? { ...l, ...editLocForm } : l
    );
    setUserData(prev => ({ ...prev, savedLocations: updated }));
    setEditingLocId(null);
    toast.success('Location updated');
  };

  const u = userData;

  // ── Notification Panel overlay ───────────────────────────────
  if (showNotifPanel) {
    const notifItems = [
      { key: 'sos', label: 'SOS Alerts', desc: 'Notified when a nearby SOS is triggered', icon: '🚨' },
      { key: 'walk', label: 'Walk Updates', desc: 'Status updates during active walks', icon: '🚶' },
      { key: 'alerts', label: 'Campus Alerts', desc: 'Safety bulletins from security', icon: '📢' },
      { key: 'patrol', label: 'Patrol Nearby', desc: 'When a patrol unit is near you', icon: '🛡️' },
      { key: 'sound', label: 'Sound', desc: 'Play sounds for critical alerts', icon: '🔔' },
      { key: 'vibrate', label: 'Vibration', desc: 'Vibrate for all notifications', icon: '📳' },
    ];
    return (
      <div className="relative w-full min-h-screen bg-bg-primary pb-20">
        <div className="sticky top-0 z-10 bg-bg-secondary border-b border-border px-4 py-4 flex items-center gap-3">
          <button onClick={() => setShowNotifPanel(false)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-bg-tertiary transition-colors">
            <ChevronRight className="w-5 h-5 text-text-secondary rotate-180" />
          </button>
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-text-primary">Notification Settings</h2>
        </div>
        <div className="px-4 pt-4 space-y-3">
          {notifItems.map(item => (
            <div key={item.key} className="bg-bg-secondary rounded-xl border border-border px-4 py-3.5 flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">{item.label}</p>
                <p className="text-xs text-text-secondary mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => toggleNotif(item.key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${notifSettings[item.key] ? 'bg-primary' : 'bg-bg-tertiary'}`}
                aria-label={`Toggle ${item.label}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${notifSettings[item.key] ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          ))}
          <p className="text-xs text-text-muted text-center pt-2">Settings are saved locally on this device</p>
        </div>
        <BottomNav activeTab="profile" />
      </div>
    );
  }

  // ── Saved Locations Panel overlay ───────────────────────────
  if (showLocPanel) {
    return (
      <div className="relative w-full min-h-screen bg-bg-primary pb-20">
        <div className="sticky top-0 z-10 bg-bg-secondary border-b border-border px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowLocPanel(false)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-bg-tertiary transition-colors">
              <ChevronRight className="w-5 h-5 text-text-secondary rotate-180" />
            </button>
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-text-primary">Saved Locations</h2>
          </div>
          <button onClick={() => setAddingLoc(true)} className="flex items-center gap-1 text-sm text-primary font-medium hover:opacity-80">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        <div className="px-4 pt-4 space-y-3">
          {addingLoc && (
            <div className="bg-bg-secondary rounded-xl border border-primary/40 p-4 space-y-2">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">New Location</p>
              <input
                type="text" placeholder="Label (e.g. Home, Library)"
                value={newLoc.name}
                onChange={e => setNewLoc(p => ({ ...p, name: e.target.value }))}
                className="w-full h-10 px-3 bg-bg-primary border border-border rounded-lg text-text-primary text-sm outline-none focus:border-primary"
                style={{ fontSize: '16px' }}
              />
              <input
                type="text" placeholder="Address or description"
                value={newLoc.location}
                onChange={e => setNewLoc(p => ({ ...p, location: e.target.value }))}
                className="w-full h-10 px-3 bg-bg-primary border border-border rounded-lg text-text-primary text-sm outline-none focus:border-primary"
                style={{ fontSize: '16px' }}
              />
              <div className="flex gap-2 pt-1">
                <button onClick={() => { setAddingLoc(false); setNewLoc(DEFAULT_LOC_FORM); }} className="flex-1 py-2 bg-bg-tertiary text-text-secondary rounded-lg text-sm">Cancel</button>
                <button onClick={handleAddLocation} className="flex-1 py-2 bg-primary text-bg-primary rounded-lg text-sm font-semibold">Save</button>
              </div>
            </div>
          )}
          {(u.savedLocations || []).length === 0 && !addingLoc && (
            <div className="bg-bg-secondary rounded-xl border border-border p-6 text-center">
              <MapPin className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-secondary">No saved locations yet</p>
              <button onClick={() => setAddingLoc(true)} className="mt-3 text-sm text-primary font-medium">Add your first location</button>
            </div>
          )}
          {(u.savedLocations || []).map(loc => (
            <div key={loc.id} className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
              {editingLocId === loc.id ? (
                <div className="p-4 space-y-2">
                  <input type="text" value={editLocForm.name} onChange={e => setEditLocForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full h-10 px-3 bg-bg-primary border border-primary rounded-lg text-text-primary text-sm outline-none"
                    style={{ fontSize: '16px' }} placeholder="Label" />
                  <input type="text" value={editLocForm.location} onChange={e => setEditLocForm(p => ({ ...p, location: e.target.value }))}
                    className="w-full h-10 px-3 bg-bg-primary border border-border rounded-lg text-text-primary text-sm outline-none focus:border-primary"
                    style={{ fontSize: '16px' }} placeholder="Address" />
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setEditingLocId(null)} className="flex-1 py-2 bg-bg-tertiary text-text-secondary rounded-lg text-sm">Cancel</button>
                    <button onClick={handleSaveLocation} className="flex-1 py-2 bg-primary text-bg-primary rounded-lg text-sm font-semibold">Save</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary">{loc.name}</p>
                    <p className="text-xs text-text-secondary truncate">{loc.location}</p>
                  </div>
                  <button onClick={() => handleEditLocation(loc)} className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors" aria-label="Edit">
                    <Edit2 className="w-4 h-4 text-text-muted hover:text-primary" />
                  </button>
                  <button onClick={() => handleDeleteLocation(loc.id)} className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors" aria-label="Delete">
                    <Trash2 className="w-4 h-4 text-text-muted hover:text-danger" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <BottomNav activeTab="profile" />
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-bg-primary pb-20">
      <TopBar currentLocation="Profile" showSearch={false} onMenuClick={() => setShowMenu(true)} />
      <div className="pt-20 px-4">
        {/* Profile Header */}
        <div className="bg-bg-secondary rounded-2xl p-6 border border-border mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              {editing ? (
                <input type="text" inputMode="text" autoComplete="name"
                  value={editForm.fullName}
                  onChange={e => { if (/^[a-zA-Z\s\-']*$/.test(e.target.value)) setEditForm(p => ({ ...p, fullName: e.target.value })) }}
                  className="w-full h-9 px-3 bg-bg-primary border border-primary rounded-lg text-text-primary font-bold outline-none mb-1"
                  style={{ fontSize: '16px' }} placeholder="Full name" />
              ) : (
                <h2 className="text-lg font-bold text-text-primary">{u.fullName}</h2>
              )}
              <p className="text-sm text-text-secondary">ID: {u.studentId}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-xs text-primary">Active</span>
              </div>
            </div>
            {editing ? (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="p-2 bg-bg-tertiary rounded-lg hover:bg-border"><X className="w-4 h-4 text-text-secondary" /></button>
                <button onClick={handleSave} disabled={saving} className="p-2 bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-50"><Save className="w-4 h-4 text-bg-primary" /></button>
              </div>
            ) : (
              <button onClick={handleEdit} className="p-2 bg-bg-tertiary rounded-lg hover:bg-border transition-colors"><Edit2 className="w-5 h-5 text-text-secondary" /></button>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-bg-secondary rounded-xl border border-border mb-6 overflow-hidden">
          <div className="px-4 py-3 border-b border-border"><h3 className="font-semibold text-text-primary text-sm">Contact Information</h3></div>
          <div className="divide-y divide-border">
            <div className="flex items-center gap-3 px-4 py-3">
              <Mail className="w-5 h-5 text-text-muted" />
              <div className="flex-1"><p className="text-xs text-text-secondary">Email</p><p className="text-sm text-text-primary">{u.email}</p></div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <Phone className="w-5 h-5 text-text-muted" />
              <div className="flex-1">
                <p className="text-xs text-text-secondary">Phone</p>
                {editing ? (
                  <input type="tel" inputMode="numeric" autoComplete="tel"
                    value={editForm.phone}
                    onChange={e => { if (/^[\d\s\+\-\(\)]*$/.test(e.target.value)) setEditForm(p => ({ ...p, phone: e.target.value })) }}
                    maxLength={15}
                    className="w-full h-8 px-2 bg-bg-primary border border-border rounded text-text-primary text-sm outline-none focus:border-primary"
                    style={{ fontSize: '16px' }} placeholder="+233 XX XXX XXXX" />
                ) : (
                  <p className="text-sm text-text-primary">{u.phone || '—'}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <MapPin className="w-5 h-5 text-text-muted" />
              <div className="flex-1">
                <p className="text-xs text-text-secondary">Hostel</p>
                {editing ? (
                  <input type="text" inputMode="text"
                    value={editForm.hostel}
                    onChange={e => setEditForm(p => ({ ...p, hostel: e.target.value }))}
                    className="w-full h-8 px-2 bg-bg-primary border border-border rounded text-text-primary text-sm outline-none focus:border-primary"
                    style={{ fontSize: '16px' }} placeholder="Hostel name" />
                ) : (
                  <p className="text-sm text-text-primary">{u.hostel || '—'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-bg-secondary rounded-xl border border-border mb-6 overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-text-primary text-sm">Emergency Contacts</h3>
            <button onClick={() => setAddingContact(true)} className="text-xs text-primary hover:opacity-80 flex items-center gap-1 font-medium"><Plus className="w-3 h-3" /> Add</button>
          </div>
          {addingContact && (
            <div className="p-4 border-b border-border bg-bg-primary/50 space-y-2">
              <input type="text" inputMode="text" placeholder="Contact name" value={newContact.name}
                onChange={e => { if (/^[a-zA-Z\s\-']*$/.test(e.target.value)) setNewContact(p => ({ ...p, name: e.target.value })) }}
                className="w-full h-9 px-3 bg-bg-secondary border border-border rounded-lg text-text-primary text-sm outline-none focus:border-primary" style={{ fontSize: '16px' }} />
              <input type="tel" inputMode="numeric" placeholder="+233 XX XXX XXXX" value={newContact.phone}
                onChange={e => { if (/^[\d\s\+\-\(\)]*$/.test(e.target.value)) setNewContact(p => ({ ...p, phone: e.target.value })) }}
                maxLength={15}
                className="w-full h-9 px-3 bg-bg-secondary border border-border rounded-lg text-text-primary text-sm outline-none focus:border-primary" style={{ fontSize: '16px' }} />
              <div className="flex gap-2">
                <button onClick={() => setAddingContact(false)} className="flex-1 py-2 bg-bg-tertiary text-text-secondary rounded-lg text-sm">Cancel</button>
                <button onClick={handleAddContact} className="flex-1 py-2 bg-primary text-bg-primary rounded-lg text-sm font-semibold">Add</button>
              </div>
            </div>
          )}
          <div className="divide-y divide-border">
            {(u.emergencyContacts || []).map((contact, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 bg-danger/20 rounded-full flex items-center justify-center"><Shield className="w-4 h-4 text-danger" /></div>
                <div className="flex-1"><p className="text-sm font-medium text-text-primary">{contact.name}</p><p className="text-xs text-text-secondary">{contact.phone}</p></div>
                <button onClick={() => handleRemoveContact(i)} className="p-1.5 hover:bg-bg-tertiary rounded transition-colors"><Trash2 className="w-4 h-4 text-text-muted hover:text-danger" /></button>
              </div>
            ))}
            {(u.emergencyContacts || []).length === 0 && (<div className="px-4 py-4 text-sm text-text-secondary text-center">No emergency contacts added</div>)}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <button
            onClick={() => setShowNotifPanel(true)}
            className="w-full flex items-center gap-3 bg-bg-secondary rounded-xl px-4 py-3.5 border border-border hover:border-primary/40 transition-colors"
          >
            <Bell className="w-5 h-5 text-primary" />
            <span className="flex-1 text-left text-sm text-text-primary font-medium">Notification Settings</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">{Object.values(notifSettings).filter(Boolean).length} on</span>
              <ChevronRight className="w-5 h-5 text-text-muted" />
            </div>
          </button>
          <button
            onClick={() => setShowLocPanel(true)}
            className="w-full flex items-center gap-3 bg-bg-secondary rounded-xl px-4 py-3.5 border border-border hover:border-primary/40 transition-colors"
          >
            <MapPin className="w-5 h-5 text-primary" />
            <span className="flex-1 text-left text-sm text-text-primary font-medium">Saved Locations</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">{(u.savedLocations || []).length} saved</span>
              <ChevronRight className="w-5 h-5 text-text-muted" />
            </div>
          </button>
          <button onClick={onSignOut} className="w-full flex items-center gap-3 bg-danger/10 rounded-xl px-4 py-3.5 border border-danger/20 hover:bg-danger/20 transition-colors">
            <LogOut className="w-5 h-5 text-danger" />
            <span className="flex-1 text-left text-sm font-semibold text-danger">Sign Out</span>
          </button>
        </div>
      </div>
      <BottomNav activeTab="profile" />
      <MenuDrawer isOpen={showMenu} onClose={() => setShowMenu(false)} onSignOut={onSignOut} />
    </div>
  );
}
