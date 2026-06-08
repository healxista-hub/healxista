import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Ambulance,
    Search,
    MapPin,
    Radio,
    CheckCircle,
    XCircle,
    Clock,
    Phone,
    Navigation,
    Trash2,
    Eye,
    Download
} from 'lucide-react';
import { exportToCSV } from '@/utils/exportUtils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import ProfileViewModal from '@/components/ProfileViewModal';

const AmbulanceManagement = () => {
    const { token, logout } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDriver, setSelectedDriver] = useState(null);

    useEffect(() => {
        const fetchDrivers = async () => {
            try {
                const hostname = window.location.hostname;
                const res = await fetch(`/api/admin/records/ambulance`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setDrivers(data);
                } else if (res.status === 401 || res.status === 403) {
                    toast.error("Session expired. Please log in again.");
                    logout();
                } else {
                    toast.error("Failed to load driver/ambulance records.");
                }
            } catch (err) {
                console.error(err);
                toast.error("Server error while fetching drivers.");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchDrivers();
        }
    }, [token]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this ambulance driver?")) return;

        try {
            const hostname = window.location.hostname;
            const res = await fetch(`/api/admin/records/ambulance/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                setDrivers(drivers.filter(driver => driver.id !== id));
                toast.success("Driver record removed successfully.");
            } else if (res.status === 401 || res.status === 403) {
                toast.error("Session expired. Please log in again.");
                logout();
            } else {
                toast.error("Failed to delete record.");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred during deletion.");
        }
    };

    const handleVerify = async (id, currentStatus) => {
        try {
            const hostname = window.location.hostname;
            const res = await fetch(`/api/admin/records/ambulance/${id}/verify`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({ is_verified: !currentStatus })
            });

            if (res.ok) {
                const { data } = await res.json();
                setDrivers(drivers.map(driver => driver.id === id ? { ...driver, is_verified: data.is_verified } : driver));
                toast.success(`Ambulance driver ${!currentStatus ? 'verified' : 'unverified'} successfully.`);
            } else {
                toast.error("Failed to update status.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Server error");
        }
    };

    const filteredAmbulances = drivers.filter(
        (amb) =>
            (filterStatus === 'All' || (amb.status || 'Available') === filterStatus) &&
            ((amb.name && amb.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (amb.vehicle_number && amb.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    const getStatusColor = (status) => {
        const colors = {
            Available: 'bg-green-100 text-green-700',
            'On Route': 'bg-orange-100 text-orange-700',
            Busy: 'bg-red-100 text-red-700',
            Maintenance: 'bg-gray-100 text-gray-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusIcon = (status) => {
        if (status === 'Available') return <CheckCircle className="h-4 w-4" />;
        if (status === 'On Route') return <Radio className="h-4 w-4" />;
        if (status === 'Busy') return <XCircle className="h-4 w-4" />;
        return <Clock className="h-4 w-4" />;
    };

    return (
        <div className="space-y-8 pb-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
            >
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Ambulance <span className="text-red-600">Management</span></h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Real-time Ambulance Network oversight</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => exportToCSV(drivers, 'Ambulances_List')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors shadow-sm border border-indigo-100 font-black uppercase tracking-widest text-[11px]"
                    >
                        <Download className="h-4 w-4" /> Download
                    </button>
                    <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200">
                        <Radio className="h-5 w-5 text-red-500 animate-pulse" />
                        <span className="text-[11px] font-black uppercase tracking-widest">
                            {drivers.filter(a => (a.status || 'Available') === 'Available').length} Units Active
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Stats Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
                {[
                    { label: 'Total Fleet', value: drivers.length, icon: Ambulance, color: 'text-slate-900' },
                    { label: 'Ready for Service', value: drivers.filter((a) => (a.status || 'Available') === 'Available').length, icon: CheckCircle, color: 'text-emerald-500' },
                    { label: 'Units on Mission', value: drivers.filter((a) => a.status === 'On Route').length, icon: Navigation, color: 'text-blue-500' },
                    { label: 'Critical Response', value: drivers.filter((a) => a.status === 'Busy').length, icon: Radio, color: 'text-red-600' },
                    { label: 'In Maintenance', value: drivers.filter((a) => a.status === 'Maintenance').length, icon: Clock, color: 'text-amber-500' },
                ].map((stat, i) => (
                    <motion.div
                        whileHover={{ y: -5 }}
                        key={i}
                        className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group"
                    >
                        <div className={`p-3 bg-slate-50 rounded-2xl mb-4 group-hover:scale-110 transition-transform ${stat.color}`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <p className={`text-3xl font-black ${stat.color}`}>{loading ? '-' : stat.value}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Search & Intelligence Controls */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm"
            >
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                        <Input
                            placeholder="Search by Vehicle Number or Commander Name..."
                            className="h-14 pl-14 pr-6 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-red-500/20 font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-black placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['All', 'Available', 'On Route', 'Busy'].map((status) => (
                            <Button
                                key={status}
                                variant="ghost"
                                onClick={() => setFilterStatus(status)}
                                className={`h-14 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === status ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                            >
                                {status}
                            </Button>
                        ))}
                    </div>
                </div>
            </motion.div>

            <div className="grid gap-6">
                {loading ? (
                    <div className="p-12 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Syncing Fleet Status...</div>
                ) : filteredAmbulances.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No active units found.</div>
                ) : (
                    filteredAmbulances.map((amb) => {
                        const currentStatus = amb.status || 'Available';
                        return (
                            <motion.div
                                layout
                                key={amb.id}
                                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                            >
                                <div className="p-6 md:p-8">
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="h-20 w-20 rounded-[2rem] bg-slate-900 border border-slate-800 flex items-center justify-center shadow-xl shadow-slate-200 group-hover:scale-105 transition-transform">
                                                <Ambulance className="h-10 w-10 text-red-500" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{amb.vehicle_number || 'UNIT-UNIDENTIFIED'}</h3>
                                                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${amb.is_verified ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                        {amb.is_verified ? 'Certified' : 'Pending'}
                                                    </span>
                                                </div>
                                                <p className="text-slate-500 font-bold text-sm">Commander: <span className="text-slate-800 uppercase">{amb.name}</span></p>
                                                <div className="flex items-center gap-4 mt-3">
                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                                        <MapPin className="h-3.5 w-3.5 text-red-500" />
                                                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{amb.address || 'Unknown Sector'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{amb.mobile || 'SECURE-LINE'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:items-end gap-4 w-full md:w-auto">
                                            <div className="flex items-center gap-3">
                                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-sm ${getStatusColor(currentStatus)}`}>
                                                    {getStatusIcon(currentStatus)}
                                                    {currentStatus}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-2 items-center">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleVerify(amb.id, amb.is_verified)}
                                                    className={`h-11 px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${amb.is_verified ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-100'}`}
                                                >
                                                    {amb.is_verified ? 'Unverify' : 'Verify'}
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-11 px-5 rounded-2xl bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                                    onClick={() => setSelectedDriver(amb)}
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    <span className="font-black uppercase tracking-widest text-[10px]">Details</span>
                                                </Button>

                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-11 w-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                    onClick={() => handleDelete(amb.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })
                )}
            </div>

            <ProfileViewModal
                isOpen={!!selectedDriver}
                onClose={() => setSelectedDriver(null)}
                profile={selectedDriver}
                title="Ambulance Driver Details"
            />
        </div>
    );
};

export default AmbulanceManagement;


