import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="bg-surface text-on-surface font-body antialiased">

            <nav className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-xl">
                <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
                    <div 
                        className="text-2xl font-extrabold tracking-tighter text-blue-900 cursor-pointer"
                        onClick={() => navigate("/")}
                    >
                        Mentor Wise
                    </div>
                    <div className="hidden md:flex items-center space-x-8 font-semibold text-sm tracking-tight">
                        <a className="text-slate-600 hover:text-blue-900 transition-colors" href="#process">How it Works</a>
                        <a className="text-slate-600 hover:text-blue-900 transition-colors" href="#benefits">Benefits</a>
                        <a className="text-slate-600 hover:text-blue-900 transition-colors" href="#footer">Contact</a>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate("/login")}
                            className="px-5 py-2 text-sm font-semibold text-blue-900 transition-all hover:bg-slate-100/50 rounded-lg"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => navigate("/signup")}
                            className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-br from-primary to-primary-container text-white rounded-md shadow-lg shadow-primary/10 hover:scale-95 transition-all"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </nav>

            <main>
                <section className="relative min-h-screen flex items-center pt-20 px-8 bg-surface overflow-hidden">
                    <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
                        <div className="z-10">
                            <span className="inline-block py-1 px-3 mb-6 text-[10px] font-bold tracking-[0.2em] uppercase bg-secondary-fixed text-on-secondary-fixed rounded-full">
                                Academic Excellence
                            </span>
                            <h1 className="font-headline text-6xl md:text-7xl font-extrabold text-primary leading-[1.1] tracking-tight mb-8">
                                Bridge the Gap <br />
                                <span className="text-primary-container">Between Ambition</span> and Experience
                            </h1>
                            <p className="text-lg text-on-surface-variant max-w-lg mb-10 leading-relaxed">
                                Connect with seasoned seniors who have walked your path. Gain the clarity, confidence, and network needed to excel in your university journey and beyond.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => navigate("/signup")}
                                    className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-md hover:shadow-xl transition-all scale-100 active:scale-95"
                                >
                                    Get Started
                                </button>
                                <button
                                    onClick={() => document.getElementById("process").scrollIntoView({ behavior: "smooth" })}
                                    className="px-8 py-4 bg-transparent border border-outline-variant/30 text-primary font-bold rounded-md hover:bg-surface-container-low transition-all"
                                >
                                    Learn More
                                </button>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -top-20 -right-20 w-96 h-96 bg-secondary-fixed/20 rounded-full blur-3xl"></div>
                            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-700">
                                <img
                                    alt="Students collaborating"
                                    className="w-full h-[500px] object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdsfZbGu3GDS4Gs0cmFlLxmyWEcvJa4e7hJ_TJlFHoNv5TTaCZIJ5bKbEMma1GloxIjn26uQcuyNL5GwuZhcRCxaOW9fNRhuagBmcUtEnf4Z-jEswGwO2_iFDgINqgJpXPPXTV7QLbImes-UiF9hp55rTNaYsuAAqTZLj-NGgq5dR94669ReYJLiz3cv9q-9NBa4RZ8RWZ7jTtdzHKAdim-LWdtYgkNcIbu_WRzrRmbFABL_-dVNkOCwPAszDmlwhu37xgTz4OEV0"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"></div>
                            </div>

                            <div className="absolute -bottom-6 -left-12 z-20 bg-surface-container-lowest p-6 rounded-xl shadow-2xl max-w-[240px] border border-outline-variant/10">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="material-symbols-outlined text-secondary text-3xl">star</span>
                                    <span className="text-primary font-bold text-xl">4.9/5</span>
                                </div>
                                <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">
                                    Average Student Satisfaction Rate
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="process" className="py-32 px-8 bg-surface-container-lowest overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                            <div className="max-w-xl">
                                <span className="uppercase tracking-widest text-secondary font-bold text-sm">The Process</span>
                                <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-primary mt-4">Three Steps to Mastery</h2>
                                <p className="mt-6 text-on-surface-variant text-lg">
                                    We've streamlined the connection between expertise and ambition. Your journey to excellence starts here.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="relative group">
                                <div className="aspect-[4/5] bg-surface-container-low rounded-3xl p-10 flex flex-col justify-between transition-all duration-500 hover:bg-primary group-hover:shadow-2xl hover:-translate-y-2">
                                    <div className="relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-10 group-hover:bg-primary-container">
                                            <span className="material-symbols-outlined text-primary text-3xl group-hover:text-white">person_add</span>
                                        </div>
                                        <h3 className="font-headline text-2xl font-extrabold text-primary mb-4 group-hover:text-white">Create Profile</h3>
                                        <p className="text-on-surface-variant group-hover:text-blue-100 leading-relaxed">
                                            Join our exclusive community. Share your academic goals and interests to find the perfect match.
                                        </p>
                                    </div>
                                    <div className="relative z-10 flex items-center justify-between">
                                        <span className="text-6xl font-black text-outline-variant/20 group-hover:text-white/10">01</span>
                                        <span className="material-symbols-outlined text-outline-variant group-hover:text-white transition-transform group-hover:translate-x-2">arrow_forward</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="aspect-[4/5] bg-secondary-fixed/10 rounded-3xl p-10 flex flex-col justify-between transition-all duration-500 hover:bg-secondary-fixed group-hover:shadow-2xl hover:-translate-y-2 border border-secondary-fixed/20">
                                    <div className="relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-10 group-hover:bg-secondary-container">
                                            <span className="material-symbols-outlined text-secondary text-3xl">search</span>
                                        </div>
                                        <h3 className="font-headline text-2xl font-extrabold text-primary mb-4">Find a Mentor</h3>
                                        <p className="text-on-surface-variant leading-relaxed group-hover:text-on-secondary-fixed">
                                            Browse senior expertise across departments. Filter by research interests, industry goals, or challenges.
                                        </p>
                                        <div className="mt-8 flex -space-x-3 items-center">
                                            <img alt="avatar" className="w-10 h-10 rounded-full border-2 border-white object-cover"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFKt2sUquIjwXWYdPIHbXGRw7mf8slZh8JYZnlPGRmbwlzpSaTrGK6l9ejC3U0fV-FCBVeIGLv4S7vW9lBj5mCNOV-tkuetPqm4W2dFdl5MchgAt8ndVXWHHeqGQ937LYcecBZIm60iKVvLo9rHaHRdzlhmbH8khTy7QbkCXZDA0n-UxW3JtuIRhjFDKCflpIVtA4okcMKUP6BiHo2T1MEgiBjLxSDpBYuVh_kwnoe4xityLCLgDvIH_UcgARNBctMTabn11mFHXA" />
                                            <img alt="avatar" className="w-10 h-10 rounded-full border-2 border-white object-cover"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQGEgoyg5ErvditCNzxWtPBUvBBHqrnGJ_6o1n9tBd3sCb82Bkh97vOJm06mMVu3OGHnuY97DlinoRUaoX5nPVThQGNDc_7mxTAaTIXvDDuFf-KVZVKvPqt8pWSAwpdIXfxciUSmIh0KRfruTm8N2IthTdi_JJX82s5BOnMkgGJsyWXk_YQ2Slx2A1Oemo2JVIVEBgZzIZB7bPI8YRoXK7TM67bBHK80R3M4JGSQXRT_8QK4dITXC2m5NF8j7RRvpN6MqXm378xM4" />
                                            <div className="w-10 h-10 rounded-full border-2 border-white bg-white flex items-center justify-center text-[10px] font-bold text-primary">+200</div>
                                        </div>
                                    </div>
                                    <div className="relative z-10 flex items-center justify-between">
                                        <span className="text-6xl font-black text-secondary-fixed-dim/40 group-hover:text-on-secondary-fixed/10">02</span>
                                        <span className="material-symbols-outlined text-secondary group-hover:text-on-secondary-fixed transition-transform group-hover:translate-x-2">arrow_forward</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="aspect-[4/5] bg-primary-container rounded-3xl p-10 flex flex-col justify-between transition-all duration-500 hover:scale-[1.02] group-hover:shadow-2xl border border-white/10">
                                    <div className="relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-10">
                                            <span className="material-symbols-outlined text-primary text-3xl">handshake</span>
                                        </div>
                                        <h3 className="font-headline text-2xl font-extrabold text-white mb-4">Start Collaborating</h3>
                                        <p className="text-blue-100/80 leading-relaxed">
                                            Schedule sessions, share resources, and tackle university challenges together with your ally.
                                        </p>
                                    </div>
                                    <div className="relative z-10 flex items-center justify-between">
                                        <span className="text-6xl font-black text-white/10">03</span>
                                        <span className="material-symbols-outlined text-white transition-transform group-hover:translate-x-2">arrow_forward</span>
                                    </div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-fixed/10 rounded-bl-full -mr-16 -mt-16 group-hover:bg-secondary-fixed/20 transition-colors"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="benefits" className="py-32 px-8 bg-surface">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-24 items-start">

                            <div className="space-y-12">
                                <div className="relative inline-block">
                                    <h2 className="font-headline text-4xl font-extrabold text-primary mb-2">For Mentees</h2>
                                    <div className="h-1.5 w-2/3 bg-secondary-fixed absolute -bottom-2 -left-2 -z-10"></div>
                                </div>
                                <p className="text-lg text-on-surface-variant leading-relaxed">
                                    Transitioning to higher levels of academia doesn't have to be overwhelming. Get the roadmap from someone who recently navigated it.
                                </p>
                                <div className="space-y-8">
                                    <div className="flex gap-6 items-start">
                                        <div className="p-3 bg-surface-container rounded-lg flex-shrink-0">
                                            <span className="material-symbols-outlined text-primary">moving</span>
                                        </div>
                                        <div>
                                            <h4 className="font-headline text-xl font-bold text-primary mb-1">Navigate Transitions</h4>
                                            <p className="text-on-surface-variant">Smooth out the bumps between high school and uni, or junior and senior years.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6 items-start">
                                        <div className="p-3 bg-surface-container rounded-lg flex-shrink-0">
                                            <span className="material-symbols-outlined text-primary">lightbulb</span>
                                        </div>
                                        <div>
                                            <h4 className="font-headline text-xl font-bold text-primary mb-1">Gain Peer Insights</h4>
                                            <p className="text-on-surface-variant">Practical advice on campus life, professor expectations, and hidden resources.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6 items-start">
                                        <div className="p-3 bg-surface-container rounded-lg flex-shrink-0">
                                            <span className="material-symbols-outlined text-primary">auto_stories</span>
                                        </div>
                                        <div>
                                            <h4 className="font-headline text-xl font-bold text-primary mb-1">Academic Support</h4>
                                            <p className="text-on-surface-variant">Focus your study efforts where they matter most based on peer-tested strategies.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 md:mt-24 space-y-12 p-12 bg-surface-container-low rounded-3xl border border-outline-variant/10">
                                <div className="relative inline-block">
                                    <h2 className="font-headline text-4xl font-extrabold text-primary mb-2">For Mentors</h2>
                                    <div className="h-1.5 w-2/3 bg-primary-container absolute -bottom-2 -left-2 -z-10 opacity-20"></div>
                                </div>
                                <p className="text-lg text-on-surface-variant leading-relaxed">
                                    Refine your leadership skills and build a legacy by helping the next generation of students succeed.
                                </p>
                                <div className="space-y-8">
                                    <div className="flex gap-6 items-start group">
                                        <div className="p-3 bg-white rounded-lg shadow-sm group-hover:bg-primary transition-colors flex-shrink-0">
                                            <span className="material-symbols-outlined text-primary group-hover:text-white">leaderboard</span>
                                        </div>
                                        <div>
                                            <h4 className="font-headline text-xl font-bold text-primary mb-1">Leadership Experience</h4>
                                            <p className="text-on-surface-variant">Hone your management and coaching skills, highly valued by future employers.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6 items-start group">
                                        <div className="p-3 bg-white rounded-lg shadow-sm group-hover:bg-primary transition-colors flex-shrink-0">
                                            <span className="material-symbols-outlined text-primary group-hover:text-white">hub</span>
                                        </div>
                                        <div>
                                            <h4 className="font-headline text-xl font-bold text-primary mb-1">Network Growth</h4>
                                            <p className="text-on-surface-variant">Connect with high-potential juniors and fellow senior mentors across faculties.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6 items-start group">
                                        <div className="p-3 bg-white rounded-lg shadow-sm group-hover:bg-primary transition-colors flex-shrink-0">
                                            <span className="material-symbols-outlined text-primary group-hover:text-white">volunteer_activism</span>
                                        </div>
                                        <div>
                                            <h4 className="font-headline text-xl font-bold text-primary mb-1">Give Back</h4>
                                            <p className="text-on-surface-variant">Make a tangible difference in a fellow student's life and university experience.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                <section className="py-24 px-8">
                    <div className="max-w-5xl mx-auto bg-gradient-to-br from-primary to-primary-container rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            <img
                                alt="Pattern"
                                className="w-full h-full object-cover"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbeIGqbwuFvupd2L8Aq3AdNhm0duOz0ZPi1GW0D364BXak1M3xVrMfn5ayB4RpDAPYJfgCJlfMTFarpvU2m3_ndKzu_4IhSSY5GEOopayoc0VB_0VxAdVSSHfrBunPb5pigQomX7kZzGiAfhXa2DoX-AzEhUeyeSzFbpB6vApGe7gXfhttBhRc3uoAUgUeGgWk49qEjBUEQgY6cTogTItPdkkQTkE-1li7J03JbnEkbxR9b6x4jFy5gtaFqqR06YOnNHJZvse7Q3A"
                            />
                        </div>
                        <div className="relative z-10">
                            <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to start your journey?</h2>
                            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
                                Join thousands of students building a more supportive, collaborative academic community today.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => navigate("/signup")}
                                    className="px-10 py-4 bg-secondary-fixed text-on-secondary-fixed font-bold rounded-md hover:shadow-xl transition-all"
                                >
                                    Join as Mentee
                                </button>
                                <button
                                    onClick={() => navigate("/signup")}
                                    className="px-10 py-4 bg-white text-primary font-bold rounded-md hover:bg-slate-50 transition-all"
                                >
                                    Become a Mentor
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer id="footer" className="w-full py-8 bg-slate-50 border-t border-slate-200/50">
                <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-6">
                    <div className="flex items-center gap-4">
                        <div 
                            className="text-lg font-bold text-blue-900 cursor-pointer"
                            onClick={() => navigate("/")}
                        >
                            Mentor Wise
                        </div>
                        <span className="hidden md:block h-4 w-px bg-slate-300"></span>
                        <p className="text-xs text-slate-500">© 2026 Mentor Wise. The Scholarly Atelier.</p>
                    </div>
                    <div className="flex items-center gap-8">
                        <ul className="flex space-x-6 text-xs text-slate-500">
                            <li><a className="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Terms of Service</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Contact</a></li>
                        </ul>
                    </div>
                </div>
            </footer>


        </div>
    );
}
