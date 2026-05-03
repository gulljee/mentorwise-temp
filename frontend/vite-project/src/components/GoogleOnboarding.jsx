// Google OAuth onboarding form for new users to complete their profile after Google sign-in

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import OtpVerification from "./OtpVerification";

export default function GoogleOnboarding() {
    const navigate    = useNavigate();
    const location    = useLocation();
    const googleData  = location.state?.googleData;

    if (!googleData) {
        window.location.href = '/signup';
        return null;
    }

    // ── ALL STATE & LOGIC IDENTICAL TO ORIGINAL ──────────────────────────────
    const [role, setRole] = useState("Mentee");

    const [formData, setFormData] = useState({
        googleId:    googleData.googleId,
        firstName:   googleData.firstName,
        lastName:    googleData.lastName,
        email:       googleData.email,
        phoneNumber: "",
        batch:       "",
        department:  "",
        campus:      "",
        transcript: null
    });

    const [error,     setError]     = useState("");
    const [success,   setSuccess]   = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [tempEmail, setTempEmail] = useState("");
    const [showPolicyModal, setShowPolicyModal] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleFormSubmitAttempt = (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

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
            formDataToSend.append('role', role);

            const res = await fetch("http://localhost:5000/api/auth/google/complete", {
                method:  "POST",
                body:    formDataToSend,
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
    // ─────────────────────────────────────────────────────────────────────────

    // Shared input/label classes matching SignupFormMentor exactly
    const labelClass = "text-sm font-semibold text-on-surface-variant block mb-1";
    const inputClass = "w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container transition-all outline-none";

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

            {/* ── Header ── (matches SignupFormMentor) */}
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
                </div>
                <div className="bg-slate-200/50 h-px w-full" />
            </header>

            {/* ── Main ── */}
            <main className="min-h-screen pt-24 pb-20 px-6 flex items-center justify-center flex-1">
                <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* Left: Editorial panel (same as SignupFormMentor) */}
                    <div className="lg:col-span-6 space-y-10 order-2 lg:order-1">
                        <div className="space-y-4">
                            <span className="inline-block text-sm uppercase tracking-[0.2em] text-on-surface-variant font-semibold">
                                Almost there
                            </span>
                            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-primary leading-[1.1] tracking-tight">
                                Complete your <br />
                                <span className="text-secondary">scholarly profile.</span>
                            </h1>
                        </div>

                        <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed font-light">
                            We've pulled your name and email from Google. Just fill in a few more details
                            and choose your role to activate your Mentor Wise account.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                            <div className="bg-surface-container-low p-6 rounded-xl space-y-3">
                                <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
                                <h3 className="font-headline font-bold text-primary">Google Verified</h3>
                                <p className="text-sm text-on-surface-variant">Your identity is already confirmed. Just complete the institutional details.</p>
                            </div>
                            <div className="bg-surface-container-low p-6 rounded-xl space-y-3">
                                <span className="material-symbols-outlined text-primary text-3xl">school</span>
                                <h3 className="font-headline font-bold text-primary">Instant Access</h3>
                                <p className="text-sm text-on-surface-variant">One form, then you're in. Your dashboard is waiting.</p>
                            </div>
                        </div>

                        {/* Google account preview card */}
                        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/15 flex items-center gap-5"
                            style={{ boxShadow: '0px 20px 40px rgba(26,28,32,0.06)' }}>
                            <div className="w-14 h-14 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container font-headline font-bold text-2xl flex-shrink-0">
                                {googleData.firstName?.[0]}{googleData.lastName?.[0]}
                            </div>
                            <div>
                                <p className="font-headline font-bold text-primary">{googleData.firstName} {googleData.lastName}</p>
                                <p className="text-sm text-on-surface-variant">{googleData.email}</p>
                                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary-fixed px-2 py-0.5 rounded">
                                    Google Account
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Registration form card */}
                    <div className="lg:col-span-6 flex justify-center lg:justify-end order-1 lg:order-2">
                        <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-8 md:p-10 border border-outline-variant/15"
                            style={{ boxShadow: '0px 20px 40px rgba(26,28,32,0.06)' }}>

                            {showOtp ? (
                                <OtpVerification 
                                    email={tempEmail} 
                                    onSuccess={handleOtpSuccess} 
                                    onCancel={() => setShowOtp(false)} 
                                />
                            ) : (
                                <>
                                    <div className="mb-8">
                                        <h2 className="font-headline text-3xl font-bold text-primary mb-2">
                                            Complete Profile
                                        </h2>
                                        <p className="text-on-surface-variant">
                                            Tell us a bit more to set up your account.
                                        </p>
                                    </div>

                                    <form onSubmit={handleFormSubmitAttempt} className="space-y-5">

                                {/* ── Role Selection (matches SignupFormMentor radio cards) ── */}
                                <div className="space-y-3">
                                    <label className={labelClass}>Select Your Role</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="relative cursor-pointer">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="Mentee"
                                                checked={role === "Mentee"}
                                                onChange={() => setRole("Mentee")}
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
                                                checked={role === "Mentor"}
                                                onChange={() => setRole("Mentor")}
                                                className="peer sr-only"
                                            />
                                            <div className="p-4 rounded-xl border border-outline-variant/30 text-center transition-all peer-checked:bg-primary peer-checked:text-on-primary hover:bg-surface-container-high">
                                                <span className="block font-headline font-bold">Mentor</span>
                                                <span className="text-[10px] uppercase tracking-tighter opacity-70">Senior / Graduate</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-4">

                                    {/* ── Pre-filled Name (read-only, original inputs preserved exactly) ── */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>First Name</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                placeholder="FIRST NAME"
                                                value={formData.firstName}
                                                readOnly
                                                className={`${inputClass} text-on-surface-variant cursor-not-allowed opacity-70`}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Last Name</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                placeholder="LAST NAME"
                                                value={formData.lastName}
                                                readOnly
                                                className={`${inputClass} text-on-surface-variant cursor-not-allowed opacity-70`}
                                            />
                                        </div>
                                    </div>

                                    {/* ── Pre-filled Email (read-only, original preserved) ── */}
                                    <div>
                                        <label className={labelClass}>University Email</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </span>
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="Email"
                                                value={formData.email}
                                                readOnly
                                                className={`${inputClass} pl-12 text-on-surface-variant cursor-not-allowed opacity-70`}
                                            />
                                        </div>
                                    </div>

                                    {/* ── Phone Number (original input preserved) ── */}
                                    <div>
                                        <label className={labelClass}>Phone Number</label>
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
                                                className={`${inputClass} pl-14`}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* ── Department + Batch (original selects preserved) ── */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Department</label>
                                            <select
                                                name="department"
                                                value={formData.department}
                                                onChange={handleChange}
                                                className={inputClass}
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
                                            <label className={labelClass}>Batch</label>
                                            <select
                                                name="batch"
                                                value={formData.batch}
                                                onChange={handleChange}
                                                className={inputClass}
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

                                    {/* ── Campus (original select preserved) ── */}
                                    <div>
                                        <label className={labelClass}>Campus</label>
                                        <select
                                            name="campus"
                                            value={formData.campus}
                                            onChange={handleChange}
                                            className={inputClass}
                                            required
                                        >
                                            <option value="">PUCIT Campus</option>
                                            <option value="New">New Campus</option>
                                            <option value="Old">Old Campus</option>
                                        </select>
                                    </div>

                                    {/* Transcript Upload (Only for Mentors) */}
                                    {role === "Mentor" && (
                                        <div>
                                            <label className={labelClass}>Academic Transcript (PDF)</label>
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    name="transcript"
                                                    accept=".pdf"
                                                    onChange={handleChange}
                                                    className="w-full bg-surface-container-low border-2 border-dashed border-outline-variant/30 rounded-xl px-4 py-3 focus:border-primary transition-all outline-none text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-container file:text-on-primary-container hover:file:bg-primary-container/80 cursor-pointer"
                                                    required={role === "Mentor"}
                                                />
                                                <p className="text-[10px] text-on-surface-variant mt-1 px-1 italic">Please upload your most recent transcript for discovery verification.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Feedback messages */}
                                {error   && <p className="text-error text-xs text-center">{error}</p>}
                                {success && <p className="text-green-600 text-xs text-center">{success}</p>}

                                {/* Submit */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-4 rounded-xl font-headline font-bold text-lg hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? "Creating Account..." : "Complete Sign Up"}
                                    </button>
                                </div>

                                <div className="text-center">
                                    <p className="text-sm text-on-surface-variant">
                                        Already have an account?{" "}
                                        <a className="text-primary font-bold hover:underline transition-all" href="/login">Log In</a>
                                    </p>
                                </div>

                                    <div className="relative flex items-center py-2">
                                        <div className="flex-grow border-t border-outline-variant/20" />
                                        <span className="flex-shrink mx-4 text-xs uppercase tracking-widest text-on-surface-variant/50">Google Verified Account</span>
                                        <div className="flex-grow border-t border-outline-variant/20" />
                                    </div>

                                    </form>
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </main>

            {/* ── Footer ── (matches SignupFormMentor) */}
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

        </div>
    );
}
