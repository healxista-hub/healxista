import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Fallback to undefined/null for 'io' to use the same origin
        const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || undefined;

        const newSocket = io(socketUrl, {
            transports: ['websocket'],
            withCredentials: true,
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
