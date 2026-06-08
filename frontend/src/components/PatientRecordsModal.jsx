import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Eye, Calendar, Upload } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getDocUrl } from '@/utils/api';

const PatientRecordsModal = ({ isOpen, onClose, patient }) => {
    const { token } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen || !patient) return;

        const fetchPatientRecords = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/records/patient/${patient.id}`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setRecords(data);
                }
            } catch (error) {
                console.error("Failed to load patient records", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPatientRecords();
    }, [isOpen, patient, token]);

    if (!isOpen || !patient) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" />
            
            <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white overflow-hidden rounded-2xl shadow-2xl">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Medical Records
                        </h2>
                        <p className="text-blue-100 text-sm mt-0.5">Patient: {patient.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition z-10"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    {loading ? (
                        <div className="py-12 text-center text-muted-foreground animate-pulse">
                            Loading records securely...
                        </div>
                    ) : records.length === 0 ? (
                        <div className="bg-white rounded-xl border p-12 text-center shadow-sm flex flex-col items-center">
                            <div className="rounded-full bg-slate-100 p-4 mb-4">
                                <FileText className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">No records found</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mt-2">
                                This patient has not uploaded any medical records or lab results to their profile.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {records.map(record => {
                                const fileUrl = getDocUrl(record.file_url);
                                return (
                                    <div key={record.record_id} className="rounded-xl border bg-white p-4 shadow-sm hover:border-blue-300 transition-colors flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="p-2 rounded-lg bg-blue-50 shrink-0">
                                                <FileText className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                                                {record.record_type}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900 line-clamp-1 mb-1">{record.title}</h3>
                                        <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">
                                            {record.description || "No description provided."}
                                        </p>
                                        
                                        <div className="mt-auto pt-3 border-t flex flex-col gap-2">
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(record.created_at).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1 text-blue-600 text-[10px] bg-blue-50 px-1.5 py-0.5 rounded">
                                                    <Upload className="h-3 w-3" />
                                                    {record.uploaded_by_name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <a href={fileUrl} target="_blank" rel="noreferrer" className="flex-1 text-center py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-1">
                                                    <Eye className="h-4 w-4" /> View
                                                </a>
                                                <a href={fileUrl} download target="_blank" rel="noreferrer" className="flex-1 text-center py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-1">
                                                    <Download className="h-4 w-4" /> Save
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientRecordsModal;
