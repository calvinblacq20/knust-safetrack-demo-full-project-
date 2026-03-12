import { useRef, useState } from 'react';
import { X, Bell, Moon, Shield, ToggleLeft, ToggleRight } from 'lucide-react';
import useEscapeKey from '../hooks/useEscapeKey';
import useFocusTrap from '../hooks/useFocusTrap';

function ToggleSwitch({ enabled, onToggle }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            aria-label={enabled ? 'Disable setting' : 'Enable setting'}
        >
            {enabled ? (
                <ToggleRight style={{ width: '32px', height: '32px', color: 'var(--color-primary)' }} />
            ) : (
                <ToggleLeft style={{ width: '32px', height: '32px', color: 'var(--color-text-muted)' }} />
            )}
        </button>
    );
}

export default function SettingsModal({ isOpen, onClose }) {
    const [settings, setSettings] = useState({
        notifications: true,
        sosAlerts: true,
        shareLocation: true,
        darkMode: true,
        soundAlerts: true,
    });
    const modalRef = useRef(null);
    const closeBtnRef = useRef(null);

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    useEscapeKey(isOpen, onClose);
    useFocusTrap({ enabled: isOpen, containerRef: modalRef, initialFocusRef: closeBtnRef });
    if (!isOpen) return null;

    const settingRowStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px',
        backgroundColor: 'var(--color-bg-primary)',
        borderRadius: '12px',
        marginBottom: '8px',
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
        }}>
            {/* Backdrop */}
            <div
                style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                onClick={onClose}
            />

            {/* Modal */}
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '400px',
                backgroundColor: 'var(--color-bg-secondary)',
                borderRadius: '16px',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
            }}
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-title"
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderBottom: '1px solid var(--color-border)',
                }}>
                    <h2 id="settings-title" style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)', margin: 0 }}>Settings</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
                        aria-label="Close"
                        ref={closeBtnRef}
                    >
                        <X style={{ width: '20px', height: '20px', color: 'var(--color-text-secondary)' }} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '16px', maxHeight: '60vh', overflowY: 'auto' }}>
                    {/* Notifications Section */}
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Bell style={{ width: '14px', height: '14px' }} />
                            NOTIFICATIONS
                        </h3>
                        <div style={settingRowStyle}>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', margin: 0 }}>Push Notifications</p>
                                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>Get alerts on your device</p>
                            </div>
                            <ToggleSwitch enabled={settings.notifications} onToggle={() => toggleSetting('notifications')} />
                        </div>
                        <div style={settingRowStyle}>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', margin: 0 }}>SOS Alerts</p>
                                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>Receive emergency broadcasts</p>
                            </div>
                            <ToggleSwitch enabled={settings.sosAlerts} onToggle={() => toggleSetting('sosAlerts')} />
                        </div>
                        <div style={settingRowStyle}>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', margin: 0 }}>Sound Alerts</p>
                                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>Play sound for emergencies</p>
                            </div>
                            <ToggleSwitch enabled={settings.soundAlerts} onToggle={() => toggleSetting('soundAlerts')} />
                        </div>
                    </div>

                    {/* Privacy Section */}
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Shield style={{ width: '14px', height: '14px' }} />
                            PRIVACY
                        </h3>
                        <div style={settingRowStyle}>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', margin: 0 }}>Share Location</p>
                                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>Allow friends to see you</p>
                            </div>
                            <ToggleSwitch enabled={settings.shareLocation} onToggle={() => toggleSetting('shareLocation')} />
                        </div>
                    </div>

                    {/* Appearance Section */}
                    <div>
                        <h3 style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Moon style={{ width: '14px', height: '14px' }} />
                            APPEARANCE
                        </h3>
                        <div style={settingRowStyle}>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', margin: 0 }}>Dark Mode</p>
                                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>Use dark theme</p>
                            </div>
                            <ToggleSwitch enabled={settings.darkMode} onToggle={() => toggleSetting('darkMode')} />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)' }}>
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: 'var(--color-primary)',
                            color: 'var(--color-bg-primary)',
                            borderRadius: '12px',
                            fontWeight: '600',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
