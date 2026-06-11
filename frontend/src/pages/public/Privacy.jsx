import React from 'react';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';
import PageHero from '@/components/PageHero';
import { Shield, Eye, Database, Share2, Key, Info } from 'lucide-react';

const Privacy = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <SEO
                title="Privacy Policy"
                description="Privacy Policy of Healxista Emergency Services. Learn how we handle your health information and personal telemetry data."
                keywords="privacy policy, data security, healthcare, patient privacy, encryption"
            />

            {/* Hero Banner */}
            <PageHero
                bg="/assets/images/hero/road.jpg"
                badge={{ icon: Shield, text: 'Data Protection' }}
                title={<>Privacy <span className="text-yellow-300">Policy</span></>}
                subtitle="We maintain strict medical privacy standards to secure patient data, coordinates, and health summaries."
            />

            {/* Privacy Content */}
            <section className="py-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 sm:p-14 rounded-3xl shadow-xl border border-slate-100 space-y-12 text-left"
                    >
                        <div>
                            <span className="text-xs font-bold text-red-600 uppercase tracking-widest bg-red-50 px-3.5 py-1.5 rounded-full">Active Registry: 2026</span>
                            <h2 className="text-3xl font-extrabold text-slate-900 mt-4 mb-2">Patient Privacy Policy</h2>
                            <p className="text-gray-500 text-sm">How Healxista logs, shields, and integrates clinical medical records.</p>
                        </div>

                        <div className="w-full h-px bg-slate-100" />

                        {/* Section 1 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">
                                    <Database className="h-5 w-5" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900">1. Information We Collect</h3>
                            </div>
                            <p className="text-gray-600 leading-relaxed pl-13">
                                We gather emergency metrics necessary for ambulance dispatch, including live GPS coordinates, contact names, patient age lists, medical emergency descriptions, and payment transaction IDs. Clinic users also supply electronic health records (EHR) and prescriptions under their consent.
                            </p>
                        </div>

                        {/* Section 2 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold shrink-0">
                                    <Eye className="h-5 w-5" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900">2. How We Protect Your Coordinates</h3>
                            </div>
                            <p className="text-gray-600 leading-relaxed pl-13">
                                Real-time coordinates tracked during emergency SOS routing are encrypted during transit using Secure Socket Layers (SSL). Once the ambulance arrives safely at the destination center (Kolkata, Purulia, or Bokaro), live GPS sharing is automatically terminated.
                            </p>
                        </div>

                        {/* Section 3 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 font-bold shrink-0">
                                    <Share2 className="h-5 w-5" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900">3. Data Sharing Restrictions</h3>
                            </div>
                            <p className="text-gray-600 leading-relaxed pl-13">
                                Healxista operates under strict health data frameworks. We never trade, license, or sell patient medical profiles or telemetry metrics to external pharmaceutical or advertising brokers. Your records are only shared with your assigned emergency doctors and clinical lab diagnostic coordinators.
                            </p>
                        </div>



                        <div className="w-full h-px bg-slate-100" />

                        <div className="bg-slate-50 p-6 rounded-2xl flex gap-4 text-left">
                            <Info className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-extrabold text-slate-900">Information Privacy Governance</p>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    Our protocols comply with the Digital Personal Data Protection (DPDP) Act of India. For privacy concerns or data erasure requests, please contact our Data Protection Officer at: <a href="mailto:info@healxista.com" className="text-blue-600 font-bold">info@healxista.com</a> or <a href="mailto:healxista@gmail.com" className="text-blue-600 font-bold">healxista@gmail.com</a>.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Privacy;
