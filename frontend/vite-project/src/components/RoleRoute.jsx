// Role-aware route guard — checks both token existence and user role
import { Navigate } from 'react-router-dom';

export default function RoleRoute({ requiredRole, children }) {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
