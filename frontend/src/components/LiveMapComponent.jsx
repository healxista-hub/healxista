import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Navigation,
    Ambulance,
    Clock,
    AlertTriangle,
    MapPin,
    User,
    CornerUpRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';

/* ---------------- ICON FIX ---------------- */
delete L.Icon.Default.prototype._getIconUrl;

const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

/* ---------------- CUSTOM ICONS ---------------- */
const ambulanceIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/883/883398.png',
    shadowUrl,
    iconSize: [45, 45],
    iconAnchor: [22, 45],
    popupAnchor: [0, -40]
});

const userIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/9131/9131529.png',
    shadowUrl,
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
});

const hospitalIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/4320/4320371.png',
    shadowUrl,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

/* ---------------- CONSTANTS ---------------- */
const defaultLoc = [23.3279, 86.3533]; // Purulia HQ Area
const HOSPITALS = [
    { id: 1, name: 'Purulia Sadar Hospital', position: [23.3323, 86.3657] },
    { id: 2, name: 'Deben Mahata Medical College', position: [23.3320, 86.3640] },
    { id: 3, name: 'Raghunathpur Sub-Divisional Hospital', position: [23.5414, 86.6719] }
];

// Helper to update map center
const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center && center[0] && center[1]) {
            map.setView(center, map.getZoom(), { animate: true });
        }
    }, [center, map]);
    return null;
};

const LiveMapComponent = ({ viewMode = 'user', activeBookings = [] }) => {
    const { user, login } = useAuth();
    const socket = useSocket();
    const [myPosition, setMyPosition] = useState(defaultLoc);
    const [activeLocations, setActiveLocations] = useState([]);
    const [status, setStatus] = useState('Available'); // For Drivers
    const [isSharingLocation, setIsSharingLocation] = useState(user?.isSharingLocation || false);

    // Routing State
    const [routePath, setRoutePath] = useState([]);
    const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: 0 });

    // Sync sharing state with backend
    const handleToggleSharing = async (val) => {
        setIsSharingLocation(val);
        try {
            const res = await fetch(`/api/profile/${user.id}/location-sharing`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_sharing_location: val }),
                credentials: 'include'
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to sync sharing status');
            }
            // Update local auth context for persistence across refreshes
            if (login) login({ ...user, isSharingLocation: val });
        } catch (err) {
            console.error("Failed to sync sharing status", err);
        }
    };

    // 1. Get Real-time GPS
    useEffect(() => {
        if (!navigator.geolocation) {
            console.warn("Geolocation is not supported by this browser.");
            return;
        }

        // Always show position on map if possible, but only share if toggled
        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const newPos = [latitude, longitude];
                setMyPosition(newPos);

                // Publish Location via Socket ONLY if sharing is ON or if user has active bookings or is admin
                if (socket && user && (isSharingLocation || (activeBookings && activeBookings.length > 0) || viewMode === 'admin')) {
                    const payload = {
                        id: user.id,
                        name: user.name,
                        position: newPos,
                        status: user.role === 'driver' ? status : 'Online',
                        role: user.role,
                        activeBookings: activeBookings,
                        vehicleNumber: user.vehicleNumber || 'Unknown'
                    };

                    socket.emit('update_location', payload);
                }
            },
            (err) => {
                console.warn("GPS Error:", err.message);
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [socket, user, status, isSharingLocation, activeBookings, viewMode]);

    // 2. Socket Listeners
    useEffect(() => {
        if (!socket) return;
        if (user) {
            // Standardize room name to lowercase
            const roleRoom = String(user.role).toLowerCase();
            socket.emit('join_role', roleRoom);
            if (activeBookings && activeBookings.length > 0) {
                socket.emit('join_location_tracking', activeBookings);
            }
        }

        const handleLocationUpdate = (data) => {
            if (data.id === user?.id && data.role === user?.role) return; // Ignore own echoes

            // Filtering Visibility Logic
            const role = String(data.role).toLowerCase();
            let shouldShow = false;
            if (viewMode === 'admin') {
                shouldShow = true; // Admin sees everyone sharing
            } else if (viewMode === 'driver') {
                // Driver sees their booked user
                shouldShow = activeBookings.some(bid => data.activeBookings?.includes(bid)) && (role === 'user' || role === 'patient');
            } else if (viewMode === 'user') {
                // User sees all available ambulances
                if (role === 'driver' && (data.status === 'Available' || data.status === 'Online')) {
                    shouldShow = true;
                }
                // User sees their booked ambulance
                if (role === 'driver' && activeBookings.some(bid => data.activeBookings?.includes(bid))) {
                    shouldShow = true;
                }
            }

            if (!shouldShow) return;

            setActiveLocations(prev => {
                const updated = [...prev];
                const idx = updated.findIndex(l => l.id === data.id && l.role === data.role);
                if (idx > -1) updated[idx] = data;
                else updated.push(data);
                return updated;
            });
        };

        socket.on('location_update', handleLocationUpdate);

        return () => {
            socket.off('location_update', handleLocationUpdate);
        };
    }, [socket, user?.id, user?.role, activeBookings, viewMode]);

    // 3. Routing Logic (OSRM)
    // Runs when we have a target to track
    useEffect(() => {
        const fetchRoute = async (start, end) => {
            try {
                // OSRM requires [lng, lat]
                const startStr = `${start[1]},${start[0]}`;
                const endStr = `${end[1]},${end[0]}`;
                const url = `https://router.project-osrm.org/route/v1/driving/${startStr};${endStr}?overview=full&geometries=geojson`;

                const res = await fetch(url);
                const data = await res.json();

                if (data.routes && data.routes.length > 0) {
                    const route = data.routes[0];
                    // Convert GeoJSON [lng, lat] back to Leaflet [lat, lng]
                    const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                    setRoutePath(coordinates);
                    setRouteInfo({
                        distance: (route.distance / 1000).toFixed(1), // Meters to KM
                        duration: (route.duration / 60).toFixed(0)    // Seconds to Minutes
                    });
                }
            } catch (error) {
                console.error("Routing Error:", error);
            }
        };

        // Define tracking target based on role
        if (viewMode === 'user' && activeLocations.length > 0) {
            // User tracking specific or nearest ambulance (Simplification: track first active)
            const target = activeLocations.find(l => l.role === 'driver' && (l.status === 'Busy' || l.status === 'Available'));
            if (target && myPosition) fetchRoute(myPosition, target.position);
        } else if (viewMode === 'driver' && activeLocations.length > 0) {
            // Driver tracking a user (Simplification: track first user found)
            const target = activeLocations.find(l => l.role === 'user');
            if (target && myPosition) fetchRoute(myPosition, target.position);
        } else {
            setRoutePath([]); // Clear if no active tracking
            setRouteInfo({ distance: 0, duration: 0 });
        }

    }, [myPosition, activeLocations, viewMode]);


    // 4. Unified Tracking
    const visibleLocations = activeLocations;

    return (
        <div className="space-y-4">
            {/* Header / Route Info Card */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {viewMode === 'admin' && <MapPin className="text-red-600 h-5 w-5" />}
                        {viewMode === 'driver' && <Ambulance className="text-blue-600 h-5 w-5" />}
                        {viewMode === 'user' && <User className="text-green-600 h-5 w-5" />}

                        {viewMode === 'admin' ? 'Fleet Overview' :
                            viewMode === 'driver' ? 'Navigation' :
                                'Live Tracking'}
                    </h2>
                </div>

                {routeInfo.distance > 0 && (
                    <Card className="bg-blue-600 text-white border-none py-1 px-4 shadow-md">
                        <div className="flex items-center gap-4 text-sm font-medium">
                            <span className="flex items-center gap-1"><CornerUpRight className="h-4 w-4" /> {routeInfo.distance} km</span>
                            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {routeInfo.duration} min</span>
                        </div>
                    </Card>
                )}

                <div className="flex gap-2 items-center">
                    {viewMode !== 'admin' && (
                        <div className="flex items-center gap-2 mr-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-all hover:border-indigo-300">
                            <span className="text-xs font-bold text-slate-700">Share Location</span>
                            <Switch checked={isSharingLocation} onCheckedChange={handleToggleSharing} className="data-[state=checked]:bg-indigo-600 scale-75 origin-right" />
                        </div>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setMyPosition(defaultLoc)}>
                        <Navigation className="h-4 w-4" />
                    </Button>
                    {viewMode === 'user' && (
                        <Button variant="destructive" size="sm" onClick={() => {
                            if (socket && user) socket.emit('update_location', { id: user.id, name: user.name, position: myPosition, status: 'Emergency', role: user.role });
                        }}>
                            SOS
                        </Button>
                    )}
                </div>
            </div>

            {/* MAP */}
            <Card className="shadow-lg border-0 overflow-hidden">
                <CardContent className="p-0">
                    <div className="h-[500px] w-full relative z-0">
                        <MapContainer
                            center={myPosition}
                            zoom={13}
                            className="h-full w-full"
                        >
                            <TileLayer
                                attribution="&copy; Google Maps"
                                url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                            />
                            <MapUpdater center={myPosition} />

                            {/* ROUTE LINE (Blue) */}
                            {routePath.length > 0 && (
                                <Polyline positions={routePath} color="#2563eb" weight={5} opacity={0.7} />
                            )}

                            {/* CURRENT USER MARKER */}
                            {viewMode !== 'admin' && (
                                <Marker position={myPosition} icon={viewMode === 'driver' ? ambulanceIcon : userIcon}>
                                    <Popup>
                                            <div className="p-1 min-w-[150px]">
                                                <p className="font-bold text-lg mb-1">{viewMode === 'driver' ? '🚑 You (Ambulance)' : '👤 You (User)'}</p>
                                                <div className="text-sm space-y-1">
                                                    <p><span className="font-semibold">Name:</span> {user?.name}</p>
                                                    {viewMode === 'driver' && user?.vehicleNumber && <p><span className="font-semibold">Vehicle:</span> {user.vehicleNumber}</p>}
                                                    <p><span className="font-semibold">Status:</span> {user?.role === 'driver' ? status : 'Online'}</p>
                                                    <p className="text-xs text-gray-500 mt-2">Lat: {myPosition[0].toFixed(4)}, Lng: {myPosition[1].toFixed(4)}</p>
                                                </div>
                                            </div>
                                    </Popup>
                                </Marker>
                            )}

                            {/* ALL OTHER USERS / PROVIDERS */}
                            {visibleLocations.map(loc => {
                                const role = String(loc.role).toLowerCase();
                                const isAmbulance = role === 'driver';
                                const isUser = role === 'user' || role === 'patient';
                                const iconToUse = isAmbulance ? ambulanceIcon : (isUser ? userIcon : hospitalIcon);
                                const label = isAmbulance ? '🚑 Available Ambulance' : (isUser ? '👤 Emergency Patient' : '🏥 Provider');
                                const nameLabel = isAmbulance ? 'Driver:' : (isUser ? 'Patient:' : 'Provider:');
                                const statusColor = (loc.status === 'Emergency' || loc.status === 'Busy') ? 'text-red-600 font-bold' : 'text-green-600';

                                return (
                                    <Marker key={`${loc.role}-${loc.id}`} position={loc.position} icon={iconToUse}>
                                        <Popup>
                                            <div className="p-1 min-w-[150px]">
                                                <p className={`font-bold text-lg mb-1 ${isAmbulance ? 'text-red-600' : 'text-blue-600'}`}>{label}</p>
                                                <div className="text-sm space-y-1">
                                                    <p><span className="font-semibold">{nameLabel}</span> {loc.name}</p>
                                                    {isAmbulance && loc.vehicleNumber && <p><span className="font-semibold">Vehicle:</span> {loc.vehicleNumber}</p>}
                                                    <p><span className="font-semibold">Status:</span> <span className={statusColor}>{loc.status}</span></p>
                                                    {loc.mobile && <p><span className="font-semibold">Contact:</span> {loc.mobile}</p>}
                                                    <p className="text-xs text-gray-500 mt-2">Lat: {loc.position[0].toFixed(4)}, Lng: {loc.position[1].toFixed(4)}</p>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}

                            {/* HOSPITALS */}
                            {HOSPITALS.map(h => (
                                <Marker key={h.id} position={h.position} icon={hospitalIcon}>
                                    <Popup><p className="font-bold text-green-700">{h.name}</p></Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LiveMapComponent;
