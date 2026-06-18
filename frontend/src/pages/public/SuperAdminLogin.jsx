import React, { useState } from 'react';
import logo from '@/assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, ShieldAlert, Lock, Terminal } from 'lucide-react';

const SuperSuperAdminLogin = () => {
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
            const role = 'super_admin'; // Role for backend
            
            const res = await fetch(`/api/auth/login`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role }),
            });

            const data = await res.json();

            if (res.ok) {
                login(data.user, data.token);
                toast.success('System Access Granted');
                setTimeout(() => {
                    navigate('/super-admin-dashboard');
                }, 100);
            } else {
                setError(data.message || 'Access Denied');
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError(`Connection Failed: ${err.message}. Port 5050 Offline.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-slate-950 font-mono overflow-hidden">
            {/* Grid Background Effect */}
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.2 }}></div>
            
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md p-8 md:p-10 rounded-2xl z-10 bg-slate-900 border border-red-900/30 shadow-2xl shadow-red-900/10"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 mb-4 border border-red-500/20">
                        <ShieldAlert className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-black tracking-widest text-slate-100 uppercase">
                        System Override
                    </h2>
                    <p className="text-xs text-red-500/80 mt-2 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                        <Lock className="h-3 w-3" /> Restricted Access Panel
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Terminal className="h-3 w-3" /> Root Identifier
                        </label>
                        <Input
                            type="email"
                            placeholder="admin@healxista.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-red-500/50 focus-visible:border-red-500 placeholder:text-slate-700 font-mono"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Key className="h-3 w-3" /> Access Key
                        </label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-red-500/50 focus-visible:border-red-500 placeholder:text-slate-700 font-mono"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-950/50 border border-red-900/50 p-3 rounded-lg flex items-start gap-2">
                            <ShieldAlert className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-400 font-medium">{error}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-12 text-sm bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-red-900/20"
                        disabled={loading}
                    >
                        {loading ? 'Decrypting...' : 'Initialize Override'}
                    </Button>
                </form>

                <p className="text-center text-[10px] text-slate-600 mt-8 font-bold uppercase tracking-widest flex flex-col items-center gap-1">
                    <span>Healxista Core System v1.0.4</span>
                    <Link to="/" className="hover:text-slate-400 transition-colors mt-2 underline underline-offset-4 decoration-slate-800">Return to Public Net</Link>
                </p>
            </motion.div>
        </div>
    );
};

// Add missing icon import
import { Key } from 'lucide-react';

export default SuperSuperAdminLogin;

