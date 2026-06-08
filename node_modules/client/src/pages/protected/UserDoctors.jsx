import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Search, MapPin, Activity, Phone, Eye, CalendarPlus } from 'lucide-react';
import ProfileViewModal from '@/components/ProfileViewModal';
import BookingModal from '@/components/BookingModal';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/utils/api';

const UserDoctors = () => {
    const { token } = useAuth();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [bookingProvider, setBookingProvider] = useState(null);

    useEffect(() => {
        const fetchPublicDoctors = async () => {
            try {
                const data = await fetchApi(`/api/public/doctors`);
                if (data && Array.isArray(data)) {
                    setDoctors(data);
                }
            } catch (err) {
                console.error("Failed to load public doctors.", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicDoctors();
    }, []);

    const filteredDocs = doctors.filter(doc => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            (doc.name && doc.name.toLowerCase().includes(search)) ||
            (doc.specialization && doc.specialization.toLowerCase().includes(search)) ||
            (doc.first_name && doc.first_name.toLowerCase().includes(search))
        );
    });

    return (
        <div className="space-y-4 md:space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Verified Doctors</h1>
                    <p className="text-muted-foreground">Find and contact verified medical professionals in your area.</p>
                </div>
                <div className="relative w-full sm:w-64 md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="search"
                        placeholder="Search by name or specialization..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 pl-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        Loading directory...
                    </div>
                ) : filteredDocs.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        No verified doctors found matching your search.
                    </div>
                ) : (
                    filteredDocs.map((doc) => {
                        const avatarUrl = doc.profile_image_url ? `/uploads/${doc.profile_image_url}` : null;

                        return (
                            <div key={doc.provider_id || doc.id || Math.random()} className="rounded-xl border bg-card text-card-foreground shadow transition-colors hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                                <div className="p-6 flex-1 flex flex-col gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center border-2 border-primary/10">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt={doc.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xl font-bold text-slate-400 capitalize">{doc.name?.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-lg flex flex-wrap items-center gap-1.5">
                                                <span className="truncate max-w-[150px] sm:max-w-xs">{doc.name}</span> <span className="text-sm text-muted-foreground">({doc.custom_id || doc.customId || doc.provider_id || doc.id})</span>
                                                <Activity className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                            </h3>
                                            <p className="text-sm text-primary font-medium truncate">
                                                {doc.specialization || 'General Practitioner'}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                {doc.is_verified && (
                                                    <span title="Verified Doctor" className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 flex-shrink-0">
                                                        ✓ Verified
                                                    </span>
                                                )}
                                                {doc.is_online !== false ? (
                                                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold bg-green-500/10 text-green-500 border-transparent w-max">Available</span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold bg-gray-500/10 text-gray-500 border-transparent w-max">Offline</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-muted-foreground mt-2">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-2">{doc.address || 'Address not listed'}</span>
                                        </div>
                                        {doc.bio && (
                                            <p className="line-clamp-2 italic text-xs border-l-2 pl-2 border-muted mt-3">"{doc.bio}"</p>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 border-t bg-muted/20 flex gap-3">
                                    <Button variant="outline" className="flex-1 bg-background" onClick={() => setSelectedDoc(doc)}>
                                        <Eye className="h-4 w-4 mr-2" /> Details
                                    </Button>
                                    <Button 
                                        className={`flex-1 text-white ${doc.is_online !== false ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed hover:bg-gray-400'}`} 
                                        disabled={doc.is_online === false}
                                        onClick={() => { if(doc.is_online !== false) setBookingProvider(doc) }}
                                    >
                                        <CalendarPlus className="h-4 w-4 mr-2" /> {doc.is_online === false ? 'Offline' : 'Book Now'}
                                    </Button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <ProfileViewModal
                isOpen={!!selectedDoc}
                onClose={() => setSelectedDoc(null)}
                profile={selectedDoc}
                title="Doctor Profile"
                onBookNow={(doc) => {
                    setSelectedDoc(null);
                    setBookingProvider(doc);
                }}
            />

            <BookingModal
                isOpen={!!bookingProvider}
                onClose={() => setBookingProvider(null)}
                preSelectedService="doctor"
                provider={bookingProvider}
                providerType="registered_doctors"
            />
        </div>
    );
};

export default UserDoctors;



