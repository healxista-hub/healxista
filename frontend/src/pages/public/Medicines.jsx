import React, { useState } from 'react';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import ComingSoonToast, { useComingSoonToast } from '@/components/ComingSoonToast';
import PageHero from '@/components/PageHero';
import VerifiedProvidersSection from '@/components/VerifiedProvidersSection';
import ProviderProfileModal from '@/components/ProviderProfileModal';
import {
    Pill,
    ShoppingCart,
    Upload,
    Truck,
    Clock,
    Shield,
    CheckCircle2,
    Search
} from 'lucide-react';

const categories = [
    { icon: Pill, name: 'Emergency Medicines', count: 150 },
    { icon: Shield, name: 'Prescription Drugs', count: 320 },
    { icon: CheckCircle2, name: 'OTC Medicines', count: 200 },
    { icon: Pill, name: 'Cardiac Care', count: 85 },
    { icon: Pill, name: 'Diabetes Care', count: 95 },
    { icon: Pill, name: 'Critical Care', count: 65 },
];

const medicines = [
    { name: 'Aspirin 75mg', category: 'Cardiac Care', price: '₹45', prescription: false, inStock: true, image: '/assets/images/medicines/aspirin.jpg' },
    { name: 'Adrenaline Injection', category: 'Emergency', price: '₹120', prescription: true, inStock: true, image: '/assets/images/medicines/adrenaline.jpg' },
    { name: 'Insulin Glargine', category: 'Diabetes', price: '₹850', prescription: true, inStock: true, image: '/assets/images/medicines/insulin.jpg' },
    { name: 'Paracetamol 500mg', category: 'OTC', price: '₹25', prescription: false, inStock: true, image: '/assets/images/medicines/paracetamol.jpg' },
];

const Medicines = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const { isOpen: toastOpen, showToast, hideToast } = useComingSoonToast();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profileProvider, setProfileProvider] = useState(null);

    return (
        <div className="min-h-screen bg-white">
            <SEO 
                title="Order Medicines" 
                description="Order emergency and prescription medicines online with fast delivery. Upload your prescription for prompt service directly from verified local pharmacies." 
                keywords="medicines, pharmacy, online pharmacy, prescription drugs, emergency medicines"
            />
            {/* HERO */}
            <PageHero
                bg="/assets/images/hero/pharmacy.jpg"
                badge={{ icon: Pill, text: 'Verified & Genuine Medicines' }}
                title={<>Emergency Medicines <span className="text-yellow-300">Delivered Fast</span></>}
                subtitle="Order critical medicines instantly with verified prescriptions. 24/7 availability."
                primaryBtn={{ label: 'Upload Prescription', icon: Pill, onClick: () => navigate('/login/user') }}
                secondaryBtn={{ label: 'Search Medicines', icon: Search, onClick: () => {
                    const el = document.getElementById('search-meds');
                    if(el) el.scrollIntoView({behavior: 'smooth'});
                } }}
            />

            {/* In context, search could be done here instead of in the hero */}
            <div id="search-meds" className="container mx-auto px-4 -mt-12 relative z-20">
                <Card className="max-w-3xl mx-auto shadow-2xl border-none">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                <Input
                                    placeholder="Search for medicines..."
                                    className="pl-12 h-12 md:h-14 text-sm md:text-base bg-gray-50 border-gray-200 focus:bg-white rounded-xl"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button
                                className="h-12 md:h-14 px-6 md:px-8 text-sm md:text-base font-bold bg-green-600 hover:bg-green-700 w-full sm:w-auto rounded-xl shadow-lg shadow-green-600/30"
                                onClick={() => navigate('/login/user')}
                            >
                                Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* HOW TO ORDER */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">How to Order</h2>
                        <p className="text-gray-600">Get your medicines in 3 simple steps</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {[
                            { step: '1', icon: Upload, title: 'Upload Prescription', desc: 'Upload your doctor\'s prescription securely' },
                            { step: '2', icon: ShoppingCart, title: 'Place Order', desc: 'Select medicines and confirm order' },
                            { step: '3', icon: Truck, title: 'Fast Delivery', desc: 'Get medicines delivered within hours' },
                        ].map((item) => (
                            <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                <div className="text-center">
                                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white mb-4">
                                        <item.icon className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                    <p className="text-gray-600 text-sm">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CATEGORIES */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Medicine Categories</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {categories.map((cat, i) => (
                            <motion.div
                                key={cat.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                viewport={{ once: true }}
                                className="bg-green-50 p-6 rounded-2xl hover:bg-green-100 transition-colors text-center cursor-pointer"
                            >
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white mb-3">
                                    <cat.icon className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-sm mb-1">{cat.name}</h3>
                                <p className="text-xs text-gray-500">{cat.count} items</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* AVAILABLE MEDICINES */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">In Stock Medicines</h2>
                        <p className="text-gray-600">Ready for fast delivery</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {medicines.map((med, i) => (
                            <motion.div
                                key={med.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="group"
                            >
                                <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-none ring-1 ring-gray-100 flex flex-col h-full">
                                    <div className="relative h-48 overflow-hidden bg-gray-50 flex items-center justify-center p-4">
                                        <img
                                            src={med.image}
                                            alt={med.name}
                                            className="h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        {med.inStock && (
                                            <span className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
                                                In Stock
                                            </span>
                                        )}
                                        {med.prescription && (
                                            <span className="absolute top-3 right-3 h-8 w-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xs border border-orange-200" title="Prescription Required">
                                                Rx
                                            </span>
                                        )}
                                    </div>

                                    <CardContent className="p-5 space-y-4 flex-1 flex flex-col">
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-green-600 mb-1">{med.category}</p>
                                            <h3 className="font-bold text-lg text-gray-900 leading-tight">{med.name}</h3>
                                        </div>

                                        <div className="flex items-end justify-between border-t border-gray-100 pt-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400">MRP</span>
                                                <span className="text-xl font-bold text-gray-900">{med.price}</span>
                                            </div>
                                            <Button
                                                className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 rounded-xl px-6"
                                                onClick={() => navigate('/login/user')}
                                            >
                                                Add +
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* VERIFIED PHARMACIES */}
            <VerifiedProvidersSection
                title="Our Verified Medicine Stores"
                subtitle="Order directly from authorized pharmacies near you."
                apiEndpoint="/api/public/medicines"
                ProviderIcon={Pill}
                navigate={navigate}
                setProfileProvider={setProfileProvider}
                setIsProfileOpen={setIsProfileOpen}
            />

            {/* FEATURES */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[{ icon: Clock, title: 'Fast Delivery', desc: 'Emergency medicines within 2-4 hours' },
                        { icon: Shield, title: 'Authentic Medicines', desc: 'All medicines are verified & genuine' },
                        { icon: Truck, title: 'Pan-India Delivery', desc: 'Available across 450+ cities' }
                        ].map((item, i) => (
                            <div key={i} className="text-center p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow">
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white mb-4">
                                    <item.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Coming Soon Toast */}
            <ComingSoonToast
                isOpen={toastOpen}
                onClose={hideToast}
            />

            <ProviderProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                provider={profileProvider}
                onBookNow={() => navigate('/login/user')}
            />
        </div>
    );
};

export default Medicines;
