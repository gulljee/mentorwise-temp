// Shared profile editing tab — used by both MentorDashboard and MenteeDashboard
import React, { useState } from 'react';

const SUBJECTS = [
    'DSA', 'OOP', 'PF', 'AOA', 'Database',
    'Web Development', 'Machine Learning',
    'Software Engineering', 'Computer Networks', 'Operating Systems'
];

export default function ProfileTab({ initialUser }) {
    // ── ALL STATE & LOGIC IDENTICAL TO ORIGINAL ────────────────────────────────
    const [user, setUser] = useState(initialUser);
    const [form, setForm] = useState({
        firstName:   initialUser.firstName   || '',
        lastName:    initialUser.lastName    || '',
        phoneNumber: initialUser.phoneNumber || '',
        about:       initialUser.about       || '',
        cgpa:        initialUser.cgpa        || '',
        subjects:    initialUser.subjects    || [],
    });
    const [saving,  setSaving]  = useState(false);
    const [success, setSuccess] = useState('');
    const [error,   setError]   = useState('');
    const [transcriptFile, setTranscriptFile] = useState(null);
    const [uploadingTranscript, setUploadingTranscript] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const toggleSubject = (subject) => {
        setForm(prev => ({
            ...prev,
            subjects: prev.subjects.includes(subject)
                ? prev.subjects.filter(s => s !== subject)
                : [...prev.subjects, subject]
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        if (form.phoneNumber.length !== 10) {
            setError("Phone number must be exactly 10 digits (excluding +92)");
            setSaving(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/profile/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (res.ok) {
                const updatedUser = { ...user, ...data.user };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                setSuccess('Profile updated successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.message || 'Failed to update profile.');
            }
        } catch (err) {
            setError('Server error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleTranscriptUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingTranscript(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('transcript', file);

            const res = await fetch('http://localhost:5000/api/profile/upload-transcript', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                const updatedUser = { ...user, transcript: data.transcript };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                setSuccess('Transcript uploaded successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.message || 'Failed to upload transcript.');
            }
        } catch (err) {
            setError('Server error. Please try again.');
        } finally {
            setUploadingTranscript(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('image', file);

            const res = await fetch('http://localhost:5000/api/profile/upload-image', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                const updatedUser = { ...user, profileImage: data.profileImage };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                setSuccess('Profile image updated successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.message || 'Failed to upload image.');
            }
        } catch (err) {
            setError('Server error. Please try again.');
        } finally {
            setUploadingImage(false);
        }
    };
    // ──────────────────────────────────────────────────────────────────────────

    const inputClass = "w-full px-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition text-sm font-body";
    const labelClass = "text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2";

    return (
        <div className="font-body text-on-surface">

            {/* ── Page header ── */}
            <div className="mb-12">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Account</span>
                <h2 className="font-headline text-5xl font-extrabold text-primary tracking-tight mb-2">Profile Settings</h2>
                <p className="text-on-surface-variant text-lg">Manage your personal information and scholarly profile.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── Left: Identity card ── */}
                <div className="lg:col-span-1">
                    <div className="bg-surface-container-lowest rounded-2xl p-8 sticky top-8"
                        style={{ boxShadow: '0px 20px 40px rgba(26,28,32,0.06)', outline: '1px solid rgba(195,198,209,0.15)' }}>

                        {/* Avatar */}
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-24 h-24 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container font-headline font-bold text-3xl mb-4 overflow-hidden relative group"
                                style={{ boxShadow: '0 8px 24px rgba(0,52,102,0.15)' }}>
                                {user.profileImage ? (
                                    <img 
                                        src={`http://localhost:5000/${user.profileImage}`} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{user.firstName?.[0]}{user.lastName?.[0]}</span>
                                )}
                                
                                {/* Overlay upload button */}
                                <label className="absolute inset-0 bg-primary/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                                    <span className="text-[8px] text-white font-bold uppercase tracking-tighter mt-1">Change Photo</span>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleImageUpload}
                                        disabled={uploadingImage}
                                    />
                                </label>
                                
                                {uploadingImage && (
                                    <div className="absolute inset-0 bg-primary/80 flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                            <h2 className="font-headline text-xl font-bold text-primary mb-0.5">
                                {user.firstName} {user.lastName}
                            </h2>
                            <p className="text-on-surface-variant text-xs break-all">{user.email}</p>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 justify-center mb-8">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                                user.role === 'Mentor'
                                    ? 'bg-primary-fixed text-on-primary-fixed-variant'
                                    : 'bg-secondary-fixed text-on-secondary-fixed'
                            }`}>
                                {user.role}
                            </span>
                            {user.department && (
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-surface-container text-on-surface-variant uppercase tracking-tighter">
                                    {user.department}
                                </span>
                            )}
                            {user.batch && (
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-surface-container text-on-surface-variant uppercase tracking-tighter">
                                    Batch {user.batch}
                                </span>
                            )}
                            {user.campus && (
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-surface-container text-on-surface-variant uppercase tracking-tighter">
                                    {user.campus} Campus
                                </span>
                            )}
                        </div>

                        {/* Static details */}
                        <div className="border-t border-outline-variant/10 pt-6 space-y-4">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Email</p>
                                <p className="text-sm text-on-surface break-all">{user.email}</p>
                            </div>
                            {user.about && (
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">About</p>
                                    <p className="text-sm text-on-surface line-clamp-4 leading-relaxed">{user.about}</p>
                                </div>
                            )}
                            {user.cgpa && (
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">CGPA</p>
                                    <p className="font-headline text-2xl font-bold text-primary">{user.cgpa}</p>
                                </div>
                            )}
                            {user.subjects?.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Subjects</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {user.subjects.map(s => (
                                            <span key={s} className="px-2 py-1 bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold rounded uppercase tracking-tighter">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Right: Edit form ── */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSave}
                        className="bg-surface-container-lowest rounded-2xl p-8 space-y-6"
                        style={{ boxShadow: '0px 20px 40px rgba(26,28,32,0.06)', outline: '1px solid rgba(195,198,209,0.15)' }}
                    >
                        <div className="pb-4 border-b border-outline-variant/10">
                            <h3 className="font-headline text-xl font-bold text-primary">Edit Information</h3>
                            <p className="text-on-surface-variant text-sm mt-1">Update your public profile details.</p>
                        </div>

                        {/* Name row — ORIGINAL inputs kept exactly */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={form.firstName}
                                    onChange={handleChange}
                                    required
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={form.lastName}
                                    onChange={handleChange}
                                    required
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Phone Number</label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-on-surface-variant text-sm font-medium pointer-events-none">+92</span>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={form.phoneNumber}
                                    onChange={handleChange}
                                    maxLength="10"
                                    pattern="[0-9]*"
                                    placeholder="3001234567"
                                    className={`${inputClass} pl-14`}
                                />
                            </div>
                        </div>

                        {/* About — ORIGINAL */}
                        <div>
                            <label className={labelClass}>About</label>
                            <textarea
                                name="about"
                                value={form.about}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Tell others about yourself, your expertise, your goals..."
                                className={`${inputClass} resize-none`}
                            />
                        </div>

                        {/* CGPA — ORIGINAL */}
                        <div>
                            <label className={labelClass}>CGPA</label>
                            <input
                                type="number"
                                name="cgpa"
                                value={form.cgpa}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                max="4"
                                placeholder="0.00 – 4.00"
                                className={inputClass}
                            />
                        </div>

                        {/* Subjects toggle — ORIGINAL logic, new styling */}
                        <div>
                            <label className={labelClass}>Subjects / Areas of Interest</label>
                            <div className="flex flex-wrap gap-2">
                                {SUBJECTS.map(subject => (
                                    <button
                                        key={subject}
                                        type="button"
                                        onClick={() => toggleSubject(subject)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                            form.subjects.includes(subject)
                                                ? 'bg-primary text-on-primary shadow-sm'
                                                : 'bg-surface-container text-on-surface-variant border border-outline-variant/20 hover:border-primary/30 hover:text-primary'
                                        }`}
                                    >
                                        {subject}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Read-only fields — ORIGINAL data, new styling */}
                        <div className="grid grid-cols-3 gap-3 p-5 bg-surface-container-low rounded-xl border border-outline-variant/10">
                            {[
                                { label: 'Department', value: user.department },
                                { label: 'Batch',      value: user.batch },
                                { label: 'Campus',     value: user.campus ? `${user.campus} Campus` : '—' },
                            ].map(({ label, value }) => (
                                <div key={label} className="text-center">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{label}</p>
                                    <p className="text-sm font-semibold text-on-surface">{value}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-on-surface-variant/60 text-xs -mt-4">
                            Department, Batch and Campus cannot be changed.
                        </p>

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
                                <p className="text-primary text-sm font-bold">{success}</p>
                            </div>
                        )}

                        {/* Transcript Management (Mentors only) */}
                        {user.role === 'Mentor' && (
                            <div className="pt-6 border-t border-outline-variant/10">
                                <label className={labelClass}>Academic Transcript (Discovery Verification)</label>
                                <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/20">
                                    <div className="flex flex-col sm:flex-row items-center gap-6">
                                        <div className="w-16 h-16 rounded-xl bg-primary-container/30 flex items-center justify-center text-primary flex-shrink-0">
                                            <span className="material-symbols-outlined text-3xl">description</span>
                                        </div>
                                        <div className="flex-1 text-center sm:text-left">
                                            <h4 className="font-bold text-primary text-sm mb-1">
                                                {user.transcript ? 'Transcript Verified' : 'No Transcript Uploaded'}
                                            </h4>
                                            <p className="text-[10px] text-on-surface-variant leading-relaxed">
                                                {user.transcript 
                                                    ? 'Your transcript is on file. You are visible in mentor search results.' 
                                                    : 'Upload a PDF transcript to get discovered by potential mentees.'}
                                            </p>
                                            {user.transcript && (
                                                <a 
                                                    href={`http://localhost:5000/${user.transcript}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-block mt-2 text-[10px] font-bold text-primary hover:underline"
                                                >
                                                    View Current Transcript →
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex-shrink-0">
                                            <label className={`cursor-pointer px-4 py-2 rounded-lg text-xs font-bold transition-all ${uploadingTranscript ? 'opacity-50 cursor-not-allowed bg-surface-container' : 'bg-primary text-on-primary hover:opacity-90'}`}>
                                                {uploadingTranscript ? 'Uploading...' : user.transcript ? 'Re-upload' : 'Upload PDF'}
                                                <input 
                                                    type="file" 
                                                    accept=".pdf" 
                                                    className="hidden" 
                                                    onChange={handleTranscriptUpload}
                                                    disabled={uploadingTranscript}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit — ORIGINAL logic */}
                        <button
                            type="submit"
                            disabled={saving}
                            className={`w-full py-4 font-headline font-bold rounded-xl transition-all active:scale-95 ${
                                saving
                                    ? 'bg-surface-container text-on-surface-variant cursor-not-allowed'
                                    : 'text-white hover:opacity-90'
                            }`}
                            style={saving ? {} : { background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)', boxShadow: '0 8px 24px rgba(0,52,102,0.2)' }}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
