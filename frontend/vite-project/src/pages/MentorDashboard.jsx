// Mentor dashboard — new scholarly design, all original backend logic preserved

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProfileTab from '../components/ProfileTab';

import UserRatingBadge from '../components/UserRatingBadge';
import AIAssistant from '../components/AIAssistant';

export default function MentorDashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // ── original state ──────────────────────────────────────────────
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';
    const setActiveTab = (tab) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('tab', tab);
        setSearchParams(newParams);
    };
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isProfileSaving, setIsProfileSaving] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);
    const [profileData, setProfileData] = useState({ about: '', cgpa: '', subjects: [] });
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // ── original handlers ───────────────────────────────────────────
    const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/connections/students', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setStudents(data.students || []);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleAddSkill = (e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            setSkills([...skills, skillInput.trim()]);
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (index) => setSkills(skills.filter((_, i) => i !== index));

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData({ ...profileData, [name]: value });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsProfileSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/profile/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(profileData)
            });
            const data = await response.json();
            if (response.ok) {
                const updatedUser = { ...user, about: profileData.about, cgpa: profileData.cgpa, subjects: profileData.subjects };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setProfileSaved(true);
                setShowProfileModal(false);
                setProfileData({ about: '', cgpa: '', subjects: [] });
            } else {
                console.error('Failed to save profile:', data.message);
                setIsProfileSaving(false);
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            setIsProfileSaving(false);
        }
    };

    const toggleSubject = (subject) => {
        setProfileData(prev => ({
            ...prev,
            subjects: prev.subjects.includes(subject)
                ? prev.subjects.filter(s => s !== subject)
                : [...prev.subjects, subject]
        }));
    };

    const fetchRequests = async () => {
        setLoadingRequests(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/connections/requests/received', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setRequests(data.requests || []);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoadingRequests(false);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/connections/requests/${requestId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: 'accepted' })
            });
            if (response.ok) {
                fetchRequests();
                fetchStudents();
            }
        } catch (error) {
            console.error('Error accepting request:', error);
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/connections/requests/${requestId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: 'rejected' })
            });
            if (response.ok) {
                fetchRequests();
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
        }
    };

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

    const updateSessionStatus = async (sessionId, status, link = '') => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status, meetingLink: link })
            });
            if (response.ok) {
                fetchSessions(); // refresh
            }
        } catch (error) {
            console.error('Error updating session:', error);
        }
    };

    const [linkModal, setLinkModal] = useState({ isOpen: false, sessionId: null, link: '', error: '' });

    const handleConfirmSession = (sessionId) => {
        setLinkModal({ isOpen: true, sessionId, link: '', error: '' });
    };

    const submitConfirmSession = () => {
        if (!linkModal.link.trim()) {
            setLinkModal(prev => ({ ...prev, error: 'A meeting link is required.' }));
            return;
        }
        updateSessionStatus(linkModal.sessionId, 'Confirmed', linkModal.link.trim());
        setLinkModal({ isOpen: false, sessionId: null, link: '', error: '' });
    };

    useEffect(() => {
        if (activeTab === 'connections') fetchRequests();
        else if (activeTab === 'students') fetchStudents();
        else if (activeTab === 'sessions') fetchSessions();
    }, [activeTab]);

    useEffect(() => {
        if (user.about && user.cgpa && user.subjects && user.subjects.length > 0) setProfileSaved(true);
        fetchRequests();
        fetchStudents();
        fetchSessions();
        fetchNotifications();

        const pollInterval = setInterval(() => {
            fetchNotifications();
            fetchRequests();
            fetchStudents();
            fetchSessions();
        }, 15000); // Poll every 15s

        return () => clearInterval(pollInterval);
    }, []);

    // ── nav items ───────────────────────────────────────────────────
    const navItems = [
        { id: 'overview', icon: 'dashboard', label: 'Overview' },
        { id: 'connections', icon: 'person_add', label: 'Connections' },
        { id: 'students', icon: 'groups', label: 'My Mentees' },
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

    const userInitials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`;
    const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();

    return (
        <div className="font-body text-on-surface" style={{ backgroundColor: '#f9f9fe' }}>

            {/* ── Sidebar Overlay (mobile) ── */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                className={`fixed left-0 top-0 h-full flex flex-col py-6 px-6 bg-slate-50 w-64 z-50 transition-transform duration-300 overflow-y-auto custom-scrollbar
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
                style={{ borderRight: '1px solid #e2e2e7' }}
            >
                <div className="mb-6 px-2 flex-shrink-0">
                    <h1
                        className="font-headline text-2xl font-bold tracking-tight text-primary cursor-pointer transition-opacity hover:opacity-80"
                        onClick={() => setActiveTab('overview')}
                    >
                        Mentor Wise
                    </h1>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-1">Mentor Portal</p>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.id === 'shared-drive') navigate('/shared-drive');
                                else setActiveTab(item.id);
                                setIsSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${activeTab === item.id
                                ? 'text-primary font-bold bg-surface-container-low border-r-4 border-primary'
                                : 'text-slate-500 hover:text-primary hover:bg-surface-container-low'
                                }`}
                        >
                            {item.customIcon ? (
                                <span className={activeTab === item.id ? 'text-primary' : 'text-slate-500'}>
                                    {item.customIcon}
                                </span>
                            ) : (
                                <span className="material-symbols-outlined text-[20px]" style={activeTab === item.id ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                            )}
                            <span>{item.label}</span>
                            {item.id === 'connections' && requests.length > 0 && (
                                <span className="ml-auto text-[10px] font-bold bg-error-container text-on-error-container px-2 py-0.5 rounded-full">
                                    {requests.length}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="mt-4 px-2 space-y-2 flex-shrink-0 pb-2">
                    <button
                        onClick={() => {
                            if (students.length > 0) {
                                const conn = students[0];
                                navigate('/classroom/mentor', { state: { person: conn.mentee, connectionId: conn._id } });
                            } else {
                                navigate('/classroom/mentor');
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
            </aside>

            {/* ── Main ── */}
            <main className="md:ml-64 min-h-screen">

                {/* Top App Bar */}
                <header className="flex justify-between items-center h-16 px-4 md:px-10 sticky top-0 z-40"
                    style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e2e2e7' }}>
                    {/* Mobile: Hamburger + App Name */}
                    <div className="flex items-center gap-3 md:hidden">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-1 text-primary"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <span
                            className="font-headline font-bold text-primary text-lg cursor-pointer transition-opacity hover:opacity-80"
                            onClick={() => setActiveTab('overview')}
                        >
                            Mentor Wise
                        </span>
                    </div>
                    {/* Spacer for desktop (right-aligns the right section) */}
                    <div className="hidden md:block" />
                    <div className="flex items-center gap-3 md:gap-6">
                        <div className="flex gap-2 md:gap-4 text-outline">
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="hover:opacity-70 transition-opacity active:scale-95 p-1 relative"
                                >
                                    <span className="material-symbols-outlined">notifications</span>
                                    {notifications.some(n => !n.read) && (
                                        <span className="absolute top-0 right-0 w-2 h-2 bg-error border-2 border-white rounded-full" />
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

                        </div>
                        <div className="h-8 w-px bg-outline-variant/30"></div>
                        <div
                            className="flex items-center gap-2 md:gap-3 cursor-pointer active:scale-95 transition-transform"
                            onClick={() => setActiveTab('profile')}
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-primary">{fullName || 'Mentor'}</p>
                                <p className="text-[10px] text-on-surface-variant">Senior Mentor</p>
                            </div>
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm ring-2 ring-primary-fixed overflow-hidden">
                                {user.profileImage ? (
                                    <img src={`http://localhost:5000/${user.profileImage}`} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    userInitials || 'MW'
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Dashboard Canvas ── */}
                <div className="p-4 md:p-10 space-y-8 md:space-y-12">

                    {/* ── OVERVIEW TAB ── */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Hero Stats */}
                            <section className="grid grid-cols-12 gap-4 md:gap-8">
                                <div className="col-span-12 lg:col-span-8 flex flex-col justify-center">
                                    <h2 className="font-headline text-3xl md:text-5xl font-extrabold text-primary tracking-tight mb-2 leading-tight">
                                        Welcome back,<br />{user.firstName || 'Scholar'}.
                                    </h2>
                                    <p className="text-on-surface-variant max-w-md font-medium">
                                        Your atelier is ready. You have {requests.length} pending connection request{requests.length !== 1 ? 's' : ''} and {students.length} active mentee{students.length !== 1 ? 's' : ''}.
                                    </p>
                                    {!profileSaved && (
                                        <button
                                            onClick={() => setShowProfileModal(true)}
                                            className="mt-6 self-start px-6 py-3 text-sm font-bold text-white rounded-lg transition-all active:scale-95"
                                            style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}
                                        >
                                            Complete your profile to get discovered
                                        </button>
                                    )}
                                </div>
                                <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-4">
                                    {/* Pending Requests */}
                                    <div 
                                        className="bg-surface-container-lowest p-6 rounded-xl flex flex-col justify-between aspect-square shadow-sm cursor-pointer transition-transform active:scale-95 hover:shadow-md"
                                        onClick={() => setActiveTab('connections')}
                                    >
                                        <span className="material-symbols-outlined text-primary text-3xl">pending_actions</span>
                                        <div>
                                            <p className="font-headline text-3xl font-extrabold text-primary">
                                                {String(requests.length).padStart(2, '0')}
                                            </p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-outline-variant">Pending Requests</p>
                                        </div>
                                    </div>
                                    {/* Active Mentees */}
                                    <div 
                                        className="bg-secondary-fixed p-6 rounded-xl flex flex-col justify-between aspect-square cursor-pointer transition-transform active:scale-95 hover:shadow-md"
                                        onClick={() => setActiveTab('students')}
                                    >
                                        <span className="material-symbols-outlined text-on-secondary-container text-3xl">group</span>
                                        <div>
                                            <p className="font-headline text-3xl font-extrabold text-on-secondary-container">
                                                {String(students.length).padStart(2, '0')}
                                            </p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-on-secondary-container/60">Active Mentees</p>
                                        </div>
                                    </div>
                                    {/* Classroom CTA */}
                                    <div
                                        onClick={() => navigate('/classroom/mentor')}
                                        className="col-span-2 p-6 rounded-xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
                                        style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-white/80 uppercase tracking-widest mb-1">My Classroom</p>
                                            <p className="font-headline text-4xl font-extrabold text-white">Open</p>
                                        </div>
                                        <span className="material-symbols-outlined text-white text-4xl">school</span>
                                    </div>
                                </div>
                            </section>

                            {/* Bento Grid */}
                            <section className="grid grid-cols-12 gap-4 md:gap-8">
                                {/* Connection Requests Card */}
                                <div className="col-span-12 xl:col-span-7 bg-surface-container-low rounded-3xl p-5 md:p-8">
                                    <div className="flex justify-between items-end mb-8">
                                        <div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Queue</span>
                                            <h3 className="font-headline text-3xl font-bold text-primary">Connection Requests</h3>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab('connections')}
                                            className="text-primary font-bold text-sm underline hover:opacity-70"
                                        >
                                            View All
                                        </button>
                                    </div>

                                    {loadingRequests ? (
                                        <div className="text-center py-10 text-on-surface-variant text-sm">Loading requests...</div>
                                    ) : requests.length === 0 ? (
                                        <div className="text-center py-10">
                                            <span className="material-symbols-outlined text-5xl text-outline-variant mb-3 block">inbox</span>
                                            <p className="text-on-surface-variant text-sm font-medium">No pending requests</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {requests.slice(0, 3).map(request => (
                                                <div key={request._id} className="bg-surface-container-lowest p-6 rounded-2xl flex items-center gap-6 transition-all hover:translate-x-2">
                                                    <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xl flex-shrink-0 overflow-hidden">
                                                        {request.mentee.profileImage ? (
                                                            <img src={`http://localhost:5000/${request.mentee.profileImage}`} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span>{request.mentee.firstName?.[0]}{request.mentee.lastName?.[0]}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-primary truncate">
                                                            {request.mentee.firstName} {request.mentee.lastName}
                                                        </h4>
                                                        <p className="text-xs text-on-surface-variant mb-2">
                                                            {request.mentee.department} · Batch {request.mentee.batch}
                                                        </p>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {request.mentee.subjects?.slice(0, 2).map((s, i) => (
                                                                <span key={i} className="px-2 py-1 bg-surface-container text-[10px] font-bold rounded uppercase">{s}</span>
                                                            ))}
                                                            <span className="px-2 py-1 bg-surface-container text-[10px] font-bold rounded uppercase">
                                                                {new Date(request.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 flex-shrink-0">
                                                        <button
                                                            onClick={() => window.open(`/profile/${request.mentee._id}`, '_blank')}
                                                            className="w-10 h-10 rounded-full bg-surface-container text-primary flex items-center justify-center active:scale-90 transition-transform hover:bg-primary hover:text-white"
                                                            title="View Mentee Transcripts"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">history_edu</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectRequest(request._id)}
                                                            className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center active:scale-90 transition-transform"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleAcceptRequest(request._id)}
                                                            className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-container flex items-center justify-center active:scale-90 transition-transform"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">check</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Active Mentees / Dialogues card */}
                                <div className="col-span-12 xl:col-span-5 rounded-3xl p-5 md:p-8 text-white flex flex-col relative overflow-hidden"
                                    style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}>
                                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                                        <img alt="Library background" className="w-full h-full object-cover"
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaI24KLfczHts9aTU2x5PCGK5qou8GrEyTKIcvrBVeto8QtHUMyF0ELMYMyhqANSdJb4-Ymt2L397WSg4FIgj1vsut8jf2TKfFuPaem5BVRZz4Yp1LP7fQ4H2kcgXee7pcZ2xIi1dEKUQ-XZVCvYKd7FfzUL-cAhIjGvHyDqGh46L7YXpZvCFhoMjMrNojBARgfYkcc9lwO2nJrnjMfsZcm_Y14zreL5NPLL7LFkLAVcEdxl3EPrzUVD9kUo5BOZSblTaf1KMzO7Y"
                                        />
                                    </div>
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-center mb-8">
                                            <h3 className="font-headline text-2xl font-bold">Active Mentees</h3>
                                            <span className="material-symbols-outlined">group</span>
                                        </div>
                                        <div className="space-y-4 flex-1">
                                            {loadingStudents ? (
                                                <p className="text-white/60 text-sm">Loading...</p>
                                            ) : students.length === 0 ? (
                                                <div className="flex-1 flex flex-col items-center justify-center py-8 text-white/60">
                                                    <span className="material-symbols-outlined text-4xl mb-2">groups</span>
                                                    <p className="text-sm">No active mentees yet</p>
                                                </div>
                                            ) : (
                                                students.slice(0, 3).map(conn => (
                                                    <div key={conn._id} className="flex gap-4 items-center hover:bg-white/10 p-2 rounded-xl transition-all cursor-pointer">
                                                        <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold flex-shrink-0 overflow-hidden">
                                                            {conn.mentee.profileImage ? (
                                                                <img src={`http://localhost:5000/${conn.mentee.profileImage}`} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span>{conn.mentee.firstName?.[0]}{conn.mentee.lastName?.[0]}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-sm truncate">{conn.mentee.firstName} {conn.mentee.lastName}</p>
                                                            <p className="text-xs opacity-70 truncate">{conn.mentee.department} · Batch {conn.mentee.batch}</p>
                                                        </div>
                                                        <span className="material-symbols-outlined text-white/40 text-[18px]">chevron_right</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setActiveTab('students')}
                                            className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-bold transition-all"
                                        >
                                            View All Mentees
                                        </button>
                                    </div>
                                </div>

                            </section>

                            {/* Upcoming Session / Requests Section */}
                            {/* Redesigned Compact & Centered Session Section */}
                            <section className="bg-surface-container-high rounded-3xl p-1 w-full max-w-4xl mx-auto shadow-lg shadow-primary/5">
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
                                                        <h3 className="font-headline text-3xl font-extrabold text-primary mb-6 leading-tight">
                                                            Session with {nextSession.mentee?.firstName} {nextSession.mentee?.lastName}
                                                        </h3>
                                                        <div className="flex flex-wrap justify-center gap-6 mb-8 text-on-surface-variant">
                                                            <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl">
                                                                <span className="material-symbols-outlined text-primary text-lg">calendar_today</span>
                                                                <span className="font-bold text-xs">{nextSession.date} at {nextSession.time}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl">
                                                                <span className="material-symbols-outlined text-primary text-lg">{nextSession.status === 'Confirmed' ? 'video_call' : 'pending'}</span>
                                                                <span className="font-bold text-xs">{nextSession.status === 'Confirmed' ? 'Confirmed' : 'Pending Confirmation'}</span>
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
                                    ) : requests.length > 0 ? (
                                        // ── Case 2: New Requests ──
                                        <div className="relative z-10 w-full animate-in fade-in zoom-in-95 duration-500">
                                            <div className="flex items-center justify-center gap-3 mb-4">
                                                <div className="w-2 h-2 bg-error rounded-full animate-bounce"></div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-error">Action Required</span>
                                            </div>
                                            <h3 className="font-headline text-3xl font-extrabold text-primary mb-4 leading-tight">
                                                {requests.length} New Connection Request{requests.length > 1 ? 's' : ''}
                                            </h3>
                                            <p className="text-on-surface-variant font-medium text-sm mb-8 max-w-md mx-auto">
                                                Prospective mentees are waiting for your approval. Review their profiles to expand your mentorship.
                                            </p>
                                            <button
                                                onClick={() => setActiveTab('connections')}
                                                className="px-10 py-4 bg-secondary-fixed text-on-secondary-container rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all"
                                            >
                                                REVIEW REQUESTS
                                            </button>
                                        </div>
                                    ) : (
                                        // ── Case 3: Standard/Empty State ──
                                        <div className="relative z-10 w-full animate-in fade-in zoom-in-95 duration-500">
                                            <div className="flex items-center justify-center gap-3 mb-4">
                                                <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Atelier Ready</span>
                                            </div>
                                            <h3 className="font-headline text-3xl font-extrabold text-primary mb-4 leading-tight">
                                                No active sessions <br />for today.
                                            </h3>
                                            <p className="text-on-surface-variant font-medium text-sm mb-8 max-w-sm mx-auto">
                                                Your schedule is currently clear. Head to your classroom to prepare resources or engage with current mentees.
                                            </p>
                                            <button
                                                onClick={() => navigate('/classroom/mentor')}
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

                    {/* ── CONNECTIONS TAB ── */}
                    {activeTab === 'connections' && (
                        <div>
                            <div className="mb-8">
                                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Queue</span>
                                <h2 className="font-headline text-4xl font-extrabold text-primary">Connection Requests</h2>
                            </div>
                            {loadingRequests ? (
                                <div className="flex items-center justify-center py-20 text-on-surface-variant">Loading requests...</div>
                            ) : requests.length === 0 ? (
                                <div className="bg-surface-container-lowest rounded-3xl p-16 text-center">
                                    <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">inbox</span>
                                    <h3 className="font-headline text-xl font-bold text-primary mb-2">No pending requests</h3>
                                    <p className="text-on-surface-variant text-sm">You don't have any connection requests at the moment.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {requests.map(request => (
                                        <div key={request._id} className="bg-surface-container-lowest p-6 rounded-2xl flex items-center gap-6 transition-all hover:translate-x-1 shadow-sm">
                                            <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xl flex-shrink-0 overflow-hidden">
                                                {request.mentee.profileImage ? (
                                                    <img src={`http://localhost:5000/${request.mentee.profileImage}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{request.mentee.firstName?.[0]}{request.mentee.lastName?.[0]}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-headline font-bold text-primary text-lg">
                                                    {request.mentee.firstName} {request.mentee.lastName}
                                                </h4>
                                                <p className="text-sm text-on-surface-variant mb-1">
                                                    {request.mentee.department} · Batch {request.mentee.batch}
                                                </p>
                                                <UserRatingBadge userId={request.mentee._id} className="mb-2" />
                                                <div className="flex flex-wrap gap-2">
                                                    {request.mentee.subjects?.map((s, i) => (
                                                        <span key={i} className="px-2 py-1 bg-surface-container text-[10px] font-bold rounded uppercase">{s}</span>
                                                    ))}
                                                    <span className="px-2 py-1 bg-surface-container text-[10px] font-bold rounded uppercase">
                                                        {new Date(request.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 flex-shrink-0">
                                                <button
                                                    onClick={() => window.open(`/profile/${request.mentee._id}`, '_blank')}
                                                    className="w-12 h-12 rounded-full bg-surface-container text-primary flex items-center justify-center active:scale-90 transition-transform hover:bg-primary hover:text-white"
                                                    title="View Mentee Transcripts"
                                                >
                                                    <span className="material-symbols-outlined">history_edu</span>
                                                </button>
                                                <button
                                                    onClick={() => handleRejectRequest(request._id)}
                                                    className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center active:scale-90 transition-transform hover:opacity-80"
                                                >
                                                    <span className="material-symbols-outlined">close</span>
                                                </button>
                                                <button
                                                    onClick={() => handleAcceptRequest(request._id)}
                                                    className="w-12 h-12 rounded-full bg-secondary-fixed text-on-secondary-container flex items-center justify-center active:scale-90 transition-transform hover:opacity-80"
                                                >
                                                    <span className="material-symbols-outlined">check</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── STUDENTS / TASKS TAB ── */}
                    {activeTab === 'students' && (
                        <div>
                            <div className="mb-8">
                                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Atelier</span>
                                <h2 className="font-headline text-4xl font-extrabold text-primary">Active Mentees</h2>
                            </div>
                            {loadingStudents ? (
                                <div className="flex items-center justify-center py-20 text-on-surface-variant">Loading mentees...</div>
                            ) : students.length === 0 ? (
                                <div className="bg-surface-container-lowest rounded-3xl p-16 text-center">
                                    <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">groups</span>
                                    <h3 className="font-headline text-xl font-bold text-primary mb-2">No Active Mentees</h3>
                                    <p className="text-on-surface-variant text-sm">You haven't accepted any mentorship requests yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {students.map(conn => (
                                        <div key={conn._id} className="group bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-transparent hover:border-outline-variant/20 hover:shadow-lg transition-all">
                                            <div className="flex items-start gap-4 mb-6">
                                                <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xl flex-shrink-0 overflow-hidden">
                                                    {conn.mentee.profileImage ? (
                                                        <img src={`http://localhost:5000/${conn.mentee.profileImage}`} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{conn.mentee.firstName?.[0]}{conn.mentee.lastName?.[0]}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-headline text-lg font-bold text-primary group-hover:text-primary-container transition-colors">
                                                        {conn.mentee.firstName} {conn.mentee.lastName}
                                                    </h3>
                                                    <p className="text-sm text-on-surface-variant">{conn.mentee.department} · Batch {conn.mentee.batch}</p>
                                                    <p className="text-xs text-outline mt-1">{conn.mentee.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {conn.mentee.subjects?.map((s, i) => (
                                                    <span key={i} className="px-3 py-1 bg-surface-container text-[11px] font-bold rounded-full text-on-surface-variant uppercase">{s}</span>
                                                ))}
                                            </div>
                                            <div className="pt-4 border-t border-outline-variant/10 flex justify-end">
                                                <button
                                                    onClick={() => navigate('/classroom/mentor', { state: { person: conn.mentee, connectionId: conn._id } })}
                                                    className="text-sm font-bold text-primary hover:underline"
                                                >
                                                    View Classroom →
                                                </button>
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
                            <div className="mb-8">
                                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Calendar</span>
                                <h2 className="font-headline text-4xl font-extrabold text-primary">My Sessions</h2>
                            </div>
                            {loadingSessions ? (
                                <div className="flex items-center justify-center py-20 text-on-surface-variant">Loading sessions...</div>
                            ) : sessions.length === 0 ? (
                                <div className="bg-surface-container-lowest rounded-3xl p-16 text-center">
                                    <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">event_busy</span>
                                    <h3 className="font-headline text-xl font-bold text-primary mb-2">No Sessions Yet</h3>
                                    <p className="text-on-surface-variant text-sm">You haven't been booked for any sessions.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {sessions.map(session => (
                                        <div key={session._id} className="bg-surface-container-lowest p-6 rounded-2xl flex items-center gap-6 shadow-sm">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-headline font-bold text-primary text-lg">
                                                    Session with {session.mentee?.firstName} {session.mentee?.lastName}
                                                </h4>
                                                <p className="text-sm text-on-surface-variant">
                                                    <span className="font-bold">Date:</span> {session.date} <span className="mx-2">|</span> <span className="font-bold">Time:</span> {session.time}
                                                </p>
                                                {session.meetingLink && (
                                                    <p className="text-sm mt-1">
                                                        <span className="font-bold text-on-surface-variant">Link: </span>
                                                        <a href={session.meetingLink} target="_blank" rel="noreferrer" className="text-primary hover:underline">{session.meetingLink}</a>
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-3 items-center flex-shrink-0">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${session.status === 'Pending' ? 'bg-secondary-fixed text-on-secondary-fixed' :
                                                    session.status === 'Confirmed' ? 'bg-primary-container text-on-primary-container' :
                                                        'bg-surface-container text-on-surface'
                                                    }`}>
                                                    {session.status}
                                                </span>

                                                {session.status === 'Pending' && (
                                                    <button
                                                        onClick={() => handleConfirmSession(session._id)}
                                                        className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-md hover:opacity-90 transition"
                                                    >
                                                        Accept & Add Link
                                                    </button>
                                                )}

                                                {session.status === 'Confirmed' && (
                                                    <button
                                                        onClick={() => updateSessionStatus(session._id, 'Completed')}
                                                        className="px-4 py-2 bg-secondary-fixed text-on-secondary-fixed text-sm font-bold rounded-lg shadow-md hover:opacity-90 transition"
                                                    >
                                                        Mark Completed
                                                    </button>
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

                    {/* ── AI ASSISTANT TAB ── */}
                    {activeTab === 'ai' && (
                        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-outline-variant/10" style={{ height: 'calc(100vh - 180px)' }}>
                            <AIAssistant variant="inline" />
                        </div>
                    )}

                </div>
            </main>

            {/* ── Profile Completion Modal ── */}
            {showProfileModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="font-headline text-2xl font-bold text-primary">Complete Your Profile</h2>
                                <p className="text-on-surface-variant text-sm mt-1">Get discovered by mentees looking for guidance.</p>
                            </div>
                            <button onClick={() => setShowProfileModal(false)} className="text-outline hover:text-on-surface transition">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-2">About You</label>
                                <textarea
                                    name="about"
                                    value={profileData.about}
                                    onChange={handleProfileChange}
                                    placeholder="Tell us about yourself, your expertise, and what you can mentor in..."
                                    rows="4"
                                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition resize-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-2">CGPA</label>
                                <input
                                    type="number"
                                    name="cgpa"
                                    value={profileData.cgpa}
                                    onChange={handleProfileChange}
                                    placeholder="0.0 – 4.0"
                                    step="0.01" min="0" max="4"
                                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-3">Area of Expertise</label>
                                <div className="flex flex-wrap gap-3">
                                    {['DSA', 'OOP', 'PF', 'AOA', 'Database', 'Web Development', 'Machine Learning', 'Software Engineering', 'Computer Networks', 'Operating Systems'].map(subject => (
                                        <button
                                            key={subject}
                                            type="button"
                                            onClick={() => toggleSubject(subject)}
                                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${profileData.subjects.includes(subject)
                                                ? 'bg-primary text-white shadow-md'
                                                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                                                }`}
                                        >
                                            {subject}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={isProfileSaving}
                                    className="flex-1 font-bold py-4 rounded-xl text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}
                                >
                                    {isProfileSaving ? 'Saving...' : 'Save Profile'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowProfileModal(false)}
                                    className="px-6 py-4 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold rounded-xl transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* ── Link Modal ── */}
            {linkModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-headline text-2xl font-bold text-primary">Meeting Link</h2>
                            <button onClick={() => setLinkModal({ isOpen: false, sessionId: null, link: '', error: '' })} className="text-outline hover:text-on-surface transition">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Google Meet / Zoom Link</label>
                                <input
                                    type="url"
                                    placeholder="https://meet.google.com/..."
                                    value={linkModal.link}
                                    onChange={(e) => setLinkModal({ ...linkModal, link: e.target.value, error: '' })}
                                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition"
                                />
                                {linkModal.error && <p className="text-error text-xs mt-2 font-bold">{linkModal.error}</p>}
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => setLinkModal({ isOpen: false, sessionId: null, link: '', error: '' })}
                                    className="flex-1 py-3 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitConfirmSession}
                                    className="flex-1 py-3 text-white font-bold rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition"
                                    style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}
                                >
                                    Confirm Session
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}