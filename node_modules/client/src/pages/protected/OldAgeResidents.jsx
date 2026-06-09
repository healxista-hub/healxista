import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    Search, UserPlus, Home, Heart, Activity, 
    Phone, User, Hash, X, ShieldCheck, Trash2,
    Calendar, MoreVertical, Upload, FileText, Download,
    Camera
} from 'lucide-react';
import { fetchApi, getDocUrl } from '@/utils/api';
import { toast } from 'sonner';

const OldAgeResidents = () => {
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedResident, setSelectedResident] = useState(null);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        room_number: '',
        condition: 'Stable',
        emergency_contact: ''
    });
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [uploading, setUploading] = useState(false);

    const fetchResidents = async () => {
        setLoading(true);
        try {
            const data = await fetchApi('/api/residents');
            if (data) setResidents(data);
        } catch (error) {
            toast.error("Failed to load residents");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResidents();
    }, []);

    const handleAddResident = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            const body = new FormData();
            body.append('name', formData.name);
            body.append('age', formData.age);
            body.append('room_number', formData.room_number);
            body.append('condition', formData.condition);
            body.append('emergency_contact', formData.emergency_contact);
            
            if (selectedPhoto) body.append('photo', selectedPhoto);
            if (selectedDoc) body.append('document', selectedDoc);

            const res = await fetchApi('/api/residents', {
                method: 'POST',
                body: body // fetchApi handles FormData correctly (sets no content-type)
            });
            
            if (res) {
                toast.success("Resident admitted successfully");
                setIsAddModalOpen(false);
                setFormData({ name: '', age: '', room_number: '', condition: 'Stable', emergency_contact: '' });
                setSelectedPhoto(null);
                setSelectedDoc(null);
                fetchResidents();
            }
        } catch (error) {
            toast.error("Failed to admit resident");
        } finally {
            setUploading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const res = await fetchApi(`/api/residents/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ is_active: !currentStatus })
            });
            if (res) {
                setResidents(residents.map(r => r.resident_id === id ? { ...r, is_active: !currentStatus } : r));
                toast.success(`Resident marked as ${!currentStatus ? 'Active' : 'Inactive'}`);
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this resident record?")) return;
        try {
            const res = await fetchApi(`/api/residents/${id}`, { method: 'DELETE' });
            if (res) {
                toast.success("Resident record removed");
                fetchResidents();
            }
        } catch (error) {
            toast.error("Failed to delete record");
        }
    };

    const filteredResidents = residents.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.room_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12 min-h-screen bg-slate-50/50 p-4 md:p-8">
            {/* Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl p-8 md:p-12 text-white"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600 rounded-full -mr-32 -mt-32 blur-3xl opacity-20" />
                <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Resident <span className="text-amber-500">Directory</span></h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mt-4 flex items-center gap-3">
                            <span className="h-px w-10 bg-amber-600" />
                            Facility Member Management with Media Documentation
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full lg:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search residents..."
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-600"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-widest text-[11px] h-14 px-8 rounded-2xl shadow-xl shadow-amber-900/20 transition-all flex items-center gap-3"
                        >
                            <UserPlus className="h-5 w-5" /> Admit Resident
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Residents Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 rounded-[2.5rem] bg-white border border-slate-100 animate-pulse shadow-sm" />
                    ))}
                </div>
            ) : filteredResidents.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[3rem] border border-dashed border-slate-200 text-slate-400 gap-4">
                    <div className="p-6 bg-slate-50 rounded-full">
                        <Home className="h-12 w-12 text-slate-200" />
                    </div>
                    <p className="font-black uppercase tracking-widest text-xs">No active residents recorded</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredResidents.map((resident, idx) => (
                        <motion.div
                            key={resident.resident_id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className={`group relative overflow-hidden rounded-[2.5rem] border-slate-100 hover:border-amber-200 hover:shadow-2xl transition-all h-full flex flex-col bg-white ${!resident.is_active ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                <div className={`h-2 transition-all w-full ${resident.is_active ? 'bg-amber-100 group-hover:bg-amber-500' : 'bg-slate-200'}`} />
                                
                                <CardHeader className="p-8 pb-4">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="h-20 w-20 rounded-3xl overflow-hidden border border-slate-100 shadow-sm relative group/img">
                                            {resident.photo_url ? (
                                                <img src={getDocUrl(resident.photo_url)} alt={resident.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full bg-slate-50 flex items-center justify-center text-slate-400">
                                                    <User className="h-10 w-10" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                <MoreVertical className="h-5 w-5" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Switch 
                                                checked={resident.is_active} 
                                                onCheckedChange={() => handleToggleStatus(resident.resident_id, resident.is_active)}
                                                className="data-[state=checked]:bg-emerald-500"
                                            />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                {resident.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <CardTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight group-hover:text-amber-600 transition-colors">
                                            {resident.name}
                                        </CardTitle>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded-lg uppercase tracking-[0.1em]">
                                                {resident.resident_id}
                                            </span>
                                            <div className="h-1 w-1 rounded-full bg-slate-300" />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                ROOM {resident.room_number || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-8 pt-0 space-y-6 flex-1 flex flex-col">
                                    <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-50">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Clinic State</p>
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                                resident.condition === 'Critical' ? 'bg-rose-50 text-rose-600' :
                                                resident.condition === 'Needs Assistance' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                            }`}>
                                                <Activity className="h-3 w-3" /> {resident.condition}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Age Group</p>
                                            <p className="text-sm font-black text-slate-700">{resident.age} YRS</p>
                                        </div>
                                    </div>

                                    <div className="pt-6 mt-auto flex gap-3">
                                        <Button 
                                            onClick={() => setSelectedResident(resident)}
                                            className="flex-1 h-12 bg-slate-900 border-none rounded-xl font-bold text-[10px] uppercase tracking-widest text-white shadow-lg hover:bg-amber-600 transition-all"
                                        >
                                            View Data Record
                                        </Button>
                                        <Button 
                                            onClick={() => handleDelete(resident.resident_id)}
                                            variant="ghost"
                                            className="h-12 w-12 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal: Admit New Resident */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-8 md:p-10">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Admit <span className="text-amber-600">Resident</span></h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Enrollment & Documentation Portal</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setIsAddModalOpen(false)} className="rounded-xl">
                                        <X className="h-5 w-5 text-slate-400" />
                                    </Button>
                                </div>

                                <form onSubmit={handleAddResident} className="space-y-4 md:space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Name & Age */}
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Full Name</Label>
                                                <Input 
                                                    required
                                                    value={formData.name}
                                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                                    placeholder="Member Name" 
                                                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:ring-amber-500"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Age</Label>
                                                    <Input 
                                                        type="number"
                                                        required
                                                        value={formData.age}
                                                        onChange={e => setFormData({...formData, age: e.target.value})}
                                                        placeholder="Yrs" 
                                                        className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:ring-amber-500"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Room</Label>
                                                    <Input 
                                                        required
                                                        value={formData.room_number}
                                                        onChange={e => setFormData({...formData, room_number: e.target.value})}
                                                        placeholder="101" 
                                                        className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:ring-amber-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Photo Upload */}
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Resident Photo</Label>
                                            <div className="relative group/photo h-[124px] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex flex-col items-center justify-center transition-all hover:border-amber-400 hover:bg-amber-50/20">
                                                {selectedPhoto ? (
                                                    <div className="relative h-full w-full">
                                                        <img src={URL.createObjectURL(selectedPhoto)} alt="preview" className="h-full w-full object-cover" />
                                                        <button 
                                                            type="button"
                                                            onClick={() => setSelectedPhoto(null)}
                                                            className="absolute top-2 right-2 p-1 bg-white/80 rounded-full text-slate-600 hover:text-rose-600"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Camera className="h-8 w-8 text-slate-300 group-hover/photo:text-amber-500 transition-colors mb-2" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Click to Upload JPG/PNG</span>
                                                    </>
                                                )}
                                                <input 
                                                    type="file" 
                                                    accept="image/*"
                                                    onChange={e => setSelectedPhoto(e.target.files[0])}
                                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Current Health State</Label>
                                        <select 
                                            value={formData.condition}
                                            onChange={e => setFormData({...formData, condition: e.target.value})}
                                            className="w-full h-14 rounded-2xl bg-slate-50 border-slate-100 px-4 font-bold text-sm focus:ring-2 focus:ring-amber-500 outline-none appearance-none"
                                        >
                                            <option value="Stable">Stable Profile</option>
                                            <option value="Needs Assistance">Needs Active Assistance</option>
                                            <option value="Critical">Critical Observation Required</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Document Upload (ID / Health Record)</Label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 relative h-14 rounded-2xl border border-slate-100 bg-slate-50 flex items-center px-6">
                                                <FileText className="h-5 w-5 text-emerald-500 mr-3" />
                                                <span className="text-[11px] font-bold text-slate-500 truncate">
                                                    {selectedDoc ? selectedDoc.name : "Select Document (PDF/DOC)"}
                                                </span>
                                                <input 
                                                    type="file" 
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={e => setSelectedDoc(e.target.files[0])}
                                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                                />
                                            </div>
                                            {selectedDoc && (
                                                <Button type="button" variant="ghost" size="icon" onClick={() => setSelectedDoc(null)} className="rounded-xl bg-slate-100">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Emergency Response Line</Label>
                                        <Textarea 
                                            required
                                            value={formData.emergency_contact}
                                            onChange={e => setFormData({...formData, emergency_contact: e.target.value})}
                                            placeholder="Contact Phone & Relation..." 
                                            className="h-24 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:ring-amber-500 p-4"
                                        />
                                    </div>

                                    <Button 
                                        type="submit" 
                                        disabled={uploading}
                                        className="w-full h-14 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl hover:bg-amber-600 transition-all mt-4 disabled:opacity-50"
                                    >
                                        {uploading ? "Uploading Data..." : "Confirm Facility Admission"}
                                    </Button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal: Resident Profile View */}
            <AnimatePresence>
                {selectedResident && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedResident(null)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-lg"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <Button variant="ghost" size="icon" onClick={() => setSelectedResident(null)} className="rounded-full bg-slate-50">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="p-10 md:p-14">
                                <div className="flex flex-col md:flex-row gap-12">
                                    <div className="flex-shrink-0 flex flex-col items-center">
                                        <div className="h-48 w-48 rounded-[3rem] overflow-hidden border border-slate-100 shadow-xl ring-8 ring-slate-50">
                                            {selectedResident.photo_url ? (
                                                <img src={getDocUrl(selectedResident.photo_url)} alt={selectedResident.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                    <User className="h-24 w-24" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-8 space-y-4 w-full">
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                                <div className="p-2 bg-white rounded-xl text-slate-400 shadow-sm"><Hash className="h-4 w-4" /></div>
                                                <span className="text-[10px] font-black tracking-widest">{selectedResident.resident_id}</span>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                                <div className="p-2 bg-white rounded-xl text-slate-400 shadow-sm"><Calendar className="h-4 w-4" /></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">JOINED {new Date(selectedResident.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-8">
                                        <div>
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase mb-4 inline-block ${
                                                selectedResident.condition === 'Critical' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                selectedResident.condition === 'Needs Assistance' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                            }`}>
                                                State: {selectedResident.condition}
                                            </span>
                                            <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tight leading-tight">{selectedResident.name}</h2>
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Verified Facility Occupant Medical Record</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Housing Wing</p>
                                                <div className="flex items-center gap-3 h-14 px-5 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <Home className="h-5 w-5 text-amber-600" />
                                                    <span className="font-black text-slate-700 tracking-wide">ROOM {selectedResident.room_number || 'TBD'}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Age Registry</p>
                                                <div className="flex items-center gap-3 h-14 px-5 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <Activity className="h-5 w-5 text-indigo-500" />
                                                    <span className="font-black text-slate-700">{selectedResident.age} YEARS</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Medical Documentation</p>
                                            {selectedResident.document_url ? (
                                                <a 
                                                    href={getDocUrl(selectedResident.document_url)} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-6 bg-amber-50 rounded-[2rem] border border-amber-100 hover:bg-amber-100 transition-all group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <FileText className="h-7 w-7 text-amber-600" />
                                                        <div>
                                                            <p className="text-[9px] font-black text-amber-700/60 uppercase tracking-widest">Clinical Identification</p>
                                                            <p className="text-sm font-black text-slate-800">View Legal/Health Archive</p>
                                                        </div>
                                                    </div>
                                                    <Download className="h-6 w-6 text-amber-600 group-hover:translate-y-0.5 transition-transform" />
                                                </a>
                                            ) : (
                                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 text-center">
                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No documentation attached</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Emergency Communications</p>
                                            <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-start gap-4 shadow-sm shadow-emerald-900/5">
                                                <Phone className="h-6 w-6 text-emerald-600" />
                                                <div>
                                                    <p className="text-[9px] font-black text-emerald-700/60 uppercase tracking-widest">Direct Responder Line</p>
                                                    <p className="text-lg font-black text-slate-800 mt-1">{selectedResident.emergency_contact}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OldAgeResidents;



