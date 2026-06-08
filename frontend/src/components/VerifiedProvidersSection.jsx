import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Star, MapPin, User, Activity } from 'lucide-react';

export default function VerifiedProvidersSection({ 
    title = "Our Verified Providers", 
    subtitle = "Every provider on our platform has been rigorously reviewed and approved.",
    apiEndpoint, // e.g. '/api/public/ambulances'
    ProviderIcon = User,
    navigate, 
    setProfileProvider, 
    setIsProfileOpen 
}) {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const res = await fetch(apiEndpoint);
                if (res.ok) {
                    const data = await res.json();
                    setProviders(data.slice(0, 6)); // max 6
                }
            } catch (err) {
                console.error(`Could not fetch from ${apiEndpoint}`, err);
            } finally {
                setLoading(false);
            }
        };
        if (apiEndpoint) fetchProviders();
    }, [apiEndpoint]);

    if (!loading && providers.length === 0) return null;

    return (
        <section className="py-16 bg-gray-50 border-t border-gray-200">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 border border-green-200">
                        <Shield className="h-4 w-4" /> Admin Verified
                    </div>
                    <h2 className="text-3xl font-bold mb-4">{title}</h2>
                    <p className="text-gray-600">{subtitle}</p>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-500">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-3"></div>
                        <p>Loading verified providers...</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {providers.map((provider, i) => {
                            const avatarUrl = provider.profile_image_url
                                ? `/uploads/${provider.profile_image_url}`
                                : null;

                            return (
                                <motion.div
                                    key={provider.provider_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                    className="group"
                                >
                                    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-none ring-1 ring-gray-200">
                                        <div className="relative h-52 overflow-hidden bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                                            {avatarUrl ? (
                                                <img
                                                    src={avatarUrl}
                                                    alt={provider.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-red-400">
                                                    <ProviderIcon className="h-16 w-16 opacity-30" />
                                                    <span className="text-5xl font-black text-red-200">{provider.name?.charAt(0) || 'P'}</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                                                <div className="text-white">
                                                    <h3 className="font-bold text-lg leading-tight">{provider.name || provider.ownerName || provider.lab_name}</h3>
                                                    <p className="text-sm opacity-90">{provider.specialization || provider.vehicleType || provider.accreditation || provider.role_name}</p>
                                                </div>
                                            </div>
                                            <span className="absolute top-3 left-3 px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                                                <Shield className="h-3 w-3" /> Verified
                                            </span>
                                            {/* Offline Badge */}
                                            {provider.is_online === false && (
                                                <span className="absolute top-3 right-3 px-2.5 py-1 bg-gray-500 text-white text-xs font-bold rounded-full shadow-lg">
                                                    Offline
                                                </span>
                                            )}
                                        </div>
                                        <CardContent className="p-5 space-y-4">
                                            <div className="flex items-center justify-between text-sm text-gray-600">
                                                <span className="flex items-center gap-1.5 truncate max-w-[160px]">
                                                    <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
                                                    <span className="truncate">{provider.address || 'Location varies'}</span>
                                                </span>
                                                {provider.overall_rating > 0 && (
                                                    <span className="flex items-center gap-1 shrink-0">
                                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                        {parseFloat(provider.overall_rating).toFixed(1)}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mt-4">
                                                <Button
                                                    variant="outline"
                                                    className="w-full text-xs font-semibold"
                                                    onClick={() => {
                                                        if (setProfileProvider && setIsProfileOpen) {
                                                            setProfileProvider({ 
                                                                ...provider, 
                                                                type: provider.specialization || provider.vehicleType || provider.role_name 
                                                            });
                                                            setIsProfileOpen(true);
                                                        }
                                                    }}
                                                >
                                                    View Details
                                                </Button>
                                                <Button
                                                    className={`w-full text-xs font-semibold ${provider.is_online !== false ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 hover:bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                                    onClick={() => { if(provider.is_online !== false && navigate) navigate('/login/user') }}
                                                    disabled={provider.is_online === false}
                                                >
                                                    {provider.is_online === false ? 'Not Available' : 'Book Now'}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
