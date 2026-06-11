import React from 'react';
import logo from '@/assets/logo.png';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import HeroImage from '@/assets/images/hero/doctor.jpg'; // Background image
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
    return (
        <div
            className="min-h-screen flex items-center justify-center relative bg-gray-100"
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
                className="relative w-full max-w-sm glass-card p-8 rounded-3xl z-10 border border-white/40"
            >
                <div className="text-center mb-8">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 font-black text-2xl"
                    >
                        <img src={logo} alt="Healxista" className="h-9 w-auto drop-shadow-sm" />
                        <span className="brand-text-gradient">Healxista</span>
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 mt-2">
                        Create Account
                    </h2>
                    <p className="text-sm text-gray-600">Please select your account type</p>
                </div>

                <div className="space-y-4">
                    <Link to="/register/user" className="block">
                        <Button className="w-full h-14 text-lg brand-bg-gradient hover:opacity-90 text-white font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20">
                            <span className="text-2xl">👤</span> Register as User
                        </Button>
                    </Link>

                    <Link to="/register/driver" className="block">
                        <Button className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                            <span className="text-2xl">🚑</span> Register as Driver
                        </Button>
                    </Link>
                </div>

                {/* Back to Home Link */}
                <p className="text-center text-sm text-gray-700 mt-8">
                    <Link to="/" className="text-gray-600 hover:text-gray-900 hover:underline font-medium">
                        &larr; Back to Home
                    </Link>
                </p>

                <p className="text-center text-sm text-gray-700 mt-4">
                    Already have an account?{' '}
                    <Link to="/login" className="text-red-600 hover:underline font-medium">
                        Sign In
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
