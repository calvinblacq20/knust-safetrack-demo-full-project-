import { useRef, useState } from 'react';
import { X, Map, Route, Bell, User, Settings, Shield, LogOut, Info, Phone } from 'lucide-react';
import SettingsModal from './SettingsModal';
import ContactSecurityModal from './ContactSecurityModal';
import AboutModal from './AboutModal';
import useEscapeKey from '../hooks/useEscapeKey';
import useFocusTrap from '../hooks/useFocusTrap';

const menuItems = [
    { id: 'map', label: 'Map', icon: Map, hash: '#map' },
    { id: 'trips', label: 'My Trips', icon: Route, hash: '#trips' },
    { id: 'alerts', label: 'Alerts', icon: Bell, hash: '#alerts', badge: 2 },
    { id: 'profile', label: 'Profile', icon: User, hash: '#profile' },
];

export default function MenuDrawer({ isOpen, onClose, onSignOut }) {
    const [showSettings, setShowSettings] = useState(false);
    const [showContactSecurity, setShowContactSecurity] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const drawerRef = useRef(null);
    const closeBtnRef = useRef(null);

    useEscapeKey(isOpen, onClose);
    useFocusTrap({ enabled: isOpen, containerRef: drawerRef, initialFocusRef: closeBtnRef });
    if (!isOpen) return null;

    const handleQuickAction = (action) => {
        switch (action) {
            case 'settings':
                setShowSettings(true);
                break;
            case 'security':
                setShowContactSecurity(true);
                break;
            case 'about':
                setShowAbout(true);
                break;
            default:
                break;
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-[2000] flex" role="dialog" aria-modal="true" aria-label="Menu">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Drawer */}
                <div ref={drawerRef} className="relative w-72 h-full bg-bg-secondary border-r border-border flex flex-col animate-slide-right">
                    {/* Header */}
                    <div className="p-5 border-b border-border">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-text-primary">SafeTrack</h2>
                                    <p className="text-xs text-text-secondary">KNUST Campus</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
                                type="button"
                                aria-label="Close menu"
                                ref={closeBtnRef}
                            >
                                <X className="w-5 h-5 text-text-secondary" />
                            </button>
                        </div>

                        {/* User Info */}
                        <a
                            href="#profile"
                            className="flex items-center gap-3 p-3 bg-bg-primary rounded-xl cursor-pointer hover:bg-bg-tertiary transition-colors"
                            onClick={onClose}
                        >
                            <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-secondary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-text-primary">Student</p>
                                <p className="text-xs text-text-secondary">View Profile →</p>
                            </div>
                        </a>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4">
                        <p className="text-xs font-medium text-text-muted mb-2 px-2">NAVIGATION</p>
                        <div className="space-y-1">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = window.location.hash === item.hash ||
                                    (item.hash === '#map' && !window.location.hash);

                                return (
                                    <a
                                        key={item.id}
                                        href={item.hash}
                                        onClick={onClose}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isActive
                                                ? 'bg-primary/20 text-primary'
                                                : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="flex-1 text-left font-medium text-sm">{item.label}</span>
                                        {item.badge && (
                                            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-danger text-white">
                                                {item.badge}
                                            </span>
                                        )}
                                    </a>
                                );
                            })}
                        </div>

                        <div className="my-4 border-t border-border" />

                        <p className="text-xs font-medium text-text-muted mb-2 px-2">QUICK ACTIONS</p>
                        <div className="space-y-1">
                            <button
                                type="button"
                                onClick={() => handleQuickAction('settings')}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors"
                            >
                                <Settings className="w-5 h-5" />
                                <span className="flex-1 text-left font-medium text-sm">Settings</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickAction('security')}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors"
                            >
                                <Phone className="w-5 h-5" />
                                <span className="flex-1 text-left font-medium text-sm">Contact Security</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickAction('about')}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors"
                            >
                                <Info className="w-5 h-5" />
                                <span className="flex-1 text-left font-medium text-sm">About SafeTrack</span>
                            </button>
                        </div>
                    </nav>

                    {/* Sign Out */}
                    <div className="p-4 border-t border-border">
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                if (onSignOut) onSignOut();
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-danger hover:bg-danger/10 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="flex-1 text-left font-medium text-sm">Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />
            <ContactSecurityModal
                isOpen={showContactSecurity}
                onClose={() => setShowContactSecurity(false)}
            />
            <AboutModal
                isOpen={showAbout}
                onClose={() => setShowAbout(false)}
            />
        </>
    );
}
