import React, { useState, useEffect } from 'react';
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
    Ambulance,
    Plane,
    Train,
    HeartPulse,
    Shield,
    Clock,
    MapPin,
    Phone,
    CheckCircle2,
    Smile,
    Star,
    Users,
    UserCheck,
    Activity,
} from 'lucide-react';

const ambulanceTypes = [
    {
        icon: Ambulance,
        name: 'ALS Ambulance',
        subtitle: 'Advanced Life Support',
        price: '₹1,500 – ₹3,000',
        features: ['Ventilator', 'Defibrillator', 'ECG Monitor', 'Trained Paramedics'],
        color: 'blue',
    },
    {
        icon: HeartPulse,
        name: 'BLS Ambulance',
        subtitle: 'Basic Life Support',
        price: '₹800 – ₹1,500',
        features: ['Oxygen', 'First Aid', 'Stretcher', '24/7 Available'],
        color: 'green',
    },
    {
        icon: Plane,
        name: 'Air Ambulance',
        subtitle: 'Critical Air Transfer',
        price: '₹2,00,000+',
        features: ['ICU Setup', 'Specialist Doctors', 'Fastest Transfer'],
        color: 'red',
    },
    {
        icon: Train,
        name: 'Train Ambulance',
        subtitle: 'Long Distance Medical Care',
        price: '₹15,000 – ₹50,000',
        features: ['Medical Escort', 'Cost Effective', 'Pan-India'],
        color: 'purple',
    },
];

const colorMap = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
};

const heroImages = [
    '/assets/images/hero/road.jpg',
    '/assets/images/hero/air.webp', // Fixed: changed from jpg to webp
    '/assets/images/hero/train.jpg',
    '/assets/images/hero/icu.jpg',
    '/assets/images/hero/doctor.jpg',
];

export default function AmbulancePage() {
    const navigate = useNavigate();
    const [bgIndex, setBgIndex] = useState(0);
    const { isOpen: toastOpen, showToast, hideToast } = useComingSoonToast();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profileProvider, setProfileProvider] = useState(null);
    const [loadedImages, setLoadedImages] = useState([]);

    // Preload images
    useEffect(() => {
        const loadImages = async () => {
            const promises = heroImages.map((src) => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.src = src;
                    img.onload = () => resolve(src);
                    img.onerror = () => reject(src);
                });
            });

            try {
                await Promise.all(promises);
                setLoadedImages(heroImages);
            } catch (error) {
                console.error("Failed to load some hero images", error);
            }
        };
        loadImages();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <SEO 
                title="Ambulance Services" 
                description="Book ALS, BLS, Air, or Train ambulances within minutes. Healxista gives you access to 1,200+ fast and reliable ambulances with verified paramedics across Kolkata, Purulia & Bokaro." 
                keywords="ambulance, ALS, BLS, air ambulance, train ambulance, emergency medical transport"
            />
            {/* HERO SECTION */}
            <PageHero
                bg={heroImages[bgIndex]}
                badge={{ icon: HeartPulse, text: '24×7 Emergency Services' }}
                title={<>Ambulance <span className="text-yellow-300">Within Minutes</span></>}
                subtitle="India’s trusted ambulance network with GPS tracking & trained paramedics."
                primaryBtn={{ label: 'Login to Book Ambulance', icon: Phone, onClick: () => navigate('/login/user') }}
            />


            {/* AMBULANCE TYPES */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-4">Our Modern Ambulance Fleet</h2>
                    <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                        Equipped with the latest life-saving technology and staffed by certified professionals.
                    </p>

                    <div className="space-y-12">
                        {/* ALS Ambulance */}
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2 group hover:shadow-2xl transition-all duration-300">
                            <div className="relative h-64 md:h-auto overflow-hidden">
                                <img
                                    src="/assets/images/ambulance/als.png"
                                    alt="Advanced Life Support Ambulance"
                                    loading="lazy"
                                    className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10">MOST BOOKED</div>
                            </div>
                            <div className="p-8 flex flex-col justify-center">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                        <Ambulance className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">Advanced Life Support (ALS)</h3>
                                        <span className="text-sm font-semibold text-blue-600 px-2 py-0.5 bg-blue-50 rounded-full border border-blue-100">ICU on Wheels</span>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-6">
                                    Designed for critical care transport. It functions as a mobile ICU with a ventilator and advanced monitoring systems, suitable for heart attack, stroke, or severe trauma patients.
                                </p>
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-900 mb-2">Key Equipment</h4>
                                        <ul className="text-sm text-gray-500 space-y-1">
                                            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> Transport Ventilator</li>
                                            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> Multipara Monitor</li>
                                            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> Defibrillator & AED</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-900 mb-2">Ideal For</h4>
                                        <ul className="text-sm text-gray-500 space-y-1">
                                            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-blue-500" /> Cardiac Emergencies</li>
                                            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-blue-500" /> Respiratory Failure</li>
                                            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-blue-500" /> Inter-hospital Transfer</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-auto">
                                    <div>
                                        <span className="text-xs text-gray-500 block">Starting from</span>
                                        <span className="text-xl font-bold text-gray-900">₹2,500</span>
                                    </div>
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700"
                                        onClick={() => navigate('/login/user')}
                                    >
                                        Book ALS Now
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* BLS Ambulance */}
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2 group hover:shadow-2xl transition-all duration-300">
                            <div className="p-8 flex flex-col justify-center order-2 md:order-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                                        <HeartPulse className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">Basic Life Support (BLS)</h3>
                                        <span className="text-sm font-semibold text-green-600 px-2 py-0.5 bg-green-50 rounded-full border border-green-100">Medical Transport</span>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-6">
                                    Best for non-critical emergencies. Provides essential life support during transport for patients who require medical observation but not intensive care.
                                </p>
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-900 mb-2">Key Equipment</h4>
                                        <ul className="text-sm text-gray-500 space-y-1">
                                            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> Oxygen Cylinders</li>
                                            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> Auto-loading Stretcher</li>
                                            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> First Aid & Splints</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-900 mb-2">Ideal For</h4>
                                        <ul className="text-sm text-gray-500 space-y-1">
                                            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> Minor Injuries/Fractures</li>
                                            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> Discharge from Hospital</li>
                                            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> Scheduled Checkups</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-auto">
                                    <div>
                                        <span className="text-xs text-gray-500 block">Starting from</span>
                                        <span className="text-xl font-bold text-gray-900">₹900</span>
                                    </div>
                                    <Button
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => navigate('/login/user')}
                                    >
                                        Book BLS Now
                                    </Button>
                                </div>
                            </div>
                            <div className="relative h-64 md:h-auto overflow-hidden order-1 md:order-2">
                                <img
                                    src="/assets/images/ambulance/bls.png"
                                    alt="Basic Life Support Ambulance"
                                    loading="lazy"
                                    className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                                />
                            </div>
                        </div>

                        {/* Air & Train Ambulance Grid */}
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Air Ambulance */}
                            <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-300">
                                <div className="h-64 overflow-hidden relative">
                                    <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                        </span>
                                        Available Soon
                                    </div>
                                    <img
                                        src="/assets/images/ambulance/air.png"
                                        alt="Air Ambulance"
                                        loading="lazy"
                                        className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                                    />
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Plane className="h-6 w-6 text-red-600" />
                                        <h3 className="text-xl font-bold">Air Ambulance</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Rapid aeromedical transfer for patients needing immediate long-distance transport. Fully equipped with ICU setup and flight doctors.
                                    </p>
                                    <Button
                                        className="w-full mt-auto bg-red-600 hover:bg-red-700"
                                        onClick={() => navigate('/login/user')}
                                    >
                                        Request Air Transfer
                                    </Button>
                                </div>
                            </div>

                            {/* Train Ambulance */}
                            <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-300">
                                <div className="h-64 overflow-hidden relative">
                                    <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                        </span>
                                        Available Soon
                                    </div>
                                    <img
                                        src="/assets/images/ambulance/train.png"
                                        alt="Train Ambulance"
                                        loading="lazy"
                                        className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                                    />
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Train className="h-6 w-6 text-purple-600" />
                                        <h3 className="text-xl font-bold">Train Ambulance</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        A cost-effective solution for stable patients travelling long distances. Entire AC compartment converted into a medical bay with escort.
                                    </p>
                                    <Button
                                        className="w-full mt-auto bg-purple-600 hover:bg-purple-700"
                                        onClick={() => navigate('/login/user')}
                                    >
                                        Inquire for Train
                                    </Button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* SAFETY STANDARDS */}
            <section className="py-16 bg-blue-900 text-white">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">World-Class Equipment & Safety Standards</h2>
                            <p className="text-white/80 mb-6 text-lg">
                                We don't just transport; we care. Every Healxista ambulance is audited for hygiene and equipment readiness before every shift.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Stryker/Ferno Auto-loading Stretchers',
                                    'Biphasic Defibrillators (US-FDA Approved)',
                                    'Portable Ventilators for Adult & Pediatric',
                                    'GPS Tracking with Live Vitals Transmission'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-400">
                                            <CheckCircle2 className="h-4 w-4 text-blue-300" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
                            <img
                                src="/assets/images/ambulance/als.png"
                                alt="Inside Ambulance"
                                className="w-full h-full object-cover opacity-90"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent flex items-end p-6">
                                <div>
                                    <h4 className="text-xl font-bold">100% Sanitized Fleet</h4>
                                    <p className="text-sm text-white/70">Post-COVID hygiene protocols followed strictly.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-12">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Activity, title: 'Request Ambulance', desc: 'Enter your location and contact details.' },
                            { icon: UserCheck, title: 'Get Confirmation', desc: 'Receive confirmation and ambulance details instantly.' },
                            { icon: MapPin, title: 'Track Ambulance', desc: 'Track in real-time until arrival.' },
                        ].map((step, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
                                    <step.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold">{step.title}</h3>
                                <p className="text-gray-600 mt-2">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* WHY US */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8 text-center">
                    {[
                        { icon: Clock, title: 'Fast Response', desc: '8–12 min average arrival' },
                        { icon: Shield, title: 'Certified Staff', desc: 'Trained paramedics' },
                        { icon: MapPin, title: 'Live GPS Tracking', desc: 'Track in real-time' },
                    ].map((x, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 text-red-600">
                                <x.icon className="h-8 w-8" />
                            </div>
                            <h3 className="mt-4 text-xl font-bold">{x.title}</h3>
                            <p className="text-gray-600 mt-2">{x.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* VERIFIED AMBULANCES */}
            <VerifiedProvidersSection
                title="Our Verified Ambulances"
                subtitle="Book reliable and fast ambulances driven by verified professionals."
                apiEndpoint="/api/public/ambulances"
                ProviderIcon={Ambulance}
                navigate={navigate}
                setProfileProvider={setProfileProvider}
                setIsProfileOpen={setIsProfileOpen}
            />

            {/* TESTIMONIALS */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-12">What Our Patients Say</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Smile, name: 'Ravi Sharma', feedback: 'The ambulance arrived in 10 minutes. Paramedics were very professional!' },
                            { icon: Users, name: 'Neha Gupta', feedback: 'Air ambulance service saved my father’s life. Highly recommended!' },
                            { icon: Star, name: 'Amit Singh', feedback: 'Excellent tracking and fast response. Felt very safe!' },
                        ].map((t, i) => (
                            <Card key={i} className="p-6 hover:shadow-xl transition">
                                <CardContent className="space-y-4">
                                    <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 text-red-600">
                                        <t.icon className="h-8 w-8" />
                                    </div>
                                    <h4 className="text-xl font-bold">{t.name}</h4>
                                    <p className="text-gray-600">{t.feedback}</p>
                                </CardContent>
                            </Card>
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
}
