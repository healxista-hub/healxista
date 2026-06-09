import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Trash2, Eye, Download } from 'lucide-react';
import { exportToCSV } from '@/utils/exportUtils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import UserProfileModal from '@/components/UserProfileModal';

const AdminPatients = () => {
    const { token, logout } = useAuth();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const hostname = window.location.hostname;
                const res = await fetch(`/api/admin/records/patient`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setPatients(data);
                } else if (res.status === 401 || res.status === 403) {
                    toast.error("Session expired. Please log in again.");
                    logout();
                } else {
                    toast.error("Failed to load patient records.");
                }
            } catch (err) {
                console.error(err);
                toast.error("Server error while fetching patients.");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchPatients();
        }
    }, [token]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this patient account?")) return;

        try {
            const hostname = window.location.hostname;
            const res = await fetch(`/api/admin/records/patient/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                setPatients(patients.filter(pat => pat.id !== id));
                toast.success("Patient record removed successfully.");
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

    const filteredPatients = patients.filter(pat =>
        pat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pat.email && pat.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-8 pb-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
            >
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Users className="h-8 w-8 text-red-600" />
                        Users <span className="text-red-600">Oversight</span>
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] md:text-[10px] mt-1">Platform User & Patient Administration</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => exportToCSV(patients, 'Patients_List')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors shadow-sm border border-indigo-100 font-black uppercase tracking-widest text-[11px]"
                    >
                        <Download className="h-4 w-4" /> Download
                    </button>
                    <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200">
                        <Users className="h-5 w-5 text-emerald-400" />
                        <span className="text-[11px] font-black uppercase tracking-widest">
                            {patients.length} Active users
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
                            placeholder="Search by Citizen Name, Email, or Identity..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-14 w-full pl-14 pr-6 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-red-500/20 font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-black placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
                        />
                    </div>
                </div>
            </motion.div>

            <div className="grid gap-6">
                {loading ? (
                    <div className="p-12 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Scanning Platform Database...</div>
                ) : filteredPatients.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No citizens detected.</div>
                ) : (
                    filteredPatients.map((pat) => (
                        <motion.div
                            layout
                            key={pat.id}
                            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                        >
                            <div className="p-6 md:p-8">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-[2rem] bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg shadow-slate-200 group-hover:scale-105 transition-transform overflow-hidden shrink-0">
                                            {pat.profile_image_url ? (
                                                <img src={`/uploads/${pat.profile_image_url}`} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Users className="h-8 w-8 md:h-10 md:w-10 text-red-500" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-1">
                                                <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">{pat.name || 'CITIZEN-UNIDENTIFIED'}</h3>
                                                <span className="w-fit px-3 py-1 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                    Active
                                                </span>
                                            </div>
                                            <p className="text-slate-500 font-bold text-sm">Identity: <span className="text-slate-800 uppercase">{pat.id}</span></p>
                                            <div className="flex flex-wrap items-center gap-4 mt-3">
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{pat.email}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{pat.mobile || 'MOBILE-SECURED'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:items-end gap-1.5 w-full md:w-auto">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <button
                                                className="h-11 px-5 rounded-2xl bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                                onClick={() => setSelectedPatient(pat)}
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span className="font-black uppercase tracking-widest text-[10px]"> View Profile</span>
                                            </button>

                                            <button
                                                className="h-11 w-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center justify-center"
                                                onClick={() => handleDelete(pat.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Enrolled: {new Date(pat.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <UserProfileModal
                isOpen={!!selectedPatient}
                onClose={() => setSelectedPatient(null)}
                userId={selectedPatient?.id}
                bookingDoc={selectedPatient?.last_user_document}
            />
        </div>
    );
};

export default AdminPatients;



