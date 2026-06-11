import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, LogOut, Edit, Key, Search, User, Mail, Phone, MapPin, Briefcase, FileText, Activity, Save, X, DownloadCloud, Users as UsersIcon, Stethoscope, ShieldAlert, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const SuperAdminDashboard = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modals
    const [editUser, setEditUser] = useState(null); // stores full profile data
    const [passwordUser, setPasswordUser] = useState(null);

    // Password form state
    const [newPassword, setNewPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!user || (user.role !== 'Super Admin' && user.role !== 'super_admin')) {
            navigate('/');
            return;
        }
        fetchUsers();
    }, [user, navigate]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/superadmin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                toast.error("Failed to fetch users");
            }
        } catch (err) {
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const openFullEditModal = async (accountId) => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/superadmin/users/${accountId}/full-profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Ensure nulls are empty strings for controlled inputs
                const cleanData = Object.keys(data).reduce((acc, key) => {
                    acc[key] = data[key] === null ? '' : data[key];
                    return acc;
                }, {});
                // Fix boolean fields explicitly
                cleanData.is_verified = data.is_verified || false;
                cleanData.lt_home = data.lt_home || false;
                setEditUser(cleanData);
            } else {
                toast.error("Failed to fetch full profile");
            }
        } catch (err) {
            toast.error("Network error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditUser(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch(`/api/superadmin/users/${editUser.account_id}/full-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editUser)
            });
            if (res.ok) {
                toast.success('Full Profile updated successfully');
                setEditUser(null);
                fetchUsers();
            } else {
                toast.error('Failed to update full profile');
            }
        } catch (err) {
            toast.error('Connection error');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) return toast.error("Password too short");
        setIsSaving(true);
        try {
            const res = await fetch(`/api/superadmin/users/${passwordUser.account_id}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newPassword })
            });
            if (res.ok) {
                toast.success('Password forcefully reset');
                setPasswordUser(null);
                setNewPassword('');
            } else {
                toast.error('Failed to reset password');
            }
        } catch (err) {
            toast.error('Connection error');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredUsers = users.filter(u => 
        (u.first_name + ' ' + u.last_name).toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.role_name && u.role_name.toLowerCase().includes(search.toLowerCase())) ||
        (u.custom_id && u.custom_id.toLowerCase().includes(search.toLowerCase()))
    );

    // Derived Metrics
    const totalUsers = users.length;
    const totalProviders = users.filter(u => ['Doctor', 'Driver', 'Medicine Store', 'Physiotherapy', 'Old Age Home', 'Lab Test', 'Home Care'].includes(u.role_name)).length;
    const activeAdmins = users.filter(u => ['Admin', 'Super Admin', 'super_admin'].includes(u.role_name)).length;
    const recentJoins = users.filter(u => (new Date() - new Date(u.created_at)) / (1000 * 60 * 60 * 24) <= 7).length;

    const roleCounts = users.reduce((acc, user) => {
        acc[user.role_name] = (acc[user.role_name] || 0) + 1;
        return acc;
    }, {});

    const chartData = Object.keys(roleCounts).map(role => ({
        name: role,
        count: roleCounts[role]
    })).sort((a, b) => b.count - a.count);

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#0ea5e9'];

    
    return (
        <div className="min-h-screen bg-slate-50 pb-12 pt-4 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100 shrink-0">
                            <ShieldCheck className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Super <span className="text-indigo-600">Admin</span></h1>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Master Data Manipulation & Override</p>
                        </div>
                    </div>
                                    </motion.div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Users', value: totalUsers, icon: UsersIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                        { label: 'Service Providers', value: totalProviders, icon: Stethoscope, color: 'text-pink-600', bg: 'bg-pink-50' },
                        { label: 'Active Admins', value: activeAdmins, icon: ShieldAlert, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Recent Joins (7d)', value: recentJoins, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' }
                    ].map((metric, i) => (
                        <motion.div 
                            key={metric.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4"
                        >
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${metric.bg}`}>
                                <metric.icon className={`h-6 w-6 ${metric.color}`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{metric.label}</p>
                                <p className="text-2xl font-black text-slate-800">{metric.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Chart */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-slate-800">Role Distribution</h2>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg flex items-center gap-1.5">
                            <Activity className="h-3 w-3" /> Live Data
                        </span>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="count" radius={[6, 6, 6, 6]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                

            </div>

            

            

        </div>
    );
};

export default SuperAdminDashboard;
