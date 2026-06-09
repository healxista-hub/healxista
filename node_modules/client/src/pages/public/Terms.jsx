import React from 'react';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';
import PageHero from '@/components/PageHero';
import { FileText, ShieldAlert, Users, Scale, AlertTriangle, CheckCircle2 } from 'lucide-react';

const Terms = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <SEO
                title="Terms of Service"
                description="Terms and Conditions of Healxista Emergency Services. Understand your rights and responsibilities when using our platform."
                keywords="terms of service, legal, rules, compliance, emergency services"
            />

            {/* Hero Banner */}
            <PageHero
                bg="/assets/images/hero/road.jpg"
                badge={{ icon: FileText, text: 'Legal Compliance' }}
                title={<>Terms & <span className="text-yellow-300">Conditions</span></>}
                subtitle="Please read our terms of service carefully before accessing our diagnostic and emergency dispatch networks."
            />

            {/* Legal Content */}
            <section className="py-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 sm:p-14 rounded-3xl shadow-xl border border-slate-100 space-y-12 text-left"
                    >
                        <div>
                            <span className="text-xs font-bold text-red-600 uppercase tracking-widest bg-red-50 px-3.5 py-1.5 rounded-full">Last Updated: April 2026</span>
                            <h2 className="text-3xl font-extrabold text-slate-900 mt-4 mb-2">Terms of Service Agreement</h2>
                            <p className="text-gray-500 text-sm">Agreement governing the use of Healxista real-time health telemetry and ambulance dispatch platforms.</p>
                        </div>

                        <div className="w-full h-px bg-slate-100" />

                        {/* Section 1 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">
                                    <Scale className="h-5 w-5" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900">1. Acceptance of Terms</h3>
                            </div>
                            <p className="text-gray-600 leading-relaxed pl-13">
                                By registering, booking, or accessing any service provided by Healxista (including mobile ambulance dispatch, clinic consultations, post-operative physiotherapy, and lab tests), you acknowledge that you have read, understood, and agreed to be legally bound by these terms. If you do not agree, please discontinue use immediately.
                            </p>
                        </div>

                        {/* Section 2 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 font-bold shrink-0">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900">2. Truthful & Non-Malicious Booking</h3>
                            </div>
                            <p className="text-gray-600 leading-relaxed pl-13">
                                Healxista provides active critical emergency routing. False bookings, dummy alerts, or intentional delays targeting ambulance fleets in Kolkata, Purulia, or Bokaro are strictly prohibited. The platform reserves the right to suspend accounts immediately and supply coordinates to regional cybercrime departments for public hazard prosecution.
                            </p>
                        </div>

                        {/* Section 3 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 font-bold shrink-0">
                                    <Users className="h-5 w-5" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900">3. Provider Standards</h3>
                            </div>
                            <p className="text-gray-600 leading-relaxed pl-13">
                                Healthcare providers (including clinics, diagnostic laboratories, physical therapists, and emergency driver partners) must maintain active state clinical license registrations. Any failure to present valid updates on standard medical compliance leads to immediate platform decoupling.
                            </p>
                        </div>

                        {/* Section 4 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 font-bold shrink-0">
                                    <ShieldAlert className="h-5 w-5" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900">4. Payment Coordination</h3>
                            </div>
                            <p className="text-gray-600 leading-relaxed pl-13">
                                Users explicitly agree to complete manual diagnostic and medical payment validations through designated scan-and-pay structures. Payment receipts are verified by platform administrators. Booking features are unlocked only upon administrative confirmation of received charges.
                            </p>
                        </div>

                        {/* Section 5 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold shrink-0">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900">5. Limitation of Medical Liability</h3>
                            </div>
                            <p className="text-gray-600 leading-relaxed pl-13">
                                Healxista facilitates pre-hospital stabilization dispatch and remote tele-consultations. While our ambulance ICU equipment and paramedic standards follow governing board parameters, Healxista is not direct liability for conditions resulting from unpredictable natural disasters, road blockades, or clinical handovers at secondary specialty hospitals.
                            </p>
                        </div>

                        <div className="w-full h-px bg-slate-100" />

                        <div className="bg-slate-50 p-6 rounded-2xl text-center space-y-2">
                            <p className="text-sm font-extrabold text-slate-900">Have Questions About Compliance?</p>
                            <p className="text-xs text-gray-500">Contact our legal team at: <a href="mailto:legal@healxista.com" className="text-blue-600 font-bold">legal@healxista.com</a> or visit our Purulia Operations HQ.</p>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Terms;
