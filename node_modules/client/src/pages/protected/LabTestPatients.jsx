import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, Eye, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import UserProfileModal from '@/components/UserProfileModal';
import PatientRecordsModal from '@/components/PatientRecordsModal';
import { FileText } from 'lucide-react';
import { getDocUrl } from '@/utils/api';

const LabTestPatients = () => {
    const { token } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [viewRecordsPatient, setViewRecordsPatient] = useState(null);

    useEffect(() => {
        const fetchSystemPatients = async () => {
            try {
                const hostname = window.location.hostname;
                // Fetch only users who have booked this specific lab
                const res = await fetch(`/api/bookings/my-patients`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setPatients(data);
                }
            } catch (err) {
                console.error("Failed to load users.", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSystemPatients();
    }, []);

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-sm"
            >
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Patient <span className="text-red-600">Directory</span></h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Lab Testing Patient Records</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <Users className="h-4 w-4 text-red-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                        {patients.length} Active Patients
                    </span>
                </div>
            </motion.div>

            <Card>
                <CardHeader>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search patients by name..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="p-8 text-center text-muted-foreground">Loading patient directory...</div>
                        ) : filteredPatients.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No patients found.</div>
                        ) : (
                            filteredPatients.map((patient) => {
                                 const avatarUrl = getDocUrl(patient.profile_image_url);

                                return (
                                    <div key={patient.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] hover:bg-white hover:shadow-xl hover:border-red-100 transition-all gap-4 group">
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                                                {avatarUrl ? (
                                                    <img src={avatarUrl} alt={patient.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-black text-xl text-red-600">{patient.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">{patient.name}</h4>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{patient.custom_id || patient.customId || 'PLATFORM-USER'}</p>
                                                <p className="text-sm font-bold text-slate-500 mt-1 line-clamp-1">{patient.bio || 'Active Platform Resident'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0 justify-end flex-nowrap">
                                            <div className="text-right hidden lg:block mr-4">
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Contact</p>
                                                <p className="text-sm font-black text-slate-700">{patient.mobile || 'SECURE'}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(patient)} className="h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Bio
                                                </Button>
                                                <Button variant="secondary" size="sm" onClick={() => setViewRecordsPatient(patient)} className="h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-slate-900 text-white hover:bg-red-600 transition-colors shadow-lg">
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Clinical Reports
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </CardContent>
            </Card>

            <UserProfileModal
                isOpen={!!selectedPatient}
                onClose={() => setSelectedPatient(null)}
                userId={selectedPatient?.id}
                bookingDoc={selectedPatient?.last_user_document}
            />

            <PatientRecordsModal 
                isOpen={!!viewRecordsPatient}
                onClose={() => setViewRecordsPatient(null)}
                patient={viewRecordsPatient}
            />
        </div>
    );
};

export default LabTestPatients;
