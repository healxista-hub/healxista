import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
    Beaker, FileText, FlaskConical, ClipboardCheck, 
    AlertTriangle, MessageCircle, BarChart3, TrendingUp, 
    Zap, Microscope, Thermometer, ShieldCheck, ArrowRight, Activity, HeartHandshake, Home,
    Paperclip, Download, Trash2, Upload, User, ClipboardList
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useChatCall } from '@/context/ChatCallContext';
import { fetchApi, getDocUrl } from '@/utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UserProfileModal from '@/components/UserProfileModal';
import SharedBookingsList from '@/components/SharedBookingsList';

const HomeCareDashboard = () => {
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

    // Feed for the mini-queue
    const [pendingOrdersFeed, setPendingOrdersFeed] = useState([]);
    useEffect(() => {
        fetchApi(`/api/bookings/assigned`).then(data => {
            if (data) setPendingOrdersFeed(Array.isArray(data) ? data.filter(o => o.status === 'Pending').slice(0, 5) : []);
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
                            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Verified Care Provider
                        </div>
                        <h1 className="text-3xl md:text-6xl font-black tracking-tight leading-none text-white">
                            {user?.name || 'Home Care'} <span className="text-red-500">Operations</span>
                        </h1>
                        <p className="text-red-100/80 text-lg md:text-2xl max-w-xl leading-relaxed font-medium">
                            Monitoring your caregiving schedules, patient well-being, and appointments in real-time.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <div className="flex flex-col">
                                <span className="text-red-400/60 text-[10px] font-black uppercase tracking-[0.15em]">Caregiver ID</span>
                                <span className="text-white font-bold">{user?.customId || 'HOM-X821'}</span>
                            </div>
                            <div className="h-8 w-px bg-white/20 self-end mb-1" />
                            <div className="flex flex-col">
                                <span className="text-red-400/60 text-[10px] font-black uppercase tracking-[0.15em]">System Status</span>
                                <span className="text-white font-bold flex items-center gap-2">
                                     <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span> Operational
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Diagnostics Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white border-slate-100 shadow-sm hover:shadow-xl transition-all group rounded-3xl overflow-hidden p-5 md:p-6 border-l-4 border-l-red-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-red-50 rounded-2xl text-red-600 group-hover:rotate-12 transition-transform">
                            <HeartHandshake className="h-6 w-6" />
                        </div>
                        <Activity className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="flex items-baseline gap-1">
                        <h4 className="text-4xl font-black text-slate-800">{stats.total}</h4>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Lifetime Orders</p>
                </Card>

                <Card className="bg-white border-slate-100 shadow-sm hover:shadow-xl transition-all group rounded-3xl overflow-hidden p-6 border-l-4 border-l-emerald-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:rotate-12 transition-transform">
                            <ClipboardCheck className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <h4 className="text-4xl font-black text-slate-800">{stats.accepted}</h4>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Active Care Plans</p>
                </Card>

                <Card className="bg-white border-slate-100 shadow-sm hover:shadow-xl transition-all group rounded-3xl overflow-hidden p-6 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:rotate-12 transition-transform">
                            <Zap className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <h4 className="text-4xl font-black text-slate-800">{stats.pending}</h4>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Active Queue</p>
                </Card>

                <Card className="bg-slate-900 border-slate-800 shadow-xl group rounded-3xl overflow-hidden p-6 text-white text-center">
                    <h4 className="text-4xl font-black text-rose-500">{stats.cancelled}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Cancelled Services</p>
                </Card>
            </div>

            {/* Main Lab Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Laboratory Throughput Chart */}
                <Card className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col p-8 md:p-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 pb-6 border-b border-slate-50">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                                <BarChart3 className="h-6 w-6 text-red-600" /> Care Service Throughput
                            </h3>
                            <p className="text-sm text-slate-400 font-bold tracking-widest uppercase mt-1">7-Day Service Volume</p>
                        </div>
                    </div>
                    <div className="flex-1 h-64 md:h-80 w-full">
                         {stats.byDayTrend && stats.byDayTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.byDayTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748b'}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748b'}} allowDecimals={false} />
                                    <Tooltip cursor={{fill: '#fef2f2'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.05)'}} />
                                    <Bar dataKey="count" fill="#e11d48" radius={[10, 10, 0, 0]} barSize={34} />
                                </BarChart>
                            </ResponsiveContainer>
                         ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-3 border-2 border-dashed border-slate-100 rounded-3xl">
                                <HeartHandshake className="h-12 w-12 opacity-10" />
                                <p className="text-sm font-bold uppercase tracking-widest">Awaiting service data...</p>
                            </div>
                         )}
                    </div>
                </Card>

                {/* Operations & Equipment */}
                <div className="space-y-8">
                    <Card className="bg-gradient-to-br from-red-600 to-rose-700 rounded-[2.5rem] shadow-2xl p-8 text-white relative overflow-hidden">
                         <div className="absolute -right-4 -top-4 opacity-20">
                            <Home className="h-48 w-48 text-white" />
                         </div>
                         <div className="relative z-10 space-y-6">
                            <h3 className="text-2xl font-black flex items-center gap-3">
                                <ShieldCheck className="h-7 w-7 text-white" /> Trusted Caregivers
                            </h3>
                            <p className="text-red-50/80 text-lg leading-relaxed font-medium">
                                Compassion and reliability are our pillars. All care plans are executed by verified nursing professionals.
                            </p>
                            <div className="pt-4 border-t border-white/10 flex items-center gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-black">{stats.accepted}</p>
                                    <p className="text-[10px] font-bold text-red-100/60 uppercase tracking-widest">Reports</p>
                                </div>
                                <div className="h-10 w-px bg-white/10" />
                                <div className="text-center">
                                    <p className="text-2xl font-black">{stats.total}</p>
                                    <p className="text-[10px] font-bold text-red-100/60 uppercase tracking-widest">Total Services</p>
                                </div>
                            </div>
                         </div>
                    </Card>

                    {/* Pending Queue Feed */}
                    <Card className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[400px]">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="font-black text-slate-800 flex items-center gap-2">
                                <ClipboardCheck className="h-5 w-5 text-indigo-500" /> Service Requests
                            </h3>
                            <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">{pendingOrdersFeed.length} PENDING</span>
                        </div>
                        <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[300px]">
                            {loading ? (
                                <div className="flex justify-center p-8 text-slate-400">Loading...</div>
                            ) : pendingOrdersFeed.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 gap-2">
                                    <ClipboardCheck className="h-8 w-8 opacity-20" />
                                    <p className="text-xs font-bold">Queue clear!</p>
                                </div>
                            ) : (
                                pendingOrdersFeed.map(order => (
                                    <div key={order.booking_id} className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl hover:scale-[1.02] transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-indigo-600 overflow-hidden shrink-0">
                                                {order.user_profile_image ? (
                                                    <img src={`/uploads/${order.user_profile_image}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    order.userName?.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800">{order.userName}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Req #{order.booking_id?.toString().slice(0,6)}</p>
                                            </div>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl bg-white text-indigo-600 hover:bg-indigo-50 shadow-sm" onClick={() => setActiveChatBooking(order)}>
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
                    title="Master Care Log" 
                    icon={HeartHandshake} 
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

export default HomeCareDashboard;



