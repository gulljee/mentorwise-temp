// Role-aware route guard — checks both token existence and user role
import { Navigate } from 'react-router-dom';

export default function RoleRoute({ requiredRole, children }) {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!roles.includes(user.role)) {
            return <Navigate to="/login" replace />;
        }
    }

    return children;
}
