import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
    const { token, user } = useAuth();
    const location = useLocation();

    // Always allow access to registration pages — users should be able to create new accounts
    const isRegisterPage = location.pathname.startsWith('/register');
    if (isRegisterPage) {
        return children;
    }

    // For login pages: redirect already-logged-in users to their dashboard
    if (token && user && user.role) {
        const role = user.role.toLowerCase();
        // Redirect to their specific dashboard
        const dashboardPath = role === 'admin' ? '/admin-dashboard' 
            : (role === 'user' || role === 'patient') ? '/dashboard'
            : `/${role.replace('_', '-')}-dashboard`;

        return <Navigate to={dashboardPath} replace />;
    }

    return children;
};

export default PublicRoute;
