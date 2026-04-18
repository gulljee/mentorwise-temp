import { useState, useEffect } from 'react';

export default function UserRatingBadge({ userId, className = '' }) {
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!userId) return;
        const token = localStorage.getItem('token');
        fetch(`http://localhost:5000/api/ratings/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(res => {
                if (res.success) {
                    setData({ average: res.average, count: res.count });
                }
            })
            .catch(() => {});
    }, [userId]);

    if (!data) return null;

    if (data.count === 0) {
        return (
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold text-outline ${className}`}>
                <span className="text-amber-400 leading-none">★</span>
                New
            </span>
        );
    }

    return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${className}`}>
            <span className="text-amber-400 leading-none text-sm">★</span>
            <span className="text-on-surface">{data.average.toFixed(1)}</span>
            <span className="text-outline/60">({data.count})</span>
        </span>
    );
}
