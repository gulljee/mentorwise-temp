import React, { useState, useEffect } from 'react';

export default function TestRunner({ test, connectionId, onClose }) {
    const [timeLeft, setTimeLeft] = useState(test.durationMins * 60);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers({
            ...answers,
            [questionId]: value
        });
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        const formattedAnswers = test.questions.map(q => ({
            questionId: q._id,
            answerText: answers[q._id] || ''
        }));

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/tests/${test._id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ connectionId, answers: formattedAnswers })
            });
            const data = await res.json();
            if (data.success) {
                onClose(data.submission);
            } else {
                alert('Submission failed!');
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error(err);
            alert('Submission error!');
            setIsSubmitting(false);
        }
    };

    const timerColor = timeLeft < 60 ? 'bg-error text-white' : 'bg-surface-container-highest text-on-surface';

    return (
        <div className="fixed inset-0 z-[100] bg-surface flex flex-col font-body h-screen">
            <div className={`sticky top-0 w-full py-4 px-8 shadow-sm flex justify-between items-center z-[110] transition-colors ${timerColor}`}>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">{test.title}</h2>
                    <p className="text-xs opacity-80 uppercase tracking-widest font-bold">Assessment in Progress</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-2xl font-mono font-bold">{formatTime(timeLeft)}</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Remaining Time</span>
                    </div>
                    {timeLeft >= 60 && (
                        <button onClick={handleSubmit} disabled={isSubmitting}
                            className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:shadow-lg disabled:opacity-50 transition-all active:scale-95">
                            Submit Now
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-surface-container-low p-8">
                <div className="max-w-3xl mx-auto space-y-8 pb-24">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/10">
                        <p className="text-on-surface-variant leading-relaxed">{test.description}</p>
                    </div>

                    <div className="space-y-6">
                        {test.questions.map((q, idx) => (
                            <div key={q._id} className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/10">
                                <h3 className="text-lg font-bold text-on-surface mb-4">
                                    <span className="text-primary mr-3 bg-primary/10 px-2 py-0.5 rounded-md text-sm">Q{idx + 1}</span>
                                    {q.text}
                                </h3>

                                {q.questionType === 'mcq' ? (
                                    <div className="space-y-3 pl-2">
                                        {q.options.map((opt, oIdx) => (
                                            <label key={oIdx} className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant/20 cursor-pointer hover:bg-surface-container transition-colors has-[:checked]:bg-primary/5 has-[:checked]:border-primary/50">
                                                <input type="radio" 
                                                    name={`q-${q._id}`} 
                                                    value={opt}
                                                    checked={answers[q._id] === opt}
                                                    onChange={() => handleAnswerChange(q._id, opt)}
                                                    className="w-5 h-5 text-primary focus:ring-primary border-outline-variant/50" />
                                                <span className="text-sm font-medium text-on-surface">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <textarea 
                                        rows="4" 
                                        placeholder="Type your answer here..."
                                        value={answers[q._id] || ''}
                                        onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                        className="w-full border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {timeLeft < 60 && (
                <div className="fixed bottom-0 left-0 w-full p-4 bg-surface shadow-2xl border-t border-error/20 flex justify-center z-[110]">
                    <button onClick={handleSubmit} disabled={isSubmitting}
                        className="bg-error text-white px-12 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:bg-red-700 animate-pulse transition">
                        {isSubmitting ? 'Submitting...' : 'Time is almost up! Submit Test'}
                    </button>
                </div>
            )}
        </div>
    );
}
