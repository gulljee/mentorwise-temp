import React from 'react';

const TranscriptCard = ({ transcript }) => {
    const { mentor, academicGrade, behaviorRating, punctualityRating, remarks, createdAt } = transcript;
    
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl transition-all hover:scale-[1.02] duration-500 group"
            style={{ 
                border: '1px solid rgba(184, 134, 11, 0.2)',
                background: 'linear-gradient(135deg, #ffffff 0%, #fcf9f0 100%)'
            }}>
            
            {/* Elegant Corner Ornaments */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-yellow-600/20 rounded-tl-3xl"></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-yellow-600/20 rounded-tr-3xl"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-yellow-600/20 rounded-bl-3xl"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-yellow-600/20 rounded-br-3xl"></div>

            {/* Background Texture/Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                style={{ backgroundImage: 'radial-gradient(#b8860b 1px, transparent 0)', backgroundSize: '24px 24px' }}>
            </div>

            <div className="relative p-10 flex flex-col items-center text-center">
                
                {/* Header Section */}
                <div className="mb-6 flex flex-col items-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-full flex items-center justify-center text-white shadow-lg mb-4 ring-4 ring-yellow-100">
                        <span className="material-symbols-outlined text-4xl">verified_user</span>
                    </div>
                    <h2 className="font-headline text-3xl font-bold text-gray-900 tracking-tight">Academic Transcript</h2>
                    <p className="text-yellow-700 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">MentorWise Certified Achievement</p>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-600/20 to-transparent mb-8"></div>

                {/* Grade Section */}
                <div className="flex justify-between w-full mb-8">
                    <div className="flex flex-col items-center justify-center w-1/2 border-r border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Grade</span>
                        <div className="text-5xl font-extrabold text-yellow-800 tracking-tighter">{academicGrade}</div>
                    </div>
                    <div className="flex flex-col justify-center items-center w-1/2 space-y-3">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Behavior</span>
                            <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: i < behaviorRating ? "'FILL' 1" : "'FILL' 0" }}>
                                        star
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Punctuality</span>
                            <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: i < punctualityRating ? "'FILL' 1" : "'FILL' 0" }}>
                                        star
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Remarks Section */}
                <div className="w-full mb-8 text-left bg-white/50 p-6 rounded-2xl border border-yellow-600/5 italic">
                    <span className="material-symbols-outlined text-yellow-700/20 absolute -top-2 -left-2 text-4xl">format_quote</span>
                    <p className="text-gray-600 leading-relaxed text-sm relative z-10">
                        {remarks}
                    </p>
                </div>

                {/* Footer Section */}
                <div className="w-full flex justify-between items-end pt-6 border-t border-gray-100">
                    <div className="text-left">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Mentor</p>
                        <p className="text-sm font-bold text-gray-900">{mentor?.firstName} {mentor?.lastName}</p>
                        <p className="text-[10px] text-gray-500">{mentor?.department} · Batch {mentor?.batch}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date Issued</p>
                        <p className="text-sm font-bold text-gray-900">{formatDate(createdAt)}</p>
                    </div>
                </div>

                {/* Digital Stamp */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-[0.05] pointer-events-none">
                    <div className="w-32 h-32 border-8 border-yellow-800 rounded-full flex items-center justify-center rotate-12">
                        <span className="font-headline font-black text-yellow-900 text-center leading-none">OFFICIAL<br/>SEAL</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TranscriptCard;
