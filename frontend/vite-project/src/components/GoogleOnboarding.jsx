// Google OAuth onboarding form for new users to complete their profile after Google sign-in

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function GoogleOnboarding() {
    const navigate = useNavigate();
    const location = useLocation();
    const googleData = location.state?.googleData;

    if (!googleData) {
        window.location.href = '/signup';
        return null;
    }

    const [role, setRole] = useState("Mentee"); // Local role state with tab switching

    const [formData, setFormData] = useState({
        googleId: googleData.googleId,
        firstName: googleData.firstName,
        lastName: googleData.lastName,
        email: googleData.email,
        phoneNumber: "",
        batch: "",
        department: "",
        campus: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);



    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            const res = await fetch("http://localhost:5000/api/auth/google/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, role: role }), // Use local role state
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Signup failed.");
            } else {
                setSuccess("Account created successfully!");

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            }

        } catch (err) {
            setError("Server error. Try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-2 sm:p-4">
            <div className="max-w-md w-full bg-[#1a1a1a] rounded-lg p-4 sm:p-8 shadow-2xl">
                {/* Role Selection Tabs */}
                <div className="flex gap-1 mb-6 bg-[#0d0d0d] p-1 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setRole("Mentor")}
                        className={`flex-1 py-2.5 px-4 rounded-md font-semibold text-sm transition-all duration-300 ${role === "Mentor"
                                ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg"
                                : "text-gray-400 hover:text-gray-200"
                            }`}
                    >
                        MENTOR
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole("Mentee")}
                        className={`flex-1 py-2.5 px-4 rounded-md font-semibold text-sm transition-all duration-300 ${role === "Mentee"
                                ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg"
                                : "text-gray-400 hover:text-gray-200"
                            }`}
                    >
                        MENTEE
                    </button>
                </div>

                {/* Header */}
                <div className="text-center mb-4 sm:mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Complete Your Profile</h1>
                    <p className="text-gray-400 text-xs sm:text-sm">Register as {role.toUpperCase()}</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* First Name (Pre-filled, Read-only) */}
                    <input
                        type="text"
                        name="firstName"
                        placeholder="FIRST NAME"
                        value={formData.firstName}
                        readOnly
                        className="px-4 py-3 bg-[#0d0d0d] border border-gray-800 rounded text-gray-400 text-sm cursor-not-allowed"
                    />

                    {/* Last Name (Pre-filled, Read-only) */}
                    <input
                        type="text"
                        name="lastName"
                        placeholder="LAST NAME"
                        value={formData.lastName}
                        readOnly
                        className="px-4 py-3 bg-[#0d0d0d] border border-gray-800 rounded text-gray-400 text-sm cursor-not-allowed"
                    />

                    {/* Email (Pre-filled, Read-only) */}
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="white">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </span>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            readOnly
                            className="w-full pl-12 pr-4 py-3 bg-[#0d0d0d] border border-gray-800 rounded text-gray-400 text-sm cursor-not-allowed"
                        />
                    </div>

                    {/* Phone Number */}
                    <div className="relative flex items-center">
                        <span className="absolute left-4 text-white text-sm font-medium pointer-events-none">+92</span>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="3001234567"
                            className="w-full pl-14 pr-4 py-3 bg-[#0d0d0d] border border-gray-800 rounded text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-600 transition"
                            required
                        />
                    </div>

                    {/* Department and Batch - Stack on mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className="px-4 py-3 bg-[#0d0d0d] border border-gray-800 rounded text-white text-sm focus:outline-none focus:border-gray-600 transition"
                            required
                        >
                            <option value="" className="bg-[#0d0d0d]">DEPARTMENT</option>
                            <option value="CS" className="bg-[#0d0d0d]">CS</option>
                            <option value="IT" className="bg-[#0d0d0d]">IT</option>
                            <option value="SE" className="bg-[#0d0d0d]">SE</option>
                            <option value="DS" className="bg-[#0d0d0d]">DS</option>
                        </select>

                        <select
                            name="batch"
                            value={formData.batch}
                            onChange={handleChange}
                            className="px-4 py-3 bg-[#0d0d0d] border border-gray-800 rounded text-white text-sm focus:outline-none focus:border-gray-600 transition"
                            required
                        >
                            <option value="" className="bg-[#0d0d0d]">BATCH</option>
                            <option value="F22" className="bg-[#0d0d0d]">F22</option>
                            <option value="F23" className="bg-[#0d0d0d]">F23</option>
                            <option value="F24" className="bg-[#0d0d0d]">F24</option>
                            <option value="F25" className="bg-[#0d0d0d]">F25</option>
                        </select>
                    </div>

                    {/* Campus */}
                    <select
                        name="campus"
                        value={formData.campus}
                        onChange={handleChange}
                        className="px-4 py-3 bg-[#0d0d0d] border border-gray-800 rounded text-white text-sm focus:outline-none focus:border-gray-600 transition"
                        required
                    >
                        <option value="" className="bg-[#0d0d0d]">PUCIT CAMPUS</option>
                        <option value="New" className="bg-[#0d0d0d]">New Campus</option>
                        <option value="Old" className="bg-[#0d0d0d]">Old Campus</option>
                    </select>




                    {/* Error and Success Messages */}
                    {error && (
                        <p className="text-red-500 text-xs text-center">{error}</p>
                    )}

                    {success && (
                        <p className="text-green-500 text-xs text-center">{success}</p>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`py-3 text-white font-semibold rounded transition ${isLoading
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700'
                            }`}
                    >
                        {isLoading ? "CREATING ACCOUNT..." : "COMPLETE SIGNUP"}
                    </button>
                </form>
            </div>
        </div>
    );
}
