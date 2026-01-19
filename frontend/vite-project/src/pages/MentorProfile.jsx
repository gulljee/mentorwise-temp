// Mentor profile page for completing and editing profile information

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MentorProfile() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [formData, setFormData] = useState({
        bio: '',
        expertise: '',
        experience: '',
        availability: '',
        linkedIn: '',
        github: ''
    });

    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
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

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Save profile data to backend
        console.log('Profile data:', { ...formData, skills });
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-black flex">
            {/* Sidebar */}
            <div className="w-64 bg-[#0a0a0a] border-r border-gray-800 flex flex-col">
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

                <nav className="flex-1 p-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 text-gray-400 hover:bg-gray-800/50 hover:text-white transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="font-medium">Back to Dashboard</span>
                    </button>
                </nav>

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
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h1>
                        <p className="text-gray-400 mb-8">Help students find you by completing your mentor profile</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Bio Section */}
                            <div className="bg-[#1a1a1a] rounded-xl p-6">
                                <h2 className="text-white font-semibold text-lg mb-4">About You</h2>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Write a brief bio about yourself, your background, and what you're passionate about..."
                                    rows="4"
                                    className="w-full bg-[#0d0d0d] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition resize-none"
                                />
                            </div>

                            {/* Expertise & Experience */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-[#1a1a1a] rounded-xl p-6">
                                    <h2 className="text-white font-semibold text-lg mb-4">Area of Expertise</h2>
                                    <input
                                        type="text"
                                        name="expertise"
                                        value={formData.expertise}
                                        onChange={handleChange}
                                        placeholder="e.g., Web Development, Machine Learning"
                                        className="w-full bg-[#0d0d0d] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition"
                                    />
                                </div>

                                <div className="bg-[#1a1a1a] rounded-xl p-6">
                                    <h2 className="text-white font-semibold text-lg mb-4">Years of Experience</h2>
                                    <input
                                        type="text"
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        placeholder="e.g., 3 years"
                                        className="w-full bg-[#0d0d0d] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition"
                                    />
                                </div>
                            </div>

                            {/* Skills Section */}
                            <div className="bg-[#1a1a1a] rounded-xl p-6">
                                <h2 className="text-white font-semibold text-lg mb-4">Skills & Technologies</h2>
                                <input
                                    type="text"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={handleAddSkill}
                                    placeholder="Add skills (e.g., Python, React, Docker) - Press Enter to add"
                                    className="w-full bg-[#0d0d0d] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition mb-4"
                                />

                                {skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                                            >
                                                {skill}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSkill(index)}
                                                    className="hover:text-blue-300 transition"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Availability */}
                            <div className="bg-[#1a1a1a] rounded-xl p-6">
                                <h2 className="text-white font-semibold text-lg mb-4">Availability</h2>
                                <input
                                    type="text"
                                    name="availability"
                                    value={formData.availability}
                                    onChange={handleChange}
                                    placeholder="e.g., Weekends, Evenings, 5-10 hours/week"
                                    className="w-full bg-[#0d0d0d] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition"
                                />
                            </div>

                            {/* Social Links */}
                            <div className="bg-[#1a1a1a] rounded-xl p-6">
                                <h2 className="text-white font-semibold text-lg mb-4">Social Links</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-gray-400 text-sm mb-2 block">LinkedIn Profile</label>
                                        <input
                                            type="url"
                                            name="linkedIn"
                                            value={formData.linkedIn}
                                            onChange={handleChange}
                                            placeholder="https://linkedin.com/in/yourprofile"
                                            className="w-full bg-[#0d0d0d] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-gray-400 text-sm mb-2 block">GitHub Profile</label>
                                        <input
                                            type="url"
                                            name="github"
                                            value={formData.github}
                                            onChange={handleChange}
                                            placeholder="https://github.com/yourusername"
                                            className="w-full bg-[#0d0d0d] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-lg transition"
                                >
                                    Save Profile
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/dashboard')}
                                    className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
