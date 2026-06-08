import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Eye, Phone, Calendar, MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/utils/api';
import { toast } from 'sonner';
import UserProfileModal from '@/components/UserProfileModal';

const PhysioPatients = () => {
    const { token } = useAuth();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const data = await fetchApi('/api/bookings/my-patients');
                if (data) setPatients(data);
            } catch (err) {
                console.error('Failed to load patients', err);
                toast.error('Could not load patient list.');
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    const filtered = patients.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.mobile?.includes(searchTerm)
    );

    return (
        <div className="space-y-8 pb-12">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
            >
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Recovery <span className="text-red-600">Circle</span></h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Physiotherapy Patient Registry</p>
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200">
                    <Users className="h-5 w-5 text-red-500" />
                    <span className="text-[11px] font-black uppercase tracking-widest">
                        {patients.length} Registered
                    </span>
                </div>
            </motion.div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="search"
                    placeholder="Search by name or phone..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-16 text-center text-muted-foreground animate-pulse">Loading patients...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center gap-3">
                        <div className="h-16 w-16 rounded-2xl bg-purple-50 flex items-center justify-center">
                            <Users className="h-8 w-8 text-purple-300" />
                        </div>
                        <p className="font-semibold text-slate-700">
                            {searchTerm ? 'No patients match your search.' : 'No patients yet.'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Patients who book sessions with you will appear here.
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-50">
                        {filtered.map(patient => (
                            <li key={patient.id} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all group border-b border-slate-50 last:border-none">
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-red-600 font-black text-xl border border-slate-100 group-hover:scale-105 transition-transform">
                                        {patient.name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800 uppercase tracking-tight text-lg">{patient.name}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{patient.custom_id || patient.customId || 'RECOVERY-ID'}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            {patient.last_booking && (
                                                <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(patient.last_booking).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedPatient(patient)}
                                        className="h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                                    >
                                        <Eye className="h-4 w-4 mr-2" /> View Bio
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest border-slate-200 hover:border-slate-900 transition-all"
                                        onClick={() => toast.info('Communication portal opening...')}
                                    >
                                        <MessageCircle className="h-4 w-4 mr-2" /> Contact
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <UserProfileModal
                isOpen={!!selectedPatient}
                onClose={() => setSelectedPatient(null)}
                userId={selectedPatient?.id}
                bookingDoc={selectedPatient?.last_user_document}
            />
        </div>
    );
};

export default PhysioPatients;



