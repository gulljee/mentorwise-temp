import React, { useState } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setIsLoading(true);
            setError("");

            const res = await fetch("http://localhost:5000/api/auth/google/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Google login failed.");
                setIsLoading(false);
                return;
            }

            if (data.userExists) {
                setSuccess("Login successful!");
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                setTimeout(() => {
                    const dest = data.user.role === 'Mentor' ? '/dashboard/mentor' : '/dashboard/mentee';
                    navigate(dest);
                }, 1000);
            } else {
                navigate('/google-onboarding', { state: { googleData: data.googleData } });
            }

        } catch (err) {
            setError("Server error. Try again later.");
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError("Google login failed. Please try again.");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Login failed.");
            } else {
                setSuccess("Login successful!");

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

    return (
        <div className="bg-surface text-on-surface min-h-screen flex flex-col font-body">

            <main className="flex-grow flex items-center justify-center lg:p-12 relative overflow-hidden">

                <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary-fixed opacity-10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-surface-container opacity-50 -z-10 rounded-tl-[120px] pointer-events-none"></div>

                <div className="container max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:min-h-[800px] bg-surface-container-lowest lg:editorial-shadow lg:rounded-xl overflow-hidden">

                    <div
                        className="hidden lg:flex lg:w-5/12 p-16 flex-col justify-between relative"
                        style={{ background: "linear-gradient(135deg, #003466 0%, #1a4b84 100%)" }}
                    >
                        <div className="z-10">
                            <div className="font-headline text-3xl font-extrabold tracking-tight text-white mb-12">
                                Mentor Wise
                            </div>
                            <div className="mt-20">
                                <span className="inline-block px-3 py-1 bg-secondary-fixed text-on-secondary-container text-[10px] font-bold uppercase tracking-widest rounded-sm mb-6">
                                    Wisdom Shared
                                </span>
                                <h2 className="font-headline text-white text-5xl font-extrabold leading-tight tracking-tight">
                                    "The delicate balance of mentoring someone is not creating them in your own image, but giving them the opportunity to create themselves."
                                </h2>
                                <p className="text-on-primary-container mt-6 font-medium text-lg">— Steven Spielberg</p>
                            </div>
                        </div>

                        <div className="absolute bottom-0 right-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                            <img
                                className="w-full h-full object-cover"
                                alt="Historic university library"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5aZFtNyzu70XMIDlRxkGHVxcPZwlkI6rfYICDKvbawJUy2WOarATbuainrOmtALSZ9jS01zoJTr7xODYD59e3AqeNC8e3XY9dp5j0Igy16qDREv6oHznhNhTiteORHithj2xef_K7LSpcKdvOjZX9Ud6ytxOtbNS3HJQKAm99HE1VqpJCMpUhC3QAuASBuGaiVoqWI0NmlimNGtMJPwzsB-kCTcOHvGTWxGIxHtle0pGEImtkcADdrwBo4Bs9A081hfPMt9U6-pw"
                            />
                        </div>

                        <div className="z-10 flex items-center gap-4">
                            <div className="w-12 h-1 bg-secondary-fixed"></div>
                            <span className="text-white/60 text-sm tracking-wide font-medium">EST. 2026</span>
                        </div>
                    </div>

                    <div className="w-full lg:w-7/12 flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 bg-surface-container-lowest">

                        <div className="lg:hidden mb-12 text-center">
                            <span className="text-primary font-headline text-2xl font-extrabold tracking-tight">Mentor Wise</span>
                        </div>

                        <div className="w-full max-w-md">
                            <header className="mb-10 text-left">
                                <span className="text-on-surface-variant text-xs uppercase tracking-[0.2em] font-bold block mb-2">Academic Access</span>
                                <h1 className="font-headline text-on-surface text-4xl font-extrabold tracking-tight">Welcome Back</h1>
                                <p className="text-on-surface-variant mt-3 text-sm leading-relaxed">
                                    Sign in to continue your journey of growth and professional excellence within our scholarly community.
                                </p>
                            </header>

                            <div className="mb-6">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    theme="outline"
                                    size="large"
                                    text="continue_with"
                                    shape="rectangular"
                                    width="100%"
                                />
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-1 h-px bg-outline-variant/30"></div>
                                <span className="text-on-surface-variant/50 text-xs font-bold uppercase tracking-widest">or</span>
                                <div className="flex-1 h-px bg-outline-variant/30"></div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-2" htmlFor="email">
                                        University Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="e.g. academic@university.edu"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-surface-container-low border-none rounded-lg p-4 text-on-surface placeholder-outline/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-on-surface-variant text-xs font-bold uppercase tracking-widest" htmlFor="password">
                                            Password
                                        </label>
                                        <a className="text-primary text-xs font-bold hover:underline" href="/forgot-password">
                                            Forgot Password?
                                        </a>
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-surface-container-low border-none rounded-lg p-4 pr-12 text-on-surface placeholder-outline/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        required
                                    />
                                    <span
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-4 bottom-4 text-outline cursor-pointer hover:text-on-surface transition"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </span>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <input
                                        id="remember"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={() => setRememberMe(!rememberMe)}
                                        className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant/30 bg-surface-container-low"
                                    />
                                    <label className="text-sm text-on-surface-variant font-medium select-none cursor-pointer" htmlFor="remember">
                                        Remember this device for 30 days
                                    </label>
                                </div>

                                {error && <p className="text-error text-xs text-center">{error}</p>}
                                {success && <p className="text-green-600 text-xs text-center">{success}</p>}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full text-on-primary font-bold py-4 rounded-lg shadow-lg hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                                    style={{ background: "linear-gradient(135deg, #003466 0%, #1a4b84 100%)" }}
                                >
                                    {isLoading ? "Signing in..." : "Login"}
                                </button>
                            </form>

                            <div className="mt-12 text-center">
                                <p className="text-on-surface-variant text-sm">
                                    Don't have an account?
                                    <a className="text-primary font-bold ml-1 hover:underline" href="/signup">Sign Up</a>
                                </p>
                            </div>

                            <div className="mt-20 pt-8 border-t border-outline-variant/10 flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">
                                <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
                                <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <footer className="w-full mt-auto bg-surface-container">
                <div className="flex flex-col md:flex-row justify-between items-center px-8 py-10 max-w-7xl mx-auto w-full">
                    <div className="text-lg font-bold text-primary mb-4 md:mb-0">Mentor Wise</div>
                    <div className="text-sm text-on-surface/70 font-medium">© 2026 Mentor Wise. All rights reserved.</div>
                    <div className="hidden md:flex gap-8 mt-4 md:mt-0">
                        <a className="text-on-surface/70 text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors" href="#">Contact</a>
                        <a className="text-on-surface/70 text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors" href="#">Support</a>
                    </div>
                </div>
            </footer>

        </div>
    );
}
