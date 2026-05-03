// Reusable star rating widget — submit a 1–5 star review with optional comment
import { useState, useEffect } from 'react';

export default function StarRating({ connectionId, targetName }) {
    const [hover,         setHover]         = useState(0);
    const [selected,      setSelected]      = useState(0);
    const [comment,       setComment]       = useState('');
    const [open,          setOpen]          = useState(false);
    const [submitting,    setSubmitting]    = useState(false);
    const [submitted,     setSubmitted]     = useState(false);
    const [error,         setError]         = useState('');

    const token = localStorage.getItem('token');

    // Load existing rating on mount
    useEffect(() => {
        if (!connectionId) return;
        fetch(`http://localhost:5000/api/ratings/connection/${connectionId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                if (data.success && data.rating) {
                    setSelected(data.rating.stars);
                    setComment(data.rating.comment || '');
                    setSubmitted(true);
                }
            })
            .catch(() => {});
    }, [connectionId]);

    const handleSubmit = async () => {
        if (!selected) return;
        setSubmitting(true);
        setError('');
        try {
            const res = await fetch(`http://localhost:5000/api/ratings/${connectionId}`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body:    JSON.stringify({ stars: selected, comment })
            });
            const data = await res.json();
            if (data.success) {
                setSubmitted(true);
                setOpen(false);
            } else {
                setError(data.message || 'Failed to submit rating.');
            }
        } catch {
            setError('Server error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const starLabel = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

    return (
        <div className="relative">
            {/* Trigger button */}
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-1.5 text-xs font-bold transition-all px-3 py-1.5 rounded-lg ${
                    submitted
                        ? 'bg-secondary-fixed text-on-secondary-fixed'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
            >
                {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} className={`text-base leading-none ${s <= selected ? 'text-amber-400' : 'text-outline-variant'}`}>★</span>
                ))}
                <span className="ml-1">{submitted ? 'Rated' : 'Rate'}</span>
            </button>

            {/* Dropdown panel */}
            {open && (
                <div className="absolute bottom-full mb-2 left-0 z-50 bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10 shadow-2xl w-64"
                    style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                            Rate {targetName?.split(' ')[0]}
                        </p>
                        <button onClick={() => setOpen(false)} className="text-outline hover:text-on-surface transition">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map(s => (
                            <button
                                key={s}
                                onMouseEnter={() => setHover(s)}
                                onMouseLeave={() => setHover(0)}
                                onClick={() => setSelected(s)}
                                className="text-3xl leading-none transition-transform hover:scale-125 active:scale-110"
                            >
                                <span className={`${s <= (hover || selected) ? 'text-amber-400' : 'text-outline-variant'}`}>★</span>
                            </button>
                        ))}
                    </div>
                    {(hover || selected) > 0 && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">
                            {starLabel[hover || selected]}
                        </p>
                    )}

                    {/* Comment */}
                    <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Add a comment (optional)..."
                        rows={2}
                        className="w-full bg-surface-container-low border-none rounded-xl px-3 py-2 text-on-surface text-xs outline-none resize-none focus:ring-2 focus:ring-primary/20 mb-3"
                    />

                    {error && <p className="text-error text-[10px] mb-2">{error}</p>}

                    <button
                        onClick={handleSubmit}
                        disabled={!selected || submitting}
                        className="w-full py-2.5 rounded-xl text-white text-xs font-bold transition-all disabled:opacity-40"
                        style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}
                    >
                        {submitting ? 'Submitting...' : submitted ? 'Update Rating' : 'Submit Rating'}
                    </button>
                </div>
            )}
        </div>
    );
}
