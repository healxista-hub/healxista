import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Loader, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const urlEmail = searchParams.get('email');
        const urlToken = searchParams.get('token');
        
        if (urlEmail && urlToken) {
            setEmail(urlEmail);
            setToken(urlToken);
        } else {
            toast.error('Invalid or missing reset token.');
            navigate('/forgot-password');
        }
    }, [searchParams, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            return toast.error('Passwords do not match.');
        }

        if (newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters long.');
        }

        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                setIsSuccess(true);
            } else {
                toast.error(data.message || 'Failed to reset password.');
            }
        } catch (error) {
            console.error('Reset Password Error:', error);
            toast.error('Server error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-8 border border-gray-100 text-center">
                    <div className="flex justify-center mb-6">
                        <CheckCircle size={64} className="text-green-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-[#1e293b] mb-4">Password Reset!</h2>
                    <p className="text-[#64748b] mb-8">
                        Your password has been successfully updated. You can now log in with your new password.
                    </p>
                    <Link
                        to="/login"
                        className="w-full inline-block py-3 px-4 bg-[#2b6cb0] hover:bg-[#2b6cb0]/90 text-white rounded-xl font-medium transition-all shadow-lg shadow-[#2b6cb0]/20"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-[#1e293b] mb-2">Set New Password</h2>
                    <p className="text-[#64748b]">
                        Please enter your new password below.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[#475569] mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                required
                                minLength="6"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2b6cb0] focus:border-transparent outline-none transition-all"
                                placeholder="Enter new password"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#475569] mb-2">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                required
                                minLength="6"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2b6cb0] focus:border-transparent outline-none transition-all"
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !newPassword || !confirmPassword}
                        className="w-full py-3 px-4 bg-[#2b6cb0] hover:bg-[#2b6cb0]/90 text-white rounded-xl font-medium transition-all shadow-lg shadow-[#2b6cb0]/20 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader className="animate-spin" size={20} />
                        ) : (
                            <span>Reset Password</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
