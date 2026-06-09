import React, { useState, useEffect } from 'react';
import { Home, MapPin, Search, Eye, CalendarPlus, CheckCircle2, Shield } from 'lucide-react';
import ProfileViewModal from '@/components/ProfileViewModal';
import BookingModal from '@/components/BookingModal';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/utils/api';

const UserOldAgeHomes = () => {
    const [homes, setHomes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHome, setSelectedHome] = useState(null);
    const [bookingProvider, setBookingProvider] = useState(null);

    useEffect(() => {
        const fetchPublicHomes = async () => {
            try {
                const data = await fetchApi('/api/public/old-age-homes');
                if (data && Array.isArray(data)) {
                    setHomes(data);
                }
            } catch (err) {
                console.error('Failed to load public old age homes.', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicHomes();
    }, []);

    const filteredHomes = homes.filter(home =>
        home.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (home.address && home.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-4 md:space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Old Age Homes</h1>
                    <p className="text-muted-foreground">Find and explore verified old age homes.</p>
                </div>
                <div className="relative w-full sm:w-64 md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="search"
                        placeholder="Search by name or location..."
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
                ) : filteredHomes.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        No verified old age homes found matching your search.
                    </div>
                ) : (
                    filteredHomes.map((home) => {
                        const avatarUrl = home.profile_image_url ? `/uploads/${home.profile_image_url}` : null;

                        return (
                            <div key={home.id} className="rounded-xl border bg-card text-card-foreground shadow transition-colors hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                                <div className="p-6 flex-1 flex flex-col gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center border-2 border-primary/10">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt={home.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xl font-bold text-slate-400 capitalize">{home.name?.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-lg truncate flex items-center gap-1.5">
                                                {home.name} ({home.custom_id || home.customId || home.provider_id || home.id})
                                                <Home className="h-4 w-4 text-orange-500 flex-shrink-0" />
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                {home.is_verified && (
                                                    <span title="Verified Provider" className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 flex-shrink-0">
                                                        ✓ Verified
                                                    </span>
                                                )}
                                                {home.is_online !== false ? (
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
                                            <span className="line-clamp-2">{home.address || 'Address not listed'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 border-t bg-muted/20 flex gap-3">
                                    <Button variant="outline" className="flex-1 bg-background" onClick={() => setSelectedHome(home)}>
                                        <Eye className="h-4 w-4 mr-2" /> Details
                                    </Button>
                                    <Button 
                                        className={`flex-1 text-white ${home.is_online !== false ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed hover:bg-gray-400'}`} 
                                        disabled={home.is_online === false}
                                        onClick={() => { if(home.is_online !== false) setBookingProvider(home) }}
                                    >
                                        <CalendarPlus className="h-4 w-4 mr-2" /> {home.is_online === false ? 'Offline' : 'Book Now'}
                                    </Button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <ProfileViewModal
                isOpen={!!selectedHome}
                onClose={() => setSelectedHome(null)}
                profile={selectedHome}
                title="Old Age Home Details"
                onBookNow={(home) => {
                    setSelectedHome(null);
                    setBookingProvider(home);
                }}
            />

            <BookingModal
                isOpen={!!bookingProvider}
                onClose={() => setBookingProvider(null)}
                preSelectedService="oldAgeHome"
                provider={bookingProvider}
                providerType="registered_old_age_homes"
            />
        </div>
    );
};

export default UserOldAgeHomes;



