import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useChatCall } from '@/context/ChatCallContext';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { Button } from '@/components/ui/button';
import { Video, PhoneOff } from 'lucide-react';
import ChatBox from '@/components/ChatBox';

const DashboardLayout = () => {
    const { user } = useAuth();
    const socket = useSocket();
    const { 
        activeChatBooking, 
        setActiveChatBooking, 
        incomingCallDataGlobal, 
        setIncomingCallDataGlobal,
        bookings,
        setAutoAcceptCall,
        globalCallState,
        globalCallBookingId,
        globalCallPartnerName,
        globalCallDuration
    } = useChatCall();

    // Default open on desktop, closed on mobile
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const location = useLocation();

    // Close sidebar on mobile when route changes
    useEffect(() => {
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    }, [location]);

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const formatDuration = (sec) => {
        const mins = Math.floor(sec / 60);
        const secs = sec % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50/50">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Main Content Area */}
            <div className={cn(
                "flex-1 flex flex-col min-w-0 overflow-hidden relative transition-[padding] duration-300 ease-in-out",
                isSidebarOpen ? "md:pl-64" : "pl-0"
            )}>
                {/* Header */}
                <DashboardHeader toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

                {/* Page Outlet */}
                <main className="flex-1 overflow-y-auto relative focus:outline-none p-4 sm:p-6 md:p-8">
                    <div className="max-w-[1600px] mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Global Ringing Notification Banner */}
            {incomingCallDataGlobal && !activeChatBooking && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-bounce-slow">
                    <div className="bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 text-white rounded-full shadow-2xl px-6 py-4 flex items-center gap-6 max-w-md">
                        <div className="flex items-center gap-3">
                            <div className="relative flex">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                                <div className="relative p-2.5 bg-emerald-500 text-white rounded-full">
                                    <Video className="h-5 w-5 animate-pulse" />
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] leading-none">
                                    Incoming Video Consult
                                </h4>
                                <p className="text-xs text-slate-300 font-semibold mt-1 truncate">
                                    {incomingCallDataGlobal.callerName || 'Consultant'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                onClick={() => {
                                    const targetBooking = bookings.find(b => (b.booking_id || b.id) === incomingCallDataGlobal.bookingId) || {
                                        id: incomingCallDataGlobal.bookingId,
                                        booking_id: incomingCallDataGlobal.bookingId,
                                        status: 'Active Call',
                                        userName: incomingCallDataGlobal.callerName,
                                        patient_name: incomingCallDataGlobal.callerName
                                    };
                                    setAutoAcceptCall(true);
                                    setActiveChatBooking(targetBooking);
                                }} 
                                size="sm" 
                                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-black text-xs px-3.5 h-8 shadow-md border border-emerald-400/20"
                            >
                                Receive Call
                            </Button>
                            <Button 
                                onClick={() => {
                                    if (socket) {
                                        socket.emit('decline_call', { bookingId: incomingCallDataGlobal.bookingId });
                                    }
                                    setIncomingCallDataGlobal(null);
                                }} 
                                size="sm" 
                                variant="destructive"
                                className="bg-rose-600 hover:bg-rose-700 text-white rounded-full font-black text-xs px-3 h-8 shadow-md"
                            >
                                <PhoneOff className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Minimized Live Call / Ongoing Consultation Banner */}
            {globalCallState && !activeChatBooking && (
                <div className="fixed bottom-6 right-6 z-50 animate-bounce-slow">
                    <div className="bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 text-white rounded-3xl shadow-2xl p-4 flex items-center gap-4 max-w-sm">
                        <div className="relative flex shrink-0">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                            <div className="relative p-3 bg-emerald-500 text-white rounded-2xl">
                                <Video className="h-5 w-5 animate-pulse" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                            <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">
                                {globalCallState === 'connected' ? 'Live Call Ongoing' : 'Call Ringing...'}
                            </h4>
                            <p className="text-sm font-bold text-white mt-1 truncate">
                                {globalCallPartnerName || 'Participant'}
                            </p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">
                                Duration: {formatDuration(globalCallDuration)}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => {
                                    const targetBooking = bookings.find(b => (b.booking_id || b.id) === globalCallBookingId);
                                    if (targetBooking) {
                                        setActiveChatBooking(targetBooking);
                                    } else {
                                        setActiveChatBooking({ id: globalCallBookingId, status: 'Active Call', provider_name: globalCallPartnerName });
                                    }
                                }}
                                size="sm"
                                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs px-3 h-8 shadow-md border border-emerald-400/20"
                            >
                                Maximize
                            </Button>
                            <Button
                                onClick={() => {
                                    if (socket && globalCallBookingId) {
                                        socket.emit('end_call', { bookingId: globalCallBookingId });
                                    }
                                    setIncomingCallDataGlobal(null);
                                    setActiveChatBooking(null);
                                    // The ChatBox isn't mounted to call resetCallState(), so manually clear global context here
                                    // Normally ChatBox handles this, but if minimized, DashboardLayout must do it.
                                    if (typeof setGlobalCallState === 'function') setGlobalCallState(null);
                                    if (typeof setGlobalCallBookingId === 'function') setGlobalCallBookingId(null);
                                }}
                                size="sm"
                                variant="destructive"
                                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs px-3 h-8 shadow-md"
                            >
                                Hang Up
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Chat / Call Component */}
            {activeChatBooking && (
                <ChatBox 
                    bookingId={activeChatBooking.booking_id || activeChatBooking.id} 
                    status={activeChatBooking.status}
                    providerName={
                        (user?.role?.toLowerCase() === 'user' || user?.role?.toLowerCase() === 'patient')
                            ? (activeChatBooking.provider_name || (activeChatBooking.provider_first_name ? `${activeChatBooking.provider_first_name} ${activeChatBooking.provider_last_name}` : activeChatBooking.service_name || 'Provider')) 
                            : (activeChatBooking.userName || activeChatBooking.patient_name || 'Patient')
                    }
                    initialCallData={incomingCallDataGlobal}
                    onClose={() => {
                        setActiveChatBooking(null);
                        setIncomingCallDataGlobal(null);
                    }}
                    isVideoEnabled={user?.role?.toLowerCase() === 'doctor' || activeChatBooking.service_name === 'Doctor Appointment'}
                />
            )}
        </div>
    );
};

export default DashboardLayout;
