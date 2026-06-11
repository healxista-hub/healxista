import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Eye, Database, Share2, Key, Info } from 'lucide-react';
import { Button } from './ui/button';

const PrivacyModal = ({ isOpen, onClose }) => {
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
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-red-600 animate-pulse" />
                                <h2 className="text-xl font-bold text-gray-900">Patient Privacy Policy</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-gray-600 leading-relaxed text-left">
                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest bg-red-50 px-2.5 py-1 rounded-full">DPDP Compliant Registry</span>

                            <section className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-900 font-bold">
                                    <Database className="h-4 w-4 text-blue-600" />
                                    <h3>1. Information Collected</h3>
                                </div>
                                <p>We gather emergency metrics necessary for ambulance dispatch, including live GPS coordinates, contact names, patient age lists, medical descriptions, and payment transaction IDs.</p>
                            </section>

                            <section className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-900 font-bold">
                                    <Eye className="h-4 w-4 text-purple-600" />
                                    <h3>2. Coordinate Tracking Protection</h3>
                                </div>
                                <p>Real-time coordinates tracked during emergency SOS routing are encrypted during transit using SSL. Once the ambulance arrives safely at the destination center (Kolkata, Purulia, or Bokaro), live GPS sharing is automatically terminated.</p>
                            </section>

                            <section className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-900 font-bold">
                                    <Share2 className="h-4 w-4 text-green-600" />
                                    <h3>3. Zero Third-Party Sharing</h3>
                                </div>
                                <p>Healxista operates under strict health data frameworks. We never trade, license, or sell patient medical profiles or telemetry metrics to external pharmaceutical or advertising brokers.</p>
                            </section>



                            <div className="bg-slate-50 p-4 rounded-xl flex gap-3">
                                <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-gray-500">
                                    Our protocols comply with the Digital Personal Data Protection (DPDP) Act of India. For privacy concerns, please contact our Data Protection Officer at <a href="mailto:info@healxista.com" className="text-blue-600 font-bold">info@healxista.com</a> or <a href="mailto:healxista@gmail.com" className="text-blue-600 font-bold">healxista@gmail.com</a>.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-white">
                            <Button onClick={onClose} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-xl">
                                I Consent
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PrivacyModal;
