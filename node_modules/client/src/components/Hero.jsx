import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Phone, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BookingModal from '@/components/BookingModal';
import ComingSoonToast, { useComingSoonToast } from '@/components/ComingSoonToast';
import axios from 'axios';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const slides = [
    {
        image: '/assets/images/hero/road.jpg',
        badge: '24×7 Road Ambulance',
        title: 'Fast Road Ambulance',
        highlight: 'Within Minutes',
        subtitle: 'Rapid response with trained paramedics & GPS tracking',
        description: 'ALS & BLS ambulances available near you.',
    },
    {
        image: '/assets/images/hero/airambulance.png',
        badge: 'Critical Air Transfer',
        title: 'Air Ambulance',
        highlight: 'Nationwide',
        subtitle: 'For long-distance & critical emergencies',
        description: 'ICU-equipped aircraft with specialist doctors onboard.',
        availableSoon: true,
    },
    {
        image: '/assets/images/hero/icu.jpg',
        badge: 'Advanced Life Support',
        title: 'Mobile ICU',
        highlight: 'On Wheels',
        subtitle: 'Hospital-level care during transport',
        description: 'Ventilators, monitors & emergency medicines onboard.',
    },
    {
        image: '/assets/images/hero/train.jpg',
        badge: 'Train Ambulance',
        title: 'Long Distance Care',
        highlight: 'Affordable',
        subtitle: 'Medical escort for railway transfers',
        description: 'Cost-effective patient transport with monitoring.',
        availableSoon: true,
    },
    {
        image: '/assets/images/hero/doctor.jpg',
        badge: 'Doctor Consultation',
        title: 'Talk to a Doctor',
        highlight: 'Instantly',
        subtitle: 'Emergency medical guidance anytime',
        description: 'Consult certified doctors before ambulance arrival.',
    },
    {
        image: '/assets/images/hero/pharmacy.jpg',
        badge: 'Emergency Medicines',
        title: 'Life-saving Medicines',
        highlight: 'Delivered Fast',
        subtitle: 'Emergency pharmacy at your doorstep',
        description: 'Order critical medicines instantly.',
    },
    {
        image: '/assets/images/hero/lab_test.png',
        badge: 'Diagnostic Lab',
        title: 'Pathology Tests at Home',
        highlight: 'Accurate Results',
        subtitle: 'Blood sample collection from your home',
        description: 'Certified labs & digital reports.',
    },
    {
        image: '/assets/images/hero/home_care.png',
        badge: 'Home Healthcare',
        title: 'Professional Home Care',
        highlight: 'Compassionate',
        subtitle: 'Nursing care & medical support at home',
        description: 'Elderly care, post-op care & more.',
    },
    {
        image: '/assets/images/hero/physiotherapy.png',
        badge: 'Rehab & Physio',
        title: 'Physiotherapy',
        highlight: 'Expert Care',
        subtitle: 'Recovery & rehabilitation sessions',
        description: 'Pain management & mobility support.',
    },
];

const Hero = () => {
    const navigate = useNavigate();
    const [index, setIndex] = useState(0);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [quickBookData, setQuickBookData] = useState({ pickup: '', drop: '', phone: '' });
    const [quickBookStatus, setQuickBookStatus] = useState('idle');
    const [quickBookMessage, setQuickBookMessage] = useState('');
    const { isOpen: toastOpen, showToast, hideToast } = useComingSoonToast();

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((i) => (i + 1) % slides.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const handleQuickBook = async (e) => {
        e.preventDefault();

        if (!quickBookData.pickup || !quickBookData.phone) {
            setQuickBookStatus('error');
            setQuickBookMessage('Pickup location and Mobile Number are required.');
            return;
        }

        if (!/^[0-9]{10}$/.test(quickBookData.phone.replace(/\s/g, ''))) {
            setQuickBookStatus('error');
            setQuickBookMessage('Please enter a valid 10-digit mobile number.');
            return;
        }

        setQuickBookStatus('loading');
        setQuickBookMessage('');

        try {
            await axios.post(`/api/quick-bookings`, {
                serviceType: "road",
                name: "Quick Emergency Booking",
                phone: quickBookData.phone,
                location: quickBookData.pickup,
                destination: quickBookData.drop,
                details: "Critical Emergency Ambulance Request"
            }, { withCredentials: true });

            setQuickBookStatus('success');
            setQuickBookData({ pickup: '', drop: '', phone: '' });

            setTimeout(() => {
                setQuickBookStatus('idle');
            }, 5000);
        } catch (error) {
            console.error('Quick booking error:', error);
            setQuickBookStatus('error');
            setQuickBookMessage(error.response?.data?.message || 'Failed to submit. Please use the full form.');
        }
    };

    return (
        <section className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden">
            {/* HERO BACKGROUND */}
            <div className="absolute inset-0 z-0">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: 'easeInOut' }}
                        className="absolute inset-0"
                    >
                        <img
                            src={slides[index].image}
                            alt={slides[index].title}
                            className="w-full h-full object-cover"
                        />
                        {/* Enhanced gradient overlay for maximum contrast and aesthetics */}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent mix-blend-multiply" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-slate-900/40" />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* CONTENT GRID */}
            <div className="container mx-auto px-6 md:px-12 relative z-10 grid lg:grid-cols-2 gap-8 lg:gap-20 items-start lg:items-center w-full py-24 lg:py-0">

                {/* LEFT: TEXT CONTENT */}
                <motion.div
                    key={`text-${index}`}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                    className="text-white space-y-4 md:space-y-8"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap items-center gap-3"
                    >
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-bold shadow-2xl">
                            <span className="relative flex h-2 md:h-3 w-2 md:w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 md:h-3 w-2 md:w-3 bg-red-500"></span>
                            </span>
                            {slides[index].badge}
                        </div>
                        {slides[index].availableSoon && (
                            <div className="inline-flex items-center gap-1.5 bg-amber-400/90 backdrop-blur-md text-slate-900 px-3 py-1.5 rounded-full text-xs font-black shadow-xl">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 opacity-50"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-900"></span>
                                </span>
                                Available Soon
                            </div>
                        )}
                    </motion.div>

                    <h1 className="text-3xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight drop-shadow-2xl">
                        {slides[index].title}
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mt-2">
                            {slides[index].highlight}
                        </span>
                    </h1>

                    <p className="text-base md:text-xl text-white/90 max-w-2xl font-light leading-relaxed text-shadow-sm">
                        {slides[index].subtitle}. <br className="hidden md:block" />
                        <span className="font-semibold text-white/100">{slides[index].description}</span>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-2 md:pt-4">
                        <Button
                            size="lg"
                            className="h-11 md:h-14 px-6 md:px-8 text-sm md:text-lg font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-[0_0_40px_-10px_rgba(220,38,38,0.8)] border-none hover:scale-105 transition-all rounded-full"
                            onClick={() => navigate('/services')}
                        >
                            Explore Services <ArrowRight className="ml-2 h-4 md:h-5 w-4 md:w-5" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-11 md:h-14 px-6 md:px-8 text-sm md:text-lg font-bold text-white border-white/40 bg-white/5 hover:bg-white/20 backdrop-blur-md transition-all rounded-full"
                            onClick={() => window.location.href = 'tel:9239362736'}
                        >
                            <Phone className="mr-2 h-4 md:h-5 w-4 md:w-5 text-red-400" />
                            Emergency Call: 9239362736
                        </Button>
                    </div>
                </motion.div>

                {/* RIGHT: GLASSMORPHISM BOOKING CARD */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="relative w-full max-w-lg mx-auto lg:ml-auto"
                >
                    {/* Glowing effect behind card */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-blue-600 rounded-[1.5rem] md:rounded-[2rem] blur-2xl opacity-20 animate-pulse" />

                    <div className="relative bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
                        <h3 className="text-xl md:text-2xl font-black text-white mb-6 md:mb-8 flex items-center gap-3 drop-shadow-md">
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <MapPin className="text-red-400 h-5 w-5 md:h-6 md:w-6" />
                            </div>
                            Quick SOS Booking
                        </h3>

                        {quickBookStatus === 'success' ? (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center py-6 md:py-8 space-y-4 md:space-y-6"
                            >
                                <div className="relative mx-auto w-16 h-16 md:w-24 md:h-24 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
                                    <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-full h-full w-full flex items-center justify-center">
                                        <CheckCircle2 className="h-8 w-8 md:h-12 md:w-12 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xl md:text-2xl font-bold text-white mb-2">Help is on the way!</h4>
                                    <p className="text-sm md:text-base text-white/80">Our dispatch team will contact you immediately.</p>
                                </div>
                                <Button
                                    onClick={() => setQuickBookStatus('idle')}
                                    className="w-full h-11 md:h-12 mt-2 md:mt-4 text-white bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full border-white/30"
                                >
                                    Book Another
                                </Button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleQuickBook} className="space-y-4 md:space-y-5">
                                {quickBookStatus === 'error' && (
                                    <div className="text-xs md:text-sm text-red-200 bg-red-900/50 p-2 md:p-3 rounded-xl border border-red-500/50 backdrop-blur-sm">
                                        {quickBookMessage}
                                    </div>
                                )}

                                <div className="space-y-3 md:space-y-4">
                                    <div className="relative">
                                        <Input
                                            placeholder="Your Current Location *"
                                            className="h-12 md:h-14 pl-5 text-base md:text-lg bg-white/80 border-0 focus:ring-2 focus:ring-red-500 text-slate-900 rounded-xl font-medium placeholder:text-slate-500 shadow-inner"
                                            value={quickBookData.pickup}
                                            onChange={(e) => setQuickBookData({ ...quickBookData, pickup: e.target.value })}
                                            disabled={quickBookStatus === 'loading'}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Input
                                            placeholder="Drop Location (Optional)"
                                            className="h-12 md:h-14 pl-5 text-base md:text-lg bg-white/80 border-0 focus:ring-2 focus:ring-red-500 text-slate-900 rounded-xl font-medium placeholder:text-slate-500 shadow-inner"
                                            value={quickBookData.drop}
                                            onChange={(e) => setQuickBookData({ ...quickBookData, drop: e.target.value })}
                                            disabled={quickBookStatus === 'loading'}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Input
                                            placeholder="Mobile Number *"
                                            className="h-12 md:h-14 pl-5 text-base md:text-lg bg-white/80 border-0 focus:ring-2 focus:ring-red-500 text-slate-900 rounded-xl font-medium placeholder:text-slate-500 shadow-inner"
                                            value={quickBookData.phone}
                                            onChange={(e) => {
                                                setQuickBookData({ ...quickBookData, phone: e.target.value });
                                                if (quickBookStatus === 'error') setQuickBookStatus('idle');
                                            }}
                                            disabled={quickBookStatus === 'loading'}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        type="submit"
                                        disabled={quickBookStatus === 'loading'}
                                        className="flex-1 h-12 md:h-14 text-sm md:text-lg font-black bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl shadow-xl shadow-red-900/50 border-none transition-all active:scale-95"
                                    >
                                        {quickBookStatus === 'loading' ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="h-5 w-5 animate-spin" /> Dispatching...
                                            </span>
                                        ) : 'Send Emergency Request'}
                                    </Button>
                                    <Button
                                        type="button"
                                        className="h-12 w-12 md:h-14 md:w-14 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-xl text-white border border-white/30 flex items-center justify-center transition-all shadow-xl"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setIsBookingOpen(true);
                                        }}
                                        title="Advanced Booking Options"
                                    >
                                        <div className="flex gap-0.5">
                                            <span className="w-1 h-1 bg-white rounded-full"></span>
                                            <span className="w-1 h-1 bg-white rounded-full"></span>
                                            <span className="w-1 h-1 bg-white rounded-full"></span>
                                        </div>
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50"
            >
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-1.5 h-1.5 bg-white/70 rounded-full"
                    />
                </div>
            </motion.div>

            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                preSelectedService="road"
            />
            <ComingSoonToast isOpen={toastOpen} onClose={hideToast} />
        </section>
    );
};

export default Hero;
