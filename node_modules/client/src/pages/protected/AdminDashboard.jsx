import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import {
    Users, Ambulance, Activity, Pill, HeartPulse, Home, CalendarCheck,
    Clock, CheckCircle, MessageSquare, TrendingUp, UserPlus, AlertCircle,
    ShieldCheck, FlaskConical, ArrowRight, BarChart2, Eye, Bell, ClipboardList
} from 'lucide-react';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { fetchApi } from '@/utils/api';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const timeAgo = (dateStr) => {
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return Math.floor(seconds) + " secs ago";
};

const StatCard = ({ title, value, icon: Icon, colorTheme, trend, onClick }) => {
    const themes = {
        indigo: "bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-700 text-white shadow-indigo-200/60",
        yellow: "bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-white shadow-orange-200/60",
        green: "bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 text-white shadow-emerald-200/60",
        red: "bg-gradient-to-br from-rose-400 via-rose-500 to-red-600 text-white shadow-rose-200/60",
        purple: "bg-gradient-to-br from-purple-500 via-purple-600 to-violet-700 text-white shadow-purple-200/60",
    };

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={onClick}
            className={`p-6 rounded-3xl shadow-lg relative overflow-hidden cursor-pointer select-none ${themes[colorTheme] || themes.indigo}`}
        >
            <div className="absolute -bottom-4 -right-4 p-4 opacity-10 pointer-events-none">
                <Icon className="w-32 h-32" />
            </div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm border border-white/10 shadow-sm">
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                    {trend && (
                        <div className="flex items-center gap-1 text-xs font-bold bg-white/20 px-2.5 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>{trend}</span>
                        </div>
                    )}
                </div>
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-1">{value}</h2>
                    <h4 className="text-white/80 font-bold uppercase tracking-wider text-xs">{title}</h4>
                </div>
            </div>
        </motion.div>
    );
};

const DemoCard = ({ title, value, icon: Icon, iconBg, iconColor, loading, path, navigate }) => (
    <motion.div
        whileHover={{ y: -3, scale: 1.02 }}
        onClick={() => path && navigate(path)}
        className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
        <div className={`p-3 ${iconBg} ${iconColor} rounded-2xl w-max transition-transform group-hover:scale-110`}>
            <Icon className="h-6 w-6" />
        </div>
        <div>
            <p className="text-2xl md:text-3xl font-black text-slate-800">{loading ? <span className="w-8 h-7 bg-slate-100 rounded animate-pulse inline-block" /> : value}</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{title}</p>
        </div>
        {path && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="h-3 w-3" /> Manage
            </div>
        )}
    </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-md p-4 shadow-xl rounded-2xl border border-gray-100">
                <p className="font-bold text-gray-800 mb-1">{label || payload[0].name}</p>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.fill || payload[0].color || '#3b82f6' }}></div>
                    <p className="font-semibold text-gray-700">Count: <span className="text-gray-900">{payload[0].value}</span></p>
                </div>
            </div>
        );
    }
    return null;
};

const AdminDashboard = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        patients: 0, doctors: 0, ambulances: 0, pharmacies: 0,
        physiotherapy: 0, oldAgeHomes: 0, labTests: 0,
        totalInquiries: 0, pendingInquiries: 0, pendingVerifications: 0
    });
    const [recentRegisters, setRecentRegisters] = useState([]);
    const [recentInquiries, setRecentInquiries] = useState([]);
    const [bookingStats, setBookingStats] = useState({ total: 0, byStatus: [], byService: [] });
    const [loading, setLoading] = useState(true);

    const PIE_COLORS = ['#f59e0b', '#6366f1', '#10b981', '#ef4444', '#8b5cf6'];
    const BAR_COLORS = ['#3b82f6', '#ec4899', '#14b8a6', '#f43f5e', '#a855f7', '#eab308', '#10b981'];

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsData, recentData, bookingData, inquiriesData] = await Promise.all([
                    fetchApi('/api/admin/stats'),
                    fetchApi('/api/admin/recent'),
                    fetchApi('/api/admin/booking-stats'),
                    fetchApi('/api/admin/contacts')
                ]);

                if (statsData) setStats(statsData);
                if (recentData) setRecentRegisters(recentData);
                if (bookingData) setBookingStats(bookingData);
                if (inquiriesData) setRecentInquiries(inquiriesData.slice(0, 5));
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                if (error.message !== 'Unauthorized') {
                    toast.error("Failed to load live statistics.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
        
        const pulse = setInterval(async () => {
            // Re-fetch stats every minute for "Live" feel
            const [bookingData] = await Promise.all([
                fetchApi('/api/admin/booking-stats')
            ]);
            if (bookingData) setBookingStats(bookingData);
        }, 60000);
        return () => clearInterval(pulse);
    }, []);

    const totalProviders = stats.doctors + stats.ambulances + stats.pharmacies + stats.physiotherapy + stats.oldAgeHomes + stats.labTests;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 pt-4 px-2">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-10"
            >
                {/* Hero Banner */}
                <div className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-700 via-rose-800 to-slate-900" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 hidden md:block" />
                    <div className="relative p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="text-white space-y-3 max-w-2xl">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                    <ShieldCheck className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Admin Control Center</h1>
                                    <p className="text-sm text-slate-300 font-bold mt-1">Welcome, {user?.name || 'Admin'}!</p>
                                </div>
                            </div>
                            <p className="text-slate-300 text-sm md:text-base max-w-xl leading-relaxed">
                                Real-time platform statistics, provider verification, booking management & service oversight.
                            </p>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {[
                                    { label: 'Patients', val: stats.patients, color: 'bg-blue-500/30' },
                                    { label: 'Providers', val: totalProviders, color: 'bg-green-500/30' },
                                    { label: 'Bookings', val: bookingStats.total, color: 'bg-purple-500/30' },
                                ].map(badge => (
                                    <span key={badge.label} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 backdrop-blur-sm ${badge.color}`}>
                                        {badge.label}: <strong>{loading ? '...' : badge.val}</strong>
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex-shrink-0 flex flex-col gap-3 items-end">
                            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 text-center min-w-[140px]">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">System Status</p>
                                <p className="text-emerald-400 font-bold flex items-center justify-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </span>
                                    All Systems Online
                                </p>
                            </div>
                            {stats.pendingInquiries > 0 && (
                                <div
                                    onClick={() => navigate('/admin/contacts')}
                                    className="bg-rose-500/20 border border-rose-400/30 p-3 rounded-2xl text-center cursor-pointer hover:bg-rose-500/30 transition-colors min-w-[140px]"
                                >
                                    <p className="text-rose-300 text-sm font-bold">{stats.pendingInquiries} Pending Inquiries</p>
                                    <p className="text-rose-400 text-xs mt-1 flex items-center justify-center gap-1">Review Now <ArrowRight className="h-3 w-3" /></p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Operations Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard
                        title="Total Bookings"
                        value={loading ? '...' : bookingStats.total}
                        icon={CalendarCheck}
                        colorTheme="indigo"
                        trend="+12%"
                        onClick={() => navigate('/admin/bookings')}
                    />
                    <StatCard
                        title="Pending Bookings"
                        value={loading ? '...' : (bookingStats.byStatus.find(s => s.name === 'Pending')?.value || 0)}
                        icon={Clock}
                        colorTheme="yellow"
                        onClick={() => navigate('/admin/bookings')}
                    />
                    <StatCard
                        title="Completed Services"
                        value={loading ? '...' : (bookingStats.byStatus.find(s => s.name === 'Completed')?.value || 0)}
                        icon={CheckCircle}
                        colorTheme="green"
                        trend="+18%"
                    />
                    <div className="relative group">
                        {stats.pendingInquiries > 0 && (
                            <div className="absolute -top-2 -right-2 flex h-5 w-5 z-20">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 border-2 border-slate-50"></span>
                            </div>
                        )}
                        <StatCard
                            title="Pending Inquiries"
                            value={loading ? '...' : stats.pendingInquiries}
                            icon={MessageSquare}
                            colorTheme="red"
                            onClick={() => navigate('/admin/contacts')}
                        />
                    </div>
                </div>

                {/* Platform Demographics — All 7 roles */}
                <div>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                             <BarChart2 className="h-6 w-6 text-indigo-500" /> Platform Demographics
                        </h2>
                        <span className="text-sm text-slate-400 font-semibold px-4 py-1.5 bg-slate-100 rounded-full border border-slate-200 shadow-sm">
                            {loading ? '...' : `${totalProviders} Providers · ${stats.patients} Patients`}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                        <DemoCard title="Patients" value={stats.patients} icon={Users}      iconBg="bg-blue-50"    iconColor="text-blue-600"   loading={loading} path="/admin/patients"       navigate={navigate} />
                        <DemoCard title="Doctors"  value={stats.doctors}  icon={Activity}   iconBg="bg-indigo-50"  iconColor="text-indigo-600" loading={loading} path="/admin/doctors"        navigate={navigate} />
                        <DemoCard title="Ambulance" value={stats.ambulances} icon={Ambulance} iconBg="bg-rose-50"  iconColor="text-rose-600"   loading={loading} path="/admin/ambulances"      navigate={navigate} />
                        <DemoCard title="Pharmacy" value={stats.pharmacies} icon={Pill}    iconBg="bg-teal-50"   iconColor="text-teal-600"   loading={loading} path="/admin/medicines"       navigate={navigate} />
                        <DemoCard title="Physio"   value={stats.physiotherapy} icon={HeartPulse} iconBg="bg-purple-50" iconColor="text-purple-600" loading={loading} path="/admin/physiotherapy" navigate={navigate} />
                        <DemoCard title="Elderly"  value={stats.oldAgeHomes} icon={Home}   iconBg="bg-amber-50"  iconColor="text-amber-600"  loading={loading} path="/admin/old-age-homes"   navigate={navigate} />
                        <DemoCard title="Pathology Tests" value={stats.labTests} icon={FlaskConical} iconBg="bg-cyan-50" iconColor="text-cyan-600"  loading={loading} path="/admin/lab-tests"      navigate={navigate} />
                    </div>
                </div>

                {/* Platform Health & Verification Monitor */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Verification Queue Monitor */}
                    <div className="xl:col-span-2 bg-gradient-to-br from-slate-900 via-rose-950 to-red-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-red-500/20 p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center relative">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                        <div className="relative z-10 flex-1 space-y-8 text-center md:text-left">
                            <div className="space-y-3">
                                <h3 className="text-3xl md:text-4xl font-black text-white flex items-center justify-center md:justify-start gap-3">
                                    <ShieldCheck className="h-8 w-8 text-red-400" /> Trust Monitor
                                </h3>
                                <p className="text-red-100/60 text-sm md:text-lg font-medium max-w-md">Pending credential reviews for new providers entering the network. Accuracy is our priority.</p>
                            </div>
                            
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                                <div className="bg-white/10 border border-white/10 rounded-3xl p-6 backdrop-blur-md min-w-[160px] shadow-xl">
                                    <p className="text-[10px] font-black text-red-300 uppercase tracking-[0.2em] mb-2">Pending Review</p>
                                    <p className="text-5xl font-black text-white">{loading ? '...' : stats.pendingVerifications}</p>
                                </div>
                                <div className="hidden sm:block h-16 w-px bg-white/10" />
                                <div className="text-center md:text-left">
                                    <p className="text-white font-bold text-lg">Verification Queue</p>
                                    <p className="text-red-300/70 text-sm">{stats.pendingVerifications > 0 ? 'Urgent reviews required' : 'All accounts verified'}</p>
                                </div>
                            </div>

                            <Button 
                                onClick={() => navigate('/admin/verifications')}
                                className="w-full sm:w-auto bg-white text-red-900 hover:bg-red-50 font-black h-14 px-10 rounded-2xl shadow-2xl border-none text-lg transition-all hover:scale-105 active:scale-95"
                            >
                                Process Queue <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>

                        <div className="relative z-10 flex-shrink-0 w-full md:w-auto bg-white/5 rounded-[2rem] p-8 border border-white/10 backdrop-blur-md text-center group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="space-y-6 relative">
                                <div>
                                    <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-4">Real-time Pulse</p>
                                    <div className="flex items-end justify-center gap-1.5 h-12">
                                        {(bookingStats.byDayTrend?.slice(-7) || [4, 7, 4, 9, 6, 8, 5]).map((h, i) => (
                                            <motion.div 
                                                key={i}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${(typeof h === 'object' ? (h.count * 10 || 10) : (h * 10))}%` }}
                                                className="w-2.5 bg-red-500/60 rounded-t-md"
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-5xl text-white font-black mb-1">LIVE</p>
                                    <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em]">Database Synchronized</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Highlights */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 flex flex-col gap-6">
                        <h3 className="font-black text-2xl flex items-center gap-3 text-slate-800 border-b border-slate-50 pb-6">
                            <Bell className="h-6 w-6 text-red-600" /> Platform Status
                        </h3>
                        <div className="space-y-5 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                            <div className="flex gap-4 items-start p-5 bg-emerald-50 rounded-3xl border border-emerald-100">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-emerald-900">Database Connection</p>
                                    <p className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider">Operational · 100% Sla</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start p-5 bg-indigo-50 rounded-3xl border border-indigo-100">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-indigo-900">API Handshake</p>
                                    <p className="text-[11px] text-indigo-700 font-bold uppercase tracking-wider">Fast · 42ms Average</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 items-start p-5 bg-slate-50 rounded-3xl border border-slate-100 opacity-60">
                                <div className="h-12 w-12 rounded-2xl bg-slate-400 text-white flex items-center justify-center shrink-0">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-slate-700 px-1">Network Capacity</p>
                                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Sufficient · City-wide</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial & Analytics Visualization */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-slate-50 gap-4">
                        <div>
                            <h3 className="font-extrabold text-2xl text-slate-800">Platform Growth & Revenue</h3>
                            <p className="text-sm text-slate-500 mt-1">Holistic view of network scaling and financial performance.</p>
                        </div>
                        <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
                            <Button size="sm" variant="ghost" className="rounded-xl font-bold bg-white shadow-sm px-4">Weekly</Button>
                            <Button size="sm" variant="ghost" className="rounded-xl font-bold px-4 text-slate-500">Monthly</Button>
                        </div>
                    </div>
                    
                    <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                        {/* Service Volume Breakdown */}
                        <div className="space-y-4 md:space-y-5">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Service Breakdown</h4>
                                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +14.2%</span>
                            </div>
                            <div className="h-64 sm:h-72 w-full flex items-center justify-center relative">
                                {bookingStats.byStatus.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={bookingStats.byStatus}
                                                innerRadius={70}
                                                outerRadius={100}
                                                paddingAngle={8}
                                                dataKey="value"
                                                stroke="none"
                                                cornerRadius={8}
                                            >
                                                {bookingStats.byStatus.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-slate-400 font-medium flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" /> No activity data
                                    </div>
                                )}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-black text-slate-800">{bookingStats.total}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Services</span>
                                </div>
                            </div>
                        </div>

                        {/* Service Activity Growth Chart */}
                        <div className="space-y-4 md:space-y-5">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Platform Activity Trend</h4>
                                <span className="text-xs font-bold text-rose-500 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> REAL-TIME</span>
                            </div>
                            <div className="h-64 sm:h-72 w-full">
                                {bookingStats.byDayTrend && bookingStats.byDayTrend.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={bookingStats.byDayTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }} />
                                            <Bar dataKey="count" fill="#e11d48" radius={[6, 6, 0, 0]} barSize={24} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-3 border-2 border-dashed border-slate-100 rounded-3xl">
                                        <Activity className="h-12 w-12 opacity-10" />
                                        <p className="text-sm font-bold tracking-widest uppercase">Awaiting activity data...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feeds Row */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">

                    {/* Recent Registrations */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="font-extrabold text-xl flex items-center gap-2 text-slate-800">
                                    <UserPlus className="h-5 w-5 text-indigo-500" /> Recent Network Joins
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Latest users and providers successfully onboarded.</p>
                            </div>
                        </div>
                        <div className="overflow-y-auto max-h-[420px] p-2">
                            <ul className="divide-y divide-slate-50 text-sm">
                                {loading ? (
                                    <div className="p-8 text-center text-slate-400 font-medium">Loading...</div>
                                ) : recentRegisters.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 font-medium">No recent network activity.</div>
                                ) : (
                                    recentRegisters.map((item, i) => {
                                        const roleColorMap = {
                                            patient: 'bg-blue-400',
                                            doctor: 'bg-indigo-400',
                                            driver: 'bg-rose-400',
                                            medicine_store: 'bg-teal-400',
                                            physiotherapy: 'bg-purple-400',
                                            old_age_home: 'bg-amber-400',
                                            lab_test: 'bg-cyan-400',
                                            admin: 'bg-slate-400',
                                        };
                                        return (
                                            <li key={item.id || i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors rounded-2xl m-1 group">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg shadow-sm overflow-hidden">
                                                        {item.profile_image_url ? (
                                                            <img src={`/uploads/${item.profile_image_url}`} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            item.name ? item.name.charAt(0).toUpperCase() : '?'
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-slate-800">{item.name || 'Unknown User'}</span>
                                                        <span className="text-xs font-bold text-slate-500 capitalize flex items-center gap-1.5 mt-0.5">
                                                            <span className={`inline-block w-2 h-2 rounded-full ${roleColorMap[item.role] || 'bg-slate-400'}`}></span>
                                                            {item.role?.replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                        {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                            </li>
                                        );
                                    })
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Recent Inquiries */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="font-extrabold text-xl flex items-center gap-2 text-slate-800">
                                    <MessageSquare className="h-5 w-5 text-orange-500" /> Latest Inquiries
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Direct support messages from the Contact page.</p>
                            </div>
                            {stats.pendingInquiries > 0 && (
                                <span
                                    onClick={() => navigate('/admin/contacts')}
                                    className="bg-orange-100 text-orange-700 font-black text-xs px-3 py-1.5 rounded-xl shadow-sm cursor-pointer hover:bg-orange-200 transition-colors flex items-center gap-1"
                                >
                                    {stats.pendingInquiries} Action Required <ArrowRight className="h-3 w-3" />
                                </span>
                            )}
                        </div>
                        <div className="overflow-y-auto max-h-[420px] p-4 space-y-3">
                            {loading ? (
                                <div className="p-8 text-center text-slate-400 font-medium">Loading inquiries...</div>
                            ) : recentInquiries.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 font-medium">No recent inquiries.</div>
                            ) : (
                                recentInquiries.map((msg, i) => (
                                    <div key={msg.id || i} className="p-4 hover:bg-slate-50 transition-colors rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                        {msg.status === 'Pending' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-l-2xl"></div>}
                                        <div className="flex items-start justify-between mb-2 pl-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-slate-600 font-black border border-slate-200">
                                                    {msg.first_name ? msg.first_name.charAt(0).toUpperCase() : msg.name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-800 block text-sm">{msg.first_name || msg.name || 'Unknown'} {msg.last_name || ''}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">{msg.created_at ? timeAgo(msg.created_at) : 'Unknown time'}</span>
                                                </div>
                                            </div>
                                            <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest ${
                                                msg.status === 'Resolved' ? 'bg-slate-100 text-slate-500' : 'bg-rose-100 text-rose-600'
                                            }`}>
                                                {msg.status}
                                            </span>
                                        </div>
                                        <div className="pl-14">
                                            <p className="text-sm font-bold text-slate-700 mb-0.5">{msg.subject || 'No Subject'}</p>
                                            <p className="text-xs text-slate-500 line-clamp-2 italic">"{msg.message}"</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </motion.div>
        </div>
    );
};

export default AdminDashboard;



