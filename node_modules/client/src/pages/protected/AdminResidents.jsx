import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Search, Home, Activity, Phone, User, Hash, 
    X, ShieldCheck, Trash2, Calendar, FileText, 
    Download, ArrowUpRight, Filter, Building2,
    Users
} from 'lucide-react';
import { fetchApi, getDocUrl } from '@/utils/api';
import { exportToCSV } from '@/utils/exportUtils';
import { toast } from 'sonner';

const AdminResidents = () => {
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedResident, setSelectedResident] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await fetchApi('/api/residents/admin/all');
            if (data) setResidents(data);
        } catch (error) {
            toast.error("Failed to load global resident directory");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredResidents = residents.filter(r => {
        const matchesSearch = 
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.provider_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.room_number?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'All' || 
            (filterStatus === 'Active' && r.is_active) || 
            (filterStatus === 'Inactive' && !r.is_active);
            
        return matchesSearch && matchesStatus;
    });

    // Stats
    const totalResidents = residents.length;
    const activeResidents = residents.filter(r => r.is_active).length;
    const criticalResidents = residents.filter(r => r.condition === 'Critical').length;

    return (
        <div className="space-y-8 pb-12 min-h-screen bg-slate-50/50 p-4 md:p-8">
            {/* Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2.5rem] bg-indigo-950 border border-indigo-900 shadow-2xl p-8 md:p-12 text-white"
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full -mr-48 -mt-48 blur-[100px] opacity-20" />
                <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-[10px] font-black uppercase tracking-widest text-indigo-300">
                                Platform Core Administration
                            </span>
                            <button 
                                onClick={() => exportToCSV(residents, 'Residents_List')}
                                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 hover:text-white transition-colors border border-indigo-400/30 font-black uppercase tracking-widest text-[10px]"
                            >
                                <Download className="h-3.5 w-3.5" /> Download CSV
                            </button>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">Global <span className="text-indigo-400">Residents</span></h1>
                        <p className="text-indigo-300/60 font-bold uppercase tracking-widest text-[11px] mt-6 flex items-center gap-3">
                            <span className="h-px w-10 bg-indigo-500" />
                            Active Monitoring of All Old Age Home Occupants
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 text-center">
                            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Total Members</p>
                            <p className="text-3xl font-black text-white">{totalResidents}</p>
                        </div>
                        <div className="p-6 bg-emerald-500/10 backdrop-blur-md rounded-3xl border border-emerald-500/20 text-center">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Active</p>
                            <p className="text-3xl font-black text-emerald-500">{activeResidents}</p>
                        </div>
                        <div className="p-6 bg-rose-500/10 backdrop-blur-md rounded-3xl border border-rose-500/20 text-center col-span-2 sm:col-span-1 border-dashed">
                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Critical</p>
                            <p className="text-3xl font-black text-rose-500">{criticalResidents}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    <Input 
                        placeholder="Search by resident, room, or provider..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-bold focus:ring-indigo-500"
                    />
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                    {['All', 'Active', 'Inactive'].map((status) => (
                        <Button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            variant={filterStatus === status ? 'default' : 'ghost'}
                            className={`flex-1 md:flex-none h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all
                                ${filterStatus === status ? 'bg-indigo-600 shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            {status}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center p-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                </div>
            ) : filteredResidents.length === 0 ? (
                <div className="p-20 bg-white rounded-[3rem] text-center space-y-4 border border-slate-100 shadow-sm">
                    <Users className="h-16 w-16 text-slate-100 mx-auto" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No residents found matching criteria</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredResidents.map((resident, idx) => (
                        <motion.div
                            key={resident.resident_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="group relative overflow-hidden rounded-[2.5rem] border-slate-100 hover:border-indigo-200 hover:shadow-2xl transition-all h-full flex flex-col bg-white">
                                <div className={`h-2 transition-all w-full ${resident.is_active ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                
                                <CardHeader className="p-8 pb-4">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="h-16 w-16 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                                            {resident.photo_url ? (
                                                <img src={getDocUrl(resident.photo_url)} alt="r" className="h-full w-full object-cover" />
                                            ) : (
                                                <User className="h-8 w-8 text-slate-200" />
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                                                resident.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                                            }`}>
                                                {resident.is_active ? 'In Residence' : 'Checked Out'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <CardTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                            {resident.name}
                                        </CardTitle>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                                                ROOM {resident.room_number || 'TBD'}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {resident.age} Yrs
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-8 pt-0 space-y-6 flex-1 flex flex-col">
                                    <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4 shadow-inner">
                                        <div>
                                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Housing Facility</p>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                                    <Building2 className="h-5 w-5 text-indigo-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-slate-800 uppercase leading-snug">
                                                        {resident.provider_first_name} {resident.provider_last_name}
                                                    </p>
                                                    <p className="text-[9px] font-bold text-slate-400">{resident.provider_email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 mt-auto">
                                        <Button 
                                            onClick={() => setSelectedResident(resident)}
                                            className="w-full h-12 bg-white border-2 border-slate-100 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all group"
                                        >
                                            View Member Case File
                                            <ArrowUpRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 translate-x-1 transition-all" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal: Detailed Resident View */}
            <AnimatePresence>
                {selectedResident && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedResident(null)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-4xl bg-white rounded-[4rem] shadow-2xl overflow-hidden"
                        >
                            <div className="flex flex-col md:flex-row h-full">
                                {/* Left Media Section */}
                                <div className="w-full md:w-[400px] bg-slate-950 p-12 flex flex-col justify-between text-white relative">
                                    <div className="absolute top-0 left-0 w-full h-full bg-indigo-600/10 blur-[100px]" />
                                    
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="h-64 w-64 rounded-[4rem] overflow-hidden border-8 border-white/5 shadow-2xl ring-1 ring-white/10">
                                            {selectedResident.photo_url ? (
                                                <img src={getDocUrl(selectedResident.photo_url)} alt="r" className="h-full w-full object-cover shadow-2xl" />
                                            ) : (
                                                <div className="h-full w-full bg-slate-900 flex items-center justify-center">
                                                    <User className="h-32 w-32 text-slate-800" />
                                                </div>
                                            )}
                                        </div>
                                        <h2 className="mt-8 text-3xl font-black text-center uppercase tracking-tight">{selectedResident.name}</h2>
                                        <p className="text-indigo-400 font-black uppercase tracking-widest text-[10px] mt-2">Verified Member ID: {selectedResident.resident_id}</p>
                                    </div>

                                    <div className="relative z-10 space-y-4 pt-12">
                                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Facility Provider</p>
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                                                    <Building2 className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black uppercase tracking-tight">{selectedResident.provider_first_name} {selectedResident.provider_last_name}</p>
                                                    <p className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest">Old Age Home Provider</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Info Section */}
                                <div className="flex-1 p-12 md:p-16 space-y-12 overflow-y-auto max-h-[80vh] md:max-h-none">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex gap-2 mb-4">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${
                                                    selectedResident.condition === 'Critical' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                    selectedResident.condition === 'Needs Assistance' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                }`}>
                                                    Clinical Status: {selectedResident.condition}
                                                </span>
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${
                                                    selectedResident.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                                }`}>
                                                    {selectedResident.is_active ? 'Currently Active' : 'Inactive Record'}
                                                </span>
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Case File Registry • Joined {new Date(selectedResident.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setSelectedResident(null)} className="rounded-2xl bg-slate-50 hover:bg-slate-100 -mt-4">
                                            <X className="h-6 w-6 text-slate-400" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">Age Detail</p>
                                            <div className="h-16 flex items-center px-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-800 font-black tracking-widest text-lg shadow-sm">
                                                {selectedResident.age} YEARS
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">Wing Location</p>
                                            <div className="h-16 flex items-center px-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-800 font-black tracking-widest text-lg shadow-sm">
                                                ROOM {selectedResident.room_number || 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Emergency Communications</p>
                                        <div className="p-8 bg-indigo-50/50 rounded-[3rem] border border-indigo-100 flex items-start gap-6 shadow-sm shadow-indigo-900/5">
                                            <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                                                <Phone className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Direct Contact Record</p>
                                                <p className="text-xl font-black text-slate-900">{selectedResident.emergency_contact || 'None Documented'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Legal & Medical Dossier</p>
                                        {selectedResident.document_url ? (
                                            <a 
                                                href={getDocUrl(selectedResident.document_url)} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-8 bg-slate-900 rounded-[3rem] border border-slate-800 hover:bg-indigo-600 transition-all group shadow-2xl"
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-white group-hover:text-indigo-600 transition-all">
                                                        <FileText className="h-7 w-7" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-500 group-hover:text-indigo-100 uppercase tracking-widest mb-1">Electronic Health Record</p>
                                                        <p className="text-lg font-black text-white">Full Identity & Medical Archive</p>
                                                    </div>
                                                </div>
                                                <Download className="h-7 w-7 text-slate-500 group-hover:text-white group-hover:translate-y-1 transition-all" />
                                            </a>
                                        ) : (
                                            <div className="p-10 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No documentation archives found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminResidents;



