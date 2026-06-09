import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import ComingSoonToast, { useComingSoonToast } from '@/components/ComingSoonToast';
import PageHero from '@/components/PageHero';
import VerifiedProvidersSection from '@/components/VerifiedProvidersSection';
import ProviderProfileModal from '@/components/ProviderProfileModal';
import {
    Home,
    HeartPulse,
    UserCheck,
    Stethoscope,
    Clock,
    Shield,
    CheckCircle2
} from 'lucide-react';

const homeCareTypes = [
    {
        icon: UserCheck,
        name: 'Elderly Care',
        subtitle: 'Compassionate assistance',
        price: '₹800/day',
        features: ['Daily Living Assistance', 'Medication Management', 'Companionship', 'Mobility Support'],
        color: 'blue',
    },
    {
        icon: Stethoscope,
        name: 'Nursing Care',
        subtitle: 'Professional medical care',
        price: '₹1,500/day',
        features: ['Injections & IV', 'Wound Dressing', 'Vitals Monitoring', 'Post-Surgical Care'],
        color: 'green',
    },
    {
        icon: HeartPulse,
        name: 'Patient Monitoring',
        subtitle: 'Critical care at home',
        price: '₹2,000/day',
        features: ['ICU Setup', 'Ventilator Support', '24/7 Monitoring', 'Doctor Visits'],
        color: 'red',
    },
    {
        icon: Home,
        name: 'Mother & Baby Care',
        subtitle: 'Post-natal support',
        price: '₹1,200/day',
        features: ['Newborn Care', 'Breastfeeding Support', 'Mother Recovery', 'Hygiene Care'],
        color: 'purple',
    },
];

const colorMap = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
};

export default function HomeCare() {
    const navigate = useNavigate();
    const { isOpen: toastOpen, showToast, hideToast } = useComingSoonToast();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profileProvider, setProfileProvider] = useState(null);

    return (
        <div className="min-h-screen bg-white">

            {/* HERO SECTION */}
            <PageHero
                bg="/assets/images/home_care.jpg"
                badge={{ icon: Home, text: 'Compassionate Care' }}
                title={<>Professional <span className="text-red-400">In-Home Care</span></>}
                subtitle="Hire dedicated nurses and professional healthcare caretakers who come directly to your home to provide personalized care for your loved ones."
                primaryBtn={{ label: 'Request Caregiver', onClick: () => navigate('/login/user') }}
            />

            {/* SERVICES */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12">Hire Professionals For Your Home</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {homeCareTypes.map((item, i) => {
                            const color = colorMap[item.color];
                            return (
                                <motion.div key={i} whileHover={{ y: -8 }} transition={{ duration: 0.3 }}>
                                    <Card className="h-full hover:shadow-2xl transition-all duration-300 border-none ring-1 ring-gray-100/60 overflow-hidden group">
                                        <CardContent className="p-0 flex flex-col h-full">
                                            <div className={`p-6 ${color.bg} flex items-center justify-between`}>
                                                <div className={`h-12 w-12 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm ${color.text} shadow-sm group-hover:scale-110 transition-transform`}>
                                                    <item.icon className="h-6 w-6" />
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-bold uppercase tracking-wider opacity-60 text-gray-800">Per Day</span>
                                                    <div className={`text-xl font-bold ${color.text} group-hover:scale-105 transition-transform origin-right`}>{item.price}</div>
                                                </div>
                                            </div>

                                            <div className="p-6 flex-1 flex flex-col space-y-4 bg-white">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-700 transition-colors">{item.name}</h3>
                                                    <p className="text-sm text-gray-500 font-medium">{item.subtitle}</p>
                                                </div>

                                                <div className="space-y-3 flex-1">
                                                    {item.features.map((f) => (
                                                        <div key={f} className="flex gap-3 text-sm text-gray-600 group-hover:translate-x-1 transition-transform duration-300">
                                                            <CheckCircle2 className={`h-5 w-5 ${color.text} shrink-0`} />
                                                            {f}
                                                        </div>
                                                    ))}
                                                </div>

                                                <Button
                                                    className={`w-full mt-4 bg-white border border-gray-200 text-gray-700 hover:${color.bg} hover:border-${item.color}-200 transition-all font-semibold shadow-sm`}
                                                    onClick={() => navigate('/login/user')}
                                                >
                                                    Book Now
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* VERIFIED CAREGIVERS */}
            <VerifiedProvidersSection
                title="Verified Home Nurses & Caretakers"
                subtitle="Book compassionate healthcare professionals to care for your loved ones in the comfort of your own home."
                apiEndpoint="/api/public/home-cares"
                ProviderIcon={Home}
                navigate={navigate}
                setProfileProvider={setProfileProvider}
                setIsProfileOpen={setIsProfileOpen}
            />

            {/* FAQ */}
            <section className="py-20 bg-red-50/50">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-3xl font-bold text-center mb-12">Common Questions</h2>
                    <div className="space-y-6">
                        {[
                            { q: 'Are your caregivers background verified?', a: 'Yes, all our staff undergo rigorous police verification, background checks, and medical screenings.' },
                            { q: 'Can I trial a caregiver for a few days?', a: 'Absolutely. We offer a 3-day trial period. If you are not satisfied, we will provide a free replacement.' },
                            { q: 'What if the caregiver takes a leave?', a: 'We guarantee strict attendance. In case of emergency leave, a replacement caregiver is provided immediately.' },
                        ].map((faq, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-red-100/50">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
                                <p className="text-gray-600">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* INFO */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8 text-center">
                    {[
                        { icon: UserCheck, title: 'Verified Staff', desc: 'Background checked professionals' },
                        { icon: Shield, title: 'Trained Nurses', desc: 'Certified and experienced' },
                        { icon: HeartPulse, title: '24/7 Support', desc: 'Always available for emergencies' },
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

            <ComingSoonToast isOpen={toastOpen} onClose={hideToast} />

            <ProviderProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                provider={profileProvider}
                onBookNow={() => navigate('/login/user')}
            />
        </div>
    );
}
