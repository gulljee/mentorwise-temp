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
                    const dest = data.user.role === 'Mentor' ? '/dashboard/mentor' : '/dashboard/mentee';
                    navigate(dest);
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
        <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col">

            {/* ── Header ── */}
            <header className="fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-xl shadow-sm">
                <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
                    <div className="text-2xl font-extrabold tracking-tight text-blue-900">Mentor Wise</div>
                    <div className="hidden md:flex gap-8 items-center">
                        <a className="text-sm uppercase tracking-wider text-slate-600 hover:text-blue-900 transition-colors duration-200" href="/">About</a>
                        <a className="bg-primary-container text-on-primary-container px-6 py-2 rounded-lg font-semibold transition-all hover:opacity-90" href="/login">Login</a>
                    </div>
                </div>
                <div className="bg-slate-200/50 h-px w-full"></div>
            </header>

            {/* ── Main ── */}
            <main className="min-h-screen pt-24 pb-20 px-6 flex items-center justify-center flex-1">
                <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* Left: Editorial Content */}
                    <div className="lg:col-span-6 space-y-10 order-2 lg:order-1">
                        <div className="space-y-4">
                            <span className="inline-block text-sm uppercase tracking-[0.2em] text-on-surface-variant font-semibold">Join the Collective</span>
                            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-primary leading-[1.1] tracking-tight">
                                Your university <br />
                                <span className="text-secondary">journey, guided.</span>
                            </h1>
                        </div>

                        <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed font-light">
                            Mentor Wise bridges the gap between ambition and experience. We help juniors navigate the complex transition to university life through direct connection with high-achieving seniors who've walked the path before.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                            <div className="bg-surface-container-low p-6 rounded-xl space-y-3">
                                <span className="material-symbols-outlined text-primary text-3xl">school</span>
                                <h3 className="font-headline font-bold text-primary">Academic Rigor</h3>
                                <p className="text-sm text-on-surface-variant">Access curated study guides and peer-reviewed research strategies.</p>
                            </div>
                            <div className="bg-surface-container-low p-6 rounded-xl space-y-3">
                                <span className="material-symbols-outlined text-primary text-3xl">network_node</span>
                                <h3 className="font-headline font-bold text-primary">Social Integration</h3>
                                <p className="text-sm text-on-surface-variant">Find your community and build lasting professional networks.</p>
                            </div>
                        </div>

                        {/* Overlapping Image */}
                        <div className="relative pt-10">
                            <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary-fixed rounded-full opacity-20 -z-10"></div>
                            <div className="bg-surface-container-highest rounded-2xl overflow-hidden editorial-shadow h-64 w-full md:w-4/5 relative group">
                                <img
                                    alt="A diverse group of university students collaborating in a bright library"
                                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvsqInKoo83qhS--6u7J-Wz9ITtBpPALHvfSw1NiLmrYJuM2z2v0SI0fsqKQTmsq6T1Fq961ykBHR04jNOfcd8bGfwp0yZXnH_edlrlxRDLgU2W8tdcwDfmW6gHFOYW27YRKmthZnUncgXiTco0gZolJfJQorMH5LB_2CfbpvAhCgYtTTO8LU8QBHEwC3cDobKyH3lbEYMR5kyZmu-g8QiDx-GnmW36lLYAFhrIjBY2H6zVjulBhsInTBClQIQ9pdehpkfZy0NXsQ"
                                />
                                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-lg">
                                    <p className="font-headline font-bold text-primary text-sm italic">"Mentorship changed how I viewed my final year."</p>
                                    <p className="text-xs text-on-surface-variant mt-1">— Sarah J., Senior Mentor</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Registration Form */}
                    <div className="lg:col-span-6 flex justify-center lg:justify-end order-1 lg:order-2">
                        <div className="w-full max-w-md bg-surface-container-lowest editorial-shadow rounded-2xl p-8 md:p-10 border border-outline-variant/15">
                            <div className="mb-8">
                                <h2 className="font-headline text-3xl font-bold text-primary mb-2">Create Account</h2>
                                <p className="text-on-surface-variant">Start your journey at Mentor Wise today.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">

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
                                            <div className="p-4 rounded-xl border border-outline-variant/30 text-center transition-all peer-checked:bg-primary peer-checked:text-on-primary hover:bg-surface-container-high">
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
                                            <div className="p-4 rounded-xl border border-outline-variant/30 text-center transition-all peer-checked:bg-primary peer-checked:text-on-primary hover:bg-surface-container-high">
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-semibold text-on-surface-variant block mb-1">First Name</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                placeholder="John"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container transition-all outline-none"
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
                                                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container transition-all outline-none"
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
                                                className="w-full pl-14 pr-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary-container transition-all outline-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Department + Batch */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-semibold text-on-surface-variant block mb-1">Department</label>
                                            <select
                                                name="department"
                                                value={formData.department}
                                                onChange={handleChange}
                                                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container transition-all outline-none"
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
                                                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container transition-all outline-none"
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
                                            className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container transition-all outline-none"
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
                                            className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container transition-all outline-none"
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
                                                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-primary-container transition-all outline-none"
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
                        </div>
                    </div>

                </div>
            </main>

            {/* ── Footer ── */}
            <footer className="w-full border-t border-slate-200 bg-slate-100 mt-auto">
                <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 py-12 gap-6 max-w-7xl mx-auto">
                    <div className="space-y-2 text-center md:text-left">
                        <div className="font-headline font-bold text-lg text-blue-900">Mentor Wise</div>
                        <p className="text-sm text-slate-500">© 2026 Mentor Wise. Developed for University Excellence.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8">
                        <a className="text-sm text-slate-500 hover:text-blue-600 transition-all" href="#">Privacy Policy</a>
                        <a className="text-sm text-slate-500 hover:text-blue-600 transition-all" href="#">Terms of Service</a>
                    </div>
                </div>
            </footer>

        </div>
    );
}