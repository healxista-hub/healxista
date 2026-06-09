import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pill, Search, Filter, MoreHorizontal, Trash2, Eye, Shield, Download } from 'lucide-react';
import { exportToCSV } from '@/utils/exportUtils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import ProfileViewModal from '@/components/ProfileViewModal';

const AdminMedicines = () => {
    const { token, logout } = useAuth();
    const [pharmacies, setPharmacies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStore, setSelectedStore] = useState(null);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const hostname = window.location.hostname;
                const res = await fetch(`/api/admin/records/medicine`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setPharmacies(data);
                } else if (res.status === 401 || res.status === 403) {
                    toast.error("Session expired. Please log in again.");
                    logout();
                } else {
                    toast.error("Failed to load pharmacy records.");
                }
            } catch (err) {
                console.error(err);
                toast.error("Server error while fetching pharmacies.");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchStores();
        }
    }, [token]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this pharmacy?")) return;

        try {
            const hostname = window.location.hostname;
            const res = await fetch(`/api/admin/records/medicine/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                setPharmacies(pharmacies.filter(pharm => pharm.id !== id));
                toast.success("Pharmacy record removed successfully.");
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
            const res = await fetch(`/api/admin/records/medicine/${id}/verify`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({ is_verified: !currentStatus })
            });

            if (res.ok) {
                const { data } = await res.json();
                setPharmacies(pharmacies.map(store => store.id === id ? { ...store, is_verified: data.is_verified } : store));
                toast.success(`Pharmacy ${!currentStatus ? 'verified' : 'unverified'} successfully.`);
            } else {
                toast.error("Failed to update status.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Server error");
        }
    };

    const filteredStores = pharmacies.filter(store =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (store.license_number && store.license_number.toLowerCase().includes(searchTerm.toLowerCase()))
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
                        <Pill className="h-8 w-8 text-red-600" />
                        Pharmacy <span className="text-red-600">Network</span>
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Pharmaceutical Supply Chain Management</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => exportToCSV(pharmacies, 'Pharmacies_List')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors shadow-sm border border-indigo-100 font-black uppercase tracking-widest text-[11px]"
                    >
                        <Download className="h-4 w-4" /> Download
                    </button>
                    <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200">
                        <Shield className="h-5 w-5 text-emerald-400" />
                        <span className="text-[11px] font-black uppercase tracking-widest">
                            {pharmacies.filter(p => p.is_verified).length} Verified Nodes
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
                            placeholder="Search by Store Name, License, or Location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-14 w-full pl-14 pr-6 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-red-500/20 font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-black placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
                        />
                    </div>
                </div>
            </motion.div>

            <div className="grid gap-6">
                {loading ? (
                    <div className="p-12 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Syncing Pharmaceutical Network...</div>
                ) : filteredStores.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No medical stores discovered.</div>
                ) : (
                    filteredStores.map((store) => (
                        <motion.div
                            layout
                            key={store.id}
                            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                        >
                            <div className="p-6 md:p-8">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="h-20 w-20 rounded-[2rem] bg-slate-900 border border-slate-800 flex items-center justify-center shadow-xl shadow-slate-200 group-hover:scale-105 transition-transform overflow-hidden">
                                            {store.profile_image_url ? (
                                                <img src={`/uploads/${store.profile_image_url}`} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Pill className="h-10 w-10 text-red-500" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{store.name || 'UNIT-UNIDENTIFIED'}</h3>
                                                <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${store.is_verified ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                    {store.is_verified ? 'Certified' : 'Pending'}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 font-bold text-sm">Regulatory License: <span className="text-slate-800 uppercase">{store.license_number || 'ST-PENDING'}</span> <span className="text-slate-300 ml-2">[{store.custom_id || store.id}]</span></p>
                                            <div className="flex flex-wrap items-center gap-4 mt-3">
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{store.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:items-end gap-1.5 w-full md:w-auto">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <button
                                                onClick={() => handleVerify(store.id, store.is_verified)}
                                                className={`h-11 px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${store.is_verified ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-100'}`}
                                            >
                                                {store.is_verified ? 'Unverify' : 'Verify'}
                                            </button>

                                            <button
                                                className="h-11 px-5 rounded-2xl bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                                onClick={() => setSelectedStore(store)}
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span className="font-black uppercase tracking-widest text-[10px]">Inspect</span>
                                            </button>

                                            <button
                                                className="h-11 w-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center justify-center"
                                                onClick={() => handleDelete(store.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{store.address || 'Location Unknown'}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <ProfileViewModal
                isOpen={!!selectedStore}
                onClose={() => setSelectedStore(null)}
                profile={selectedStore}
                title="Pharmacy Profile Details"
            />
        </div>
    );
};

export default AdminMedicines;



