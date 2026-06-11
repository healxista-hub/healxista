import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Server, AlertOctagon, HeartHandshake, EyeOff, Terminal } from 'lucide-react';
import { Button } from './ui/button';

const DataSecurityModal = ({ isOpen, onClose }) => {
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
                                <ShieldCheck className="h-5 w-5 text-blue-600 animate-pulse" />
                                <h2 className="text-xl font-bold text-gray-900">Data Security Standards</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-gray-600 leading-relaxed text-left">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full">Encrypted Telemetry Architecture</span>

                            <section className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-900 font-bold">
                                    <Server className="h-4 w-4 text-slate-700" />
                                    <h3>1. Secure Telemetry Infrastructure</h3>
                                </div>
                                <p>All dynamic communication (WebSockets data streams, ambulance location telemetry, and patient booking actions) are protected using industry-leading AES-256 military-grade encryption standards.</p>
                            </section>

                            <section className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-900 font-bold">
                                    <EyeOff className="h-4 w-4 text-purple-600" />
                                    <h3>2. Strictly Controlled Access</h3>
                                </div>
                                <p>Personal mobile numbers and medical diagnostic records are redacted from intermediate operators. Information is strictly restricted to assigned emergency medical driver teams and certified clinical specialists.</p>
                            </section>

                            <section className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-900 font-bold">
                                    <Terminal className="h-4 w-4 text-green-600" />
                                    <h3>3. Real-time Audit Logging</h3>
                                </div>
                                <p>Every administrative intervention, driver profile update, and patient billing verification triggers automated, immutable audit logs to secure systemic integrity against identity spoofing.</p>
                            </section>

                            <section className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-900 font-bold">
                                    <AlertOctagon className="h-4 w-4 text-red-600" />
                                    <h3>4. Vulnerability Mitigation</h3>
                                </div>
                                <p>Our servers undergo routine security reviews and penetrative checks, shielding medical diagnostics repositories and clinical registrations databases from unauthorized external threats.</p>
                            </section>

                            <div className="bg-blue-50/50 p-4 rounded-xl flex gap-3 border border-blue-100">
                                <HeartHandshake className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700 font-medium">
                                    Our operational security meets certified global health standards. For critical security reports or infrastructure queries, reach our Purulia systems compliance office at <a href="mailto:info@healxista.com" className="text-blue-700 font-bold underline">info@healxista.com</a> or <a href="mailto:healxista@gmail.com" className="text-blue-700 font-bold underline">healxista@gmail.com</a>.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-white">
                            <Button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl">
                                Verify Infrastructure
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DataSecurityModal;
