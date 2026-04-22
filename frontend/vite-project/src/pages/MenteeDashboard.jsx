import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FindMentor from './FindMentor';
import ProfileTab from '../components/ProfileTab';
import StarRating from '../components/StarRating';

const NAV = [
    { id: 'overview',      icon: 'grid_view',     label: 'Overview' },
    { id: 'find-mentors',  icon: 'person_search',  label: 'Find Mentors' },
    { id: 'mentors',       icon: 'groups',         label: 'My Mentors' },
    { id: 'sessions',      icon: 'event',          label: 'My Sessions' },
    { id: 'shared-drive',  icon: 'folder_shared',  label: 'Shared Drive' },
    { id: 'profile',       icon: 'settings',       label: 'Settings' },
];

const MenteeDashboard = () => {
    const navigate    = useNavigate();
    const user        = JSON.parse(localStorage.getItem('user') || '{}');
    const [activeTab, setActiveTab] = useState('overview');

    // ── state (identical to original) ─────────────────────────────────────────
    const [requests,        setRequests]        = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [mentors,         setMentors]         = useState([]);
    const [loadingMentors,  setLoadingMentors]  = useState(false);
    const [sessions,        setSessions]        = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // ── Fetch sent requests ────────────────────────────────────────────────────
    const fetchSentRequests = async () => {
        setLoadingRequests(true);
        try {
            const token    = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/connections/requests/sent', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setRequests(data.requests || []);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoadingRequests(false);
        }
    };

    // ── Fetch connected mentors ────────────────────────────────────────────────
    const fetchConnectedMentors = async () => {
        setLoadingMentors(true);
        try {
            const token    = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/connections/mentors', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setMentors(data.mentors || []);
        } catch (error) {
            console.error('Error fetching mentors:', error);
        } finally {
            setLoadingMentors(false);
        }
    };

    // ── Fetch booked sessions ────────────────────────────────────────────────
    const fetchSessions = async () => {
        setLoadingSessions(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/sessions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setSessions(data.sessions || []);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setLoadingSessions(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'requests') fetchSentRequests();
        else if (activeTab === 'mentors') fetchConnectedMentors();
        else if (activeTab === 'sessions') fetchSessions();
    }, [activeTab]);

    // Initial load
    useEffect(() => {
        fetchSentRequests();
        fetchConnectedMentors();
    }, []);

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const acceptedMentors = mentors.length;
    const userInitials    = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`;

    return (
        <div className="bg-surface font-body text-on-surface min-h-screen">

            {/* ── Sidebar ── */}
            <nav className="fixed left-0 top-0 h-screen w-64 z-50 bg-slate-50 flex flex-col py-8 px-6 shadow-sm" style={{ borderRight: '1px solid #e2e2e7' }}>
                <div className="mb-10 px-2">
                    <h1 className="font-headline text-2xl font-bold tracking-tight text-primary">MentorWise</h1>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-1">Mentee Portal</p>
                </div>

                <div className="space-y-1 flex-grow">
                    {NAV.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.id === 'shared-drive') navigate('/shared-drive');
                                else setActiveTab(item.id);
                            }}
                            className={`w-full flex items-center gap-4 py-3 px-4 transition-all text-left ${
                                activeTab === item.id
                                    ? 'text-primary font-bold bg-surface-container-low border-r-4 border-primary'
                                    : 'text-on-surface/60 font-medium hover:bg-surface-container-low hover:text-primary'
                            }`}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={activeTab === item.id ? { fontVariationSettings: "'FILL' 1" } : {}}
                            >
                                {item.icon}
                            </span>
                            <span className="font-label">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Book a session CTA */}
                <div className="mt-auto space-y-3">
                    <button
                        onClick={() => {
                            if (mentors.length > 0) {
                                const conn = mentors[0];
                                navigate('/classroom/mentee', { state: { person: conn.mentor, connectionId: conn._id } });
                            } else {
                                navigate('/classroom/mentee');
                            }
                        }}
                        className="w-full py-4 rounded-xl text-white font-bold hover:opacity-90 active:scale-95 transition-all"
                        style={{
                            background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)',
                            boxShadow: '0px 20px 40px rgba(26, 28, 32, 0.06)',
                        }}
                    >
                        My Classroom
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-on-surface-variant hover:text-error transition-colors text-sm font-medium"
                    >
                        <span className="material-symbols-outlined text-xl">logout</span>
                        Logout
                    </button>
                </div>
            </nav>

            {/* ── Top App Bar ── */}
            <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 flex items-center justify-end px-10 h-20"
                style={{ background: 'rgba(249,249,254,0.8)', backdropFilter: 'blur(20px)' }}>
                <div className="flex items-center gap-6">
                    <button className="relative text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-0 right-0 w-2 h-2 bg-secondary rounded-full" />
                    </button>
                    <button className="text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">help_outline</span>
                    </button>
                    <div
                        className="flex items-center gap-3 ml-4 cursor-pointer"
                        onClick={() => setActiveTab('profile')}
                        title="Edit profile"
                    >
                        <div className="text-right">
                            <p className="text-sm font-bold text-primary">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-on-surface-variant">{user.department || 'Student'}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm ring-2 ring-surface-container flex-shrink-0">
                            {userInitials || 'MW'}
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Main Content ── */}
            <main className="ml-64 pt-24 pb-12 px-10 min-h-screen">

                {/* ── OVERVIEW TAB ── */}
                {activeTab === 'overview' && (
                    <>
                        {/* Welcome header */}
                        <section className="mb-12">
                            <h2 className="font-headline text-5xl font-extrabold text-primary tracking-tight mb-2">
                                Welcome back, {user.firstName}
                            </h2>
                            <p className="text-on-surface-variant text-lg">
                                Your academic journey is making significant progress this week.
                            </p>
                        </section>

                        <div className="grid grid-cols-12 gap-8">

                            {/* ── Quick Stats Row ── */}
                            <div className="col-span-12 grid grid-cols-3 gap-8 mb-4">
                                {/* My Mentors stat */}
                                <div className="bg-surface-container-lowest p-8 rounded-xl relative overflow-hidden group"
                                    style={{ boxShadow: '0px 20px 40px rgba(26,28,32,0.06)' }}>
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-container/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
                                    <p className="font-label text-on-surface-variant uppercase tracking-widest text-xs mb-2">My Mentors</p>
                                    <h3 className="font-headline text-4xl font-bold text-primary">
                                        {loadingMentors ? '—' : String(acceptedMentors).padStart(2, '0')}
                                    </h3>
                                    {/* Mentor initials stack */}
                                    <div className="mt-4 flex -space-x-2">
                                        {mentors.slice(0, 3).map((conn, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-primary-container flex items-center justify-center text-on-primary-container text-[10px] font-bold flex-shrink-0">
                                                {conn.mentor?.firstName?.[0]}{conn.mentor?.lastName?.[0]}
                                            </div>
                                        ))}
                                        {mentors.length > 3 && (
                                            <div className="w-8 h-8 rounded-full bg-surface-container border-2 border-white flex items-center justify-center text-[10px] font-bold">
                                                +{mentors.length - 3}
                                            </div>
                                        )}
                                        {mentors.length === 0 && !loadingMentors && (
                                            <p className="text-xs text-on-surface-variant mt-1">No mentors yet</p>
                                        )}
                                    </div>
                                </div>

                                {/* Pending Requests stat */}
                                <div className="bg-surface-container-lowest p-8 rounded-xl relative overflow-hidden group"
                                    style={{ boxShadow: '0px 20px 40px rgba(26,28,32,0.06)' }}>
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary-fixed/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
                                    <p className="font-label text-on-surface-variant uppercase tracking-widest text-xs mb-2">Pending Requests</p>
                                    <h3 className="font-headline text-4xl font-bold text-primary">
                                        {loadingRequests ? '—' : String(pendingRequests.length).padStart(2, '0')}
                                    </h3>
                                    <p className="mt-4 text-sm font-semibold text-secondary flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">event</span>
                                        {pendingRequests.length > 0 ? `${pendingRequests.length} awaiting response` : 'All caught up!'}
                                    </p>
                                </div>

                                {/* Classroom shortcut stat */}
                                <div
                                    onClick={() => navigate('/classroom/mentee')}
                                    className="bg-surface-container-lowest p-8 rounded-xl relative overflow-hidden group cursor-pointer hover:border hover:border-primary/10 transition-all"
                                    style={{ boxShadow: '0px 20px 40px rgba(26,28,32,0.06)' }}
                                >
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-container/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
                                    <p className="font-label text-on-surface-variant uppercase tracking-widest text-xs mb-2">My Classroom</p>
                                    <h3 className="font-headline text-4xl font-bold text-primary">
                                        {String(acceptedMentors).padStart(2, '0')}
                                    </h3>
                                    <div className="mt-4 w-full bg-surface-container h-1.5 rounded-full">
                                        <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(acceptedMentors * 20, 100)}%` }} />
                                    </div>
                                    <p className="text-xs text-primary font-bold mt-2 flex items-center gap-1">
                                        Open Classroom
                                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                                    </p>
                                </div>
                            </div>

                            {/* ── Left column ── */}
                            <div className="col-span-8 space-y-8">

                                {/* My Active Mentors */}
                                <section>
                                    <div className="flex justify-between items-end mb-6">
                                        <h4 className="font-headline text-2xl font-bold text-on-surface">My Active Mentors</h4>
                                        <button onClick={() => setActiveTab('mentors')} className="text-sm font-bold text-primary hover:underline">
                                            View All
                                        </button>
                                    </div>

                                    {loadingMentors ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    ) : mentors.length === 0 ? (
                                        <div className="bg-surface-container-low rounded-xl p-10 text-center border-2 border-dashed border-outline-variant/20">
                                            <span className="material-symbols-outlined text-4xl text-outline-variant mb-3 block">groups</span>
                                            <p className="text-on-surface-variant text-sm font-medium mb-4">No active mentors yet</p>
                                            <button
                                                onClick={() => setActiveTab('find-mentors')}
                                                className="px-6 py-2.5 text-white text-sm font-bold rounded-xl transition-all active:scale-95"
                                                style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}
                                            >
                                                Find Mentors
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-6">
                                            {mentors.slice(0, 4).map((connection, i) => {
                                                const mentor = connection.mentor;
                                                const badges = ['Thesis Advisor', 'Career Mentor', 'Research Guide', 'Subject Expert'];
                                                const badgeBgs = [
                                                    'bg-secondary-fixed text-on-secondary-fixed',
                                                    'bg-primary-fixed text-on-primary-fixed-variant',
                                                    'bg-tertiary-fixed text-on-tertiary-fixed',
                                                    'bg-surface-container-high text-on-surface-variant',
                                                ];
                                                return (
                                                    <div key={connection._id}
                                                        className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 hover:border-primary-container/20 transition-all">
                                                        <div className="flex gap-4 items-start mb-4">
                                                            <div className="w-16 h-16 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xl flex-shrink-0">
                                                                {mentor?.firstName?.[0]}{mentor?.lastName?.[0]}
                                                            </div>
                                                            <div>
                                                                <h5 className="font-headline font-bold text-primary">
                                                                    {mentor?.firstName} {mentor?.lastName}
                                                                </h5>
                                                                <p className="text-xs text-on-surface-variant mb-2">
                                                                    {mentor?.department || (mentor?.subjects?.[0] ?? 'Mentor')}
                                                                </p>
                                                                <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-tighter ${badgeBgs[i % badgeBgs.length]}`}>
                                                                    {badges[i % badges.length]}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-outline-variant/10">
                                                            <span className="text-xs text-on-surface-variant">
                                                                {mentor?.email}
                                                            </span>
                                                            <button
                                                                onClick={() => navigate('/classroom/mentee')}
                                                                className="text-xs font-bold text-primary flex items-center gap-1"
                                                            >
                                                                Chat <span className="material-symbols-outlined text-sm">chevron_right</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </section>

                                {/* Pending Requests */}
                                <section>
                                    <div className="flex justify-between items-end mb-6">
                                        <h4 className="font-headline text-2xl font-bold text-on-surface">Pending Requests</h4>
                                    </div>
                                    <div className="bg-surface-container-low rounded-xl p-6 space-y-4">
                                        {loadingRequests ? (
                                            <div className="flex items-center justify-center py-6">
                                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        ) : pendingRequests.length === 0 ? (
                                            <div className="text-center py-6">
                                                <span className="material-symbols-outlined text-3xl text-outline-variant mb-2 block">check_circle</span>
                                                <p className="text-on-surface-variant text-sm">No pending requests</p>
                                            </div>
                                        ) : (
                                            pendingRequests.map(req => (
                                                <div key={req._id} className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm flex-shrink-0">
                                                            {req.mentor?.firstName?.[0]}{req.mentor?.lastName?.[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-on-surface">
                                                                {req.mentor?.firstName} {req.mentor?.lastName}
                                                            </p>
                                                            <p className="text-xs text-on-surface-variant">
                                                                {req.mentor?.department || req.mentor?.subjects?.[0] || 'Mentor'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase">
                                                            {new Date(req.createdAt).toLocaleDateString()}
                                                        </span>
                                                        <span className="px-4 py-1.5 rounded-lg border border-outline-variant/20 text-xs font-bold text-secondary-fixed-dim bg-secondary-fixed">
                                                            Pending
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </section>
                            </div>

                            {/* ── Right column ── */}
                            <div className="col-span-4 space-y-8">

                                {/* Recent Dialogues */}
                                <section className="bg-surface-container-lowest rounded-xl p-8"
                                    style={{ boxShadow: '0px 20px 40px rgba(26,28,32,0.06)' }}>
                                    <h4 className="font-headline text-xl font-bold text-primary mb-6">Recent Dialogues</h4>
                                    {mentors.length === 0 ? (
                                        <div className="text-center py-6">
                                            <span className="material-symbols-outlined text-3xl text-outline-variant mb-2 block">chat_bubble</span>
                                            <p className="text-on-surface-variant text-xs">No conversations yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {mentors.slice(0, 3).map((conn, i) => (
                                                <div key={conn._id} className="flex gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm flex-shrink-0">
                                                        {conn.mentor?.firstName?.[0]}{conn.mentor?.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-on-surface">
                                                            {conn.mentor?.firstName} {conn.mentor?.lastName}
                                                        </p>
                                                        <p className="text-xs text-on-surface-variant line-clamp-1 italic">
                                                            "{conn.mentor?.about ? conn.mentor.about.slice(0, 40) + '...' : 'Click to open classroom...'}"
                                                        </p>
                                                        <p className="text-[10px] text-primary mt-1 font-bold">Connected</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (mentors.length > 0) {
                                                const conn = mentors[0];
                                                navigate('/classroom/mentee', { state: { person: conn.mentor, connectionId: conn._id } });
                                            } else {
                                                navigate('/classroom/mentee');
                                            }
                                        }}
                                        className="w-full mt-8 py-3 text-sm font-bold text-primary bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors"
                                    >
                                        Open Classroom
                                    </button>
                                </section>

                                {/* Academic Milestones (tasks / subjects from connected mentors) */}
                                <section className="bg-primary text-white rounded-xl p-8 overflow-hidden relative"
                                    style={{ boxShadow: '0px 20px 40px rgba(26,28,32,0.06)' }}>
                                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full" />
                                    <h4 className="font-headline text-xl font-bold mb-6">Academic Milestones</h4>
                                    {mentors.length === 0 ? (
                                        <p className="text-white/60 text-sm">Connect with mentors to track milestones.</p>
                                    ) : (
                                        <div className="space-y-5">
                                            {mentors.slice(0, 3).flatMap(conn =>
                                                (conn.mentor?.subjects || ['General']).slice(0, 1).map(subject => ({
                                                    subject,
                                                    mentor: conn.mentor,
                                                    id: conn._id + subject,
                                                }))
                                            ).slice(0, 3).map((item, i) => (
                                                <div key={item.id}
                                                    className={`relative pl-6 border-l-2 ${i === 0 ? 'border-secondary-fixed/30' : 'border-white/10'}`}>
                                                    <div className={`absolute -left-[5px] top-0 w-2 h-2 rounded-full ${i === 0 ? 'bg-secondary-fixed' : 'bg-white/20'}`} />
                                                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${i === 0 ? 'text-secondary-fixed' : 'text-white/40'}`}>
                                                        {i === 0 ? 'Active' : 'Upcoming'}
                                                    </p>
                                                    <p className={`text-sm font-medium leading-tight ${i > 0 ? 'text-white/70' : ''}`}>
                                                        {item.subject} · {item.mentor?.firstName}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => navigate('/classroom/mentee')}
                                        className="mt-8 text-xs font-bold text-secondary-fixed flex items-center gap-2 hover:translate-x-1 transition-transform"
                                    >
                                        View Classroom
                                        <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
                                    </button>
                                </section>
                            </div>

                        </div>
                    </>
                )}

                {/* ── FIND MENTORS TAB ── */}
                {activeTab === 'find-mentors' && (
                    <FindMentor />
                )}

                {/* ── MY MENTORS TAB ── */}
                {activeTab === 'mentors' && (
                    <div>
                        <div className="mb-10">
                            <h2 className="font-headline text-5xl font-extrabold text-primary tracking-tight mb-2">My Mentors</h2>
                            <p className="text-on-surface-variant text-lg">Your connected mentors and their details.</p>
                        </div>

                        {loadingMentors ? (
                            <div className="flex items-center justify-center py-32">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : mentors.length === 0 ? (
                            <div className="bg-surface-container-low rounded-xl p-16 text-center border-2 border-dashed border-outline-variant/20">
                                <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">groups</span>
                                <h3 className="font-headline text-2xl font-bold text-primary mb-2">No mentors yet</h3>
                                <p className="text-on-surface-variant mb-8">Connect with mentors to start your learning journey</p>
                                <button
                                    onClick={() => setActiveTab('find-mentors')}
                                    className="px-8 py-3 text-white font-bold rounded-xl transition-all active:scale-95"
                                    style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}
                                >
                                    Find Mentors
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {mentors.map((connection) => {
                                    const mentor = connection.mentor;
                                    return (
                                        <div key={connection._id}
                                            className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 hover:border-primary/20 transition-all group"
                                            style={{ boxShadow: '0px 20px 40px rgba(26,28,32,0.06)' }}>
                                            <div className="flex gap-4 items-start mb-4">
                                                <div className="w-16 h-16 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xl flex-shrink-0">
                                                    {mentor?.firstName?.[0]}{mentor?.lastName?.[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-headline font-bold text-primary group-hover:text-primary-container transition-colors">
                                                        {mentor?.firstName} {mentor?.lastName}
                                                    </h5>
                                                    <p className="text-xs text-on-surface-variant mb-1">
                                                        {mentor?.department} · Batch {mentor?.batch}
                                                    </p>
                                                    <p className="text-xs text-on-surface-variant">{mentor?.email}</p>
                                                </div>
                                            </div>

                                            {/* Subjects */}
                                            {mentor?.subjects?.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {mentor.subjects.slice(0, 3).map((s, i) => (
                                                        <span key={i} className="px-2 py-1 bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold rounded uppercase tracking-tighter">
                                                            {s}
                                                        </span>
                                                    ))}
                                                    {mentor.subjects.length > 3 && (
                                                        <span className="text-xs text-primary font-bold">+{mentor.subjects.length - 3} more</span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="pt-4 border-t border-outline-variant/10 flex items-center justify-between gap-3">
                                                <StarRating
                                                    connectionId={connection._id}
                                                    targetName={`${mentor?.firstName} ${mentor?.lastName}`}
                                                />
                                                <button
                                                    onClick={() => navigate('/classroom/mentee', { state: { person: mentor, connectionId: connection._id } })}
                                                    className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                                                >
                                                    Open Classroom <span className="material-symbols-outlined text-sm">chevron_right</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── ALL REQUESTS (bonus view from requests nav badge) ── */}
                {activeTab === 'requests' && (
                    <div>
                        <div className="mb-10">
                            <h2 className="font-headline text-5xl font-extrabold text-primary tracking-tight mb-2">My Requests</h2>
                            <p className="text-on-surface-variant text-lg">Track all your connection requests.</p>
                        </div>

                        {loadingRequests ? (
                            <div className="flex items-center justify-center py-32">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="bg-surface-container-low rounded-xl p-16 text-center border-2 border-dashed border-outline-variant/20">
                                <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">person_search</span>
                                <h3 className="font-headline text-2xl font-bold text-primary mb-2">No requests yet</h3>
                                <p className="text-on-surface-variant mb-8">Start by finding and connecting with mentors</p>
                                <button
                                    onClick={() => setActiveTab('find-mentors')}
                                    className="px-8 py-3 text-white font-bold rounded-xl transition-all active:scale-95"
                                    style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}
                                >
                                    Find Mentors
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {requests.map((req) => (
                                    <div key={req._id}
                                        className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 hover:border-primary/20 transition-all"
                                        style={{ boxShadow: '0px 20px 40px rgba(26,28,32,0.06)' }}>
                                        <div className="flex gap-4 items-start mb-4">
                                            <div className="w-14 h-14 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-lg flex-shrink-0">
                                                {req.mentor?.firstName?.[0]}{req.mentor?.lastName?.[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="font-headline font-bold text-primary truncate">
                                                    {req.mentor?.firstName} {req.mentor?.lastName}
                                                </h5>
                                                <p className="text-xs text-on-surface-variant">
                                                    {req.mentor?.department} · Batch {req.mentor?.batch}
                                                </p>
                                                <p className="text-[10px] text-on-surface-variant mt-1">
                                                    {new Date(req.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-outline-variant/10">
                                            <span className={`inline-block px-4 py-2 rounded-lg text-xs font-bold ${
                                                req.status === 'pending'
                                                    ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                                                    : req.status === 'accepted'
                                                    ? 'bg-primary-fixed text-on-primary-fixed-variant'
                                                    : 'bg-error-container text-on-error-container'
                                            }`}>
                                                {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── SESSIONS TAB ── */}
                {activeTab === 'sessions' && (
                    <div>
                        <div className="mb-10">
                            <h2 className="font-headline text-5xl font-extrabold text-primary tracking-tight mb-2">My Sessions</h2>
                            <p className="text-on-surface-variant text-lg">Manage your booked sessions.</p>
                        </div>

                        {loadingSessions ? (
                            <div className="flex items-center justify-center py-32">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="bg-surface-container-low rounded-xl p-16 text-center border-2 border-dashed border-outline-variant/20">
                                <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">event_busy</span>
                                <h3 className="font-headline text-2xl font-bold text-primary mb-2">No Sessions Yet</h3>
                                <p className="text-on-surface-variant mb-8">You haven't booked any sessions with your mentors.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {sessions.map(session => (
                                    <div key={session._id} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 hover:border-primary/20 transition-all shadow-sm">
                                        <div className="flex-1 min-w-0 mb-4">
                                            <h4 className="font-headline font-bold text-primary text-lg">
                                                Session with {session.mentor?.firstName} {session.mentor?.lastName}
                                            </h4>
                                            <p className="text-sm text-on-surface-variant mt-1">
                                                <span className="font-bold">Date:</span> {session.date} <span className="mx-2">|</span> <span className="font-bold">Time:</span> {session.time}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant/10">
                                            <div className="flex justify-between items-center">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
                                                    session.status === 'Pending' ? 'bg-secondary-fixed text-on-secondary-fixed' :
                                                    session.status === 'Confirmed' ? 'bg-primary-container text-on-primary-container' :
                                                    'bg-surface-container text-on-surface'
                                                }`}>
                                                    {session.status}
                                                </span>

                                                {session.status === 'Confirmed' && session.meetingLink && (
                                                    <a
                                                        href={session.meetingLink}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-md hover:opacity-90 transition flex items-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">videocam</span>
                                                        Join Meeting
                                                    </a>
                                                )}
                                            </div>

                                            {session.status === 'Completed' && (
                                                <div className="mt-2 bg-surface-container-low p-3 rounded-lg border border-outline-variant/10 flex items-center justify-between">
                                                    <span className="text-xs font-bold text-on-surface-variant">Leave Feedback:</span>
                                                    <StarRating
                                                        connectionId={session.connection}
                                                        targetName={`${session.mentor?.firstName} ${session.mentor?.lastName}`}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── PROFILE / SETTINGS TAB ── */}
                {activeTab === 'profile' && (
                    <ProfileTab initialUser={user} />
                )}

            </main>

            {/* ── FAB ── */}
            <div className="fixed bottom-10 right-10 z-50">
                <button
                    onClick={() => setActiveTab('find-mentors')}
                    className="flex items-center gap-3 bg-secondary-fixed text-on-secondary-fixed px-6 py-4 rounded-full font-bold hover:scale-105 active:scale-95 transition-all"
                    style={{ boxShadow: '0px 20px 40px rgba(26,28,32,0.06)' }}
                >
                    <span className="material-symbols-outlined">add</span>
                    Find Mentor
                </button>
            </div>
        </div>
    );
};

export default MenteeDashboard;