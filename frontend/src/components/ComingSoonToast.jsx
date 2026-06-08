import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, X } from 'lucide-react';

const ComingSoonToast = ({ isOpen, onClose, duration = 3000 }) => {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: 100, y: -20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="fixed top-4 right-4 z-50 max-w-sm"
                >
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                        <div className="flex items-start gap-3 p-4">
                            {/* Icon */}
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <Rocket className="h-5 w-5 text-white" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-900 mb-1">
                                    Coming Soon!
                                </h4>
                                <p className="text-xs text-gray-600">
                                    This feature is under development. Stay tuned!
                                </p>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 transition"
                            >
                                <X className="h-4 w-4 text-gray-500" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: duration / 1000, ease: 'linear' }}
                            className="h-1 bg-gradient-to-r from-blue-500 to-purple-600"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Hook to manage toast state
export const useComingSoonToast = () => {
    const [isOpen, setIsOpen] = useState(false);

    const showToast = () => {
        setIsOpen(true);
    };

    const hideToast = () => {
        setIsOpen(false);
    };

    return { isOpen, showToast, hideToast };
};

export default ComingSoonToast;
