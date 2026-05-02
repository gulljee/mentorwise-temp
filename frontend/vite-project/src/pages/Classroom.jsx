// Classroom page — Scholarly Atelier design, original backend logic preserved
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Subject-to-icon mapping for the badge icons on each card
const SUBJECT_ICON_MAP = {
    'DSA': { icon: 'psychology', bg: 'bg-primary-container', text: 'text-on-primary-container' },
    'OOP': { icon: 'data_object', bg: 'bg-tertiary-fixed', text: 'text-on-tertiary-fixed' },
    'PF': { icon: 'terminal', bg: 'bg-surface-container-highest', text: 'text-primary' },
    'AOA': { icon: 'calculate', bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
    'Database': { icon: 'storage', bg: 'bg-primary-fixed', text: 'text-on-primary-fixed-variant' },
    'Web Development': { icon: 'devices', bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
    'Machine Learning': { icon: 'lan', bg: 'bg-tertiary-fixed', text: 'text-on-tertiary-fixed' },
    'Software Engineering': { icon: 'engineering', bg: 'bg-primary-container', text: 'text-on-primary-container' },
    'Computer Networks': { icon: 'hub', bg: 'bg-surface-container-highest', text: 'text-primary' },
    'Operating Systems': { icon: 'memory', bg: 'bg-primary-fixed', text: 'text-on-primary-fixed-variant' },
    'General Mentorship': { icon: 'menu_book', bg: 'bg-primary-fixed', text: 'text-on-primary-fixed-variant' },
};

function getIconMeta(subject) {
    return SUBJECT_ICON_MAP[subject] || { icon: 'school', bg: 'bg-primary-container', text: 'text-on-primary-container' };
}

export default function Classroom() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isMentor = user.role === 'Mentor';

    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');

    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/connections/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setNotifications(data.notifications || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markNotificationRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/connections/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Error marking notification read:', error);
        }
    };

    // ── identical fetch logic ───────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem('token');
        const url = isMentor
            ? 'http://localhost:5000/api/connections/students'
            : 'http://localhost:5000/api/connections/mentors';

        fetch(url, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(data => {
                setConnections(isMentor ? (data.students || []) : (data.mentors || []));
            })
            .catch(console.error)
            .finally(() => setLoading(false));

        fetchNotifications();
        const pollInterval = setInterval(() => {
            fetchNotifications();
        }, 15000); // Poll every 15s

        return () => clearInterval(pollInterval);
    }, []);

    // ── one card per accepted connection ───────────────────────────
    const mentorOwnSubjects = isMentor ? (user.subjects || []) : [];

    const cards = [];
    connections.forEach(conn => {
        if (isMentor) {
            const mentee = conn.mentee;
            // Use the subject agreed upon in the connection request
            const subject = conn.subject || 'General Mentorship';
            cards.push({ subject, person: mentee, connectionId: conn._id });
        } else {
            const mentor = conn.mentor;
            // Use the subject agreed upon in the connection request
            const subject = conn.subject || 'General Mentorship';
            cards.push({ subject, person: mentor, connectionId: conn._id });
        }
    });


    // Unique subjects for filter bar
    const allSubjects = ['All', ...new Set(cards.map(c => c.subject))];
    const filteredCards = activeFilter === 'All' ? cards : cards.filter(c => c.subject === activeFilter);

    const dashPath = isMentor ? '/dashboard/mentor' : '/dashboard/mentee';
    const userInitials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`;

    return (
        <div className="bg-background font-body text-on-surface flex min-h-screen">

            {/* ── Sidebar ── */}
            <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex-col p-6 space-y-4 z-50">
                <div className="mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white overflow-hidden ring-2 ring-primary/10"
                            style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}>
                            {user.profileImage ? (
                                <img src={`http://localhost:5000/${user.profileImage}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined">architecture</span>
                            )}
                        </div>
                        <div>
                            <h2 className="font-headline text-lg font-black text-primary">Mentor Wise</h2>
                            <p className="text-xs text-slate-500 font-medium">{isMentor ? 'Lead Mentor' : 'Mentee'}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    <button
                        onClick={() => navigate(dashPath)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-surface-container transition-all rounded-lg"
                    >
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="font-medium">Dashboard</span>
                    </button>
                    <div className="flex items-center gap-3 px-4 py-3 text-primary font-bold bg-surface-container-lowest rounded-lg shadow-sm">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                        <span className="font-medium">Classroom</span>
                    </div>
                </nav>

                <div className="mt-auto space-y-4">
                    <button
                        onClick={() => navigate(dashPath)}
                        className="w-full py-3 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
                        style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back to Dashboard
                    </button>
                    <div className="pt-4 border-t border-outline-variant/10 space-y-1">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-error transition-colors"
                        >
                            <span className="material-symbols-outlined text-xl">logout</span>
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="flex-1 md:ml-64 min-h-screen flex flex-col">

                {/* Top bar */}
                <header className="w-full top-0 sticky z-40 flex justify-between items-center px-8 py-4"
                    style={{ background: '#f9f9fe', borderBottom: '1px solid rgba(195,198,209,0.3)' }}>
                    <div className="flex items-center gap-4">
                        <h1 className="font-headline text-xl font-bold text-primary tracking-tight">My Classroom</h1>
                    </div>
                    <div className="flex items-center gap-4 text-primary">
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="hover:opacity-70 transition-opacity active:scale-95 p-1 relative"
                            >
                                <span className="material-symbols-outlined cursor-pointer hover:text-primary-container transition-colors">notifications</span>
                                {notifications.some(n => !n.read) && (
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-error border-2 border-white rounded-full" />
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-outline-variant/10 overflow-hidden z-[60]">
                                    <div className="p-4 bg-primary text-white flex justify-between items-center">
                                        <h3 className="font-bold text-sm">Notifications</h3>
                                        <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Recent</span>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-10 text-center text-on-surface-variant italic text-xs">
                                                No notifications yet
                                            </div>
                                        ) : (
                                            notifications.map(n => (
                                                <div
                                                    key={n._id}
                                                    onClick={() => markNotificationRead(n._id)}
                                                    className={`p-4 border-b border-outline-variant/5 cursor-pointer hover:bg-surface-container-low transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                                                >
                                                    <p className={`text-xs ${!n.read ? 'font-bold text-primary' : 'text-on-surface-variant'}`}>{n.message}</p>
                                                    <p className="text-[10px] text-outline-variant mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm border-2 border-primary/10 overflow-hidden">
                            {user.profileImage ? (
                                <img src={`http://localhost:5000/${user.profileImage}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                                userInitials || 'MW'
                            )}
                        </div>
                    </div>
                </header>

                {/* ── Content ── */}
                <section className="p-8 md:p-12 space-y-12 flex-1">

                    {/* Page header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="max-w-2xl">
                            <span className="text-on-surface-variant font-bold text-xs uppercase tracking-widest block mb-2">Academic Year 2026</span>
                            <h2 className="font-headline text-5xl md:text-6xl font-extrabold text-primary tracking-tighter leading-tight">
                                {isMentor ? 'Student Directory' : 'My Classes'}
                            </h2>
                            <p className="text-on-surface-variant mt-4 text-lg leading-relaxed">
                                {isMentor
                                    ? 'Manage your active cohort of mentees. Track academic progress, schedule upcoming reviews, and facilitate direct scholarly communication.'
                                    : 'Access your subjects and connect with your mentors. Track your academic journey and upcoming sessions.'}
                            </p>
                        </div>
                        <div className="flex gap-3 flex-shrink-0">
                            <div className="bg-secondary-fixed px-6 py-4 rounded-xl flex items-center gap-4 shadow-sm">
                                <div className="text-on-secondary-fixed text-3xl font-black font-headline">
                                    {loading ? '—' : String(cards.length).padStart(2, '0')}
                                </div>
                                <div className="text-on-secondary-fixed-variant text-xs font-bold leading-tight uppercase">
                                    {isMentor ? 'Active\nMentees' : 'Active\nClasses'}<br />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter bar */}
                    {!loading && cards.length > 0 && (
                        <div className="bg-surface-container-low p-2 rounded-2xl flex flex-wrap gap-2">
                            {allSubjects.map(subject => (
                                <button
                                    key={subject}
                                    onClick={() => setActiveFilter(subject)}
                                    className={`px-6 py-2 rounded-xl text-sm font-medium transition-colors ${activeFilter === subject
                                        ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                                        : 'text-on-surface-variant hover:bg-surface-container'
                                        }`}
                                >
                                    {subject}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Card grid / loading / empty */}
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center py-32">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                <p className="text-on-surface-variant text-sm font-medium">Loading classroom...</p>
                            </div>
                        </div>

                    ) : filteredCards.length === 0 ? (
                        <div className="flex items-center justify-center py-32">
                            <div className="text-center max-w-sm">
                                <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="material-symbols-outlined text-4xl text-outline-variant">school</span>
                                </div>
                                <h2 className="font-headline text-2xl font-bold text-primary mb-3">
                                    {isMentor ? 'No mentees yet' : 'No classes yet'}
                                </h2>
                                <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
                                    {isMentor
                                        ? 'Accept connection requests from mentees to see their classes here.'
                                        : 'Connect with mentors to see your classes appear here.'}
                                </p>
                                <button
                                    onClick={() => navigate(dashPath)}
                                    className="px-8 py-3 text-white font-bold rounded-xl transition-all active:scale-95"
                                    style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}
                                >
                                    {isMentor ? 'Go to Dashboard' : 'Find Mentors'}
                                </button>
                            </div>
                        </div>

                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredCards.map((card, idx) => {
                                const person = card.person;
                                const iconMeta = getIconMeta(card.subject);
                                const initials = `${person?.firstName?.[0] || ''}${person?.lastName?.[0] || ''}`;

                                return (
                                    <div
                                        key={`${card.connectionId}-${card.subject}-${idx}`}
                                        onClick={() => navigate(
                                            `/classroom/${isMentor ? 'mentor' : 'mentee'}/detail`,
                                            { state: { subject: card.subject, person: card.person, connectionId: card.connectionId, colorIdx: idx } }
                                        )}
                                        className="group relative bg-surface-container-lowest p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col cursor-pointer"
                                        style={{ outline: '1px solid rgba(195,198,209,0.15)' }}
                                    >
                                        {/* Icon row */}
                                        <div className="flex justify-between items-start mb-6">
                                            {/* Avatar profile image */}
                                            <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xl shadow-md flex-shrink-0 overflow-hidden">
                                                {person?.profileImage ? (
                                                    <img src={`http://localhost:5000/${person.profileImage}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{initials}</span>
                                                )}
                                            </div>
                                            {/* Subject icon badge */}
                                            <div className={`${iconMeta.bg} ${iconMeta.text} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                <span className="material-symbols-outlined text-xl">{iconMeta.icon}</span>
                                            </div>
                                        </div>

                                        {/* Name + subject */}
                                        <div className="space-y-1 mb-6">
                                            <h3 className="font-headline text-xl font-bold text-primary">
                                                {person?.firstName} {person?.lastName}
                                            </h3>
                                            <p className="text-on-surface-variant text-sm font-medium">{card.subject}</p>
                                        </div>

                                        {/* Footer */}
                                        <div className="mt-auto pt-4 border-t border-outline-variant/10 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-sm">
                                                {isMentor ? 'person' : 'school'}
                                            </span>
                                            <span className="text-xs font-bold text-on-surface-variant">
                                                {isMentor ? 'Mentee' : 'Mentor'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}


                        </div>
                    )}
                </section>


            </main>

            {/* ── Mobile Bottom Nav ── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-outline-variant/10 px-6 py-4 flex justify-between items-center z-50">
                <button onClick={() => navigate(dashPath)} className="flex flex-col items-center gap-1 text-slate-500">
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="text-[10px] font-bold">Dash</span>
                </button>
                <div className="flex flex-col items-center gap-1 text-primary font-bold">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                    <span className="text-[10px] uppercase tracking-tighter">Class</span>
                </div>
                <div className="relative -top-8">
                    <button
                        onClick={() => navigate(dashPath)}
                        className="w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}
                    >
                        <span className="material-symbols-outlined text-2xl">add</span>
                    </button>
                </div>
                <button onClick={() => navigate(dashPath)} className="flex flex-col items-center gap-1 text-slate-500">
                    <span className="material-symbols-outlined">groups</span>
                    <span className="text-[10px] font-bold">Team</span>
                </button>
                <button
                    onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }}
                    className="flex flex-col items-center gap-1 text-slate-500"
                >
                    <span className="material-symbols-outlined">logout</span>
                    <span className="text-[10px] font-bold">Exit</span>
                </button>
            </nav>

        </div>
    );
}
