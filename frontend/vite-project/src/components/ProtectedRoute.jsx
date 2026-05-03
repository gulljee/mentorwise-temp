// Protected route wrapper that redirects to login if user is not authenticated

import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
