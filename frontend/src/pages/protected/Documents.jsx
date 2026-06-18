import React, { useState, useEffect, useRef } from 'react';
import {
    FileText,
    Upload,
    Download,
    Eye,
    X,
    PlusCircle,
    Calendar,
    Share2,
    UserPlus,
    Trash2,
    Search,
    User,
    Shield,
    ExternalLink,
    Lock,
    Users
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/utils/api';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Documents = () => {
    const { user, token } = useAuth();
    const [myDocs, setMyDocs] = useState([]);
    const [sharedDocs, setSharedDocs] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);

    // Upload Form
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Share Form
    const [shareSearchTerm, setShareSearchTerm] = useState('');
    const [sharingId, setSharingId] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [my, shared, users] = await Promise.all([
                fetchApi('/api/documents/my'),
                fetchApi('/api/documents/shared-with-me'),
                fetchApi('/api/documents/users-list')
            ]);
            if (my) setMyDocs(my);
            if (shared) setSharedDocs(shared);
            if (users) setAllUsers(users);
        } catch (error) {
            console.error("Failed to load documents", error);
            toast.error("Failed to load documents");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('document', file);
            formData.append('description', description || title); // Use title as fallback desc

            // Note: raw fetch used for FormData, since fetchApi handles JSON centrally
            const res = await fetch(`/api/documents/upload`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (res.ok) {
                toast.success('Document uploaded successfully');
                setIsUploadModalOpen(false);
                setTitle('');
                setDescription('');
                setFile(null);
                fetchData();
            } else {
                const errData = await res.json();
                toast.error(errData.message || "Upload failed");
            }
        } catch (error) {
            console.error("Upload error", error);
            toast.error("Network error during upload");
        } finally {
            setUploading(false);
        }
    };

    const handleShare = async (recipientId) => {
        if (!selectedDoc) return;
        try {
            setSharingId(recipientId);
            const res = await fetchApi(`/api/documents/${selectedDoc.document_id}/share`, {
                method: 'POST',
                body: JSON.stringify({ recipient_id: recipientId })
            });
            toast.success("Document shared successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to share document");
        } finally {
            setSharingId(null);
        }
    };

    const handleDelete = async (docId) => {
        if (!window.confirm("Are you sure you want to delete this document?")) return;
        try {
            await fetchApi(`/api/documents/${docId}`, { method: 'DELETE' });
            toast.success("Document deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete document");
        }
    };

    const handleRevoke = async (docId, recipientId) => {
        try {
            await fetchApi(`/api/documents/${docId}/share/${recipientId}`, { method: 'DELETE' });
            toast.success("Access revoked");
            fetchData();
        } catch (error) {
            toast.error("Failed to revoke access");
        }
    };

    const filteredUsers = allUsers.filter(u =>
        u.name?.toLowerCase().includes(shareSearchTerm.toLowerCase()) ||
        u.role?.toLowerCase().includes(shareSearchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Documents & Records</h1>
                    <p className="text-muted-foreground">Securely upload, manage, and share your records with doctors, labs, and pharmacies.</p>
                </div>
                <Button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Upload className="h-4 w-4" />
                    Upload Document
                </Button>
            </div>

            <Tabs defaultValue="my-docs" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="my-docs">My Uploads ({myDocs.length})</TabsTrigger>
                    <TabsTrigger value="shared-with-me">Shared with Me ({sharedDocs.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="my-docs" className="mt-6">
                    {loading ? (
                        <div className="p-12 text-center text-muted-foreground animate-pulse">Loading your documents...</div>
                    ) : myDocs.length === 0 ? (
                        <EmptyState
                            icon={FileText}
                            title="No documents uploaded"
                            desc="You haven't uploaded any documents yet. Keep your prescriptions and reports organized here."
                            onAction={() => setIsUploadModalOpen(true)}
                            btnText="Upload My First Document"
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myDocs.map(doc => (
                                <DocCard
                                    key={doc.document_id}
                                    doc={doc}
                                    isOwner={true}
                                    onDelete={handleDelete}
                                    onShareClick={() => { setSelectedDoc(doc); setIsShareModalOpen(true); }}
                                    onRevoke={handleRevoke}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="shared-with-me" className="mt-6">
                    {loading ? (
                        <div className="p-12 text-center text-muted-foreground animate-pulse">Checking for shared documents...</div>
                    ) : sharedDocs.length === 0 ? (
                        <EmptyState
                            icon={Users}
                            title="Nothing shared with you"
                            desc="Documents shared with you by patients or other providers will appear here."
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sharedDocs.map(doc => (
                                <DocCard
                                    key={doc.document_id}
                                    doc={doc}
                                    isOwner={false}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !uploading && setIsUploadModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Upload className="h-5 w-5 text-indigo-600" />
                                Upload Document
                            </h2>
                            <button onClick={() => !uploading && setIsUploadModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Document Title *</label>
                                <input type="text" required className="w-full h-10 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Lab Report March" value={title} onChange={e => setTitle(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-500 uppercase text-[10px] tracking-wider">Description (Optional)</label>
                                <textarea className="w-full min-h-[80px] rounded-md border border-input px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Details about this record..." value={description} onChange={e => setDescription(e.target.value)} />
                            </div>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-gray-300 hover:border-indigo-400 bg-gray-50 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="space-y-1 text-center">
                                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <span className="relative font-medium text-indigo-600">
                                            {file ? file.name : 'Select document file'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">PDF, PNG, JPG up to 2MB</p>
                                </div>
                                <input type="file" className="hidden" ref={fileInputRef} onChange={e => {
                                    const selectedFile = e.target.files[0];
                                    if (selectedFile && selectedFile.size > 2 * 1024 * 1024) {
                                        toast.error('File size is too large. Maximum allowed size is 2MB.');
                                        e.target.value = ''; // Reset input
                                        return;
                                    }
                                    setFile(selectedFile);
                                }} accept=".pdf,image/*,.doc,.docx,.txt" required />
                            </div>
                            <div className="pt-4 flex gap-3 justify-end">
                                <Button type="button" variant="ghost" onClick={() => setIsUploadModalOpen(false)} disabled={uploading}>Cancel</Button>
                                <Button type="submit" disabled={!file || !title || uploading} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]">
                                    {uploading ? 'Uploading...' : 'Save & Upload'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {isShareModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsShareModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col max-h-[80vh]">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Share2 className="h-5 w-5 text-indigo-600" />
                                    Share Document
                                </h2>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">Sharing: {selectedDoc?.file_name}</p>
                            </div>
                            <button onClick={() => setIsShareModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input type="text" placeholder="Search by name or role (e.g. Doctor)..." className="w-full h-10 rounded-md border pl-9 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={shareSearchTerm} onChange={e => setShareSearchTerm(e.target.value)} />
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {filteredUsers.length === 0 ? (
                                <p className="text-center py-8 text-sm text-muted-foreground">No users found.</p>
                            ) : filteredUsers.map(u => (
                                <div key={u.account_id} className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50 transition-all hover:translate-x-1">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-white border flex items-center justify-center text-indigo-600">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{u.name} ({u.custom_id})</p>
                                            <p className="text-[10px] text-indigo-600 font-semibold uppercase tracking-tighter">{u.role}</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={selectedDoc?.shared_with?.some(sw => sw.account_id === u.account_id) ? "ghost" : "outline"}
                                        disabled={sharingId === u.account_id || selectedDoc?.shared_with?.some(sw => sw.account_id === u.account_id)}
                                        onClick={() => handleShare(u.account_id)}
                                        className="h-8 text-xs font-bold"
                                    >
                                        {selectedDoc?.shared_with?.some(sw => sw.account_id === u.account_id) ? "Access Active" : "Give Access"}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DocCard = ({ doc, isOwner, onDelete, onShareClick, onRevoke }) => {
    const { token } = useAuth();
    const downloadUrl = `/api/documents/${doc.document_id}/download?token=${token}`;

    return (
        <div className="group relative bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col h-full overflow-hidden">
            {isOwner && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onDelete(doc.document_id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Delete Device">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-110">
                    <FileText className="h-6 w-6" />
                </div>
                {!isOwner && (
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-1 rounded-md uppercase tracking-tighter">Shared Folder</span>
                )}
            </div>

            <div className="space-y-1 mb-4 flex-1">
                <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{doc.file_name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 italic min-h-[2rem]">
                    {doc.description || "No description provided."}
                </p>
            </div>

            {!isOwner && (
                <div className="flex items-center gap-2 mb-4 p-2 bg-slate-50 rounded-lg">
                    <div className="h-6 w-6 bg-white rounded-full flex items-center justify-center text-indigo-600 border text-[10px] font-bold">
                        {doc.shared_by_name?.charAt(0)}
                    </div>
                    <div className="text-[10px]">
                        <p className="font-bold leading-none">{doc.shared_by_name} ({doc.shared_by_custom_id})</p>
                        <p className="text-slate-400 font-medium uppercase tracking-tight">{doc.shared_by_role}</p>
                    </div>
                </div>
            )}

            <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(doc.created_at).toLocaleDateString()}</span>
                    <span>{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                </div>

                <div className="flex items-center gap-2">
                    <a href={downloadUrl} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200">
                        <Download className="h-3 w-3" /> View/Download
                    </a>
                    {isOwner && (
                        <Button
                            variant="outline"
                            onClick={onShareClick}
                            className="flex-shrink-0 h-9 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            <Share2 className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>

                {isOwner && doc.shared_with && doc.shared_with.length > 0 && (
                    <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-500">
                        <p className="text-[10px] font-bold text-slate-400 mb-2 flex items-center gap-1"><Users className="h-3 w-3" /> Shared with:</p>
                        <div className="flex flex-wrap gap-1">
                            {doc.shared_with.map(sw => (
                                <div key={sw.account_id} className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 pr-1 group/chip hover:border-indigo-200 hover:bg-indigo-50 transition-colors">
                                    <span className="text-[10px] font-semibold text-slate-700">{sw.name} ({sw.custom_id})</span>
                                    <button
                                        onClick={() => onRevoke(doc.document_id, sw.account_id)}
                                        className="p-0.5 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors"
                                        title="Revoke Access"
                                    >
                                        <X className="h-2.5 w-2.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const EmptyState = ({ icon: Icon, title, desc, onAction, btnText }) => (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm">
        <div className="flex flex-col items-center justify-center space-y-4 max-w-xs mx-auto">
            <div className="h-16 w-16 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-400 ring-8 ring-indigo-50/50 mb-2">
                <Icon className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            {onAction && (
                <Button variant="outline" className="mt-4 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold" onClick={onAction}>
                    <PlusCircle className="mr-2 h-4 w-4" /> {btnText}
                </Button>
            )}
        </div>
    </div>
);

export default Documents;


