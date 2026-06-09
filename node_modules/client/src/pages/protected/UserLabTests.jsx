import React, { useState, useEffect } from 'react';
import { FlaskConical, MapPin, Search, Eye, CalendarPlus, CheckCircle2, Shield, Home } from 'lucide-react';
import ProfileViewModal from '@/components/ProfileViewModal';
import BookingModal from '@/components/BookingModal';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/utils/api';

const UserLabTests = () => {
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLab, setSelectedLab] = useState(null);
    const [bookingProvider, setBookingProvider] = useState(null);

    useEffect(() => {
        const fetchVerifiedLabs = async () => {
            try {
                const data = await fetchApi('/api/public/lab-tests');
                if (data && Array.isArray(data)) {
                    setLabs(data);
                }
            } catch (err) {
                console.error('Failed to load verified lab tests.', err);
            } finally {
                setLoading(false);
            }
        };

        fetchVerifiedLabs();
    }, []);

    const filteredLabs = labs.filter(lab => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            (lab.name && lab.name.toLowerCase().includes(search)) ||
            (lab.lab_name && lab.lab_name.toLowerCase().includes(search)) ||
            (lab.accreditation && lab.accreditation.toLowerCase().includes(search)) ||
            (lab.address && lab.address.toLowerCase().includes(search))
        );
    });

    return (
        <div className="space-y-4 md:space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pathology Tests</h1>
                    <p className="text-muted-foreground">
                        Browse verified diagnostic labs — only NABL-accredited, verified providers are listed.
                    </p>
                </div>
                <div className="relative w-full sm:w-64 md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="search"
                        placeholder="Search by lab name, city, accreditation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 pl-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                </div>
            </div>

            {/* Verified-Only Notice */}
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700">
                <Shield className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span>All labs listed here are <strong>admin-verified</strong> and meet our diagnostic quality standards.</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                            Loading verified labs...
                        </div>
                    </div>
                ) : filteredLabs.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-muted-foreground flex flex-col items-center gap-3">
                        <FlaskConical className="h-12 w-12 text-slate-200" />
                        <p className="font-medium text-slate-700">
                            {searchTerm ? 'No labs found matching your search.' : 'No verified labs available at the moment.'}
                        </p>
                        <p className="text-sm">Check back later as we onboard more accredited labs in your area.</p>
                    </div>
                ) : (
                    filteredLabs.map((lab) => {
                        const avatarUrl = lab.profile_image_url
                            ? `/uploads/${lab.profile_image_url}`
                            : null;

                        return (
                            <div
                                key={lab.provider_id}
                                className="rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                            >
                                <div className="p-6 flex-1 flex flex-col gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-blue-50 overflow-hidden flex-shrink-0 flex items-center justify-center border border-blue-100">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt={lab.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <FlaskConical className="h-7 w-7 text-blue-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-lg truncate flex items-center gap-1.5">
                                                {lab.lab_name || lab.name} ({lab.custom_id || lab.customId || lab.provider_id || lab.id})
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Owner Name: <span className="font-medium text-foreground">{lab.owner_name || lab.ownerName || lab.name}</span>
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span title="Verified Lab" className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 flex-shrink-0">
                                                    <CheckCircle2 className="h-3 w-3" /> Verified
                                                </span>
                                                {lab.is_online !== false ? (
                                                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold bg-green-500/10 text-green-500 border-transparent w-max">Available</span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold bg-gray-500/10 text-gray-500 border-transparent w-max">Offline</span>
                                                )}
                                            </div>
                                            {lab.overall_rating > 0 && (
                                                <div className="flex items-center gap-1 text-yellow-500 text-xs mt-1">
                                                    <span>★</span>
                                                    <span className="font-semibold text-slate-700">{parseFloat(lab.overall_rating).toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-2">{lab.address || 'Address not listed'}</span>
                                        </div>

                                        {lab.accreditation && (
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 flex-shrink-0 text-blue-500" />
                                                <span className="text-blue-700 font-medium">{lab.accreditation}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <Home className="h-4 w-4 flex-shrink-0" />
                                            <span>
                                                Home sample collection:{' '}
                                                <span className={`font-semibold ${lab.home_sample_collection ? 'text-green-600' : 'text-slate-500'}`}>
                                                    {lab.home_sample_collection ? 'Available' : 'Not available'}
                                                </span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {lab.home_sample_collection && (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                                                <Home className="h-3 w-3" /> Home Collection
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 border-t bg-muted/20 flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 bg-background"
                                        onClick={() => setSelectedLab(lab)}
                                    >
                                        <Eye className="h-4 w-4 mr-2" /> Details
                                    </Button>
                                    <Button
                                        className={`flex-1 text-white ${lab.is_online !== false ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed hover:bg-gray-400'}`}
                                        disabled={lab.is_online === false}
                                        onClick={() => { if(lab.is_online !== false) setBookingProvider(lab) }}
                                    >
                                        <CalendarPlus className="h-4 w-4 mr-2" /> {lab.is_online === false ? 'Offline' : 'Book Test'}
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <ProfileViewModal
                isOpen={!!selectedLab}
                onClose={() => setSelectedLab(null)}
                profile={selectedLab}
                title="Pathology Test Details"
                onBookNow={(lab) => {
                    setSelectedLab(null);
                    setBookingProvider(lab);
                }}
            />

            <BookingModal
                isOpen={!!bookingProvider}
                onClose={() => setBookingProvider(null)}
                preSelectedService="lab"
                provider={bookingProvider}
                providerType="registered_labs"
            />
        </div>
    );
};

export default UserLabTests;



