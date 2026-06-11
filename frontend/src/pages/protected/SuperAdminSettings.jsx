import React from 'react';
import ChangePassword from '../../components/ChangePassword';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon } from 'lucide-react';

const SuperAdminSettings = () => {
    return (
        <div className="min-h-screen bg-slate-50 pb-12 pt-4 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100 shrink-0">
                            <SettingsIcon className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">System <span className="text-indigo-600">Settings</span></h1>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Super Admin Security Preferences</p>
                        </div>
                    </div>
                </motion.div>

                {/* Security & Password Module */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm p-4 md:p-10"
                >
                    <ChangePassword />
                </motion.div>
                
            </div>
        </div>
    );
};

export default SuperAdminSettings;
