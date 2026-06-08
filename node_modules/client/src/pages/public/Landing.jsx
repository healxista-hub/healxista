import React from 'react';
import SEO from '@/components/SEO';
import Hero from '@/components/Hero';
import StatsBar from '@/components/StatsBar';
import ServiceTabs from '@/components/ServiceTabs';
import FleetPresence from '@/components/FleetPresence';
import Testimonials from '@/components/Testimonials';
import TrustedPartners from '@/components/TrustedPartners';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button'; 
import { useNavigate } from 'react-router-dom';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen text-foreground font-sans selection:bg-red-500/20">
            <SEO 
                title="Home" 
                description="Healxista provides emergency medical services including ambulance dispatch, doctor consultations, medicine delivery, and hospital integrations across Kolkata, Purulia & Bokaro." 
                keywords="emergency, ambulance, doctors, medicines, hospitals, telemedicine"
            />
            <main>
                <Hero />
                <StatsBar />
                <ServiceTabs />
                <FleetPresence />
                <Testimonials />
                <TrustedPartners />

                {/* New Call to Action Section */}
                <section className="relative py-20 overflow-hidden bg-gray-50">
                    <div className="absolute top-0 right-0 w-1/3 h-1/3 brand-bg-gradient opacity-10 blur-[120px] rounded-full" />
                    <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-600/10 opacity-10 blur-[120px] rounded-full" />
                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 brand-bg-gradient px-4 py-1 rounded-full text-white text-sm font-bold mb-6 shadow-xl"
                        >
                            <Heart className="h-4 w-4 fill-white" />
                            <span>Making a Difference</span>
                        </motion.div>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight">Ready to make a difference?</h2>
                        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-medium">
                            Whether you need help or want to join our mission to save lives, we are here for you.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Button
                                size="lg"
                                className="h-12 md:h-14 px-8 md:px-10 text-base md:text-lg font-black brand-bg-gradient shadow-2xl shadow-red-500/30 hover:scale-105 transition-transform"
                                onClick={() => navigate('/contact')}
                            >
                                Contact Us <ArrowRight className="ml-2 h-5 w-5 md:h-6 md:w-6" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-12 md:h-14 px-8 md:px-10 text-base md:text-lg font-bold border-blue-200 text-blue-700 hover:bg-blue-50 shadow-xl"
                                onClick={() => navigate('/services')}
                            >
                                <Phone className="mr-2 h-5 w-5 md:h-6 md:w-6" /> All Services
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

        </div>
    );
};

export default Landing;
