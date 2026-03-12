import { Map, MessageCircle, Bell, User } from 'lucide-react';

const navItems = [
    { id: 'map', label: 'Map', icon: Map, hash: '#map' },
    { id: 'chat', label: 'Chat', icon: MessageCircle, hash: '#chat' },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: 2, hash: '#alerts' },
    { id: 'profile', label: 'Profile', icon: User, hash: '#profile' },
];

export default function BottomNav({ activeTab }) {
    // Get current tab from hash or prop
    const currentHash = window.location.hash.replace('#', '') || 'map';
    const currentTab = activeTab || currentHash;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[1001] bg-bg-secondary border-t border-border">
            <div className="flex items-center justify-around h-16 px-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;

                    return (
                        <a
                            key={item.id}
                            href={item.hash}
                            className={`flex flex-col items-center justify-center gap-1 w-16 py-2 rounded-xl transition-colors relative ${isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                                }`}
                            aria-label={item.label}
                        >
                            <div className="relative">
                                <Icon className="w-5 h-5" />
                                {item.badge && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span className={`text-xs font-medium ${isActive ? 'text-primary' : ''}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <div className="absolute -bottom-0 w-8 h-0.5 bg-primary rounded-full" />
                            )}
                        </a>
                    );
                })}
            </div>

            {/* Safe area padding for notched devices */}
            <div className="bg-bg-secondary" style={{ height: 'env(safe-area-inset-bottom)' }} />
        </nav>
    );
}
