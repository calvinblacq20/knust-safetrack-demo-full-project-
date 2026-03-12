import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Phone, Share2, X, Shield, Clock } from 'lucide-react';
import { USER_LOCATION } from '../data/mockData';
import useFocusTrap from '../hooks/useFocusTrap';
import useToast from '../hooks/useToast.js';
import Portal from './layout/Portal.jsx';

// User location icon for emergency mode
const emergencyUserIcon = L.divIcon({
    className: 'emergency-user-marker',
    html: `
    <div style="
      width: 24px;
      height: 24px;
      background-color: #DC2626;
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 3px #DC2626, 0 0 20px rgba(220, 38, 38, 0.6);
      animation: emergency-pulse 1s infinite;
    "></div>
    <style>
      @keyframes emergency-pulse {
        0%, 100% { box-shadow: 0 0 0 3px #DC2626, 0 0 20px rgba(220, 38, 38, 0.6); }
        50% { box-shadow: 0 0 0 6px rgba(220, 38, 38, 0.4), 0 0 30px rgba(220, 38, 38, 0.8); }
      }
    </style>
  `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

export default function EmergencyMode({ onCancel }) {
    const toast = useToast();
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const confirmRef = useRef(null);
    const keepBtnRef = useRef(null);
    useFocusTrap({ enabled: showCancelConfirm, containerRef: confirmRef, initialFocusRef: keepBtnRef });

    // Timer for elapsed time since SOS
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCancelClick = () => {
        setShowCancelConfirm(true);
    };

    const handleConfirmCancel = () => {
        onCancel();
    };

    const handleCallSecurity = () => {
        // In real app, this would initiate a phone call
        console.log('Calling KNUST Security...');
        toast.info('Calling KNUST Security (demo)...');
    };

    const handleShareLocation = () => {
        console.log('Sharing live location...');
        toast.success('Live location link copied (demo).');
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-bg-primary">
            {/* Red border effect */}
            <div className="absolute inset-0 border-4 border-danger pointer-events-none z-10 animate-pulse" />

            {/* Header */}
            <div className="relative z-20 bg-danger py-4 px-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <Shield className="w-6 h-6 text-white" />
                    <h1 className="text-xl font-bold text-white">HELP REQUEST SENT</h1>
                </div>
                <p className="text-center text-white/90 text-sm">
                    Security has been notified of your location
                </p>
            </div>

            {/* Timer */}
            <div className="relative z-20 flex items-center justify-center gap-2 py-3 bg-bg-secondary border-b border-border">
                <Clock className="w-4 h-4 text-text-secondary" />
                <span className="text-text-secondary text-sm">Time elapsed:</span>
                <span className="font-mono font-bold text-primary text-lg">{formatTime(elapsedTime)}</span>
            </div>

            {/* Mini Map */}
            <div className="relative z-0 h-[40vh]">
                <MapContainer
                    center={[USER_LOCATION.lat, USER_LOCATION.lng]}
                    zoom={17}
                    className="w-full h-full"
                    zoomControl={false}
                    attributionControl={true}
                    dragging={false}
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    <Marker position={[USER_LOCATION.lat, USER_LOCATION.lng]} icon={emergencyUserIcon} />
                </MapContainer>

                {/* Location label overlay */}
                <div className="absolute bottom-4 left-4 right-4 z-[1000]">
                    <div className="bg-bg-secondary/95 backdrop-blur-sm rounded-xl p-3 border border-border">
                        <p className="text-text-secondary text-xs mb-1">Your current location</p>
                        <p className="font-semibold text-text-primary">Near KNUST Main Library</p>
                        <p className="text-xs text-text-muted mt-1">
                            Lat: {USER_LOCATION.lat.toFixed(4)}, Lng: {USER_LOCATION.lng.toFixed(4)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="relative z-20 px-4 py-6 space-y-3">
                {/* Call Security - Primary Action */}
                <button
                    onClick={handleCallSecurity}
                    className="w-full py-4 bg-secondary text-white font-semibold rounded-xl flex items-center justify-center gap-3 hover:bg-secondary-light transition-colors"
                >
                    <Phone className="w-5 h-5" />
                    Call Security
                </button>

                {/* Share Live Location */}
                <button
                    onClick={handleShareLocation}
                    className="w-full py-4 bg-primary text-bg-primary font-semibold rounded-xl flex items-center justify-center gap-3 hover:bg-primary-dark transition-colors"
                >
                    <Share2 className="w-5 h-5" />
                    Share Live Location
                </button>

                {/* Cancel SOS */}
                <button
                    onClick={handleCancelClick}
                    className="w-full py-4 bg-bg-tertiary text-text-primary font-semibold rounded-xl flex items-center justify-center gap-3 hover:bg-border transition-colors"
                >
                    <X className="w-5 h-5" />
                    Cancel SOS
                </button>
            </div>

            {/* Safety Message */}
            <div className="absolute bottom-4 left-4 right-4 z-20">
                <p className="text-center text-text-secondary text-xs">
                    Stay calm. Security is on their way.
                </p>
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelConfirm && (
                <Portal>
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 3000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                        <div ref={confirmRef} style={{ width: '100%', maxWidth: '384px', borderRadius: '16px' }} className="bg-bg-secondary p-6 border border-border" role="dialog" aria-modal="true" aria-label="Cancel SOS confirmation">
                            <h2 className="text-lg font-bold text-text-primary mb-2">Cancel SOS?</h2>
                            <p className="text-text-secondary text-sm mb-6">
                                Are you sure you want to cancel the emergency alert?
                                Security will be notified that you are safe.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="flex-1 py-3 bg-bg-tertiary text-text-primary font-medium rounded-xl hover:bg-border transition-colors"
                                    ref={keepBtnRef}
                                >
                                    Keep Active
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmCancel}
                                    className="flex-1 py-3 bg-danger text-white font-medium rounded-xl hover:bg-danger-dark transition-colors"
                                >
                                    Cancel SOS
                                </button>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
}
