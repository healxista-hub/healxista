import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, User, MapPin, Phone, Mail, Award, Clock, 
    ShieldCheck, Calendar, FileText, ExternalLink,
    Stethoscope, FlaskConical, Activity, Heart, ShoppingBag, Home
} from 'lucide-react';
import { fetchApi } from '@/utils/api';
import { Button } from '@/components/ui/button';

// Helper: Custom Paperclip Icon
const PaperclipIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
    </svg>
);

// Helper: Get Icon based on role
const getRoleIcon = (role) => {
    switch (role) {
        case 'Doctor': return <Stethoscope className="h-6 w-6" />;
        case 'Lab Test': return <FlaskConical className="h-6 w-6" />;
        case 'Physiotherapy': return <Activity className="h-6 w-6" />;
        case 'Medicine Store': return <ShoppingBag className="h-6 w-6" />;
        case 'Old Age Home': return <Home className="h-6 w-6" />;
        default: return <User className="h-6 w-6" />;
    }
};

// Helper: Get Color based on role
const getRoleColor = (role) => {
    switch (role) {
        case 'Doctor': return 'from-blue-600 to-indigo-700';
        case 'Lab Test': return 'from-red-600 to-rose-700';
        case 'Physiotherapy': return 'from-emerald-600 to-teal-700';
        case 'Medicine Store': return 'from-purple-600 to-violet-700';
        case 'Old Age Home': return 'from-amber-600 to-orange-700';
        default: return 'from-slate-600 to-slate-800';
    }
};

const UserProfileModal = ({ isOpen, onClose, userId, bookingDoc = null }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        if (isOpen && userId) {
            const fetchProfile = async () => {
                setLoading(true);
                try {
                    const data = await fetchApi(`/api/profile/${userId}`);
                    if (isMounted && data) {
                        setProfile(data);
                    }
                } catch (error) {
                    console.error('Error fetching profile:', error);
                } finally {
                    if (isMounted) setLoading(false);
                }
            };
            fetchProfile();
        }
        return () => { isMounted = false; };
    }, [isOpen, userId]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
                    >
                        {/* Header Section */}
                        <div className="h-32 relative bg-slate-100">
                            {profile?.cover_image_url ? (
                                <img src={`/uploads/${profile.cover_image_url}`} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                                <div className={`absolute inset-0 bg-gradient-to-r ${getRoleColor(profile?.role_name)}`}></div>
                            )}
                            <button 
                                onClick={onClose}
                                className="absolute right-6 top-6 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors backdrop-blur-sm z-10"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="px-8 pb-8 -mt-12 relative z-10 text-center sm:text-left sm:flex sm:items-end sm:gap-6">
                            <div className="mx-auto sm:mx-0 h-32 w-32 rounded-3xl bg-white p-1.5 shadow-xl border border-slate-100">
                                <div className="h-full w-full rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden font-black text-4xl text-slate-300">
                                    {profile?.profile_image_url ? (
                                        <img src={`/uploads/${profile.profile_image_url}`} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        profile?.name?.charAt(0) || '?'
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 sm:mt-0 pb-2">
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                                    <h2 className="text-3xl font-black text-slate-900">{profile?.name || 'Identity Logged'}</h2>
                                    {profile?.is_online && (
                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse border-2 border-white" />
                                    )}
                                </div>
                                <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">
                                    {getRoleIcon(profile?.role_name)}
                                    {profile?.role_name || 'Individual User'} {profile?.custom_id ? `• ${profile.custom_id}` : ''}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-4">
                                    <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Retrieving Secure Records...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Primary Info Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <User className="h-3 w-3" /> Contact Information
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 text-slate-600">
                                                    <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center"><Mail className="h-4 w-4" /></div>
                                                    <span className="font-semibold text-sm">{profile?.email || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-600">
                                                    <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center"><Phone className="h-4 w-4" /></div>
                                                    <span className="font-semibold text-sm">{profile?.phone_number || 'Contact Hidden'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <MapPin className="h-3 w-3" /> Location Details
                                            </h4>
                                            <div className="flex items-start gap-3 text-slate-600">
                                                <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0"><MapPin className="h-4 w-4" /></div>
                                                <span className="font-semibold text-sm leading-relaxed">
                                                    {profile?.street ? `${profile.street}, ${profile.city || ''}, ${profile.state || ''}` : 'Location hidden or not set'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Professional Details (Conditional) */}
                                    {profile && (profile.specialization || profile.consultationFee || profile.experienceYears) && (
                                        <div className="p-6 rounded-[2rem] bg-indigo-50/50 border border-indigo-100/50 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                            <div className="text-center sm:text-left">
                                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Specialization</p>
                                                <p className="text-sm font-black text-slate-800">{profile.specialization || 'Professional Service'}</p>
                                            </div>
                                            <div className="text-center sm:text-left">
                                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Experience</p>
                                                <p className="text-sm font-black text-slate-800">{profile.experienceYears || profile.experience || 0} Years</p>
                                            </div>
                                            <div className="text-center sm:text-left">
                                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Service Fee</p>
                                                <p className="text-sm font-black text-indigo-600">₹{profile.consultationFee || 'TBD'}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Document Transparency Section */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <FileText className="h-3 w-3" /> Related Documentation
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {profile?.document_url && (
                                                <a 
                                                    href={`/uploads/${profile.document_url}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-400 hover:shadow-lg transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:rotate-12 transition-transform">
                                                            <Award className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-800 uppercase">Verification</p>
                                                            <p className="text-[10px] font-medium text-slate-400">Identity/Credentials</p>
                                                        </div>
                                                    </div>
                                                    <ExternalLink className="h-4 w-4 text-slate-300" />
                                                </a>
                                            )}

                                            {bookingDoc && (
                                                <a 
                                                    href={`/uploads/${bookingDoc}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 border border-amber-100 hover:border-amber-400 hover:shadow-lg transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-white text-amber-600 rounded-xl group-hover:rotate-12 transition-transform">
                                                            <PaperclipIcon className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-amber-900 uppercase">Clinical Entry</p>
                                                            <p className="text-[10px] font-medium text-amber-600">Shared History</p>
                                                        </div>
                                                    </div>
                                                    <ExternalLink className="h-4 w-4 text-amber-400" />
                                                </a>
                                            )}

                                            {!profile?.document_url && !bookingDoc && (
                                                <div className="sm:col-span-2 p-8 border-2 border-dashed border-slate-100 rounded-[2rem] text-center space-y-2">
                                                    <FileText className="h-8 w-8 text-slate-200 mx-auto" />
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No additional documents shared</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-6 border-t border-slate-50 flex justify-end gap-3">
                                        <Button 
                                            variant="ghost" 
                                            className="rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400"
                                            onClick={onClose}
                                        >
                                            Dismiss Profile
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UserProfileModal;
