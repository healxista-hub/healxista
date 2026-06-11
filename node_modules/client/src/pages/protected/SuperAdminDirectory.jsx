import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, LogOut, Edit, Key, Search, User, Mail, Phone, MapPin, Briefcase, FileText, Activity, Save, X, DownloadCloud, Users as UsersIcon, Stethoscope, ShieldAlert, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const SuperAdminDirectory = () => {
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

    const exportToCSV = () => {
        const headers = ['ID', 'Name', 'Email', 'Mobile', 'Role', 'Joined Date'];
        const csvContent = [
            headers.join(','),
            ...filteredUsers.map(u => [
                u.custom_id || `ID-${u.account_id}`,
                `"${u.first_name || ''} ${u.last_name || ''}"`,
                u.email,
                u.mobile || '',
                u.role_name,
                new Date(u.created_at).toLocaleDateString()
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `healxista_users_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Data <span className="text-indigo-600">Directory</span></h1>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Master Data Manipulation & Override</p>
                        </div>
                    </div>
                    <div className="flex gap-4 w-full sm:w-auto">
                        <Button 
                            onClick={exportToCSV}
                            variant="outline" 
                            className="flex-1 sm:flex-none h-12 px-6 rounded-2xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold flex items-center gap-2 transition-all shadow-sm"
                        >
                            <DownloadCloud className="h-5 w-5" /> Export CSV Data
                        </Button>
                    </div>
                </motion.div>

                {/* Main Content */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
                >
                    <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <User className="h-5 w-5 text-indigo-500" /> Platform User Directory
                        </h2>
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input 
                                placeholder="Search by name, email, ID, or role..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full h-12 pl-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-indigo-500/20 font-medium"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 text-[10px] uppercase tracking-widest font-black text-slate-400">
                                    <th className="p-4 pl-6 md:pl-8 font-bold border-b border-slate-100">ID</th>
                                    <th className="p-4 font-bold border-b border-slate-100">Name</th>
                                    <th className="p-4 font-bold border-b border-slate-100">Contact</th>
                                    <th className="p-4 font-bold border-b border-slate-100">Role</th>
                                    <th className="p-4 font-bold border-b border-slate-100">Joined</th>
                                    <th className="p-4 pr-6 md:pr-8 font-bold border-b border-slate-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-sm">
                                {loading ? (
                                    <tr><td colSpan="6" className="p-12 text-center text-slate-400 font-bold">Loading secure directory...</td></tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr><td colSpan="6" className="p-12 text-center text-slate-400 font-bold">No users found.</td></tr>
                                ) : (
                                    filteredUsers.map(u => (
                                        <tr key={u.account_id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 pl-6 md:pl-8 font-bold text-slate-500 text-xs">
                                                {u.custom_id || `ID-${u.account_id}`}
                                            </td>
                                            <td className="p-4">
                                                <span className="font-black text-slate-800 block">{u.first_name} {u.last_name}</span>
                                                {(!u.first_name && !u.last_name) && <span className="text-slate-400 italic text-xs">Name Not Set</span>}
                                            </td>
                                            <td className="p-4 text-xs font-medium text-slate-600">
                                                <div className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-slate-400" /> {u.email}</div>
                                                {u.mobile && <div className="flex items-center gap-1.5 mt-1"><Phone className="h-3 w-3 text-slate-400" /> {u.mobile}</div>}
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                                    {u.role_name}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs text-slate-500 font-bold">
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 pr-6 md:pr-8 text-right space-x-2">
                                                <Button size="sm" variant="outline" className="h-8 rounded-lg border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50" onClick={() => openFullEditModal(u.account_id)} disabled={isSaving}>
                                                    <Edit className="h-3 w-3 mr-1" /> Edit
                                                </Button>
                                                <Button size="sm" variant="outline" className="h-8 rounded-lg border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50" onClick={() => setPasswordUser(u)} disabled={isSaving}>
                                                    <Key className="h-3 w-3 mr-1" /> Key
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

            </div>

            {/* Massive Edit Overlay Modal */}
            <AnimatePresence>
            {editUser && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
                >
                    <motion.div 
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Modal Header */}
                        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
                                    <Activity className="h-6 w-6 text-indigo-500" /> Data Manipulation Center
                                </h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Editing Identity #{editUser.account_id} • {editUser.custom_id}</p>
                            </div>
                            <Button variant="ghost" onClick={() => setEditUser(null)} className="h-10 w-10 p-0 rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                            <form id="fullEditForm" onSubmit={handleEditSubmit} className="space-y-8">
                                
                                {/* Core Identity */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">Core Identity</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                                            <Input name="email" value={editUser.email} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50 font-medium" required />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Role</label>
                                            <select 
                                                name="role_name"
                                                value={editUser.role_name} 
                                                onChange={handleEditChange}
                                                className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            >
                                                {['Super Admin', 'Admin', 'Patient', 'Doctor', 'Driver', 'Medicine Store', 'Physiotherapy', 'Old Age Home', 'Lab Test', 'Home Care'].map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Details */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">Personal Profile</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">First Name</label>
                                            <Input name="first_name" value={editUser.first_name} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Name</label>
                                            <Input name="last_name" value={editUser.last_name} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mobile Number</label>
                                            <Input name="mobile" value={editUser.mobile} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gender</label>
                                            <select name="gender" value={editUser.gender} onChange={handleEditChange} className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date of Birth</label>
                                            <Input type="date" name="date_of_birth" value={editUser.date_of_birth ? new Date(editUser.date_of_birth).toISOString().split('T')[0] : ''} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Blood Group</label>
                                            <Input name="blood_group" value={editUser.blood_group} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50 uppercase" placeholder="e.g. O+" />
                                        </div>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">Address & Location</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Street Address</label>
                                            <Input name="street" value={editUser.street} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">City</label>
                                            <Input name="city" value={editUser.city} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">State</label>
                                            <Input name="state" value={editUser.state} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Zip Code</label>
                                            <Input name="zip_code" value={editUser.zip_code} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                        </div>
                                    </div>
                                </div>

                                {/* General Service Provider fields */}
                                {['Doctor', 'Driver', 'Medicine Store', 'Physiotherapy', 'Old Age Home', 'Lab Test', 'Home Care'].includes(editUser.role_name) && (
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">Provider Status & Credentials</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">License / Reg Number</label>
                                                <Input name="license_number" value={editUser.license_number} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
                                                <select name="status" value={editUser.status} onChange={handleEditChange} className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                                                    <option value="Active">Active</option>
                                                    <option value="Inactive">Inactive</option>
                                                    <option value="Suspended">Suspended</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1 flex items-end">
                                                <label className="flex items-center gap-2 h-11 px-4 border border-slate-200 bg-slate-50 rounded-xl cursor-pointer">
                                                    <input type="checkbox" name="is_verified" checked={editUser.is_verified} onChange={handleEditChange} className="h-4 w-4 text-indigo-600 rounded" />
                                                    <span className="text-sm font-bold text-slate-700">Verified Provider</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Specialized Role Fields */}
                                {editUser.role_name === 'Doctor' && (
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">Doctor Specialization</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Specialization</label>
                                                <Input name="doc_spec" value={editUser.doc_spec} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Experience (Years)</label>
                                                <Input type="number" name="doc_exp" value={editUser.doc_exp} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consultation Fee (₹)</label>
                                                <Input type="number" name="doc_fee" value={editUser.doc_fee} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {editUser.role_name === 'Driver' && (
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">Ambulance Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vehicle Number</label>
                                                <Input name="vehicle_number" value={editUser.vehicle_number} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vehicle Type</label>
                                                <select name="vehicle_type" value={editUser.vehicle_type} onChange={handleEditChange} className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                                                    <option value="">Select Type</option>
                                                    <option value="Basic Life Support (BLS)">Basic Life Support (BLS)</option>
                                                    <option value="Advanced Life Support (ALS)">Advanced Life Support (ALS)</option>
                                                    <option value="Patient Transport Vehicle (PTV)">Patient Transport Vehicle (PTV)</option>
                                                    <option value="Mortuary Ambulance">Mortuary Ambulance</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Experience (Years)</label>
                                                <Input type="number" name="drv_exp" value={editUser.drv_exp} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {editUser.role_name === 'Medicine Store' && (
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">Store Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Owner Name</label>
                                                <Input name="ms_owner" value={editUser.ms_owner} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Opening Hours</label>
                                                <Input name="ms_hours" value={editUser.ms_hours} onChange={handleEditChange} placeholder="e.g. 9:00 AM - 9:00 PM" className="h-11 rounded-xl bg-slate-50" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {editUser.role_name === 'Physiotherapy' && (
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">Physiotherapy Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Specialization</label>
                                                <Input name="phy_spec" value={editUser.phy_spec} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Experience (Years)</label>
                                                <Input type="number" name="phy_exp" value={editUser.phy_exp} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Session Fee (₹)</label>
                                                <Input type="number" name="phy_fee" value={editUser.phy_fee} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {editUser.role_name === 'Old Age Home' && (
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">Old Age Home Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Name</label>
                                                <Input name="oah_admin" value={editUser.oah_admin} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Capacity (Beds)</label>
                                                <Input type="number" name="oah_cap" value={editUser.oah_cap} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Facilities Summary</label>
                                                <Input name="oah_fac" value={editUser.oah_fac} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {editUser.role_name === 'Lab Test' && (
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">Pathology Lab Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lab Name</label>
                                                <Input name="lab_name" value={editUser.lab_name} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Owner Name</label>
                                                <Input name="lt_owner" value={editUser.lt_owner} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Accreditation (e.g. NABL)</label>
                                                <Input name="lt_acc" value={editUser.lt_acc} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                            </div>
                                            <div className="space-y-1 flex items-end">
                                                <label className="flex items-center gap-2 h-11 px-4 border border-slate-200 bg-slate-50 rounded-xl cursor-pointer">
                                                    <input type="checkbox" name="lt_home" checked={editUser.lt_home} onChange={handleEditChange} className="h-4 w-4 text-indigo-600 rounded" />
                                                    <span className="text-sm font-bold text-slate-700">Offers Home Collection</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {editUser.role_name === 'Home Care' && (
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">Home Care Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Agency Name</label>
                                                <Input name="hc_agency" value={editUser.hc_agency} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Services Offered</label>
                                                <Input name="hc_serv" value={editUser.hc_serv} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Experience (Years)</label>
                                                <Input type="number" name="hc_exp" value={editUser.hc_exp} onChange={handleEditChange} className="h-11 rounded-xl bg-slate-50" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 md:px-8 md:py-6 border-t border-slate-100 bg-slate-50 flex gap-4 justify-end">
                            <Button type="button" variant="ghost" onClick={() => setEditUser(null)} className="rounded-xl font-bold px-6">
                                Cancel
                            </Button>
                            <Button type="submit" form="fullEditForm" disabled={isSaving} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest shadow-lg shadow-indigo-200 px-8 flex items-center gap-2">
                                <Save className="h-4 w-4" />
                                {isSaving ? 'Saving...' : 'Commit Database Update'}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>

            {/* Force Reset Password Modal */}
            <AnimatePresence>
            {passwordUser && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                >
                    <motion.div 
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl"
                    >
                        <h3 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2">
                            <Key className="h-5 w-5 text-red-500" /> Override Access Key
                        </h3>
                        <p className="text-xs text-slate-500 mb-6 font-medium">Forcefully update the password for <strong className="text-slate-800">{passwordUser.email}</strong>. This bypasses current password requirements.</p>
                        
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Password</label>
                                <Input type="text" placeholder="Minimum 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="h-11 rounded-xl bg-slate-50 font-mono" required minLength={6} />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl border-slate-200" onClick={() => setPasswordUser(null)}>Cancel</Button>
                                <Button type="submit" disabled={isSaving} className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold">Set Password</Button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>

        </div>
    );
};

export default SuperAdminDirectory;
