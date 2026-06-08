import React, { useState, useEffect } from 'react';
import { Activity, Clock, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';

const iconMap = {
    info: Info,
    success: CheckCircle,
    warning: AlertCircle,
    active: Activity
};

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
    return "Just now";
};

const UserActivity = () => {
    const { token } = useAuth();
    const socket = useSocket();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

        useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch(`/api/activity`, {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    setLogs(data);
                }
            } catch (err) {
                console.error("Failed to fetch logs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    useEffect(() => {
        if (!socket) return;
        
        socket.on('new_activity', (newLog) => {
            setLogs((prev) => [newLog, ...prev]);
        });

        return () => {
            socket.off('new_activity');
        };
    }, [socket]);

    return (
        <div className="space-y-4 md:space-y-5">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Recent Activity</h1>
                <p className="text-muted-foreground">Track your recent bookings, appointments, and application usage.</p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="space-y-8">
                    {loading ? (
                        <div className="text-center py-10 text-muted-foreground">Loading activity history...</div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">No recent activity found. Make a booking to get started!</div>
                    ) : (
                        <div className="relative pl-6 after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-slate-200">
                            <div className="grid gap-6">
                                {logs.map((log) => {
                                    const ItemIcon = iconMap[log.status_theme] || Info;
                                    return (
                                        <div key={log.log_id} className="relative animate-in slide-in-from-top-2">
                                            <div className="absolute -left-[2.35rem] rounded-full bg-slate-50 p-2 outline outline-4 outline-white z-10 shadow-sm border border-slate-200">
                                                <ItemIcon className={`h-4 w-4 ${log.status_theme === 'success' ? 'text-green-500' : log.status_theme === 'active' ? 'text-red-500' : log.status_theme === 'warning' ? 'text-amber-500' : 'text-blue-500'}`} />
                                            </div>
                                            <div className="flex flex-col gap-1 ml-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-slate-800 text-base">{log.title}</span>
                                                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest bg-white px-2 py-1 rounded-md shadow-sm">
                                                        <Clock className="w-3 h-3" /> {timeAgo(log.created_at)}
                                                    </span>
                                                </div>
                                                <p className="text-sm mt-1 text-slate-500 font-medium leading-relaxed">{log.description}</p>
                                                <div className="mt-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-200/50 px-2.5 py-1 rounded-lg">
                                                        {log.action_type}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserActivity;



