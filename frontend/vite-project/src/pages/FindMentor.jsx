import { useState, useEffect, useCallback } from 'react';
import UserRatingBadge from '../components/UserRatingBadge';
import { useNavigate } from 'react-router-dom';

const FindMentor = () => {
    const navigate = useNavigate();

    // ── State ─────────────────────────────────────────────────────────────────
    const [searchTerm,      setSearchTerm]      = useState('');
    const [minCgpa,         setMinCgpa]         = useState('');
    const [department,      setDepartment]      = useState('');
    const [mentors,         setMentors]         = useState([]);
    const [loading,         setLoading]         = useState(false);
    const [error,           setError]           = useState(null);
    const [initialLoad,     setInitialLoad]     = useState(true);
    // statusMap key: "mentorId-subject"  →  status string
    const [requestStatuses, setRequestStatuses] = useState({});
    const [toast,           setToast]           = useState({ show: false, message: '', type: '' });

    // Pagination
    const PAGE_SIZE = 9;
    const [page, setPage] = useState(1);

    // ── Debounce ──────────────────────────────────────────────────────────────
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    // ── Fetch mentors ─────────────────────────────────────────────────────────
    const fetchMentors = async (search = '', cgpa = '', dept = '') => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (cgpa)   params.append('minCgpa', cgpa);
            if (dept)   params.append('department', dept);

            const response = await fetch(
                `http://localhost:5000/api/user/mentors/search?${params.toString()}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            if (!response.ok) throw new Error('Failed to fetch mentors');
            const data = await response.json();
            setMentors(data.mentors || []);
            setInitialLoad(false);
            setPage(1);
        } catch (err) {
            setError(err.message);
            setMentors([]);
        } finally {
            setLoading(false);
        }
    };

    // ── Fetch sent requests ───────────────────────────────────────────────────
    // Status key: "mentorId-subject"
    const fetchSentRequests = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/connections/requests/sent', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                const statusMap = {};
                data.requests.forEach(req => {
                    if (req.mentor?._id && req.subject) {
                        statusMap[`${req.mentor._id}-${req.subject}`] = req.status;
                    }
                });
                setRequestStatuses(statusMap);
            }
        } catch (err) {
            console.error('Error fetching sent requests:', err);
        }
    };

    const debouncedFetch = useCallback(
        debounce((search, cgpa, dept) => fetchMentors(search, cgpa, dept), 500),
        []
    );

    useEffect(() => { debouncedFetch(searchTerm, minCgpa, department); }, [searchTerm, minCgpa, department]);
    useEffect(() => { fetchMentors(); fetchSentRequests(); }, []);

    // Auto-hide toast
    useEffect(() => {
        if (toast.show) {
            const t = setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
            return () => clearTimeout(t);
        }
    }, [toast.show]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const getInitials = (firstName, lastName) =>
        `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '??';

    // ── Build per-subject card list ────────────────────────────────────────────
    // Each mentor with N subjects becomes N items in this list
    const mentorSubjectPairs = [];
    mentors.forEach(mentor => {
        const subjects = mentor.subjects?.length > 0 ? mentor.subjects : ['General Mentorship'];
        subjects.forEach(subject => {
            mentorSubjectPairs.push({ mentor, subject });
        });
    });

    // ── Send request ──────────────────────────────────────────────────────────
    const handleSendRequest = async (mentorId, subject) => {
        try {
            const response = await fetch('http://localhost:5000/api/connections/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ mentorId, subject })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to send request');

            setRequestStatuses(prev => ({ ...prev, [`${mentorId}-${subject}`]: 'pending' }));
            setToast({ show: true, message: `Connection request sent for ${subject}!`, type: 'success' });
        } catch (err) {
            setToast({ show: true, message: err.message, type: 'error' });
        }
    };

    // ── Paginated slice (over pairs, not raw mentors) ─────────────────────────
    const totalPages = Math.ceil(mentorSubjectPairs.length / PAGE_SIZE);
    const paginated  = mentorSubjectPairs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // ── Button state helper ───────────────────────────────────────────────────
    const btnLabel = (status) => {
        if (status === 'accepted') return 'Connected';
        if (status === 'pending')  return 'Request Sent';
        return 'Request Connection';
    };

    return (
        <div className="font-body text-on-surface">

            {/* ── Page Header ── */}
            <header className="flex justify-between items-center mb-16">
                <div className="max-w-2xl">
                    <span className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-2 block font-semibold">
                        Discovery Hub
                    </span>
                    <h2 className="font-headline font-bold text-5xl text-primary tracking-tight">
                        Find Your Perfect Mentor
                    </h2>
                </div>
            </header>

            {/* ── Search & Filter ── */}
            <section className="bg-surface-container-low p-1 rounded-2xl mb-12">
                <div className="bg-surface-container-lowest rounded-xl p-8 flex flex-wrap gap-6 items-end"
                    style={{ outline: '1px solid rgba(195,198,209,0.15)' }}>

                    {/* Search */}
                    <div className="flex-1 min-w-[240px]">
                        <label className="block font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
                            Search Name or Keyword
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-xl">search</span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="e.g. 'Data Science' or 'Dr. Ahmed'"
                                className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-on-surface placeholder-outline outline-none font-body transition-all"
                            />
                        </div>
                    </div>

                    {/* Department */}
                    <div className="w-48">
                        <label className="block font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
                            Department
                        </label>
                        <select
                            value={department}
                            onChange={e => setDepartment(e.target.value)}
                            className="w-full px-4 py-4 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-on-surface font-body appearance-none outline-none cursor-pointer"
                        >
                            <option value="">All Departments</option>
                            <option value="CS">Computer Science</option>
                            <option value="IT">Information Technology</option>
                            <option value="SE">Software Engineering</option>
                            <option value="DS">Data Science</option>
                            <option value="EE">Electrical Engineering</option>
                        </select>
                    </div>

                    {/* Min CGPA */}
                    <div className="w-44">
                        <label className="block font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
                            Min. CGPA
                        </label>
                        <select
                            value={minCgpa}
                            onChange={e => setMinCgpa(e.target.value)}
                            className="w-full px-4 py-4 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-on-surface font-body appearance-none outline-none cursor-pointer"
                        >
                            <option value="">Any CGPA</option>
                            <option value="3.0">3.0+</option>
                            <option value="3.5">3.5+</option>
                            <option value="3.8">3.8+</option>
                        </select>
                    </div>

                    {/* Apply / Clear */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => fetchMentors(searchTerm, minCgpa, department)}
                            className="text-white px-8 py-4 rounded-lg font-headline font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
                            style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}
                        >
                            <span className="material-symbols-outlined text-xl">filter_list</span>
                            Apply Filters
                        </button>
                        {(searchTerm || minCgpa || department) && (
                            <button
                                onClick={() => { setSearchTerm(''); setMinCgpa(''); setDepartment(''); }}
                                className="px-5 py-4 rounded-lg font-bold text-sm text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Results count */}
            {!loading && !error && mentorSubjectPairs.length > 0 && (
                <p className="text-on-surface-variant text-sm mb-6">
                    Showing <span className="font-bold text-on-surface">{paginated.length}</span> of{' '}
                    <span className="font-bold text-on-surface">{mentorSubjectPairs.length}</span> available subject{mentorSubjectPairs.length !== 1 ? 's' : ''}
                </p>
            )}

            {/* ── Loading ── */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <span className="text-on-surface-variant text-sm font-medium">Searching for mentors...</span>
                </div>
            )}

            {/* ── Error ── */}
            {error && !loading && (
                <div className="bg-error-container rounded-2xl p-10 text-center">
                    <span className="material-symbols-outlined text-4xl text-error mb-3 block">error</span>
                    <p className="text-error font-bold">{error}</p>
                </div>
            )}

            {/* ── Empty ── */}
            {!loading && !error && mentorSubjectPairs.length === 0 && !initialLoad && (
                <div className="bg-surface-container-low rounded-2xl p-16 text-center border-2 border-dashed border-outline-variant/20">
                    <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">person_search</span>
                    <h3 className="font-headline text-2xl font-bold text-primary mb-2">No mentors found</h3>
                    <p className="text-on-surface-variant mb-8">Try adjusting your search criteria or filters</p>
                    <button
                        onClick={() => { setSearchTerm(''); setMinCgpa(''); setDepartment(''); }}
                        className="px-8 py-3 text-white font-bold rounded-xl transition-all active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            {/* ── Mentor-Subject Cards Grid ── */}
            {!loading && !error && paginated.length > 0 && (
                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                    {paginated.map(({ mentor, subject }, idx) => {
                        const statusKey = `${mentor._id}-${subject}`;
                        const status    = requestStatuses[statusKey];
                        const isTop     = mentor.cgpa >= 3.8;

                        return (
                            <div
                                key={`${mentor._id}-${subject}-${idx}`}
                                className="group relative bg-surface-container-lowest rounded-2xl p-8 hover:shadow-xl transition-all duration-300"
                                style={{ outline: '1px solid rgba(195,198,209,0.15)' }}
                            >
                                {/* Top rated badge */}
                                {isTop && (
                                    <div className="absolute -top-3 -right-3 bg-secondary-fixed px-3 py-1 rounded-lg text-on-secondary-container font-label text-[10px] font-bold shadow-sm uppercase tracking-wider">
                                        Top Rated
                                    </div>
                                )}

                                {/* Header */}
                                <div className="flex items-start gap-5 mb-5">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-20 h-20 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-2xl overflow-hidden">
                                            {mentor.profileImage ? (
                                                <img src={`http://localhost:5000/${mentor.profileImage}`} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                getInitials(mentor.firstName, mentor.lastName)
                                            )}
                                        </div>
                                        {status === 'accepted' && (
                                            <div className="absolute -bottom-2 -right-2 bg-primary w-6 h-6 rounded-full flex items-center justify-center border-2 border-surface">
                                                <span className="material-symbols-outlined text-[12px] text-white"
                                                    style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-headline font-bold text-xl text-primary">
                                            {mentor.firstName} {mentor.lastName}
                                        </h3>
                                        <p className="font-body text-on-surface-variant text-sm font-medium">
                                            {mentor.department}{mentor.batch ? `, Batch ${mentor.batch}` : ''}
                                        </p>
                                        {mentor.cgpa && (
                                            <div className="flex items-center mt-1 text-secondary">
                                                <span className="material-symbols-outlined text-sm"
                                                    style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                <span className="text-xs font-bold ml-1">CGPA {mentor.cgpa.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <UserRatingBadge userId={mentor._id} className="mt-1" />
                                    </div>
                                </div>

                                {/* Subject highlight */}
                                <div className="flex items-center gap-2 bg-primary/8 border border-primary/15 rounded-xl px-4 py-3 mb-5">
                                    <span className="material-symbols-outlined text-primary text-lg"
                                        style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
                                    <span className="font-headline font-bold text-primary text-sm">{subject}</span>
                                </div>

                                {/* Bio */}
                                <p className="text-on-surface-variant text-sm leading-relaxed mb-6 italic line-clamp-2 min-h-[2.5rem]">
                                    "{mentor.about || 'Passionate mentor ready to guide students in their academic journey.'}"
                                </p>

                                {/* CTA */}
                                <button
                                    onClick={() => {
                                        if (!status || status === 'completed' || status === 'rejected') handleSendRequest(mentor._id, subject);
                                    }}
                                    disabled={status === 'pending' || status === 'accepted'}
                                    className={`w-full py-4 px-6 border-2 font-headline font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                                        status === 'accepted'
                                            ? 'border-primary bg-primary text-on-primary cursor-default'
                                            : status === 'pending'
                                            ? 'border-outline-variant/30 text-on-surface-variant bg-surface-container-low cursor-not-allowed'
                                            : 'border-primary/10 text-primary hover:bg-primary hover:text-on-primary'
                                    }`}
                                >
                                    {btnLabel(status)}
                                    {(!status || status === 'completed' || status === 'rejected') && (
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    )}
                                    {status === 'pending' && (
                                        <span className="material-symbols-outlined text-lg">schedule</span>
                                    )}
                                    {status === 'accepted' && (
                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </section>
            )}

            {/* ── Pagination ── */}
            {!loading && !error && totalPages > 1 && (
                <footer className="mt-20 flex justify-between items-center py-10 border-t border-outline-variant/10">
                    <p className="font-body text-on-surface-variant text-sm">
                        Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, mentorSubjectPairs.length)} of {mentorSubjectPairs.length} results
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center hover:bg-surface-container-high transition-colors disabled:opacity-40"
                        >
                            <span className="material-symbols-outlined text-xl">chevron_left</span>
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const p = i + 1;
                            return (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-10 h-10 rounded-lg font-bold text-sm transition-colors ${
                                        page === p
                                            ? 'bg-primary text-on-primary'
                                            : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface'
                                    }`}
                                >
                                    {p}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center hover:bg-surface-container-high transition-colors disabled:opacity-40"
                        >
                            <span className="material-symbols-outlined text-xl">chevron_right</span>
                        </button>
                    </div>
                </footer>
            )}

            {/* ── Toast ── */}
            {toast.show && (
                <div className="fixed bottom-6 right-6 z-50">
                    <div className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 font-body ${
                        toast.type === 'success'
                            ? 'bg-primary text-on-primary'
                            : 'bg-error-container text-on-error-container'
                    }`}>
                        <span className="material-symbols-outlined">
                            {toast.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        <p className="font-medium text-sm">{toast.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FindMentor;
