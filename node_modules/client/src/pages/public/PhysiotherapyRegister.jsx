import React, { useState } from 'react';
import logo from '@/assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import TermsModal from '@/components/TermsModal';

import PhysioImage from '@/assets/images/hero/doctor.jpg'; // Reusing doctor image

const PhysiotherapyRegister = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [mobile, setMobile] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [gender, setGender] = useState('');
    const [experienceYears, setExperienceYears] = useState('');
    const [consultationFee, setConsultationFee] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);
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
            const role = 'physiotherapy';
            const res = await fetch(`/api/auth/register`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role, licenseNumber, mobile, address, city, state, zipCode, gender, experienceYears, consultationFee }),
            });

            const data = await res.json();

            if (res.ok) {
                login(data.user, data.token);
                toast.success('Registration Successful');
                setTimeout(() => {
                    navigate('/physiotherapy-dashboard');
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
            className="min-h-screen flex items-center justify-center relative bg-gray-100 py-10"
            style={{
                backgroundImage: `url(${PhysioImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="absolute inset-0 bg-black/60"></div>

            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative w-full max-w-md glass-card p-8 rounded-3xl z-10 my-8 border border-white/40"
            >
                <div className="text-center mb-4">
                    <Link to="/" className="inline-flex items-center gap-2 font-black text-2xl">
                        <img src={logo} alt="Healxista" className="h-9 w-auto drop-shadow-sm" />
                        <span className="brand-text-gradient">Healxista</span>
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 mt-2">
                        Physio Registration
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Clinic/Physio Name *</label>
                        <Input type="text" placeholder="Dr. React Physio" value={name} onChange={(e) => setName(e.target.value)} className="h-9" required />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">License No. *</label>
                            <Input type="text" placeholder="PHY123" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className="h-9" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Mobile *</label>
                            <Input type="tel" placeholder="9876543210" value={mobile} onChange={(e) => setMobile(e.target.value)} className="h-9" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Gender *</label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                required
                            >
                                <option value="" disabled>Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Experience (Years)</label>
                            <Input type="number" min="0" placeholder="5" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} className="h-9" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Clinic Address *</label>
                            <Input type="text" placeholder="123 Wellness St" value={address} onChange={(e) => setAddress(e.target.value)} className="h-9" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">City *</label>
                            <Input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="h-9" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">State *</label>
                            <Input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} className="h-9" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">PIN Code *</label>
                            <Input type="text" placeholder="700001" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="h-9" required />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Consultation Fee (₹)</label>
                        <Input type="number" min="0" placeholder="500" value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} className="h-9" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Email *</label>
                        <Input type="email" placeholder="physio@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9" required />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Password</label>
                        <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-9" required />
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


                    {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

                    <Button 
                        type="submit" 
                        className={`w-full h-11 md:h-12 text-base md:text-lg text-white font-bold transition-all duration-300 shadow-xl ${termsAccepted ? 'brand-bg-gradient hover:opacity-90 shadow-red-500/20' : 'bg-gray-400 cursor-not-allowed'}`}
                        disabled={loading || !termsAccepted}
                    >
                        {loading ? 'Creating account...' : 'Register as Physio'}
                    </Button>
                </form>

                <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />

                <p className="text-center text-sm text-gray-700 mt-6">
                    Already have an account?{' '}
                    <Link to="/login/physiotherapy" className="text-teal-600 hover:underline font-medium">
                        Physio Sign In
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default PhysiotherapyRegister;
