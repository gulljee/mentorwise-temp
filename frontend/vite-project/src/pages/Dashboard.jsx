// Dashboard wrapper component that renders role-based dashboards

import React, { useEffect, useState } from 'react';
import MentorDashboard from './MentorDashboard';
import MenteeDashboard from './MenteeDashboard';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userString = localStorage.getItem('user');

        if (!userString) {
            navigate('/login');
            return;
        }

        try {
            const user = JSON.parse(userString);
            setUserRole(user.role);
        } catch (error) {
            console.error('Error parsing user data:', error);
            navigate('/login');
        }
    }, [navigate]);

    if (!userRole) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return userRole === 'Mentor' ? <MentorDashboard /> : <MenteeDashboard />;
}
