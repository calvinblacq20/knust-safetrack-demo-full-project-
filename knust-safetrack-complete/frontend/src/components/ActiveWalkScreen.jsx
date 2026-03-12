import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Phone, X, MapPin, Clock, Shield, Users, CheckCircle } from 'lucide-react';
import { USER_LOCATION } from '../data/mockData';
import useFocusTrap from '../hooks/useFocusTrap';
import useToast from '../hooks/useToast.js';
import Portal from './layout/Portal.jsx';

// User marker for active walk
const walkUserIcon = L.divIcon({
    className: 'walk-user-marker',
    html: `
    <div style="
      width: 20px;
      height: 20px;
      background-color: #228B22;
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 2px #228B22, 0 2px 8px rgba(0,0,0,0.3);
      animation: walk-pulse 2s infinite;
    "></div>
    <style>
      @keyframes walk-pulse {
        0%, 100% { box-shadow: 0 0 0 2px #228B22, 0 2px 8px rgba(0,0,0,0.3); }
        50% { box-shadow: 0 0 0 6px rgba(34, 139, 34, 0.3), 0 2px 8px rgba(0,0,0,0.3); }
      }
    </style>
  `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});

// Destination marker
const destinationIcon = L.divIcon({
    className: 'destination-marker',
    html: `
    <div style="
      width: 32px;
      height: 32px;
      background-color: #F4C430;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">📍</div>
  `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

export default function ActiveWalkScreen({ walkData, onEndWalk }) {
    const toast = useToast();
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [arrivedSafely, setArrivedSafely] = useState(false);
    const confirmRef = useRef(null);
    const keepBtnRef = useRef(null);
    useFocusTrap({ enabled: showEndConfirm, containerRef: confirmRef, initialFocusRef: keepBtnRef });

    // Simulated destination coordinates
    const destinationCoords = {
        lat: USER_LOCATION.lat + 0.008,
        lng: USER_LOCATION.lng + 0.005,
    };

    // Timer
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

    const handleArrivedSafely = () => {
        setArrivedSafely(true);
        setTimeout(() => {
            onEndWalk();
        }, 2000);
    };

    const handleEndWalk = () => {
        setShowEndConfirm(true);
    };

    const handleConfirmEnd = () => {
        onEndWalk();
    };

    // Path from user to destination
    const pathCoords = [
        [USER_LOCATION.lat, USER_LOCATION.lng],
        [USER_LOCATION.lat + 0.002, USER_LOCATION.lng + 0.001],
        [USER_LOCATION.lat + 0.005, USER_LOCATION.lng + 0.003],
        [destinationCoords.lat, destinationCoords.lng],
    ];

    if (arrivedSafely) {
        return (
            <div className="fixed inset-0 z-[2000] bg-bg-primary flex items-center justify-center">
                <div className="text-center p-8">
                    <div className="w-24 h-24 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle className="w-12 h-12 text-secondary" />
                    </div>
                    <h1 className="text-2xl font-bold text-text-primary mb-2">You Arrived Safely!</h1>
                    <p className="text-text-secondary">
                        {walkData.companion === 'security' ? 'Security has been notified.' : 'Your friend has been notified.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[2000] bg-bg-primary">
            {/* Green border for active walk */}
            <div className="absolute inset-0 border-4 border-secondary pointer-events-none z-10" />

            {/* Header */}
            <div className="relative z-20 bg-secondary py-4 px-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                    {walkData.companion === 'security' ? (
                        <Shield className="w-5 h-5 text-white" />
                    ) : (
                        <Users className="w-5 h-5 text-white" />
                    )}
                    <h1 className="text-lg font-bold text-white">
                        Walking with {walkData.companion === 'security' ? 'Security' : 'Friend'}
                    </h1>
                </div>
                <p className="text-center text-white/90 text-sm">
                    Your location is being shared
                </p>
            </div>

            {/* Timer & Destination */}
            <div className="relative z-20 flex items-center justify-between px-4 py-3 bg-bg-secondary border-b border-border">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-text-secondary" />
                    <span className="font-mono font-bold text-primary">{formatTime(elapsedTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm text-text-primary font-medium">{walkData.destination.name}</span>
                </div>
            </div>

            {/* Map */}
            <div className="relative z-0 h-[45vh]">
                <MapContainer
                    center={[USER_LOCATION.lat + 0.004, USER_LOCATION.lng + 0.0025]}
                    zoom={16}
                    className="w-full h-full"
                    zoomControl={false}
                    attributionControl={true}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {/* Path line */}
                    <Polyline
                        positions={pathCoords}
                        pathOptions={{ color: '#228B22', weight: 4, dashArray: '10, 10' }}
                    />

                    {/* User marker */}
                    <Marker position={[USER_LOCATION.lat, USER_LOCATION.lng]} icon={walkUserIcon} />

                    {/* Destination marker */}
                    <Marker position={[destinationCoords.lat, destinationCoords.lng]} icon={destinationIcon} />
                </MapContainer>
            </div>

            {/* Action Buttons */}
            <div className="relative z-20 px-4 py-6 space-y-3">
                {/* Arrived Safely - Primary */}
                <button
                    onClick={handleArrivedSafely}
                    className="w-full py-4 bg-secondary text-white font-semibold rounded-xl flex items-center justify-center gap-3 hover:bg-secondary-light transition-colors"
                >
                    <CheckCircle className="w-5 h-5" />
                    I Arrived Safely
                </button>

                {/* Call Companion */}
                <button
                    onClick={() => toast.info(`Calling ${walkData.companion === 'security' ? 'Security' : 'your friend'} (demo)...`)}
                    className="w-full py-4 bg-primary text-bg-primary font-semibold rounded-xl flex items-center justify-center gap-3 hover:bg-primary-dark transition-colors"
                >
                    <Phone className="w-5 h-5" />
                    Call {walkData.companion === 'security' ? 'Security' : 'Friend'}
                </button>

                {/* End Walk */}
                <button
                    onClick={handleEndWalk}
                    className="w-full py-4 bg-bg-tertiary text-text-primary font-semibold rounded-xl flex items-center justify-center gap-3 hover:bg-border transition-colors"
                >
                    <X className="w-5 h-5" />
                    End Walk
                </button>
            </div>

            {/* Safety tip */}
            <div className="absolute bottom-4 left-4 right-4 z-20">
                <p className="text-center text-text-secondary text-xs">
                    Stay on well-lit paths. Help is just a tap away.
                </p>
            </div>

            {/* End Walk Confirmation */}
            {showEndConfirm && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <div ref={confirmRef} className="bg-bg-secondary rounded-2xl p-6 border border-border" style={{ width: '100%', maxWidth: '384px' }} role="dialog" aria-modal="true" aria-label="End walk confirmation">
                        <h2 className="text-lg font-bold text-text-primary mb-2">End Walk?</h2>
                        <p className="text-text-secondary text-sm mb-6">
                            Are you sure you want to stop sharing your location?
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowEndConfirm(false)}
                                className="flex-1 py-3 bg-bg-tertiary text-text-primary font-medium rounded-xl hover:bg-border transition-colors"
                                ref={keepBtnRef}
                            >
                                Keep Walking
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmEnd}
                                className="flex-1 py-3 bg-danger text-white font-medium rounded-xl hover:bg-danger-dark transition-colors"
                            >
                                End Walk
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
