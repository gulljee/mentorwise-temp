// Forgot password page for requesting password reset email

import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import mentorwiseLogo from '../assets/mentorwise-logo.jpg';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to send reset email.");
            } else {
                setSuccess(data.message);
                setEmail("");
            }

        } catch (err) {
            setError("Server error. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#1a1a1a] rounded-lg p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <img
                            src={mentorwiseLogo}
                            alt="MentorWise Logo"
                            className="w-12 h-12 rounded-lg object-cover"
                        />
                        <h2 className="text-white font-bold text-xl">MentorWise</h2>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Forgot Password?</h1>
                    <p className="text-gray-400 text-sm">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-[#0d0d0d] border border-gray-800 rounded text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-600 transition"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded p-3">
                            <p className="text-red-500 text-xs text-center">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-500/10 border border-green-500/50 rounded p-3">
                            <p className="text-green-500 text-xs text-center">{success}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`py-3 text-white font-semibold rounded transition ${isLoading
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700'
                            }`}
                    >
                        {isLoading ? "SENDING..." : "Send Reset Link"}
                    </button>

                    <div className="text-center mt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-gray-400 hover:text-gray-300 text-sm transition flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Login
                        </button>
                    </div>
                </form>

                <p className="text-center text-xs text-gray-500 mt-6">
                    <a href="/privacy" className="hover:text-gray-400 underline transition">Privacy Policy</a>
                    {" "}and{" "}
                    <a href="/terms" className="hover:text-gray-400 underline transition">Terms of Service</a>
                </p>
            </div>
        </div>
    );
}
