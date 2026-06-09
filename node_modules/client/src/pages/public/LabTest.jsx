import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SEO from '@/components/SEO';
import ProviderProfileModal from '@/components/ProviderProfileModal';
import PageHero from '@/components/PageHero';
import VerifiedProvidersSection from '@/components/VerifiedProvidersSection';
import {
    FlaskConical,
    Microscope,
    TestTube,
    Dna,
    ClipboardCheck,
    CheckCircle2,
    Clock,
    Shield,
    MapPin,
    Star,
    AlertCircle
} from 'lucide-react';

const labTestTypes = [
    {
        icon: FlaskConical,
        name: 'Full Body Checkup',
        subtitle: 'Complete Health Analysis',
        price: '₹999 – ₹2,500',
        features: ['80+ Parameters', 'Iron Profile', 'Liver & Kidney Function', 'Vitamin Screening'],
        color: 'blue',
    },
    {
        icon: TestTube,
        name: 'Blood Test',
        subtitle: 'Routine & specialized blood tests',
        price: '₹200 – ₹1,000',
        features: ['CBC', 'Diabetes Screen', 'Lipid Profile', 'Thyroid Profile'],
        color: 'green',
    },
    {
        icon: Dna,
        name: 'Genetic Testing',
        subtitle: 'Advanced DNA screening',
        price: '₹5,000+',
        features: ['Hereditary Analysis', 'Cancer Screening', 'Personalized Report'],
        color: 'purple',
    },
    {
        icon: Microscope,
        name: 'Specialized Tests',
        subtitle: 'Allergy, Hormone & More',
        price: '₹500+',
        features: ['Allergy Panel', 'Hormone Analysis', 'Infection Screen'],
        color: 'red',
    },
];

const colorMap = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
};

export default function LabTest() {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profileProvider, setProfileProvider] = useState(null);

    return (
        <div className="min-h-screen bg-white">
            <SEO
                title="Lab Tests at Home — Healxista"
                description="Book accurate diagnostic tests at home with free sample collection. Only NABL-accredited, admin-verified labs are listed on our platform."
                keywords="lab test, blood test, home sample collection, NABL lab, diagnostic test, full body checkup"
            />

            {/* HERO SECTION */}
            <PageHero
                bg="/assets/images/lab_test.jpg"
                badge={{ icon: FlaskConical, text: 'Accurate Diagnostics' }}
                title={<>Pathology Tests at <span className="text-blue-400">Home</span></>}
                subtitle="Get accurate diagnostic tests done from the comfort of your home. We partner only with admin-verified, NABL-accredited labs."
                primaryBtn={{ label: 'Book a Test Now', onClick: () => navigate('/login/user') }}
                secondaryBtn={{ label: 'Register Your Lab', onClick: () => navigate('/provider-portal') }}
            />


            {/* TEST CATEGORIES */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-4">Common Pathology Tests</h2>
                    <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
                        All test categories are offered by our verified lab network. Prices may vary by provider.
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {labTestTypes.map((item, i) => {
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
                                                    <span className="text-xs font-bold uppercase tracking-wider opacity-60 text-gray-800">Starting at</span>
                                                    <div className={`text-xl font-bold ${color.text} group-hover:scale-105 transition-transform origin-right`}>{item.price}</div>
                                                </div>
                                            </div>

                                            <div className="p-6 flex-1 flex flex-col space-y-4 bg-white">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{item.name}</h3>
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
                                                    className={`w-full mt-4 bg-white border border-gray-200 text-gray-700 hover:${color.bg} transition-all font-semibold shadow-sm`}
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

            {/* HOW IT WORKS */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
                    <div className="grid md:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-1 bg-gray-200 -z-10" />

                        {[
                            { step: '01', title: 'Book Test', desc: 'Select test & schedule a time' },
                            { step: '02', title: 'Sample Collection', desc: 'Phlebotomist visits your home' },
                            { step: '03', title: 'Lab Processing', desc: 'Sample tested in NABL labs' },
                            { step: '04', title: 'Get Report', desc: 'Digital report within 24 hours' },
                        ].map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.2 }}
                                viewport={{ once: true }}
                                className="text-center bg-white"
                            >
                                <div className="w-24 h-24 mx-auto bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 ring-8 ring-white">
                                    {s.step}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                                <p className="text-gray-600 px-4">{s.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* VERIFIED LABS */}
            <VerifiedProvidersSection
                title="Our Verified NABL Labs"
                subtitle="High-quality diagnostics right at your doorstep."
                apiEndpoint="/api/public/lab-tests"
                ProviderIcon={Microscope}
                navigate={navigate}
                setProfileProvider={setProfileProvider}
                setIsProfileOpen={setIsProfileOpen}
            />

            {/* WHY ONLY VERIFIED LABS */}
            <section className="py-16 bg-blue-900 text-white">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Why We Only List Verified Labs
                            </h2>
                            <p className="text-white/80 mb-6 text-lg">
                                Your health data is critical. We only partner with labs that pass our strict verification process — ensuring accuracy, safety, and compliance.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Admin-reviewed license & accreditation',
                                    'NABL / CAP certified for accuracy',
                                    'Regular quality audits',
                                    'Transparent pricing & digital reports',
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
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { icon: Shield, label: 'Admin Verified', value: '100%' },
                                { icon: Clock, label: 'Report Time', value: '24 hrs' },
                                { icon: Star, label: 'Avg Rating', value: '4.8 ★' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white/10 rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition"
                                >
                                    <stat.icon className="h-8 w-8 mx-auto mb-3 text-blue-300" />
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <div className="text-xs text-white/70 mt-1">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 bg-blue-50/50">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        {[
                            { q: 'Is the sample collection free?', a: 'Yes, home sample collection is effectively free for orders above ₹500.' },
                            { q: 'Are the labs certified?', a: 'Absolutely. We partner only with NABL and CAP accredited laboratories — and every lab is verified by our admin team before listing.' },
                            { q: 'How soon will I get my report?', a: 'Most routine test reports are delivered via email/WhatsApp within 24 hours of sample collection.' },
                            { q: 'Do I need to fast before the test?', a: 'It depends on the test. For Full Body Checkup or Lipid Profile, 10-12 hours fasting is recommended. Our team will guide you upon booking.' },
                            { q: 'How do I know a lab is verified?', a: 'All labs shown after you log in have been individually reviewed and approved by our admin team. You will see a verified badge on each card.' },
                        ].map((faq, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
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
                        { icon: Clock, title: 'Fast Reports', desc: 'Online reports within 24 hours' },
                        { icon: Shield, title: 'Certified & Verified Labs', desc: 'NABL accredited + admin-approved' },
                        { icon: FlaskConical, title: 'Hygienic Collection', desc: 'Safe & sterile sample collection' },
                    ].map((x, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <x.icon className="h-8 w-8" />
                            </div>
                            <h3 className="mt-4 text-xl font-bold">{x.title}</h3>
                            <p className="text-gray-600 mt-2">{x.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>
            <ProviderProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                provider={profileProvider}
                onBookNow={() => navigate('/login/user')}
            />
        </div>
    );
}
