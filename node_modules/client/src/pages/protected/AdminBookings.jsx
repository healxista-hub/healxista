import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, CheckCircle2, AlertCircle, X, Search, UserCheck, FileText, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { exportToCSV } from '@/utils/exportUtils';

const AdminBookings = () => {
    const { token } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filterStatus, setFilterStatus] = useState('All');
    const [filterService, setFilterService] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [providers, setProviders] = useState([]);
    const [providersLoading, setProvidersLoading] = useState(false);
    const [searchProvider, setSearchProvider] = useState('');

    // Payment Verification Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPaymentBooking, setSelectedPaymentBooking] = useState(null);

    // Booking Details Modal State
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedDetailsBooking, setSelectedDetailsBooking] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, [token]);

    const fetchBookings = async () => {
        try {
            const hostname = window.location.hostname;
            const res = await fetch(`/api/admin/bookings`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            } else {
                toast.error("Failed to load bookings.");
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
            toast.error("Server error.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAssignModal = async (booking) => {
        setSelectedBooking(booking);
        setIsAssignModalOpen(true);
        setProviders([]);
        setProvidersLoading(true);

        try {
            // Determine which type of providers to fetch based on service_type
            // Map frontend serviceType to admin record types
            let recordType = 'ambulance'; // Default
            const sName = (booking.service_name || '').toLowerCase();
            if (sName.includes('doctor')) recordType = 'doctor';
            if (sName.includes('physio')) recordType = 'physiotherapy';
            if (sName.includes('medicine')) recordType = 'medicine';
            if (sName.includes('old age') || sName.includes('home')) recordType = 'old-age';

            const hostname = window.location.hostname;
            const res = await fetch(`/api/admin/records/${recordType}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                // Filter verified only
                setProviders(data.filter(p => p.is_verified));
            } else {
                toast.error(`Failed to load ${recordType} providers.`);
            }
        } catch (error) {
            console.error("Error fetching providers:", error);
        } finally {
            setProvidersLoading(false);
        }
    };

    const handleAssignProvider = async (providerId, providerTypeRaw) => {
        // providerType needs to be the actual table name (registered_drivers etc.) to be safe
        let providerType = 'Driver';
        const sName = (selectedBooking.service_name || '').toLowerCase();
        if (sName.includes('doctor')) providerType = 'Doctor';
        if (sName.includes('physio')) providerType = 'Physiotherapy';
        if (sName.includes('medicine')) providerType = 'Medicine Store';
        if (sName.includes('old age') || sName.includes('home')) providerType = 'Old Age Home';

        try {
            const hostname = window.location.hostname;
            const res = await fetch(`/api/admin/bookings/${selectedBooking.id}/assign`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignedTo: providerId, providerType })
            });

            if (res.ok) {
                toast.success("Task assigned successfully!");
                setIsAssignModalOpen(false);
                fetchBookings(); // Refresh bookings
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to assign task.");
            }
        } catch (error) {
            console.error("Error assigning task:", error);
            toast.error("Server error during assignment.");
        }
    };

    const handleVerifyPayment = async (id) => {
        if (!window.confirm('Are you sure you want to verify this payment?')) return;
        try {
            const res = await fetch(`/api/bookings/${id}/verify-payment`, {
                method: 'PUT',
                credentials: 'include'
            });

            if (res.ok) {
                toast.success('Payment verified successfully!');
                fetchBookings();
            } else {
                toast.error('Failed to verify payment.');
            }
        } catch (error) {
            console.error("Error verifying payment:", error);
            toast.error("Server error.");
        }
    };

    const handleOpenPaymentModal = (booking) => {
        setSelectedPaymentBooking(booking);
        setIsPaymentModalOpen(true);
    };

    const handleOpenDetailsModal = (booking) => {
        setSelectedDetailsBooking(booking);
        setIsDetailsModalOpen(true);
    };

    const StatusBadge = ({ status }) => {
        if (status === 'Pending') {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
        }
        if (status === 'Assigned') {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Assigned</span>;
        }
        if (status === 'Completed') {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Completed</span>;
        }
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    };

    const filteredBookings = bookings.filter(b => {
        const matchesStatus = filterStatus === 'All' || b.status === filterStatus || (filterStatus === 'Assigned' && b.status === 'Accepted');
        const sName = (b.service_name || b.booking_type || '').toLowerCase();
        const matchesService = filterService === 'All' || sName.includes(filterService);
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = b.patient_name?.toLowerCase().includes(searchLower) ||
            b.id?.toString().includes(searchLower) ||
            b.contact_number?.includes(searchLower);
        return matchesStatus && matchesService && matchesSearch;
    });

    return (
        <div className="space-y-4 md:space-y-5">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
            >
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <ClipboardList className="h-8 w-8 text-red-600" />
                        Booking <span className="text-red-600">Hub</span>
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] md:text-[10px] mt-1">Global Service Order & Logistics Pipeline</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => exportToCSV(bookings, 'Bookings_List')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors shadow-sm border border-indigo-100 font-black uppercase tracking-widest text-[11px]"
                    >
                        <Download className="h-4 w-4" /> Download
                    </button>
                    <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        <span className="text-[11px] font-black uppercase tracking-widest">
                            {bookings.filter(b => b.status === 'Completed').length} Orders Fulfilled
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Logistics Intelligence Controls */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm"
            >
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by ID, Patient Name, or Node Identity..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-14 w-full pl-14 pr-6 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-red-500/20 font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-black placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest shadow-inner"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="h-14 px-6 rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest border-none focus:ring-2 focus:ring-red-500/20 cursor-pointer appearance-none min-w-[160px] w-full sm:w-auto"
                        >
                            <option value="All">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Assigned">Assigned</option>
                            <option value="Payment Verification Pending">Payment Verifying</option>
                            <option value="Payment Confirmed">Payment Confirmed</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>

                        <select
                            value={filterService}
                            onChange={(e) => setFilterService(e.target.value)}
                            className="h-14 px-6 rounded-2xl bg-slate-50 text-slate-600 font-black uppercase text-[10px] tracking-widest border border-slate-100 focus:ring-2 focus:ring-red-500/20 cursor-pointer appearance-none min-w-[160px] w-full sm:w-auto"
                        >
                            <option value="All">All</option>
                            <option value="ambulance">Ambulance</option>
                            <option value="doctor">Doctor</option>
                            <option value="physiotherapy">Physiotherapy</option>
                            <option value="medicine">Medicine</option>
                            <option value="old age">Old Age</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            <div className="grid gap-6">
                {loading ? (
                    <div className="p-12 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Synchronizing Global Logistics...</div>
                ) : filteredBookings.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No active orders detected in pipeline.</div>
                ) : (
                    filteredBookings.map((booking) => (
                        <motion.div
                            layout
                            key={booking.id}
                            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                        >
                            <div className="p-6 md:p-8">
                                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-[2rem] bg-slate-900 border border-slate-800 flex flex-col items-center justify-center shadow-lg shadow-slate-200 group-hover:scale-105 transition-transform overflow-hidden shrink-0">
                                            <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-tighter">ORD</span>
                                            <span className="text-base md:text-xl font-black text-red-500">#{booking.id}</span>
                                        </div>
                                        <div>
                                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-1">
                                                <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">{booking.patient_name || 'ANONYMOUS-UNIT'}</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className={`px-2.5 py-1 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border ${booking.status === 'Completed' || booking.status === 'Payment Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        booking.status === 'Payment Verification Pending' ? 'bg-purple-50 text-purple-600 border-purple-100 animate-pulse' :
                                                        booking.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                            'bg-slate-50 text-slate-500 border-slate-100'
                                                        }`}>
                                                        {booking.status}
                                                    </span>
                                                    <span className={`px-2.5 py-1 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border ${booking.emergency_level === 'critical' ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' :
                                                        booking.emergency_level === 'urgent' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                            'bg-slate-50 text-slate-500 border-slate-100'
                                                        }`}>
                                                        {booking.emergency_level || 'Standard'}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-slate-500 font-bold text-sm">Sector: <span className="text-slate-800 uppercase">{booking.service_name || booking.booking_type}</span></p>
                                            <div className="flex flex-wrap items-center gap-4 mt-3">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Time</span>
                                                    <span className="text-xs font-bold text-slate-700">{new Date(booking.scheduled_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} &bull; {new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div className="h-8 w-px bg-slate-100 hidden sm:block" />
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inception Point</span>
                                                    <span className="text-xs font-bold text-slate-600 truncate max-w-[200px]">{booking.pickup_location || 'CLASSIFIED'}</span>
                                                </div>
                                                {booking.slot_number && (
                                                    <div className="flex flex-col gap-0.5 border-l border-slate-100 pl-4">
                                                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest italic">Clinical Slot</span>
                                                        <span className="text-xs font-black text-indigo-600 uppercase">#{booking.slot_number} &bull; {booking.consultation_time}</span>
                                                    </div>
                                                )}
                                                {booking.drop_location && (
                                                    <div className="flex flex-col gap-0.5 border-l border-slate-100 pl-4">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Extraction Node</span>
                                                        <span className="text-xs font-bold text-slate-600 truncate max-w-[200px]">{booking.drop_location}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:items-end gap-3 w-full lg:w-auto">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <button
                                                onClick={() => handleOpenDetailsModal(booking)}
                                                className="h-12 px-6 rounded-2xl bg-slate-100 text-slate-700 font-black uppercase tracking-widest text-[11px] hover:bg-slate-200 transition-all shadow-sm flex items-center gap-2"
                                            >
                                                <FileText className="h-4 w-4" />
                                                View Details
                                            </button>
                                            {booking.status === 'Pending' ? (
                                                <button
                                                    onClick={() => handleOpenAssignModal(booking)}
                                                    className="h-12 px-8 rounded-2xl bg-red-600 text-white font-black uppercase tracking-widest text-[11px] hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center gap-2"
                                                >
                                                    <UserCheck className="h-4 w-4" />
                                                    Task Assign
                                                </button>
                                            ) : booking.status === 'Payment Verification Pending' ? (
                                                <button
                                                    onClick={() => handleOpenPaymentModal(booking)}
                                                    className="h-12 px-8 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest text-[11px] hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2"
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    View & Verify Payment
                                                </button>
                                            ) : booking.provider_name && booking.provider_name !== 'Unassigned' ? (
                                                <div className="px-5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl shadow-slate-200 flex items-center gap-3">
                                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Operative</span>
                                                        <span className="text-[11px] font-black text-white uppercase tracking-wider">{booking.provider_name}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Manual Override Required</span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact: {booking.contact_number}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Assignment Modal */}
            <AnimatePresence>
                {isAssignModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAssignModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-card rounded-xl shadow-2xl flex flex-col max-h-[85vh]"
                        >
                            <div className="flex justify-between items-center p-4 border-b">
                                <h3 className="text-lg font-bold">Assign to Provider</h3>
                                <button onClick={() => setIsAssignModalOpen(false)} className="p-1 hover:bg-muted rounded-full transition">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-4 border-b bg-muted/20">
                                <div className="text-sm">
                                    <span className="font-semibold">Patient:</span> {selectedBooking?.patient_name} <br />
                                    <span className="font-semibold">Service Required:</span> <span className="capitalize">{selectedBooking?.service_type}</span> <br />
                                    <span className="font-semibold">Pickup:</span> {selectedBooking?.pickup_location}
                                </div>
                                <div className="mt-3 relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search provider by name..."
                                        value={searchProvider}
                                        onChange={(e) => setSearchProvider(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="p-0 overflow-y-auto flex-1">
                                {providersLoading ? (
                                    <div className="p-8 text-center text-muted-foreground">Loading available providers...</div>
                                ) : providers.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        No verified providers found for this service type.
                                    </div>
                                ) : (
                                    <ul className="divide-y text-sm">
                                        {providers
                                            .filter(p => p.name.toLowerCase().includes(searchProvider.toLowerCase()))
                                            .map(p => (
                                                <li key={p.id} className="flex justify-between items-center p-4 hover:bg-muted/50 transition">
                                                    <div>
                                                        <div className="font-semibold text-primary">{p.name}</div>
                                                        <div className="text-xs text-muted-foreground">{p.mobile || 'No contact info'}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAssignProvider(p.id)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-xs font-semibold transition"
                                                    >
                                                        <UserCheck className="h-4 w-4" /> Assign
                                                    </button>
                                                </li>
                                            ))}
                                    </ul>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Payment Verification Modal */}
            <AnimatePresence>
                {isPaymentModalOpen && selectedPaymentBooking && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsPaymentModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
                        >
                            <div className="p-6 md:p-8 bg-slate-900 text-white flex justify-between items-start relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                                        Payment Details
                                    </h2>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                                        Ref #{selectedPaymentBooking.id}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    className="relative z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="p-6 md:p-8 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Amount Paid</p>
                                        <p className="text-3xl font-black text-slate-900">₹{selectedPaymentBooking.payment_amount || '1000'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Payer Name</p>
                                            <p className="font-bold text-slate-800">{selectedPaymentBooking.payment_payer_name || 'N/A'}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Mobile Number</p>
                                            <p className="font-bold text-slate-800">{selectedPaymentBooking.payment_payer_mobile || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex gap-4">
                                    <button
                                        onClick={() => setIsPaymentModalOpen(false)}
                                        className="flex-1 h-12 rounded-xl text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleVerifyPayment(selectedPaymentBooking.id);
                                            setIsPaymentModalOpen(false);
                                        }}
                                        className="flex-1 h-12 rounded-xl bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-emerald-700 transition-all"
                                    >
                                        Confirm Payment
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Booking Details Modal */}
            <AnimatePresence>
                {isDetailsModalOpen && selectedDetailsBooking && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDetailsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
                        >
                            <div className="flex-shrink-0 p-6 md:p-8 bg-slate-900 text-white flex justify-between items-start relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                                        <ClipboardList className="text-blue-400 h-6 w-6" /> Order Information
                                    </h2>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                                        Ref #{selectedDetailsBooking.id} • {selectedDetailsBooking.service_name || selectedDetailsBooking.booking_type}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsDetailsModalOpen(false)}
                                    className="relative z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Patient Info */}
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">Patient Details</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase">Name</p>
                                                <p className="text-sm font-bold text-slate-800">{selectedDetailsBooking.patient_name || 'N/A'}</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase">Age</p>
                                                    <p className="text-sm font-bold text-slate-800">{selectedDetailsBooking.age || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase">Gender</p>
                                                    <p className="text-sm font-bold text-slate-800">{selectedDetailsBooking.gender || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase">Contact Number</p>
                                                <p className="text-sm font-bold text-slate-800">{selectedDetailsBooking.contact_number || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logistics Info */}
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">Service Logistics</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase">Status</p>
                                                <StatusBadge status={selectedDetailsBooking.status} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase">Scheduled At</p>
                                                <p className="text-sm font-bold text-slate-800">{new Date(selectedDetailsBooking.scheduled_at).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase">Account User</p>
                                                <p className="text-sm font-bold text-slate-800">{selectedDetailsBooking.user_name} ({selectedDetailsBooking.user_role})</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Medical/Details */}
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm md:col-span-2">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">Clinical Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase">Symptoms / Notes</p>
                                                <p className="text-sm font-medium text-slate-700 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedDetailsBooking.symptoms || 'None provided'}</p>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase">Pickup Location</p>
                                                    <p className="text-sm font-bold text-slate-800">{selectedDetailsBooking.pickup_location || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase">Drop Location</p>
                                                    <p className="text-sm font-bold text-slate-800">{selectedDetailsBooking.drop_location || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Provider Info */}
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm md:col-span-2 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Assigned Provider</h3>
                                            {selectedDetailsBooking.provider_name && selectedDetailsBooking.provider_name !== 'Unassigned' ? (
                                                <p className="text-base font-black text-indigo-600 uppercase">{selectedDetailsBooking.provider_name} <span className="text-xs text-slate-400">({selectedDetailsBooking.provider_role})</span></p>
                                            ) : (
                                                <p className="text-sm font-bold text-slate-500 italic">No provider assigned yet</p>
                                            )}
                                        </div>
                                        {selectedDetailsBooking.total_amount && (
                                            <div className="text-right">
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Amount</h3>
                                                <p className="text-xl font-black text-slate-800">₹{selectedDetailsBooking.total_amount}</p>
                                            </div>
                                        )}
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

export default AdminBookings;



