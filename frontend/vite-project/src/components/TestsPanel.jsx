import React, { useState, useEffect } from 'react';
import TestRunner from './TestRunner';

export default function TestsPanel({ connectionId, isMentor, person }) {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    
    // Create new test form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [durationMins, setDurationMins] = useState(15);
    const [questions, setQuestions] = useState([]);
    const [activeTest, setActiveTest] = useState(null); // Full screen run for mentee

    const [expandedTestId, setExpandedTestId] = useState(null);
    const [gradeInput, setGradeInput] = useState('');
    const [feedbackInput, setFeedbackInput] = useState('');

    const token = localStorage.getItem('token');

    const fetchTests = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/tests/${connectionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setTests(data.tests);
            }
        } catch (err) {
            console.error('Fetch tests error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (connectionId) fetchTests();
    }, [connectionId]);

    const handleAddQuestion = (type) => {
        if (type === 'mcq') {
            setQuestions([...questions, { questionType: 'mcq', text: '', options: ['', '', '', ''], correctAnswer: '' }]);
        } else {
            setQuestions([...questions, { questionType: 'short', text: '' }]);
        }
    };

    const handleQuestionChange = (index, key, value) => {
        const newQ = [...questions];
        newQ[index][key] = value;
        setQuestions(newQ);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQ = [...questions];
        newQ[qIndex].options[oIndex] = value;
        setQuestions(newQ);
    };

    const handleCreateTest = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:5000/api/tests/${connectionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ title, description, durationMins, questions })
            });
            const data = await res.json();
            if (data.success) {
                setTests([data.test, ...tests]);
                setShowCreate(false);
                setTitle(''); setDescription(''); setDurationMins(15); setQuestions([]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleGrade = async (submissionId, testId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/tests/grade/${submissionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ score: gradeInput, feedback: feedbackInput })
            });
            const data = await res.json();
            if (data.success) {
                setTests(tests.map(t => t._id === testId ? { ...t, submission: data.submission } : t));
                setGradeInput('');
                setFeedbackInput('');
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (activeTest) {
        return (
            <TestRunner 
                test={activeTest} 
                connectionId={connectionId} 
                onClose={(submission) => { 
                    setActiveTest(null); 
                    if(submission) {
                        setTests(tests.map(t => t._id === activeTest._id ? { ...t, submission } : t));
                    }
                }} 
            />
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-10 bg-surface-container-low min-w-0">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/10">
                    <div>
                        <h2 className="text-2xl font-bold text-primary mb-1">Assessment Center</h2>
                        <p className="text-sm text-on-surface-variant">Evaluate progress through custom tests and quizzes.</p>
                    </div>
                    {isMentor && (
                        <button
                            onClick={() => setShowCreate(!showCreate)}
                            className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-primary/90 transition-colors"
                        >
                            {showCreate ? 'Cancel' : 'Create New Assessment'}
                        </button>
                    )}
                </div>

                {isMentor && showCreate && (
                    <form onSubmit={handleCreateTest} className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/10 space-y-6">
                        <h3 className="text-xl font-bold text-primary">New Test Configuration</h3>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Test Title</label>
                                <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Duration (minutes)</label>
                                <input required type="number" min="1" value={durationMins} onChange={(e) => setDurationMins(e.target.value)}
                                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Description / Instructions</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="2"
                                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                        </div>

                        <div className="border-t border-outline-variant/10 pt-6 space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="text-lg font-bold text-on-surface">Questions</h4>
                                <div className="space-x-3">
                                    <button type="button" onClick={() => handleAddQuestion('mcq')} className="text-sm font-bold text-secondary-fixed hover:underline bg-secondary-fixed/10 px-3 py-1.5 rounded-lg active:scale-95">
                                        + Add MCQ
                                    </button>
                                    <button type="button" onClick={() => handleAddQuestion('short')} className="text-sm font-bold text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-lg active:scale-95">
                                        + Add Short Q
                                    </button>
                                </div>
                            </div>

                            {questions.map((q, qIndex) => (
                                <div key={qIndex} className="p-5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 relative">
                                    <button type="button" onClick={() => setQuestions(questions.filter((_, i) => i !== qIndex))} className="absolute top-4 right-4 text-error font-bold text-xs p-2 hover:bg-error/10 rounded-md">Remove</button>
                                    <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">Question {qIndex + 1} ({q.questionType.toUpperCase()})</span>
                                    <input required type="text" placeholder="Enter question..." value={q.text} onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                                        className="w-full bg-white border border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface mb-3 outline-none" />
                                    
                                    {q.questionType === 'mcq' && (
                                        <div className="space-y-3">
                                            <p className="text-xs font-bold text-on-surface-variant">Options</p>
                                            {q.options.map((opt, oIndex) => (
                                                <div key={oIndex} className="flex items-center gap-3 ml-4">
                                                    <input required type="text" placeholder={`Option ${oIndex + 1}`} value={opt} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                        className="flex-1 bg-white border border-outline-variant/30 rounded-lg px-3 py-2 text-sm outline-none" />
                                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-on-surface-variant w-32">
                                                        <input type="radio" name={`correct-${qIndex}`} checked={q.correctAnswer === opt && opt !== ''} onChange={() => handleQuestionChange(qIndex, 'correctAnswer', opt)} className="text-primary w-4 h-4 cursor-pointer" />
                                                        Correct
                                                    </label>
                                                </div>
                                            ))}
                                            {(!q.correctAnswer) && <p className="text-[10px] text-error ml-4 mt-1 bg-error/10 p-1 rounded inline-block">Please select a correct answer.</p>}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button type="submit" disabled={questions.length === 0}
                            className="w-full py-4 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}>
                            Publish Assessment
                        </button>
                    </form>
                )}

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-20 text-on-surface-variant">Loading assessments...</div>
                    ) : tests.length === 0 ? (
                        <div className="bg-white rounded-3xl p-16 text-center border border-outline-variant/10 shadow-sm">
                            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">quiz</span>
                            <h3 className="text-xl font-bold text-on-surface mb-2">No Assessments Yet</h3>
                            <p className="text-on-surface-variant text-sm">Tests and assignments will appear here once created.</p>
                        </div>
                    ) : (
                        tests.map(test => {
                            const isExpanded = expandedTestId === test._id;
                            const isSubmitted = !!test.submission;
                            const isGraded = test.submission?.status === 'graded';
                            
                            let badge = <span className="bg-surface-container text-on-surface-variant px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Not Started</span>;
                            if (isSubmitted) badge = <span className="bg-secondary-fixed/50 text-indigo-800 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Submitted</span>;
                            if (isGraded) badge = <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Graded</span>;

                            return (
                                <div key={test._id} className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/10 hover:border-primary/30 transition-colors">
                                    <div className="flex justify-between items-start mb-4 cursor-pointer" onClick={() => setExpandedTestId(isExpanded ? null : test._id)}>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                {badge}
                                                <span className="text-xs text-on-surface-variant flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">timer</span> {test.durationMins} mins
                                                </span>
                                            </div>
                                            <h4 className="text-xl font-bold text-on-surface">{test.title}</h4>
                                        </div>
                                        <div className="text-outline-variant material-symbols-outlined transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : '' }}>
                                            expand_more
                                        </div>
                                    </div>
                                    
                                    {isExpanded && (
                                        <div className="border-t border-outline-variant/15 mt-4 pt-4">
                                            <p className="text-sm text-on-surface-variant mb-6">{test.description}</p>
                                            
                                            {!isMentor && !isSubmitted && (
                                                <button onClick={() => setActiveTest(test)} 
                                                    className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary/90 transition-colors active:scale-95 flex justify-center items-center gap-2">
                                                    <span className="material-symbols-outlined text-sm">play_circle</span> Start Assessment
                                                </button>
                                            )}

                                            {(!isMentor && isSubmitted) && (
                                                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
                                                    <h5 className="font-bold text-sm text-on-surface mb-2">Your Submission</h5>
                                                    <p className="text-xs text-on-surface-variant mb-4">You have already submitted this assessment.</p>
                                                    {isGraded ? (
                                                        <div className="bg-white border-l-4 border-primary p-4 rounded-r-xl shadow-sm">
                                                            <p className="font-bold text-primary mb-1 text-lg">{test.submission.score}</p>
                                                            <p className="text-sm text-on-surface-variant">{test.submission.feedback}</p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-on-surface-variant italic">Waiting for mentor review...</p>
                                                    )}
                                                </div>
                                            )}

                                            {(isMentor && isSubmitted) && (
                                                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 mt-4">
                                                    <h5 className="font-bold text-lg text-primary mb-4 border-b border-outline-variant/10 pb-2">Student Answers</h5>
                                                    <div className="space-y-6">
                                                        {test.questions.map((q, idx) => {
                                                            const ans = test.submission.answers.find(a => a.questionId === q._id);
                                                            const answerText = ans ? ans.answerText : 'NO ANSWER';
                                                            const isCorrect = ans ? ans.isCorrect : false;
                                                            return (
                                                                <div key={q._id} className="bg-white p-4 rounded-lg shadow-sm border border-outline-variant/5">
                                                                    <p className="font-bold text-sm mb-2"><span className="text-primary mr-2">Q{idx+1}.</span>{q.text}</p>
                                                                    {q.questionType === 'mcq' ? (
                                                                        <div className="text-sm">
                                                                            <p>Student marked: <span className={`font-bold ${isCorrect ? 'text-green-600' : 'text-error'}`}>{answerText}</span></p>
                                                                            {!isCorrect && <p className="text-xs text-on-surface-variant mt-1">Correct Answer: {q.correctAnswer}</p>}
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-sm text-on-surface bg-surface-container p-3 rounded">{answerText}</p>
                                                                    )}
                                                                </div>
                                                            )
                                                        })}
                                                    </div>

                                                    <div className="mt-8 border-t border-outline-variant/15 pt-6">
                                                        <h5 className="font-bold text-sm text-on-surface mb-3 tracking-widest uppercase">Grading & Feedback</h5>
                                                        {isGraded ? (
                                                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                                                                <p className="font-bold text-primary text-xl mb-1">{test.submission.score}</p>
                                                                <p className="text-sm text-on-surface">{test.submission.feedback}</p>
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                                <input type="text" placeholder="Score (e.g. A, 85/100)" value={gradeInput} onChange={(e)=>setGradeInput(e.target.value)}
                                                                    className="col-span-1 border border-outline-variant/30 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                                                                <input type="text" placeholder="Feedback notes..." value={feedbackInput} onChange={(e)=>setFeedbackInput(e.target.value)}
                                                                    className="col-span-2 border border-outline-variant/30 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                                                                <button onClick={() => handleGrade(test.submission._id, test._id)} disabled={!gradeInput && !feedbackInput}
                                                                    className="col-span-1 bg-secondary-fixed text-on-secondary-fixed font-bold rounded-xl shadow-sm disabled:opacity-50">Save Grade</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {(isMentor && !isSubmitted) && (
                                                <p className="text-sm text-on-surface-variant italic mt-2">No submission from the student yet.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
