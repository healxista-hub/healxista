import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { token, user } = useAuth();

    // 1. Check if user is authenticated at all
    if (!token || !user || !user.role) {
        return <Navigate to="/provider-portal" replace />;
    }

    const role = user.role.toLowerCase();

    // 2. Check Role-Based Access Control (RBAC) if allowedRoles are provided
    if (allowedRoles && allowedRoles.length > 0) {
        // Normalize allowed roles to lowercase for comparison
        const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase().replace(/_/g, ' '));
        
        // Treat 'patient' as equivalent to 'user'
        const effectiveRole = role === 'patient' ? 'user' : role;
        
        if (!normalizedAllowedRoles.includes(role) && !normalizedAllowedRoles.includes(effectiveRole)) {
            // Unauthorised Role. Send them to their own dashboard.
            const fallbackPath = role === 'admin' ? '/admin-dashboard'
                : (role === 'user' || role === 'patient') ? '/dashboard'
                : `/${role.replace(/ /g, '-')}-dashboard`;

            return <Navigate to={fallbackPath} replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
