import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Clock, CheckCircle2, Video, VideoOff, Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchApi } from '@/utils/api';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useChatCall } from '@/context/ChatCallContext';

const ChatBox = ({ bookingId, status, providerName, initialCallData = null, onClose, isVideoEnabled = false }) => {
    const { user } = useAuth();
    const socket = useSocket();
    const { 
        autoAcceptCall, setAutoAcceptCall,
        setGlobalCallState,
        setGlobalCallBookingId,
        setGlobalCallPartnerName,
        setGlobalCallDuration
    } = useChatCall();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // --- WebRTC & Calling State System ---
    const [callState, setCallState] = useState(initialCallData ? 'incoming' : null); // null | 'calling' | 'incoming' | 'connecting' | 'connected'
    const [incomingCallData, setIncomingCallData] = useState(initialCallData || null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const iceCandidatesQueueRef = useRef([]);
    const signalQueueRef = useRef([]);
    
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const timerIntervalRef = useRef(null);

    // Global Consultation State Synchronization
    useEffect(() => {
        setGlobalCallState(callState);
        setGlobalCallBookingId(callState ? bookingId : null);
        setGlobalCallPartnerName(callState ? providerName : null);
    }, [callState, bookingId, providerName]);

    useEffect(() => {
        setGlobalCallDuration(callDuration);
    }, [callDuration]);

    // Auto-accept call when triggered globally
    useEffect(() => {
        if (autoAcceptCall && callState === 'incoming') {
            console.log("⚡ Auto-accepting consultation from global banner...");
            setAutoAcceptCall(false); // Reset global trigger
            handleAcceptCall();
        }
    }, [autoAcceptCall, callState]);

    // Clean teardown helper
    const resetCallState = () => {
        console.log("Cleaning and resetting calling session...");
        iceCandidatesQueueRef.current = [];
        signalQueueRef.current = [];
        
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                track.stop();
                console.log(`Media device track ${track.kind} released.`);
            });
            localStreamRef.current = null;
        }

        if (remoteStreamRef.current) {
            remoteStreamRef.current.getTracks().forEach(track => track.stop());
            remoteStreamRef.current = null;
        }

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        setCallState(null);
        setIncomingCallData(null);
        setIsMuted(false);
        setIsVideoOff(false);
        setCallDuration(0);
    };

    // Timer utility
    const startTimer = () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setCallDuration(0);
        timerIntervalRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
    };

    const formatDuration = (sec) => {
        const mins = Math.floor(sec / 60);
        const secs = sec % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Audio/Video control togglers
    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = isMuted; // Toggle
            });
            setIsMuted(!isMuted);
            toast.info(isMuted ? "Microphone active" : "Microphone muted");
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => {
                track.enabled = isVideoOff; // Toggle
            });
            setIsVideoOff(!isVideoOff);
            toast.info(isVideoOff ? "Camera stream active" : "Camera stream paused");
        }
    };

    // WebRTC connection negotiator
    const startWebRTC = async (isCaller) => {
        try {
            console.log("Initializing secure peer connection. Caller status:", isCaller);
            let stream = null;
            try {
                // Try video and audio first
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                console.log("🎬 Successfully secured full video & audio streams.");
            } catch (err1) {
                console.warn("⚠️ Failed to secure full video/audio stream. Attempting audio-only fallback...", err1);
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                    setIsVideoOff(true); // Automatically update state since camera is unavailable
                    toast.info("No camera detected. Connecting via Audio Only.");
                } catch (err2) {
                    console.warn("⚠️ Failed to secure audio stream. Attempting video-only fallback...", err2);
                    try {
                        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                        setIsMuted(true); // Automatically update state since mic is unavailable
                        toast.info("No microphone detected. Connecting via Video Only.");
                    } catch (err3) {
                        console.error("⚠️ All hardware media requests rejected/failed.", err3);
                        // Safe final fallback: empty media stream
                        const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                        if (!isSecure) {
                            toast.warning("Camera/Mic blocked: Modern browsers require HTTPS or 'localhost' to access media devices. Connecting via virtual stream fallback.");
                        } else {
                            toast.warning("Camera/Mic blocked or already in use by another browser tab. Please grant permission. Connecting via virtual stream fallback.");
                        }
                        
                        const mockContext = new (window.AudioContext || window.webkitAudioContext)();
                        const mockDst = mockContext.createMediaStreamDestination();
                        stream = mockDst.stream;
                        setIsVideoOff(true);
                        setIsMuted(true);
                    }
                }
            }
            localStreamRef.current = stream;
            
            // Allow state to propagate, then mount srcObject
            setTimeout(() => {
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            }, 100);

            const configuration = {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' }
                ]
            };
            const pc = new RTCPeerConnection(configuration);
            peerConnectionRef.current = pc;

            // Flush and process any queued early signaling packets
            setTimeout(async () => {
                if (signalQueueRef.current.length > 0) {
                    console.log(`⚡ Processing ${signalQueueRef.current.length} queued early signaling packets...`);
                    const queue = [...signalQueueRef.current];
                    signalQueueRef.current = [];
                    for (const data of queue) {
                        await handleSignalPacket(data);
                    }
                }
            }, 150);

            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            });

            pc.ontrack = (event) => {
                console.log("Hooked remote user media track:", event.track, event.streams);
                const stream = event.streams[0] || new MediaStream([event.track]);
                remoteStreamRef.current = stream;
                
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = stream;
                    remoteVideoRef.current.play().catch(err => {
                        console.warn("⚠️ Failed to autoplay remote video stream with sound:", err);
                    });
                }
                setCallState('connected');
                startTimer();
            };

            pc.onicecandidate = (event) => {
                if (event.candidate && socket) {
                    socket.emit('webrtc_signal', {
                        bookingId,
                        signal: { ice: event.candidate }
                    });
                }
            };

            pc.onconnectionstatechange = () => {
                console.log("WebRTC state transition:", pc.connectionState);
                if (pc.connectionState === 'connected') {
                    setCallState('connected');
                } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
                    toast.info("Consultation connection lost.");
                    resetCallState();
                }
            };

            if (isCaller) {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit('webrtc_signal', {
                    bookingId,
                    signal: { sdp: offer }
                });
            }
        } catch (err) {
            console.error("WebRTC hardware failure:", err);
            toast.error("Failed to secure media inputs. Check system mic/camera settings.");
            if (isCaller) {
                socket.emit('cancel_call', { bookingId });
            } else {
                socket.emit('decline_call', { bookingId });
            }
            resetCallState();
        }
    };

    // Calling triggers
    const handleInitiateCall = () => {
        if (!socket) return;
        setCallState('calling');
        socket.emit('initiate_call', {
            bookingId,
            callerId: user.id,
            callerName: user.name || "User"
        });
        toast.info("Ringing...");
    };

    const handleCancelCall = () => {
        if (!socket) return;
        socket.emit('cancel_call', { bookingId });
        resetCallState();
    };

    const handleAcceptCall = () => {
        if (!socket) return;
        socket.emit('accept_call', { bookingId });
        setCallState('connecting');
        startWebRTC(false);
    };

    const handleDeclineCall = () => {
        if (!socket) return;
        socket.emit('decline_call', { bookingId });
        resetCallState();
    };

    const handleEndCall = () => {
        if (!socket) return;
        socket.emit('end_call', { bookingId });
        resetCallState();
    };

    // Hook listeners for inbound calling signals
    useEffect(() => {
        if (!socket) return;

        socket.on('incoming_call', (data) => {
            console.log("Received inbound connection request:", data);
            if (!callState) {
                setIncomingCallData(data);
                setCallState('incoming');
            } else {
                socket.emit('decline_call', { bookingId });
            }
        });

        socket.on('call_accepted', () => {
            if (callState === 'calling') {
                setCallState('connecting');
                startWebRTC(true);
            }
        });

        socket.on('call_declined', () => {
            toast.error("Call was declined or doctor/patient is busy.");
            resetCallState();
        });

        socket.on('call_cancelled', () => {
            toast.info("Inbound call cancelled by caller.");
            resetCallState();
        });

        socket.on('call_ended', () => {
            toast.info("Call ended by partner.");
            resetCallState();
        });

        return () => {
            socket.off('incoming_call');
            socket.off('call_accepted');
            socket.off('call_declined');
            socket.off('call_cancelled');
            socket.off('call_ended');
        };
    }, [socket, callState, bookingId]);

    const handleSignalPacket = async (data) => {
        if (!peerConnectionRef.current) return;
        const { signal } = data;
        
        try {
            if (signal.sdp) {
                console.log("✅ Setting WebRTC remote description type:", signal.sdp.type);
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                console.log("✅ Remote description set successfully.");

                // Apply any queued ICE candidates
                while (iceCandidatesQueueRef.current.length > 0) {
                    const candidate = iceCandidatesQueueRef.current.shift();
                    console.log("⚡ Applying queued ICE candidate:", candidate);
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate))
                        .catch(e => console.warn("Error applying queued ICE candidate:", e));
                }

                if (signal.sdp.type === 'offer') {
                    const answer = await peerConnectionRef.current.createAnswer();
                    await peerConnectionRef.current.setLocalDescription(answer);
                    socket.emit('webrtc_signal', {
                        bookingId,
                        signal: { sdp: answer }
                    });
                }
            } else if (signal.ice) {
                if (peerConnectionRef.current.remoteDescription && peerConnectionRef.current.remoteDescription.type) {
                    console.log("⚡ Adding direct ICE candidate:", signal.ice);
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signal.ice));
                } else {
                    console.log("⏳ Queueing early incoming ICE candidate.");
                    iceCandidatesQueueRef.current.push(signal.ice);
                }
            }
        } catch (err) {
            console.error("WebRTC Negotiation alignment error:", err);
        }
    };

    // Hook signaling listeners for WebRTC negotiation packets
    useEffect(() => {
        if (!socket) return;

        socket.on('webrtc_signal', async (data) => {
            if (!peerConnectionRef.current) {
                console.log("⏳ Queueing early incoming signaling packet:", data.signal);
                signalQueueRef.current.push(data);
                return;
            }
            await handleSignalPacket(data);
        });

        return () => {
            socket.off('webrtc_signal');
        };
    }, [socket, bookingId]);

    // Auto cleanup on unmount
    useEffect(() => {
        return () => {
            resetCallState();
        };
    }, []);

    // Global Call Banner Auto-Accept Action
    useEffect(() => {
        if (autoAcceptCall) {
            console.log("⚡ Auto-accepting call triggered by global banner");
            setAutoAcceptCall(false); // Reset immediately
            if (!callState) {
                setCallState('incoming');
            }
            setTimeout(() => {
                handleAcceptCall();
            }, 100);
        }
    }, [autoAcceptCall]);

    // Resilient local stream rendering binder
    useEffect(() => {
        if ((callState === 'connected' || callState === 'connecting' || callState === 'calling') && localStreamRef.current && localVideoRef.current) {
            console.log("🎥 Declaratively binding local stream to video DOM element.");
            localVideoRef.current.srcObject = localStreamRef.current;
            localVideoRef.current.play().catch(e => console.warn("Local video autoplay failed:", e));
        }
    }, [callState, localVideoRef.current, localStreamRef.current]);

    // Resilient remote stream rendering binder
    useEffect(() => {
        if ((callState === 'connected' || callState === 'connecting') && remoteStreamRef.current && remoteVideoRef.current) {
            console.log("📺 Declaratively binding remote stream to video DOM element.");
            remoteVideoRef.current.srcObject = remoteStreamRef.current;
            remoteVideoRef.current.play().catch(e => console.warn("Remote video autoplay failed:", e));
        }
    }, [callState, remoteVideoRef.current, remoteStreamRef.current]);

    // Chat is DISABLED only when the booking is fully terminal (Cancelled or any Completed variant).
    // All other active statuses keep chat enabled for all roles.
    const DISABLED_STATUSES = ['Cancelled', 'Completed', 'Consultation Completed', 'Rejected'];
    const isChatActive = !DISABLED_STATUSES.includes(status);

    useEffect(() => {
        const loadMessages = async () => {
            try {
                const data = await fetchApi(`/api/chat/${bookingId}`);
                if (data && data.messages) {
                    setMessages(data.messages);
                    // Mark as read after load
                    await fetchApi(`/api/chat/${bookingId}/read`, { method: 'PUT' });
                }
            } catch (err) {
                console.error("Error loading chat:", err);
            } finally {
                setLoading(false);
                scrollToBottom();
            }
        };

        loadMessages();
    }, [bookingId]);

    useEffect(() => {
        if (!socket) return;

        socket.emit('join_chat', bookingId);
        console.log("Joined chat room for booking", bookingId);

        socket.on('receive_message', (msg) => {
            setMessages((prev) => [...prev, msg]);
            scrollToBottom();
            
            // If the message is not from me, mark it read
            if (msg.sender_id !== user.id) {
                fetchApi(`/api/chat/${bookingId}/read`, { method: 'PUT' }).catch(console.error);
            }
        });

        return () => {
            socket.emit('leave_chat', bookingId);
            socket.off('receive_message');
        };
    }, [socket, bookingId, user.id]);

    const scrollToBottom = () => {
        setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !isChatActive) return;

        const optimisticMessage = {
            message_id: 'temp-' + Date.now(),
            sender_id: user.id,
            message: newMessage,
            created_at: new Date().toISOString(),
            is_read: false
        };
        
        // Optimistic UI update
        // We will wait for true server response instead to avoid duplicates since server emits it back via socket
        const bodyContent = newMessage;
        setNewMessage('');

        try {
             await fetchApi(`/api/chat/${bookingId}`, {
                method: 'POST',
                body: JSON.stringify({ message: bodyContent })
            });
            // The socket 'receive_message' will append the actual message
        } catch (err) {
            console.error("Failed to send message:", err);
            // Revert message in UI? Left as simple approach: just log error
        }
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed bottom-4 right-4 md:bottom-24 md:right-8 w-[350px] md:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-[100] overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between text-white shrink-0 shadow-md">
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            {providerName || 'Chat'}
                        </h3>
                        <p className="text-xs text-blue-100 flex items-center gap-1 mt-0.5">
                            Status: 
                            <span className={`font-semibold px-1.5 py-0.5 rounded ${
                                isChatActive
                                    ? 'bg-green-500/20 text-green-100'
                                    : 'bg-red-500/20 text-red-100'
                            }`}>
                                {status}
                            </span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isVideoEnabled && (
                            incomingCallData && (callState === 'incoming' || !callState) ? (
                                <div className="flex items-center gap-1.5">
                                    <Button 
                                        onClick={handleAcceptCall}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center gap-1 px-2.5 py-1 text-[10px] md:text-xs font-black shadow-md border border-emerald-400/20 shrink-0 h-8 animate-pulse"
                                    >
                                        <Video className="h-3.5 w-3.5" /> Receive Call
                                    </Button>
                                    <Button 
                                        onClick={handleDeclineCall}
                                        className="bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shrink-0 h-8 w-8 shadow-md"
                                    >
                                        <PhoneOff className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ) : (
                                isChatActive && !callState && (
                                    <Button 
                                        onClick={handleInitiateCall}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center gap-1.5 px-3 py-1.5 text-xs font-black shadow-md border border-emerald-400/20 shrink-0 h-8"
                                    >
                                        <Video className="h-3.5 w-3.5" /> Connect Now
                                    </Button>
                                )
                            )
                        )}
                        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 rounded-full h-8 w-8">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-3">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400">Loading chat...</div>
                    ) : messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                            <Clock className="h-8 w-8 text-slate-300" />
                            <p className="text-sm">No messages yet. Send a message to start!</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const isMe = msg.sender_id === user.id;
                            const showName = !isMe && (idx === 0 || messages[idx - 1].sender_id !== msg.sender_id);
                            
                            return (
                                <div key={msg.message_id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                    {showName && (
                                        <span className="text-[10px] text-slate-400 ml-2 mb-1 font-semibold">{msg.first_name} {msg.last_name}</span>
                                    )}
                                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm ${
                                        isMe 
                                        ? 'bg-blue-600 text-white rounded-br-sm' 
                                        : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'
                                    }`}>
                                        <p className="text-sm break-words whitespace-pre-wrap">{msg.message}</p>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            {formatTime(msg.created_at)}
                                        </span>
                                        {isMe && msg.is_read && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white border-t border-slate-100 shrink-0">
                    {!isChatActive ? (
                        <div className="text-center p-3 text-sm text-slate-500 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-slate-400 shrink-0" />
                            Chat closed — service is <span className="font-semibold ml-1">{status}</span>.
                        </div>
                    ) : (
                        <form onSubmit={handleSend} className="flex gap-2">
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 rounded-full bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                            />
                            <Button 
                                type="submit" 
                                size="icon" 
                                disabled={!newMessage.trim()}
                                className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shrink-0 shadow-md transition-transform active:scale-95"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    )}
                </div>
            </motion.div>

            {/* Floating Video Call Overlay */}
            {callState && (
                <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300">
                    <div className="relative w-full max-w-4xl h-[85vh] bg-slate-900/95 rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-30 bg-gradient-to-b from-slate-950/60 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-white/95 text-xs font-black tracking-widest uppercase">Secure Consultation Session</span>
                                {callState === 'connected' && (
                                    <span className="bg-slate-850 text-emerald-400 text-xs px-3 py-1 rounded-full font-mono font-bold tracking-wider">
                                        {formatDuration(callDuration)}
                                    </span>
                                )}
                            </div>
                            <span className="text-slate-300 text-xs font-black uppercase tracking-widest bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700/50">
                                {providerName || "Participant"}
                            </span>
                        </div>

                        {/* Main Viewport */}
                        <div className="flex-1 relative flex items-center justify-center bg-slate-950">
                            {/* Outgoing Calling State */}
                            {callState === 'calling' && (
                                <div className="flex flex-col items-center gap-6 z-20">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                                        <div className="h-24 w-24 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                                            <Video className="h-10 w-10 animate-bounce" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-white text-2xl font-black uppercase tracking-tight">Ringing...</h3>
                                        <p className="text-slate-400 text-sm font-semibold">Connecting secure lines to {providerName || "Participant"}</p>
                                    </div>
                                    <Button onClick={handleCancelCall} className="bg-rose-600 hover:bg-rose-700 text-white rounded-full px-8 py-3.5 font-bold uppercase tracking-wider flex items-center gap-2 mt-4 shadow-lg shadow-rose-600/30">
                                        <PhoneOff className="h-4 w-4" /> Cancel Call
                                    </Button>
                                </div>
                            )}

                            {/* Incoming Call State */}
                            {callState === 'incoming' && incomingCallData && (
                                <div className="flex flex-col items-center gap-6 z-20">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                                        <div className="h-24 w-24 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-500/25">
                                            <Video className="h-10 w-10 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-white text-2xl font-black uppercase tracking-tight">Incoming Video Consultation</h3>
                                        <p className="text-slate-400 text-sm font-semibold">{incomingCallData.callerName || "Provider"} is calling you</p>
                                    </div>
                                    <div className="flex items-center gap-4 mt-4">
                                        <Button onClick={handleAcceptCall} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8 py-3.5 font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/25">
                                            <Video className="h-4 w-4" /> Receive Call
                                        </Button>
                                        <Button onClick={handleDeclineCall} className="bg-rose-600 hover:bg-rose-700 text-white rounded-full px-8 py-3.5 font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-600/25">
                                            <PhoneOff className="h-4 w-4" /> Decline
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Connecting Handshake State */}
                            {callState === 'connecting' && (
                                <div className="flex flex-col items-center gap-4 z-20">
                                    <div className="h-14 w-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                    <h3 className="text-white text-sm font-black tracking-widest uppercase">Securing media stream channels...</h3>
                                </div>
                            )}

                            {/* Connected Remote Video Stream */}
                            {(callState === 'connected' || callState === 'connecting') && (
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover transition-opacity duration-300"
                                />
                            )}

                            {/* Floating Self Local Video Stream Thumbnail */}
                            {(callState === 'connected' || callState === 'connecting' || callState === 'calling') && (
                                <div className="absolute bottom-28 right-6 w-32 h-44 md:w-44 md:h-60 bg-slate-950 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl z-20 transition-all hover:scale-105">
                                    {isVideoOff ? (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
                                            <VideoOff className="h-8 w-8" />
                                        </div>
                                    ) : (
                                        <video
                                            ref={localVideoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full h-full object-cover transform -scale-x-100"
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Bottom Actions Floating Bar */}
                        {(callState === 'connected' || callState === 'connecting') && (
                            <div className="absolute bottom-0 inset-x-0 p-6 flex justify-center items-center gap-6 z-30 bg-gradient-to-t from-slate-950/80 to-transparent">
                                <Button 
                                    onClick={toggleMute} 
                                    variant="ghost"
                                    className={`h-14 w-14 rounded-full flex items-center justify-center border text-white transition-all shadow-md shrink-0 ${
                                        isMuted 
                                            ? 'bg-rose-500/20 border-rose-500 text-rose-500 hover:bg-rose-500/35' 
                                            : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700'
                                    }`}
                                >
                                    {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                                </Button>

                                <Button 
                                    onClick={handleEndCall} 
                                    className="h-16 w-16 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-xl shadow-rose-600/30 active:scale-95 transition-transform shrink-0"
                                >
                                    <PhoneOff className="h-7 w-7" />
                                </Button>

                                <Button 
                                    onClick={toggleVideo} 
                                    variant="ghost"
                                    className={`h-14 w-14 rounded-full flex items-center justify-center border text-white transition-all shadow-md shrink-0 ${
                                        isVideoOff 
                                            ? 'bg-rose-500/20 border-rose-500 text-rose-500 hover:bg-rose-500/35' 
                                            : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700'
                                    }`}
                                >
                                    {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ChatBox;
