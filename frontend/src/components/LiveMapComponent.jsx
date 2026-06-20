import React, { useState, useEffect, useRef } from 'react';
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
import BookingModal from '@/components/BookingModal';

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
    iconUrl: '/ambulance-marker.jpg',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [50, 60],
    iconAnchor: [25, 60],
    popupAnchor: [0, -55],
    className: 'drop-shadow-xl animate-pulse'
});

const userIcon = L.divIcon({
    html: `
        <div class="relative flex items-center justify-center">
            <div class="absolute -inset-3 bg-blue-500/40 rounded-full animate-ping" style="animation-duration: 2s;"></div>
            <div class="relative bg-white p-2 rounded-full shadow-xl border-2 border-blue-600 z-10 flex items-center justify-center h-10 w-10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600 h-5 w-5">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
        </div>
    `,
    className: 'bg-transparent border-0',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

const hospitalIcon = L.divIcon({
    html: `
        <div class="relative flex items-center justify-center bg-white p-1.5 rounded-full shadow-xl border-2 border-emerald-600 h-10 w-10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-600 h-6 w-6">
                <path d="M12 3v18"></path>
                <path d="M3 12h18"></path>
                <rect x="2" y="8" width="20" height="8" rx="2"></rect>
            </svg>
        </div>
    `,
    className: 'bg-transparent border-0',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

/* ---------------- CONSTANTS ---------------- */
const defaultLoc = [23.3279, 86.3533]; // Fallback while fetching GPS
const defaultBookings = [];

const AutoFitRoute = ({ routePath }) => {
    const map = useMap();
    useEffect(() => {
        if (routePath && routePath.length > 0) {
            const bounds = L.polyline(routePath).getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], animate: true });
            }
        }
    }, [routePath, map]);
    return null;
};

// Helper to update map center only on initial GPS load
const MapUpdater = ({ center }) => {
    const map = useMap();
    const hasCentered = useRef(false);
    useEffect(() => {
        if (!hasCentered.current && center && center[0] !== defaultLoc[0] && center[1] !== defaultLoc[1]) {
            map.setView(center, map.getZoom(), { animate: true });
            hasCentered.current = true;
        }
    }, [center[0], center[1], map]);
    return null;
};

const LiveMapComponent = ({ viewMode = 'user', activeBookings = defaultBookings }) => {
    const { user, login } = useAuth();
    const socket = useSocket();
    const [myPosition, setMyPosition] = useState(defaultLoc);
    const [activeLocations, setActiveLocations] = useState([]);
    const [status, setStatus] = useState('Available'); // For Drivers
    const [isSharingLocation, setIsSharingLocation] = useState(user?.isSharingLocation || false);
    const [selectedAmbulanceForBooking, setSelectedAmbulanceForBooking] = useState(null);
    const mapRef = useRef(null);

    // Routing State
    const [routePath, setRoutePath] = useState([]);
    const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: 0 });

    const lastEmitTimeRef = useRef(0);
    const lastFetchTimeRef = useRef(0);

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

                // Publish Location via Socket
                // Throttle socket emits to every 5 seconds to prevent hanging/lag
                const now = Date.now();
                if (now - lastEmitTimeRef.current > 5000) {
                    const shouldEmit = socket && user && (
                        isSharingLocation || 
                        (activeBookings && activeBookings.length > 0) || 
                        user.role === 'driver' || 
                        user.role === 'admin' ||
                        viewMode === 'admin'
                    );

                    if (shouldEmit) {
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
                        lastEmitTimeRef.current = now;
                    }
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
                // Driver sees their booked user ONLY
                if (activeBookings && activeBookings.length > 0) {
                    shouldShow = activeBookings.some(bid => data.activeBookings?.includes(bid)) && (role === 'user' || role === 'patient');
                } else {
                    shouldShow = false;
                }
            } else if (viewMode === 'user') {
                const hasActiveBookings = activeBookings && activeBookings.length > 0;
                if (hasActiveBookings) {
                    // User sees ONLY their booked ambulance
                    if (role === 'driver' && activeBookings.some(bid => data.activeBookings?.includes(bid))) {
                        shouldShow = true;
                    }
                } else {
                    // User sees all available ambulances
                    if (role === 'driver' && (data.status === 'Available' || data.status === 'Online')) {
                        shouldShow = true;
                    }
                }
            }

            if (!shouldShow) {
                // If they shouldn't be shown, remove them from active locations if they exist
                setActiveLocations(prev => prev.filter(l => !(l.id === data.id && l.role === data.role)));
                return;
            }

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

        // Define tracking target based on role ONLY when there is an active booking
        let target = null;
        if (activeBookings && activeBookings.length > 0) {
            if (viewMode === 'user') {
                target = activeLocations.find(l => l.role === 'driver' && activeBookings.some(bid => l.activeBookings?.includes(bid)));
            } else if (viewMode === 'driver') {
                target = activeLocations.find(l => (l.role === 'user' || l.role === 'patient') && activeBookings.some(bid => l.activeBookings?.includes(bid)));
            }
        }

        if (target && myPosition) {
            const now = Date.now();
            // Throttle OSRM requests to every 10 seconds to prevent hanging and API rate limits
            if (now - lastFetchTimeRef.current > 10000) {
                fetchRoute(myPosition, target.position);
                lastFetchTimeRef.current = now;
            }
        } else {
            setRoutePath(prev => prev.length === 0 ? prev : []); // Clear if no active tracking
            setRouteInfo(prev => prev.distance === 0 && prev.duration === 0 ? prev : { distance: 0, duration: 0 });
        }

    }, [myPosition, activeLocations, viewMode, activeBookings]);


    // 4. Unified Tracking
    const visibleLocations = activeLocations;

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] w-full gap-4 pb-4">
            {/* Header / Route Info Card */}
            <div className="flex flex-wrap items-center justify-between gap-4 shrink-0 px-1">
                <div>
                    <h2 className="text-2xl font-black flex items-center gap-2 tracking-tight">
                        {viewMode === 'admin' && <MapPin className="text-red-600 h-6 w-6" />}
                        {viewMode === 'driver' && <Ambulance className="text-red-600 h-6 w-6" />}
                        {viewMode === 'user' && <User className="text-blue-600 h-6 w-6" />}

                        <span className="brand-text-gradient">
                        {viewMode === 'admin' ? 'Fleet Overview' :
                            viewMode === 'driver' ? 'Navigation' :
                                'Live Tracking'}
                        </span>
                    </h2>
                </div>

                {routeInfo.distance > 0 && (
                    <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none py-1.5 px-5 shadow-lg animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-6 text-sm font-bold">
                            <span className="flex items-center gap-1.5"><CornerUpRight className="h-4 w-4 text-blue-200" /> {routeInfo.distance} km</span>
                            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-blue-200" /> {routeInfo.duration} min</span>
                        </div>
                    </Card>
                )}

                <div className="flex gap-3 items-center">
                    {viewMode !== 'admin' && (
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Share Location</span>
                            <Switch checked={isSharingLocation} onCheckedChange={handleToggleSharing} className="data-[state=checked]:bg-indigo-600" />
                        </div>
                    )}
                    <Button 
                        variant="outline" 
                        className="bg-white hover:bg-slate-50 border-slate-200 shadow-sm font-bold text-slate-700 flex items-center gap-2"
                        onClick={() => {
                            if (mapRef.current) mapRef.current.flyTo(myPosition, 16, { animate: true, duration: 1.5 });
                        }}
                    >
                        <Navigation className="h-4 w-4 text-indigo-600" />
                        <span className="hidden sm:inline">Recenter</span>
                    </Button>
                    {viewMode === 'user' && (
                        <Button 
                            variant="destructive" 
                            className="bg-red-600 hover:bg-red-700 font-bold shadow-md shadow-red-600/20 flex items-center gap-2 animate-pulse"
                            onClick={() => {
                                if (socket && user) socket.emit('update_location', { id: user.id, name: user.name, position: myPosition, status: 'Emergency', role: user.role });
                            }}
                        >
                            <AlertTriangle className="h-4 w-4" />
                            SOS
                        </Button>
                    )}
                </div>
            </div>

            {/* MAP */}
            <Card className="flex-1 shadow-2xl border-0 overflow-hidden rounded-2xl relative ring-1 ring-slate-900/5">
                <CardContent className="p-0 h-full w-full">
                    <MapContainer
                        ref={mapRef}
                        center={myPosition}
                        zoom={13}
                        className="h-full w-full z-0"
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution="&copy; Google Maps"
                            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                        />
                        {/* Auto fit bounds when route exists */}
                        <AutoFitRoute routePath={routePath} />
                        
                        {/* Center on load */}
                        <MapUpdater center={myPosition} />

                        {/* ROUTE LINE (Animated Dashed Line) */}
                        {routePath.length > 0 && (
                            <Polyline 
                                positions={routePath} 
                                color="#2563eb" 
                                weight={6} 
                                opacity={0.8} 
                                dashArray="10, 15"
                                className="animate-[dash_20s_linear_infinite]"
                            />
                        )}

                        {/* CURRENT USER MARKER */}
                        {viewMode !== 'admin' && (
                            <Marker position={myPosition} icon={viewMode === 'driver' ? ambulanceIcon : userIcon} zIndexOffset={1000}>
                                <Popup className="rounded-xl overflow-hidden border-0 shadow-2xl">
                                    <div className="p-2 min-w-[180px]">
                                        <p className="font-black text-lg mb-2 text-slate-900 border-b pb-2">{viewMode === 'driver' ? '🚑 You (Ambulance)' : '👤 You (User)'}</p>
                                        <div className="text-sm space-y-1.5 text-slate-700">
                                            <p><span className="font-bold text-slate-900">Name:</span> {user?.name}</p>
                                            {viewMode === 'driver' && user?.vehicleNumber && <p><span className="font-bold text-slate-900">Vehicle:</span> {user.vehicleNumber}</p>}
                                            <p><span className="font-bold text-slate-900">Status:</span> <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md">{user?.role === 'driver' ? status : 'Online'}</span></p>
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
                            const statusColor = (loc.status === 'Emergency' || loc.status === 'Busy') ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50';

                            return (
                                <Marker key={`${loc.role}-${loc.id}`} position={loc.position} icon={iconToUse}>
                                    <Popup className="rounded-xl overflow-hidden border-0 shadow-2xl">
                                        <div className="p-2 min-w-[180px]">
                                            <p className={`font-black text-lg mb-2 border-b pb-2 ${isAmbulance ? 'text-red-600' : 'text-blue-600'}`}>{label}</p>
                                            <div className="text-sm space-y-1.5 text-slate-700">
                                                <p><span className="font-bold text-slate-900">{nameLabel}</span> {loc.name}</p>
                                                {isAmbulance && loc.vehicleNumber && <p><span className="font-bold text-slate-900">Vehicle:</span> {loc.vehicleNumber}</p>}
                                                <p><span className="font-bold text-slate-900">Status:</span> <span className={`font-bold px-2 py-0.5 rounded-md ${statusColor}`}>{loc.status}</span></p>
                                                {loc.mobile && <p><span className="font-bold text-slate-900">Contact:</span> {loc.mobile}</p>}
                                                
                                                {/* Booking Button for user viewing an available ambulance */}
                                                {viewMode === 'user' && isAmbulance && (loc.status === 'Available' || loc.status === 'Online') && (
                                                    <Button 
                                                        size="sm" 
                                                        className="w-full mt-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold shadow-md"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedAmbulanceForBooking({
                                                                id: loc.id,
                                                                provider_id: loc.id,
                                                                name: loc.name,
                                                                vehicleNumber: loc.vehicleNumber
                                                            });
                                                        }}
                                                    >
                                                        Book This Ambulance
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}

                    </MapContainer>
                </CardContent>
            </Card>

            {/* Booking Modal */}
            <BookingModal
                isOpen={!!selectedAmbulanceForBooking}
                onClose={() => setSelectedAmbulanceForBooking(null)}
                preSelectedService="road"
                provider={selectedAmbulanceForBooking}
                providerType="default_ambulance"
            />
        </div>
    );
};

export default LiveMapComponent;
