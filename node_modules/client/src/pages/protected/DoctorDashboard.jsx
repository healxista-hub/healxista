import React, { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
    Calendar, Users, Activity, Clock, User,
    Stethoscope, PieChart as PieChartIcon, TrendingUp,
    MessageCircle, ShieldCheck, Sparkles, ArrowRight, ClipboardList,
    Paperclip, Download, Trash2, Upload, ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useChatCall } from '@/context/ChatCallContext';
import { fetchApi, getDocUrl } from '@/utils/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UserProfileModal from '@/components/UserProfileModal';
import SharedBookingsList from '@/components/SharedBookingsList';

const DoctorDashboard = () => {
    const { user, token } = useAuth();
    const [stats, setStats] = React.useState({ total: 0, accepted: 0, cancelled: 0, pending: 0, byDayTrend: [] });
    const [loading, setLoading] = React.useState(true);
    const [appointments, setAppointments] = React.useState([]);
    const [todayBookings, setTodayBookings] = React.useState([]);
    const { activeChatBooking, setActiveChatBooking } = useChatCall();
    const [slotDialog, setSlotDialog] = React.useState(null);
    const [slotData, setSlotData] = React.useState({ slot_number: '', consultation_time: '' });
    const [selectedProfile, setSelectedProfile] = React.useState(null);

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsData, assignedData] = await Promise.all([
                    fetchApi(`/api/bookings/my-stats`),
                    fetchApi(`/api/bookings/assigned`)
                ]);
                if (statsData) setStats(statsData);
                if (assignedData) {
                    setAppointments(assignedData);
                    const today = new Date().toDateString();
                    setTodayBookings(assignedData.filter(a => new Date(a.scheduled_at).toDateString() === today));
                }
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [user]);

    const todayCount = todayBookings.length;
    const pendingCount = stats.pending;

    // Chart Data Preparation
    const statusDistribution = useMemo(() => {
        const counts = { Pending: 0, Confirmed: 0, Completed: 0, Cancelled: 0, 'Booking Accepted': 0, 'Slot and Time Given': 0, 'Consultation Completed': 0 };
        appointments.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });
        return [
            { name: 'Pending', value: counts.Pending, color: '#f59e0b' },
            { name: 'Confirmed', value: counts.Confirmed, color: '#3b82f6' },
            { name: 'Booking Accepted', value: counts['Booking Accepted'], color: '#3b82f6' },
            { name: 'Slot & Time Given', value: counts['Slot and Time Given'], color: '#6366f1' },
            { name: 'Completed', value: counts.Completed, color: '#10b981' },
            { name: 'Consultation Completed', value: counts['Consultation Completed'], color: '#10b981' },
            { name: 'Cancelled', value: counts.Cancelled, color: '#ef4444' }
        ].filter(d => d.value > 0);
    }, [appointments]);

    const trendData = useMemo(() => {
        const days = {};
        for (let i = 4; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days[d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })] = 0;
        }
        appointments.forEach(a => {
            const dateStr = new Date(a.scheduled_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            if (days[dateStr] !== undefined) days[dateStr]++;
        });
        return Object.keys(days).map(date => ({ date, Patients: days[date] }));
    }, [appointments]);

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8 pb-12">

            {/* Modern Hero Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-red-100 bg-white"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-red-950 to-red-900" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 hidden md:block" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(225,29,72,0.1),transparent)]" />

                <div className="relative p-8 md:p-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div className="text-white space-y-6 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-[0.2em]">
                            <Sparkles className="h-4 w-4 text-red-400" /> Professional Portal
                        </div>
                        <h1 className="text-3xl md:text-6xl font-black tracking-tight leading-none">
                            {user?.name || 'Doctor'} <span className="text-red-500">Center</span>
                        </h1>
                        <p className="text-red-100/80 text-lg md:text-2xl max-w-xl leading-relaxed font-medium">
                            Manage patient consultations and monitor clinical productivity metrics in real-time.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <div className="flex flex-col">
                                <span className="text-red-400/60 text-[10px] font-black uppercase tracking-[0.15em]">Medical ID</span>
                                <span className="text-white font-bold">{user?.customId || 'DOC-4481'}</span>
                            </div>
                            <div className="h-8 w-px bg-white/20 self-end mb-1" />
                            <div className="flex flex-col">
                                <span className="text-red-400/60 text-[10px] font-black uppercase tracking-[0.15em]">Live Status</span>
                                <span className="text-white font-bold flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span> Synchronized
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Performance Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white border-slate-100 shadow-sm hover:shadow-xl transition-all group rounded-3xl overflow-hidden p-5 md:p-6 border-l-4 border-l-red-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-red-50 rounded-2xl text-red-600 group-hover:rotate-12 transition-transform">
                            <Calendar className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <h4 className="text-4xl font-black text-slate-800">{todayCount}</h4>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Scheduled Today</p>
                </Card>

                <Card className="bg-white border-slate-100 shadow-sm hover:shadow-xl transition-all group rounded-3xl overflow-hidden p-6 border-l-4 border-l-emerald-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:rotate-12 transition-transform">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <h4 className="text-4xl font-black text-slate-800">{stats.accepted}</h4>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Completed</p>
                </Card>

                <Card className="bg-white border-slate-100 shadow-sm hover:shadow-xl transition-all group rounded-3xl overflow-hidden p-6 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:rotate-12 transition-transform">
                            <Clock className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <h4 className="text-4xl font-black text-slate-800">{stats.pending}</h4>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Pending Review</p>
                </Card>

                <Card className="bg-slate-900 border-slate-800 shadow-lg group rounded-3xl overflow-hidden p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                    </div>
                    <h4 className="text-4xl font-black">{stats.total}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Lifetime Appointments</p>
                </Card>
            </div>

            {/* Advanced Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Patient Throughput Chart */}
                <Card className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col p-8 md:p-10">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                                <Activity className="h-6 w-6 text-red-600" /> Performance Analytics
                            </h3>
                            <p className="text-sm text-slate-400 font-bold tracking-widest uppercase mt-1">Consultation Trends</p>
                        </div>
                    </div>
                    <div className="flex-1 h-64 md:h-80 w-full">
                        {stats.byDayTrend && stats.byDayTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.byDayTrend} margin={{ top: 10, right: 30, left: -20, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} allowDecimals={false} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }} />
                                    <Area type="monotone" dataKey="count" stroke="#e11d48" strokeWidth={4} fillOpacity={1} fill="url(#colorUsage)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-3">
                                <Activity className="h-12 w-12 opacity-10" />
                                <p className="text-sm font-bold uppercase tracking-widest">Awaiting activity data...</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Today's Agenda - Timeline */}
                <Card className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col p-8 md:p-10">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
                        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                            <ClipboardList className="h-6 w-6 text-indigo-500" /> Today's Agenda
                        </h3>
                        <span className="text-[10px] font-black text-indigo-500 px-3 py-1 bg-indigo-50 rounded-full">{todayBookings.length} APPOINTMENTS</span>
                    </div>
                    <div className="space-y-6 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                        {todayBookings.map((app, i) => (
                            <div key={app.booking_id} className="flex gap-4 relative">
                                <div className="flex flex-col items-center">
                                    <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0 z-10">
                                        {new Date(app.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                    </div>
                                    {i < todayBookings.length - 1 && <div className="absolute top-10 w-0.5 h-full bg-slate-100" />}
                                </div>
                                <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-teal-200 transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-black text-slate-800 group-hover:text-teal-600 transition-colors">{app.userName}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">{app.status}</p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {todayBookings.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                <Calendar className="h-12 w-12 opacity-10 mb-4" />
                                <p className="font-bold text-sm">No appointments for today.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Bottom Comprehensive Log */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden p-2 md:p-8 lg:p-10">
                <SharedBookingsList 
                    userRole="provider" 
                    isDoctor={true} 
                    title="Appointment Ledger" 
                    icon={ClipboardList} 
                />
            </div>




            {selectedProfile && (
                <UserProfileModal
                    isOpen={!!selectedProfile}
                    onClose={() => setSelectedProfile(null)}
                    userId={selectedProfile.userId}
                    bookingDoc={selectedProfile.bookingDoc}
                />
            )}
        </div>
    );
};

export default DoctorDashboard;



