import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

import BookingModal from './BookingModal';

const serviceLinks = [
    { name: 'All Services', path: '/services' },
    { name: 'Ambulance', path: '/ambulance' },
    { name: 'Doctors', path: '/doctors' },
    { name: 'Medicines', path: '/medicines' },
    { name: 'Old Age Home', path: '/hospitals' },
    { name: 'Pathology Test', path: '/lab-test' },
    { name: 'Home Care', path: '/home-care' },
    { name: 'Physiotherapy', path: '/physiotherapy' },
];

const mainLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
];

const Navbar = () => {
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [showServices, setShowServices] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isServicesExpanded, setIsServicesExpanded] = useState(false);
    const [activeLang, setActiveLang] = useState('en');

    const changeLanguage = (langCode) => {
        setActiveLang(langCode);
        const select = document.querySelector('.goog-te-combo');
        if (select) {
            select.value = langCode;
            select.dispatchEvent(new Event('change'));
        }
    };

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path) => location.pathname === path;

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled
                ? 'py-3 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm'
                : 'py-6 bg-transparent'
                }`}
        >
            <div className="container mx-auto flex h-16 items-center justify-between px-4">

                <Link
                    to="/"
                    className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95"
                >
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl font-black tracking-tight mb-2"
                    >
                        <span className="brand-text-gradient">Healxista</span>
                    </motion.h1>
                </Link>

                {/* DESKTOP NAV */}
                <div className="hidden lg:flex items-center gap-2">
                    <Link to="/" className={`px-3 py-2 rounded-lg text-base font-semibold transition-all ${isActive('/') ? (isScrolled ? 'text-red-600 bg-red-50' : 'text-white bg-white/20') : (isScrolled ? 'text-gray-700 hover:text-red-600 hover:bg-red-50' : 'text-white/90 hover:text-white hover:bg-white/10')}`}>
                        Home
                    </Link>

                    {/* Services Dropdown */}
                    <div
                        className="relative group h-16 flex items-center"
                        onMouseEnter={() => setShowServices(true)}
                        onMouseLeave={() => setShowServices(false)}
                    >
                        <button className={`px-3 py-2 rounded-lg flex items-center gap-1 text-base font-semibold transition-all ${location.pathname.includes('/') && location.pathname !== '/' && location.pathname !== '/about' && location.pathname !== '/contact' ? (isScrolled ? 'text-red-600 bg-red-50' : 'text-white bg-white/20') : (isScrolled ? 'text-gray-700 group-hover:text-red-600 group-hover:bg-red-50' : 'text-white/90 group-hover:text-white group-hover:bg-white/10')}`}>
                            Services <ChevronDown className="h-4 w-4" />
                        </button>

                        {/* Dropdown Menu */}
                        <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-200 ${showServices ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                            <div className="bg-white rounded-xl shadow-xl border p-2 min-w-[200px] grid gap-1">
                                {serviceLinks.map((service) => (
                                    <Link
                                        key={service.name}
                                        to={service.path}
                                        className={`block px-4 py-2 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors ${isActive(service.path) ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-700 hover:text-red-600'}`}
                                    >
                                        {service.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                    <Link to="/news" className={`px-3 py-2 rounded-lg text-base font-semibold transition-all ${isActive('/news') ? (isScrolled ? 'text-red-600 bg-red-50' : 'text-white bg-white/20') : (isScrolled ? 'text-gray-700 hover:text-red-600 hover:bg-red-50' : 'text-white/90 hover:text-white hover:bg-white/10')}`}>
                        News
                    </Link>
                    <Link to="/publication" className={`px-3 py-2 rounded-lg text-base font-semibold transition-all ${isActive('/publication') ? (isScrolled ? 'text-red-600 bg-red-50' : 'text-white bg-white/20') : (isScrolled ? 'text-gray-700 hover:text-red-600 hover:bg-red-50' : 'text-white/90 hover:text-white hover:bg-white/10')}`}>
                        Research
                    </Link>
                    <Link to="/careers" className={`px-3 py-2 rounded-lg text-base font-semibold transition-all ${isActive('/careers') ? (isScrolled ? 'text-red-600 bg-red-50' : 'text-white bg-white/20') : (isScrolled ? 'text-gray-700 hover:text-red-600 hover:bg-red-50' : 'text-white/90 hover:text-white hover:bg-white/10')}`}>
                        Careers
                    </Link>
                    <Link to="/about" className={`px-3 py-2 rounded-lg text-base font-semibold transition-all ${isActive('/about') ? (isScrolled ? 'text-red-600 bg-red-50' : 'text-white bg-white/20') : (isScrolled ? 'text-gray-700 hover:text-red-600 hover:bg-red-50' : 'text-white/90 hover:text-white hover:bg-white/10')}`}>
                        About
                    </Link>
                    <Link to="/contact" className={`px-3 py-2 rounded-lg text-base font-semibold transition-all ${isActive('/contact') ? (isScrolled ? 'text-red-600 bg-red-50' : 'text-white bg-white/20') : (isScrolled ? 'text-gray-700 hover:text-red-600 hover:bg-red-50' : 'text-white/90 hover:text-white hover:bg-white/10')}`}>
                        Contact
                    </Link>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-3">
                    {/* Emergency CTA */}
                    <Button
                        onClick={() => setIsBookingOpen(true)}
                        className="hidden sm:flex bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/20"
                    >
                        <Phone className="mr-2 h-4 w-4 text-white" />
                        Book Ambulance
                    </Button>

                    <Link to="/login/user" className="hidden md:block">
                        <Button className={`transition-colors font-bold shadow-md ${isScrolled ? 'bg-primary text-white hover:bg-primary/90' : 'bg-white text-primary hover:bg-white/90'}`}>
                            User Login
                        </Button>
                    </Link>

                    <div className="hidden md:block relative">
                        {/* Language Selector Above Provider Button */}
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-1 w-max notranslate">
                            <span className={`text-[10px] font-bold mr-1 ${isScrolled ? 'text-gray-700' : 'text-white/90'}`}>Language:</span>
                            <button onClick={() => changeLanguage('en')} className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${activeLang === 'en' ? 'bg-primary text-white' : (isScrolled ? 'text-gray-600 hover:bg-gray-200' : 'text-white/80 hover:bg-white/20')}`}>English</button>
                            <button onClick={() => changeLanguage('hi')} className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${activeLang === 'hi' ? 'bg-primary text-white' : (isScrolled ? 'text-gray-600 hover:bg-gray-200' : 'text-white/80 hover:bg-white/20')}`}>Hindi</button>
                            <button onClick={() => changeLanguage('bn')} className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${activeLang === 'bn' ? 'bg-primary text-white' : (isScrolled ? 'text-gray-600 hover:bg-gray-200' : 'text-white/80 hover:bg-white/20')}`}>Bangla</button>
                        </div>
                        <Link to="/provider-portal">
                            <Button variant="ghost" className={`font-bold border-2 rounded-[12px] transition-all hover:scale-105 ${isScrolled ? 'border-blue-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50' : 'border-white/40 text-white hover:text-white hover:bg-white/10 hover:border-white/60'}`}>
                                Provider Portal
                            </Button>
                        </Link>
                    </div>

                    {/* MOBILE MENU BUTTON */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`lg:hidden ${isScrolled ? 'text-gray-900' : 'text-white hover:bg-white/20'}`}
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <X /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>
            </div >

            {/* MOBILE MENU */}
            {open && (
                <div className="lg:hidden border-t bg-background px-4 py-4 space-y-1 h-[calc(100vh-64px)] overflow-y-auto">
                    <Link to="/" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium hover:text-red-600 hover:bg-red-50 transition-colors">Home</Link>

                    <div className="py-2">
                        <button
                            onClick={() => setIsServicesExpanded(!isServicesExpanded)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-gray-900 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                            Services
                            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isServicesExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isServicesExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
                            <div className="pl-4 space-y-3 border-l-2 border-gray-100 ml-1 mb-2">
                                {serviceLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        onClick={() => {
                                            setOpen(false);
                                            setIsServicesExpanded(false); // Optional: close accordion when menu closes
                                        }}
                                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${isActive(link.path) ? 'text-red-600 font-bold bg-red-50' : 'text-muted-foreground hover:text-red-600 hover:bg-red-50'}`}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Link to="/news" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium hover:text-red-600 hover:bg-red-50 transition-colors">News & Updates</Link>
                    <Link to="/publication" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium hover:text-red-600 hover:bg-red-50 transition-colors">Research</Link>
                    <Link to="/careers" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium hover:text-red-600 hover:bg-red-50 transition-colors">Careers</Link>
                    <Link to="/about" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium hover:text-red-600 hover:bg-red-50 transition-colors">About</Link>

                    <Link to="/contact" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium hover:text-red-600 hover:bg-red-50 transition-colors">Contact</Link>

                    <div className="pt-4 flex flex-col gap-3">
                        <Button
                            onClick={() => {
                                setOpen(false);
                                setIsBookingOpen(true);
                            }}
                            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold text-base shadow-md"
                        >
                            🚨 Emergency SOS / Book Now
                        </Button>

                        <Link to="/login/user" onClick={() => setOpen(false)} className="w-full">
                            <Button className="w-full h-11 bg-primary text-white font-bold hover:bg-primary/90 shadow-md">
                                User Login
                            </Button>
                        </Link>

                        <Link to="/provider-portal" onClick={() => setOpen(false)} className="w-full">
                            <Button variant="outline" className="w-full h-11 border-2 border-blue-100 rounded-[12px] text-blue-600 font-bold hover:text-blue-700 hover:bg-blue-50">
                                Provider Portal
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
            {/* Booking Modal */}
            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
            />
        </header>
    );
};

export default Navbar;
