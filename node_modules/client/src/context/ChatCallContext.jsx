import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { fetchApi } from '@/utils/api';
import { toast } from 'sonner';

const ChatCallContext = createContext();

export const useChatCall = () => useContext(ChatCallContext);

export const ChatCallProvider = ({ children }) => {
    const { user } = useAuth();
    const socket = useSocket();
    const [activeChatBooking, setActiveChatBooking] = useState(null);
    const [incomingCallDataGlobal, setIncomingCallDataGlobal] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [autoAcceptCall, setAutoAcceptCall] = useState(false);

    const fetchBookings = async () => {
        if (!user) return;
        setLoadingBookings(true);
        try {
            const isUser = user.role.toLowerCase() === 'user' || user.role.toLowerCase() === 'patient';
            const endpoint = isUser ? '/api/bookings' : '/api/bookings/assigned';
            const data = await fetchApi(endpoint);
            if (data) setBookings(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching bookings in global context:', error);
        } finally {
            setLoadingBookings(false);
        }
    };

    // Initial and periodic fetch
    useEffect(() => {
        if (user) {
            fetchBookings();
            const interval = setInterval(fetchBookings, 30000); // Poll every 30s to keep bookings fresh
            return () => clearInterval(interval);
        } else {
            setBookings([]);
            setActiveChatBooking(null);
            setIncomingCallDataGlobal(null);
        }
    }, [user]);

    // Auto-join personal user room for direct call push notifications
    useEffect(() => {
        if (socket && user?.id) {
            socket.emit('join_user', user.id);
            console.log(`📡 Registered socket in personal user room: user_${user.id}`);
        }
    }, [socket, user]);

    // Auto-join socket chat rooms for active calling bookings
    useEffect(() => {
        if (!socket || !user || !bookings.length) return;

        bookings.forEach(booking => {
            const status = booking.status;
            // Join chat for any booking where communication might be possible (non-terminal statuses)
            const TERMINAL_STATUSES = ['Cancelled', 'Completed', 'Consultation Completed', 'Rejected'];
            if (!TERMINAL_STATUSES.includes(status)) {
                const bookingId = booking.booking_id || booking.id;
                socket.emit('join_chat', bookingId);
                console.log(`📡 Global ChatCallContext: Auto-joined room booking_${bookingId}`);
            }
        });
    }, [socket, user, bookings]);

    const [globalCallState, setGlobalCallState] = useState(null);
    const [globalCallBookingId, setGlobalCallBookingId] = useState(null);
    const [globalCallPartnerName, setGlobalCallPartnerName] = useState(null);
    const [globalCallDuration, setGlobalCallDuration] = useState(0);

    // Handle global incoming calls
    useEffect(() => {
        if (!socket || !user) return;

        const handleIncomingCall = async (data) => {
            console.log("☎️ Global inbound call notification received:", data);
            
            // Set incoming call globally IMMEDIATELY without waiting for database/API fetch!
            setIncomingCallDataGlobal(data);
            
            toast.info(`Incoming video consultation from ${data.callerName || 'Participant'}!`, {
                duration: 8000,
            });

            // Re-fetch bookings in the background to ensure list is synchronized
            try {
                const isUser = user.role.toLowerCase() === 'user' || user.role.toLowerCase() === 'patient';
                const endpoint = isUser ? '/api/bookings' : '/api/bookings/assigned';
                const latestBookings = await fetchApi(endpoint);
                if (latestBookings) {
                    setBookings(latestBookings);
                }
            } catch (err) {
                console.warn("Background bookings refresh failed or delayed:", err);
            }
        };

        socket.on('incoming_call', handleIncomingCall);

        return () => {
            socket.off('incoming_call', handleIncomingCall);
        };
    }, [socket, user]);

    return (
        <ChatCallContext.Provider value={{
            activeChatBooking,
            setActiveChatBooking,
            incomingCallDataGlobal,
            setIncomingCallDataGlobal,
            bookings,
            fetchBookings,
            loadingBookings,
            autoAcceptCall,
            setAutoAcceptCall,
            globalCallState,
            setGlobalCallState,
            globalCallBookingId,
            setGlobalCallBookingId,
            globalCallPartnerName,
            setGlobalCallPartnerName,
            globalCallDuration,
            setGlobalCallDuration
        }}>
            {children}
        </ChatCallContext.Provider>
    );
};
