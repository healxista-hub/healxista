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
    Activity,
    Accessibility,
    Dumbbell,
    HeartPulse,
    Shield,
    Clock,
    CheckCircle2
} from 'lucide-react';

const physioTypes = [
    {
        icon: Activity,
        name: 'Post-Surgery Rehab',
        subtitle: 'Recovery after surgery',
        price: '₹800/session',
        features: ['Joint Mobilization', 'Strength Training', 'Pain Management', 'Faster Recovery'],
        color: 'blue',
    },
    {
        icon: Accessibility,
        name: 'Neuro Physiotherapy',
        subtitle: 'Paralysis & Stroke care',
        price: '₹1,000/session',
        features: ['Motor Control', 'Balance Training', 'Muscle Stimulation', 'Home Exercises'],
        color: 'green',
    },
    {
        icon: Dumbbell,
        name: 'Sports Injury',
        subtitle: 'Muscle & Ligament care',
        price: '₹900/session',
        features: ['Pain Relief', 'Targeted Massage', 'Kinesio Taping', 'Injury Prevention'],
        color: 'red',
    },
    {
        icon: HeartPulse,
        name: 'Geriatric Physio',
        subtitle: 'For Elderly Patients',
        price: '₹700/session',
        features: ['Mobility Improvement', 'Fall Prevention', 'Gentle Exercises', 'Arthritis Care'],
        color: 'purple',
    },
];

const colorMap = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
};

export default function Physiotherapy() {
    const navigate = useNavigate();
    const { isOpen: toastOpen, showToast, hideToast } = useComingSoonToast();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profileProvider, setProfileProvider] = useState(null);

    return (
        <div className="min-h-screen bg-white">

            {/* HERO SECTION */}
            <PageHero
                bg="/assets/images/physiotherapy.jpg"
                badge={{ icon: Activity, text: 'Expert Rehabilitation' }}
                title={<>Physiotherapy at <span className="text-green-400">Home</span></>}
                subtitle="Personalized physiotherapy sessions by certified experts for faster recovery and pain relief."
                primaryBtn={{ label: 'Book a Session', onClick: () => navigate('/login/user') }}
            />

            {/* SERVICES */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Treatments Available</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {physioTypes.map((item, i) => {
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
                                                    <span className="text-xs font-bold uppercase tracking-wider opacity-60 text-gray-800">Per Session</span>
                                                    <div className={`text-xl font-bold ${color.text} group-hover:scale-105 transition-transform origin-right`}>{item.price}</div>
                                                </div>
                                            </div>

                                            <div className="p-6 flex-1 flex flex-col space-y-4 bg-white">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">{item.name}</h3>
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

            {/* VERIFIED PHYSIOTHERAPISTS */}
            <VerifiedProvidersSection
                title="Our Verified Physiotherapists"
                subtitle="Book experienced professionals for home visits."
                apiEndpoint="/api/public/physiotherapy"
                ProviderIcon={Activity}
                navigate={navigate}
                setProfileProvider={setProfileProvider}
                setIsProfileOpen={setIsProfileOpen}
            />

            {/* CONDITIONS WE TREAT */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Conditions We Treat</h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        {[
                            'Back & Neck Pain', 'Stroke Rehabilitation', 'Sports Injuries', 'Frozen Shoulder',
                            'Knee Replacement Recovery', 'Cerebral Palsy', 'Parkinson’s Disease', 'Arthritis',
                            'Post-Fracture stiffness', 'Sciatica', 'Slip Disc', 'Cervical Spondylosis'
                        ].map((c, i) => (
                            <div key={i} className="bg-green-50 text-green-800 px-6 py-3 rounded-full font-medium border border-green-100 hover:bg-green-100 transition cursor-default">
                                {c}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 bg-green-50/50">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        {[
                            { q: 'How long is each physiotherapy session?', a: 'A typical session lasts between 45 to 60 minutes, depending on the treatment plan.' },
                            { q: 'Do I need a doctor referral?', a: 'It is recommended but not mandatory for initial assessment. Our physios are qualified to diagnose physical conditions.' },
                            { q: 'Is home physiotherapy effective?', a: 'Yes, home physiotherapy allows for personalized 1-on-1 attention in a comfortable environment, which can often speed up recovery.' },
                            { q: 'What equipment do you bring?', a: 'Our physios carry portable equipment like TENS machines, ultrasound, resistance bands, and weights as required.' },
                        ].map((faq, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-green-100/50">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
                                <p className="text-gray-600">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* WHY US */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8 text-center">
                    {[
                        { icon: Shield, title: 'Certified Experts', desc: 'Qualified physiotherapists' },
                        { icon: Activity, title: 'Personalized Plans', desc: 'Tailored recovery programs' },
                        { icon: Clock, title: 'Flexible Timing', desc: 'Schedule at your convenience' },
                    ].map((x, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 text-green-600">
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
