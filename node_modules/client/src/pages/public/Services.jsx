import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import ComingSoonToast, { useComingSoonToast } from '@/components/ComingSoonToast';
import {
    Ambulance,
    Plane,
    Train,
    Stethoscope,
    ShieldCheck,
    ArrowRight,
    Clock,
    Users,
    HeartPulse,
    FlaskConical,
    Activity,
    Home,

} from 'lucide-react';
import { motion } from 'framer-motion';
import PageHero from '@/components/PageHero';

const heroImages = [
    '/assets/images/hero/road.jpg',
    '/assets/images/hero/air.webp',
    '/assets/images/hero/train.jpg',
    '/assets/images/hero/doctor.jpg',
];

const ServiceCard = ({ icon: Icon, title, desc, features, image, accent = 'blue', onBookNow, onLearnMore, availableSoon = false }) => {
    const accentMap = {
        blue: 'from-blue-600 to-blue-700',
        red: 'from-red-600 to-red-700',
        green: 'from-green-600 to-green-700',
        purple: 'from-purple-600 to-purple-700',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row group"
        >
            {/* Image */}
            <div className="md:w-2/5 relative overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent md:hidden" />

                {/* Available Soon badge */}
                {availableSoon && (
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        Available Soon
                    </div>
                )}

                {/* Mobile overlay title */}
                <div className="absolute bottom-4 left-4 right-4 text-white md:hidden">
                    <div className="flex items-center gap-3">
                        <Icon className="h-8 w-8 text-red-400" />
                        <h3 className="text-xl font-bold">{title}</h3>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-8 md:p-12 md:w-3/5 flex flex-col justify-between backdrop-blur-md bg-white/30 border border-white/30 rounded-3xl">
                <div>
                    {/* Desktop header */}
                    <div className="hidden md:flex items-center gap-4 mb-5">
                        <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                            <Icon className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-extrabold text-gray-900">{title}</h3>
                    </div>

                    <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-8">{desc}</p>

                    {/* Features */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                        {features.map((feat, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 text-sm font-semibold text-gray-700 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100"
                            >
                                <ShieldCheck className="h-5 w-5 text-green-600" />
                                {feat}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-4 pt-6">
                    <Button
                        className={`w-full sm:flex-1 h-12 md:h-14 bg-gradient-to-r ${accentMap[accent]} hover:opacity-90 text-white font-black text-base md:text-lg rounded-2xl shadow-xl shadow-${accent}-500/20 transition-all hover:scale-[1.02] active:scale-95`}
                        onClick={onBookNow}
                    >
                        Book Now <ArrowRight className="ml-2 h-5 w-5 md:h-6 md:w-6" />
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full sm:flex-1 h-12 md:h-14 border-[2px] border-gray-200 text-gray-800 font-bold text-base md:text-lg rounded-2xl hover:bg-gray-50 transition-all active:scale-95 bg-white shadow-sm"
                        onClick={onLearnMore}
                    >
                        Learn More
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

const Services = () => {
    const [bgIndex, setBgIndex] = useState(0);
    const { isOpen: toastOpen, showToast, hideToast } = useComingSoonToast();
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000); // auto-scroll every 5 sec
        return () => clearInterval(interval);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <SEO 
                title="Our Services" 
                description="Explore Healxista's wide range of emergency healthcare services: road ambulance, air ambulance, doctors on call, lab tests, and home care — serving Kolkata, Purulia & Bokaro."
                keywords="services, ambulance services, doctors on call, home care, lab tests, physiotherapy, Kolkata, Purulia, Bokaro"
            />
            {/* Hero */}
            <PageHero
                bg={heroImages[bgIndex]}
                badge={{ icon: HeartPulse, text: '24×7 Emergency Services' }}
                title={<>Emergency <span className="text-yellow-300">Healthcare</span> Services</>}
                subtitle="Comprehensive medical transport and home healthcare solutions, available 24/7."
                primaryBtn={{ label: '⚡ Quick Book', onClick: () => navigate('/login/user') }}
                secondaryBtn={{ label: 'Explore Services', onClick: () => scrollToSection('services-list') }}
            />

            {/* Services */}
            <section id="services-list" className="container mx-auto px-4 py-24 space-y-16 max-w-6xl">
                <ServiceCard
                    icon={Ambulance}
                    title="Road Ambulance"
                    desc="ALS and BLS ambulances equipped with ICU-grade medical equipment, trained paramedics, and real-time GPS tracking for fastest response."
                    features={['ICU Setup', 'Ventilator Support', 'Expert Paramedics', 'Live GPS Tracking']}
                    image="/assets/images/hero/road.jpg"
                    accent="red"
                    onBookNow={() => navigate('/login/user')}
                    onLearnMore={() => navigate('/ambulance')}
                />

                <ServiceCard
                    icon={Plane}
                    title="Air Ambulance"
                    desc="Critical long-distance and international patient transfers with flying ICU, specialist doctors, and seamless airport-to-hospital coordination."
                    features={['Bed-to-Bed Transfer', 'Flight Doctor', 'Advanced ICU', 'Pan-India & Global']}
                    image="/assets/images/hero/air.webp"
                    accent="blue"
                    availableSoon={true}
                    onBookNow={() => navigate('/login/user')}
                    onLearnMore={() => navigate('/ambulance')}
                />

                <ServiceCard
                    icon={Train}
                    title="Train Ambulance"
                    desc="A reliable and affordable solution for stable long-distance transfers using converted AC coaches equipped as mobile medical units."
                    features={['Cost Effective', 'Medical Escort', 'Oxygen Support', 'Coordinated Travel']}
                    image="/assets/images/hero/train.jpg"
                    accent="green"
                    availableSoon={true}
                    onBookNow={() => navigate('/login/user')}
                    onLearnMore={() => navigate('/ambulance')}
                />

                <ServiceCard
                    icon={Stethoscope}
                    title="Doctor on Call"
                    desc="Get experienced doctors at your doorstep for non-emergency consultations, follow-ups, elderly care, and routine health checks."
                    features={['Home Visits', 'Online & Offline', 'Instant Prescription', 'Elderly Care']}
                    image="/assets/images/hero/doctor.jpg"
                    accent="purple"
                    onBookNow={() => navigate('/login/user')}
                    onLearnMore={() => navigate('/doctors')}
                />

                <ServiceCard
                    icon={FlaskConical}
                    title="Pathology Test"
                    desc="Accurate and timely diagnostic tests from comfort of your home. We collect samples and provide online reports."
                    features={['Home Collection', 'Online Reports', 'Certified Labs', 'Fast Results']}
                    image="/assets/images/lab_test.jpg"
                    accent="blue"
                    onBookNow={() => navigate('/login/user')}
                    onLearnMore={() => navigate('/lab-test')}
                />

                <ServiceCard
                    icon={Home}
                    title="Home Care Services"
                    desc="Compassionate care for your loved ones at home. Trained nurses and caregivers for post-op and elderly care."
                    features={['Trained Nurses', 'Elderly Care', 'Post-Op Care', 'Vitals Monitoring']}
                    image="/assets/images/home_care.jpg"
                    accent="red"
                    onBookNow={() => navigate('/login/user')}
                    onLearnMore={() => navigate('/home-care')}
                />

                <ServiceCard
                    icon={Activity}
                    title="Home Based Physiotherapy"
                    desc="Expert physiotherapy sessions at home for rehabilitation, pain relief, and mobility improvement."
                    features={['Expert Physiotherapists', 'Rehabilitation', 'Pain Relief', 'Personalized Plans']}
                    image="/assets/images/physiotherapy.jpg"
                    accent="green"
                    onBookNow={() => navigate('/login/user')}
                    onLearnMore={() => navigate('/physiotherapy')}
                />
            </section>

            {/* How It Works */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-12">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: HeartPulse, title: 'Request Service', desc: 'Choose a service and enter details.' },
                            { icon: Clock, title: 'Get Confirmation', desc: 'Receive instant confirmation and provider details.' },
                            { icon: Users, title: 'Service Delivery', desc: 'Professional care delivered at your doorstep.' },
                        ].map((step, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 text-red-600 mb-4 shadow-sm">
                                    <step.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold">{step.title}</h3>
                                <p className="text-gray-600 mt-2">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-12">Why Choose Us</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Clock, title: 'Fast Response', desc: 'Real-time tracking & quick dispatch' },
                            { icon: ShieldCheck, title: 'Certified Staff', desc: 'Verified professionals & accredited labs' },
                            { icon: HeartPulse, title: '24×7 Availability', desc: 'Round-the-clock emergency support' },
                        ].map((item, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 text-red-600 mb-4 shadow-sm">
                                    <item.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold">{item.title}</h3>
                                <p className="text-gray-600 mt-2">{item.desc}</p>
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

        </div>
    );
};

export default Services;
