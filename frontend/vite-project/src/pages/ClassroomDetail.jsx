import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import TestsPanel from '../components/TestsPanel';
import AIAssistant from '../components/AIAssistant';

// ── Tiny icon helpers ──────────────────────────────────────────────────────────
function PaperClipIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
    );
}
function PlusIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function ClassroomDetail() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isMentor = user.role === 'Mentor';

    const { subject, person, connectionId } = state || {};
    const initials = `${person?.firstName?.[0] || ''}${person?.lastName?.[0] || ''}`;
    const backPath = isMentor ? '/classroom/mentor' : '/classroom/mentee';
    const dashPath = isMentor ? '/dashboard/mentor' : '/dashboard/mentee';
    const userInitials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`;

    // ── Chat state ─────────────────────────────────────────────────────────────
    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(true);
    const [chatInput, setChatInput] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [activeTab, setActiveTab] = useState('collaboration');
    const [sidebarTab, setSidebarTab] = useState('classroom');
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [sessionDate, setSessionDate] = useState('');
    const [sessionTime, setSessionTime] = useState('');
    const [isBooking, setIsBooking] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [showEvaluationModal, setShowEvaluationModal] = useState(false);
    const [academicGrade, setAcademicGrade] = useState('A');
    const [behaviorRating, setBehaviorRating] = useState(5);
    const [punctualityRating, setPunctualityRating] = useState(5);
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const messagesEndRef = useRef(null);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // ── Fetch messages + poll every 2s ─────────────────────────────────────────
    useEffect(() => {
        if (!connectionId) { setMessagesLoading(false); return; }
        const token = localStorage.getItem('token');

        const fetchMessages = () => {
            fetch(`http://localhost:5000/api/messages/${connectionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        setMessages(data.messages.map(msg => ({
                            id: msg._id,
                            from: msg.sender._id === user.id ? 'me' : 'them',
                            text: msg.text,
                            attachment: msg.attachment,
                            time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        })));
                    }
                })
                .catch(console.error)
                .finally(() => setMessagesLoading(false));
        };

        fetchMessages();
        const intervalId = setInterval(fetchMessages, 2000);
        return () => clearInterval(intervalId);
    }, [connectionId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    // Guard: if navigated directly without state
    if (!state || !subject) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center font-body">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">school</span>
                    <p className="text-on-surface-variant mb-4">No classroom selected.</p>
                    <button onClick={() => navigate(-1)} className="text-primary font-bold hover:underline">
                        ← Go back
                    </button>
                </div>
            </div>
        );
    }

    // ── Send message handler ───────────────────────────────────────────────────
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() && !selectedFile) return;

        const token = localStorage.getItem('token');
        const inputText = chatInput.trim();
        const tempId = Date.now();

        const optimistic = {
            id: tempId,
            from: 'me',
            text: inputText,
            attachment: selectedFile
                ? { url: URL.createObjectURL(selectedFile), type: 'preview', name: selectedFile.name }
                : null,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, optimistic]);
        setChatInput('');
        const fileToUpload = selectedFile;
        setSelectedFile(null);

        try {
            let body, headers;
            if (fileToUpload) {
                body = new FormData();
                if (inputText) body.append('text', inputText);
                body.append('file', fileToUpload);
                headers = { Authorization: `Bearer ${token}` };
            } else {
                body = JSON.stringify({ text: inputText });
                headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
            }

            const response = await fetch(`http://localhost:5000/api/messages/${connectionId}`, {
                method: 'POST', headers, body,
            });
            const data = await response.json();

            if (data.success) {
                setMessages(prev => prev.map(msg =>
                    msg.id === tempId
                        ? {
                            id: data.message._id,
                            from: 'me',
                            text: data.message.text,
                            attachment: data.message.attachment,
                            time: new Date(data.message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        }
                        : msg
                ));
            } else {
                setMessages(prev => prev.filter(msg => msg.id !== tempId));
            }
        } catch (err) {
            console.error('Send message error:', err);
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
        }
    };

    // ── Book Session handler ───────────────────────────────────────────────────
    const handleBookSession = async (e) => {
        e.preventDefault();
        if (!sessionDate || !sessionTime) return;
        setIsBooking(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    mentorId: person._id,
                    date: sessionDate,
                    time: sessionTime
                })
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Session booked successfully!');
                setShowSessionModal(false);
                setSessionDate('');
                setSessionTime('');
            } else {
                showToast(data.message || 'Failed to book session', 'error');
            }
        } catch (error) {
            console.error('Error booking session:', error);
            showToast('An error occurred while booking the session.', 'error');
        } finally {
            setIsBooking(false);
        }
    };

    // ── Complete Mentorship handler ──────────────────────────────────────────
    const handleCompleteMentorship = async (e) => {
        e.preventDefault();
        if (!remarks.trim()) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/connections/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    connectionId,
                    academicGrade,
                    behaviorRating,
                    punctualityRating,
                    remarks
                })
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Mentorship completed and transcript generated!');
                setIsCompleted(true);
                setShowEvaluationModal(false);
            } else {
                showToast(data.message || 'Failed to complete mentorship', 'error');
            }
        } catch (error) {
            console.error('Error completing mentorship:', error);
            showToast('An error occurred while completing the mentorship.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="bg-surface font-body text-on-surface flex min-h-screen">

            {/* ── Sidebar ── */}
            <aside className="fixed left-0 top-0 h-screen flex flex-col py-8 px-6 bg-slate-50 w-64 z-50 shadow-sm" style={{ borderRight: '1px solid #e2e2e7' }}>
                <div className="mb-10 px-2 text-left">
                    <h1 className="font-headline text-2xl font-bold tracking-tight text-primary">MentorWise</h1>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-1">Mentor Portal</p>
                </div>

                <nav className="flex-1 space-y-1">
                    <button
                        onClick={() => navigate(dashPath)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-500 hover:text-primary hover:bg-surface-container-low transition-all"
                    >
                        <span className="material-symbols-outlined text-[20px]">dashboard</span>
                        <span>Dashboard</span>
                    </button>
                    <button
                        onClick={() => setSidebarTab('classroom')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${sidebarTab === 'classroom'
                                ? 'text-primary font-bold bg-surface-container-low border-r-4 border-primary'
                                : 'text-slate-500 hover:text-primary hover:bg-surface-container-low'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]" style={sidebarTab === 'classroom' ? { fontVariationSettings: "'FILL' 1" } : {}}>group</span>
                        <span>Classroom</span>
                    </button>
                    <button
                        onClick={() => setSidebarTab('ai')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${sidebarTab === 'ai'
                                ? 'text-primary font-bold bg-surface-container-low border-r-4 border-primary'
                                : 'text-slate-500 hover:text-primary hover:bg-surface-container-low'
                            }`}
                    >
                        <span className={sidebarTab === 'ai' ? 'opacity-100' : 'opacity-70'}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                                <circle cx="12" cy="12" r="3" fill="white"/>
                            </svg>
                        </span>
                        <span>AI Consultant</span>
                    </button>
                </nav>

                <div className="mt-auto space-y-4">
                    <button
                        onClick={() => navigate(backPath)}
                        className="w-full text-white py-3 rounded-lg text-sm font-bold tracking-wide active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back to Classroom
                    </button>
                    <div className="pt-6 border-t border-outline-variant/20 flex flex-col gap-1">
                        <button
                            onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }}
                            className="flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-error transition-colors"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── Main Canvas ── */}
            <main className="ml-64 min-h-screen flex flex-col flex-1 relative">

                {/* Context Header */}
                <header className="sticky top-0 z-40 px-10 py-6"
                    style={{ background: 'rgba(249,249,254,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(195,198,209,0.15)' }}>
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
                                    {isMentor ? 'Current Mentee' : 'Current Mentor'}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary-fixed px-2 py-0.5 rounded">
                                    {subject}
                                </span>
                            </div>
                            <h2 className="font-headline text-4xl font-extrabold text-primary tracking-tight">
                                {person?.firstName} {person?.lastName}
                            </h2>
                            <p className="text-on-surface-variant font-medium flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">school</span>
                                {person?.department
                                    ? `${person.department} · Batch ${person.batch}`
                                    : `${subject} · Advanced Seminar`}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {!isMentor && (
                                <button
                                    onClick={() => setShowSessionModal(true)}
                                    className="px-4 py-2 bg-secondary-fixed text-on-secondary-fixed rounded-lg text-sm font-bold shadow-md hover:opacity-90 active:scale-95 transition"
                                >
                                    Book Session
                                </button>
                            )}
                            {isMentor && !isCompleted && (
                                <button
                                    onClick={() => setShowEvaluationModal(true)}
                                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-md hover:opacity-90 active:scale-95 transition flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                                    End Mentorship & Generate Transcript
                                </button>
                            )}
                            {isCompleted && (
                                <div className="px-4 py-2 bg-success/10 text-success rounded-lg text-sm font-bold flex items-center gap-2 border border-success/20">
                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    Mentorship Completed
                                </div>
                            )}
                            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm border-2 border-primary/10">
                                {userInitials || 'MW'}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="bg-surface border-b border-outline-variant/10 px-10 flex gap-8">
                    <button
                        onClick={() => setActiveTab('collaboration')}
                        className={`py-4 font-bold text-sm tracking-wide border-b-2 transition-all ${activeTab === 'collaboration' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
                    >
                        Collaboration Hub
                    </button>
                    <button
                        onClick={() => setActiveTab('assessments')}
                        className={`py-4 font-bold text-sm tracking-wide border-b-2 transition-all ${activeTab === 'assessments' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
                    >
                        Assessment Center
                    </button>
                </div>

                {/* Workspaces */}
                <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
                    {sidebarTab === 'ai' ? (
                        <AIAssistant variant="inline" />
                    ) : activeTab === 'collaboration' ? (
                        <>
                            {/* ── Chat (left/main) ── */}
                            <section className="flex-1 flex flex-col bg-surface-container-low min-w-0">

                                {/* Messages area */}
                                <div
                                    className="flex-1 overflow-y-auto p-8 space-y-8"
                                    onClick={() => setShowAttachMenu(false)}
                                >
                                    {/* Loading */}
                                    {messagesLoading && (
                                        <div className="flex items-center justify-center py-24">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                <p className="text-on-surface-variant text-sm">Loading messages...</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Empty */}
                                    {!messagesLoading && messages.length === 0 && (
                                        <div className="text-center py-24">
                                            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">chat_bubble</span>
                                            <p className="text-on-surface-variant text-sm font-medium">No messages yet. Start the conversation!</p>
                                        </div>
                                    )}

                                    {/* Messages */}
                                    {messages.map(msg => (
                                        <div
                                            key={msg.id}
                                            className={`flex gap-4 max-w-2xl ${msg.from === 'me' ? 'self-end flex-row-reverse ml-auto' : ''}`}
                                        >
                                            {/* Avatar */}
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 self-end ${msg.from === 'me'
                                                    ? 'bg-primary text-on-primary'
                                                    : 'bg-primary-container text-on-primary-container'
                                                }`}>
                                                {msg.from === 'me' ? userInitials : initials}
                                            </div>

                                            <div className={`flex flex-col gap-1.5 ${msg.from === 'me' ? 'items-end' : ''}`}>
                                                {/* Bubble */}
                                                <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.from === 'me'
                                                        ? 'text-white rounded-br-none'
                                                        : 'bg-surface-container-lowest text-on-surface rounded-bl-none'
                                                    }`}
                                                    style={msg.from === 'me'
                                                        ? { background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }
                                                        : {}
                                                    }
                                                >
                                                    {/* Attachment */}
                                                    {msg.attachment && (
                                                        <div className="mb-2">
                                                            {msg.attachment.type === 'image' && (
                                                                <a href={msg.attachment.url} target="_blank" rel="noreferrer">
                                                                    <img src={msg.attachment.url} alt="attachment" className="rounded-xl max-h-48 object-cover hover:opacity-90 transition" />
                                                                </a>
                                                            )}
                                                            {msg.attachment.type === 'video' && (
                                                                <video src={msg.attachment.url} controls className="rounded-xl max-h-48 max-w-full" />
                                                            )}
                                                            {msg.attachment.type === 'document' && (
                                                                <a href={msg.attachment.url} target="_blank" rel="noreferrer"
                                                                    className="flex items-center gap-3 p-3 bg-surface-container-lowest/20 rounded-xl border border-outline-variant/15 hover:opacity-80 transition">
                                                                    <div className="w-10 h-10 rounded bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
                                                                        <span className="material-symbols-outlined">picture_as_pdf</span>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold truncate max-w-[150px]">{msg.attachment.name}</p>
                                                                        <p className="text-[10px] opacity-70">Document</p>
                                                                    </div>
                                                                    <span className="material-symbols-outlined ml-auto opacity-70">download</span>
                                                                </a>
                                                            )}
                                                            {msg.attachment.type === 'preview' && (
                                                                <div className="opacity-50 flex items-center gap-2 text-xs">
                                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                    Uploading {msg.attachment.name}...
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {msg.text && <div>{msg.text}</div>}
                                                </div>

                                                <span className={`text-[10px] text-on-surface-variant/60 ${msg.from === 'me' ? 'mr-1 flex items-center gap-1' : 'ml-1'}`}>
                                                    {msg.time}
                                                    {msg.from === 'me' && <span className="material-symbols-outlined text-[10px]">done_all</span>}
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                    <div ref={messagesEndRef} />
                                </div>

                                {/* File preview strip */}
                                {selectedFile && (
                                    <div className="px-8 py-2 bg-surface-container border-t border-outline-variant/10 flex items-center gap-3">
                                        <div className="flex-1 truncate text-xs font-semibold text-on-surface flex items-center gap-2">
                                            <PaperClipIcon /> {selectedFile.name}
                                        </div>
                                        <button onClick={() => setSelectedFile(null)} className="text-outline hover:text-error p-1 transition">✕</button>
                                    </div>
                                )}

                                {/* Hidden file inputs */}
                                <input type="file" id="chat-upload-doc" className="hidden"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                                    onChange={e => { e.target.files[0] && setSelectedFile(e.target.files[0]); setShowAttachMenu(false); }} />
                                <input type="file" id="chat-upload-img" className="hidden"
                                    accept="image/*"
                                    onChange={e => { e.target.files[0] && setSelectedFile(e.target.files[0]); setShowAttachMenu(false); }} />
                                <input type="file" id="chat-upload-vid" className="hidden"
                                    accept="video/*"
                                    onChange={e => { e.target.files[0] && setSelectedFile(e.target.files[0]); setShowAttachMenu(false); }} />

                                {/* Chat input */}
                                <div className="p-8">
                                    <form
                                        onSubmit={handleSendMessage}
                                        className="bg-surface-container-lowest p-2 rounded-2xl shadow-sm border border-outline-variant/10 flex items-center gap-2 focus-within:ring-2 ring-primary/5 transition-all relative"
                                    >
                                        {/* Attach button + popup */}
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setShowAttachMenu(!showAttachMenu)}
                                                className="p-3 text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors"
                                            >
                                                <span className="material-symbols-outlined">attach_file</span>
                                            </button>
                                            {showAttachMenu && (
                                                <div className="absolute bottom-14 left-0 w-40 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-2xl py-2 flex flex-col z-50">
                                                    <label htmlFor="chat-upload-doc" className="cursor-pointer px-4 py-2.5 hover:bg-surface-container flex items-center gap-3 text-sm text-on-surface transition">
                                                        <span className="p-1.5 bg-primary/10 text-primary rounded-full">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                        </span>
                                                        Document
                                                    </label>
                                                    <label htmlFor="chat-upload-img" className="cursor-pointer px-4 py-2.5 hover:bg-surface-container flex items-center gap-3 text-sm text-on-surface transition">
                                                        <span className="p-1.5 bg-secondary-fixed text-on-secondary-container rounded-full">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                        </span>
                                                        Picture
                                                    </label>
                                                    <label htmlFor="chat-upload-vid" className="cursor-pointer px-4 py-2.5 hover:bg-surface-container flex items-center gap-3 text-sm text-on-surface transition">
                                                        <span className="p-1.5 bg-error-container text-on-error-container rounded-full">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                        </span>
                                                        Video
                                                    </label>
                                                </div>
                                            )}
                                        </div>

                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={e => setChatInput(e.target.value)}
                                            placeholder="Share your academic feedback..."
                                            className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder-on-surface-variant/50 px-2 py-3 outline-none disabled:opacity-50"
                                            disabled={isCompleted}
                                        />

                                        <button
                                            type="submit"
                                            disabled={(!chatInput.trim() && !selectedFile) || isCompleted}
                                            className="text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                            style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                                        </button>
                                    </form>
                                </div>
                            </section>

                            {/* ── Tasks Panel (right) ── */}
                            <TasksPanel
                                connectionId={connectionId}
                                isMentor={isMentor}
                                person={person}
                            />
                        </>
                    ) : (
                        <TestsPanel connectionId={connectionId} isMentor={isMentor} person={person} />
                    )}

                </div>
            </main>

            {/* ── Book Session Modal ── */}
            {showSessionModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-headline text-2xl font-bold text-primary">Book a Session</h2>
                            <button onClick={() => setShowSessionModal(false)} className="text-outline hover:text-on-surface transition">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleBookSession} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Select Date</label>
                                <input
                                    type="date"
                                    required
                                    value={sessionDate}
                                    onChange={(e) => setSessionDate(e.target.value)}
                                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Select Time</label>
                                <input
                                    type="time"
                                    required
                                    value={sessionTime}
                                    onChange={(e) => setSessionTime(e.target.value)}
                                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowSessionModal(false)}
                                    className="flex-1 py-3 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isBooking}
                                    className="flex-1 py-3 text-white font-bold rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}
                                >
                                    {isBooking ? 'Booking...' : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Evaluation Modal ── */}
            {showEvaluationModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] p-10 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="font-headline text-3xl font-bold text-primary">Final Evaluation</h2>
                                <p className="text-on-surface-variant text-sm mt-1">Complete this form to generate the mentee's transcript.</p>
                            </div>
                            <button onClick={() => setShowEvaluationModal(false)} className="text-outline hover:text-on-surface transition p-2 hover:bg-surface-container rounded-full">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleCompleteMentorship} className="space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                {/* Academic Grade */}
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-3">Academic Grade</label>
                                    <select
                                        value={academicGrade}
                                        onChange={(e) => setAcademicGrade(e.target.value)}
                                        className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-5 py-4 text-on-surface focus:border-primary/20 focus:bg-white outline-none transition-all cursor-pointer font-bold"
                                    >
                                        {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F'].map(g => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Behavior Rating */}
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-3">Behavior & Punctuality</label>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-on-surface-variant">Behavior</span>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <button key={s} type="button" onClick={() => setBehaviorRating(s)} className={`material-symbols-outlined text-xl transition ${s <= behaviorRating ? 'text-yellow-500' : 'text-slate-300 hover:text-yellow-200'}`} style={{ fontVariationSettings: s <= behaviorRating ? "'FILL' 1" : "'FILL' 0" }}>star</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-on-surface-variant">Punctuality</span>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <button key={s} type="button" onClick={() => setPunctualityRating(s)} className={`material-symbols-outlined text-xl transition ${s <= punctualityRating ? 'text-yellow-500' : 'text-slate-300 hover:text-yellow-200'}`} style={{ fontVariationSettings: s <= punctualityRating ? "'FILL' 1" : "'FILL' 0" }}>star</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Remark */}
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-3">Detailed Remark</label>
                                <textarea
                                    required
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Explain what the mentee has learnt and their overall performance..."
                                    rows="5"
                                    className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-6 py-5 text-on-surface focus:border-primary/20 focus:bg-white outline-none transition-all resize-none leading-relaxed"
                                ></textarea>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEvaluationModal(false)}
                                    className="flex-1 py-4 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold rounded-2xl transition-all active:scale-95"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !remarks.trim()}
                                    className="flex-[2] py-4 text-white font-bold rounded-2xl shadow-xl hover:shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">send</span>
                                            Complete & Generate Transcript
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Toast Notification ── */}
            {toast.show && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-fade-in-up">
                    <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md ${toast.type === 'success'
                            ? 'bg-success/90 text-white'
                            : 'bg-error/90 text-white'
                        }`}>
                        <span className="material-symbols-outlined text-[20px]">
                            {toast.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        <span className="font-bold text-sm tracking-wide">{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Tasks right panel ─────────────────────────────────────────────────────────
function TasksPanel({ connectionId, isMentor, person }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddTask, setShowAddTask] = useState(false);
    const [expandedTaskId, setExpandedTaskId] = useState(null);

    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [newTaskDue, setNewTaskDue] = useState('');
    const [newTaskFile, setNewTaskFile] = useState(null);

    const [submissionFile, setSubmissionFile] = useState(null);
    const [submissionText, setSubmissionText] = useState('');
    const [gradeInput, setGradeInput] = useState('');
    const [feedbackInput, setFeedbackInput] = useState('');

    const token = localStorage.getItem('token');

    const fetchTasks = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/tasks/${connectionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setTasks(data.tasks);
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        if (connectionId) {
            fetchTasks(); 
            const interval = setInterval(fetchTasks, 10000); // Poll every 10s
            return () => clearInterval(interval);
        }
    }, [connectionId]);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        const formData = new FormData();
        formData.append('title', newTaskTitle);
        formData.append('description', newTaskDesc);
        if (newTaskDue) formData.append('dueDate', newTaskDue);
        if (newTaskFile) formData.append('file', newTaskFile);
        try {
            const res = await fetch(`http://localhost:5000/api/tasks/${connectionId}`, {
                method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData
            });
            const data = await res.json();
            if (data.success) {
                setTasks([data.task, ...tasks]);
                setNewTaskTitle(''); setNewTaskDesc(''); setNewTaskDue(''); setNewTaskFile(null);
                setShowAddTask(false);
            }
        } catch (err) { console.error(err); }
    };

    const handleSubmitWork = async (taskId) => {
        const formData = new FormData();
        if (submissionFile) formData.append('file', submissionFile);
        if (submissionText.trim()) formData.append('text', submissionText.trim());
        else if (!submissionFile) formData.append('text', 'Submitted without file and message');
        try {
            const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/submit`, {
                method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: formData
            });
            const data = await res.json();
            if (data.success) {
                setTasks(tasks.map(t => t._id === taskId ? data.task : t));
                setSubmissionFile(null); setSubmissionText('');
            }
        } catch (err) { console.error(err); }
    };

    const handleGradeTask = async (taskId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/grade`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ grade: gradeInput, feedback: feedbackInput })
            });
            const data = await res.json();
            if (data.success) {
                setTasks(tasks.map(t => t._id === taskId ? data.task : t));
                setGradeInput(''); setFeedbackInput('');
            }
        } catch (err) { console.error(err); }
    };

    const activeTasks = tasks.filter(t => t.status !== 'graded');
    const gradedTasks = tasks.filter(t => t.status === 'graded');

    const statusBadge = (task) => {
        const isOverdue = task.status === 'pending' && task.dueDate && new Date(task.dueDate) < new Date();
        if (task.status === 'graded') return <span className="bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Graded</span>;
        if (task.status === 'submitted') return <span className="bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Pending Review</span>;
        if (isOverdue) return <span className="bg-error-container text-on-error-container text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Overdue</span>;
        return <span className="bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">In Progress</span>;
    };

    return (
        <aside className="w-96 bg-surface flex flex-col gap-6 border-l border-outline-variant/10 overflow-y-auto">
            <div className="p-8 space-y-6">

                {/* Assign task CTA */}
                {isMentor && (
                    <button
                        onClick={() => setShowAddTask(!showAddTask)}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-secondary-fixed text-on-secondary-fixed font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined">add_task</span>
                        {showAddTask ? 'Cancel' : 'Assign New Task'}
                    </button>
                )}

                {/* Add task form */}
                {isMentor && showAddTask && (
                    <form onSubmit={handleAddTask} className="bg-surface-container-low rounded-2xl p-6 space-y-4 border border-outline-variant/10">
                        <h4 className="font-headline font-bold text-primary text-lg">New Assignment</h4>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Title</label>
                            <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} required
                                placeholder="e.g. Read Chapter 5"
                                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none transition" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Instructions</label>
                            <textarea value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} rows="3"
                                placeholder="Add instructions..."
                                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none transition resize-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Due Date</label>
                                <input type="date" value={newTaskDue} onChange={e => setNewTaskDue(e.target.value)}
                                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3 py-2.5 text-on-surface text-sm outline-none transition" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Attachment</label>
                                <input type="file" onChange={e => setNewTaskFile(e.target.files[0])}
                                    className="w-full text-on-surface-variant text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-surface-container file:text-on-surface hover:file:bg-surface-container-high transition" />
                            </div>
                        </div>
                        <button type="submit" disabled={!newTaskTitle.trim()}
                            className="w-full py-3 rounded-xl text-white text-sm font-bold shadow-lg disabled:opacity-50 transition-all active:scale-95"
                            style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}>
                            Assign Task
                        </button>
                    </form>
                )}

                {/* Active Tasks */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-headline font-bold text-primary text-xl tracking-tight">Active Tasks</h3>
                        <span className="bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold px-2 py-1 rounded-full">
                            {loading ? '…' : `${activeTasks.length} Active`}
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : activeTasks.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-outline-variant/20 rounded-2xl">
                            <span className="material-symbols-outlined text-3xl text-outline-variant mb-2 block">assignment</span>
                            <p className="text-on-surface-variant text-xs font-medium">No active tasks</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeTasks.map(task => {
                                const isExpanded = expandedTaskId === task._id;
                                return (
                                    <div key={task._id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/5 shadow-sm overflow-hidden group">
                                        {/* Task header row */}
                                        <div
                                            onClick={() => setExpandedTaskId(isExpanded ? null : task._id)}
                                            className="p-5 cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                {statusBadge(task)}
                                                <span className="text-[10px] text-on-surface-variant font-medium">
                                                    {task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : ''}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors leading-tight mb-1">
                                                {task.title}
                                            </h4>
                                            <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                                                {task.description || 'No description'}
                                            </p>
                                            {/* Progress bar (visual only) */}
                                            {task.status === 'pending' && (
                                                <div className="mt-4 pt-4 border-t border-outline-variant/10 flex items-center gap-2">
                                                    <div className="flex-1 bg-surface-container rounded-full h-1">
                                                        <div className="bg-primary h-full rounded-full w-1/3" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-primary">In Progress</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Expanded panel */}
                                        {isExpanded && (
                                            <div className="border-t border-outline-variant/10 p-5 bg-surface-container-low space-y-4">
                                                {/* Instructions */}
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Instructions</p>
                                                    <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                                                        {task.description || 'No instructions provided.'}
                                                    </p>
                                                </div>

                                                {/* Mentor attachment */}
                                                {task.mentorAttachment?.url && (
                                                    <a href={task.mentorAttachment.url} target="_blank" rel="noreferrer"
                                                        className="flex items-center gap-2 px-3 py-2 bg-surface-container rounded-xl border border-outline-variant/10 text-sm text-primary hover:opacity-80 transition">
                                                        <PaperClipIcon />
                                                        <span className="truncate">{task.mentorAttachment.name || 'Attachment'}</span>
                                                    </a>
                                                )}

                                                {/* MENTOR: see student submission + grade */}
                                                {isMentor && (
                                                    <div className="pt-3 border-t border-outline-variant/10">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Student Work</p>
                                                        {task.status === 'pending' ? (
                                                            <p className="text-on-surface-variant text-sm italic">Not turned in yet.</p>
                                                        ) : (
                                                            <div className="space-y-3">
                                                                {task.submission?.attachment?.url && (
                                                                    <a href={task.submission.attachment.url} target="_blank" rel="noreferrer"
                                                                        className="flex items-center gap-2 px-3 py-2 bg-surface-container rounded-xl text-sm text-primary hover:opacity-80 transition">
                                                                        <PaperClipIcon />
                                                                        <span className="truncate">{task.submission.attachment.name || 'View Work'}</span>
                                                                    </a>
                                                                )}
                                                                {task.submission?.text && !['Submitted without file and message', 'Submitted without file'].includes(task.submission.text) && (
                                                                    <div className="bg-surface-container p-3 rounded-xl">
                                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Student Message</p>
                                                                        <p className="text-sm text-on-surface">{task.submission.text}</p>
                                                                    </div>
                                                                )}
                                                                {task.status === 'submitted' ? (
                                                                    <div className="space-y-2">
                                                                        <div className="flex gap-2">
                                                                            <input type="text" placeholder="Grade (e.g. 90/100)" value={gradeInput} onChange={e => setGradeInput(e.target.value)}
                                                                                className="w-[130px] bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3 py-2 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                                                                            <input type="text" placeholder="Feedback..." value={feedbackInput} onChange={e => setFeedbackInput(e.target.value)}
                                                                                className="flex-1 bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3 py-2 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                                                                        </div>
                                                                        <button onClick={() => handleGradeTask(task._id)} disabled={!gradeInput && !feedbackInput}
                                                                            className="w-full py-2.5 rounded-xl text-sm font-bold bg-surface-container-highest text-on-surface hover:bg-outline-variant/20 transition disabled:opacity-50">
                                                                            Return to Student
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="bg-primary-fixed/30 rounded-xl p-3">
                                                                        <p className="text-primary text-sm font-bold">Grade: <span className="text-on-surface font-normal ml-1">{task.grade || '-'}</span></p>
                                                                        {task.feedback && <p className="text-on-surface-variant text-sm mt-1">{task.feedback}</p>}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* MENTEE: submit work */}
                                                {!isMentor && (
                                                    <div className="pt-3 border-t border-outline-variant/10">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Your Work</p>
                                                        {task.status === 'pending' ? (
                                                            <div className="space-y-2">
                                                                <input type="file" id={`upload-${task._id}`} className="hidden" onChange={e => setSubmissionFile(e.target.files[0])} />
                                                                <label htmlFor={`upload-${task._id}`}
                                                                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-outline-variant/20 text-on-surface-variant text-sm font-semibold cursor-pointer hover:bg-surface-container transition">
                                                                    <PlusIcon /> {submissionFile ? submissionFile.name : 'Add file'}
                                                                </label>
                                                                <textarea value={submissionText} onChange={e => setSubmissionText(e.target.value)}
                                                                    placeholder="Add a message (optional)..." rows="2"
                                                                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3 py-2.5 text-on-surface text-sm outline-none resize-none focus:ring-2 focus:ring-primary/20" />
                                                                <button onClick={() => handleSubmitWork(task._id)}
                                                                    className="w-full py-2.5 rounded-xl text-white text-sm font-bold shadow-lg transition-all active:scale-95"
                                                                    style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}>
                                                                    Turn In
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                {task.submission?.attachment?.url && (
                                                                    <a href={task.submission.attachment.url} target="_blank" rel="noreferrer"
                                                                        className="flex items-center gap-2 px-3 py-2 bg-surface-container rounded-xl text-sm text-primary hover:opacity-80 transition">
                                                                        <PaperClipIcon /> <span className="truncate">{task.submission.attachment.name}</span>
                                                                    </a>
                                                                )}
                                                                {task.status === 'graded' && (
                                                                    <div className="bg-primary-fixed/30 rounded-xl p-3 mt-2">
                                                                        <p className="text-primary text-sm font-bold">Grade: <span className="text-on-surface font-normal ml-1">{task.grade || 'N/A'}</span></p>
                                                                        {task.feedback && <p className="text-on-surface-variant text-sm mt-1">{task.feedback}</p>}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Milestone Progress banner */}
                <div className="p-6 rounded-3xl text-white relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}>
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-4">Milestone Progress</p>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{gradedTasks.length} graded</span>
                                <span className="text-xs font-bold text-secondary-fixed">
                                    {tasks.length > 0
                                        ? `${gradedTasks.length}/${tasks.length} Tasks`
                                        : 'No tasks yet'}
                                </span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1.5">
                                <div
                                    className="bg-secondary-fixed h-full rounded-full transition-all"
                                    style={{ width: tasks.length > 0 ? `${(gradedTasks.length / tasks.length) * 100}%` : '0%' }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                        <span className="material-symbols-outlined text-[100px]">auto_stories</span>
                    </div>
                </div>

            </div>
        </aside>
    );
}
