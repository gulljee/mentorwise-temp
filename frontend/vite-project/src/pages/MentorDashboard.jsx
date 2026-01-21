// Mentor dashboard with sidebar navigation, profile management, and student statistics

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MentorDashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isProfileSaving, setIsProfileSaving] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);
    const [profileData, setProfileData] = useState({
        about: '',
        cgpa: '',
        subjects: []
    });
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const handleAddSkill = (e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            setSkills([...skills, skillInput.trim()]);
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (index) => {
        setSkills(skills.filter((_, i) => i !== index));
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData({
            ...profileData,
            [name]: value
        });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsProfileSaving(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/profile/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Profile saved successfully:', data);

                // Update user in localStorage with new profile data
                const updatedUser = {
                    ...user,
                    about: profileData.about,
                    cgpa: profileData.cgpa,
                    subjects: profileData.subjects
                };
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

    // Fetch connection requests
    const fetchRequests = async () => {
        console.log('Fetching requests...');
        setLoadingRequests(true);
        try {
            const token = localStorage.getItem('token');
            console.log('Token:', token ? 'exists' : 'missing');

            const response = await fetch('http://localhost:5000/api/connections/requests/received', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                setRequests(data.requests || []);
                console.log('Requests set:', data.requests?.length || 0);
            } else {
                console.error('API error:', data.message);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoadingRequests(false);
            console.log('Loading set to false');
        }
    };

    // Handle accept request
    const handleAcceptRequest = async (requestId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/connections/requests/${requestId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'accepted' })
            });

            if (response.ok) {
                // Remove from requests list
                setRequests(requests.filter(req => req._id !== requestId));
            }
        } catch (error) {
            console.error('Error accepting request:', error);
        }
    };

    // Handle reject request
    const handleRejectRequest = async (requestId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/connections/requests/${requestId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'rejected' })
            });

            if (response.ok) {
                // Remove from requests list
                setRequests(requests.filter(req => req._id !== requestId));
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
        }
    };

    // Check if profile is complete on mount
    useEffect(() => {
        const checkProfileCompletion = () => {
            if (user.about && user.cgpa && user.subjects && user.subjects.length > 0) {
                setProfileSaved(true);
            }
        };

        checkProfileCompletion();
        fetchRequests(); // Fetch requests on mount
    }, []); // Empty dependency array - run only once on mount

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
                        onClick={() => setActiveTab('requests')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition relative ${activeTab === 'requests'
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-medium">Requests</span>
                        {requests.length > 0 && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {requests.length}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('students')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${activeTab === 'students'
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="font-medium">My Students</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${activeTab === 'profile'
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">Profile</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${activeTab === 'settings'
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">Settings</span>
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
                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">
                                {activeTab === 'requests' ? 'Connection Requests' : `Welcome back, ${user.firstName}!`}
                            </h1>
                            <p className="text-gray-400">
                                {activeTab === 'requests' ? 'Manage your mentee connection requests' : 'Manage your mentorship journey'}
                            </p>
                        </div>
                    </div>

                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && (
                        <>
                            {/* Hero Card */}
                            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-8 relative overflow-hidden">
                                <div className="relative z-10">
                                    <h2 className="text-5xl font-bold text-white mb-4">
                                        You have 0<br />Active Students.
                                    </h2>
                                    <button
                                        onClick={() => setShowProfileModal(true)}
                                        disabled={profileSaved}
                                        className={`font-semibold px-8 py-3 rounded-lg transition ${profileSaved
                                            ? 'bg-green-500/50 text-white cursor-not-allowed'
                                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                                            }`}
                                    >
                                        {profileSaved
                                            ? '✓ Profile complete! Waiting for student requests...'
                                            : 'Complete your profile to get discovered.'}
                                    </button>
                                </div>
                                {/* Decorative sparkle */}
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
                                        <h3 className="text-gray-400 font-medium">Total Students</h3>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-4xl font-bold text-white">0</p>
                                </div>

                                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-gray-400 font-medium">Pending Requests</h3>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-4xl font-bold text-white">{requests.length}</p>
                                </div>

                                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-gray-400 font-medium">Profile Views</h3>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </div>
                                    <p className="text-4xl font-bold text-white">0</p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Requests Tab */}
                    {activeTab === 'requests' && (
                        <div>
                            {loadingRequests ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="text-gray-400">Loading requests...</div>
                                </div>
                            ) : requests.length === 0 ? (
                                <div className="bg-[#1a1a1a] rounded-xl p-12 text-center border border-gray-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    <h3 className="text-xl font-semibold text-white mb-2">No pending requests</h3>
                                    <p className="text-gray-400">You don't have any connection requests at the moment</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {requests.map((request) => (
                                        <div key={request._id} className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 hover:border-blue-600/50 transition-all">
                                            {/* Mentee Info */}
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                                                    {request.mentee.firstName[0]}{request.mentee.lastName[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-bold text-white truncate">
                                                        {request.mentee.firstName} {request.mentee.lastName}
                                                    </h3>
                                                    <p className="text-sm text-blue-400">
                                                        {request.mentee.department} • Batch {request.mentee.batch}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(request.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Subjects */}
                                            {request.mentee.subjects && request.mentee.subjects.length > 0 && (
                                                <div className="mb-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {request.mentee.subjects.slice(0, 3).map((subject, index) => (
                                                            <span key={index} className="px-2 py-1 bg-[#0d0d0d] text-gray-300 text-xs rounded border border-gray-800">
                                                                {subject}
                                                            </span>
                                                        ))}
                                                        {request.mentee.subjects.length > 3 && (
                                                            <span className="px-2 py-1 text-blue-400 text-xs">
                                                                +{request.mentee.subjects.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-3 pt-4 border-t border-gray-800">
                                                <button
                                                    onClick={() => handleAcceptRequest(request._id)}
                                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleRejectRequest(request._id)}
                                                    className="flex-1 px-4 py-2 bg-transparent border-2 border-red-600 text-red-400 text-sm font-semibold rounded-lg hover:bg-red-600/10 transition-all"
                                                >
                                                    Reject
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

            {/* Profile Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a1a] rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">Complete Your Profile</h2>
                            <button
                                onClick={() => setShowProfileModal(false)}
                                className="text-gray-400 hover:text-white transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            {/* About You */}
                            <div>
                                <label className="text-white font-semibold mb-2 block">About You</label>
                                <textarea
                                    name="about"
                                    value={profileData.about}
                                    onChange={handleProfileChange}
                                    placeholder="Tell us about yourself, your expertise, and what you can mentor in..."
                                    rows="4"
                                    className="w-full bg-[#0d0d0d] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition resize-none"
                                    required
                                />
                            </div>

                            {/* CGPA */}
                            <div>
                                <label className="text-white font-semibold mb-2 block">CGPA</label>
                                <input
                                    type="number"
                                    name="cgpa"
                                    value={profileData.cgpa}
                                    onChange={handleProfileChange}
                                    placeholder="Enter your CGPA (0.0 - 4.0)"
                                    step="0.01"
                                    min="0"
                                    max="4"
                                    className="w-full bg-[#0d0d0d] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition"
                                    required
                                />
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="text-white font-semibold mb-2 block">Subject/Area of Expertise (Select multiple)</label>
                                <div className="flex flex-wrap gap-3">
                                    {['DSA', 'OOP', 'PF', 'AOA', 'Database', 'Web Development', 'Machine Learning', 'Software Engineering', 'Computer Networks', 'Operating Systems'].map((subject) => (
                                        <button
                                            key={subject}
                                            type="button"
                                            onClick={() => toggleSubject(subject)}
                                            className={`px-4 py-2 rounded-full font-medium transition ${profileData.subjects.includes(subject)
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-[#0d0d0d] text-gray-400 border border-gray-800 hover:border-blue-600 hover:text-white'
                                                }`}
                                        >
                                            {subject}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={isProfileSaving}
                                    className={`flex-1 font-semibold px-6 py-3 rounded-lg transition ${isProfileSaving
                                        ? 'bg-gray-600 cursor-not-allowed text-white'
                                        : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white'
                                        }`}
                                >
                                    {isProfileSaving ? 'Saving...' : 'Save Profile'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowProfileModal(false)}
                                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
