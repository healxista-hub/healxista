import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = sessionStorage.getItem('user');
            if (!savedUser || savedUser === 'undefined' || savedUser === 'null') return null;
            return JSON.parse(savedUser);
        } catch (err) {
            console.error("AuthContext: Error parsing user from sessionStorage", err);
            sessionStorage.removeItem('user');
            return null;
        }
    });

    // Provide a dummy token true if user exists, for compatibility with existing components
    // that check `if (token)` to see if logged in.
    const token = user ? 'cookie-present' : null;

    useEffect(() => {
        if (!user) {
            sessionStorage.removeItem('user');
        }
    }, [user]);

    const login = (userData) => {
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (err) {
            console.error("Logout error", err);
        }
        setUser(null);
        sessionStorage.removeItem('user');
    };

    useEffect(() => {
        const handleAuthExpired = () => {
            console.warn("Global API Auth Expired caught. Logging out user.");
            logout();
        };

        window.addEventListener('auth_expired', handleAuthExpired);
        return () => window.removeEventListener('auth_expired', handleAuthExpired);
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
