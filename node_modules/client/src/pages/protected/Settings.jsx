import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Bell,
    Lock,
    Shield,
    LogOut,
    Save,
    Settings as SettingsIcon
} from 'lucide-react';

const Settings = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.mobile || '',
        address: user?.address?.street || '',
        bloodGroup: user?.bloodGroup || '',
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSave = async () => {
        try {
            const hostname = window.location.hostname;
            const res = await fetch(`/api/profile/${user.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({ 
                    first_name: profile.name.split(' ')[0], 
                    last_name: profile.name.split(' ').slice(1).join(' '),
                    mobile: profile.phone,
                    street: profile.address,
                    blood_group: profile.bloodGroup
                }),
            });
            if (res.ok) {
                toast.success('Settings saved successfully!');
            } else {
                toast.error('Failed to save settings');
            }
        } catch (err) {
            toast.error('Error connecting to server');
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
            >
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-100 shrink-0">
                        <SettingsIcon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">System <span className="text-red-600">Config</span></h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Global administrative parameters & protocols</p>
                    </div>
                </div>
                <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="h-12 px-6 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 font-black uppercase tracking-widest text-[10px] transition-all"
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Terminate Session
                </Button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Settings */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden border">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 px-6 md:px-8 py-6">
                            <CardTitle className="text-lg font-black flex items-center gap-2 text-slate-800 uppercase tracking-tight">
                                <User className="h-5 w-5 text-red-600" /> Identity Core
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Designation</Label>
                                    <Input
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        className="h-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-red-500/20 font-bold text-slate-700"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Direct Communication Email</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                                        <Input
                                            type="email"
                                            value={profile.email}
                                            disabled
                                            className="h-12 pl-11 rounded-2xl bg-slate-100 border-none font-bold text-slate-400 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Protocol</Label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                                        <Input
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            className="h-12 pl-11 rounded-2xl bg-slate-50 border-none focus-visible:ring-red-500/20 font-bold text-slate-700"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Biological Group</Label>
                                    <Input
                                        value={profile.bloodGroup}
                                        onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                                        placeholder="e.g. O+"
                                        className="h-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-red-500/20 font-bold text-slate-700 px-5"
                                    />
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Operation Base</Label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-4 h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                                        <textarea
                                            value={profile.address}
                                            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                            className="w-full min-h-[100px] pl-11 p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-red-500/20 font-bold text-slate-700"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button onClick={handleSave} className="h-14 w-full sm:w-auto px-10 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-red-600 transition-all flex items-center gap-2">
                                <Save className="h-4 w-4" />
                                Commit Modifications
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Settings */}
                <div className="space-y-8">
                    <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden border">
                        <CardHeader className="bg-slate-900 border-b border-slate-800 px-6 py-5">
                            <CardTitle className="text-sm font-black flex items-center gap-2 text-white uppercase tracking-widest">
                                <Bell className="h-4 w-4 text-red-500" /> Alert Protocols
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {[
                                { label: 'Email Alerts', id: 'email' },
                                { label: 'SMS Response', id: 'sms' },
                                { label: 'Internal Comms', id: 'push' }
                            ].map((opt) => (
                                <div key={opt.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 group hover:bg-slate-100 transition-colors">
                                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">{opt.label}</span>
                                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden border">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 px-6 py-5">
                            <CardTitle className="text-sm font-black flex items-center gap-2 text-slate-800 uppercase tracking-widest">
                                <Shield className="h-4 w-4 text-emerald-500" /> Security Layer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-3">
                            <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 font-bold flex items-center gap-2 justify-start px-4 text-xs group hover:bg-slate-900 hover:text-white transition-all">
                                <Lock className="h-4 w-4 text-slate-400 group-hover:text-red-500" /> Access Keys
                            </Button>
                            <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 font-bold flex items-center gap-2 justify-start px-4 text-xs group hover:bg-slate-900 hover:text-white transition-all">
                                <Shield className="h-4 w-4 text-slate-400 group-hover:text-emerald-500" /> Auth Matrix
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden border bg-slate-900">
                        <CardHeader className="border-b border-slate-800 px-6 py-5">
                            <CardTitle className="text-[11px] font-black text-slate-400 uppercase tracking-widest">System Node Data</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {[
                                { label: 'Node Identity', value: user?.customId || 'SEC-001' },
                                { label: 'Access Level', value: user?.role || 'ADMIN' },
                                { label: 'Uptime Since', value: 'JAN 2026' }
                            ].map((item) => (
                                <div key={item.label} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                                    <span className="text-[11px] font-black text-white uppercase tracking-wider">{item.value}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Settings;


