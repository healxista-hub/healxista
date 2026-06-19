import React, { useState } from 'react';
import logo from '@/assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import AmbulanceImage from '@/assets/images/hero/road.jpg';
import TermsModal from '@/components/TermsModal';
import { Eye, EyeOff } from 'lucide-react';
import OtpVerificationModal from '@/components/OtpVerificationModal';

const DriverRegister = () => {
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [licenseNumber, setLicenseNumber] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [experience, setExperience] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [gender, setGender] = useState('');

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
            const role = 'driver';
            const res = await fetch(`/api/auth/register`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name,
                    email,
                    password,
                    role,
                    mobile,
                    licenseNumber,
                    vehicleNumber,
                    vehicleType,
                    experience,
                    address,
                    city,
                    state,
                    zipCode,
                    gender, otp }),
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
            className="min-h-screen flex items-center justify-center relative bg-gray-100"
            style={{
                backgroundImage: `url(${AmbulanceImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: '#1a1a1a'
            }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60"></div>

            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative w-full max-w-2xl glass-card p-8 rounded-3xl z-10 my-8 border border-white/40"
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
                        Create Driver Account
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Full Name</label>
                            <Input
                                type="text"
                                placeholder="Ambulance Driver Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-9"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Mobile</label>
                            <Input
                                type="tel"
                                placeholder="9876543210"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                className="h-9"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Gender</label>
                            <select
                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
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
                            <Input
                                type="number"
                                placeholder="e.g. 5"
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                                className="h-9"
                                min="0"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Vehicle Type</label>
                            <select
                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={vehicleType}
                                onChange={(e) => setVehicleType(e.target.value)}
                                required
                            >
                                <option value="" disabled>Select Vehicle Type</option>
                                <option value="Road Ambulance">Road Ambulance</option>
                                <option value="Air Ambulance">Air Ambulance</option>
                                <option value="Water Ambulance">Water Ambulance</option>
                                <option value="Hearse Van">Hearse Van</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Vehicle Number</label>
                            <Input
                                type="text"
                                placeholder="WB02AB1234"
                                value={vehicleNumber}
                                onChange={(e) => setVehicleNumber(e.target.value)}
                                className="h-9"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">License Number</label>
                            <Input
                                type="text"
                                placeholder="DL-1234567890123"
                                value={licenseNumber}
                                onChange={(e) => setLicenseNumber(e.target.value)}
                                className="h-9"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</label>
                            <Input
                                type="email"
                                placeholder="driver@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-9"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Street Address *</label>
                            <Input
                                type="text"
                                placeholder="123 Main St"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="h-9"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">City *</label>
                            <Input
                                type="text"
                                placeholder="City"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="h-9"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">State *</label>
                            <Input
                                type="text"
                                placeholder="State"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                className="h-9"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">PIN Code *</label>
                            <Input
                                type="text"
                                placeholder="700001"
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                                className="h-9"
                                required
                            />
                        </div>

                        <div className="space-y-1 col-span-1 md:col-span-2">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Password</label>
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
                        className="w-full h-12 text-lg brand-bg-gradient hover:opacity-90 text-white font-bold transition-all duration-300 mt-2 shadow-xl shadow-red-500/20"
                        disabled={loading}
                    >
                        {loading ? 'Sending OTP...' : 'Create Driver Account'}
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
                    <Link to="/login/driver" className="text-blue-600 hover:underline font-medium">
                        Driver Sign In
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default DriverRegister;
