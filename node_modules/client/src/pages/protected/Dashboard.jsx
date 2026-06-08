import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Ambulance, Clock, HeartPulse, MapPin, PhoneCall, FileText, Upload, 
    MessageCircle, Video, AlertTriangle, BarChart3, ShieldCheck, TrendingUp, 
    ArrowRight, Star, Download, Trash2, Paperclip
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BookingModal from '@/components/BookingModal';
import ComingSoonToast, { useComingSoonToast } from '@/components/ComingSoonToast';
import { useChatCall } from '@/context/ChatCallContext';
import UserProfileModal from '@/components/UserProfileModal';

import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import HeroImage from '@/assets/images/hero/doctor.jpg';
import { fetchApi, getDocUrl } from '@/utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

const UserDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const { toastOpen, hideToast } = useComingSoonToast();
    const [recentBookings, setRecentBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const { 
        activeChatBooking, 
        setActiveChatBooking,
        incomingCallDataGlobal,
        globalCallState,
        globalCallBookingId,
        setAutoAcceptCall
    } = useChatCall();
    const [selectedProfile, setSelectedProfile] = useState(null); // { userId }

    const [stats, setStats] = useState({ total: 0, accepted: 0, cancelled: 0, pending: 0, byDayTrend: [] });

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            try {
                const [bookingsData, statsData] = await Promise.all([
                    fetchApi(`/api/bookings`),
                    fetchApi(`/api/bookings/my-stats`)
                ]);
                if (bookingsData) setRecentBookings(bookingsData);
                if (statsData) setStats(statsData);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoadingBookings(false);
            }
        };
        fetchDashboardData();
    }, [user]);

    const handleDeleteDocument = async (bookingId, type) => {
        if (!window.confirm(`Are you sure you want to remove this ${type === 'user' ? 'document' : 'report'}?`)) return;
        try {
            await fetchApi(`/api/bookings/${bookingId}/document/${type}`, { method: 'DELETE' });
            // Refresh bookings
            const bookingsData = await fetchApi(`/api/bookings`);
            if (bookingsData) setRecentBookings(bookingsData);
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('Failed to delete document');
        }
    };

    // Data prep for Recharts
    const chartData = useMemo(() => {
        if (!Array.isArray(recentBookings) || !recentBookings.length) return [];
        const statusCounts = { Pending: 0, Accepted: 0, Arriving: 0, Completed: 0, Cancelled: 0 };
        recentBookings.forEach(b => {
            if (statusCounts[b.status] !== undefined) statusCounts[b.status]++;
        });
        return Object.keys(statusCounts).map(key => ({
            name: key,
            Events: statusCounts[key],
            color: key === 'Completed' ? '#10b981' : key === 'Cancelled' ? '#ef4444' : '#3b82f6'
        })).filter(d => d.Events > 0);
    }, [recentBookings]);

    const activeBooking = useMemo(() => {
        if (!Array.isArray(recentBookings)) return null;
        return recentBookings.find(b => ['Accepted', 'Arriving', 'On the Way'].includes(b.status));
    }, [recentBookings]);

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-8 relative">
            <Button
                variant="destructive"
                className="fixed bottom-6 right-6 md:bottom-8 md:right-8 rounded-full h-14 w-14 md:h-16 md:w-16 shadow-lg z-50 animate-pulse hover:scale-105 transition-transform"
                onClick={() => setIsBookingOpen(true)}
            >
                <AlertTriangle className="h-6 w-6 md:h-7 md:w-7" />
            </Button>

            {/* Modern Hero Welcome Banner */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 bg-white"
            >
                <div className="absolute inset-0">
                    <img src={HeroImage} alt="Welcome" className="w-full h-full object-cover opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-r from-red-950 via-red-900 to-slate-950 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
                </div>
                
                <div className="relative p-6 md:p-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div className="text-white space-y-6 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-[0.2em]">
                            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Secure Health Profile
                        </div>
                        <h1 className="text-3xl md:text-7xl font-black tracking-tight leading-none text-white">
                            Hey, {user?.name || 'User'}!
                        </h1>
                        <p className="text-blue-100/80 text-lg md:text-2xl max-w-xl leading-relaxed font-medium">
                            Your personalized health sanctuary. Access medical expertise and emergency care with one tap.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <div className="flex flex-col">
                                <span className="text-blue-400/60 text-[10px] font-black uppercase tracking-[0.15em]">Health ID</span>
                                <span className="text-white font-bold">{user?.customId || 'HEAL-0000'}</span>
                            </div>
                            <div className="h-8 w-px bg-white/20 self-end mb-1" />
                            <div className="flex flex-col">
                                <span className="text-blue-400/60 text-[10px] font-black uppercase tracking-[0.15em]">System Status</span>
                                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span> Ready
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-shrink-0 w-full lg:w-auto flex flex-col gap-4">
                        <Button 
                            onClick={() => setIsBookingOpen(true)}
                            size="lg" 
                            variant="destructive"
                            className="w-full lg:min-w-[280px] text-xl h-20 px-10 rounded-[2rem] shadow-2xl shadow-red-500/40 hover:shadow-red-500/60 transition-all font-black group bg-gradient-to-r from-red-600 to-rose-600 border-none hover:scale-105 active:scale-95"
                        >
                            <PhoneCall className="mr-3 h-8 w-8 group-hover:animate-bounce" />
                            EMERGENCY
                        </Button>
                        <p className="text-center text-blue-200/40 text-[10px] font-black uppercase tracking-widest italic">Rapid Response Guaranteed</p>
                    </div>
                </div>
            </motion.div>

            {/* Activity Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden border-l-4 border-l-red-500">
                    <CardContent className="p-5 md:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-red-50 rounded-2xl text-red-600 group-hover:scale-110 transition-transform">
                                <Activity className="h-6 w-6" />
                            </div>
                            <span className="text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-full">TOTAL</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <h4 className="text-3xl font-black text-slate-800">{stats.total}</h4>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Bookings Initiated</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden border-l-4 border-l-emerald-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">COMPLETED</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <h4 className="text-3xl font-black text-slate-800">{stats.accepted}</h4>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Successful Responses</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden border-l-4 border-l-amber-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform">
                                <Clock className="h-6 w-6" />
                            </div>
                        </div>
                        <h4 className="text-3xl font-black text-slate-800">{stats.pending}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Active Requests</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden border-l-4 border-l-rose-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-rose-50 rounded-2xl text-rose-600 group-hover:scale-110 transition-transform">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                        </div>
                        <h4 className="text-3xl font-black text-slate-800">{stats.cancelled}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Cancelled Efforts</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Action Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 md:gap-8 pb-10">
                
                {/* Enhanced Quick Services (Takes 2 columns) */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                             <Clock className="h-6 w-6 text-blue-600" /> Quick Services
                        </h3>
                        <Button variant="link" className="text-blue-600 font-bold p-0 h-auto" onClick={() => navigate('/user/doctors')}>Browse All Services <ArrowRight className="ml-1 h-4 w-4" /></Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <Card className="group hover:border-blue-400 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer overflow-hidden border-slate-200 bg-white" onClick={() => navigate('/user/doctors')}>
                            <CardContent className="p-4 md:p-8 flex flex-col items-center text-center">
                                <div className="h-14 w-14 md:h-20 md:w-20 rounded-2xl md:rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm mb-4 md:mb-6">
                                    <MessageCircle className="h-7 w-7 md:h-10 md:w-10" />
                                </div>
                                <h4 className="font-bold text-gray-900 text-sm md:text-xl">Consultation</h4>
                                <p className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 md:mt-2 group-hover:text-blue-500 transition-colors">Chat with Experts</p>
                            </CardContent>
                        </Card>

                        <Card className="group hover:border-purple-400 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer overflow-hidden border-slate-200 bg-white" onClick={() => navigate('/user/doctors')}>
                            <CardContent className="p-4 md:p-8 flex flex-col items-center text-center">
                                <div className="h-14 w-14 md:h-20 md:w-20 rounded-2xl md:rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all duration-500 shadow-sm mb-4 md:mb-6">
                                    <Video className="h-7 w-7 md:h-10 md:w-10" />
                                </div>
                                <h4 className="font-bold text-gray-900 text-sm md:text-xl">Tele-Health</h4>
                                <p className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 md:mt-2 group-hover:text-purple-500 transition-colors">Video Call Doctors</p>
                            </CardContent>
                        </Card>

                        <Card className="group hover:border-emerald-400 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer overflow-hidden border-slate-200 bg-white" onClick={() => navigate('/user/records')}>
                            <CardContent className="p-4 md:p-8 flex flex-col items-center text-center">
                                <div className="h-14 w-14 md:h-20 md:w-20 rounded-2xl md:rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-sm mb-4 md:mb-6">
                                    <Upload className="h-7 w-7 md:h-10 md:w-10" />
                                </div>
                                <h4 className="font-bold text-gray-900 text-sm md:text-xl">Vital Vault</h4>
                                <p className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 md:mt-2 group-hover:text-emerald-500 transition-colors">Secure Documents</p>
                            </CardContent>
                        </Card>

                        <Card className="group hover:border-rose-400 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer overflow-hidden border-slate-200 bg-white" onClick={() => navigate('/user/ambulances')}>
                            <CardContent className="p-4 md:p-8 flex flex-col items-center text-center">
                                <div className="h-14 w-14 md:h-20 md:w-20 rounded-2xl md:rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all duration-500 shadow-sm mb-4 md:mb-6">
                                    <Ambulance className="h-7 w-7 md:h-10 md:w-10" />
                                </div>
                                <h4 className="font-bold text-gray-900 text-sm md:text-xl">Fast Fleet</h4>
                                <p className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 md:mt-2 group-hover:text-rose-500 transition-colors">Request Transport</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Tracking & Wellness (Takes 2 columns) */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Live Tracking Card (Replacement for Map) */}
                    <Card className="shadow-2xl border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative min-h-[220px]">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <MapPin className="h-32 w-32" />
                        </div>
                        <CardHeader className="relative z-10 border-b border-white/10 pb-4">
                            <CardTitle className="text-xl font-black flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                                Service Tracking
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 relative z-10">
                            {activeBooking ? (
                                <div className="space-y-4 md:space-y-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 overflow-hidden shrink-0">
                                                {activeBooking.provider_profile_image ? (
                                                    <img src={`/uploads/${activeBooking.provider_profile_image}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    activeBooking.service_name?.toLowerCase().includes('ambulance') ? <Ambulance className="h-7 w-7" /> : <Clock className="h-7 w-7" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg">{activeBooking.service_name || 'Emergency Help'}</p>
                                                <p className="text-xs text-blue-300 font-bold tracking-widest uppercase">{activeBooking.status}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black">12 MIN</p>
                                            <p className="text-[10px] font-bold text-blue-200">ESTIMATED ARRIVAL</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: '65%' }}
                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <Button className="flex-1 bg-white text-slate-900 font-bold hover:bg-white/90" onClick={() => navigate('/live-map')}>
                                            <MapPin className="mr-2 h-4 w-4" /> View Map
                                        </Button>
                                        <Button variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10" onClick={() => setActiveChatBooking(activeBooking)}>
                                            <MessageCircle className="mr-2 h-4 w-4" /> Chat Now
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                                    <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-2">
                                        <ShieldCheck className="h-8 w-8 text-white/30" />
                                    </div>
                                    <p className="text-blue-100/60 font-medium">No services currently tracking.</p>
                                    <Button variant="link" className="text-blue-400 font-bold" onClick={() => navigate('/user/ambulances')}>Request a Service</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Health Activity Monitor (Visual) */}
                    <Card className="shadow-lg border-slate-100 bg-white overflow-hidden min-h-[220px]">
                        <CardHeader className="border-b border-slate-50 py-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Activity className="h-5 w-5 text-red-600" /> Service Usage Monitor
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 h-48">
                            {stats.byDayTrend && stats.byDayTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.byDayTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                                        <YAxis domain={['dataMin', 'dataMax + 1']} axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }} />
                                        <Area type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorUsage)" animationDuration={1500} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2">
                                    <Activity className="h-8 w-8 opacity-10" />
                                    <p className="text-xs font-bold">Awaiting activity data...</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                    {/* Expanded Activity Feed */}
                    <Card className="shadow-sm border-slate-100 h-full flex flex-col bg-white lg:col-span-3 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-black flex items-center gap-2 text-slate-800">
                                <Clock className="h-6 w-6 text-red-600" /> Medical Journey Log
                            </CardTitle>
                            <Button variant="outline" size="sm" className="text-[10px] font-black uppercase tracking-widest border-slate-200 rounded-xl" onClick={() => navigate('/user/activity')}>
                                Full History
                            </Button>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-0 max-h-[350px] lg:max-h-none">
                            {loadingBookings ? (
                                <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                                </div>
                            ) : recentBookings.length === 0 ? (
                                <div className="p-12 text-center text-slate-300 italic text-sm">No recent activity detected.</div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {recentBookings.map((booking) => (
                                        <div key={booking.booking_id} className="p-4 md:p-6 hover:bg-slate-50/80 transition-colors flex items-center gap-4 md:gap-6 group">
                                            <div className="h-12 w-12 md:h-14 md:w-14 shrink-0 rounded-xl md:rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-100 overflow-hidden group-hover:scale-105 transition-transform">
                                                {booking.provider_profile_image ? (
                                                    <img src={`/uploads/${booking.provider_profile_image}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="bg-red-50 text-red-600 w-full h-full flex items-center justify-center font-black text-sm md:text-base">
                                                        {booking.service_name?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-1">
                                                    <p className="font-black text-slate-900 truncate text-base md:text-lg">{booking.service_name || 'Service'}</p>
                                                    <span className={`inline-block w-fit px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest ${
                                                        booking.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                        booking.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                                                        'bg-indigo-100 text-indigo-700'
                                                    }`}>
                                                        {booking.status}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(booking.created_at).toLocaleDateString()} &bull; {new Date(booking.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                                                    {booking.provider_account_id && (
                                                        <button 
                                                            onClick={() => setSelectedProfile({ userId: booking.provider_account_id })}
                                                            className="text-[9px] md:text-[10px] font-black text-red-600 hover:text-red-700 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-lg transition-colors border border-red-100"
                                                        >
                                                            Profile
                                                        </button>
                                                    )}
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-2">
                                                    {booking.user_document && (
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-100">
                                                            <Paperclip className="h-3 w-3" />
                                                            <a href={getDocUrl(booking.user_document)} target="_blank" rel="noopener noreferrer" className="hover:underline">Doc</a>
                                                            <button onClick={() => handleDeleteDocument(booking.booking_id, 'user')} className="hover:text-red-600 ml-0.5">
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    )}
                                                    {booking.provider_document && (
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                                            <a href={getDocUrl(booking.provider_document)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                                                                <Download className="h-3 w-3" /> Report
                                                            </a>
                                                            <button onClick={() => handleDeleteDocument(booking.booking_id, 'provider')} className="hover:text-red-600 ml-0.5">
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    )}
                                                    {['Payment Confirmed', 'Slot and Time Given', 'Arriving', 'On the Way', 'Sample Collected', 'Report Ready', 'Completed', 'Consultation Completed'].includes(booking.status) && (() => {
                                                        const currentBookingId = booking.booking_id || booking.id;
                                                        const isIncomingThis = incomingCallDataGlobal && incomingCallDataGlobal.bookingId === currentBookingId;
                                                        const isActiveCallThis = globalCallState && globalCallBookingId === currentBookingId;
                                                        
                                                        if (isIncomingThis) {
                                                            return (
                                                                <Button 
                                                                    onClick={() => {
                                                                        setAutoAcceptCall(true);
                                                                        setActiveChatBooking(booking);
                                                                    }}
                                                                    className="h-8 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[9px] rounded-xl transition-all shadow-md animate-pulse flex items-center justify-center gap-1.5 px-3"
                                                                >
                                                                    <Video className="h-3 w-3 shrink-0 animate-bounce" />
                                                                    Receive Call
                                                                </Button>
                                                            );
                                                        }
                                                        
                                                        if (isActiveCallThis) {
                                                            return (
                                                                <Button 
                                                                    onClick={() => setActiveChatBooking(booking)}
                                                                    className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[9px] rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 px-3"
                                                                >
                                                                    <span className="relative flex h-1.5 w-1.5">
                                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                                                    </span>
                                                                    On Call (Tap)
                                                                </Button>
                                                            );
                                                        }
                                                        
                                                        return (
                                                            <Button 
                                                                onClick={() => setActiveChatBooking(booking)}
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="h-8 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-500 hover:text-indigo-600 font-black uppercase tracking-widest text-[9px] rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 px-3 group/btn"
                                                            >
                                                                <Video className="h-3 w-3 shrink-0 text-slate-400 group-hover/btn:text-indigo-500 transition-colors" />
                                                                Connect Now
                                                            </Button>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                            <div className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 group-hover:bg-red-50 group-hover:text-red-500 transition-all">
                                                <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                preSelectedService="road"
            />

            <ComingSoonToast
                isOpen={toastOpen}
                onClose={hideToast}
            />



            {selectedProfile && (
                <UserProfileModal 
                    isOpen={!!selectedProfile} 
                    onClose={() => setSelectedProfile(null)} 
                    userId={selectedProfile.userId}
                />
            )}
        </div>
    );
};

export default UserDashboard;




