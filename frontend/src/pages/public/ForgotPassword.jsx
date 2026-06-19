import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';
import TechBgImage from '@/assets/images/hero/tech-bg.png';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                setIsSent(true);
            } else {
                toast.error(data.message || 'Failed to send reset link.');
            }
        } catch (error) {
            console.error('Forgot Password Error:', error);
            toast.error('Server error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center relative bg-gray-100 p-4"
            style={{
                backgroundImage: `url(${TechBgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50"></div>

            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative w-full max-w-sm glass-card p-8 rounded-3xl z-10 border border-white/40"
            >
                <div className="text-center mb-6">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 font-black text-2xl justify-center"
                    >
                        <img src={logo} alt="Healxista" className="h-9 w-auto drop-shadow-sm" />
                        <span className="brand-text-gradient">Healxista</span>
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 mt-4 mb-2">
                        Forgot Password?
                    </h2>
                    <p className="text-sm text-gray-700">
                        {isSent 
                            ? "Check your email for the reset link." 
                            : "Enter your registered email address and we'll send you a link to reset your password."}
                    </p>
                </div>

                {!isSent ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <Input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-9 pl-10"
                                    placeholder="user@example.com"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full h-11 md:h-12 text-base md:text-lg brand-bg-gradient hover:opacity-90 text-white font-bold transition-all duration-300 shadow-xl shadow-red-500/20"
                        >
                            {loading ? (
                                <Loader className="animate-spin" size={20} />
                            ) : (
                                <span>Send Reset Link</span>
                            )}
                        </Button>
                    </form>
                ) : (
                    <div className="text-center">
                        <button
                            onClick={() => setIsSent(false)}
                            className="text-red-600 font-medium hover:underline mb-4 text-sm"
                        >
                            Try another email address
                        </button>
                    </div>
                )}

                <p className="text-center text-sm text-gray-700 mt-6">
                    <Link to="/login" className="inline-flex items-center text-red-600 hover:underline font-medium">
                        <ArrowLeft size={14} className="mr-1" />
                        Back to Login
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
