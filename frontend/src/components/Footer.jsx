import React, { useState, useEffect } from 'react';
import {
    Ambulance,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Mail,
    Phone,
    MapPin,
    Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

import logo from '@/assets/logo.png';
import TermsModal from '@/components/TermsModal';
import PrivacyModal from '@/components/PrivacyModal';
import DataSecurityModal from '@/components/DataSecurityModal';

const Footer = () => {
    const [visitorCount, setVisitorCount] = useState(128743);
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
    const [isSecurityOpen, setIsSecurityOpen] = useState(false);

    useEffect(() => {
        const storedCount = localStorage.getItem('healxista_visitors');
        if (storedCount) {
            const newCount = parseInt(storedCount, 10) + 1;
            setVisitorCount(newCount);
            localStorage.setItem('healxista_visitors', newCount.toString());
        } else {
            const initialCount = 128000 + Math.floor(Math.random() * 950);
            setVisitorCount(initialCount);
            localStorage.setItem('healxista_visitors', initialCount.toString());
        }
    }, []);

    return (
        <footer className="bg-gray-950 text-gray-300 pt-16 pb-10">
            <div className="container mx-auto px-6">

                {/* Top Grid */}
                <div className="grid gap-12 md:grid-cols-4 mb-14">

                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="Healxista" className="h-10 w-auto opacity-90" />
                            <span className="text-2xl font-black tracking-tight">
                                <span className="brand-text-gradient">Healxista</span>
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-400">
                            Healxista Emergency Services is a real-time response and healthcare
                            coordination platform, connecting citizens with ambulances,
                            hospitals, and doctors across India.
                        </p>

                        <div className="flex gap-4">
                            {[
                                { Icon: Facebook, href: 'https://www.facebook.com/healxista', label: 'Facebook' },
                                { Icon: Twitter, href: 'https://www.twitter.com/healxista', label: 'Twitter' },
                                { Icon: Instagram, href: 'https://www.instagram.com/healxista', label: 'Instagram' },
                                { Icon: Linkedin, href: 'https://www.linkedin.com/company/healxista', label: 'LinkedIn' },
                            ].map(({ Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center
                                    hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                                >
                                    <Icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Platform */}
                    <div>
                        <h4 className="text-white font-semibold text-lg mb-6">
                            Platform
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/dashboard" className="hover:text-red-500 transition-colors">User Dashboard</Link></li>
                            <li><Link to="/lab-test" className="hover:text-red-500 transition-colors">Book Pathology Tests</Link></li>
                            <li><Link to="/home-care" className="hover:text-red-500 transition-colors">Home Care Services</Link></li>
                            <li><Link to="/physiotherapy" className="hover:text-red-500 transition-colors">Physiotherapy</Link></li>
                            <li><Link to="/doctors" className="hover:text-red-500 transition-colors">Doctor Consultation</Link></li>
                            <li><Link to="/hospitals" className="hover:text-red-500 transition-colors">Old Age Home</Link></li>
                            <li><Link to="/news" className="hover:text-red-500 transition-colors">News & Updates</Link></li>
                            <li><Link to="/publication" className="hover:text-red-500 transition-colors">Research Publications</Link></li>
                            <li><Link to="/careers" className="hover:text-red-500 transition-colors">Careers & Jobs</Link></li>
                        </ul>
                    </div>

                    {/* Emergency Services */}
                    <div>
                        <h4 className="text-white font-semibold text-lg mb-6">
                            Emergency Services
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li>🚑 Road Ambulance (24×7)</li>
                            <li>🏡 Old Age Home Vacancy</li>
                            <li>👨‍⚕️ On-Call Doctors</li>
                            <li>🫀 ICU & Critical Care</li>
                            <li>💊 Emergency Medicine Delivery</li>
                            <li>🩸 Diagnostic Pathology Tests</li>
                            <li>🏡 Professional Home Care</li>
                            <li>🦾 Physiotherapy & Rehab</li>
                            <li>📍 Live Ambulance Tracking</li>
                        </ul>
                    </div>

                    {/* Contact – Kolkata */}
                    <div>
                        <h4 className="text-white font-semibold text-lg mb-6">
                            Registered Office &amp; Service Areas
                        </h4>
                        <ul className="space-y-4 text-sm">

                            <li className="flex gap-3">
                                <Phone className="h-5 w-5 text-red-500 shrink-0" />
                                <span>
                                    Emergency: <strong className="text-white">9239362736</strong><br />
                                    Helpline: +91 92393 62736
                                </span>
                            </li>

                            <li className="flex gap-3">
                                <Mail className="h-5 w-5 text-red-500 shrink-0" />
                                <span>info@healxista.com</span>
                            </li>

                            <li className="flex gap-3">
                                <MapPin className="h-5 w-5 text-red-500 shrink-0" />
                                <span>
                                    Healxista Emergency Services<br />
                                    North- Lake Road, Opposite,<br />
                                    Purulia MRI Raghavpur More,<br />
                                    Ward No 3 Municipality Purulia PS : Purulia 723101 India
                                </span>
                            </li>

                            <li className="flex gap-3">
                                <MapPin className="h-5 w-5 text-red-400 shrink-0" />
                                <span className="text-gray-400">
                                    Serving only:<br />
                                    📍 Kolkata | 📍 Purulia | 📍 Bokaro
                                </span>
                            </li>

                            <li className="flex gap-3">
                                <Clock className="h-5 w-5 text-red-500 shrink-0" />
                                <span>24×7 Emergency Operations</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row
                justify-between items-center gap-4 text-sm text-gray-500">

                    <p>
                        © 2026 Healxista Emergency Services | Purulia, India
                    </p>

                    <div className="flex flex-col items-center md:items-end gap-1.5">
                        <div className="flex gap-6">
                            <button onClick={() => setIsPrivacyOpen(true)} className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer">
                                Privacy Policy
                            </button>
                            <button onClick={() => setIsTermsOpen(true)} className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer">
                                Terms of Service
                            </button>
                            <button onClick={() => setIsSecurityOpen(true)} className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer">
                                Data Security
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-600 font-bold italic select-none">
                            * All images in this portal are illustrative
                        </p>
                    </div>
                </div>
            </div>

            <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
            <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
            <DataSecurityModal isOpen={isSecurityOpen} onClose={() => setIsSecurityOpen(false)} />
        </footer>
    );
};

export default Footer;
