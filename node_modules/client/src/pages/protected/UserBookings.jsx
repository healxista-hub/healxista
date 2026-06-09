import React, { useState, useEffect } from 'react';
import {
    Calendar, Clock, MapPin, MessageCircle, Phone, Search,
    Ambulance, Activity, Pill, HeartPulse, Home, FlaskConical, User, XCircle, CheckCircle, Download, FileText
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { fetchApi, getDocUrl } from '@/utils/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useChatCall } from '@/context/ChatCallContext';
import PaymentModal from '@/components/PaymentModal';

const SERVICE_ICONS = {
    'Doctor Appointment': Activity,
    'Ambulance Ride': Ambulance,
    'Lab Test Booking': FlaskConical,
    'Physiotherapy Session': HeartPulse,
    'Old Age Home Inquiry': Home,
    'Medicine Order': Pill,
};

const SERVICE_COLORS = {
    'Doctor Appointment': 'bg-teal-50 text-teal-600 border-teal-100',
    'Ambulance Ride': 'bg-rose-50 text-rose-600 border-rose-100',
    'Lab Test Booking': 'bg-cyan-50 text-cyan-600 border-cyan-100',
    'Physiotherapy Session': 'bg-purple-50 text-purple-600 border-purple-100',
    'Old Age Home Inquiry': 'bg-amber-50 text-amber-600 border-amber-100',
    'Medicine Order': 'bg-emerald-50 text-emerald-600 border-emerald-100',
};

const STATUS_COLORS = {
    Pending:          'bg-amber-100 text-amber-700 border-amber-200',
    Accepted:         'bg-blue-100 text-blue-700 border-blue-200',
    'Booking Accepted': 'bg-blue-100 text-blue-700 border-blue-200',
    'Slot and Time Given': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    Arriving:         'bg-indigo-100 text-indigo-700 border-indigo-200',
    'On the Way':     'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Sample Collected':'bg-cyan-100 text-cyan-700 border-cyan-200',
    'Report Ready':   'bg-teal-100 text-teal-700 border-teal-200',
    Completed:        'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Consultation Completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Rejected:         'bg-rose-100 text-rose-700 border-rose-200',
    Cancelled:        'bg-slate-100 text-slate-600 border-slate-200',
};

const UserBookings = () => {
    const { token } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const { activeChatBooking, setActiveChatBooking } = useChatCall();
    const [activePaymentBooking, setActivePaymentBooking] = useState(null);
    const [cancelling, setCancelling] = useState(null);

    const fetchBookings = async () => {
        try {
            const data = await fetchApi('/api/bookings');
            if (data) setBookings(data);
        } catch (err) {
            console.error('Failed to load bookings', err);
            toast.error('Could not load your bookings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBookings(); }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        setCancelling(id);
        try {
            const res = await fetch(`/api/bookings/${id}/status`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({ status: 'Cancelled' })
            });
            if (res.ok) {
                toast.success('Booking cancelled.');
                fetchBookings();
            } else {
                toast.error('Failed to cancel booking.');
            }
        } catch {
            toast.error('Server error.');
        } finally {
            setCancelling(null);
        }
    };

    const allStatuses = ['All', 'Pending', 'Accepted', 'Completed', 'Cancelled'];

    const filtered = bookings.filter(b => {
        const matchStatus = filter === 'All' || b.status === filter;
        const matchSearch = !search || 
            b.service_name?.toLowerCase().includes(search.toLowerCase()) ||
            b.provider_name?.toLowerCase().includes(search.toLowerCase()) ||
            b.patient_name?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'Pending').length,
        completed: bookings.filter(b => b.status === 'Completed').length,
        cancelled: bookings.filter(b => b.status === 'Cancelled').length,
    };

    return (
        <div className="space-y-8 pb-12">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl p-8 md:p-12 text-white"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full -mr-32 -mt-32 blur-3xl opacity-20" />
                <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">My <span className="text-red-500">Bookings</span></h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mt-4 flex items-center gap-3">
                            <span className="h-px w-10 bg-red-600" />
                            Personal Healthcare Service Command Center
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full lg:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search appointments..."
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all placeholder:text-slate-600"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                            {allStatuses.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setFilter(s)}
                                    className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                        filter === s
                                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                                            : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-800'
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Bookings List */}
            {loading ? (
                <div className="p-16 text-center text-muted-foreground animate-pulse">Loading your bookings...</div>
            ) : filtered.length === 0 ? (
                <div className="p-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-3">
                    <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-indigo-300" />
                    </div>
                    <p className="font-semibold text-slate-700">
                        {bookings.length === 0 ? "You haven't made any bookings yet." : "No bookings match your filter."}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filtered.map((b, idx) => {
                        const Icon = SERVICE_ICONS[b.service_name] || Activity;
                        const sColor = STATUS_COLORS[b.status] || STATUS_COLORS.Pending;
                        const bgColor = SERVICE_COLORS[b.service_name] || 'bg-slate-50 text-slate-600 border-slate-100';

                        return (
                            <motion.div
                                key={b.booking_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-red-100 transition-all overflow-hidden"
                            >
                                <div className="p-1 h-2 bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent group-hover:from-red-500 transition-all" />
                                <div className="p-6 md:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                                    <div className="flex-1 space-y-6">
                                        <div className="flex items-start md:items-center gap-6">
                                            <div className={`h-16 w-16 md:h-20 md:w-20 rounded-[1.5rem] md:rounded-[2.25rem] flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${bgColor}`}>
                                                <Icon className="h-8 w-8 md:h-10 md:w-10" />
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                        REF #{b.booking_id}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${sColor}`}>
                                                        {b.status}
                                                    </span>
                                                </div>
                                                <h3 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight leading-none group-hover:text-red-600 transition-colors">
                                                    {b.service_name}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 pt-6 border-t border-slate-50">
                                            {b.slot_number && (
                                                <div className="md:col-span-2 flex items-center gap-4 bg-indigo-50 p-5 rounded-3xl border border-indigo-100 mb-2">
                                                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
                                                        <Activity className="h-6 w-6 text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">Clinical Slot Assigned</p>
                                                        <p className="text-base font-black text-slate-900 uppercase">
                                                            Slot #{b.slot_number} <span className="text-indigo-300 mx-2">&bull;</span> {b.consultation_time}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                        <Calendar className="h-5 w-5 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Date & Time</p>
                                                        <p className="text-sm font-bold text-slate-700">
                                                            {new Date(b.scheduled_at || b.created_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                            <span className="text-slate-300 mx-2">|</span>
                                                            {new Date(b.scheduled_at || b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                {(b.provider_first_name || b.assigned_to) && (
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                            <User className="h-5 w-5 text-slate-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Assigned Provider</p>
                                                            <p className="text-sm font-bold text-slate-700">{b.provider_first_name ? `${b.provider_first_name} ${b.provider_last_name}` : 'Awaiting Assignment'}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-4">
                                                {b.pickup_location && (
                                                    <div className="flex items-start gap-4">
                                                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                            <MapPin className="h-5 w-5 text-red-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Location Access</p>
                                                            <p className="text-sm font-bold text-slate-700 line-clamp-2">{b.pickup_location}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {b.contact_number && (
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                            <Phone className="h-5 w-5 text-emerald-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Direct Line</p>
                                                            <p className="text-sm font-bold text-slate-700">{b.contact_number}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-48 lg:border-l lg:pl-10 border-slate-100 pt-8 lg:pt-0">
                                        {b.provider_document && (
                                            <a 
                                                href={getDocUrl(b.provider_document)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 h-14 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-black uppercase tracking-widest text-[10px] rounded-2xl border border-emerald-100 transition-all flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                <FileText className="h-4 w-4" /> View Report
                                            </a>
                                        )}
                                        {['Payment Confirmed', 'Slot and Time Given', 'Arriving', 'On the Way', 'Sample Collected', 'Report Ready', 'Completed', 'Consultation Completed'].includes(b.status) && (
                                            <Button 
                                                onClick={() => setActiveChatBooking(b)}
                                                className="flex-1 h-14 bg-slate-900 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl transition-all"
                                            >
                                                <MessageCircle className="h-4 w-4 mr-2" /> Join Communication
                                            </Button>
                                        )}
                                        {(b.status === 'Accepted' || b.status === 'Booking Accepted') && (
                                            <Button 
                                                onClick={() => setActivePaymentBooking(b)}
                                                className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl transition-all"
                                            >
                                                Proceed to Pay
                                            </Button>
                                        )}
                                        {(b.status === 'Pending' || b.status === 'Accepted' || b.status === 'Booking Accepted') && (
                                            <Button 
                                                onClick={() => handleCancel(b.booking_id)}
                                                disabled={cancelling === b.booking_id}
                                                variant="ghost"
                                                className="flex-1 h-12 text-slate-400 hover:text-rose-600 hover:bg-rose-50 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all"
                                            >
                                                {cancelling === b.booking_id ? 'Processing...' : 'Cancel Request'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}



            <PaymentModal 
                isOpen={!!activePaymentBooking}
                booking={activePaymentBooking}
                onClose={() => setActivePaymentBooking(null)}
                onSuccess={() => {
                    setActivePaymentBooking(null);
                    fetchBookings();
                }}
            />
        </div>
    );
};

export default UserBookings;



