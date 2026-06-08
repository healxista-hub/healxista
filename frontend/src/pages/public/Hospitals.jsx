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
    Building2,
    MapPin,
    Phone,
    Star,
    Bed,
    Users,
    Navigation,
    Clock,
    HeartPulse,
    Info,
    Calendar,
    Stethoscope
} from 'lucide-react';

// Premium Old Age Homes Mock Data (Illustrative Only - fully aligned with Kolkata, Purulia & Bokaro)
const oldAgeHomes = [
    {
        name: 'Healxista Senior Living & Care (HQ)',
        location: 'Raghavpur More, Purulia',
        distance: '0.5 km',
        rating: 4.9,
        beds: 15,
        emergency: true,
        specialties: ['24/7 Nursing', 'Doctor Visit', 'Physiotherapy Center', 'Nutritious Diet'],
        image: '/assets/images/hospitals/apollo.jpg', // Illustrative Image
        experience: '8+ Years',
        consultations: '250+ Elders Served',
        bio: 'A state-of-the-art senior assisted living facility offering comprehensive medical supervision, individual attention, and a warm, home-like atmosphere.',
        role_name: 'Old Age Home',
        capacity: 50,
        facilities_description: 'AC/Non-AC premium rooms, library, 24/7 dedicated nurses, emergency hospital liaison, organic gardening zone.',
        address: 'North- Lake Road, Opposite Purulia MRI, Raghavpur More, Purulia 723101'
    },
    {
        name: 'Kolkata Elders Oasis',
        location: 'Salt Lake Sector 5, Kolkata',
        distance: '1.2 km',
        rating: 4.8,
        beds: 8,
        emergency: true,
        specialties: ['Specialized Geriatric Care', 'Dementia Care', 'Yoga & Wellness', 'Recreation Room'],
        image: '/assets/images/hospitals/fortis.jpg', // Illustrative Image
        experience: '12+ Years',
        consultations: '400+ Elders Served',
        bio: 'Premium senior living community offering curated wellness plans, cognitive support therapy, and social integration activities.',
        role_name: 'Old Age Home',
        capacity: 40,
        facilities_description: 'Elevator, wheelchair-friendly washrooms, pure vegetarian meals, regular physician rounds, secure premises.',
        address: 'Sector V, Salt Lake, Near College More, Kolkata 700091'
    },
    {
        name: 'Bokaro Peace Haven',
        location: 'Sector 4, Bokaro Steel City',
        distance: '2.5 km',
        rating: 4.7,
        beds: 10,
        emergency: true,
        specialties: ['24/7 Nurse Assistance', 'On-call Specialists', 'Mental Well-being Programs'],
        image: '/assets/images/hospitals/max.jpg', // Illustrative Image
        experience: '6+ Years',
        consultations: '180+ Elders Served',
        bio: 'A peaceful, leafy campus focused on active aging, personalized care plans, and comprehensive security for seniors.',
        role_name: 'Old Age Home',
        capacity: 30,
        facilities_description: 'Park area, temple & meditation center, regular physiotherapy sessions, customized dietary meals.',
        address: 'Sector 4, Near City Center, Bokaro Steel City 827004'
    },
    {
        name: 'Purulia Anandam Senior Sanctuary',
        location: 'North Lake Road, Purulia',
        distance: '1.8 km',
        rating: 4.6,
        beds: 12,
        emergency: false,
        specialties: ['Geriatric Physiotherapy', 'Spiritual Sessions', 'Social Gathering Halls'],
        image: '/assets/images/hospitals/aiims.jpg', // Illustrative Image
        experience: '10+ Years',
        consultations: '300+ Elders Served',
        bio: 'Affordable, serene retirement home located right by the lake, promoting healthy aging, companionship, and peace of mind.',
        role_name: 'Old Age Home',
        capacity: 60,
        facilities_description: 'Lakeview balconies, medical emergency vehicle, 24/7 ward boy, community kitchen, regular health checkup camp.',
        address: 'North Lake Road, Near Purulia District Court, Purulia 723101'
    },
];

const Hospitals = () => {
    const navigate = useNavigate();
    const [searchLocation, setSearchLocation] = useState('');
    const { isOpen: toastOpen, showToast, hideToast } = useComingSoonToast();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profileProvider, setProfileProvider] = useState(null);

    return (
        <div className="min-h-screen bg-white">
            <SEO 
                title="Verified Old Age Homes Network" 
                description="Find premium verified old age homes and senior care living centers across Kolkata, Purulia, and Bokaro with comprehensive facilities." 
                keywords="old age homes, senior care, retirement home, elder care, Purulia, Kolkata, Bokaro"
            />
            {/* HERO */}
            <PageHero
                bg="/assets/images/hero/hospital.jpg" // Illustrative Banner Image
                badge={{ icon: Building2, text: 'Verified Senior Living & Care' }}
                title={<>Find Premium <span className="text-yellow-300">Old Age Homes</span></>}
                subtitle="Locate secure, medical-supported senior care homes near you with comprehensive premium facilities."
                primaryBtn={{ label: 'Search Nearby', icon: Navigation, onClick: showToast }}
            />

            {/* Search Bar Context */}
            <div className="container mx-auto px-4 -mt-12 relative z-20">
                <Card className="max-w-3xl mx-auto shadow-2xl border-none">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-indigo-500" />
                                <Input
                                    placeholder="Enter your location (e.g. Purulia, Salt Lake)..."
                                    className="pl-12 h-12 md:h-14 text-sm md:text-base bg-gray-50 border-gray-200 focus:bg-white rounded-xl"
                                    value={searchLocation}
                                    onChange={(e) => setSearchLocation(e.target.value)}
                                />
                            </div>
                            <Button
                                className="h-12 md:h-14 px-6 md:px-8 text-sm md:text-base font-bold bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto rounded-xl shadow-lg shadow-indigo-600/30"
                                onClick={showToast}
                            >
                                Search Homes
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* QUICK FILTERS */}
            <section className="py-8 bg-gray-50 border-b">
                <div className="container mx-auto px-4">
                    <motion.div className="flex flex-wrap gap-3 justify-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                        {['24/7 Nursing Care', 'Physiotherapy Center', 'Dementia Support', 'Premium AC Rooms', 'Doctor Visit Available'].map((filter) => (
                            <Button
                                key={filter}
                                variant="outline"
                                className="rounded-full border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 transition"
                                onClick={showToast}
                            >
                                {filter}
                            </Button>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* HOMES LIST */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold">Premium Senior Homes Near You</h2>
                            <p className="text-gray-500 text-sm mt-1">Showing {oldAgeHomes.length} verified senior care sanctuaries</p>
                        </div>
                        <Button variant="outline" className="border-gray-200" onClick={showToast}>
                            <Star className="mr-2 h-4 w-4 text-yellow-500" />
                            Filter Options
                        </Button>
                    </div>

                    <div className="space-y-8">
                        {oldAgeHomes.map((home, i) => (
                            <motion.div
                                key={home.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-none ring-1 ring-gray-100 group">
                                    <CardContent className="p-0">
                                        <div className="flex flex-col md:flex-row">
                                            {/* Illustrative Image */}
                                            <div className="md:w-1/3 lg:w-1/4 h-64 md:h-auto overflow-hidden relative">
                                                <img
                                                    src={home.image}
                                                    alt={home.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    loading="lazy"
                                                />
                                                <div className="absolute top-4 left-4 flex gap-2">
                                                    {home.emergency && (
                                                        <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg shadow-md animate-pulse">
                                                            MEDICAL-SUPPORTED
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{home.name}</h3>
                                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1 font-medium">
                                                                <MapPin className="h-4 w-4 text-indigo-400" />
                                                                {home.location} ({home.distance} away)
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                                                                <Star className="h-4 w-4 fill-green-600 text-green-600" />
                                                                <span className="font-bold text-green-700">{home.rating}</span>
                                                            </div>
                                                            <span className="text-xs text-gray-400 mt-1">Verified Partner</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 my-4">
                                                        {home.specialties.map((spec) => (
                                                            <span key={spec} className="px-3 py-1 bg-indigo-50/50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">
                                                                {spec}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-100">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                                                        <span className="font-semibold text-green-700">{home.beds} Rooms/Beds Vacant</span>
                                                    </div>
                                                    <div className="flex gap-3 w-full sm:w-auto">
                                                        <Button
                                                            variant="outline"
                                                            className="flex-1 sm:flex-none border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                                            onClick={() => {
                                                                setProfileProvider(home);
                                                                setIsProfileOpen(true);
                                                            }}
                                                        >
                                                            View Details
                                                        </Button>
                                                        <Button
                                                            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                                                            onClick={() => navigate('/login/user')}
                                                        >
                                                            Book Virtual Tour
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* VERIFIED OLD AGE HOMES SECTION */}
            <VerifiedProvidersSection
                title="Our Globally Verified Care Facilities"
                subtitle="Trusted and licensed senior retirement sanctuaries with 24/7 care support."
                apiEndpoint="/api/public/old-age-homes"
                ProviderIcon={Building2}
                navigate={navigate}
                setProfileProvider={setProfileProvider}
                setIsProfileOpen={setIsProfileOpen}
            />

            {/* WHY CHOOSE US */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Why Book via Healxista Senior Net</h2>
                        <p className="text-gray-500">Trusted retirement sanctuaries with professional care standards.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Building2, title: 'Licensed Sanctuaries', desc: 'All care homes are fully government certified & medical audited.' },
                            { icon: HeartPulse, title: 'Geriatric Support', desc: 'Pre-linked hospital tie-ups and emergency ambulance standby.' },
                            { icon: Clock, title: 'Active Aging & Recreation', desc: 'Scheduled mental health, spiritual sessions, and companion gatherings.' },
                        ].map((item, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                <div className="text-center p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow">
                                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white mb-4">
                                        <item.icon className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-gray-900">{item.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
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

export default Hospitals;
