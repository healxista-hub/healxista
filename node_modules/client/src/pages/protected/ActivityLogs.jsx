import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import {
    Activity,
    AlertCircle,
    CheckCircle,
    Info,
    Clock,
    User,
    FileText,
    HeartPulse,
    Download
} from 'lucide-react';
import { exportToCSV } from '@/utils/exportUtils';

const iconMap = {
    info: Info,
    success: CheckCircle,
    warning: AlertCircle,
    active: Activity
};

const statusStyles = {
    active: 'bg-red-100 text-red-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-blue-100 text-blue-700'
};

const iconBg = {
    active: 'bg-red-100 text-red-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-amber-100 text-amber-600',
    info: 'bg-blue-100 text-blue-600'
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

const AdminActivityLogs = () => {
    const { token } = useAuth();
    const socket = useSocket();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const hostname = window.location.hostname;
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Platform Activity Logs</h1>
                    <p className="text-muted-foreground">
                        Real-time monitoring of all platform events and bookings.
                    </p>
                </div>
                <button 
                    onClick={() => exportToCSV(logs, 'ActivityLogs_List')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors shadow-sm border border-indigo-100 font-black uppercase tracking-widest text-[11px]"
                >
                    <Download className="h-4 w-4" /> Download
                </button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-indigo-500" /> Live Feed
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 md:space-y-5">
                        {loading ? (
                            <div className="text-center py-10 text-muted-foreground">Loading activity history...</div>
                        ) : logs.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">No recent platform activity found.</div>
                        ) : (
                            logs.map((item, index) => {
                                const ItemIcon = iconMap[item.status_theme] || Info;
                                return (
                                    <div key={item.log_id} className="relative flex gap-4 animate-in slide-in-from-top-2 duration-300">
                                        {index !== logs.length - 1 && (
                                            <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border" />
                                        )}
                                        <div className={`h-10 w-10 min-w-10 rounded-full flex items-center justify-center ${iconBg[item.status_theme] || iconBg.info}`}>
                                            <ItemIcon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="border rounded-2xl p-4 shadow-sm bg-white hover:bg-slate-50 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-semibold text-slate-800">{item.title}</h3>
                                                    <span className="text-xs flex items-center gap-1 text-muted-foreground font-medium bg-slate-100 px-2 py-1 rounded-md">
                                                        <Clock className="h-3 w-3" /> {timeAgo(item.created_at)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 mt-1 font-medium">
                                                    {item.description}
                                                </p>
                                                <div className="flex items-center justify-between flex-wrap gap-2 mt-3">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-widest ${statusStyles[item.status_theme] || statusStyles.info}`}>
                                                        {item.action_type}
                                                    </span>
                                                    {item.account_id && (
                                                        <span className="text-xs flex items-center gap-1 text-slate-500 font-medium bg-slate-50 border px-2 py-1 rounded-md">
                                                            <User className="h-3 w-3" />
                                                            {item.first_name ? `${item.first_name} ${item.last_name || ''}`.trim() + ` (${item.account_id})` : `User ID: ${item.account_id}`}
                                                            {item.role_name ? ` • ${item.role_name}` : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminActivityLogs;



