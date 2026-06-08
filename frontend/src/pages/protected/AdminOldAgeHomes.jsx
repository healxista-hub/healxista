import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Search, Trash2, Eye, Shield, Download } from 'lucide-react';
import { exportToCSV } from '@/utils/exportUtils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import ProfileViewModal from '@/components/ProfileViewModal';

const AdminOldAgeHomes = () => {
    const { token, logout } = useAuth();
    const [homes, setHomes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHome, setSelectedHome] = useState(null);

    useEffect(() => {
        const fetchHomes = async () => {
            try {
                const hostname = window.location.hostname;
                const res = await fetch(`/api/admin/records/old-age`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setHomes(data);
                } else if (res.status === 401 || res.status === 403) {
                    toast.error("Session expired. Please log in again.");
                    logout();
                } else {
                    toast.error("Failed to load old age home records.");
                }
            } catch (err) {
                console.error(err);
                toast.error("Server error while fetching old age homes.");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchHomes();
        }
    }, [token]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this home?")) return;

        try {
            const hostname = window.location.hostname;
            const res = await fetch(`/api/admin/records/old-age/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                setHomes(homes.filter(home => home.id !== id));
                toast.success("Old age home record removed successfully.");
            } else if (res.status === 401 || res.status === 403) {
                toast.error("Session expired. Please log in again.");
                logout();
            } else {
                toast.error("Failed to delete record.");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred during deletion.");
        }
    };

    const handleVerify = async (id, currentStatus) => {
        try {
            const hostname = window.location.hostname;
            const res = await fetch(`/api/admin/records/old-age/${id}/verify`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({ is_verified: !currentStatus })
            });

            if (res.ok) {
                const { data } = await res.json();
                setHomes(homes.map(home => home.id === id ? { ...home, is_verified: data.is_verified } : home));
                toast.success(`Old age home ${!currentStatus ? 'verified' : 'unverified'} successfully.`);
            } else {
                toast.error("Failed to update status.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Server error");
        }
    };

    const filteredHomes = homes.filter(home =>
        home.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (home.admin_name && home.admin_name.toLowerCase().includes(searchTerm.toLowerCase()))
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
                        <Home className="h-8 w-8 text-red-600" />
                        Senior <span className="text-red-600">Sanitariums</span>
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Geriatric Facility Administration</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => exportToCSV(homes, 'OldAgeHomes_List')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors shadow-sm border border-indigo-100 font-black uppercase tracking-widest text-[11px]"
                    >
                        <Download className="h-4 w-4" /> Download
                    </button>
                    <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200">
                        <Shield className="h-5 w-5 text-emerald-400" />
                        <span className="text-[11px] font-black uppercase tracking-widest">
                            {homes.filter(h => h.is_verified).length} Verified Facilities
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
                            placeholder="Search by Facility Name, Administrator, or Location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-14 w-full pl-14 pr-6 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-red-500/20 font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-black placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
                        />
                    </div>
                </div>
            </motion.div>

            <div className="grid gap-6">
                {loading ? (
                    <div className="p-12 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Syncing Geriatric Network...</div>
                ) : filteredHomes.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No senior care facilities discovered.</div>
                ) : (
                    filteredHomes.map((home) => (
                        <motion.div
                            layout
                            key={home.id}
                            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                        >
                            <div className="p-6 md:p-8">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="h-20 w-20 rounded-[2rem] bg-slate-900 border border-slate-800 flex items-center justify-center shadow-xl shadow-slate-200 group-hover:scale-105 transition-transform overflow-hidden">
                                            {home.profile_image_url ? (
                                                <img src={`/uploads/${home.profile_image_url}`} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Home className="h-10 w-10 text-red-500" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{home.name || 'UNIT-UNIDENTIFIED'}</h3>
                                                <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${home.is_verified ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                    {home.is_verified ? 'Certified' : 'Pending'}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 font-bold text-sm">Administrator: <span className="text-slate-800 uppercase">{home.admin_name || 'COORDINATOR-UNASSIGNED'}</span> <span className="text-slate-300 ml-2">[{home.custom_id || home.id}]</span></p>
                                            <div className="flex flex-wrap items-center gap-4 mt-3">
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{home.capacity || '0'} Beds Available</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{home.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:items-end gap-1.5 w-full md:w-auto">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <button
                                                onClick={() => handleVerify(home.id, home.is_verified)}
                                                className={`h-11 px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${home.is_verified ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-100'}`}
                                            >
                                                {home.is_verified ? 'unverify' : 'Verify'}
                                            </button>

                                            <button
                                                className="h-11 px-5 rounded-2xl bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                                onClick={() => setSelectedHome(home)}
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span className="font-black uppercase tracking-widest text-[10px]">View</span>
                                            </button>

                                            <button
                                                className="h-11 w-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center justify-center"
                                                onClick={() => handleDelete(home.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{home.address || 'Location Unknown'}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <ProfileViewModal
                isOpen={!!selectedHome}
                onClose={() => setSelectedHome(null)}
                profile={selectedHome}
                title="Old Age Home Details"
            />
        </div>
    );
};

export default AdminOldAgeHomes;



