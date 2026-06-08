import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, CheckCircle2, Clock, Search, Mail, Phone, Eye, X, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { exportToCSV } from '@/utils/exportUtils';

const AdminContactMessages = () => {
    const { token } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchMessages();
    }, [token]);

    const fetchMessages = async () => {
        try {
            const hostname = window.location.hostname;
            const res = await fetch(`/api/admin/contacts`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            } else {
                toast.error("Failed to load messages.");
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast.error("Server error.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const hostname = window.location.hostname;
            const res = await fetch(`/api/admin/contacts/${id}/status`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                toast.success(`Message marked as ${newStatus}!`);
                fetchMessages();
                // Optinally close modal if open or update state internally
                if (selectedMessage && selectedMessage.id === id) {
                    setSelectedMessage(prev => ({ ...prev, status: newStatus }));
                }
            } else {
                toast.error("Failed to update status.");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Server error during update.");
        }
    };

    const handleViewDetails = (msg) => {
        setSelectedMessage(msg);
        setIsModalOpen(true);
    };

    const filteredMessages = messages.filter(m => {
        const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            (m.first_name || '').toLowerCase().includes(searchLower) ||
            (m.last_name || '').toLowerCase().includes(searchLower) ||
            (m.email || '').toLowerCase().includes(searchLower) ||
            (m.subject || '').toLowerCase().includes(searchLower);
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-4 md:space-y-5">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <MessageSquare className="h-8 w-8 text-red-600" />
                            Inquiry <span className="text-red-600">Vault</span>
                        </h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Platform Communications & Support Pipeline</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => exportToCSV(messages, 'ContactMessages_List')}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors shadow-sm border border-indigo-100 font-black uppercase tracking-widest text-[11px]"
                        >
                            <Download className="h-4 w-4" /> Download
                        </button>
                        <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200">
                            <MessageSquare className="h-5 w-5 text-emerald-400" />
                            <span className="text-[11px] font-black uppercase tracking-widest">
                                {messages.length} Total Inquiries
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by Name, Email, or Subject..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-14 w-full pl-14 pr-6 rounded-2xl bg-white border-slate-100 focus:ring-2 focus:ring-red-500/20 font-bold text-slate-700 shadow-sm"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="h-14 px-6 rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest border-none focus:ring-2 focus:ring-red-500/20 cursor-pointer appearance-none min-w-[160px]"
                    >
                        <option value="All">All</option>
                        <option value="Pending">Pending</option>
                        <option value="Resolved">Resolved</option>
                    </select>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Scanning Communications...</div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No active inquiries found.</div>
                    ) : (
                        filteredMessages.map((msg) => (
                            <div key={msg.id} className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg">{msg.first_name} {msg.last_name}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(msg.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${msg.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                                        }`}>
                                        {msg.status}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <div className="font-black text-slate-800 uppercase tracking-wide text-xs">{msg.subject || 'NO SUBJECT'}</div>
                                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium">{msg.message}</p>
                                </div>
                                <div className="flex gap-2 pt-2 border-t border-slate-50">
                                    <button onClick={() => handleViewDetails(msg)} className="flex-1 h-10 rounded-xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                                        <Eye className="h-4 w-4" /> View
                                    </button>
                                    {msg.status === 'Pending' ? (
                                        <button onClick={() => handleUpdateStatus(msg.id, 'Resolved')} className="flex-1 h-10 rounded-xl bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px]">
                                            Resolve
                                        </button>
                                    ) : (
                                        <button onClick={() => handleUpdateStatus(msg.id, 'Pending')} className="flex-1 h-10 rounded-xl bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-[10px]">
                                            Reopen
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="hidden md:block bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50">
                                    <th className="px-6 py-4">Sender Information</th>
                                    <th className="px-6 py-4">Inquiry Insight</th>
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4">Lifecycle</th>
                                    <th className="px-6 py-4 text-right">Controls</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12 text-slate-400 font-black uppercase tracking-widest animate-pulse">Syncing Communication Vault...</td>
                                    </tr>
                                ) : filteredMessages.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-xs">No active inquiries detected.</td>
                                    </tr>
                                ) : (
                                    filteredMessages.map((msg) => (
                                        <tr key={msg.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-6 align-top">
                                                <div className="font-black text-slate-900 uppercase tracking-tight text-base whitespace-nowrap">{msg.first_name} {msg.last_name}</div>
                                                <div className="flex items-center text-[11px] font-bold text-slate-400 mt-1.5 gap-1.5 uppercase tracking-wide">
                                                    <Mail className="h-3 w-3 text-red-400" /> {msg.email}
                                                </div>
                                                {msg.phone && (
                                                    <div className="flex items-center text-[11px] font-bold text-slate-400 mt-1 gap-1.5 uppercase tracking-wide">
                                                        <Phone className="h-3 w-3 text-red-400" /> {msg.phone}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-6 align-top max-w-xs md:max-w-md">
                                                <div className="font-black text-slate-800 mb-2 uppercase tracking-wide text-xs">{msg.subject || 'UNSPECIFIED-SUBJECT'}</div>
                                                <div className="text-sm text-slate-500 line-clamp-2 leading-relaxed whitespace-pre-wrap font-medium">{msg.message}</div>
                                            </td>
                                            <td className="px-6 py-6 align-top whitespace-nowrap text-slate-400 text-[10px] font-black uppercase tracking-tighter">
                                                {new Date(msg.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-6 align-top">
                                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 w-max border ${msg.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                                                    }`}>
                                                    {msg.status === 'Resolved' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                                    {msg.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 align-top text-right whitespace-nowrap">
                                                <div className="flex justify-end gap-3 text-sm">
                                                    <button
                                                        onClick={() => handleViewDetails(msg)}
                                                        className="h-10 px-4 rounded-xl bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        <span className="font-black uppercase tracking-widest text-[9px]">View</span>
                                                    </button>
                                                    {msg.status === 'Pending' ? (
                                                        <button
                                                            onClick={() => handleUpdateStatus(msg.id, 'Resolved')}
                                                            className="h-10 px-4 rounded-xl bg-red-600 text-white font-black uppercase tracking-widest text-[9px] hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                                                        >
                                                            Resolve
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleUpdateStatus(msg.id, 'Pending')}
                                                            className="h-10 px-4 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 font-black uppercase tracking-widest text-[9px] transition-all"
                                                        >
                                                            Reopen
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>

            {/* View Details Modal */}
            <AnimatePresence>
                {isModalOpen && selectedMessage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <div className="flex justify-between items-center p-6 border-b">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-blue-600" />
                                    Inquiry Details
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sender</label>
                                        <div className="font-semibold text-gray-900 mt-1">{selectedMessage.first_name} {selectedMessage.last_name}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date Received</label>
                                        <div className="text-gray-900 mt-1">{new Date(selectedMessage.created_at).toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                                        <div className="flex items-center gap-2 text-gray-900 mt-1">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            {selectedMessage.email}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                                        <div className="flex items-center gap-2 text-gray-900 mt-1">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            {selectedMessage.phone || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</label>
                                    <div className="mt-2 text-lg font-semibold text-gray-900 bg-white border rounded-lg p-4">
                                        {selectedMessage.subject || 'No Subject Provided'}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Message</label>
                                    <div className="mt-2 text-gray-700 bg-blue-50/50 border border-blue-100 rounded-lg p-5 whitespace-pre-wrap leading-relaxed">
                                        {selectedMessage.message}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex items-center justify-between">
                                <span className={`px-3 py-1.5 text-sm font-semibold rounded-full flex items-center gap-1 ${selectedMessage.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {selectedMessage.status === 'Resolved' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                    Status: {selectedMessage.status}
                                </span>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition"
                                    >
                                        Close
                                    </button>
                                    {selectedMessage.status === 'Pending' ? (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedMessage.id, 'Resolved')}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition shadow-sm flex items-center justify-center"
                                        >
                                            Mark as Resolved
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedMessage.id, 'Pending')}
                                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-sm font-semibold transition flex items-center justify-center"
                                        >
                                            Reopen Case
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default AdminContactMessages;



