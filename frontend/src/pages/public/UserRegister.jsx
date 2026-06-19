import React, { useState } from 'react';
import logo from '@/assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import HeroImage from '@/assets/images/hero/doctor.jpg'; // Background image
import TermsModal from '@/components/TermsModal';
import { Eye, EyeOff } from 'lucide-react';
import OtpVerificationModal from '@/components/OtpVerificationModal';

const UserRegister = () => {
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/auth/send-registration-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('OTP sent to your email!');
                setShowOtpModal(true);
            } else {
                setError(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (otp) => {
        setLoading(true);
        try {
            const role = 'user';
            const res = await fetch(`/api/auth/register`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role, mobile, otp }),
            });

            const data = await res.json();

            if (res.ok) {
                setShowOtpModal(false);
                login(data.user, data.token);
                toast.success('Registration Successful');
                setTimeout(() => {
                    navigate('/dashboard');
                }, 100);
            } else {
                toast.error(data.message || 'Registration failed');
            }
        } catch (err) {
            toast.error('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center relative bg-gray-100 py-10"
            style={{
                backgroundImage: `url(${HeroImage})`,
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
                className="relative w-full max-w-md glass-card p-8 rounded-3xl z-10 my-8 border border-white/40"
            >
                <div className="text-center mb-4">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 font-black text-2xl"
                    >
                        <img src={logo} alt="Healxista" className="h-9 w-auto drop-shadow-sm" />
                        <span className="brand-text-gradient">Healxista</span>
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 mt-2">
                        Create User Account
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center">Full Name <span className="text-red-500 font-extrabold ml-1">*</span></label>
                            <Input
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-9"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center">Mobile <span className="text-red-500 font-extrabold ml-1">*</span></label>
                            <Input
                                type="tel"
                                placeholder="9876543210"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                className="h-9"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center">Email <span className="text-red-500 font-extrabold ml-1">*</span></label>
                            <Input
                                type="email"
                                placeholder="user@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-9"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center">Password <span className="text-red-500 font-extrabold ml-1">*</span></label>
                            <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-9"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600"
                            required
                        />
                        <label htmlFor="terms" className="text-xs text-gray-600">
                            I agree to the{' '}
                            <button
                                type="button"
                                onClick={() => setIsTermsOpen(true)}
                                className="text-red-600 font-semibold hover:underline"
                            >
                                Terms & Conditions
                            </button>
                        </label>
                    </div>

                    {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

                    <Button
                        type="submit"
                        className={`w-full h-11 md:h-12 text-base md:text-lg text-white font-bold transition-all duration-300 shadow-xl ${termsAccepted ? 'brand-bg-gradient hover:opacity-90 shadow-red-500/20' : 'bg-gray-400 cursor-not-allowed'}`}
                        disabled={loading || !termsAccepted}
                    >
                        {loading ? 'Sending OTP...' : 'Create Account'}
                    </Button>
                </form>

                <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />

                <OtpVerificationModal 
                    isOpen={showOtpModal} 
                    onClose={() => setShowOtpModal(false)} 
                    email={email} 
                    onVerify={handleVerifyOtp} 
                    isVerifying={loading}
                    onResend={() => handleSubmit()}
                />

                <p className="text-center text-sm text-gray-700 mt-6">
                    Already have an account?{' '}
                    <Link to="/login/user" className="text-red-600 hover:underline font-medium">
                        Sign In
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default UserRegister;
