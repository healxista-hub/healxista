import React, { useState } from 'react';
import logo from '@/assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import AdminImage from '@/assets/images/hero/doctor.jpg'; // Generic background
import TermsModal from '@/components/TermsModal';
import { Eye, EyeOff } from 'lucide-react';
import OtpVerificationModal from '@/components/OtpVerificationModal';

const AdminRegister = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [accessCode, setAccessCode] = useState('');
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

        if (accessCode !== 'HEALXISTA-ADMIN-2026') {
            setError('Invalid Admin Registration Access Code.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`/api/auth/send-registration-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                // toast.success('OTP sent to your email!');
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
            const role = 'admin';
            const res = await fetch(`/api/auth/register`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role, otp }),
            });

            const data = await res.json();

            if (res.ok) {
                setShowOtpModal(false);
                login(data.user, data.token);
                // toast.success('Registration Successful');
                setTimeout(() => {
                    navigate(role === 'admin' ? '/admin-dashboard' : role === 'user' ? '/dashboard' : '/provider-portal');
                }, 100);
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center relative bg-gray-100 py-12"
            style={{
                backgroundImage: `url(${AdminImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="absolute inset-0 bg-black/70"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md glass-card p-8 rounded-3xl z-10 border border-white/40"
            >
                <div className="text-center mb-6">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 font-black text-2xl"
                    >
                        <img src={logo} alt="Healxista" className="h-9 w-auto drop-shadow-sm" />
                        <span className="brand-text-gradient">Healxista</span>
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800 mt-2">
                        System Setup
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">Register a new administrator</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Full Name</label>
                        <Input
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border-slate-300"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Email Address</label>
                        <Input
                            type="email"
                            placeholder="admin@healxista.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border-slate-300"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Security Access Code</label>
                        <div className="relative">
                            <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Required for admin registration"
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value)}
                            className="border-slate-300"
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
                        <p className="text-[10px] text-muted-foreground mt-0.5">Contact system owner for code.</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Password</label>
                        <Input
                            type="password"
                            placeholder="Admin secure password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border-slate-300"
                            required
                        />
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
                        <label htmlFor="terms" className="text-xs text-gray-600 text-left">
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

                    {error && <p className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded">{error}</p>}

                    <Button 
                        type="submit" 
                        className="w-full h-11 md:h-12 text-base md:text-lg text-white font-bold transition-all duration-300 brand-bg-gradient hover:opacity-90 shadow-xl shadow-red-500/20" 
                        disabled={loading || !termsAccepted}
                    >
                        {loading ? 'Sending OTP...' : 'Register Admin'}
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

                <p className="text-center text-sm text-slate-600 mt-6 pt-4 border-t">
                    Already an admin?{' '}
                    <Link to="/login/admin" className="text-slate-800 hover:text-blue-600 font-medium transition-colors">
                        Secure Login
                    </Link>
                </p>
                <div className="text-center mt-6 pt-4 border-t border-slate-100">
                    <Link to="/provider-portal" className="text-blue-600 hover:text-blue-700 font-bold transition-all flex items-center justify-center gap-2">
                        &larr; Back to Provider Portal
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminRegister;
