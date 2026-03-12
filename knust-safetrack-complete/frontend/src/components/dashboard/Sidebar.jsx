import { useRef } from 'react';
import {
    LayoutDashboard,
    AlertTriangle,
    MapPin,
    Settings,
    Shield,
    LogOut,
    X
} from 'lucide-react';
import useEscapeKey from '../../hooks/useEscapeKey';
import useFocusTrap from '../../hooks/useFocusTrap';

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sos', label: 'Active SOS', icon: AlertTriangle, badge: 3 },
    { id: 'heatmap', label: 'Heatmap', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({
    activeTab,
    onTabChange,
    variant = 'static',
    onClose,
    onSignOut
}) {
    const isDrawer = variant === 'drawer';
    useEscapeKey(isDrawer, onClose);

    const asideRef = useRef(null);
    const closeBtnRef = useRef(null);
    useFocusTrap({ enabled: isDrawer, containerRef: asideRef, initialFocusRef: closeBtnRef });

    const aside = (
        <aside
            ref={asideRef}
            className={`${isDrawer ? 'w-72 max-w-[85vw] h-full' : 'w-60 h-screen'} bg-bg-secondary border-r border-border flex flex-col`}
        >
            {/* Logo Header */}
            <div className="p-4 border-b border-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <img
                        src="/knust-logo.png"
                        alt="KNUST Logo"
                        className="w-10 h-10 object-contain"
                    />
                    <div className="min-w-0">
                        <h1 className="font-bold text-text-primary text-sm truncate">KNUST SafeTrack</h1>
                        <p className="text-xs text-text-secondary truncate">Security Dashboard</p>
                    </div>
                </div>

                {isDrawer && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
                        aria-label="Close menu"
                        ref={closeBtnRef}
                    >
                        <X className="w-5 h-5 text-text-secondary" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                                onTabChange(item.id);
                                onClose?.();
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${isActive
                                ? 'bg-primary/20 text-primary'
                                : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium text-sm flex-1">{item.label}</span>
                            {item.badge && (
                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${isActive ? 'bg-primary text-bg-primary' : 'bg-danger text-white'
                                    }`}
                                >
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="p-3 border-t border-border">
                <div className="flex items-center gap-3 p-2">
                    <div className="w-9 h-9 bg-secondary/30 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">Security Admin</p>
                        <p className="text-xs text-text-secondary truncate">On Duty</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            onClose?.();
                            onSignOut?.();
                        }}
                        className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
                        aria-label="Sign out"
                    >
                        <LogOut className="w-4 h-4 text-text-muted" />
                    </button>
                </div>
            </div>
        </aside>
    );

    if (!isDrawer) return aside;

    return (
        <div className="fixed inset-0 z-[3000] flex" role="dialog" aria-modal="true" aria-label="Dashboard menu">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative animate-slide-right">
                {aside}
            </div>
        </div>
    );
}
