import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Download, Eye, X, PlusCircle, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { getDocUrl } from '@/utils/api';

const UserRecords = () => {
    const { token } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    
    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [recordType, setRecordType] = useState('Lab Report');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/records`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setRecords(data);
            }
        } catch (error) {
            console.error("Failed to load records", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !title) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('recordType', recordType);
            formData.append('recordFile', file);

            const res = await fetch(`/api/records/upload`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (res.ok) {
                setIsUploadModalOpen(false);
                setTitle('');
                setDescription('');
                setFile(null);
                fetchRecords(); // Reload records
            } else {
                console.error("Upload failed");
            }
        } catch (error) {
            console.error("Upload error", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
            >
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Vital <span className="text-red-600">Vault</span></h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Universal Health Records Storage</p>
                </div>
                <Button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white hover:bg-red-600 transition-all rounded-[1.25rem] h-14 px-8 font-black uppercase tracking-widest text-[11px] shadow-xl">
                    <Upload className="h-5 w-5" />
                    Upload Record
                </Button>
            </motion.div>

            {loading ? (
                <div className="p-12 text-center text-muted-foreground animate-pulse">
                    Loading your records...
                </div>
            ) : records.length === 0 ? (
                <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="rounded-full bg-blue-50 p-4">
                            <FileText className="h-8 w-8 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mt-2">No records found</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            You haven't uploaded any medical records yet. Stay organized by uploading your lab results, imaging, and prescriptions here securely.
                        </p>
                        <Button variant="outline" className="mt-4" onClick={() => setIsUploadModalOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add your first record
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {records.map(record => {
                        const fileUrl = getDocUrl(record.file_url);
                        return (
                            <motion.div 
                                key={record.record_id} 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm hover:shadow-2xl hover:border-red-100 transition-all flex flex-col h-full group"
                            >
                                <div className="flex items-start justify-between mb-5">
                                    <div className="p-4 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                        <FileText className="h-7 w-7" />
                                    </div>
                                    <span className="inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 group-hover:bg-red-100 group-hover:text-red-700 transition-colors">
                                        {record.record_type}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-slate-800 line-clamp-1 mb-2 uppercase tracking-tight">{record.title}</h3>
                                <p className="text-sm font-bold text-slate-400 line-clamp-2 mb-6 flex-1 italic">
                                    {record.description || "Secure medical entry."}
                                </p>
                                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {new Date(record.created_at).toLocaleDateString()}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <a href={fileUrl} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-all" title="View">
                                            <Eye className="h-5 w-5" />
                                        </a>
                                        <a href={fileUrl} download target="_blank" rel="noreferrer" className="p-3 rounded-xl bg-slate-900 text-white hover:bg-red-600 transition-all shadow-lg" title="Download">
                                            <Download className="h-5 w-5" />
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer" onClick={() => !uploading && setIsUploadModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Upload className="h-5 w-5 text-blue-600" />
                                Upload Medical Record
                            </h2>
                            <button onClick={() => !uploading && setIsUploadModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Record Title *</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" 
                                    placeholder="e.g. Blood Test Results"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Record Type</label>
                                <select 
                                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                                    value={recordType}
                                    onChange={e => setRecordType(e.target.value)}
                                >
                                    <option value="Lab Report">Lab Report</option>
                                    <option value="Prescription">Prescription</option>
                                    <option value="Scan">Scan (X-Ray, MRI, etc)</option>
                                    <option value="Clinical Note">Clinical Note</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                                <textarea 
                                    className="w-full flex min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" 
                                    placeholder="Any additional details..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Document File *</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-gray-300 hover:border-blue-400 bg-gray-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="space-y-1 text-center">
                                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <span className="relative rounded-md font-medium text-blue-600 hover:text-blue-500">
                                                {file ? file.name : 'Click to select a file'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {file ? `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB` : 'PDF, PNG, JPG up to 10MB'}
                                        </p>
                                    </div>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        ref={fileInputRef} 
                                        onChange={e => setFile(e.target.files[0])}
                                        accept=".pdf,image/*"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3 justify-end">
                                <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)} disabled={uploading}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={!file || !title || uploading} className="bg-blue-600 hover:bg-blue-700">
                                    {uploading ? 'Uploading...' : 'Upload Record'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserRecords;



