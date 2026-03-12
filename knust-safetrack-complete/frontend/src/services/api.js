/**
 * KNUST SafeTrack — API Service Layer
 * Falls back to local mock data when backend is unavailable (offline / demo mode).
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const getToken = () => localStorage.getItem('safetrack_token');
export const setToken = (t) => localStorage.setItem('safetrack_token', t);
export const clearToken = () => localStorage.removeItem('safetrack_token');

async function request(method, path, body = null, auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const authAPI = {
  signIn: (email, password, userType) =>
    request('POST', '/auth/signin', { email, password, userType }, false),
  signUp: (formData) =>
    request('POST', '/auth/signup', formData, false),
  forgotPassword: (email) =>
    request('POST', '/auth/forgot-password', { email }, false),
};

export const userAPI = {
  getMe: () => request('GET', '/me'),
  updateMe: (data) => request('PATCH', '/me', data),
};

export const sosAPI = {
  getAll: () => request('GET', '/sos'),
  trigger: (lat, lng, location) => request('POST', '/sos', { lat, lng, location }),
  updateStatus: (id, status) => request('PATCH', `/sos/${id}`, { status }),
};

export const alertsAPI = {
  getAll: () => request('GET', '/alerts'),
  create: (data) => request('POST', '/alerts', data),
  delete: (id) => request('DELETE', `/alerts/${id}`),
};

export const walksAPI = {
  getAll: () => request('GET', '/walks'),
  start: (data) => request('POST', '/walks', data),
  update: (id, data) => request('PATCH', `/walks/${id}`, data),
};

export const tripsAPI = {
  getAll: () => request('GET', '/trips'),
};

export const dashboardAPI = {
  getStats: () => request('GET', '/dashboard/stats'),
  getPatrols: () => request('GET', '/dashboard/patrols'),
  updatePatrol: (id, data) => request('PATCH', `/dashboard/patrols/${id}`, data),
};

export const chatAPI = {
  getConversations: () => request('GET', '/conversations'),
  getMessages: (convId) => request('GET', `/conversations/${convId}/messages`),
  sendMessage: (convId, text) => request('POST', `/conversations/${convId}/messages`, { text }),
};
