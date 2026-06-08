import React, { useState, useEffect } from 'react';
import { Ambulance, MapPin, Search, Phone, Eye, CalendarPlus, CheckCircle2, Shield } from 'lucide-react';
import ProfileViewModal from '@/components/ProfileViewModal';
import BookingModal from '@/components/BookingModal';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/utils/api';

const UserAmbulances = () => {
    const [ambulances, setAmbulances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAmbulance, setSelectedAmbulance] = useState(null);
    const [bookingProvider, setBookingProvider] = useState(null);

    useEffect(() => {
        const fetchPublicAmbulances = async () => {
            try {
                const data = await fetchApi(`/api/public/ambulances`);
                if (data && Array.isArray(data)) {
                    setAmbulances(data);
                }
            } catch (err) {
                console.error("Failed to load public ambulances.", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicAmbulances();
    }, []);

    const filteredAmbulances = ambulances.filter(amb => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            (amb.name && amb.name.toLowerCase().includes(search)) ||
            (amb.address && amb.address.toLowerCase().includes(search)) ||
            (amb.vehicle_type && amb.vehicle_type.toLowerCase().includes(search)) ||
            (amb.first_name && amb.first_name.toLowerCase().includes(search))
        );
    });

    return (
        <div className="space-y-4 md:space-y-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ambulance Services</h1>
                    <p className="text-muted-foreground">View verified ambulances nearby and request emergency assistance.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Button variant="outline" className="flex items-center gap-2" onClick={() => window.location.href = '/map'}>
                        <MapPin className="h-4 w-4" /> Live Map Tracking
                    </Button>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="search"
                            placeholder="Search by location, type or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 pl-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        Loading ambulance directory...
                    </div>
                ) : filteredAmbulances.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        {searchTerm ? "No ambulances found matching your search." : "No verified ambulances available at the moment."}
                    </div>
                ) : (
                    filteredAmbulances.map((amb) => {
                        const avatarUrl = amb.profile_image_url ? `/uploads/${amb.profile_image_url}` : null;

                        return (
                            <div key={amb.provider_id || amb.id || Math.random()} className="rounded-xl border bg-card text-card-foreground shadow transition-colors hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                                <div className="p-6 flex flex-col space-y-4 flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full">
                                        <h3 className="font-semibold text-lg flex items-center gap-2 min-w-0">
                                            <Ambulance className="h-5 w-5 text-red-500 flex-shrink-0" />
                                            <span className="truncate">{amb.vehicle_number || 'Unregistered Vehicle'}</span>
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {amb.is_verified && (
                                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                                                    ✓ Verified
                                                </span>
                                            )}
                                            {amb.is_online !== false ? (
                                                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold bg-green-500/10 text-green-500 border-transparent whitespace-nowrap">
                                                    Available
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold bg-gray-500/10 text-gray-500 border-transparent whitespace-nowrap">
                                                    Offline
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt={amb.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-sm">
                                                    {amb.name?.charAt(0) || 'D'}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Driver: {amb.name || 'Unknown'} ({amb.custom_id || amb.customId || amb.id})</p>
                                            <p className="text-xs text-muted-foreground">{amb.vehicle_type || 'Basic Life Support'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 flex-1">
                                        <div className="text-sm text-foreground flex items-start gap-2">
                                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                            <span className="line-clamp-2">{amb.address || 'Location varies'}</span>
                                        </div>
                                        {amb.experience && (
                                            <div className="text-sm text-foreground flex items-center gap-2">
                                                <CalendarPlus className="h-4 w-4 text-muted-foreground" /> {amb.experience} Experience
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 border-t bg-muted/20 flex gap-3">
                                    <Button variant="outline" className="flex-1 bg-background" onClick={() => setSelectedAmbulance(amb)}>
                                        <Eye className="h-4 w-4 mr-2" /> Details
                                    </Button>
                                    <Button 
                                        className={`flex-1 text-white ${amb.is_online !== false ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed hover:bg-gray-400'}`} 
                                        disabled={amb.is_online === false}
                                        onClick={() => { if(amb.is_online !== false) setBookingProvider(amb) }}
                                    >
                                        <Ambulance className="h-4 w-4 mr-2" /> {amb.is_online === false ? 'Offline' : 'Book Now'}
                                    </Button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <ProfileViewModal
                isOpen={!!selectedAmbulance}
                onClose={() => setSelectedAmbulance(null)}
                profile={selectedAmbulance}
                title="Ambulance Details"
                onBookNow={(amb) => {
                    setSelectedAmbulance(null);
                    setBookingProvider(amb);
                }}
            />

            <BookingModal
                isOpen={!!bookingProvider}
                onClose={() => setBookingProvider(null)}
                preSelectedService="road"
                provider={bookingProvider}
                providerType="registered_drivers"
            />
        </div>
    );
};

export default UserAmbulances;



