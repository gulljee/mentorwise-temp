import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'password123';

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem('isAdminAuthenticated', 'true');
        navigate('/admin/dashboard');
      } else {
        setError('Invalid credentials. Please try again.');
        setLoading(false);
      }
    }, 600);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center font-body antialiased relative overflow-hidden px-6">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary-fixed opacity-10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-surface-container opacity-50 -z-10 rounded-tl-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-surface-container-lowest editorial-shadow rounded-xl p-8 md:p-12 z-10 relative">
        <header className="mb-8 md:mb-10 text-left">
            <span className="text-on-surface-variant text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold block mb-2">Core System Access</span>
            <h1 className="font-headline text-on-surface text-3xl md:text-4xl font-extrabold tracking-tight">Admin Portal</h1>
            <p className="text-on-surface-variant mt-3 text-sm leading-relaxed">
                Authentication required for administrative actions and system management.
            </p>
        </header>

        <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <label className="block text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-2" htmlFor="username">
                    Administrator ID
                </label>
                <input
                    id="username"
                    type="text"
                    name="username"
                    placeholder="Enter admin username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-lg p-4 text-on-surface placeholder-outline/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    required
                />
            </div>

            <div className="relative">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-on-surface-variant text-xs font-bold uppercase tracking-widest" htmlFor="password">
                        Password
                    </label>
                </div>
                <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

            {error && <p className="text-error text-xs text-center font-bold">{error}</p>}

            <button
                type="submit"
                disabled={loading}
                className="w-full text-on-primary font-bold py-4 rounded-lg shadow-lg hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #003466 0%, #1a4b84 100%)" }}
            >
                {loading ? "Authenticating..." : "Sign In to Dashboard"}
            </button>
        </form>

        <div className="mt-10 flex flex-col items-center gap-4 opacity-40">
          <div className="h-px w-20 bg-outline-variant"></div>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Mentor Wise Core</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
