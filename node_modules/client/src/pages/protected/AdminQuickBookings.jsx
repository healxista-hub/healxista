import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/utils/api';
import { toast } from 'sonner';
import { Loader2, Phone, MapPin, Activity, Clock, Download } from 'lucide-react';
import { exportToCSV } from '@/utils/exportUtils';

const AdminQuickBookings = () => {
    const { token } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            const data = await fetchApi(`/api/quick-bookings`);
            if (data) setBookings(data);
        } catch (error) {
            console.error('Error fetching quick bookings:', error);
            toast.error('Failed to load quick bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [token]);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await fetchApi(`/api/quick-bookings/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });
            toast.success('Status updated successfully');
            fetchBookings();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const getBadgeStyle = (status) => {
        if (status === 'Resolved') return 'bg-green-100 text-green-800 border-green-200';
        if (status === 'Pending') return 'bg-red-100 text-red-800 border-red-200';
        return 'bg-blue-100 text-blue-800 border-blue-200';
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2.5rem] bg-indigo-900 border border-indigo-800 shadow-2xl p-8 md:p-12 text-white"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full -mr-32 -mt-32 blur-3xl opacity-20" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-400/30">
                                Live Operations
                            </span>
                            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <button 
                                onClick={() => exportToCSV(bookings, 'QuickBookings_List')}
                                className="flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/30 text-indigo-100 hover:bg-indigo-500/50 hover:text-white transition-colors border border-indigo-400/30 font-black uppercase tracking-widest text-[10px]"
                            >
                                <Download className="h-3 w-3" /> CSV
                            </button>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Quick <span className="text-indigo-400">Bookings</span></h1>
                        <p className="text-indigo-200 font-bold uppercase tracking-widest text-[11px] mt-3 flex items-center gap-3">
                            <span className="h-px w-10 bg-indigo-400" />
                            Guest Service Requests & Fast Dispatches
                        </p>
                    </div>
                    <div className="flex items-center gap-6 bg-indigo-800/40 p-6 rounded-[2rem] border border-indigo-700/50 backdrop-blur-md">
                        <div className="text-center">
                            <p className="text-3xl font-black leading-none">{bookings.length}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mt-1">Pending Traffic</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {bookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
                    <Activity className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No Quick Bookings</h3>
                    <p className="text-slate-500">There are currently no active quick booking requests.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    <AnimatePresence mode="popLayout">
                        {bookings.map((booking, idx) => (
                            <motion.div 
                                key={booking.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group overflow-hidden bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all"
                            >
                                <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                                            <Activity className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight m-0">
                                                {booking.service_type ? booking.service_type.toUpperCase() : 'GENERAL REQUEST'}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getBadgeStyle(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" /> {new Date(booking.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 lg:border-r border-slate-100">Workflow Action</span>
                                        <select 
                                            className="bg-transparent text-[11px] font-black uppercase tracking-widest text-slate-700 outline-none cursor-pointer pr-4"
                                            value={booking.status} 
                                            onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Action Taken">Action Taken</option>
                                            <option value="Resolved">Resolved</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="grid lg:grid-cols-3 gap-10">
                                        <div className="space-y-4 md:space-y-5">
                                            <div>
                                                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">Customer Identity</h4>
                                                <p className="font-black text-xl text-slate-900 uppercase tracking-tight">{booking.name}</p>
                                                <div className="mt-3 flex items-center gap-3 text-sm font-bold text-slate-600">
                                                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-indigo-50 transition-colors">
                                                        <Phone className="w-4 h-4 text-indigo-400" />
                                                    </div>
                                                    {booking.phone}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6 lg:border-l lg:pl-10 border-slate-100">
                                            <div>
                                                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">Geo Coordinates</h4>
                                                <div className="space-y-4">
                                                    <div className="flex items-start gap-4">
                                                        <MapPin className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" /> 
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Origin</p>
                                                            <p className="font-bold text-slate-700 text-sm">{booking.location || 'POINT ANALYSIS N/A'}</p>
                                                        </div>
                                                    </div>
                                                    {booking.destination && (
                                                        <div className="flex items-start gap-4">
                                                            <MapPin className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" /> 
                                                            <div>
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Target</p>
                                                                <p className="font-bold text-slate-700 text-sm">{booking.destination}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="lg:border-l lg:pl-10 border-slate-100">
                                            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">Case Briefing</h4>
                                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 group-hover:bg-indigo-50/30 group-hover:border-indigo-100 transition-all h-full min-h-[100px]">
                                                <p className="text-sm font-medium text-slate-600 italic leading-relaxed">
                                                    {booking.details || 'NO ADDITIONAL LOGISTIC DATA PROVIDED.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default AdminQuickBookings;



