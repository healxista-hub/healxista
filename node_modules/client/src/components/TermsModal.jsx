import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './ui/button';

const TermsModal = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 sm:px-0">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                    >
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">Terms & Conditions</h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-gray-600 leading-relaxed">
                            <section>
                                <h3 className="text-base font-bold text-gray-900 mb-2">1. Introduction</h3>
                                <p>Welcome to Healxista Emergency Services. By registering an account on our platform, you agree to be bound by these Terms and Conditions. Please read them carefully.</p>
                            </section>

                            <section>
                                <h3 className="text-base font-bold text-gray-900 mb-2">2. Service Usage</h3>
                                <p>Healxista acts as a real-time healthcare coordination bridge. Users agree to utilize emergency features (like Ambulance Booking and Urgent Care) truthfully. False emergency alerts may lead to immediate account suspension and potential legal action.</p>
                            </section>

                            <section>
                                <h3 className="text-base font-bold text-gray-900 mb-2">3. Provider Responsibilities (Doctors, Drivers, Facilities)</h3>
                                <p>All registered service providers must possess valid local and national operational licenses. Healxista reserves the right to unverify, suspend, or terminate provider accounts that fail to meet medical or behavioral compliance standards.</p>
                            </section>

                            <section>
                                <h3 className="text-base font-bold text-gray-900 mb-2">4. Data Privacy</h3>
                                <p>We collect essential health and location data to facilitate urgent medical care. This data is strictly covered under our Privacy Policy and is explicitly not sold to third parties for marketing purposes.</p>
                            </section>

                            <section>
                                <h3 className="text-base font-bold text-gray-900 mb-2">5. Limitation of Liability</h3>
                                <p>While Healxista strives to maintain 100% uptime, we are not directly liable for delays caused by external network disruptions, traffic congestion (for ambulances), or individual provider unavailability during catastrophic events.</p>
                            </section>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-white">
                            <Button onClick={onClose} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12">
                                I Understand
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TermsModal;
