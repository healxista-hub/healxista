import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeartHandshake, Search, Filter, Trash2, Eye, Shield, CheckCircle2, Download } from 'lucide-react';
import { exportToCSV } from '@/utils/exportUtils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import ProfileViewModal from '@/components/ProfileViewModal';

const AdminHomeCares = () => {
    const { token, logout } = useAuth();
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProvider, setSelectedProvider] = useState(null);

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const res = await fetch(`/api/admin/records/home-care`, {
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProviders(data);
                } else if (res.status === 401 || res.status === 403) {
                    toast.error('Session expired. Please log in again.');
                    logout();
                } else {
                    toast.error('Failed to load home care records.');
                }
            } catch (err) {
                console.error(err);
                toast.error('Server error while fetching home cares.');
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchProviders();
    }, [token]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this home care provider?')) return;
        try {
            const res = await fetch(`/api/admin/records/home-care/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                setProviders(providers.filter(p => p.id !== id));
                toast.success('Provider record removed successfully.');
            } else if (res.status === 401 || res.status === 403) {
                toast.error('Session expired.');
                logout();
            } else {
                toast.error('Failed to delete record.');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred during deletion.');
        }
    };

    const handleVerify = async (id, currentStatus) => {
        try {
            const res = await fetch(`/api/admin/records/home-care/${id}/verify`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({ is_verified: !currentStatus })
            });

            if (res.ok) {
                const { data } = await res.json();
                setProviders(providers.map(p =>
                    p.id === id ? { ...p, is_verified: data.is_verified } : p
                ));
                toast.success(`Provider ${!currentStatus ? 'verified' : 'unverified'} successfully.`);
            } else {
                toast.error('Failed to update verification status.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Server error');
        }
    };

    const filteredProviders = providers.filter(p =>
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.agency_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.services_offered || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
            >
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <HeartHandshake className="h-8 w-8 text-red-600" />
                        Home Care <span className="text-red-600">Professionals</span>
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Home Care Provider Management</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => exportToCSV(providers, 'HomeCare_List')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors shadow-sm border border-indigo-100 font-black uppercase tracking-widest text-[11px]"
                    >
                        <Download className="h-4 w-4" /> Download
                    </button>
                    <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200">
                        <Shield className="h-5 w-5 text-emerald-400" />
                        <span className="text-[11px] font-black uppercase tracking-widest">
                            {providers.filter(l => l.is_verified).length} Verified Nodes
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Search & Intelligence Controls */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm"
            >
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                        <input
                            type="search"
                            placeholder="Search by Name, Role, or Services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-14 w-full pl-14 pr-6 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-red-500/20 font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-black placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['All Status', 'Verified', 'Pending'].map((status) => (
                            <button
                                key={status}
                                className={`h-14 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${status === 'All Status' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            <div className="grid gap-6">
                {loading ? (
                    <div className="p-12 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Syncing Provider Network...</div>
                ) : filteredProviders.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No home care professionals discovered.</div>
                ) : (
                    filteredProviders.map((provider) => (
                        <motion.div
                            layout
                            key={provider.id}
                            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                        >
                            <div className="p-6 md:p-8">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="h-20 w-20 rounded-[2rem] bg-slate-900 border border-slate-800 flex items-center justify-center shadow-xl shadow-slate-200 group-hover:scale-105 transition-transform overflow-hidden">
                                            {provider.profile_image_url ? (
                                                <img src={`/uploads/${provider.profile_image_url}`} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <HeartHandshake className="h-10 w-10 text-red-500" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{provider.name || 'UNIDENTIFIED'}</h3>
                                                <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${provider.is_verified ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                    {provider.is_verified ? 'Certified' : 'Pending'}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 font-bold text-sm">Role: <span className="text-slate-800 uppercase">{provider.agency_name || 'Caregiver'}</span> <span className="text-slate-300 ml-2">[{provider.custom_id || provider.id}]</span></p>
                                            <div className="flex flex-wrap items-center gap-4 mt-3">
                                                {provider.services_offered && (
                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50/50 rounded-lg border border-blue-100">
                                                        <Shield className="h-3.5 w-3.5 text-blue-500" />
                                                        <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider">{provider.services_offered}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                                    <CheckCircle2 className={`h-3.5 w-3.5 ${provider.experience_years ? 'text-emerald-500' : 'text-slate-300'}`} />
                                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Experience: {provider.experience_years || 0} Yrs</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:items-end gap-1.5 w-full md:w-auto">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <button
                                                onClick={() => handleVerify(provider.id, provider.is_verified)}
                                                className={`h-11 px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${provider.is_verified ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-100'}`}
                                            >
                                                {provider.is_verified ? 'unverify' : 'Verify'}
                                            </button>

                                            <button
                                                className="h-11 px-5 rounded-2xl bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                                onClick={() => setSelectedProvider(provider)}
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span className="font-black uppercase tracking-widest text-[10px]">View</span>
                                            </button>

                                            <button
                                                className="h-11 w-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center justify-center"
                                                onClick={() => handleDelete(provider.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{provider.address || 'Location Unknown'}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <ProfileViewModal
                isOpen={!!selectedProvider}
                onClose={() => setSelectedProvider(null)}
                profile={selectedProvider}
                title="Home Care Provider Details"
            />
        </div>
    );
};

export default AdminHomeCares;



