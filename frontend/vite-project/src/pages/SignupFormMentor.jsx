// Signup form with role selection (Mentor/Mentee), Google OAuth, and manual registration

import React, { useState } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import OtpVerification from '../components/OtpVerification';

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
        password: "",
        transcript: null
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [tempEmail, setTempEmail] = useState("");
    const [showPolicyModal, setShowPolicyModal] = useState(false);
    const [showExistingAccountModal, setShowExistingAccountModal] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData({
                ...formData,
                [name]: files[0],
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleFormSubmitAttempt = (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (formData.phoneNumber.length !== 10) {
            setError("Phone number must be exactly 10 digits (excluding +92)");
            return;
        }

        setShowPolicyModal(true);
    };

    const executeSignup = async () => {
        setShowPolicyModal(false);
        setIsLoading(true);

        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'transcript' && formData[key]) {
                    formDataToSend.append('transcript', formData[key]);
                } else if (key !== 'transcript') {
                    formDataToSend.append(key, formData[key]);
                }
            });
            formDataToSend.append('role', userRole);

            const res = await fetch("http://localhost:5000/api/auth/signup", {
                method: "POST",
                body: formDataToSend,
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Signup failed.");
            } else if (data.requiresOtp) {
                setTempEmail(data.email);
                setShowOtp(true);
            } else {
                setSuccess("Account created successfully!");

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                setTimeout(() => {
                    const dest = data.user.role === 'Mentor' ? '/dashboard/mentor' : '/dashboard/mentee';
                    navigate(dest);
                }, 1000);
            }

        } catch (err) {
            setError("Server error. Try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSuccess = (data) => {
        setSuccess("OTP verified successfully!");
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setTimeout(() => {
            const dest = data.user.role === 'Mentor' ? '/dashboard/mentor' : '/dashboard/mentee';
            navigate(dest);
        }, 1000);
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
                setIsLoading(false);
                setShowExistingAccountModal(true);
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

    const termsAndPrivacyContent = (
        <div className="space-y-6 text-sm text-slate-700 text-left">
            <div>
                <h3 className="font-bold text-lg text-primary mb-4">Terms of Service for Mentorwise</h3>
                <h4 className="font-semibold text-slate-900">1. Accounts and Registration</h4>
                <ul className="list-disc pl-5 space-y-1 mt-2 mb-4">
                    <li>To use our app, you must register and create a user profile.</li>
                    <li>Some accounts may start as a pending user until they are fully approved.</li>
                </ul>

                <h4 className="font-semibold text-slate-900">2. Connections and Sessions</h4>
                <ul className="list-disc pl-5 space-y-1 mt-2 mb-4">
                    <li>You can use our platform to send connection requests to other people.</li>
                    <li>Once connected, you can participate in online sessions.</li>
                </ul>

                <h4 className="font-semibold text-slate-900">3. Learning and Assessments</h4>
                <ul className="list-disc pl-5 space-y-1 mt-2 mb-4">
                    <li>The app provides learning materials and specific tasks for you to complete.</li>
                    <li>You may be required to take tests and hand in test submissions.</li>
                    <li>At the end, you can receive transcripts and give or receive ratings.</li>
                </ul>

                <h4 className="font-semibold text-slate-900">4. User Conduct and Communication</h4>
                <ul className="list-disc pl-5 space-y-1 mt-2 mb-4">
                    <li>You are allowed to send messages to other users on the platform.</li>
                    <li>You must be respectful in your messages and must not send spam or harmful content.</li>
                </ul>

                <h4 className="font-semibold text-slate-900">5. Uploads</h4>
                <ul className="list-disc pl-5 space-y-1 mt-2 mb-6">
                    <li>You are allowed to upload files like documents and PDFs to the platform.</li>
                    <li>You must only upload files that belong to you and are safe for the app.</li>
                </ul>
            </div>

            <div className="border-t border-slate-200 pt-6">
                <h3 className="font-bold text-lg text-primary mb-4">Privacy Policy for Mentorwise</h3>
                
                <h4 className="font-semibold text-slate-900">1. Information We Collect</h4>
                <ul className="list-disc pl-5 space-y-1 mt-2 mb-4">
                    <li><strong>Profile Data:</strong> We collect the information you give us when you set up your user profile.</li>
                    <li><strong>Communications:</strong> We store the messages you send to others and the notifications we send to you.</li>
                    <li><strong>Files:</strong> We collect and store the documents and files you upload to our system.</li>
                    <li><strong>Performance Data:</strong> We collect your test submissions, your test scores, and your transcripts.</li>
                </ul>

                <h4 className="font-semibold text-slate-900">2. How We Use Your Information</h4>
                <ul className="list-disc pl-5 space-y-1 mt-2 mb-4">
                    <li>We use your data to manage your connection requests and set up your sessions.</li>
                    <li>We use your performance data to create your ratings and transcripts.</li>
                    <li>We use your profile data to make sure the app works smoothly for you.</li>
                </ul>

                <h4 className="font-semibold text-slate-900">3. Sharing Your Information</h4>
                <ul className="list-disc pl-5 space-y-1 mt-2 mb-4">
                    <li>Your public profile, ratings, and transcripts may be seen by other users you connect with on the platform.</li>
                    <li>We do not sell your personal messages or test submissions to outside marketing companies.</li>
                </ul>
            </div>
        </div>
    );

    return (
        <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col">

            {/* ── Header ── */}
            <header className="fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-xl shadow-sm">
                <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
                    <div 
                        className="text-2xl font-extrabold tracking-tight text-blue-900 cursor-pointer"
                        onClick={() => navigate("/")}
                    >
                        Mentor Wise
                    </div>
                    <div className="hidden md:flex gap-8 items-center">
                        <a className="text-sm uppercase tracking-wider text-slate-600 hover:text-blue-900 transition-colors duration-200" href="/">About</a>
                        <a className="bg-primary-container text-on-primary-container px-6 py-2 rounded-lg font-semibold transition-all hover:opacity-90" href="/login">Login</a>
                    </div>
                    {/* Mobile Menu Toggle */}
                    <button 
                        className="md:hidden p-2 text-blue-900"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <span className="material-symbols-outlined">
                            {isMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>
                
                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-xl p-6 animate-in slide-in-from-top duration-300">
                        <div className="flex flex-col space-y-4 font-semibold text-sm">
                            <a className="text-slate-600 hover:text-blue-900 py-2 border-b border-slate-50" href="/">About</a>
                            <a className="text-blue-900 py-2" href="/login">Login</a>
                        </div>
                    </div>
                )}
                <div className="bg-slate-200/50 h-px w-full"></div>
            </header>

            {/* ── Main ── */}
            <main className="min-h-screen pt-24 pb-20 px-6 flex items-center justify-center flex-1">
                <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* Left: Editorial Content */}
                    <div className="lg:col-span-6 space-y-8 md:space-y-10 order-2 lg:order-1 text-center lg:text-left">
                        <div className="space-y-4">
                            <span className="inline-block text-sm uppercase tracking-[0.2em] text-on-surface-variant font-semibold">Join the Collective</span>
                            <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-primary leading-[1.1] tracking-tight">
                                Your university <br className="hidden lg:block" />
                                <span className="text-secondary">journey, guided.</span>
                            </h1>
                        </div>

                        <p className="text-base md:text-lg text-on-surface-variant max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
                            Mentor Wise bridges the gap between ambition and experience. We help juniors navigate the complex transition to university life through direct connection with high-achieving seniors who've walked the path before.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                            <div className="bg-surface-container-low p-6 rounded-xl space-y-3 text-left">
                                <span className="material-symbols-outlined text-primary text-3xl">school</span>
                                <h3 className="font-headline font-bold text-primary">Academic Rigor</h3>
                                <p className="text-sm text-on-surface-variant">Access curated study guides and peer-reviewed research strategies.</p>
                            </div>
                            <div className="bg-surface-container-low p-6 rounded-xl space-y-3 text-left">
                                <span className="material-symbols-outlined text-primary text-3xl">network_node</span>
                                <h3 className="font-headline font-bold text-primary">Social Integration</h3>
                                <p className="text-sm text-on-surface-variant">Find your community and build lasting professional networks.</p>
                            </div>
                        </div>

                        {/* Overlapping Image - Hidden on small mobile, visible from sm up */}
                        <div className="relative pt-10 hidden sm:block">
                            <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary-fixed rounded-full opacity-20 -z-10"></div>
                            <div className="bg-surface-container-highest rounded-2xl overflow-hidden editorial-shadow h-64 w-full lg:w-4/5 relative group mx-auto lg:mx-0">
                                <img
                                    alt="A diverse group of university students collaborating in a bright library"
                                    className="w-full h-full object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvsqInKoo83qhS--6u7J-Wz9ITtBpPALHvfSw1NiLmrYJuM2z2v0SI0fsqKQTmsq6T1Fq961ykBHR04jNOfcd8bGfwp0yZXnH_edlrlxRDLgU2W8tdcwDfmW6gHFOYW27YRKmthZnUncgXiTco0gZolJfJQorMH5LB_2CfbpvAhCgYtTTO8LU8QBHEwC3cDobKyH3lbEYMR5kyZmu-g8QiDx-GnmW36lLYAFhrIjBY2H6zVjulBhsInTBClQIQ9pdehpkfZy0NXsQ"
                                />
                                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-lg text-left">
                                    <p className="font-headline font-bold text-primary text-sm italic">"Mentorship changed how I viewed my final year."</p>
                                    <p className="text-xs text-on-surface-variant mt-1">— Sarah J., Senior Mentor</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Registration Form */}
                    <div className="lg:col-span-6 flex justify-center lg:justify-end order-1 lg:order-2">
                        <div className="w-full max-w-md bg-surface-container-lowest editorial-shadow rounded-2xl p-8 md:p-10 border border-outline-variant/15">
                            {showOtp ? (
                                <OtpVerification 
                                    email={tempEmail} 
                                    onSuccess={handleOtpSuccess} 
                                    onCancel={() => setShowOtp(false)} 
                                />
                            ) : (
                                <>
                                    <div className="mb-8">
                                        <h2 className="font-headline text-3xl font-bold text-primary mb-2">Create Account</h2>
                                        <p className="text-on-surface-variant">Start your journey at Mentor Wise today.</p>
                                    </div>

                                    <form onSubmit={handleFormSubmitAttempt} className="space-y-5">

                                        {/* Role Selection */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold text-on-surface-variant block">Select Your Role</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <label className="relative cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="role"
                                                        value="Mentee"
                                                        checked={userRole === "Mentee"}
                                                        onChange={() => setUserRole("Mentee")}
                                                        className="peer sr-only"
                                                    />
                                                    <div className="p-4 rounded-xl border border-outline-variant/30 text-center transition-all peer-checked:bg-primary peer-checked:text-on-primary hover:opacity-90">
                                                        <span className="block font-headline font-bold">Mentee</span>
                                                        <span className="text-[10px] uppercase tracking-tighter opacity-70">Junior / Freshman</span>
                                                    </div>
                                                </label>
                                                <label className="relative cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="role"
                                                        value="Mentor"
                                                        checked={userRole === "Mentor"}
                                                        onChange={() => setUserRole("Mentor")}
                                                        className="peer sr-only"
                                                    />
                                                    <div className="p-4 rounded-xl border border-outline-variant/30 text-center transition-all peer-checked:bg-primary peer-checked:text-on-primary hover:opacity-90">
                                                        <span className="block font-headline font-bold">Mentor</span>
                                                        <span className="text-[10px] uppercase tracking-tighter opacity-70">Senior / Graduate</span>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Google OAuth */}
                                        <GoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={handleGoogleError}
                                            theme="outline"
                                            size="large"
                                            text="signup_with"
                                            shape="rectangular"
                                            width="100%"
                                        />

                                        <div className="space-y-4">
                                            {/* First + Last Name */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-semibold text-on-surface-variant block mb-1">First Name</label>
                                                    <input
                                                        type="text"
                                                        name="firstName"
                                                        placeholder="John"
                                                        value={formData.firstName}
                                                        onChange={handleChange}
                                                        className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container transition-all outline-none text-sm md:text-base"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-on-surface-variant block mb-1">Last Name</label>
                                                    <input
                                                        type="text"
                                                        name="lastName"
                                                        placeholder="Doe"
                                                        value={formData.lastName}
                                                        onChange={handleChange}
                                                        className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container transition-all outline-none text-sm md:text-base"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <label className="text-sm font-semibold text-on-surface-variant block mb-1">Phone Number</label>
                                                <div className="relative flex items-center">
                                                    <span className="absolute left-4 text-on-surface-variant text-sm font-medium pointer-events-none">+92</span>
                                                    <input
                                                        type="tel"
                                                        name="phoneNumber"
                                                        value={formData.phoneNumber}
                                                        onChange={handleChange}
                                                        maxLength="10"
                                                        pattern="[0-9]*"
                                                        placeholder="3001234567"
                                                        className="w-full pl-14 pr-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary-container transition-all outline-none"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Department + Batch */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-semibold text-on-surface-variant block mb-1">Department</label>
                                                    <select
                                                        name="department"
                                                        value={formData.department}
                                                        onChange={handleChange}
                                                        className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container transition-all outline-none text-sm md:text-base"
                                                        required
                                                    >
                                                        <option value="">Department</option>
                                                        <option value="CS">CS</option>
                                                        <option value="IT">IT</option>
                                                        <option value="SE">SE</option>
                                                        <option value="DS">DS</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-on-surface-variant block mb-1">Batch</label>
                                                    <select
                                                        name="batch"
                                                        value={formData.batch}
                                                        onChange={handleChange}
                                                        className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container transition-all outline-none text-sm md:text-base"
                                                        required
                                                    >
                                                        <option value="">Batch</option>
                                                        <option value="F22">F22</option>
                                                        <option value="F23">F23</option>
                                                        <option value="F24">F24</option>
                                                        <option value="F25">F25</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Campus */}
                                            <div>
                                                <label className="text-sm font-semibold text-on-surface-variant block mb-1">Campus</label>
                                                <select
                                                    name="campus"
                                                    value={formData.campus}
                                                    onChange={handleChange}
                                                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container transition-all outline-none text-sm md:text-base"
                                                    required
                                                >
                                                    <option value="">PUCIT Campus</option>
                                                    <option value="New">New Campus</option>
                                                    <option value="Old">Old Campus</option>
                                                </select>
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <label className="text-sm font-semibold text-on-surface-variant block mb-1">University Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    placeholder="j.doe@university.edu"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container transition-all outline-none text-sm md:text-base"
                                                    required
                                                />
                                            </div>

                                            {/* Password */}
                                            <div>
                                                <label className="text-sm font-semibold text-on-surface-variant block mb-1">Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        name="password"
                                                        placeholder="••••••••"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-primary-container transition-all outline-none text-sm md:text-base"
                                                        required
                                                    />
                                                    <span
                                                        onClick={togglePasswordVisibility}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer transition"
                                                    >
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
                                            </div>

                                            {/* Transcript Upload (Only for Mentors) */}
                                            {userRole === "Mentor" && (
                                                <div>
                                                    <label className="text-sm font-semibold text-on-surface-variant block mb-1">Academic Transcript (PDF)</label>
                                                    <div className="relative group">
                                                        <input
                                                            type="file"
                                                            name="transcript"
                                                            accept=".pdf"
                                                            onChange={handleChange}
                                                            className="w-full bg-surface-container-low border-2 border-dashed border-outline-variant/30 rounded-xl px-4 py-3 focus:border-primary transition-all outline-none text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-container file:text-on-primary-container hover:file:bg-primary-container/80 cursor-pointer"
                                                            required={userRole === "Mentor"}
                                                        />
                                                        <p className="text-[10px] text-on-surface-variant mt-1 px-1 italic">Please upload your most recent transcript for discovery verification.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Feedback messages */}
                                        {error && <p className="text-error text-xs text-center">{error}</p>}
                                        {success && <p className="text-green-600 text-xs text-center">{success}</p>}

                                        {/* Submit */}
                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-4 rounded-xl font-headline font-bold text-lg hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {isLoading ? "Creating Account..." : "Create Account"}
                                            </button>
                                        </div>

                                        <div className="text-center">
                                            <p className="text-sm text-on-surface-variant">
                                                Already have an account?{" "}
                                                <a className="text-primary font-bold hover:underline transition-all" href="/login">Log In</a>
                                            </p>
                                        </div>

                                        <div className="relative flex items-center py-2">
                                            <div className="flex-grow border-t border-outline-variant/20"></div>
                                            <span className="flex-shrink mx-4 text-xs uppercase tracking-widest text-on-surface-variant/50">Verification Required</span>
                                            <div className="flex-grow border-t border-outline-variant/20"></div>
                                        </div>

                                    </form>
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </main>

            {/* ── Footer ── */}
            <footer className="w-full border-t border-slate-200 bg-slate-100 mt-auto">
                <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 py-12 gap-6 max-w-7xl mx-auto">
                    <div className="space-y-2 text-center md:text-left">
                        <div 
                            className="font-headline font-bold text-lg text-blue-900 cursor-pointer"
                            onClick={() => navigate("/")}
                        >
                            Mentor Wise
                        </div>
                        <p className="text-sm text-slate-500">© 2026 Mentor Wise. Developed for University Excellence.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8">
                        <a className="text-sm text-slate-500 hover:text-blue-900 transition-all" href="#">Privacy Policy</a>
                        <a className="text-sm text-slate-500 hover:text-blue-900 transition-all" href="#">Terms of Service</a>
                        <a className="text-sm text-slate-500 hover:text-blue-900 transition-all" href="https://mail.google.com/mail/?view=cm&fs=1&to=gull66332@gmail.com" target="_blank" rel="noopener noreferrer">Contact</a>
                    </div>
                </div>
            </footer>

            {/* Acceptance Modal */}
            {showPolicyModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-surface">
                            <h2 className="text-xl font-bold text-primary">
                                Terms of Service & Privacy Policy
                            </h2>
                            <button 
                                onClick={() => setShowPolicyModal(false)}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto bg-white custom-scrollbar">
                            <p className="text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                Please read and accept our Terms of Service and Privacy Policy to create your account.
                            </p>
                            {termsAndPrivacyContent}
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-4">
                            <button 
                                onClick={() => setShowPolicyModal(false)}
                                className="px-6 py-2 bg-transparent text-slate-600 font-semibold rounded-lg hover:bg-slate-200 transition-all"
                            >
                                Decline
                            </button>
                            <button 
                                onClick={executeSignup}
                                className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:shadow"
                            >
                                Accept & Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Existing Account Modal */}
            {showExistingAccountModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-primary text-3xl">info</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Exists</h2>
                            <p className="text-slate-600 mb-8">
                                An account is already registered with this Google email. Please log in instead to access your account.
                            </p>
                            <div className="flex gap-4 w-full">
                                <button 
                                    onClick={() => setShowExistingAccountModal(false)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => navigate("/login")}
                                    className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                                >
                                    Go to Login
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}