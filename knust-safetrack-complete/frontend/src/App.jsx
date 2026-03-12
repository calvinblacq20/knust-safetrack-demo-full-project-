import { useState, useEffect, createContext, useContext } from 'react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Trips from './pages/Trips';
import Profile from './pages/Profile';
import Alerts from './pages/Alerts';
import Chat from './pages/Chat';
import { ToastProvider } from './components/feedback/ToastProvider';
import './index.css';
import useToast from './hooks/useToast.js';
import { authAPI, userAPI, getToken, setToken, clearToken } from './services/api.js';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const ROUTES = new Set(['map','trips','alerts','profile','dashboard','signin','signup','forgotpassword','chat']);

function normalizeView(raw, isAuthenticated, userType) {
  const view = raw || 'map';
  if (!ROUTES.has(view)) return isAuthenticated ? (userType === 'security' ? 'dashboard' : 'map') : 'signin';
  if (!isAuthenticated && !['signin','signup','forgotpassword'].includes(view)) return 'signin';
  if (isAuthenticated && ['signin','signup','forgotpassword'].includes(view)) return userType === 'security' ? 'dashboard' : 'map';
  return view;
}

// Demo user profiles for offline/demo mode
const DEMO_USERS = {
  student: { id: 'u-001', fullName: 'Kofi Mensah', studentId: '20481234', email: 'kofi.mensah@st.knust.edu.gh', phone: '+233 24 123 4567', hostel: 'Unity Hall (Conti)', userType: 'student', emergencyContacts: [{ name: 'Mom', phone: '+233 20 987 6543' }], savedLocations: [{ id: 'sl-1', name: 'Home (Hostel)', location: 'Unity Hall, Room 215' }] },
  security: { id: 'u-sec-001', fullName: 'Security Admin', studentId: 'SEC-001', email: 'admin@security.knust.edu.gh', phone: '+233 32 206 0331', hostel: null, userType: 'security', emergencyContacts: [], savedLocations: [] },
};

function AppInner() {
  const toast = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken() || localStorage.getItem('safetrack_auth') === 'true');
  const [userType, setUserType] = useState(() => localStorage.getItem('safetrack_userType') || 'student');
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('safetrack_user') || 'null'); } catch { return null; }
  });
  const [view, setView] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    const authed = !!getToken() || localStorage.getItem('safetrack_auth') === 'true';
    const ut = localStorage.getItem('safetrack_userType') || 'student';
    return normalizeView(hash, authed, ut);
  });

  useEffect(() => {
    if (isAuthenticated) {
      userAPI.getMe().then(user => {
        setCurrentUser(user);
        localStorage.setItem('safetrack_user', JSON.stringify(user));
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const next = normalizeView(hash, isAuthenticated, userType);
      setView(next);
      if (next !== hash) window.location.hash = next;
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated, userType]);

  const persistAuth = (ut, user) => {
    localStorage.setItem('safetrack_auth', 'true');
    localStorage.setItem('safetrack_userType', ut);
    localStorage.setItem('safetrack_user', JSON.stringify(user));
    setIsAuthenticated(true);
    setUserType(ut);
    setCurrentUser(user);
    window.location.hash = ut === 'security' ? 'dashboard' : 'map';
  };

  const handleSignIn = async (formData) => {
    try {
      const result = await authAPI.signIn(formData.email, formData.password, formData.userType);
      setToken(result.token);
      persistAuth(result.user.userType, result.user);
      toast.success(`Welcome back, ${result.user.fullName}!`);
    } catch (err) {
      // Network error = backend offline → demo mode
      if (err instanceof TypeError || err.message?.includes('fetch') || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        const demoUser = DEMO_USERS[formData.userType] || DEMO_USERS.student;
        persistAuth(formData.userType, demoUser);
        toast.info('Demo mode — backend offline. Using demo account.');
      } else {
        toast.error(err.message || 'Sign in failed. Check your credentials.');
      }
    }
  };

  const handleSignUp = async (formData) => {
    try {
      await authAPI.signUp(formData);
      toast.success('Account created! Please sign in.');
      window.location.hash = 'signin';
    } catch (err) {
      if (err instanceof TypeError || err.message?.includes('fetch') || err.message?.includes('Failed to fetch')) {
        toast.info('Demo mode: request noted. Please sign in with demo credentials.');
        window.location.hash = 'signin';
      } else {
        toast.error(err.message || 'Registration failed');
      }
    }
  };

  const handleSignOut = () => {
    clearToken();
    localStorage.removeItem('safetrack_auth');
    localStorage.removeItem('safetrack_userType');
    localStorage.removeItem('safetrack_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserType('student');
    window.location.hash = 'signin';
  };

  const authValue = { currentUser, userType, isAuthenticated, handleSignOut, setCurrentUser };

  if (view === 'forgotpassword') return <ForgotPassword onBackToSignIn={() => (window.location.hash = 'signin')} />;
  if (view === 'signup') return <SignUp onSignUp={handleSignUp} onSwitchToSignIn={() => (window.location.hash = 'signin')} />;
  if (!isAuthenticated || view === 'signin') {
    return <SignIn onSignIn={handleSignIn} onSwitchToSignUp={() => (window.location.hash = 'signup')} onSwitchToForgotPassword={() => (window.location.hash = 'forgotpassword')} />;
  }

  return (
    <AuthContext.Provider value={authValue}>
      {view === 'dashboard' ? <Dashboard onSignOut={handleSignOut} />
        : view === 'alerts' ? <Alerts onSignOut={handleSignOut} />
        : view === 'trips' ? <Trips onSignOut={handleSignOut} />
        : view === 'profile' ? <Profile onSignOut={handleSignOut} />
        : view === 'chat' ? <Chat onSignOut={handleSignOut} />
        : userType === 'security' ? <Dashboard onSignOut={handleSignOut} />
        : <Home onSignOut={handleSignOut} />}
    </AuthContext.Provider>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
