import React, { useState, useRef, useEffect } from 'react';

export default function AIAssistant({ variant = 'floating' }) {
    const isFloating = variant === 'floating';
    const [isOpen, setIsOpen] = useState(!isFloating); // Start open if inline
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your MentorWise AI consultant. How can I help you support your mentees today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
                })
            });

            const data = await response.json();
            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please make sure the API key is configured on the server.' }]);
            }
        } catch (error) {
            console.error('AI chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Connection failed. Please check your network or server.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const containerStyle = isFloating 
        ? "fixed bottom-8 right-8 z-[100] flex flex-col items-end" 
        : "h-full w-full flex flex-col bg-white overflow-hidden";

    const chatWindowStyle = isFloating
        ? "bg-surface-container-lowest w-80 sm:w-96 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-outline-variant/20 mb-4 overflow-hidden flex flex-col transition-all duration-300 transform origin-bottom-right"
        : "flex-1 flex flex-col overflow-hidden";

    const messengerHeight = isFloating ? "450px" : "100%";

    return (
        <div className={containerStyle}>
            
            {/* Chat Window */}
            {(isOpen || !isFloating) && (
                <div className={chatWindowStyle} style={isFloating ? { height: messengerHeight, maxHeight: '70vh' } : {}}>
                    {/* Header - Only for floating */}
                    {isFloating && (
                        <div className="bg-primary text-white p-4 flex justify-between items-center shadow-md z-10" style={{ background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center p-2">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                        <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                                        <circle cx="12" cy="12" r="3" fill="#1A4B84"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm leading-tight">Mentor AI Consultant</h3>
                                    <p className="text-[10px] text-white/70 uppercase tracking-wider">Always Online</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors active:scale-95">
                                <span className="material-symbols-outlined text-sm block">close</span>
                            </button>
                        </div>
                    )}

                    {/* Desktop Header for Tab variant */}
                    {!isFloating && (
                        <div className="px-10 py-6 border-b border-outline-variant/10">
                            <h2 className="text-2xl font-bold text-primary">AI Academic Consultant</h2>
                            <p className="text-sm text-on-surface-variant italic">Powered by Gemini 2.5 • Expert Mentorship Guidance</p>
                        </div>
                    )}

                    {/* Messages Body */}
                    <div className={`flex-1 overflow-y-auto space-y-4 ${!isFloating ? 'bg-surface-container-low/30 p-10' : 'bg-surface-container-lowest/50 p-4'}`}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-sm ${
                                    msg.role === 'user' 
                                        ? 'bg-primary text-white rounded-br-none' 
                                        : 'bg-white text-on-surface border border-outline-variant/10 rounded-bl-none'
                                }`}>
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-outline-variant/10 text-on-surface rounded-2xl rounded-bl-none p-4 w-16 shadow-sm flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className={`${!isFloating ? 'p-10 border-t border-outline-variant/10' : 'p-3 bg-surface-container-lowest border-t border-outline-variant/10'}`}>
                        <form onSubmit={handleSend} className="flex items-center gap-4 relative max-w-4xl mx-auto">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Consult the AI on academic strategy, quiz creation, or mentoring advice..."
                                className={`flex-1 border border-outline-variant/30 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all text-on-surface ${!isFloating ? 'px-6 py-4' : 'px-4 pr-12 py-3 text-sm'}`}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className={`${!isFloating ? 'bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2' : 'absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg'}`}
                            >
                                <span className={`material-symbols-outlined ${!isFloating ? 'text-lg' : 'text-[16px]'}`} style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                                {!isFloating && <span>Send Inquiry</span>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Toggle Button - Only for floating */}
            {isFloating && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 ${isOpen ? 'bg-surface-container-high text-on-surface' : 'bg-primary text-white'}`}
                    style={!isOpen ? { background: 'linear-gradient(135deg, #003466 0%, #1a4b84 100%)' } : {}}
                >
                    {isOpen ? (
                        <span className="material-symbols-outlined text-3xl">keyboard_arrow_down</span>
                    ) : (
                        <div className="w-8 h-8">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                                <circle cx="12" cy="12" r="3" fill="#1A4B84"/>
                            </svg>
                        </div>
                    )}
                </button>
            )}
        </div>
    );
}
