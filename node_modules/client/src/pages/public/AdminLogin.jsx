import React, { useState } from 'react';
import logo from '@/assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import AdminImage from '@/assets/images/hero/doctor.jpg'; // We can use the same or a generic background
import { Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
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
            const role = 'admin'; // Role for backend
            
            const res = await fetch(`/api/auth/login`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role }),
            });

            const data = await res.json();

            if (res.ok) {
                login(data.user, data.token);
                toast.success('Admin Login Successful');
                setTimeout(() => {
                    navigate('/admin-dashboard');
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
                backgroundImage: `url(${AdminImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/70"></div>

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
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800 mt-2">
                        System Admin
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">Authorized Personnel Only</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Admin Email</label>
                        <Input
                            type="email"
                            placeholder="admin@healxista.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-10 border-slate-300"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Password</label>
                            <a href="tel:+919239362736" className="text-[10px] text-red-600 font-bold hover:underline transition-colors" title="Call Healxista Support">Forgot Password?</a>
                        </div>
                        <div className="relative">
                            <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-10 border-slate-300"
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

                    {error && <p className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded">{error}</p>}

                    <Button
                        type="submit"
                        className="w-full h-11 md:h-12 text-base md:text-lg brand-bg-gradient hover:opacity-90 text-white font-bold transition-all duration-300 shadow-xl shadow-red-500/20"
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : 'Secure Login'}
                    </Button>
                </form>

                {/* Back to Selection Link */}
                <p className="text-center text-sm text-slate-600 mt-6 pt-4 border-t border-slate-100">
                    <Link to="/provider-portal" className="text-blue-600 hover:text-blue-700 font-bold transition-all flex items-center justify-center gap-2">
                        &larr; Back to Provider Portal
                    </Link>
                </p>
                <p className="text-center text-xs text-slate-500 mt-2">
                    Need setup?{' '}
                    <Link to="/register/admin" className="text-slate-800 hover:underline hover:text-blue-600 font-medium transition-colors">
                        Register Admin
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
