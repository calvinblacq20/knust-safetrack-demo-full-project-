import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { KNUST_CENTER, USER_LOCATION, CAMPUS_LOCATIONS } from '../../data/mockData';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createIcon = (color, className = '') => {
    return L.divIcon({
        className: `custom-marker ${className}`,
        html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      "></div>
    `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    });
};

const userIcon = L.divIcon({
    className: 'user-marker',
    html: `
    <div style="
      width: 20px;
      height: 20px;
      background-color: #3B82F6;
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 2px #3B82F6, 0 2px 8px rgba(0,0,0,0.3);
      animation: pulse 2s infinite;
    "></div>
    <style>
      @keyframes pulse {
        0% { box-shadow: 0 0 0 2px #3B82F6, 0 2px 8px rgba(0,0,0,0.3); }
        50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3), 0 2px 8px rgba(0,0,0,0.3); }
        100% { box-shadow: 0 0 0 2px #3B82F6, 0 2px 8px rgba(0,0,0,0.3); }
      }
    </style>
  `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});

const locationIcon = createIcon('#F4C430'); // KNUST Gold

// Component to recenter map
function RecenterMap({ center }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 15);
    }, [center, map]);
    return null;
}

function ZoomWatcher({ onZoomChange }) {
    const map = useMapEvents({
        zoomend: () => onZoomChange(map.getZoom()),
    });
    useEffect(() => {
        onZoomChange(map.getZoom());
    }, [map, onZoomChange]);
    return null;
}

export default function MapContainerComponent() {
    const [zoom, setZoom] = useState(15);
    return (
        <div className="absolute inset-0 z-0">
            <MapContainer
                center={[KNUST_CENTER.lat, KNUST_CENTER.lng]}
                zoom={15}
                className="w-full h-full"
                zoomControl={false}
                attributionControl={true}
            >
                {/* Dark-themed tile layer */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />

                <RecenterMap center={[KNUST_CENTER.lat, KNUST_CENTER.lng]} />
                <ZoomWatcher onZoomChange={setZoom} />

                {/* User Location Marker */}
                <Marker position={[USER_LOCATION.lat, USER_LOCATION.lng]} icon={userIcon}>
                    <Popup>
                        <div className="text-center">
                            <p className="font-semibold">Your Location</p>
                            <p className="text-sm text-gray-600">Near Main Library</p>
                        </div>
                    </Popup>
                </Marker>

                {/* Campus Location Markers */}
                {zoom >= 14 && CAMPUS_LOCATIONS.map((loc) => (
                    <Marker
                        key={loc.id}
                        position={[loc.lat, loc.lng]}
                        icon={locationIcon}
                    >
                        <Popup>
                            <div>
                                <p className="font-semibold">{loc.name}</p>
                                <p className="text-sm text-gray-600">{loc.type}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
