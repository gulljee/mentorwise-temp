import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FindMentor from './FindMentor';
import ProfileTab from '../components/ProfileTab';

import TranscriptCard from '../components/TranscriptCard';
import AIAssistant from '../components/AIAssistant';
import StarRating from '../components/StarRating';

const NAV = [
    { id: 'overview', icon: 'dashboard', label: 'Overview' },
    { id: 'find-mentors', icon: 'person_search', label: 'Find Mentors' },
    { id: 'mentors', icon: 'groups', label: 'My Mentors' },
    { id: 'transcripts', icon: 'workspace_premium', label: 'My Transcripts' },
    { id: 'sessions', icon: 'event', label: 'My Sessions' },
    { id: 'shared-drive', icon: 'folder_shared', label: 'Shared Drive' },
    {
        id: 'ai',
        label: 'AI Consultant',
        customIcon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" fill="white" />
            </svg>
        )
    },
    { id: 'profile', icon: 'account_circle', label: 'Profile' },
];

const MenteeDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';
    const setActiveTab = (tab) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('tab', tab);
        setSearchParams(newParams);
    };

    // ── state (identical to original) ─────────────────────────────────────────
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [mentors, setMentors] = useState([]);
    const [loadingMentors, setLoadingMentors] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [transcripts, setTranscripts] = useState([]);
    const [loadingTranscripts, setLoadingTranscripts] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // ── Fetch sent requests ────────────────────────────────────────────────────
    const fetchSentRequests = async () => {
        setLoadingRequests(true);
        try {
            const token = localStorage.getItem('token');
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
            const token = localStorage.getItem('token');
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

    // ── Fetch transcripts ────────────────────────────────────────────────
    const fetchTranscripts = async () => {
        setLoadingTranscripts(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/connections/transcripts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setTranscripts(data.transcripts || []);
        } catch (error) {
            console.error('Error fetching transcripts:', error);
        } finally {
            setLoadingTranscripts(false);
        }
    };

    // ── Fetch notifications ────────────────────────────────────────────────
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

    useEffect(() => {
        if (activeTab === 'requests') fetchSentRequests();
        else if (activeTab === 'mentors') fetchConnectedMentors();
        else if (activeTab === 'sessions') fetchSessions();
        else if (activeTab === 'transcripts') fetchTranscripts();
    }, [activeTab]);

    // Initial load and polling
    useEffect(() => {
        fetchSentRequests();
        fetchConnectedMentors();
        fetchNotifications();

        const pollInterval = setInterval(() => {
            fetchNotifications();
            fetchSentRequests();
            fetchConnectedMentors();
            fetchSessions();
        }, 15000); // Poll every 15s

        return () => clearInterval(pollInterval);
    }, []);

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const acceptedMentors = mentors.length;
    const userInitials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`;

    return (
        <div className="bg-surface font-body text-on-surface min-h-screen">


            {/* ── Sidebar Overlay (mobile) ── */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <nav className={`fixed left-0 top-0 h-screen w-64 z-50 bg-slate-50 flex flex-col py-8 px-6 shadow-sm transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ borderRight: '1px solid #e2e2e7' }}>
                <div className="mb-10 px-2 flex justify-between items-center lg:block">
                    <div>
                        <h1 className="font-headline text-2xl font-bold tracking-tight text-primary">MentorWise</h1>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-1">Mentee Portal</p>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="space-y-1 flex-grow overflow-y-auto custom-scrollbar">
                    {NAV.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.id === 'shared-drive') navigate('/shared-drive');
                                else setActiveTab(item.id);
                                setIsSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all text-left ${activeTab === item.id
                                ? 'text-primary font-bold bg-surface-container-low border-r-4 border-primary'
                                : 'text-slate-500 hover:text-primary hover:bg-surface-container-low'
                                }`}
                        >
                            {item.customIcon ? (
                                <span className={activeTab === item.id ? 'opacity-100' : 'opacity-70'}>
                                    {item.customIcon}
                                </span>
                            ) : (
                                <span
                                    className="material-symbols-outlined text-[20px]"
                                    style={activeTab === item.id ? { fontVariationSettings: "'FILL' 1" } : {}}
                                >
                                    {item.icon}
                                </span>
                            )}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>

                <div className="mt-4 px-2 space-y-3">
                    <button
                        onClick={() => {
                            if (mentors.length > 0) {
                                const conn = mentors[0];
                                navigate('/classroom/mentee', { state: { person: conn.mentor, connectionId: conn._id } });
                            } else {
                                navigate('/classroom/mentee');
                            }
                        }}
                        className="w-full py-3 rounded-md text-white text-sm font-semibold shadow-lg active:scale-95 transition-transform"
                        style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}
                    >
                        My Classroom
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-error transition-colors rounded-xl"
                    >
                        <span className="material-symbols-outlined text-xl">logout</span>
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </nav>

            {/* ── Top App Bar ── */}
            <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] z-40 flex items-center justify-between lg:justify-end px-4 md:px-10 h-20"
                style={{ background: 'rgba(249,249,254,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e2e2e7' }}>
                
                {/* Mobile Hamburger */}
                <div className="flex items-center gap-3 lg:hidden">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-primary hover:bg-surface-container rounded-full transition-colors">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <h1 className="font-headline text-lg font-bold text-primary">MentorWise</h1>
                </div>

                <div className="flex items-center gap-3 md:gap-6">
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative text-on-surface-variant hover:text-primary transition-colors p-2 hover:bg-surface-container rounded-full"
                        >
                            <span className="material-symbols-outlined">notifications</span>
                            {notifications.some(n => !n.read) && (
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-error border-2 border-surface rounded-full" />
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white rounded-2xl shadow-2xl border border-outline-variant/10 overflow-hidden z-[60]">
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
                    <button className="hidden md:block text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">help_outline</span>
                    </button>
                    <div
                        className="flex items-center gap-2 md:gap-3 cursor-pointer"
                        onClick={() => setActiveTab('profile')}
                        title="Edit profile"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-xs md:text-sm font-bold text-primary">{user.firstName} {user.lastName}</p>
                            <p className="text-[10px] md:text-xs text-on-surface-variant">{user.department || 'Student'}</p>
                        </div>
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xs md:text-sm ring-2 ring-surface-container flex-shrink-0 overflow-hidden">
                            {user.profileImage ? (
                                <img src={`http://localhost:5000/${user.profileImage}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                                userInitials || 'MW'
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Main Content ── */}
            <main className="lg:ml-64 pt-24 pb-12 px-4 md:px-10 min-h-screen">

                {/* ── OVERVIEW TAB ── */}
                {activeTab === 'overview' && (
                    <>
                        {/* Hero Stats */}
                        <section className="grid grid-cols-12 gap-6 md:gap-8">
                            <div className="col-span-12 lg:col-span-8 flex flex-col justify-center">
                                <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight mb-4 leading-tight">
                                    Welcome back,<br />{user.firstName || 'Scholar'}.
                                </h2>
                                <p className="text-on-surface-variant max-w-md font-medium text-sm md:text-base">
                                    Your academic journey is making significant progress. You have {pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''} and {mentors.length} active mentor{mentors.length !== 1 ? 's' : ''}.
                                </p>
                                {!user.department && (
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className="mt-6 self-start px-6 py-3 text-sm font-bold text-white rounded-lg transition-all active:scale-95"
                                        style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}
                                    >
                                        Complete your profile to get discovered →
                                    </button>
                                )}
                            </div>
                            <div className="col-span-12 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                {/* Pending Requests */}
                                <div className="bg-surface-container-lowest p-5 md:p-6 rounded-xl flex flex-col justify-between lg:aspect-square shadow-sm">
                                    <span className="material-symbols-outlined text-primary text-2xl md:text-3xl">pending_actions</span>
                                    <div className="mt-2 md:mt-0">
                                        <p className="font-headline text-2xl md:text-3xl font-extrabold text-primary">
                                            {String(pendingRequests.length).padStart(2, '0')}
                                        </p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-outline-variant">Pending Requests</p>
                                    </div>
                                </div>
                                {/* Active Mentors */}
                                <div className="bg-secondary-fixed p-5 md:p-6 rounded-xl flex flex-col justify-between lg:aspect-square shadow-md">
                                    <span className="material-symbols-outlined text-on-secondary-container text-2xl md:text-3xl">groups</span>
                                    <div className="mt-2 md:mt-0">
                                        <p className="font-headline text-2xl md:text-3xl font-extrabold text-on-secondary-container">
                                            {String(mentors.length).padStart(2, '0')}
                                        </p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-secondary-container/60">Active Mentors</p>
                                    </div>
                                </div>
                                {/* Classroom CTA */}
                                <div
                                    onClick={() => navigate('/classroom/mentee')}
                                    className="sm:col-span-2 p-6 rounded-xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
                                    style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}
                                >
                                    <div>
                                        <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-1">My Classroom</p>
                                        <p className="font-headline text-3xl font-extrabold text-white">Open</p>
                                    </div>
                                    <span className="material-symbols-outlined text-white text-3xl">school</span>
                                </div>
                            </div>
                        </section>

                        {/* Bento Grid */}
                        <section className="grid grid-cols-12 gap-6 md:gap-8 mt-12">
                            {/* Connection Requests Card (Pending Requests) */}
                            <div className="col-span-12 xl:col-span-7 bg-surface-container-low rounded-3xl p-6 md:p-8">
                                <div className="flex justify-between items-end mb-6 md:mb-8">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Queue</span>
                                        <h3 className="font-headline text-2xl md:text-3xl font-bold text-primary">Pending Requests</h3>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('requests')}
                                        className="text-primary font-bold text-sm underline hover:opacity-70"
                                    >
                                        View All
                                    </button>
                                </div>

                                {loadingRequests ? (
                                    <div className="text-center py-10 text-on-surface-variant text-sm">Loading requests...</div>
                                ) : pendingRequests.length === 0 ? (
                                    <div className="text-center py-10">
                                        <span className="material-symbols-outlined text-5xl text-outline-variant mb-3 block">inbox</span>
                                        <p className="text-on-surface-variant text-sm font-medium">No pending requests</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingRequests.slice(0, 3).map(request => (
                                            <div key={request._id} className="bg-surface-container-lowest p-6 rounded-2xl flex items-center gap-6 transition-all hover:translate-x-2">
                                                <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xl flex-shrink-0 overflow-hidden">
                                                    {request.mentor?.profileImage ? (
                                                        <img src={`http://localhost:5000/${request.mentor.profileImage}`} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{request.mentor?.firstName?.[0]}{request.mentor?.lastName?.[0]}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-primary truncate">
                                                        {request.mentor?.firstName} {request.mentor?.lastName}
                                                    </h4>
                                                    <p className="text-xs text-on-surface-variant mb-2">
                                                        {request.mentor?.department || 'Mentor'}
                                                    </p>
                                                    <div className="flex gap-2 flex-wrap">
                                                        <span className="px-2 py-1 bg-surface-container text-[10px] font-bold rounded uppercase">
                                                            {new Date(request.createdAt).toLocaleDateString()}
                                                        </span>
                                                        <span className="px-2 py-1 bg-secondary-fixed text-secondary-fixed-dim text-[10px] font-bold rounded uppercase">
                                                            Pending
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 flex-shrink-0">
                                                    <button
                                                        onClick={() => window.open(`/profile/${request.mentor?._id}`, '_blank')}
                                                        className="w-10 h-10 rounded-full bg-surface-container text-primary flex items-center justify-center active:scale-90 transition-transform hover:bg-primary hover:text-white"
                                                        title="View Mentor Profile"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">person</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Active Mentors card */}
                            <div className="col-span-12 xl:col-span-5 rounded-3xl p-6 md:p-8 text-white flex flex-col relative overflow-hidden"
                                style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}>
                                <div className="absolute inset-0 opacity-10 pointer-events-none">
                                    <img alt="Library background" className="w-full h-full object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaI24KLfczHts9aTU2x5PCGK5qou8GrEyTKIcvrBVeto8QtHUMyF0ELMYMyhqANSdJb4-Ymt2L397WSg4FIgj1vsut8jf2TKfFuPaem5BVRZz4Yp1LP7fQ4H2kcgXee7pcZ2xIi1dEKUQ-XZVCvYKd7FfzUL-cAhIjGvHyDqGh46L7YXpZvCFhoMjMrNojBARgfYkcc9lwO2nJrnjMfsZcm_Y14zreL5NPLL7LFkLAVcEdxl3EPrzUVD9kUo5BOZSblTaf1KMzO7Y"
                                    />
                                </div>
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="font-headline text-2xl font-bold">Active Mentors</h3>
                                        <span className="material-symbols-outlined">groups</span>
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        {loadingMentors ? (
                                            <p className="text-white/60 text-sm">Loading...</p>
                                        ) : mentors.length === 0 ? (
                                            <div className="flex-1 flex flex-col items-center justify-center py-8 text-white/60">
                                                <span className="material-symbols-outlined text-4xl mb-2">group_add</span>
                                                <p className="text-sm">No active mentors yet</p>
                                            </div>
                                        ) : (
                                            mentors.slice(0, 3).map(conn => (
                                                <div key={conn._id} className="flex gap-4 items-center hover:bg-white/10 p-2 rounded-xl transition-all cursor-pointer">
                                                    <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold flex-shrink-0 overflow-hidden">
                                                        {conn.mentor?.profileImage ? (
                                                            <img src={`http://localhost:5000/${conn.mentor.profileImage}`} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span>{conn.mentor?.firstName?.[0]}{conn.mentor?.lastName?.[0]}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-sm truncate">{conn.mentor?.firstName} {conn.mentor?.lastName}</p>
                                                        <p className="text-xs opacity-70 truncate">{conn.mentor?.department}</p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-white/40 text-[18px]">chevron_right</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('mentors')}
                                        className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-bold transition-all"
                                    >
                                        View All Mentors
                                    </button>
                                </div>
                            </div>

                        </section>

                        {/* Upcoming Session / Requests Section */}
                        <section className="bg-surface-container-high rounded-3xl p-1 w-full max-w-4xl mx-auto shadow-lg shadow-primary/5 mt-12">
                            <div className="bg-surface-container-lowest rounded-[22px] flex flex-col items-center justify-center p-8 text-center min-h-[200px] relative overflow-hidden">

                                {/* Decorative Background Glow */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 blur-3xl rounded-full pointer-events-none"></div>

                                {sessions.filter(s => s.status !== 'Completed').length > 0 ? (
                                    // ── Case 1: Scheduled Sessions ──
                                    <div className="relative z-10 w-full animate-in fade-in zoom-in-95 duration-500">
                                    <div className="flex items-center justify-center gap-3 mb-4">
                                            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Upcoming Session</span>
                                        </div>
                                        {(() => {
                                            const nextSession = sessions.filter(s => s.status !== 'Completed')[0];
                                            return (
                                                <>
                                                    <h3 className="font-headline text-2xl md:text-3xl font-extrabold text-primary mb-6 leading-tight">
                                                        Session with {nextSession.mentor?.firstName} {nextSession.mentor?.lastName}
                                                    </h3>
                                                    <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8 text-on-surface-variant">
                                                        <div className="flex items-center gap-2 bg-surface-container-low px-3 md:px-4 py-2 rounded-xl">
                                                            <span className="material-symbols-outlined text-primary text-base md:text-lg">calendar_today</span>
                                                            <span className="font-bold text-[10px] md:text-xs">{nextSession.date} at {nextSession.time}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 bg-surface-container-low px-3 md:px-4 py-2 rounded-xl">
                                                            <span className="material-symbols-outlined text-primary text-base md:text-lg">{nextSession.status === 'Confirmed' ? 'video_call' : 'pending'}</span>
                                                            <span className="font-bold text-[10px] md:text-xs">{nextSession.status === 'Confirmed' ? 'Confirmed' : 'Pending Confirmation'}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setActiveTab('sessions')}
                                                        className="px-10 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all hover:bg-primary-container hover:text-on-primary-container"
                                                        style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}
                                                    >
                                                        MANAGE SESSIONS
                                                    </button>
                                                </>
                                            );
                                        })()}
                                    </div>
                                ) : (
                                    // ── Case 3: Standard/Empty State ──
                                    <div className="relative z-10 w-full animate-in fade-in zoom-in-95 duration-500">
                                        <div className="flex items-center justify-center gap-3 mb-4">
                                            <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Atelier Ready</span>
                                        </div>
                                        <h3 className="font-headline text-2xl md:text-3xl font-extrabold text-primary mb-4 leading-tight">
                                            No upcoming sessions <br />for today.
                                        </h3>
                                        <p className="text-on-surface-variant font-medium text-sm mb-8 max-w-sm mx-auto">
                                            Your schedule is currently clear. Head to your classroom to prepare resources or engage with mentors.
                                        </p>
                                        <button
                                            onClick={() => navigate('/classroom/mentee')}
                                            className="px-10 py-4 bg-white border border-outline-variant text-primary rounded-2xl font-bold text-sm shadow-sm active:scale-95 transition-all hover:bg-slate-50"
                                        >
                                            GO TO CLASSROOM
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </>
                )}

                {/* ── FIND MENTORS TAB ── */}
                {activeTab === 'find-mentors' && (
                    <FindMentor />
                )}

                {/* ── MY MENTORS TAB ── */}
                {activeTab === 'mentors' && (
                    <div>
                        <div className="mb-6 md:mb-10">
                            <h2 className="font-headline text-3xl md:text-5xl font-extrabold text-primary tracking-tight mb-2">My Mentors</h2>
                            <p className="text-on-surface-variant text-sm md:text-lg">Your connected mentors and their details.</p>
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
                                                <div className="w-16 h-16 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xl flex-shrink-0 overflow-hidden">
                                                    {mentor?.profileImage ? (
                                                        <img src={`http://localhost:5000/${mentor.profileImage}`} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{mentor?.firstName?.[0]}{mentor?.lastName?.[0]}</span>
                                                    )}
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

                                            <div className="pt-4 border-t border-outline-variant/10 flex items-center justify-between">
                                                <StarRating connectionId={connection._id} targetName={`${mentor?.firstName} ${mentor?.lastName}`} />
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
                        <div className="mb-6 md:mb-10">
                            <h2 className="font-headline text-3xl md:text-5xl font-extrabold text-primary tracking-tight mb-2">My Requests</h2>
                            <p className="text-on-surface-variant text-sm md:text-lg">Track all your connection requests.</p>
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
                                            <div className="w-14 h-14 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-lg flex-shrink-0 overflow-hidden">
                                                {req.mentor?.profileImage ? (
                                                    <img src={`http://localhost:5000/${req.mentor.profileImage}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{req.mentor?.firstName?.[0]}{req.mentor?.lastName?.[0]}</span>
                                                )}
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
                                            <span className={`inline-block px-4 py-2 rounded-lg text-xs font-bold ${req.status === 'pending'
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
                        <div className="mb-6 md:mb-10">
                            <h2 className="font-headline text-3xl md:text-5xl font-extrabold text-primary tracking-tight mb-2">My Sessions</h2>
                            <p className="text-on-surface-variant text-sm md:text-lg">Manage your booked sessions.</p>
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
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${session.status === 'Pending' ? 'bg-secondary-fixed text-on-secondary-fixed' :
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


                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── TRANSCRIPTS TAB ── */}
                {activeTab === 'transcripts' && (
                    <div>
                        <div className="mb-6 md:mb-10">
                            <h2 className="font-headline text-3xl md:text-5xl font-extrabold text-primary tracking-tight mb-2">My Transcripts</h2>
                            <p className="text-on-surface-variant text-sm md:text-lg">Your official mentorship records and achievements.</p>
                        </div>

                        {loadingTranscripts ? (
                            <div className="flex items-center justify-center py-32">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : transcripts.length === 0 ? (
                            <div className="bg-surface-container-low rounded-xl p-16 text-center border-2 border-dashed border-outline-variant/20">
                                <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">workspace_premium</span>
                                <h3 className="font-headline text-2xl font-bold text-primary mb-2">No transcripts yet</h3>
                                <p className="text-on-surface-variant mb-8">Once you complete a mentorship, your transcript will appear here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {transcripts.map(transcript => (
                                    <TranscriptCard key={transcript._id} transcript={transcript} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── PROFILE / SETTINGS TAB ── */}
                {activeTab === 'profile' && (
                    <ProfileTab initialUser={user} />
                )}

                {/* ── AI ASSISTANT TAB ── */}
                {activeTab === 'ai' && (
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-outline-variant/10" style={{ height: 'calc(100vh - 180px)' }}>
                        <AIAssistant variant="inline" />
                    </div>
                )}

            </main>

            {/* ── FAB ── */}
            {activeTab !== 'find-mentors' && (
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
            )}
        </div>
    );
};

export default MenteeDashboard;