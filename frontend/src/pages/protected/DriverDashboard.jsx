import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Navigation, MapPin, Clock, CheckCircle, Ambulance, PhoneCall, 
    AlertCircle, MessageCircle, BarChart3, TrendingUp, ShieldCheck, 
    Fuel, Gauge, Zap, Bell, ArrowRight, ClipboardList
} from 'lucide-react';
import { useChatCall } from '@/context/ChatCallContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import SharedBookingsList from '@/components/SharedBookingsList';

const DriverDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ total: 0, accepted: 0, cancelled: 0, pending: 0, byDayTrend: [] });
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [isOnline, setIsOnline] = useState(false);
    const { activeChatBooking, setActiveChatBooking } = useChatCall();

    const fetchDashboardData = async () => {
        try {
            const statsData = await fetchApi(`/api/bookings/my-stats`);
            if (statsData) setStats(statsData);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoadingTasks(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchDashboardData();
            // Fetch profile for online status
            fetchApi(`/api/profile/${user.id}`).then(data => {
                if (data) setIsOnline(data.is_online || false);
            });
            const interval = setInterval(fetchDashboardData, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleToggleOnline = async (val) => {
        try {
            const res = await fetchApi(`/api/profile/${user.id}/availability`, {
                method: 'PUT',
                body: JSON.stringify({ is_online: val })
            });
            if (res) {
                setIsOnline(val);
                toast.success(`You are now ${val ? 'Online' : 'Offline'}`);
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    // Feed for new tasks
    const [tasksFeed, setTasksFeed] = useState([]);
    useEffect(() => {
        fetchApi(`/api/bookings/assigned`).then(data => {
            if (data) setTasksFeed(Array.isArray(data) ? data.filter(t => !['Cancelled', 'Completed', 'Rejected'].includes(t.status)).slice(0, 5) : []);
        });
    }, [user]);

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8 relative">
            
            {/* Modern Hero Welcome Banner */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-3xl overflow-hidden shadow-2xl border border-rose-100 bg-white"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-red-900 to-rose-900" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 hidden md:block" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)]" />
                
                <div className="relative p-6 md:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div className="text-white space-y-5 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest">
                            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Responder Verified
                        </div>
                        <h1 className="text-3xl md:text-6xl font-black tracking-tight leading-none text-white">
                            Ready for duty, {user?.name || 'Responder'}?
                        </h1>
                        <p className="text-rose-100/90 text-lg md:text-2xl max-w-xl leading-relaxed font-medium">
                            Manage your fleet, track earnings, and respond to emergencies in real-time.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <div className="flex flex-col">
                                <span className="text-rose-300 text-[10px] font-bold uppercase tracking-widest">Vehicle ID</span>
                                <span className="text-white font-bold">{user?.customId || 'AMB-772'}</span>
                            </div>
                            <div className="h-8 w-px bg-white/20 self-end mb-1" />
                            <div className="flex flex-col">
                                <span className="text-rose-300 text-[10px] font-bold uppercase tracking-widest">Shift Status</span>
                                <span className={`font-bold flex items-center gap-1.5 transition-colors ${isOnline ? 'text-emerald-400' : 'text-slate-400'}`}>
                                    <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                                    {isOnline ? 'On Duty' : 'Off Duty'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <Card className="flex-shrink-0 w-full lg:w-auto bg-white/10 backdrop-blur-xl border border-white/20 p-5 md:p-8 rounded-3xl shadow-2xl">
                        <div className="flex items-center justify-between lg:justify-start gap-10">
                            <Label htmlFor="status-toggle" className="flex flex-col space-y-1 cursor-pointer">
                                <span className="font-black text-white text-xl md:text-2xl">Duty Status</span>
                                <span className="font-bold text-sm text-rose-200">{isOnline ? 'Active on map' : 'Hidden from system'}</span>
                            </Label>
                            <Switch id="status-toggle" checked={isOnline} onCheckedChange={handleToggleOnline} className="scale-150 data-[state=checked]:bg-emerald-400 transition-all shadow-lg" />
                        </div>
                    </Card>
                </div>
            </motion.div>

            {/* Performance Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden border-l-4 border-l-red-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-red-50 rounded-2xl text-red-600 group-hover:scale-110 transition-transform">
                                <Bell className="h-6 w-6" />
                            </div>
                            <span className="text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-full">ACTIVE</span>
                        </div>
                        <h4 className="text-3xl font-black text-slate-800">{tasksFeed.length}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Pending Alerts</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden border-l-4 border-l-emerald-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">SUCCESS</span>
                        </div>
                        <h4 className="text-3xl font-black text-slate-800">{stats.accepted}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Completed Trips</p>
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
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Pending Review</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 shadow-lg group rounded-3xl overflow-hidden p-6 text-white text-center">
                    <h4 className="text-3xl font-black">{stats.total}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Lifetime Responses</p>
                    <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div initial={{width:0}} animate={{width:'75%'}} className="h-full bg-red-500" />
                    </div>
                </Card>
            </div>

            {/* Dashboard Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 pb-10">
                
                {/* Active Assignments Card */}
                <Card className="xl:col-span-1 shadow-sm border-gray-100 flex flex-col min-h-[500px] bg-white rounded-3xl overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 px-6 py-5">
                        <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-800">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                            Duty Queue
                            {tasksFeed.length > 0 && (
                                <span className="ml-auto bg-red-100 text-red-700 py-1 px-3 rounded-xl text-xs font-black animate-pulse">
                                    {tasksFeed.length} NEW
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-h-[400px]">
                        {loadingTasks ? (
                            <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                            </div>
                        ) : tasksFeed.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                                <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                                    <Clock className="h-10 w-10 text-slate-300" />
                                </div>
                                <p className="text-slate-800 font-bold">Waiting for dispatches...</p>
                                <p className="text-xs text-slate-400 font-medium max-w-[200px]">Keep your duty toggle ON to receive nearby emergency requests.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tasksFeed.map(task => (
                                    <motion.div 
                                        key={task.booking_id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 hover:border-red-100 transition-all group"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center font-black text-rose-600 border border-rose-100 shadow-sm overflow-hidden shrink-0">
                                                    {task.user_profile_image ? (
                                                        <img src={`/uploads/${task.user_profile_image}`} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        task.userName?.charAt(0) || 'E'
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 text-lg">{task.userName || 'Emergency'}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">#ID-{String(task.booking_id).substring(0,8)}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="ghost" className="h-9 w-9 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl" onClick={() => setActiveChatBooking(task)}>
                                                    <MessageCircle className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                                                    <MapPin className="h-4 w-4" />
                                                </div>
                                                <p className="text-xs font-bold text-slate-600">{task.pickup_location}</p>
                                            </div>
                                            <Button className="w-full bg-slate-900 border-none rounded-xl h-10 font-bold text-xs" onClick={() => toast.info("Opening Navigation UI...")}>
                                                Start Navigation <Navigation className="ml-2 h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Performance & Earnings Section */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Activity Analytics Card */}
                    <Card className="shadow-lg border-slate-100 bg-white rounded-3xl overflow-hidden flex flex-col min-h-[300px]">
                        <CardHeader className="border-b border-slate-50 px-8 py-5 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
                                    <BarChart3 className="h-6 w-6 text-red-600" /> Dispatch Activity
                                </CardTitle>
                                <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-1">7-Day Response Trends</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-red-600">{stats.accepted}</p>
                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Successful Missions</p>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 h-64 md:h-80">
                            {stats.byDayTrend && stats.byDayTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.byDayTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} stroke="#cbd5e1" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748b'}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748b'}} allowDecimals={false} />
                                        <Tooltip 
                                            cursor={{fill: '#fef2f2', radius: 8}} 
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}
                                        />
                                        <Bar dataKey="count" fill="#e11d48" radius={[8, 8, 0, 0]} barSize={32} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-3 border-2 border-dashed border-slate-100 rounded-3xl">
                                    <Ambulance className="h-12 w-12 opacity-10" />
                                    <p className="text-sm font-bold tracking-widest uppercase">Awaiting activity data...</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Diagnostics and Shifts Bottom Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="bg-gradient-to-br from-red-600 to-rose-700 rounded-[2.5rem] shadow-2xl p-8 text-white relative overflow-hidden lg:col-span-2">
                             <div className="absolute -right-4 -top-4 opacity-20">
                                <Ambulance className="h-64 w-64 text-white" />
                             </div>
                             <div className="relative z-10 space-y-6">
                                <h3 className="text-3xl font-black flex items-center gap-3">
                                    <ShieldCheck className="h-8 w-8 text-white" /> Mission Statistics
                                </h3>
                                <p className="text-red-50/80 text-xl leading-relaxed font-medium">
                                   Your response efficiency is helping save lives. Keep your duty toggle active to minimize patient wait times across the city.
                                </p>
                                <div className="pt-6 border-t border-white/10 flex flex-wrap gap-8">
                                    <div className="text-left">
                                        <p className="text-4xl font-black">{stats.accepted}</p>
                                        <p className="text-xs font-bold text-red-100/60 uppercase tracking-widest mt-1">Successful Trips</p>
                                    </div>
                                    <div className="h-16 w-px bg-white/10 hidden sm:block" />
                                    <div className="text-left">
                                        <p className="text-4xl font-black">{stats.total}</p>
                                        <p className="text-xs font-bold text-red-100/60 uppercase tracking-widest mt-1">Total Dispatches</p>
                                    </div>
                                    <div className="h-16 w-px bg-white/10 hidden md:block" />
                                    <div className="text-left">
                                        <p className="text-4xl font-black text-emerald-400">100%</p>
                                        <p className="text-xs font-bold text-red-100/60 uppercase tracking-widest mt-1">SLA Compliance</p>
                                    </div>
                                </div>
                             </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Final Dispatch Log Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-2 md:p-8">
                <SharedBookingsList 
                    userRole="provider" 
                    title="Mission & Dispatch History" 
                    icon={Ambulance} 
                />
            </div>
            

        </div>
    );
};

export default DriverDashboard;



