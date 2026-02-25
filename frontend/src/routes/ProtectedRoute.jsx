
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../utils/auth';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const location = useLocation();
    const user = getCurrentUser();
    const isAuth = isAuthenticated();

    if (!isAuth) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0 && user?.role && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role if trying to access unauthorized route
        switch (user.role) {
            case 'admin':
                return <Navigate to="/admin" replace />;
            case 'faculty':
                return <Navigate to="/faculty" replace />;
            case 'student':
                return <Navigate to="/student" replace />;
            case 'parent':
                return <Navigate to="/parent" replace />;
            default:
                return <Navigate to="/login" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
