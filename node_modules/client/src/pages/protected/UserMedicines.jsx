import React, { useState, useEffect } from 'react';
import { MapPin, Search, Phone, Eye, Pill, CalendarPlus, CheckCircle2 } from 'lucide-react';
import ProfileViewModal from '@/components/ProfileViewModal';
import BookingModal from '@/components/BookingModal';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/utils/api';

const UserMedicines = () => {
    const [pharmacies, setPharmacies] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('stores'); // 'stores' or 'medicines'
    const [selectedStore, setSelectedStore] = useState(null);
    const [bookingProvider, setBookingProvider] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const endpoint = viewMode === 'stores' ? 'medicines' : 'medicines/all';
                const data = await fetchApi(`/api/public/${endpoint}`);
                if (data && Array.isArray(data)) {
                    if (viewMode === 'stores') {
                        setPharmacies(data);
                    } else {
                        setMedicines(data);
                    }
                }
            } catch (err) {
                console.error('Failed to load data.', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [viewMode]);

    const filteredStores = pharmacies.filter(store =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (store.address && store.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredMedicines = medicines.filter(med =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4 md:space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-outfit">Medicine & Pharmacy</h1>
                    <p className="text-muted-foreground">Find verified pharmacies and browse available medicines.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setViewMode('stores')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'stores' ? 'bg-white shadow-sm text-green-600' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        Pharmacies
                    </button>
                    <button 
                        onClick={() => setViewMode('medicines')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'medicines' ? 'bg-white shadow-sm text-green-600' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        Medicines
                    </button>
                </div>
                <div className="relative w-full sm:w-64 md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="search"
                        placeholder={`Search ${viewMode}...`}
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
                ) : viewMode === 'stores' ? (
                    filteredStores.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            No verified medicine stores found matching your search.
                        </div>
                    ) : (
                        filteredStores.map((store) => {
                            const avatarUrl = store.profile_image_url ? `/uploads/${store.profile_image_url}` : null;

                            return (
                                <div key={store.provider_id} className="rounded-xl border bg-card text-card-foreground shadow transition-colors hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                                    <div className="p-6 flex-1 flex flex-col gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center border-2 border-primary/10">
                                                {avatarUrl ? (
                                                    <img src={avatarUrl} alt={store.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xl font-bold text-slate-400 capitalize">{store.name?.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 w-full">
                                                <h3 className="font-semibold text-lg flex flex-wrap items-center gap-1.5 min-w-0">
                                                    <span className="truncate max-w-[140px] sm:max-w-[180px]">{store.name}</span>
                                                    <span className="text-sm text-muted-foreground whitespace-nowrap">({store.custom_id || store.customId || store.provider_id || store.id})</span>
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                                    {store.is_verified && (
                                                        <span title="Verified Pharmacy" className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 flex-shrink-0">
                                                            ✓ Verified
                                                        </span>
                                                    )}
                                                    {store.is_online !== false ? (
                                                        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold bg-green-500/10 text-green-500 border-transparent w-max">Available</span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold bg-gray-500/10 text-gray-500 border-transparent w-max">Offline</span>
                                                    )}
                                                    {store.overall_rating > 0 && (
                                                        <div className="flex items-center gap-1 text-yellow-500 text-xs ml-1">
                                                            <span>★</span>
                                                            <span className="font-medium text-slate-700">{parseFloat(store.overall_rating).toFixed(1)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm text-muted-foreground mt-2">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                <span className="line-clamp-2">{store.address || 'Address not listed'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 border-t bg-muted/20 flex gap-3">
                                        <Button variant="outline" className="flex-1 bg-background" onClick={() => setSelectedStore(store)}>
                                            <Eye className="h-4 w-4 mr-2" /> Details
                                        </Button>
                                        <Button 
                                            className={`flex-1 text-white shadow-sm ${store.is_online !== false ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed hover:bg-gray-400'}`} 
                                            disabled={store.is_online === false}
                                            onClick={() => { if(store.is_online !== false) setBookingProvider(store) }}
                                        >
                                            <CalendarPlus className="h-4 w-4 mr-2" /> {store.is_online === false ? 'Offline' : 'Book Now'}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )
                ) : (
                    filteredMedicines.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            No medicines found matching your search.
                        </div>
                    ) : (
                        filteredMedicines.map((med) => (
                            <div key={med.inventory_id} className="rounded-xl border bg-card text-card-foreground shadow transition-colors hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg text-slate-900">{med.name}</h3>
                                        <p className="text-sm text-muted-foreground">{med.manufacturer}</p>
                                    </div>
                                    {med.is_prescription_required && (
                                        <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[10px] font-bold border border-orange-200">Rx Required</span>
                                    )}
                                </div>
                                
                                <div className="flex justify-between items-center pt-2">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-400">Price</span>
                                        <span className="text-xl font-extrabold text-slate-900">₹{med.price}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-slate-400">Availability</span>
                                        <span className={`text-sm font-semibold ${med.stock_level > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {med.stock_level > 0 ? `${med.stock_level} in stock` : 'Out of stock'}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Pill className="h-3 w-3 text-green-500" />
                                        <span>Available at: <span className="font-semibold px-1">{med.store_name}</span></span>
                                    </div>
                                </div>

                                <Button 
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-10 shadow-sm"
                                    onClick={() => setBookingProvider({ id: med.store_id, name: med.store_name })}
                                >
                                    Order Now
                                </Button>
                            </div>
                        ))
                    )
                )}
            </div>

            <ProfileViewModal
                isOpen={!!selectedStore}
                onClose={() => setSelectedStore(null)}
                profile={selectedStore}
                title="Pharmacy Details"
                onBookNow={(store) => {
                    setSelectedStore(null);
                    setBookingProvider(store);
                }}
            />

            <BookingModal
                isOpen={!!bookingProvider}
                onClose={() => setBookingProvider(null)}
                preSelectedService="medicine"
                provider={bookingProvider}
                providerType="registered_medicine_stores"
            />
        </div>
    );
};

export default UserMedicines;



