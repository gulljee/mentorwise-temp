// Forgot password page for requesting password reset email

import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
    const navigate = useNavigate();

    // ── ALL STATE & LOGIC IDENTICAL TO ORIGINAL ────────────────────────────────
    const [email,     setEmail]     = useState("");
    const [error,     setError]     = useState("");
    const [success,   setSuccess]   = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ email }),
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
    // ──────────────────────────────────────────────────────────────────────────

    return (
        <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col">

            {/* Header — matches SignupFormMentor */}
            <header className="fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-xl shadow-sm">
                <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
                    <div className="text-2xl font-extrabold tracking-tight text-blue-900">Mentor Wise</div>
                    <div className="hidden md:flex gap-8 items-center">
                        <a className="text-sm uppercase tracking-wider text-slate-600 hover:text-blue-900 transition-colors duration-200" href="/">About</a>
                        <a className="bg-primary-container text-on-primary-container px-6 py-2 rounded-lg font-semibold transition-all hover:opacity-90" href="/login">Login</a>
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
                                Forgot your <br />
                                <span className="text-secondary">password?</span>
                            </h1>
                        </div>

                        <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed font-light">
                            No worries — it happens. Enter the email linked to your Mentor Wise account
                            and we'll send you a secure reset link immediately.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                            <div className="bg-surface-container-low p-6 rounded-xl space-y-3">
                                <span className="material-symbols-outlined text-primary text-3xl">mark_email_read</span>
                                <h3 className="font-headline font-bold text-primary">Email Link</h3>
                                <p className="text-sm text-on-surface-variant">A reset link will be sent to your inbox within seconds.</p>
                            </div>
                            <div className="bg-surface-container-low p-6 rounded-xl space-y-3">
                                <span className="material-symbols-outlined text-primary text-3xl">timer</span>
                                <h3 className="font-headline font-bold text-primary">Time Limited</h3>
                                <p className="text-sm text-on-surface-variant">The link expires in 15 minutes to keep your account secure.</p>
                            </div>
                        </div>

                        {/* Steps */}
                        <div className="space-y-4 pt-2">
                            {[
                                { step: '01', text: 'Enter your registered email address below.' },
                                { step: '02', text: 'Check your inbox for the reset link.' },
                                { step: '03', text: 'Click the link and set your new password.' },
                            ].map(({ step, text }) => (
                                <div key={step} className="flex items-center gap-5">
                                    <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed-variant font-headline font-bold text-sm flex-shrink-0">
                                        {step}
                                    </div>
                                    <p className="text-on-surface-variant text-sm">{text}</p>
                                </div>
                            ))}
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
                                        style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                                </div>
                                <div>
                                    <h2 className="font-headline text-3xl font-bold text-primary mb-1">Forgot Password?</h2>
                                    <p className="text-on-surface-variant text-sm">
                                        Enter your email to receive a reset link.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">

                                {/* Email input — ORIGINAL input preserved exactly */}
                                <div>
                                    <label className="text-sm font-semibold text-on-surface-variant block mb-1">
                                        University Email
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </span>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="you@university.edu"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary-container transition-all outline-none font-body text-on-surface placeholder-outline"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Feedback — ORIGINAL logic */}
                                {error && (
                                    <div className="flex items-center gap-3 p-4 bg-error-container rounded-xl">
                                        <span className="material-symbols-outlined text-error text-xl">error</span>
                                        <p className="text-error text-sm font-medium">{error}</p>
                                    </div>
                                )}
                                {success && (
                                    <div className="flex items-center gap-3 p-4 bg-primary-fixed rounded-xl">
                                        <span className="material-symbols-outlined text-primary text-xl">mark_email_read</span>
                                        <div>
                                            <p className="text-primary text-sm font-bold">Reset link sent!</p>
                                            <p className="text-primary/70 text-xs mt-0.5">{success}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Submit — ORIGINAL logic */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-4 rounded-xl font-headline font-bold text-lg hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? "Sending..." : "Send Reset Link"}
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
                                    <span className="flex-shrink mx-4 text-xs uppercase tracking-widest text-on-surface-variant/50">Secure Recovery</span>
                                    <div className="flex-grow border-t border-outline-variant/20" />
                                </div>

                            </form>
                        </div>
                    </div>

                </div>
            </main>

            {/* Footer — matches SignupFormMentor */}
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
