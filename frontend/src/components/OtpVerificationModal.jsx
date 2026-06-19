import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const OtpVerificationModal = ({ isOpen, onClose, email, onVerify, isVerifying, onResend }) => {
    const [otp, setOtp] = useState('');
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

    useEffect(() => {
        if (isOpen) {
            setTimeLeft(600);
            setOtp('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [isOpen, timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleVerify = () => {
        if (otp.length < 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }
        onVerify(otp);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative"
                    >
                        <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">Verify Email</h3>
                        <p className="text-sm text-gray-600 text-center mb-6">
                            We've sent a 6-digit code to <br/><span className="font-semibold text-gray-900">{email}</span>
                        </p>

                        <div className="space-y-4">
                            <div>
                                <Input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                    className="text-center text-2xl tracking-[0.5em] font-bold h-14"
                                />
                                <div className="flex justify-between items-center mt-2 px-1">
                                    <span className={`text-xs font-semibold ${timeLeft > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : 'OTP Expired'}
                                    </span>
                                    <button 
                                        onClick={onResend} 
                                        disabled={timeLeft > 540} 
                                        className="text-xs text-blue-600 font-semibold hover:underline disabled:text-gray-400 disabled:no-underline"
                                    >
                                        Resend OTP
                                    </button>
                                </div>
                            </div>

                            <Button
                                onClick={handleVerify}
                                disabled={isVerifying || otp.length < 6 || timeLeft === 0}
                                className="w-full h-12 text-lg font-bold brand-bg-gradient text-white shadow-lg"
                            >
                                {isVerifying ? 'Verifying...' : 'Verify & Register'}
                            </Button>

                            <button
                                onClick={onClose}
                                className="w-full text-sm text-gray-500 font-medium hover:text-gray-800 transition-colors mt-2"
                            >
                                Cancel Registration
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OtpVerificationModal;
