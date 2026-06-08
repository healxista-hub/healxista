import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Ambulance,
    Plane,
    Train,
    Stethoscope,
    Hospital,
    Pill,
    ArrowRight,
    CheckCircle,
    FlaskConical,
    Activity,
    Home,
    Building,

} from 'lucide-react';
import BookingModal from '@/components/BookingModal';
import ComingSoonToast, { useComingSoonToast } from '@/components/ComingSoonToast';


const services = [
    {
        id: 'road',
        title: 'Road Ambulance',
        icon: Ambulance,
        image: '/assets/images/road_ambulance_india.png',
        description:
            'Rapid-response road ambulances with ALS & BLS support, trained paramedics, and real-time GPS tracking.',
        highlights: ['24×7 Availability', 'ALS & BLS Support', 'Live GPS Tracking'],
    },
    {
        id: 'air',
        title: 'Air Ambulance',
        icon: Plane,
        image: '/assets/images/air_ambulance_india.png',
        description:
            'Fastest critical-care transport nationwide with flying ICU, ventilators, and specialist doctors onboard.',
        highlights: ['Flying ICU', 'Pan-India Reach', 'Critical Patient Care'],
        availableSoon: true,
    },
    {
        id: 'train',
        title: 'Train Ambulance',
        icon: Train,
        image: '/assets/images/train_ambulance_india.png',
        description:
            'Affordable long-distance transfers using railways with continuous medical monitoring and escort.',
        highlights: ['Cost-Effective', 'Medical Escort', 'Long Distance Care'],
        availableSoon: true,
    },
    {
        id: 'doctor',
        title: 'Doctor Consultation',
        icon: Stethoscope,
        image: '/assets/images/doctor_india.png',
        description:
            'Instant access to certified doctors via video, audio, or in-person consultation for emergency and routine care.',
        highlights: ['24×7 Doctors', 'Video & Audio Calls', 'Emergency Advice'],
    },
    {
        id: 'hospital',
        title: 'Hospital Network',
        icon: Hospital,
        image: '/assets/images/hospital_india.png',
        description:
            'Connected with 1000+ hospitals nationwide to help you find ICU beds, specialists, and emergency care fast.',
        highlights: ['ICU & Bed Availability', 'Nearest Hospital', 'Specialist Care'],
    },
    {
        id: 'medicine',
        title: 'Medicine Delivery',
        icon: Pill,
        image: '/assets/images/medicine_india.png',
        description:
            'Emergency and scheduled medicine delivery from verified pharmacies, right to your doorstep.',
        highlights: ['Emergency Delivery', 'Genuine Medicines', 'Prescription Support'],
    },
    {
        id: 'lab',
        title: 'Pathological tests',
        icon: FlaskConical,
        image: '/assets/images/lab_test.jpg',
        description: 'Accurate and timely diagnostic tests from comfort of your home. We collect samples and provide online reports.',
        highlights: ['Home Collection', 'Online Reports', 'Certified Labs']
    },
    {
        id: 'home_care',
        title: 'Home Care & Nursing Services',
        icon: Home,
        image: '/assets/images/home_care.jpg',
        description: 'Compassionate care for your loved ones at home. Trained nurses and caregivers for post-op recovery and general care.',
        highlights: ['Trained Nurses', 'Elderly Care', 'Post-Op Care']
    },
    {
        id: 'old_age_home',
        title: 'Old Age Home',
        icon: Building,
        image: '/assets/images/old_age_home.png',
        description: 'Comfortable and caring old age homes for senior citizens with 24/7 medical support.',
        highlights: ['24/7 Support', 'Medical Care', 'Comfortable Living']
    },
    {
        id: 'physio',
        title: 'Physiotherapy',
        icon: Activity,
        image: '/assets/images/physiotherapy.jpg',
        description: 'Expert physiotherapy sessions at home for rehabilitation, pain relief, and mobility improvement.',
        highlights: ['Expert Physiotherapists', 'Rehabilitation', 'Pain Relief']
    }
];

const ServiceTabs = () => {
    const [activeTab, setActiveTab] = useState('road');
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [selectedService, setSelectedService] = useState('road');
    const { isOpen: toastOpen, showToast, hideToast } = useComingSoonToast();
    const activeService = services.find(s => s.id === activeTab);

    const { user } = useAuth();
    const navigate = useNavigate();

    // Function to handle booking or navigation
    const handleAction = (serviceId) => {
        // If user is logged in, prioritize dashboard routes
        if (user) {
            const dashboardRoutes = {
                'road': '/user/ambulances',
                'air': '/user/ambulances',
                'train': '/user/ambulances',
                'doctor': '/user/doctors',
                'medicine': '/user/medicines',
                'physio': '/user/physiotherapy',
                'home_care': '/user/home-cares',
                'lab': '/lab-test', // Public for now
                'old_age_home': '/user/old-age-homes'
            };

            if (dashboardRoutes[serviceId]) {
                navigate(dashboardRoutes[serviceId]);
                return;
            }
        }

        // Generic public navigation
        const publicRoutes = {
            'road': '/ambulance',
            'air': '/ambulance',
            'train': '/ambulance',
            'doctor': '/doctors',
            'hospital': '/hospitals',
            'medicine': '/medicines',
            'lab': '/lab-test',
            'home_care': '/home-care',
            'physio': '/physiotherapy',
            'old_age_home': '/old-age-home'
        };

        if (publicRoutes[serviceId]) {
            navigate(publicRoutes[serviceId]);
        }
    };


    return (
        <section className="relative py-28 bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 mb-4 px-5 py-1.5 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full">
                        🏥 Integrated Emergency Healthcare
                    </span>

                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
                        Complete <span className="text-blue-600">Emergency Care</span> Ecosystem
                    </h2>

                    <p className="mt-5 text-lg text-gray-600 max-w-3xl mx-auto">
                        Ambulance, doctors, hospitals, and medicines — everything you need,
                        <span className="font-semibold text-gray-900"> exactly when it matters.</span>
                    </p>
                </div>

                {/* Tabs */}
                <div role="tablist" className="flex flex-wrap justify-center gap-5 mb-16">
                    {services.map(service => (
                        <motion.button
                            key={service.id}
                            role="tab"
                            aria-selected={activeTab === service.id}
                            onClick={() => setActiveTab(service.id)}
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.97 }}
                            className={`relative flex items-center gap-3 px-7 py-3 rounded-full text-sm md:text-base font-semibold transition-all
                ${activeTab === service.id
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30'
                                    : 'bg-white/80 backdrop-blur text-gray-600 hover:shadow-lg'
                                }`}
                        >
                            <service.icon className="h-5 w-5" />
                            {service.title}
                            {service.availableSoon && (
                                <span className="absolute -top-2 -right-2 bg-amber-400 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-tight shadow">
                                    SOON
                                </span>
                            )}
                        </motion.button>
                    ))}
                </div>

                {/* Content */}
                <div className="relative min-h-[480px]">
                    <AnimatePresence mode="wait">
                        {activeService && (
                            <motion.div
                                key={activeService.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Card className="overflow-hidden border-none shadow-2xl rounded-3xl max-w-6xl mx-auto bg-white/90 backdrop-blur-xl">
                                    <div className="grid md:grid-cols-2">
                                        {/* Image */}
                                        <div className="relative h-72 md:h-full">
                                            <img
                                                src={activeService.image}
                                                alt={activeService.title}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                                        </div>

                                        {/* Content */}
                                        <CardContent className="flex flex-col justify-center p-8 md:p-14 relative">
                                            {/* Available Soon badge - top right */}
                                            {activeService.availableSoon && (
                                                <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                                    </span>
                                                    Available Soon
                                                </div>
                                            )}
                                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 mb-6">
                                                <activeService.icon className="h-8 w-8" />
                                            </div>

                                            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                                {activeService.title}
                                            </h3>

                                            <p className="text-lg text-gray-600 mb-8">
                                                {activeService.description}
                                            </p>

                                            <ul className="grid sm:grid-cols-2 gap-4 mb-10">
                                                {activeService.highlights.map((item, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex items-center gap-3 bg-slate-100 px-4 py-3 rounded-xl text-sm font-medium text-gray-700"
                                                    >
                                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>

                                            <div className="flex flex-wrap gap-4">
                                                <Button
                                                    size="lg"
                                                    className="bg-blue-600 hover:bg-blue-700 px-10"
                                                    onClick={() => {
                                                        handleAction(activeService.id);
                                                    }}
                                                >
                                                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="lg"
                                                    variant="outline"
                                                    className="px-10"
                                                    onClick={showToast}
                                                >
                                                    Call Emergency
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Booking Modal */}
                <BookingModal
                    isOpen={isBookingOpen}
                    onClose={() => setIsBookingOpen(false)}
                    preSelectedService={selectedService}
                />

                {/* Coming Soon Toast */}
                <ComingSoonToast
                    isOpen={toastOpen}
                    onClose={hideToast}
                />
            </div>
        </section>
    );
};

export default ServiceTabs;
