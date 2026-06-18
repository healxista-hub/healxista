import React, { useState } from 'react';
import logo from '@/assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import HomeImage from '@/assets/images/hero/doctor.jpg';
import { Eye, EyeOff } from 'lucide-react';

const OldAgeHomeLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const hostname = window.location.hostname;
            const role = 'old_age_home';
            const res = await fetch(`/api/auth/login`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role }),
            });

            const data = await res.json();

            if (res.ok) {
                login(data.user, data.token);
                toast.success('Login Successful');
                setTimeout(() => {
                    navigate('/old-age-home-dashboard');
                }, 100);
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError(`Connection Failed: ${err.message}. Ensure Server is running on Port 5050.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center relative bg-gray-100"
            style={{
                backgroundImage: `url(${HomeImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="absolute inset-0 bg-black/60"></div>

            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative w-full max-w-sm glass-card p-8 rounded-3xl z-10 border border-white/40"
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
                        Old Age Home Login
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</label>
                        <Input
                            type="email"
                            placeholder="admin@oldagehome.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-9"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Password</label>
                            <Link to="/forgot-password" className="text-[10px] text-red-600 font-bold hover:underline transition-colors">Forgot Password?</Link>
                        </div>
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

                    {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

                    <Button
                        type="submit"
                        className="w-full h-11 md:h-12 text-base md:text-lg brand-bg-gradient hover:opacity-90 text-white font-bold transition-all duration-300 shadow-xl shadow-red-500/20"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Secure Login'}
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-700 mt-6 pt-4 border-t border-gray-100">
                    <Link to="/provider-portal" className="text-blue-600 hover:text-blue-700 font-bold transition-all flex items-center justify-center gap-2">
                        &larr; Back to Provider Portal
                    </Link>
                </p>

                <p className="text-center text-sm text-gray-700 mt-2">
                    Don't have an account?{' '}
                    <Link to="/register/old-age-home" className="text-orange-600 hover:underline font-medium">
                        Create Home Account
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default OldAgeHomeLogin;

