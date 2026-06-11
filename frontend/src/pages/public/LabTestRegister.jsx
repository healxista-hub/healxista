import React, { useState } from 'react';
import logo from '@/assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import TermsModal from '@/components/TermsModal';
import { Eye, EyeOff } from 'lucide-react';


const LabTestRegister = () => {
    const [labName, setLabName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [accreditation, setAccreditation] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [mobile, setMobile] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [homeSampleCollection, setHomeSampleCollection] = useState(false);
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
            const role = 'lab_test';
            // Send labName as 'name' for simplicity in backend logic, though backend handles labName explicitly too
            const res = await fetch(`/api/auth/register`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: labName, 
                    ownerName, 
                    email, 
                    password, 
                    role, 
                    licenseNumber, 
                    mobile, 
                    address, 
                    city, 
                    state, 
                    zipCode,
                    labName,
                    accreditation,
                    homeSampleCollection 
                }),
            });

            const data = await res.json();

            if (res.ok) {
                login(data.user, data.token);
                toast.success('Registration Successful');
                setTimeout(() => {
                    navigate('/lab-test-dashboard');
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
                backgroundImage: `url('/assets/images/lab_test.jpg')`,
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
                        Lab Center Registration
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Lab Name *</label>
                        <Input type="text" placeholder="Central Diagnostics" value={labName} onChange={(e) => setLabName(e.target.value)} className="h-9" required />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Owner Name *</label>
                        <Input type="text" placeholder="John Doe" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="h-9" required />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Registration No. *</label>
                            <Input type="text" placeholder="REG-4545" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className="h-9" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Accreditation *</label>
                            <Input type="text" placeholder="NABL / ISO" value={accreditation} onChange={(e) => setAccreditation(e.target.value)} className="h-9" required />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Mobile *</label>
                        <Input type="tel" placeholder="9876543210" value={mobile} onChange={(e) => setMobile(e.target.value)} className="h-9" required />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Street Address *</label>
                            <Input type="text" placeholder="123 Health St" value={address} onChange={(e) => setAddress(e.target.value)} className="h-9" required />
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

                    <label className="flex items-center space-x-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={homeSampleCollection}
                            onChange={(e) => setHomeSampleCollection(e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Offer Home Sample Collection</span>
                    </label>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Email *</label>
                        <Input type="email" placeholder="lab@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9" required />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Password *</label>
                        <div className="relative">
                            <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-9" required />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
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
                        className="w-full h-11 md:h-12 text-base md:text-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all duration-300 shadow-xl shadow-indigo-500/20" 
                        disabled={loading}
                    >
                        {loading ? 'Creating account...' : 'Register Lab'}
                    </Button>
                </form>

                <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />

                <p className="text-center text-sm text-gray-700 mt-6">
                    Already have an account?{' '}
                    <Link to="/login/lab-test" className="text-indigo-600 hover:underline font-medium">
                        Lab Sign In
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default LabTestRegister;
