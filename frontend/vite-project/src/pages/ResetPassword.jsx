// Password reset page for users to set a new password using a reset token

import React, { useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';

// ── Eye toggle icon helpers ────────────────────────────────────────────────────
function EyeOff() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
    );
}
function EyeOn() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    );
}

export default function ResetPassword() {
    const { token } = useParams();
    const navigate  = useNavigate();

    // ── ALL STATE & LOGIC IDENTICAL TO ORIGINAL ────────────────────────────────
    const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
    const [error,     setError]               = useState("");
    const [success,   setSuccess]             = useState("");
    const [isLoading, setIsLoading]           = useState(false);
    const [showPassword,        setShowPassword]        = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [tokenValid, setTokenValid] = useState(true);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const togglePasswordVisibility        = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ password: formData.password }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to reset password.");
                if (data.message?.includes('Invalid or expired')) setTokenValid(false);
            } else {
                setSuccess(data.message);
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (err) {
            setError("Server error. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };
    // ──────────────────────────────────────────────────────────────────────────

    const inputClass = "w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container transition-all outline-none font-body text-on-surface placeholder-outline";

    // ── Invalid / expired token screen ────────────────────────────────────────
    if (!tokenValid) {
        return (
            <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col">
                <header className="fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-xl shadow-sm">
                    <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
                        <div className="text-2xl font-extrabold tracking-tight text-blue-900">Mentor Wise</div>
                        <a className="bg-primary-container text-on-primary-container px-6 py-2 rounded-lg font-semibold hover:opacity-90" href="/login">Login</a>
                    </div>
                    <div className="bg-slate-200/50 h-px w-full" />
                </header>

                <main className="flex-1 flex items-center justify-center px-6 pt-24 pb-20">
                    <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-10 border border-outline-variant/15 text-center"
                        style={{ boxShadow: '0px 20px 40px rgba(26,28,32,0.06)' }}>

                        <div className="w-20 h-20 bg-error-container rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-error text-4xl">link_off</span>
                        </div>

                        <h1 className="font-headline text-3xl font-bold text-primary mb-3">
                            Invalid or Expired Link
                        </h1>
                        <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
                            This password reset link is invalid or has expired.<br />
                            Please request a new one.
                        </p>

                        <button
                            onClick={() => navigate('/forgot-password')}
                            className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-4 rounded-xl font-headline font-bold hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
                        >
                            Request New Link
                        </button>

                        <button
                            onClick={() => navigate('/login')}
                            className="mt-4 text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto"
                        >
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Back to Login
                        </button>
                    </div>
                </main>

                <footer className="w-full border-t border-slate-200 bg-slate-100">
                    <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 py-10 gap-6 max-w-7xl mx-auto">
                        <div className="font-headline font-bold text-lg text-blue-900">Mentor Wise</div>
                        <div className="flex gap-6">
                            <a className="text-sm text-slate-500 hover:text-blue-600 transition-all" href="#">Privacy Policy</a>
                            <a className="text-sm text-slate-500 hover:text-blue-600 transition-all" href="#">Terms of Service</a>
                        </div>
                    </div>
                </footer>
            </div>
        );
    }

    // ── Main reset form ───────────────────────────────────────────────────────
    return (
        <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col">

            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-xl shadow-sm">
                <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
                    <div className="text-2xl font-extrabold tracking-tight text-blue-900">Mentor Wise</div>
                    <div className="hidden md:flex gap-8 items-center">
                        <a className="text-sm uppercase tracking-wider text-slate-600 hover:text-blue-900 transition-colors" href="/">About</a>
                        <a className="bg-primary-container text-on-primary-container px-6 py-2 rounded-lg font-semibold hover:opacity-90" href="/login">Login</a>
                    </div>
                </div>
                <div className="bg-slate-200/50 h-px w-full" />
            </header>

            {/* Main */}
            <main className="min-h-screen pt-24 pb-20 px-6 flex items-center justify-center flex-1">
                <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* Left editorial panel */}
                    <div className="lg:col-span-6 space-y-10 order-2 lg:order-1">
                        <div className="space-y-4">
                            <span className="inline-block text-sm uppercase tracking-[0.2em] text-on-surface-variant font-semibold">
                                Account Recovery
                            </span>
                            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-primary leading-[1.1] tracking-tight">
                                Set a new <br />
                                <span className="text-secondary">secure password.</span>
                            </h1>
                        </div>

                        <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed font-light">
                            Choose a strong password to protect your Mentor Wise account. Make sure it's at least 6 characters and something you'll remember.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                            <div className="bg-surface-container-low p-6 rounded-xl space-y-3">
                                <span className="material-symbols-outlined text-primary text-3xl">lock</span>
                                <h3 className="font-headline font-bold text-primary">Secure Reset</h3>
                                <p className="text-sm text-on-surface-variant">Your link is single-use and time-limited for maximum account security.</p>
                            </div>
                            <div className="bg-surface-container-low p-6 rounded-xl space-y-3">
                                <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
                                <h3 className="font-headline font-bold text-primary">Instant Access</h3>
                                <p className="text-sm text-on-surface-variant">Once reset, you'll be redirected to login automatically.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: form card */}
                    <div className="lg:col-span-6 flex justify-center lg:justify-end order-1 lg:order-2">
                        <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-8 md:p-10 border border-outline-variant/15"
                            style={{ boxShadow: '0px 20px 40px rgba(26,28,32,0.06)' }}>

                            {/* Icon + heading */}
                            <div className="mb-8 flex items-start gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary-container flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-on-primary-container text-2xl"
                                        style={{ fontVariationSettings: "'FILL' 1" }}>lock_reset</span>
                                </div>
                                <div>
                                    <h2 className="font-headline text-3xl font-bold text-primary mb-1">Reset Password</h2>
                                    <p className="text-on-surface-variant text-sm">Enter your new password below.</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">

                                {/* New Password — ORIGINAL input preserved */}
                                <div>
                                    <label className="text-sm font-semibold text-on-surface-variant block mb-1">New Password</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="New Password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`${inputClass} pl-12 pr-12`}
                                            required
                                        />
                                        <span
                                            onClick={togglePasswordVisibility}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff /> : <EyeOn />}
                                        </span>
                                    </div>
                                </div>

                                {/* Confirm Password — ORIGINAL input preserved */}
                                <div>
                                    <label className="text-sm font-semibold text-on-surface-variant block mb-1">Confirm New Password</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </span>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            placeholder="Confirm New Password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className={`${inputClass} pl-12 pr-12`}
                                            required
                                        />
                                        <span
                                            onClick={toggleConfirmPasswordVisibility}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition cursor-pointer"
                                        >
                                            {showConfirmPassword ? <EyeOff /> : <EyeOn />}
                                        </span>
                                    </div>
                                </div>

                                {/* Strength hint */}
                                {formData.password && (
                                    <p className={`text-xs font-medium flex items-center gap-1.5 ${
                                        formData.password.length >= 8 ? 'text-green-600' :
                                        formData.password.length >= 6 ? 'text-secondary' : 'text-error'
                                    }`}>
                                        <span className="material-symbols-outlined text-sm">
                                            {formData.password.length >= 6 ? 'check_circle' : 'cancel'}
                                        </span>
                                        {formData.password.length >= 8 ? 'Strong password' :
                                         formData.password.length >= 6 ? 'Good — minimum met' : 'Too short (min 6 chars)'}
                                    </p>
                                )}

                                {/* Feedback — ORIGINAL logic */}
                                {error && (
                                    <div className="flex items-center gap-3 p-4 bg-error-container rounded-xl">
                                        <span className="material-symbols-outlined text-error text-xl">error</span>
                                        <p className="text-error text-sm font-medium">{error}</p>
                                    </div>
                                )}
                                {success && (
                                    <div className="flex items-center gap-3 p-4 bg-primary-fixed rounded-xl">
                                        <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                                        <div>
                                            <p className="text-primary text-sm font-bold">{success}</p>
                                            <p className="text-primary/70 text-xs mt-0.5">Redirecting to login...</p>
                                        </div>
                                    </div>
                                )}

                                {/* Submit — ORIGINAL logic */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading || !!success}
                                        className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-4 rounded-xl font-headline font-bold text-lg hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? "Resetting..." : "Reset Password"}
                                    </button>
                                </div>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/login')}
                                        className="text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto"
                                    >
                                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                                        Back to Login
                                    </button>
                                </div>

                                <div className="relative flex items-center py-2">
                                    <div className="flex-grow border-t border-outline-variant/20" />
                                    <span className="flex-shrink mx-4 text-xs uppercase tracking-widest text-on-surface-variant/50">Secured Reset</span>
                                    <div className="flex-grow border-t border-outline-variant/20" />
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-slate-200 bg-slate-100 mt-auto">
                <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 py-12 gap-6 max-w-7xl mx-auto">
                    <div className="space-y-2 text-center md:text-left">
                        <div className="font-headline font-bold text-lg text-blue-900">Mentor Wise</div>
                        <p className="text-sm text-slate-500">© 2024 Mentor Wise. Developed for University Excellence.</p>
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
