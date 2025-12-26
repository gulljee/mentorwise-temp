// Signup form with role selection (Mentor/Mentee), Google OAuth, and manual registration

import React, { useState } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

export default function SignupForm() {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState("Mentee");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        batch: "",
        department: "",
        campus: "",
        cgpa: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("http://localhost:5000/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, role: userRole }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Signup failed.");
            } else {
                setSuccess("Account created successfully!");

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            }

        } catch (err) {
            setError("Server error. Try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setIsLoading(true);
            setError("");

            const res = await fetch("http://localhost:5000/api/auth/google/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Google signup failed.");
                setIsLoading(false);
                return;
            }

            if (data.userExists) {
                setSuccess("Login successful!");
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            } else {
                navigate('/google-onboarding', { state: { googleData: data.googleData, userRole: userRole } });
            }

        } catch (err) {
            setError("Server error. Try again later.");
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError("Google signup failed. Please try again.");
    };

    return (
        <div className="min-h-screen bg-black flex">
            <div className="hidden lg:block w-1/2 relative ml-10 overflow-hidden">
                <div className="absolute left-8 top-0 animate-scrollUp1">
                    <div className="flex flex-col gap-6">
                        <div className="w-48 bg-[#1a1a1a] rounded-lg overflow-hidden shadow-xl">
                            <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop" alt="Coding" className="w-full h-32 object-cover" />
                            <div className="p-3 text-center">
                                <p className="text-white font-semibold text-sm">LEARN JAVA</p>
                            </div>
                        </div>

                        <div className="w-48 bg-[#1a1a1a] rounded-lg overflow-hidden shadow-xl">
                            <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop" alt="Career Growth" className="w-full h-32 object-cover" />
                            <div className="p-3 text-center">
                                <p className="text-white font-semibold text-sm">CAREER GROWTH</p>
                            </div>
                        </div>

                        <div className="w-48 bg-[#1a1a1a] rounded-lg overflow-hidden shadow-xl">
                            <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop" alt="Data Structures" className="w-full h-32 object-cover" />
                            <div className="p-3 text-center">
                                <p className="text-white font-semibold text-sm">LEARN DSA</p>
                            </div>
                        </div>

                        <div className="w-48 bg-[#1a1a1a] rounded-lg overflow-hidden shadow-xl">
                            <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop" alt="Projects" className="w-full h-32 object-cover" />
                            <div className="p-3 text-center">
                                <p className="text-white font-semibold text-sm">BUILD PROJECTS</p>
                            </div>
                        </div>

                        <div className="w-48 bg-[#1a1a1a] rounded-lg overflow-hidden shadow-xl">
                            <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop" alt="Coding" className="w-full h-32 object-cover" />
                            <div className="p-3 text-center">
                                <p className="text-white font-semibold text-sm">LEARN JAVA</p>
                            </div>
                        </div>

                        <div className="w-48 bg-[#1a1a1a] rounded-lg overflow-hidden shadow-xl">
                            <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop" alt="Career Growth" className="w-full h-32 object-cover" />
                            <div className="p-3 text-center">
                                <p className="text-white font-semibold text-sm">CAREER GROWTH</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute left-60 top-20 animate-scrollUp2">
                    <div className="flex flex-col gap-6">
                        <div className="w-48 bg-[#1a1a1a] rounded-lg overflow-hidden shadow-xl">
                            <img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop" alt="Coding Skills" className="w-full h-32 object-cover" />
                            <div className="p-3 text-center">
                                <p className="text-white font-semibold text-sm">MASTER CODING</p>
                            </div>
                        </div>

                        <div className="w-48 bg-[#1a1a1a] rounded-lg overflow-hidden shadow-xl">
                            <img src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop" alt="Goals" className="w-full h-32 object-cover" />
                            <div className="p-3 text-center">
                                <p className="text-white font-semibold text-sm">ACHIEVE GOALS</p>
                            </div>
                        </div>

                        <div className="w-48 bg-[#1a1a1a] rounded-lg overflow-hidden shadow-xl">
                            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop" alt="Mentorship" className="w-full h-32 object-cover" />
                            <div className="p-3 text-center">
                                <p className="text-white font-semibold text-sm">GET MENTORED</p>
                            </div>
                        </div>

                        <div className="w-48 bg-[#1a1a1a] rounded-lg overflow-hidden shadow-xl">
                            <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop" alt="Growth" className="w-full h-32 object-cover" />
                            <div className="p-3 text-center">
                                <p className="text-white font-semibold text-sm">GROW SKILLS</p>
                            </div>
                        </div>

                        <div className="w-48 bg-[#1a1a1a] rounded-lg overflow-hidden shadow-xl">
                            <img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop" alt="Coding Skills" className="w-full h-32 object-cover" />
                            <div className="p-3 text-center">
                                <p className="text-white font-semibold text-sm">MASTER CODING</p>
                            </div>
                        </div>

                        <div className="w-48 bg-[#1a1a1a] rounded-lg overflow-hidden shadow-xl">
                            <img src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop" alt="Goals" className="w-full h-32 object-cover" />
                            <div className="p-3 text-center">
                                <p className="text-white font-semibold text-sm">ACHIEVE GOALS</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-2 sm:p-4">
                <div className="max-w-md w-full bg-[#1a1a1a] rounded-lg p-4 sm:p-8 shadow-2xl">
                    <div className="flex gap-2 mb-6 bg-[#0d0d0d] p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setUserRole("Mentor")}
                            className={`flex-1 py-2.5 px-4 rounded-md font-semibold text-sm transition-all duration-300 ${userRole === "Mentor"
                                ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg"
                                : "text-gray-400 hover:text-gray-200"
                                }`}
                        >
                            MENTOR
                        </button>
                        <button
                            type="button"
                            onClick={() => setUserRole("Mentee")}
                            className={`flex-1 py-2.5 px-4 rounded-md font-semibold text-sm transition-all duration-300 ${userRole === "Mentee"
                                ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg"
                                : "text-gray-400 hover:text-gray-200"
                                }`}
                        >
                            MENTEE
                        </button>
                    </div>

                    <div className="text-center mb-4 sm:mb-8">
                        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">REGISTRATION</h1>
                        <p className="text-gray-400 text-xs sm:text-sm tracking-wider">
                            REGISTER AS {userRole.toUpperCase()}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="filled_black"
                            size="large"
                            text="signup_with"
                            shape="rectangular"
                            width="100%"
                        />

                        <div className="flex items-center gap-4 my-2">
                            <div className="flex-1 h-px bg-gray-700"></div>
                            <span className="text-gray-500 text-sm">OR</span>
                            <div className="flex-1 h-px bg-gray-700"></div>
                        </div>

                        <input
                            type="text"
                            name="firstName"
                            placeholder="FIRST NAME"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="px-4 py-3 bg-[#0d0d0d] border border-gray-800 rounded text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-600 transition"
                            required
                        />

                        <input
                            type="text"
                            name="lastName"
                            placeholder="LAST NAME"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="px-4 py-3 bg-[#0d0d0d] border border-gray-800 rounded text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-600 transition"
                            required
                        />

                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-white text-sm font-medium pointer-events-none">+92</span>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="w-full pl-14 pr-4 py-3 bg-[#0d0d0d] border border-gray-800 rounded text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-600 transition"
                                required
                            />
                        </div>

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

                        <input
                            type="number"
                            name="cgpa"
                            placeholder="CGPA (0.0 - 4.0)"
                            value={formData.cgpa}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            max="4"
                            className="px-4 py-3 bg-[#0d0d0d] border border-gray-800 rounded text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-600 transition"
                            required
                        />

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
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3 bg-[#0d0d0d] border border-gray-800 rounded text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-600 transition"
                                required
                            />
                        </div>

                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="white">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-12 pr-12 py-3 bg-[#0d0d0d] border border-gray-800 rounded text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-600 transition"
                                required
                            />
                            <span onClick={togglePasswordVisibility} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition">
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </span>
                        </div>

                        {error && (
                            <p className="text-red-500 text-xs text-center">{error}</p>
                        )}

                        {success && (
                            <p className="text-green-500 text-xs text-center">{success}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`py-3 text-white font-semibold rounded transition ${isLoading
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700'
                                }`}
                        >
                            {isLoading ? "CREATING ACCOUNT..." : "SIGN UP"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-400 mt-4">
                        Already have an account?{" "}
                        <a href="/login" className="text-blue-500 hover:text-blue-400 font-semibold transition">
                            Login
                        </a>
                    </p>

                    <p className="text-center text-xs text-gray-500 mt-6">
                        <a href="/privacy" className="hover:text-gray-400 underline transition">Privacy Policy</a>
                        {" "}and{" "}
                        <a href="/terms" className="hover:text-gray-400 underline transition">Terms of Service</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
