import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
    Activity, Calendar, Users, HeartPulse, Stethoscope, 
    ArrowRight, MessageCircle, BarChart3, TrendingUp, 
    ShieldCheck, Zap, ClipboardList, Clock, Sparkles,
    Paperclip, Download, Trash2, Upload, User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useChatCall } from '@/context/ChatCallContext';
import { fetchApi, getDocUrl } from '@/utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UserProfileModal from '@/components/UserProfileModal';
import SharedBookingsList from '@/components/SharedBookingsList';

const PhysiotherapyDashboard = () => {
    const { user, token } = useAuth();
    const [stats, setStats] = useState({ total: 0, accepted: 0, cancelled: 0, pending: 0, byDayTrend: [] });
    const [loading, setLoading] = useState(true);
    const { activeChatBooking, setActiveChatBooking } = useChatCall();
    const [selectedProfile, setSelectedProfile] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            try {
                const statsData = await fetchApi(`/api/bookings/my-stats`);
                if (statsData) setStats(statsData);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [user]);

    // Feed for upcoming sessions
    const [upcomingSessionsFeed, setUpcomingSessionsFeed] = useState([]);
    useEffect(() => {
        fetchApi(`/api/bookings/assigned`).then(data => {
            if (data) setUpcomingSessionsFeed(Array.isArray(data) ? data.slice(0, 5) : []);
        });
    }, [user]);

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8 pb-12">
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 bg-white"
            >
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-red-950 to-red-900" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 hidden md:block" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(225,29,72,0.15),transparent)]" />
                </div>
                
                <div className="relative p-6 md:p-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div className="text-white space-y-6 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-[0.2em]">
                            <Sparkles className="h-4 w-4 text-red-400" /> Rehabilitation Expert
                        </div>
                        <h1 className="text-3xl md:text-6xl font-black tracking-tight leading-none text-white">
                            {user?.name || 'Physio'} <span className="text-red-500">Center</span>
                        </h1>
                        <p className="text-red-100/80 text-lg md:text-2xl max-w-xl leading-relaxed font-medium">
                            Empowering recovery through data-driven therapy. Manage patient schedules and track rehabilitation milestones.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <div className="flex flex-col">
                                <span className="text-red-400/60 text-[10px] font-black uppercase tracking-[0.15em]">Provider ID</span>
                                <span className="text-white font-bold">{user?.customId || 'PHY-7711'}</span>
                            </div>
                            <div className="h-8 w-px bg-white/20 self-end mb-1" />
                            <div className="flex flex-col">
                                <span className="text-red-400/60 text-[10px] font-black uppercase tracking-[0.15em]">Clinical Status</span>
                                <span className="text-white font-bold flex items-center gap-2">
                                     <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span> Active & Online
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white border-slate-100 shadow-sm hover:shadow-xl transition-all group rounded-3xl overflow-hidden p-5 md:p-6 border-l-4 border-l-red-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-red-50 rounded-2xl text-red-600 group-hover:rotate-12 transition-transform">
                            <Calendar className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <h4 className="text-4xl font-black text-slate-800">{stats.total}</h4>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Lifetime Bookings</p>
                </Card>

                <Card className="bg-white border-slate-100 shadow-sm hover:shadow-xl transition-all group rounded-3xl overflow-hidden p-6 border-l-4 border-l-emerald-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:rotate-12 transition-transform">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                    </div>
                    <h4 className="text-4xl font-black text-slate-800">{stats.accepted}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Sessions Completed</p>
                </Card>

                <Card className="bg-white border-slate-100 shadow-sm hover:shadow-xl transition-all group rounded-3xl overflow-hidden p-6 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:rotate-12 transition-transform">
                            <Clock className="h-6 w-6" />
                        </div>
                    </div>
                    <h4 className="text-4xl font-black text-slate-800">{stats.pending}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Active Cases</p>
                </Card>

                <Card className="bg-slate-900 border-slate-800 shadow-lg group rounded-3xl overflow-hidden p-6 text-white text-center">
                    <h4 className="text-4xl font-black text-rose-500">{stats.cancelled}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Cancelled Efforts</p>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Patient Recovery Chart */}
                <Card className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col p-8 md:p-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 pb-6 border-b border-slate-50">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                                <Activity className="h-6 w-6 text-red-600" /> Rehabilitation Impact
                            </h3>
                            <p className="text-sm text-slate-400 font-bold tracking-widest uppercase mt-1">7-Day Therapy Session Volume</p>
                        </div>
                    </div>
                    <div className="flex-1 h-64 md:h-80 w-full">
                         {stats.byDayTrend && stats.byDayTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.byDayTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748b'}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748b'}} allowDecimals={false} />
                                    <Tooltip cursor={{stroke: '#e11d48', strokeWidth: 2}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.05)'}} />
                                    <Area type="monotone" dataKey="count" stroke="#e11d48" strokeWidth={4} fillOpacity={1} fill="url(#colorProgress)" />
                                </AreaChart>
                            </ResponsiveContainer>
                         ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-3 border-2 border-dashed border-slate-100 rounded-3xl">
                                <Activity className="h-12 w-12 opacity-10" />
                                <p className="text-sm font-bold uppercase tracking-widest">Awaiting therapy activity data...</p>
                            </div>
                         )}
                    </div>
                </Card>

                {/* Operations & Schedule */}
                <div className="space-y-8">
                    <Card className="bg-gradient-to-br from-red-600 to-rose-700 rounded-[2.5rem] shadow-2xl p-8 text-white relative overflow-hidden">
                         <div className="absolute -right-4 -top-4 opacity-20">
                            <HeartPulse className="h-48 w-48 text-white" />
                         </div>
                         <div className="relative z-10 space-y-6">
                            <h3 className="text-2xl font-black flex items-center gap-3">
                                <ShieldCheck className="h-7 w-7 text-white" /> Clinical Trust
                            </h3>
                            <p className="text-red-50/80 text-lg leading-relaxed font-medium">
                               Your professional expertise is verified. All sessions are monitored for quality assurance and patient safety.
                            </p>
                            <div className="pt-4 border-t border-white/10 flex items-center gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-black">{stats.accepted}</p>
                                    <p className="text-[10px] font-bold text-red-100/60 uppercase tracking-widest">Successes</p>
                                </div>
                                <div className="h-10 w-px bg-white/10" />
                                <div className="text-center">
                                    <p className="text-2xl font-black">{stats.total}</p>
                                    <p className="text-[10px] font-bold text-red-100/60 uppercase tracking-widest">Total Cases</p>
                                </div>
                            </div>
                         </div>
                    </Card>

                    {/* Upcoming Focus Feed */}
                    <Card className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[400px]">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="font-black text-slate-800 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-indigo-500" /> Queue Manager
                            </h3>
                            <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">{upcomingSessionsFeed.length} BOOKINGS</span>
                        </div>
                        <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[300px]">
                            {loading ? (
                                <div className="flex justify-center p-8 text-slate-400">Loading...</div>
                            ) : upcomingSessionsFeed.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 gap-2">
                                    <Activity className="h-8 w-8 opacity-20" />
                                    <p className="text-xs font-bold">No sessions pending.</p>
                                </div>
                            ) : (
                                upcomingSessionsFeed.map(session => (
                                    <div key={session.booking_id} className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl hover:scale-[1.02] transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-indigo-600 overflow-hidden shrink-0">
                                                {session.user_profile_image ? (
                                                    <img src={`/uploads/${session.user_profile_image}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    session.userName?.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800">{session.userName}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                                    {new Date(session.scheduled_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                </p>
                                            </div>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl bg-white text-indigo-600 hover:bg-indigo-50 shadow-sm" onClick={() => setActiveChatBooking(session)}>
                                            <MessageCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Comprehensive Log Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden p-2 md:p-8 lg:p-10">
                <SharedBookingsList 
                    userRole="provider" 
                    title="Therapy Appointment Log" 
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

export default PhysiotherapyDashboard;



