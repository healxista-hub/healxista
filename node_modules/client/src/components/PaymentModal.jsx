import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, UploadCloud, CreditCard, Loader2, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/utils/api';
import { toast } from 'sonner';
import paymentQr from '../pages/protected/payment.jpeg';

const PaymentModal = ({ isOpen, onClose, booking, onSuccess }) => {
    const [payerName, setPayerName] = useState('');
    const [payerMobile, setPayerMobile] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !booking) return null;

    const amount = 1000;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!payerName || !payerMobile) {
            toast.error('Please fill in your name and mobile number');
            return;
        }

        if (payerMobile.length < 10) {
            toast.error('Please enter a valid mobile number');
            return;
        }

        setLoading(true);
        try {
            const res = await fetchApi(`/api/bookings/${booking.booking_id}/pay`, {
                method: 'POST',
                body: JSON.stringify({
                    payerName,
                    payerMobile,
                    amount
                }),
            });

            if (res) {
                toast.success('Payment details submitted successfully! Awaiting admin verification.');
                onSuccess();
            }
        } catch (error) {
            console.error('Payment submission failed:', error);
            toast.error('Failed to submit payment details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-10 pb-24">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
                    >
                        <div className="flex-shrink-0 p-6 md:p-8 bg-slate-900 text-white flex justify-between items-start relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
                            <div className="relative z-10">
                                <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                                    <CreditCard className="text-emerald-400 h-6 w-6" /> 100% SECURE PAY
                                </h2>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                                    Ref #{booking.booking_id} • {booking.service_name}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="relative z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8">
                            <div className="flex flex-col items-center justify-center mb-8">
                                <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 mb-4 group relative">
                                    <div className="absolute inset-0 bg-emerald-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {/* Placeholder for QR Code - User can place actual QR in public folder */}
                                    <img 
                                        src={paymentQr} 
                                        alt="Payment QR Code" 
                                        className="w-48 h-48 object-cover rounded-xl border border-slate-50"
                                    />
                                    <div className="absolute -bottom-3 -right-3 bg-emerald-100 p-2 rounded-xl border border-emerald-200 shadow-sm">
                                        <QrCode className="h-5 w-5 text-emerald-600" />
                                    </div>
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="text-sm font-black text-slate-800 uppercase tracking-widest">
                                        SCAN AND PAY
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Pay using any UPI App (GPay, PhonePe, Paytm, etc.)
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-2 ml-1">
                                        Total Amount
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 text-slate-500">
                                            <IndianRupee className="h-4 w-4" />
                                        </div>
                                        <input
                                            type="text"
                                            value={amount}
                                            disabled
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl py-4 pl-14 pr-4 font-black text-lg focus:outline-none opacity-80"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium mt-2 ml-1">Amount is fixed based on service requested.</p>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-2 ml-1">
                                        Payer Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter name from payment app"
                                        value={payerName}
                                        onChange={(e) => setPayerName(e.target.value)}
                                        className="w-full bg-white border border-slate-200 text-slate-900 rounded-2xl py-3.5 px-4 font-bold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-2 ml-1">
                                        Mobile Number
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="Mobile number linked to UPI"
                                        value={payerMobile}
                                        onChange={(e) => setPayerMobile(e.target.value)}
                                        className="w-full bg-white border border-slate-200 text-slate-900 rounded-2xl py-3.5 px-4 font-bold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-medium"
                                    />
                                </div>

                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-600/20"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud className="mr-2 h-5 w-5" />
                                                Submit Payment Details
                                            </>
                                        )}
                                    </Button>
                                    <div className="text-center mt-4">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            ✅ Fast & Secure Payments
                                        </p>
                                        <p className="text-[9px] text-slate-400 mt-1 font-medium">
                                            Admin will verify the payment before assigning the provider.
                                        </p>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PaymentModal;
