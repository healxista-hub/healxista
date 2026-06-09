import React, { useState, useEffect } from 'react';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import ProviderProfileModal from '@/components/ProviderProfileModal';
import ComingSoonToast, { useComingSoonToast } from '@/components/ComingSoonToast';
import PageHero from '@/components/PageHero';
import VerifiedProvidersSection from '@/components/VerifiedProvidersSection';
import {
    Stethoscope,
    Heart,
    Brain,
    Baby,
    Eye,
    Bone,
    Video,
    Phone,
    MessageSquare,
    Clock,
    Shield,
    Star
} from 'lucide-react';

// Sample specialties
const specialties = [
    { icon: Heart, name: 'Cardiologist', available: 24 },
    { icon: Brain, name: 'Neurologist', available: 18 },
    { icon: Baby, name: 'Pediatrician', available: 32 },
    { icon: Eye, name: 'Ophthalmologist', available: 15 },
    { icon: Bone, name: 'Orthopedic', available: 21 },
    { icon: Stethoscope, name: 'General Physician', available: 45 },
];

// Internal Doctors code

const Doctors = () => {
    const navigate = useNavigate();
    const { isOpen: toastOpen, hideToast } = useComingSoonToast();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profileProvider, setProfileProvider] = useState(null);

    return (
        <div className="min-h-screen bg-white">
            <SEO
                title="Verified Doctors on Healxista"
                description="Consult admin-verified expert doctors online via video, audio, or chat. 24/7 access to verified specialists including cardiologists, neurologists, and pediatricians."
                keywords="verified doctors, telemedicine, online consultation, cardiologist, pediatrician, physician"
            />

            {/* HERO */}
            <PageHero
                bg="/assets/images/hero/doctor.jpg"
                badge={{ icon: Stethoscope, text: '24/7 Expert Medical Guidance' }}
                title={<>Talk to Our <span className="text-yellow-300">Verified Doctors</span></>}
                subtitle="Get instant medical consultation from certified doctors. Video, audio, or chat — your choice."
                primaryBtn={{ icon: Video, label: 'Video Consult', onClick: () => navigate('/login/user') }}
                secondaryBtn={{ icon: Phone, label: 'Audio Call', onClick: () => navigate('/login/user') }}
            />

            {/* SPECIALTIES */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Medical Specialties</h2>
                        <p className="text-gray-600">Connect with verified specialists across various fields</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {specialties.map((spec, i) => (
                            <motion.div
                                key={spec.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                viewport={{ once: true }}
                                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center"
                            >
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white mb-3 transition-transform hover:scale-110">
                                    <spec.icon className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-sm mb-1">{spec.name}</h3>
                                <p className="text-xs text-gray-500 text-center px-2">Expert Consultation</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">How It Works</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {[
                            { step: '1', title: 'Select Specialty', desc: 'Choose your doctor based on specialty or symptom' },
                            { step: '2', title: 'Book Consultation', desc: 'Pick a time slot or consult instantly' },
                            { step: '3', title: 'Get Treatment', desc: 'Receive prescription & follow-up care' },
                        ].map((item) => (
                            <div key={item.step} className="text-center">
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white text-2xl font-bold mb-4">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* VERIFIED DOCTORS — real data from backend (only is_verified=true) */}
            <VerifiedProvidersSection
                apiEndpoint="/api/public/doctors"
                ProviderIcon={Stethoscope}
                navigate={navigate}
                setProfileProvider={setProfileProvider}
                setIsProfileOpen={setIsProfileOpen}
            />

            {/* FEATURES */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Clock, title: '24/7 Availability', desc: 'Doctors available round the clock' },
                            { icon: Shield, title: 'Verified Doctors', desc: 'All doctors are admin-verified & board-certified' },
                            { icon: MessageSquare, title: 'Multi-mode Consultations', desc: 'Video, audio, or chat options' },
                        ].map((item, i) => (
                            <div key={i} className="text-center p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow">
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white mb-4">
                                    <item.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <ComingSoonToast isOpen={toastOpen} onClose={hideToast} />

            <ProviderProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                provider={profileProvider}
                onBookNow={() => navigate('/login/user')}
            />
        </div>
    );
};

export default Doctors;
