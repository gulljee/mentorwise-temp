import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FindMentor from './FindMentor';

const MenteeDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [mentors, setMentors] = useState([]);
    const [loadingMentors, setLoadingMentors] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Fetch sent requests
    const fetchSentRequests = async () => {
        setLoadingRequests(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/connections/requests/sent', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setRequests(data.requests || []);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoadingRequests(false);
        }
    };

    // Fetch connected mentors
    const fetchConnectedMentors = async () => {
        setLoadingMentors(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/connections/mentors', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setMentors(data.mentors || []);
            }
        } catch (error) {
            console.error('Error fetching mentors:', error);
        } finally {
            setLoadingMentors(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'requests') {
            fetchSentRequests();
        } else if (activeTab === 'mentors') {
            fetchConnectedMentors();
        }
    }, [activeTab]);

    // Initial fetch for dashboard stats
    useEffect(() => {
        fetchSentRequests();
        fetchConnectedMentors();
    }, []);

    const pendingRequests = requests.filter(req => req.status === 'pending').length;
    const acceptedMentors = mentors.length;

    return (
        <div className="min-h-screen bg-black flex">
            {/* Sidebar */}
            <div className="w-64 bg-[#0a0a0a] border-r border-gray-800 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <span className="text-white font-bold text-lg">MentorWise</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${activeTab === 'dashboard'
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span className="font-medium">Dashboard</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('find-mentors')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${activeTab === 'find-mentors'
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="font-medium">Find Mentors</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition relative ${activeTab === 'requests'
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-medium">My Requests</span>
                        {pendingRequests > 0 && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                                {pendingRequests}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('mentors')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${activeTab === 'mentors'
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="font-medium">My Mentors</span>
                    </button>
                </nav>

                {/* User Profile Section */}
                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{user.firstName} {user.lastName}</p>
                            <p className="text-gray-400 text-xs truncate">{user.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-gray-800/50 hover:text-white rounded-lg transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="p-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-white mb-1">
                                Welcome back, {user.firstName}!
                            </h1>
                            <p className="text-gray-400">
                                Track your mentorship journey and connect with mentors
                            </p>
                        </div>

                        {/* Hero Card */}
                        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-8 relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-5xl font-bold text-white mb-4">
                                    You have {acceptedMentors}<br />Active Mentor{acceptedMentors !== 1 ? 's' : ''}.
                                </h2>
                                <button
                                    onClick={() => setActiveTab('find-mentors')}
                                    className="font-semibold px-8 py-3 rounded-lg transition bg-white hover:bg-gray-100 text-purple-600"
                                >
                                    Find More Mentors
                                </button>
                            </div>
                            <div className="absolute bottom-8 right-8 text-white opacity-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
                                </svg>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-400 font-medium">Active Mentors</h3>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <p className="text-4xl font-bold text-white">{acceptedMentors}</p>
                            </div>

                            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-400 font-medium">Pending Requests</h3>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-4xl font-bold text-white">{pendingRequests}</p>
                            </div>

                            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-400 font-medium">Total Requests</h3>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-4xl font-bold text-white">{requests.length}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Find Mentors Tab */}
                {activeTab === 'find-mentors' && (
                    <FindMentor />
                )}

                {/* My Requests Tab */}
                {activeTab === 'requests' && (
                    <div className="p-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-white mb-1">My Requests</h1>
                            <p className="text-gray-400">Track all your connection requests</p>
                        </div>

                        {loadingRequests ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-gray-400">Loading requests...</div>
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="bg-[#1a1a1a] rounded-xl p-12 text-center border border-gray-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <h3 className="text-xl font-semibold text-white mb-2">No requests yet</h3>
                                <p className="text-gray-400 mb-4">Start by finding and connecting with mentors</p>
                                <button
                                    onClick={() => setActiveTab('find-mentors')}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
                                >
                                    Find Mentors
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {requests.map((request) => (
                                    <div key={request._id} className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 hover:border-blue-600/50 transition-all">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                                                {request.mentor?.firstName?.[0]}{request.mentor?.lastName?.[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-white truncate">
                                                    {request.mentor?.firstName} {request.mentor?.lastName}
                                                </h3>
                                                <p className="text-sm text-blue-400">
                                                    {request.mentor?.department} • Batch {request.mentor?.batch}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(request.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-800">
                                            <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${
                                                request.status === 'pending' 
                                                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                                                    : request.status === 'accepted'
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                                    : 'bg-red-500/20 text-red-400 border border-red-500/50'
                                            }`}>
                                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* My Mentors Tab */}
                {activeTab === 'mentors' && (
                    <div className="p-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-white mb-1">My Mentors</h1>
                            <p className="text-gray-400">Your connected mentors</p>
                        </div>

                        {loadingMentors ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-gray-400">Loading mentors...</div>
                            </div>
                        ) : mentors.length === 0 ? (
                            <div className="bg-[#1a1a1a] rounded-xl p-12 text-center border border-gray-800">
                                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">No mentors yet</h3>
                                <p className="text-gray-400 mb-4">Connect with mentors to start your learning journey</p>
                                <button
                                    onClick={() => setActiveTab('find-mentors')}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
                                >
                                    Find Mentors
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {mentors.map((connection) => (
                                    <div key={connection._id} className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 hover:border-green-600/50 transition-all group">
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl">
                                                {connection.mentor?.firstName?.[0]}{connection.mentor?.lastName?.[0]}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">
                                                    {connection.mentor?.firstName} {connection.mentor?.lastName}
                                                </h3>
                                                <p className="text-sm text-gray-400 mb-2">
                                                    {connection.mentor?.department} • Batch {connection.mentor?.batch}
                                                </p>
                                                
                                                {/* Contact Info */}
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                        {connection.mentor?.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                        </svg>
                                                        {connection.mentor?.phoneNumber}
                                                    </div>
                                                </div>

                                                {/* Subjects */}
                                                {connection.mentor?.subjects && connection.mentor.subjects.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {connection.mentor.subjects.slice(0, 3).map((subject, index) => (
                                                            <span key={index} className="px-2 py-1 bg-[#0d0d0d] text-gray-300 text-xs rounded border border-gray-800">
                                                                {subject}
                                                            </span>
                                                        ))}
                                                        {connection.mentor.subjects.length > 3 && (
                                                            <span className="px-2 py-1 text-blue-400 text-xs">
                                                                +{connection.mentor.subjects.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 pt-4 border-t border-gray-800 flex justify-end">
                                            <button className="text-sm text-green-400 hover:text-green-300 font-medium transition">
                                                Send Message →
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenteeDashboard;