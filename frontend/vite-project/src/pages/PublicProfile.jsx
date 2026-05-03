import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TranscriptCard from '../components/TranscriptCard';

const PublicProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [transcripts, setTranscripts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // Fetch user info
                const userRes = await fetch(`http://localhost:5000/api/user/profile/${userId}`);
                const userData = await userRes.json();
                
                if (!userRes.ok) throw new Error(userData.message || 'User not found');
                setUser(userData.user);

                // Fetch transcripts
                const transRes = await fetch(`http://localhost:5000/api/connections/transcripts/public/${userId}`);
                const transData = await transRes.json();
                
                if (transRes.ok) setTranscripts(transData.transcripts || []);

            } catch (err) {
                console.error('Error fetching public profile:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [userId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-on-surface-variant font-medium">Verifying Profile...</p>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-8 text-center">
                <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
                <h1 className="text-2xl font-bold text-primary mb-2">Profile Not Found</h1>
                <p className="text-on-surface-variant mb-8 max-w-md">{error || "The user you are looking for doesn't exist or has a private profile."}</p>
                <button onClick={() => navigate('/')} className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition">
                    Back to Home
                </button>
            </div>
        );
    }

    const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;

    return (
        <div className="min-h-screen bg-surface font-body antialiased">
            {/* Header / Nav */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-outline-variant/10">
                <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
                    <div className="text-2xl font-extrabold tracking-tighter text-primary cursor-pointer" onClick={() => navigate('/')}>
                        MentorWise
                    </div>
                    <button onClick={() => navigate('/login')} className="px-6 py-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-lg transition">
                        Login to Portal
                    </button>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Sidebar: Profile Info */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white rounded-[32px] p-8 shadow-xl border border-outline-variant/5 text-center">
                            <div className="w-32 h-32 bg-primary-container rounded-3xl mx-auto flex items-center justify-center text-primary font-bold text-4xl shadow-inner mb-6">
                                {initials}
                            </div>
                            <h1 className="text-3xl font-extrabold text-primary mb-2">{user.firstName} {user.lastName}</h1>
                            <p className="text-on-surface-variant font-medium mb-6">{user.department} · Batch {user.batch}</p>
                            
                            <div className="flex flex-wrap justify-center gap-2 mb-8">
                                {user.subjects?.map((s, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase tracking-wider rounded-lg">
                                        {s}
                                    </span>
                                ))}
                            </div>

                            <div className="w-full h-px bg-outline-variant/10 mb-8"></div>

                            <div className="text-left">
                                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">About</h4>
                                <p className="text-sm text-on-surface leading-relaxed italic">
                                    "{user.about || "This user hasn't added a bio yet."}"
                                </p>
                            </div>
                        </div>

                        {/* Verified Badge / Trust Section */}
                        <div className="bg-gradient-to-br from-primary to-primary-container rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                            <div className="relative z-10 flex items-center gap-4 mb-4">
                                <span className="material-symbols-outlined text-3xl">verified</span>
                                <h3 className="font-bold text-xl">Verified Talent</h3>
                            </div>
                            <p className="text-blue-100/80 text-sm leading-relaxed relative z-10">
                                This profile is officially verified by MentorWise. All transcripts shown are digitally signed by mentors and authenticated by our system.
                            </p>
                        </div>
                    </div>

                    {/* Main Content: Transcripts */}
                    <div className="lg:col-span-8">
                        <div className="mb-12">
                            <h2 className="text-4xl font-extrabold text-primary tracking-tight mb-4 flex items-center gap-4">
                                Academic Achievements
                                <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                    {transcripts.length} Certified
                                </span>
                            </h2>
                            <p className="text-on-surface-variant text-lg">Official transcripts and evaluations earned throughout the mentorship journey.</p>
                        </div>

                        {transcripts.length === 0 ? (
                            <div className="bg-white rounded-[32px] p-20 text-center border-2 border-dashed border-outline-variant/20 shadow-sm">
                                <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">workspace_premium</span>
                                <h3 className="text-2xl font-bold text-primary mb-2">No Transcripts Found</h3>
                                <p className="text-on-surface-variant">This user hasn't completed any certified mentorships yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {transcripts.map(transcript => (
                                    <TranscriptCard key={transcript._id} transcript={transcript} />
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </main>

            <footer className="py-12 border-t border-outline-variant/10 text-center">
                <p className="text-xs text-on-surface-variant">
                    Powered by <span className="font-bold text-primary">MentorWise</span> · The Scholarly Atelier © 2026
                </p>
            </footer>
        </div>
    );
};

export default PublicProfile;
