/**
 * KNUST SafeTrack — Optimized Backend API
 * Node.js / Express REST API with JWT auth, input validation & sanitization
 */

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

const SALT = 'knust-safetrack-salt-2025';
const hashPassword = (pw) => createHash('sha256').update(pw + SALT).digest('hex');
const verifyPassword = (pw, hash) => hashPassword(pw) === hash;

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'knust-safetrack-secret-2025';

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '2mb' }));

// ─── Input sanitization helpers ───────────────────────────────────────────────
const sanitize = (str) => (str || '').toString().trim().replace(/[<>]/g, '');
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isValidPhone = (p) => /^\+?[\d\s\-()]{7,15}$/.test(p);
const isAlphaName = (n) => /^[a-zA-Z\s'\-]+$/.test(n);

// ─── In-Memory Data Store ──────────────────────────────────────────────────────
const db = {
  users: [
    {
      id: 'u-001', fullName: 'Kofi Mensah', email: 'kofi.mensah@st.knust.edu.gh',
      studentId: '20481234', phone: '+233 24 123 4567', hostel: 'Unity Hall (Conti)',
      town: 'Ayeduase', gender: 'Male', userType: 'student',
      password: hashPassword('password123'),
      emergencyContacts: [
        { name: 'Mom', phone: '+233 20 987 6543' },
        { name: 'Dad', phone: '+233 24 555 1234' },
      ],
      savedLocations: [
        { id: 'sl-1', name: 'Home (Hostel)', location: 'Unity Hall, Room 215' },
        { id: 'sl-2', name: 'Main Library', location: 'KNUST Library' },
        { id: 'sl-3', name: 'Tech Junction', location: 'Engineering Faculty' },
      ],
      photoUrl: null, createdAt: new Date(Date.now() - 30*24*3600000).toISOString(), isActive: true,
    },
    {
      id: 'u-sec-001', fullName: 'Security Admin', email: 'admin@security.knust.edu.gh',
      studentId: 'SEC-001', phone: '+233 32 206 0331', hostel: null, town: null,
      gender: 'Male', userType: 'security', password: hashPassword('password123'),
      emergencyContacts: [], savedLocations: [],
      photoUrl: null, shift: 'Night (6PM–6AM)', area: 'Main Campus',
      createdAt: new Date(Date.now() - 90*24*3600000).toISOString(), isActive: true,
    },
  ],

  sosAlerts: [
    { id: 'SOS-001', userId: 'u-demo-2', studentId: '2048112', studentName: 'Kwame Mensah', location: 'Near Brunei Hostel', lat: 6.6805, lng: -1.5678, timestamp: new Date(Date.now() - 5*60000).toISOString(), status: 'active', respondedBy: null },
    { id: 'SOS-002', userId: 'u-demo-3', studentId: '2049234', studentName: 'Ama Serwaa', location: 'Hall 7 Junction', lat: 6.6782, lng: -1.5689, timestamp: new Date(Date.now() - 12*60000).toISOString(), status: 'active', respondedBy: null },
    { id: 'SOS-003', userId: 'u-demo-4', studentId: '2047891', studentName: 'Kofi Asante', location: 'Near JQB', lat: 6.6731, lng: -1.5672, timestamp: new Date(Date.now() - 3*60000).toISOString(), status: 'responding', respondedBy: 'u-sec-001' },
  ],

  walks: [
    { id: 'WALK-001', userId: 'u-demo-5', studentId: '2050456', studentName: 'Efya Owusu', from: 'Main Library', to: 'Hall 7', startTime: new Date(Date.now() - 8*60000).toISOString(), companion: 'security', currentLat: 6.6755, currentLng: -1.5720, status: 'active' },
    { id: 'WALK-002', userId: 'u-demo-6', studentId: '2048789', studentName: 'Yaw Boateng', from: 'Engineering', to: 'Ayeduase', startTime: new Date(Date.now() - 15*60000).toISOString(), companion: 'friend', currentLat: 6.6710, currentLng: -1.5660, status: 'active' },
  ],

  alerts: [
    { id: 'a-001', title: 'Safety Notice', message: 'Avoid unlit paths near Tech Junction after 10 PM.', location: 'Tech Junction', time: new Date(Date.now() - 30*60000).toISOString(), type: 'notice', createdBy: 'u-sec-001' },
    { id: 'a-002', title: 'Shuttle Update', message: 'Route A delays due to high traffic near Commercial Area.', location: 'Commercial Area', time: new Date(Date.now() - 105*60000).toISOString(), type: 'shuttle', createdBy: 'u-sec-001' },
    { id: 'a-003', title: 'Security Advisory', message: 'Increased patrols around Main Library tonight.', location: 'Main Library', time: new Date(Date.now() - 24*3600000).toISOString(), type: 'security', createdBy: 'u-sec-001' },
  ],

  trips: {
    'u-001': [
      { id: 'trip-1', type: 'walk', title: 'Walk With Security', from: 'Main Library', to: 'Hall 7', date: new Date(Date.now() - 90*60000).toISOString(), duration: '12 min', status: 'completed' },
      { id: 'trip-2', type: 'share', title: 'Location Shared', from: 'JQB', to: 'Brunei Hostel', date: new Date(Date.now() - 24*3600000).toISOString(), duration: '18 min', status: 'completed' },
      { id: 'trip-3', type: 'walk', title: 'Walk With Friend', from: 'Tech Junction', to: 'Gaza', date: new Date(Date.now() - 2*24*3600000).toISOString(), duration: '25 min', status: 'completed' },
      { id: 'trip-4', type: 'sos', title: 'SOS Alert', from: 'Near Casely-Hayford', to: 'Security Response', date: new Date(Date.now() - 4*24*3600000).toISOString(), duration: '3 min', status: 'resolved' },
    ],
  },

  patrolUnits: [
    { id: 'PATROL-1', name: 'Unit Alpha', lat: 6.6760, lng: -1.5700, status: 'available', officerName: 'Sgt. Owusu' },
    { id: 'PATROL-2', name: 'Unit Beta', lat: 6.6720, lng: -1.5680, status: 'responding', officerName: 'Cpl. Asante' },
    { id: 'PATROL-3', name: 'Unit Gamma', lat: 6.6800, lng: -1.5740, status: 'available', officerName: 'Sgt. Boateng' },
  ],

  conversations: {
    'u-001': [
      {
        id: 'conv-1', partnerId: 'u-demo-kwame', partnerName: 'Kwame Asante', partnerHostel: 'Unity Hall',
        partnerAvatar: 'KA', isGroup: false, lastMessage: 'Are you heading to the library tonight?',
        lastMessageTime: new Date(Date.now() - 18*60000).toISOString(), unread: 2,
        messages: [
          { id: 'm1', senderId: 'u-demo-kwame', text: 'Hey! Are you still at the library?', time: new Date(Date.now() - 30*60000).toISOString() },
          { id: 'm2', senderId: 'u-001', text: 'Yeah I am. Planning to leave around 10', time: new Date(Date.now() - 28*60000).toISOString() },
          { id: 'm3', senderId: 'u-demo-kwame', text: 'Are you heading to the library tonight?', time: new Date(Date.now() - 18*60000).toISOString() },
          { id: 'm4', senderId: 'u-demo-kwame', text: 'I was thinking we could walk together. Same direction', time: new Date(Date.now() - 18*60000).toISOString() },
        ],
      },
      {
        id: 'conv-2', partnerId: 'u-demo-ama', partnerName: 'Ama Serwaa', partnerHostel: 'Queens Hall',
        partnerAvatar: 'AS', isGroup: false, lastMessage: 'Thanks for the walk! Got home safe 🙏',
        lastMessageTime: new Date(Date.now() - 105*60000).toISOString(), unread: 0,
        messages: [{ id: 'm5', senderId: 'u-demo-ama', text: 'Thanks for the walk! Got home safe 🙏', time: new Date(Date.now() - 105*60000).toISOString() }],
      },
      {
        id: 'conv-3', partnerId: 'group-brunei', partnerName: 'Walk Group — Brunei', partnerHostel: 'Group • 4 members',
        partnerAvatar: 'WG', isGroup: true, lastMessage: 'Kofi: Who is heading to Brunei around 10?',
        lastMessageTime: new Date(Date.now() - 130*60000).toISOString(), unread: 5,
        messages: [
          { id: 'm6', senderId: 'u-001', text: 'Who is heading to Brunei around 10?', time: new Date(Date.now() - 130*60000).toISOString() },
          { id: 'm7', senderId: 'u-demo-yaw', text: 'I can walk from Tech Junction!', time: new Date(Date.now() - 128*60000).toISOString() },
        ],
      },
    ],
  },
};

// ─── Middleware ────────────────────────────────────────────────────────────────

function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing or invalid token' });
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token expired or invalid. Please sign in again.' });
  }
}

function requireSecurity(req, res, next) {
  if (req.user.userType !== 'security') return res.status(403).json({ error: 'Security personnel only' });
  next();
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Auth ──────────────────────────────────────────────────────────────────────

app.post('/api/auth/signin', (req, res) => {
  try {
    const email = sanitize(req.body.email).toLowerCase();
    const password = (req.body.password || '').toString();
    const userType = sanitize(req.body.userType) || 'student';

    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email format' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const user = db.users.find(u => u.email.toLowerCase() === email && u.userType === userType);
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials. Please check your email and password.' });
    }
    if (!user.isActive) return res.status(403).json({ error: 'Account is deactivated. Contact security.' });

    const token = jwt.sign({ userId: user.id, userType: user.userType, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: 'Sign in failed. Please try again.' });
  }
});

app.post('/api/auth/signup', (req, res) => {
  try {
    const fullName = sanitize(req.body.fullName);
    const email = sanitize(req.body.email).toLowerCase();
    const password = (req.body.password || '').toString();
    const studentId = sanitize(req.body.studentId);
    const phone = sanitize(req.body.phone);
    const hostel = sanitize(req.body.hostel);
    const town = sanitize(req.body.town);
    const landmark = sanitize(req.body.landmark);
    const gender = sanitize(req.body.gender);
    const userType = sanitize(req.body.userType) || 'student';

    // Validate required fields
    if (!fullName) return res.status(400).json({ error: 'Full name is required' });
    if (!isAlphaName(fullName)) return res.status(400).json({ error: 'Name must contain letters only' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ error: 'Valid email is required' });
    if (!studentId) return res.status(400).json({ error: 'Student/Staff ID is required' });
    if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    if (phone && !isValidPhone(phone)) return res.status(400).json({ error: 'Invalid phone number format' });

    if (db.users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'This email is already registered' });
    }
    if (db.users.find(u => u.studentId === studentId)) {
      return res.status(409).json({ error: 'This Student/Staff ID is already registered' });
    }

    const newUser = {
      id: `u-${uuidv4().slice(0, 8)}`,
      fullName, email, studentId, phone, hostel, town, landmark, gender,
      userType, password: hashPassword(password),
      emergencyContacts: [], savedLocations: [],
      photoUrl: null, createdAt: new Date().toISOString(), isActive: true,
    };

    db.users.push(newUser);
    const token = jwt.sign({ userId: newUser.id, userType: newUser.userType, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = newUser;
    res.status(201).json({ token, user: safeUser, message: 'Account created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

app.post('/api/auth/forgot-password', (req, res) => {
  const email = sanitize(req.body.email).toLowerCase();
  if (!email || !isValidEmail(email)) return res.status(400).json({ error: 'Valid email is required' });
  // Always return success to prevent email enumeration
  res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
});

// ─── User ─────────────────────────────────────────────────────────────────────

app.get('/api/me', authenticate, (req, res) => {
  const user = db.users.find(u => u.id === req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

app.patch('/api/me', authenticate, (req, res) => {
  try {
    const idx = db.users.findIndex(u => u.id === req.user.userId);
    if (idx === -1) return res.status(404).json({ error: 'User not found' });

    const allowed = ['fullName', 'phone', 'hostel', 'town', 'landmark', 'photoUrl', 'emergencyContacts', 'savedLocations'];
    const updates = {};

    for (const k of allowed) {
      if (req.body[k] === undefined) continue;
      if (k === 'fullName') {
        const v = sanitize(req.body[k]);
        if (!isAlphaName(v)) return res.status(400).json({ error: 'Name must contain letters only' });
        updates[k] = v;
      } else if (k === 'phone') {
        const v = sanitize(req.body[k]);
        if (v && !isValidPhone(v)) return res.status(400).json({ error: 'Invalid phone number format' });
        updates[k] = v;
      } else if (k === 'emergencyContacts') {
        const contacts = Array.isArray(req.body[k]) ? req.body[k] : [];
        updates[k] = contacts.map(c => ({
          name: sanitize(c.name),
          phone: sanitize(c.phone),
        })).filter(c => c.name && c.phone);
      } else {
        updates[k] = k === 'savedLocations' ? req.body[k] : sanitize(req.body[k]);
      }
    }

    db.users[idx] = { ...db.users[idx], ...updates };
    const { password, ...safeUser } = db.users[idx];
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// ─── SOS ──────────────────────────────────────────────────────────────────────

app.get('/api/sos', authenticate, (req, res) => {
  if (req.user.userType === 'security') {
    res.json(db.sosAlerts.filter(a => a.status !== 'resolved'));
  } else {
    res.json(db.sosAlerts.filter(a => a.userId === req.user.userId));
  }
});

app.post('/api/sos', authenticate, (req, res) => {
  try {
    const lat = parseFloat(req.body.lat) || 6.6745;
    const lng = parseFloat(req.body.lng) || -1.5716;
    const location = sanitize(req.body.location) || 'Unknown location';

    if (isNaN(lat) || lat < -90 || lat > 90) return res.status(400).json({ error: 'Invalid latitude' });
    if (isNaN(lng) || lng < -180 || lng > 180) return res.status(400).json({ error: 'Invalid longitude' });

    const user = db.users.find(u => u.id === req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const alert = {
      id: `SOS-${Date.now()}`,
      userId: req.user.userId,
      studentId: user.studentId,
      studentName: user.fullName,
      location, lat, lng,
      timestamp: new Date().toISOString(),
      status: 'active',
      respondedBy: null,
    };
    db.sosAlerts.unshift(alert);
    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create SOS alert' });
  }
});

app.patch('/api/sos/:id', authenticate, requireSecurity, (req, res) => {
  const idx = db.sosAlerts.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'SOS alert not found' });
  const validStatuses = ['active', 'responding', 'resolved'];
  const status = req.body.status;
  if (!validStatuses.includes(status)) return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
  db.sosAlerts[idx] = { ...db.sosAlerts[idx], status, respondedBy: req.user.userId };
  res.json(db.sosAlerts[idx]);
});

// ─── Alerts ───────────────────────────────────────────────────────────────────

app.get('/api/alerts', authenticate, (req, res) => {
  res.json(db.alerts.sort((a, b) => new Date(b.time) - new Date(a.time)));
});

app.post('/api/alerts', authenticate, requireSecurity, (req, res) => {
  try {
    const title = sanitize(req.body.title);
    const message = sanitize(req.body.message);
    const location = sanitize(req.body.location) || 'KNUST Campus';
    const type = sanitize(req.body.type) || 'notice';

    if (!title || title.length < 3) return res.status(400).json({ error: 'Title must be at least 3 characters' });
    if (!message || message.length < 10) return res.status(400).json({ error: 'Message must be at least 10 characters' });
    if (!['notice', 'shuttle', 'security', 'emergency'].includes(type)) return res.status(400).json({ error: 'Invalid alert type' });

    const alert = {
      id: `a-${uuidv4().slice(0, 8)}`,
      title, message, location, type,
      time: new Date().toISOString(),
      createdBy: req.user.userId,
    };
    db.alerts.unshift(alert);
    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

app.delete('/api/alerts/:id', authenticate, requireSecurity, (req, res) => {
  const idx = db.alerts.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Alert not found' });
  db.alerts.splice(idx, 1);
  res.json({ message: 'Alert deleted successfully' });
});

// ─── Walks ────────────────────────────────────────────────────────────────────

app.get('/api/walks', authenticate, (req, res) => {
  if (req.user.userType === 'security') {
    res.json(db.walks.filter(w => w.status === 'active'));
  } else {
    res.json(db.walks.filter(w => w.userId === req.user.userId));
  }
});

app.post('/api/walks', authenticate, (req, res) => {
  try {
    const from = sanitize(req.body.from) || 'Current Location';
    const to = sanitize(req.body.to || req.body.destination?.name) || 'Destination';
    const companion = sanitize(req.body.companion) || 'security';

    if (!['security', 'friend', 'group'].includes(companion)) {
      return res.status(400).json({ error: 'Invalid companion type' });
    }

    const user = db.users.find(u => u.id === req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const walk = {
      id: `WALK-${Date.now()}`,
      userId: req.user.userId,
      studentId: user.studentId,
      studentName: user.fullName,
      from, to, companion,
      startTime: new Date().toISOString(),
      currentLat: 6.6742, currentLng: -1.5718,
      status: 'active',
    };
    db.walks.unshift(walk);

    if (!db.trips[req.user.userId]) db.trips[req.user.userId] = [];
    db.trips[req.user.userId].unshift({
      id: `trip-${uuidv4().slice(0, 8)}`,
      type: 'walk',
      title: companion === 'security' ? 'Walk With Security' : 'Walk With Friend',
      from: walk.from, to: walk.to,
      date: walk.startTime, duration: null,
      status: 'in-progress', walkId: walk.id,
    });

    res.status(201).json(walk);
  } catch (err) {
    res.status(500).json({ error: 'Failed to start walk' });
  }
});

app.patch('/api/walks/:id', authenticate, (req, res) => {
  const idx = db.walks.findIndex(w => w.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Walk not found' });
  const walk = db.walks[idx];
  if (walk.userId !== req.user.userId && req.user.userType !== 'security') {
    return res.status(403).json({ error: 'Unauthorized to update this walk' });
  }
  db.walks[idx] = { ...walk, ...req.body };
  if (['completed', 'ended'].includes(req.body.status)) {
    const trips = db.trips[walk.userId] || [];
    const ti = trips.findIndex(t => t.walkId === walk.id);
    if (ti !== -1) {
      trips[ti] = { ...trips[ti], duration: `${Math.round((Date.now() - new Date(walk.startTime).getTime()) / 60000)} min`, status: 'completed' };
    }
  }
  res.json(db.walks[idx]);
});

// ─── Trips ────────────────────────────────────────────────────────────────────

app.get('/api/trips', authenticate, (req, res) => {
  res.json(db.trips[req.user.userId] || []);
});

// ─── Dashboard ────────────────────────────────────────────────────────────────

app.get('/api/dashboard/stats', authenticate, requireSecurity, (req, res) => {
  res.json({
    activeAlerts: db.sosAlerts.filter(a => a.status === 'active').length,
    respondingAlerts: db.sosAlerts.filter(a => a.status === 'responding').length,
    activeWalks: db.walks.filter(w => w.status === 'active').length,
    patrolsOnDuty: db.patrolUnits.filter(p => p.status !== 'off-duty').length,
    resolvedToday: 12,
    averageResponseTime: '3.2 min',
    studentsActive: 156 + Math.floor(Math.random() * 10),
  });
});

app.get('/api/dashboard/patrols', authenticate, requireSecurity, (req, res) => {
  res.json(db.patrolUnits);
});

app.patch('/api/dashboard/patrols/:id', authenticate, requireSecurity, (req, res) => {
  const idx = db.patrolUnits.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Patrol unit not found' });
  const allowed = ['status', 'lat', 'lng', 'officerName'];
  const updates = Object.fromEntries(allowed.filter(k => req.body[k] !== undefined).map(k => [k, req.body[k]]));
  db.patrolUnits[idx] = { ...db.patrolUnits[idx], ...updates };
  res.json(db.patrolUnits[idx]);
});

// ─── Chat ─────────────────────────────────────────────────────────────────────

app.get('/api/conversations', authenticate, (req, res) => {
  const convs = db.conversations[req.user.userId] || [];
  res.json(convs.map(c => ({ ...c, messages: undefined, messageCount: c.messages?.length || 0 })));
});

app.get('/api/conversations/:id/messages', authenticate, (req, res) => {
  const conv = (db.conversations[req.user.userId] || []).find(c => c.id === req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  // Mark as read
  conv.unread = 0;
  res.json(conv.messages || []);
});

app.post('/api/conversations/:id/messages', authenticate, (req, res) => {
  try {
    const text = sanitize(req.body.text);
    if (!text || text.length === 0) return res.status(400).json({ error: 'Message cannot be empty' });
    if (text.length > 1000) return res.status(400).json({ error: 'Message too long (max 1000 characters)' });

    if (!db.conversations[req.user.userId]) db.conversations[req.user.userId] = [];
    const convs = db.conversations[req.user.userId];
    const idx = convs.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Conversation not found' });

    const message = {
      id: `m-${uuidv4().slice(0, 8)}`,
      senderId: req.user.userId,
      text,
      time: new Date().toISOString(),
    };
    convs[idx].messages.push(message);
    convs[idx].lastMessage = text;
    convs[idx].lastMessageTime = message.time;
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ─── Health ───────────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'KNUST SafeTrack API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    users: db.users.length,
    activeSOS: db.sosAlerts.filter(a => a.status !== 'resolved').length,
  });
});

app.use('*', (req, res) => res.status(404).json({ error: `${req.method} ${req.originalUrl} — endpoint not found` }));

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🛡️  KNUST SafeTrack API v2.0  →  http://localhost:${PORT}`);
  console.log(`📋 Demo credentials:`);
  console.log(`   🎓 Student:  kofi.mensah@st.knust.edu.gh  /  password123`);
  console.log(`   🛡️  Security: admin@security.knust.edu.gh  /  password123\n`);
});
