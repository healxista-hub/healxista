import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, User, Mail, Phone, MapPin, Save, Bell, Lock, Beaker } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LabTestSettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        lab_name: user?.lab_name || '',
        ownerName: user?.ownerName || '',
        address: user?.address || '',
        accreditation: user?.accreditation || ''
    });

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Placeholder for API update logic
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Settings updated successfully');
        } catch (error) {
            toast.error('Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 rounded-full -mr-32 -mt-32 blur-3xl opacity-5" />
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Beaker className="h-8 w-8 text-red-600" />
                        Lab <span className="text-red-600">Settings</span>
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Configure your diagnostic node identity and security</p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6">
                            <CardTitle className="text-lg font-black flex items-center gap-2 text-slate-800">
                                <User className="h-5 w-5 text-red-600" /> Profile Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 md:p-8 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-red-500/20 font-bold text-slate-700" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={formData.email}
                                        disabled
                                        className="w-full h-12 px-5 rounded-2xl bg-slate-100 border-none font-bold text-slate-400 cursor-not-allowed" 
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Owner Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.ownerName}
                                        onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                                        className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-red-500/20 font-bold text-slate-700" 
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Laboratory Entity Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.lab_name}
                                        onChange={(e) => setFormData({...formData, lab_name: e.target.value})}
                                        className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-red-500/20 font-bold text-slate-700" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Protocol</label>
                                    <input 
                                        type="text" 
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-red-500/20 font-bold text-slate-700" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Accreditation</label>
                                    <input 
                                        type="text" 
                                        value={formData.accreditation}
                                        onChange={(e) => setFormData({...formData, accreditation: e.target.value})}
                                        className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-red-500/20 font-bold text-slate-700" 
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Location</label>
                                    <textarea 
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        className="w-full p-5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-red-500/20 font-bold text-slate-700 min-h-[100px]" 
                                    />
                                </div>
                            </div>
                            <Button 
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full sm:w-auto h-14 px-10 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-red-600 transition-all flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                {loading ? 'Saving Changes...' : 'Save Configuration'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4 md:space-y-5">
                    <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden h-full">
                        <CardHeader className="bg-slate-900 border-b border-slate-800 px-8 py-6">
                            <CardTitle className="text-lg font-black flex items-center gap-2 text-white">
                                <Shield className="h-5 w-5 text-emerald-400" /> Platform Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 md:p-8 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Status</p>
                                    <p className="font-black text-emerald-600 uppercase">Verified Provider</p>
                                </div>
                            </div>
                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Security Controls</h4>
                                <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 font-bold flex items-center gap-2 justify-start px-4">
                                    <Lock className="h-4 w-4 text-slate-400" /> Change Password
                                </Button>
                                <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 font-bold flex items-center gap-2 justify-start px-4">
                                    <Bell className="h-4 w-4 text-slate-400" /> Notifications
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LabTestSettings;



