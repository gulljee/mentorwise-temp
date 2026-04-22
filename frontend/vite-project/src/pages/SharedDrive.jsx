import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SUBJECTS = ['All', 'DSA', 'OOP', 'PF', 'AOA', 'Database', 'Web Development', 'Machine Learning', 'Software Engineering', 'Computer Networks', 'Operating Systems'];
const TYPES = ['Notes', 'Past Paper'];

export default function SharedDrive() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isMentor = user.role === 'Mentor';

    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeSubject, setActiveSubject] = useState('All');
    const [showUploadModal, setShowUploadModal] = useState(false);
    
    // Upload Form State
    const [uploadData, setUploadData] = useState({
        title: '',
        subject: 'DSA',
        type: 'Notes'
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const fetchMaterials = async (subject = 'All') => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = 'http://localhost:5000/api/materials';
            if (subject !== 'All') url += `?subject=${subject}`;
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setMaterials(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching materials:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials(activeSubject);
    }, [activeSubject]);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) return alert('Please select a file');

        setIsUploading(true);
        const formData = new FormData();
        formData.append('title', uploadData.title);
        formData.append('subject', uploadData.subject);
        formData.append('type', uploadData.type);
        formData.append('file', selectedFile);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/materials/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                setShowUploadModal(false);
                setUploadData({ title: '', subject: 'DSA', type: 'Notes' });
                setSelectedFile(null);
                fetchMaterials(activeSubject);
            } else {
                const data = await response.json();
                alert(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Error uploading:', error);
            alert('Server error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownload = (fileUrl, fileName) => {
        const link = document.createElement('a');
        link.href = `http://localhost:5000${fileUrl}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const userInitials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`;
    const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();

    return (
        <div className="font-body text-on-surface min-h-screen" style={{ backgroundColor: '#f9f9fe' }}>
            
            {/* ── Top Bar ── */}
            <header className="fixed top-0 left-0 right-0 h-20 z-40 flex items-center justify-between px-10 shadow-sm"
                style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e2e2e7' }}>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="font-headline text-xl font-bold text-primary leading-tight">Shared Drive</h1>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Academic Resources</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-sm font-bold transition-all active:scale-95 shadow-md hover:shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}
                    >
                        <span className="material-symbols-outlined text-[20px]">upload</span>
                        Upload Material
                    </button>
                    
                    <div className="h-8 w-px bg-slate-200"></div>
                    
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-xs font-bold text-primary">{fullName}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">{user.role}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm ring-2 ring-primary-fixed">
                            {userInitials}
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Main Content ── */}
            <main className="pt-32 pb-12 px-10 max-w-7xl mx-auto">
                
                {/* ── Header Section ── */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="font-headline text-4xl font-extrabold text-primary tracking-tight mb-2">Resource Library</h2>
                        <p className="text-on-surface-variant max-w-md font-medium">
                            Access notes, past papers, and study guides shared by the community.
                        </p>
                    </div>
                    
                    {/* Subject Filter Tabs */}
                    <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto max-w-full no-scrollbar">
                        {SUBJECTS.slice(0, 6).map(sub => (
                            <button
                                key={sub}
                                onClick={() => setActiveSubject(sub)}
                                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                    activeSubject === sub 
                                    ? 'bg-white text-primary shadow-sm' 
                                    : 'text-slate-500 hover:text-primary'
                                }`}
                            >
                                {sub}
                            </button>
                        ))}
                        <div className="relative group">
                            <button className="px-5 py-2 rounded-xl text-xs font-bold text-slate-500 flex items-center gap-1 hover:text-primary">
                                More <span className="material-symbols-outlined text-[16px]">expand_more</span>
                            </button>
                            <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 p-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50 min-w-[160px]">
                                {SUBJECTS.slice(6).map(sub => (
                                    <button
                                        key={sub}
                                        onClick={() => setActiveSubject(sub)}
                                        className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-600 hover:text-primary transition-colors"
                                    >
                                        {sub}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Materials Grid ── */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-sm font-bold uppercase tracking-widest">Gathering Knowledge...</p>
                    </div>
                ) : materials.length === 0 ? (
                    <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-5xl text-slate-300">folder_open</span>
                        </div>
                        <h3 className="font-headline text-2xl font-bold text-primary mb-2">No Resources Found</h3>
                        <p className="text-on-surface-variant max-w-xs mx-auto mb-8">
                            We couldn't find any materials for "{activeSubject}". Why not upload something to help others?
                        </p>
                        <button 
                            onClick={() => setShowUploadModal(true)}
                            className="px-8 py-3 bg-primary text-white font-bold rounded-xl active:scale-95 transition-all shadow-md"
                        >
                            Contribute First Note
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {materials.map((item) => (
                            <div key={item._id} className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/10 transition-all duration-300 flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-3 rounded-xl ${item.type === 'Past Paper' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                        <span className="material-symbols-outlined text-[28px]">
                                            {item.type === 'Past Paper' ? 'history_edu' : 'description'}
                                        </span>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.1em] px-3 py-1 rounded-full ${
                                        item.type === 'Past Paper' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {item.type}
                                    </span>
                                </div>
                                
                                <h4 className="font-headline text-lg font-bold text-primary mb-1 group-hover:text-primary/80 transition-colors line-clamp-1">
                                    {item.title}
                                </h4>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                    {item.subject}
                                </p>
                                
                                <div className="mt-auto pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                            {item.uploadedBy?.firstName?.[0]}{item.uploadedBy?.lastName?.[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-bold text-slate-700 truncate">
                                                {item.uploadedBy?.firstName} {item.uploadedBy?.lastName}
                                            </p>
                                            <p className="text-[9px] text-slate-400 uppercase tracking-tighter">Contributor</p>
                                        </div>
                                        <p className="ml-auto text-[9px] font-bold text-slate-300">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleDownload(item.fileUrl, item.fileName)}
                                        className="w-full py-3 bg-slate-50 hover:bg-primary hover:text-white rounded-xl text-xs font-bold text-primary transition-all flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">download</span>
                                        Download Resource
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* ── Upload Modal ── */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="font-headline text-2xl font-bold text-primary tracking-tight">Share Material</h2>
                                <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">Support the community</p>
                            </div>
                            <button onClick={() => setShowUploadModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                                <span className="material-symbols-outlined text-slate-400">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Resource Title</label>
                                <input
                                    type="text"
                                    value={uploadData.title}
                                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                                    placeholder="e.g. Midterm Prep 2024"
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/10 rounded-xl px-5 py-3.5 text-sm font-medium outline-none transition"
                                    required
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Subject</label>
                                    <select
                                        value={uploadData.subject}
                                        onChange={(e) => setUploadData({ ...uploadData, subject: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-sm font-medium outline-none cursor-pointer"
                                    >
                                        {SUBJECTS.filter(s => s !== 'All').map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Category</label>
                                    <select
                                        value={uploadData.type}
                                        onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-sm font-medium outline-none cursor-pointer"
                                    >
                                        {TYPES.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Attach Document (PDF/DOCX)</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        accept=".pdf,.docx,.doc"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        required
                                    />
                                    <div className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-8 flex flex-col items-center justify-center group-hover:border-primary/30 transition-all">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">cloud_upload</span>
                                        <p className="text-xs font-bold text-slate-500">
                                            {selectedFile ? selectedFile.name : 'Click or Drag to Upload'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isUploading}
                                className="w-full py-4 rounded-2xl text-white font-bold text-sm shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}
                            >
                                {isUploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Uploading...
                                    </>
                                ) : 'Publish Material'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
