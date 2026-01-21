import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Loader2, Filter, GraduationCap, Award } from 'lucide-react';

const FindMentor = () => {
    const navigate = useNavigate();

    // State management
    const [searchTerm, setSearchTerm] = useState('');
    const [minCgpa, setMinCgpa] = useState('');
    const [department, setDepartment] = useState('');
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [initialLoad, setInitialLoad] = useState(true);
    const [sentRequests, setSentRequests] = useState(new Set());
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    // Debounced search function
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    // Fetch mentors from API
    const fetchMentors = async (search = '', cgpa = '', dept = '') => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (cgpa) params.append('minCgpa', cgpa);
            if (dept) params.append('department', dept);

            const response = await fetch(
                `http://localhost:5000/api/user/mentors/search?${params.toString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch mentors');
            }

            const data = await response.json();
            setMentors(data.mentors || []);
            setInitialLoad(false);
        } catch (err) {
            setError(err.message);
            setMentors([]);
        } finally {
            setLoading(false);
        }
    };

    // Debounced version of fetchMentors
    const debouncedFetch = useCallback(
        debounce((search, cgpa, dept) => {
            fetchMentors(search, cgpa, dept);
        }, 500),
        []
    );

    // Effect for search term changes (debounced)
    useEffect(() => {
        debouncedFetch(searchTerm, minCgpa, department);
    }, [searchTerm, minCgpa, department]);

    // Initial load
    useEffect(() => {
        fetchMentors();
    }, []);

    // Auto-hide toast
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, message: '', type: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    // Get initials from name
    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Handle send request
    const handleSendRequest = async (mentorId) => {
        try {
            const response = await fetch('http://localhost:5000/api/connections/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ mentorId })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send request');
            }

            // Add to sent requests
            setSentRequests(prev => new Set([...prev, mentorId]));

            // Show success toast
            setToast({
                show: true,
                message: 'Connection request sent successfully!',
                type: 'success'
            });

        } catch (err) {
            setToast({
                show: true,
                message: err.message,
                type: 'error'
            });
        }
    };

    // Handle view profile
    const handleViewProfile = (mentorId) => {
        navigate(`/mentor/${mentorId}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                            <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Find Your Perfect Mentor
                            </h1>
                            <p className="text-gray-400 mt-2 text-lg">
                                Connect with experienced mentors to accelerate your academic journey
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Filter Section */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-5 h-5 text-blue-400" />
                        <h2 className="text-xl font-semibold text-white">Search & Filter</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search Input */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name or subject..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#0d0d0d] text-white pl-12 pr-4 py-4 rounded-xl border border-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder-gray-500"
                            />
                        </div>

                        {/* Minimum CGPA Dropdown */}
                        <div className="relative group">
                            <Award className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-400 transition-colors pointer-events-none z-10" />
                            <select
                                value={minCgpa}
                                onChange={(e) => setMinCgpa(e.target.value)}
                                className="w-full bg-[#0d0d0d] text-white pl-12 pr-10 py-4 rounded-xl border border-gray-800 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Minimum CGPA: Any</option>
                                <option value="3.0">CGPA 3.0+</option>
                                <option value="3.5">CGPA 3.5+</option>
                                <option value="3.8">CGPA 3.8+</option>
                            </select>
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Department Dropdown */}
                        <div className="relative group">
                            <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-pink-400 transition-colors pointer-events-none z-10" />
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="w-full bg-[#0d0d0d] text-white pl-12 pr-10 py-4 rounded-xl border border-gray-800 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/30 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Department: All</option>
                                <option value="CS">Computer Science</option>
                                <option value="IT">Information Technology</option>
                                <option value="SE">Software Engineering</option>
                                <option value="DS">Data Science</option>
                            </select>
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                {!loading && !error && mentors.length > 0 && (
                    <div className="mb-6">
                        <p className="text-gray-400">
                            Found <span className="text-white font-semibold">{mentors.length}</span> mentor{mentors.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                        <span className="text-gray-400 text-lg">Searching for mentors...</span>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-700/50 rounded-xl p-8 text-center backdrop-blur-sm">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-red-400 text-lg font-semibold">Error: {error}</p>
                    </div>
                )}

                {/* No Results State */}
                {!loading && !error && mentors.length === 0 && !initialLoad && (
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-16 text-center backdrop-blur-sm">
                        <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-12 h-12 text-gray-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">No mentors found</h3>
                        <p className="text-gray-400 text-lg mb-6">Try adjusting your search criteria or filters</p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setMinCgpa('');
                                setDepartment('');
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* Mentors Grid */}
                {!loading && !error && mentors.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mentors.map((mentor) => (
                            <div
                                key={mentor._id}
                                className="group bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-105 cursor-pointer"
                            >
                                {/* Avatar and Header */}
                                <div className="flex items-start gap-4 mb-5">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                            {getInitials(`${mentor.firstName} ${mentor.lastName}`)}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-gray-900"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-bold text-white truncate mb-1 group-hover:text-blue-400 transition-colors">
                                            {mentor.firstName} {mentor.lastName}
                                        </h3>
                                        <p className="text-sm font-medium text-blue-400 mb-1">
                                            {mentor.department}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Batch {mentor.batch}
                                        </p>
                                    </div>
                                </div>

                                {/* Bio */}
                                <p className="text-gray-400 text-sm mb-5 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                                    {mentor.about || 'Passionate mentor ready to guide students in their academic journey.'}
                                </p>

                                {/* Skills */}
                                <div className="mb-5">
                                    <div className="flex flex-wrap gap-2">
                                        {mentor.subjects && mentor.subjects.length > 0 ? (
                                            <>
                                                {mentor.subjects.slice(0, 3).map((subject, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1.5 bg-gradient-to-r from-gray-800 to-gray-700 text-gray-200 text-xs font-medium rounded-lg border border-gray-600 hover:border-blue-500 transition-colors"
                                                    >
                                                        {subject}
                                                    </span>
                                                ))}
                                                {mentor.subjects.length > 3 && (
                                                    <span className="px-3 py-1.5 bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-300 text-xs font-medium rounded-lg border border-blue-500/50">
                                                        +{mentor.subjects.length - 3} more
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-gray-500 text-xs italic">No subjects listed</span>
                                        )}



                                        {/* CGPA Tag */}
                                        {mentor.cgpa && (
                                            <span className="px-3 py-1.5 bg-gradient-to-r from-gray-800 to-gray-700 text-gray-200 text-xs font-medium rounded-lg border border-gray-600">
                                                {mentor.cgpa.toFixed(2)}
                                            </span>
                                        )}


                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center gap-3 pt-5 border-t border-gray-700">
                                    <button
                                        onClick={() => handleSendRequest(mentor._id)}
                                        disabled={sentRequests.has(mentor._id)}
                                        className={`flex-1 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-all duration-300 ${sentRequests.has(mentor._id)
                                                ? 'bg-gray-700 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/50'
                                            }`}
                                    >
                                        {sentRequests.has(mentor._id) ? 'Request Sent' : 'Send Request'}
                                    </button>
                                    <button
                                        onClick={() => handleViewProfile(mentor._id)}
                                        className="flex-1 px-4 py-2.5 bg-transparent border-2 border-gray-600 text-gray-300 text-sm font-semibold rounded-xl hover:border-purple-500 hover:text-purple-400 transition-all duration-300"
                                    >
                                        Send Message
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Toast Notification */}
                {toast.show && (
                    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
                        <div className={`px-6 py-4 rounded-xl shadow-2xl border ${toast.type === 'success'
                                ? 'bg-green-900/90 border-green-600 text-green-100'
                                : 'bg-red-900/90 border-red-600 text-red-100'
                            } backdrop-blur-sm`}>
                            <div className="flex items-center gap-3">
                                {toast.type === 'success' ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                                <p className="font-medium">{toast.message}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindMentor;

