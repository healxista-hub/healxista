import React, { useState, useEffect } from 'react';
import { 
    Calendar, Clock, User, CheckCircle, XCircle, MapPin, Check, MessageCircle,
    Download, FileText, Upload, Trash2, Paperclip, Activity, Video
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchApi, getDocUrl } from '@/utils/api';
import UserProfileModal from '@/components/UserProfileModal';
import { useChatCall } from '@/context/ChatCallContext';

const SharedBookingsList = ({ userRole, title, icon: IconComponent, isDoctor = false }) => {
    const { user } = useAuth();
    const { 
        activeChatBooking, 
        setActiveChatBooking, 
        incomingCallDataGlobal, 
        setIncomingCallDataGlobal,
        globalCallState,
        globalCallBookingId,
        setAutoAcceptCall
    } = useChatCall();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [slotDialog, setSlotDialog] = useState(null);
    const [slotData, setSlotData] = useState({ slot_number: '', consultation_time: '' });
    const [selectedProfile, setSelectedProfile] = useState(null);

    const fetchBookings = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const endpoint = userRole === 'user' ? `/api/bookings` : `/api/bookings/assigned`;
            const data = await fetchApi(endpoint);
            if (data) setBookings(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load bookings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [user, userRole]);




    const handleUpdateStatus = async (bookingId, newStatus, slot_number = undefined, consultation_time = undefined) => {
        try {
            const bodyData = { status: newStatus };
            if (slot_number !== undefined) bodyData.slot_number = slot_number;
            if (consultation_time !== undefined) bodyData.consultation_time = consultation_time;

            await fetchApi(`/api/bookings/${bookingId}/status`, {
                method: 'PUT',
                body: JSON.stringify(bodyData)
            });

            toast.success(`Booking marked as ${newStatus}!`);
            fetchBookings();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update booking status.');
        }
    };

    const handleUploadReport = async (bookingId, file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('provider_document', file);
        try {
            await fetchApi(`/api/bookings/${bookingId}/provider-document`, {
                method: 'PUT',
                body: formData
            });
            toast.success('Report uploaded successfully');
            fetchBookings();
        } catch (error) {
            console.error('Error uploading report:', error);
            toast.error('Failed to upload report');
        }
    };

    const handleDeleteReport = async (bookingId) => {
        if (!window.confirm('Remove this clinical report?')) return;
        try {
            await fetchApi(`/api/bookings/${bookingId}/document/provider`, { method: 'DELETE' });
            toast.success('Report removed');
            fetchBookings();
        } catch (error) {
            console.error('Error deleting report:', error);
            toast.error('Failed to remove report');
        }
    };

    const StatusBadge = ({ status }) => {
        let colorClasses = 'bg-gray-100 text-gray-700';
        if (status === 'Pending') colorClasses = 'bg-yellow-100 text-yellow-700';
        if (status === 'Accepted' || status === 'Booking Accepted') colorClasses = 'bg-blue-100 text-blue-700';
        if (status === 'Payment Verification Pending') colorClasses = 'bg-purple-100 text-purple-700';
        if (status === 'Payment Confirmed') colorClasses = 'bg-emerald-100 text-emerald-700';
        if (status === 'Arriving' || status === 'On the Way' || status === 'Slot and Time Given') colorClasses = 'bg-indigo-100 text-indigo-700';
        if (status === 'Completed' || status === 'Consultation Completed') colorClasses = 'bg-green-100 text-green-700';
        if (status === 'Rejected') colorClasses = 'bg-red-100 text-red-700';

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClasses}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-white border border-slate-100 shadow-sm p-5 md:p-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                {IconComponent ? <IconComponent className="h-6 w-6 md:h-8 md:w-8" /> : <Calendar className="h-6 w-6" />}
                            </div>
                            {title}
                        </h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs mt-3 flex items-center gap-2">
                            <span className="h-px w-8 bg-indigo-200" />
                            {userRole === 'user' ? 'Outgoing Service Requests Control' : 'Assigned Medical Case Operations'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest leading-none">
                            {bookings.length} Records Detected
                        </span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-500 font-medium animate-pulse">
                    Loading records...
                </div>
            ) : bookings.length === 0 ? (
                <div className="bg-white p-10 rounded-xl border border-gray-100 shadow-sm text-center space-y-3">
                    <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400">
                        {IconComponent ? <IconComponent className="h-8 w-8" /> : <CheckCircle className="h-8 w-8" />}
                    </div>
                    <p className="text-gray-600 font-medium text-lg">No records found</p>
                    <p className="text-gray-400 text-sm">
                        {userRole === 'user' ? "You haven't made any bookings yet." : "You have no assigned requests at this time."}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {bookings.map((booking) => (
                        <Card key={booking.booking_id || booking.id} className="group hover:border-indigo-200 transition-all shadow-sm hover:shadow-xl rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border-slate-100 bg-white">
                            <CardContent className="p-0">
                                <div className="p-5 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5 md:gap-8">
                                    <div className="flex-1 space-y-5">
                                        <div className="flex items-start md:items-center gap-5">
                                            <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl md:rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                <User className="h-7 w-7 md:h-8 md:w-8 text-indigo-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-black text-lg md:text-2xl text-slate-900 uppercase tracking-tight truncate">
                                                    {userRole === 'user' 
                                                        ? (booking.provider_first_name ? `${booking.provider_first_name} ${booking.provider_last_name}` : booking.service_name || 'Emergency Service') 
                                                        : (booking.patient_name || booking.userName || 'Guest User')
                                                    }
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                                    <span className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                        <Calendar className="h-3 w-3" /> 
                                                        {new Date(booking.scheduled_at || booking.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                    <span className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                        <Clock className="h-3 w-3" /> 
                                                        {new Date(booking.scheduled_at || booking.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {(booking.pickup_location || booking.contact_number || (booking.slot_number && booking.consultation_time)) && (
                                            <div className="md:ml-20 space-y-3 bg-slate-50/50 p-4 md:p-5 rounded-2xl border border-slate-100 shadow-inner">
                                                {booking.slot_number && booking.consultation_time && (
                                                    <div className="flex items-center gap-3 bg-indigo-600 text-white p-3 rounded-xl shadow-lg shadow-indigo-100 mb-3">
                                                        <Calendar className="h-5 w-5 shrink-0" />
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Scheduled Appointment</p>
                                                            <p className="font-black text-sm">Slot {booking.slot_number} @ {booking.consultation_time}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                                                    {booking.contact_number && (
                                                        <div className="flex items-start gap-3">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Contact</span>
                                                            <span className="text-sm font-bold text-slate-700">{booking.contact_number}</span>
                                                        </div>
                                                    )}
                                                    {booking.pickup_location && (
                                                        <div className="flex items-start gap-3">
                                                            <MapPin className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                                            <div className="min-w-0 flex-1">
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Location</span>
                                                                <span className="text-sm font-bold text-slate-700 block truncate">{booking.pickup_location}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {booking.drop_location && (
                                                        <div className="flex items-start gap-3">
                                                            <MapPin className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                                                            <div className="min-w-0 flex-1">
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Destination</span>
                                                                <span className="text-sm font-bold text-slate-700 block truncate">{booking.drop_location}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {booking.additional_notes && (
                                                        <div className="flex items-start gap-3 md:col-span-2 pt-2 border-t border-slate-100/50">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1 shrink-0">Instruction</span>
                                                            <span className="text-sm font-medium text-slate-600 italic leading-relaxed">"{booking.additional_notes}"</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-col md:flex-row lg:flex-col items-stretch lg:items-end gap-4 min-w-[200px] lg:pl-10 lg:border-l border-slate-100 pt-5 lg:pt-0 border-t lg:border-t-0 flex">
                                        <div className="flex items-center justify-between lg:justify-end gap-4 w-full">
                                            <span className="lg:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Case Status</span>
                                            <StatusBadge status={booking.status} />
                                        </div>

                                        <div className="flex flex-col gap-3 w-full mt-2">
                                            {/* Report Handling */}
                                            {booking.provider_document ? (
                                                <div className="flex gap-2 w-full">
                                                    <a 
                                                        href={getDocUrl(booking.provider_document)} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex-1 h-12 flex items-center justify-center gap-2 bg-[#a1e3b6] text-emerald-900 hover:bg-[#8fceb2] font-black uppercase tracking-widest text-[11px] md:text-xs rounded-full transition-all shadow-sm"
                                                    >
                                                        <FileText className="h-4 w-4" /> VIEW REPORT
                                                    </a>
                                                    {userRole === 'provider' && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-12 w-12 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                                            onClick={() => handleDeleteReport(booking.booking_id || booking.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ) : (
                                                userRole === 'provider' && (
                                                    <div className="relative w-full h-12">
                                                        <input 
                                                            type="file" 
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                                            onChange={(e) => handleUploadReport(booking.booking_id || booking.id, e.target.files[0])}
                                                            accept=".pdf,image/*" 
                                                        />
                                                        <Button variant="outline" className="w-full h-full font-black text-[11px] md:text-xs uppercase tracking-widest border-slate-200 rounded-full hover:border-emerald-500 hover:text-emerald-700 transition-all">
                                                            <Upload className="h-4 w-4 mr-2" /> Upload Report
                                                        </Button>
                                                    </div>
                                                )
                                            )}

                                            {/* Unified Communication / Call Status Action Button */}
                                            {['Payment Confirmed', 'Slot and Time Given', 'Arriving', 'On the Way', 'Sample Collected', 'Report Ready', 'Completed', 'Consultation Completed'].includes(booking.status) && (() => {
                                                const currentBookingId = booking.booking_id || booking.id;
                                                const isIncomingThis = incomingCallDataGlobal && incomingCallDataGlobal.bookingId === currentBookingId;
                                                const isActiveCallThis = globalCallState && globalCallBookingId === currentBookingId;
                                                
                                                if (isIncomingThis) {
                                                    return (
                                                        <Button 
                                                            onClick={() => {
                                                                setAutoAcceptCall(true);
                                                                setActiveChatBooking(booking);
                                                            }}
                                                            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[11px] md:text-xs rounded-full transition-all shadow-lg shadow-emerald-200 border border-emerald-400/20 animate-pulse flex items-center justify-center gap-2"
                                                        >
                                                            <Video className="h-4 w-4 shrink-0 animate-bounce" />
                                                            RECEIVE CALL
                                                        </Button>
                                                    );
                                                }
                                                
                                                if (isActiveCallThis) {
                                                    return (
                                                        <Button 
                                                            onClick={() => setActiveChatBooking(booking)}
                                                            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[11px] md:text-xs rounded-full transition-all shadow-lg shadow-indigo-200 border border-indigo-500/20 flex items-center justify-center gap-2"
                                                        >
                                                            <span className="relative flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                            </span>
                                                            ON CALL (TAP TO VIEW)
                                                        </Button>
                                                    );
                                                }
                                                
                                                return (
                                                    <Button 
                                                        onClick={() => setActiveChatBooking(booking)}
                                                        className="w-full h-12 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[11px] md:text-xs rounded-full transition-all shadow-md flex items-center justify-center gap-2"
                                                    >
                                                        <MessageCircle className="h-4 w-4 shrink-0" />
                                                        JOIN COMMUNICATION
                                                    </Button>
                                                );
                                            })()}

                                            {/* User Bio/History (Provider View) */}
                                            {userRole === 'provider' && (
                                                <div className="flex gap-2 w-full">
                                                    <Button 
                                                        onClick={() => setSelectedProfile({ userId: booking.user_id, bookingDoc: booking.user_document })}
                                                        variant="ghost"
                                                        className="flex-1 h-12 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-black uppercase tracking-widest text-[11px] md:text-xs rounded-full border border-slate-200 transition-all"
                                                        size="sm"
                                                    >
                                                        <User className="h-4 w-4 mr-2" /> PROFILE
                                                    </Button>
                                                    {booking.user_document && (
                                                        <a 
                                                            href={getDocUrl(booking.user_document)} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="h-12 w-12 flex items-center justify-center bg-blue-50 text-blue-700 rounded-full border border-blue-100 hover:bg-blue-100 transition-all shrink-0"
                                                            title="View User Shared Record"
                                                        >
                                                            <Paperclip className="h-4 w-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            )}

                                            {userRole === 'provider' && booking.status === 'Pending' && (
                                                <div className="flex gap-2 w-full pt-2 border-t border-slate-50">
                                                    <Button 
                                                        onClick={() => handleUpdateStatus(booking.booking_id || booking.id, isDoctor ? 'Booking Accepted' : 'Accepted')}
                                                        className="flex-1 h-12 bg-slate-900 hover:bg-emerald-600 text-white shadow-lg text-[11px] md:text-xs font-black uppercase tracking-widest rounded-full transition-all"
                                                        size="sm"
                                                    >
                                                        Accept Case
                                                    </Button>
                                                    <Button 
                                                        onClick={() => handleUpdateStatus(booking.booking_id || booking.id, 'Rejected')}
                                                        variant="ghost"
                                                        className="flex-1 h-12 text-rose-600 hover:bg-rose-50 text-[11px] md:text-xs font-black uppercase tracking-widest rounded-full transition-all"
                                                        size="sm"
                                                    >
                                                        Decline
                                                    </Button>
                                                </div>
                                            )}

                                            {userRole === 'provider' && booking.status === 'Payment Confirmed' && !isDoctor && (
                                                <Button 
                                                    onClick={() => handleUpdateStatus(booking.booking_id || booking.id, 'Arriving')}
                                                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg text-[11px] md:text-xs font-black uppercase tracking-widest rounded-full transition-all"
                                                    size="sm"
                                                >
                                                    <MapPin className="h-4 w-4 mr-2 animate-pulse" /> Dispatch Arriving
                                                </Button>
                                            )}

                                            {userRole === 'provider' && booking.status === 'Payment Confirmed' && isDoctor && (
                                                <Button 
                                                    onClick={() => {
                                                        setSlotData({ slot_number: '', consultation_time: '' });
                                                        setSlotDialog(booking.booking_id || booking.id);
                                                    }}
                                                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg text-[11px] md:text-xs font-black uppercase tracking-widest rounded-full transition-all"
                                                    size="sm"
                                                >
                                                    Schedule Slot
                                                </Button>
                                            )}

                                            {userRole === 'provider' && (booking.status === 'Payment Confirmed' || booking.status === 'Arriving' || booking.status === 'Slot and Time Given') && (
                                                <Button 
                                                    onClick={() => handleUpdateStatus(booking.booking_id || booking.id, isDoctor ? 'Consultation Completed' : 'Completed')}
                                                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg text-[11px] md:text-xs font-black uppercase tracking-widest rounded-full transition-all"
                                                    size="sm"
                                                >
                                                    Finalize Case
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {slotDialog && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
                        <h3 className="font-bold text-lg mb-4 text-gray-800">Assign Slot & Time</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Slot Number</label>
                                <input 
                                    type="text" 
                                    className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    value={slotData.slot_number} 
                                    onChange={e => setSlotData({...slotData, slot_number: e.target.value})} 
                                    placeholder="e.g. 15 or Slot 5" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Consultation Time</label>
                                <input 
                                    type="text" 
                                    className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    value={slotData.consultation_time} 
                                    onChange={e => setSlotData({...slotData, consultation_time: e.target.value})} 
                                    placeholder="e.g. 10:30 AM" 
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button onClick={() => setSlotDialog(null)} variant="outline" className="border-gray-200">Cancel</Button>
                            <Button 
                                onClick={() => {
                                    handleUpdateStatus(slotDialog, 'Slot and Time Given', slotData.slot_number, slotData.consultation_time);
                                    setSlotDialog(null);
                                }} 
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                                disabled={!slotData.slot_number || !slotData.consultation_time}
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {selectedProfile && (
                <UserProfileModal 
                    isOpen={!!selectedProfile} 
                    onClose={() => setSelectedProfile(null)} 
                    userId={selectedProfile.userId}
                    bookingDoc={selectedProfile.bookingDoc}
                />
            )}


        </div>
    );
};

export default SharedBookingsList;
